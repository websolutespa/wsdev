#!/usr/bin/env node
/**
 * reverse-tokens.mjs
 *
 * The inverse of the `figma-tokens` skill: reads the CURRENT
 * `src/css/globals.css` (+ `mode-custom-experimental.css`)
 * marker blocks and reconstructs the 7-collection DTCG export under
 * `tokens/figma-export/`, EXACTLY as the importer's loader/classifier expect — so
 * re-running `import-tokens.mjs` against the output regenerates the same CSS
 * (lossless identity round-trip), modulo the primitives block re-sorting numeric
 * steps ascending within each family (same tokens, same hex).
 *
 * Why it exists: the importer is all-or-nothing (it rewrites every marker block
 * from the DTCG). To land a re-skin through it we need a complete, faithful DTCG
 * source — which the repo doesn't keep. This script regenerates that source from
 * the code that is the current source of truth, then optionally applies a small,
 * explicit set of brand DELTAS (--with-deltas) for a re-skin.
 *
 * NON-DESTRUCTIVE: only ever WRITES under `tokens/figma-export/`. Never touches
 * globals.css. The actual token landing stays the importer's `--apply` job, gated.
 *
 * Usage:
 *   node .claude/skills/figma-tokens/scripts/reverse.mjs               # identity export (no deltas)
 *   node .claude/skills/figma-tokens/scripts/reverse.mjs --with-deltas # apply RESKIN_DELTAS (empty by default)
 *   ... [--out DIR] [--globals FILE] [--quarantine FILE]               # defaults: tokens/figma-export, src/css/*
 */
import { mkdirSync, readFileSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defaultPaths, findRepoRoot } from './lib/loader.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
// Same repo-root discovery + sample-root fallback as import-tokens.mjs (see there for
// the rationale): a project scaffolded from this sample may not have `src/css/globals.css`
// yet (e.g. this skill runs before the rest of the skeleton exists), so a miss must not throw.
const REPO_ROOT = findRepoRoot(HERE) || resolve(HERE, '../../../..');
const DFT = defaultPaths(REPO_ROOT);

const argv = process.argv.slice(2);
const WITH_DELTAS = argv.includes('--with-deltas');
const argVal = (name) => {
  const i = argv.indexOf(`--${name}`);
  return i !== -1 && argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : null;
};
const GLOBALS = argVal('globals') ? resolve(argVal('globals')) : DFT.globals;
const QUARANTINE = argVal('quarantine') ? resolve(argVal('quarantine')) : DFT.quarantine;
const OUT_DIR = argVal('out') ? resolve(argVal('out')) : DFT.srcDir;

// ════════════════════════════════════════════════════════════════════════════
// Brand re-skin DELTAS — applied ONLY with --with-deltas. EMPTY by design so the
// identity round-trip proves losslessness before any brand change. Populate for a
// re-skin:  light/dark: { '<token>': '#RRGGBB'|'#RRGGBBAA', ... };
//           primitivesAdd: { '<family>': { '<step>': '#hex', ... } }.
// ════════════════════════════════════════════════════════════════════════════
const RESKIN_DELTAS = {
  light: {},
  dark: {},
  primitivesAdd: {},
};

// ── Value helpers (mirror the importer's color.mjs, inverted) ─────────────────
const round = (n) => Number(n.toFixed(3));

/** Parse "#RRGGBB" or "#RRGGBBAA" → { hex: "#RRGGBB", alpha: 0..1 }. */
function parseHex(s) {
  const v = s.trim().toUpperCase();
  if (/^#[0-9A-F]{8}$/.test(v)) return { hex: v.slice(0, 7), alpha: parseInt(v.slice(7), 16) / 255 };
  if (/^#[0-9A-F]{6}$/.test(v)) return { hex: v, alpha: 1 };
  return null;
}

/** sRGB hex → DTCG components {r,g,b} normalised 0..1 (4 decimals). */
function components(hex) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return { r: round4(r), g: round4(g), b: round4(b) };
}
const round4 = (n) => Number(n.toFixed(4));

/** DTCG color leaf from a CSS hex string (+ optional original alpha override). */
function colorLeaf(cssHex, alphaOverride) {
  const p = parseHex(cssHex);
  if (!p) throw new Error(`not a hex colour: ${cssHex}`);
  const alpha = alphaOverride !== undefined ? alphaOverride : p.alpha;
  return { $type: 'color', $value: { components: components(p.hex), hex: p.hex, alpha } };
}

const remToPx = (s) => {
  const m = /^(-?\d*\.?\d+)rem$/.exec(s.trim());
  if (!m) throw new Error(`not a rem value: ${s}`);
  return round(parseFloat(m[1]) * 16);
};
const emToPx = (s, fontSizePx) => {
  const m = /^(-?\d*\.?\d+)em$/.exec(s.trim());
  if (!m) throw new Error(`not an em value: ${s}`);
  return round(parseFloat(m[1]) * fontSizePx);
};
const pxNum = (s) => {
  const t = s.trim();
  if (t === '0') return 0;
  const m = /^(-?\d*\.?\d+)px$/.exec(t);
  if (!m) throw new Error(`not a px value: ${t}`);
  return round(parseFloat(m[1]));
};

// ── globals.css parsing ───────────────────────────────────────────────────────
const css = readFileSync(GLOBALS, 'utf8');
const quarantineCss = existsSync(QUARANTINE) ? readFileSync(QUARANTINE, 'utf8') : '';

/**
 * Body text between `figma:<name> START` and `<<< figma:<name> END`.
 * An absent marker degrades to an empty body (+ warning) instead of throwing, so a
 * globals.css that carries only a SUBSET of the 9 blocks still reverses cleanly.
 */
function blockBody(source, name) {
  const start = `/* >>> figma:${name} START >>> */`;
  const end = `/* <<< figma:${name} END <<< */`;
  const si = source.indexOf(start);
  const ei = source.indexOf(end);
  if (si === -1 || ei === -1) { console.warn(`[reverse] marker figma:${name} absent — treating as empty`); return ''; }
  return source.slice(si + start.length, ei);
}

/** Ordered `[name, value]` pairs for every `--name: value;` decl in a body. */
function decls(body) {
  const out = [];
  const re = /--([\w-]+):\s*([^;]+);/g;
  let m;
  while ((m = re.exec(body)) !== null) out.push([m[1].trim(), m[2].trim()]);
  return out;
}

// ── 1. PRIMITIVES → "Color Palette" collection ────────────────────────────────
// `--color-<family>-<step>` ; family may contain hyphens, step is the numeric tail.
function buildPrimitives(deltas) {
  const tree = {};
  for (const [name, value] of decls(blockBody(css, 'primitives'))) {
    const m = /^color-(.+)-([a-z0-9]+)$/i.exec(name);
    if (!m) throw new Error(`unexpected primitive: --${name}`);
    const family = m[1];
    const step = m[2];
    (tree[family] ||= {})[step] = colorLeaf(value);
  }
  // brand additions for the re-skin (e.g. emerald / navy families)
  if (deltas?.primitivesAdd) {
    for (const [family, steps] of Object.entries(deltas.primitivesAdd)) {
      for (const [step, hex] of Object.entries(steps)) (tree[family] ||= {})[step] = colorLeaf(hex);
    }
  }
  return { 'Color Palette': tree };
}

// ── 2/3. MODE (Light/Dark) → base + alpha + custom ────────────────────────────
function buildMode(mode, deltas) {
  const semBlock = mode === 'light' ? 'semantic-light' : 'semantic-dark';
  const alphaBlock = mode === 'light' ? 'alpha-light' : 'alpha-dark';
  const quarSelector = mode === 'light' ? ':root' : '.dark';

  const base = {};
  const override = deltas?.[mode] || {};
  for (const [name, value] of decls(blockBody(css, semBlock))) {
    const v = override[name] !== undefined ? override[name] : value;
    base[name] = colorLeaf(v);
  }
  // delta tokens that don't exist yet in the current set get appended
  for (const [name, hex] of Object.entries(override)) {
    if (!(name in base)) base[name] = colorLeaf(hex);
  }

  const alpha = {};
  for (const [name, value] of decls(blockBody(css, alphaBlock))) {
    const n = /^ws-alpha-(\d+)$/.exec(name);
    if (!n) throw new Error(`unexpected alpha: --${name}`);
    alpha[n[1]] = colorLeaf(value);
  }

  const custom = buildQuarantineGroup(quarSelector);

  return { base, alpha, custom };
}

/** Reconstruct the Mode/custom group from mode-custom-experimental.css comments. */
function buildQuarantineGroup(selector) {
  if (!quarantineCss) return {};
  // isolate the selector's block body
  const re = new RegExp(`${selector.replace('.', '\\.')}\\s*\\{([\\s\\S]*?)\\n\\}`, 'm');
  const m = re.exec(quarantineCss);
  if (!m) return {};
  const body = m[1];
  const out = {};
  // each line: --ws-mc-...: VALUE; /* Figma: custom/ORIG — NOTE */
  const lineRe = /--[\w-]+:\s*([^;]+);\s*\/\*\s*Figma:\s*custom\/(.+?)\s+—\s+(.+?)\s*\*\//g;
  let l;
  while ((l = lineRe.exec(body)) !== null) {
    const value = l[1].trim();
    const orig = l[2];
    const note = l[3].trim();
    let leaf;
    if (note.startsWith('alias ')) {
      leaf = { $value: note.slice('alias '.length).trim() }; // e.g. "{base.background}"
    } else if (value.startsWith('#')) {
      // hex + alpha from the VALUE (the canonical CSS byte). The comment's note-alpha
      // (3-dec) is preferred ONLY when it reproduces the same 8-bit byte — otherwise
      // the note and value disagree under the importer's own rounding (e.g. note @0.7
      // → byte B3, but the stored byte is B2). The emitted CSS byte must win.
      const p = parseHex(value);
      const am = /@\s*([\d.]+)/.exec(note);
      let alpha = p.alpha;
      if (am) {
        const na = Number(am[1]);
        if (Math.round(na * 255) === Math.round(p.alpha * 255)) alpha = na;
      }
      leaf = { $type: 'color', $value: { components: components(p.hex), hex: p.hex, alpha } };
    } else if (/^-?\d*\.?\d+$/.test(value)) {
      leaf = { $value: Number(value) };
    } else {
      leaf = { $value: value };
    }
    out[orig] = leaf;
  }
  return out;
}

// ── 4. THEME → shadow / inset-shadow / drop-shadow / blur ─────────────────────
function buildTheme() {
  const body = blockBody(css, 'shadow-blur');
  const groups = { shadow: {}, 'inset-shadow': {}, 'drop-shadow': {}, blur: {} };
  for (const [name, value] of decls(body)) {
    if (name.startsWith('blur-')) {
      groups.blur[name.slice('blur-'.length)] = { $value: pxNum(value) };
      continue;
    }
    let prefix, key;
    if (name.startsWith('inset-shadow-')) { prefix = 'inset-shadow'; key = name.slice('inset-shadow-'.length); }
    else if (name.startsWith('drop-shadow-')) { prefix = 'drop-shadow'; key = name.slice('drop-shadow-'.length); }
    else if (name.startsWith('shadow-')) { prefix = 'shadow'; key = name.slice('shadow-'.length); }
    else throw new Error(`unexpected theme decl: --${name}`);
    const layers = splitLayers(value).map((s) => parseShadowLayer(s));
    groups[prefix][key] = layers.length === 1 ? layers[0] : Object.fromEntries(layers.map((L, i) => [String(i), L]));
  }
  return groups;
}

/** Split a multi-layer shadow value on top-level commas (none appear inside rgb()). */
function splitLayers(value) {
  const parts = [];
  let depth = 0, cur = '';
  for (const ch of value) {
    if (ch === '(') depth++;
    if (ch === ')') depth--;
    if (ch === ',' && depth === 0) { parts.push(cur.trim()); cur = ''; }
    else cur += ch;
  }
  if (cur.trim()) parts.push(cur.trim());
  return parts;
}

/** "0 1px 3px 0 rgb(0 0 0 / 0.1)" (opt. leading "inset") → DTCG shadow layer. */
function parseShadowLayer(s) {
  let str = s.trim();
  if (str.startsWith('inset ')) str = str.slice('inset '.length).trim(); // inset is implied by group
  const cm = /rgb\(\s*0\s+0\s+0\s*\/\s*([\d.]+)\s*\)/.exec(str);
  const alpha = cm ? Number(cm[1]) : 1;
  const nums = str.replace(/rgb\([^)]*\)/, '').trim().split(/\s+/);
  const [ox, oy, blur, spread] = nums.map(pxNum);
  return {
    color: { $value: { components: { r: 0, g: 0, b: 0 }, hex: '#000000', alpha } },
    'offset-x': { $value: ox },
    'offset-y': { $value: oy },
    'blur-radius': { $value: blur },
    'spread-radius': { $value: spread },
  };
}

// ── 5. CUSTOM (Mobile/Desktop) → responsive --ws-* + heading-* ────────────────
function buildCustom(mode) {
  const block = mode === 'mobile' ? 'responsive-base' : 'responsive-md';
  const tree = {};
  // first pass: capture heading font-sizes (needed to convert letter-spacing em→px)
  const fontSizePx = {};
  for (const [name, value] of decls(blockBody(css, block))) {
    const h = /^ws-heading-([\w]+)-font-size$/.exec(name);
    if (h) fontSizePx[h[1]] = remToPx(value);
  }
  for (const [name, value] of decls(blockBody(css, block))) {
    const h = /^ws-heading-([\w]+)-(font-size|line-height|font-weight|letter-spacing)$/.exec(name);
    if (h) {
      const size = h[1], prop = h[2];
      const node = (tree[`heading-${size}`] ||= {});
      if (prop === 'font-size' || prop === 'line-height') node[prop] = { $value: remToPx(value) };
      else if (prop === 'font-weight') node[prop] = { $value: Number(value) };
      else if (prop === 'letter-spacing') node[prop] = { $value: emToPx(value, fontSizePx[size]) };
      continue;
    }
    const g = /^ws-(.+)$/.exec(name);
    if (!g) throw new Error(`unexpected custom decl: --${name}`);
    tree[g[1]] = { $value: remToPx(value) };
  }
  return tree;
}

// ── Assemble + write the 7 DTCG files ─────────────────────────────────────────
const deltas = WITH_DELTAS ? RESKIN_DELTAS : null;

const files = {
  '1. TailwindCSS/TailwindCSS.tokens.json': { 'tailwind colors': {} },
  '2. Color Palette/Color Palette.tokens.json': buildPrimitives(deltas),
  '3. Mode/Light.tokens.json': buildMode('light', deltas),
  '3. Mode/Dark.tokens.json': buildMode('dark', deltas),
  '4. Theme/Theme.tokens.json': buildTheme(),
  '5. Custom/Mobile.tokens.json': buildCustom('mobile'),
  '5. Custom/Desktop.tokens.json': buildCustom('desktop'),
};

// fresh output dir
if (existsSync(OUT_DIR)) rmSync(OUT_DIR, { recursive: true, force: true });
for (const [rel, json] of Object.entries(files)) {
  const abs = join(OUT_DIR, rel);
  mkdirSync(dirname(abs), { recursive: true });
  writeFileSync(abs, JSON.stringify(json, null, 2) + '\n', 'utf8');
}

const relOut = OUT_DIR.replace(REPO_ROOT + '\\', '').replace(REPO_ROOT + '/', '');
console.log(`[reverse-tokens] wrote ${Object.keys(files).length} DTCG files → ${relOut}${WITH_DELTAS ? '  (DIR_C deltas applied)' : '  (identity, no deltas)'}`);
