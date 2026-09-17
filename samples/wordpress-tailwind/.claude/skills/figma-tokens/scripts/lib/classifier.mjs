/**
 * classifier.mjs — collection classifier / mapper.
 *
 * Consumes the normalised, collection-tagged leaves (from the loader) and produces
 * the named CSS blocks + the quarantine + a coverage entry for EVERY leaf. Colours
 * are emitted 1:1 as the EXACT hex from the JSON — no OKLCH, no var() resolution:
 * opaque → `#RRGGBB`, transparency → `#RRGGBBAA`. Encodes the session rules:
 *   - Figma-strict naming (warn not warning, no info, +new/recommended/success/…)
 *   - alpha overlays → `--ws-alpha-*`
 *   - Mode/custom → verbatim quarantine (`--ws-mc-*`, no utilities)
 *   - Theme scales → emit shadow/blur (black + alpha via rgb, exact alpha), verify the rest
 *   - Custom → responsive mobile-first base + md override
 *   - TailwindCSS → verify-only
 *
 * Pure apart from annotating each leaf's `consumed`/`entries` (the coverage trail),
 * which the caller reads back.
 */
import { px, pxToRem, round, slug, toCssColor } from './color.mjs';

/**
 * @param {ReturnType<import('./loader.mjs').loadExport>} files
 */
export function classify(files) {
  // Expected DTCG collections. A missing one degrades to an empty collection
  // (+ warning) instead of crashing, so a project can import a SUBSET of the full
  // Figma kit (e.g. no Theme/Custom/alpha yet). The emitted block is simply empty.
  const EXPECTED = ['tailwind', 'primitives', 'theme', 'mode-light', 'mode-dark', 'custom-mobile', 'custom-desktop'];
  const emptyCol = (c) => ({ collection: c, file: '(missing)', leaves: [], json: {}, consumed: new Set(), entries: [] });
  const byCol = (c) => files.find((f) => f.collection === c) || emptyCol(c);
  const mark = (file, key, dest) => {
    file.consumed.add(key);
    file.entries.push({ key, dest });
  };

  const out = {
    primitives: [], colorMap: [], semLight: [], semDark: [], alphaLight: [], alphaDark: [],
    shadowBlur: [], respBase: [], respMd: [], customLight: [], customDark: [],
  };
  const warnings = [];
  for (const c of EXPECTED) {
    if (!files.some((f) => f.collection === c)) warnings.push(`collection "${c}" absent from the DTCG export — its block(s) will be empty`);
  }

  // ── PRIMITIVES → `--color-<family>-<step>` (verbatim hex, 1:1 with the JSON) ──
  {
    const f = byCol('primitives');
    for (const l of f.leaves) {
      // path[0] is the collection root; family = every middle segment joined, so
      // `Brand/brand/blue/800` → brand-blue (never shadowing a built-in Tailwind hue)
      // and `Color Palette/Cyan/500` → cyan.
      const family = slug(l.path.slice(1, -1).join('-'));
      const step = l.path[l.path.length - 1].replace(/-base$/, '');
      const name = `--color-${family}-${step}`;
      out.primitives.push(`  ${name}: ${toCssColor(l.hex, l.alpha)};`);
      mark(f, l.key, name);
    }
  }

  // ── TAILWIND → verify-only (default scales provided by `@import "tailwindcss"`) ─
  {
    const f = byCol('tailwind');
    for (const l of f.leaves) mark(f, l.key, 'verify:tailwind-default');
  }

  // ── MODE: base (semantic) + alpha + custom (quarantine), per Light/Dark ───────
  const semanticNames = new Set();
  const alphaNames = new Set();
  for (const mode of ['light', 'dark']) {
    const f = byCol(`mode-${mode}`);
    const semArr = mode === 'light' ? out.semLight : out.semDark;
    const alArr = mode === 'light' ? out.alphaLight : out.alphaDark;
    const cuArr = mode === 'light' ? out.customLight : out.customDark;
    for (const l of f.leaves) {
      const grp = l.path[0];
      if (grp === 'base') {
        const name = l.path.slice(1).join('-');
        semanticNames.add(name);
        const value = toCssColor(l.hex, l.alpha);
        semArr.push(`  --${name}: ${value};`);
        mark(f, l.key, `--${name} = ${value}`);
      } else if (grp === 'alpha') {
        const n = l.path[1];
        alphaNames.add(n);
        alArr.push(`  --ws-alpha-${n}: ${toCssColor(l.hex, l.alpha)};`);
        mark(f, l.key, `--ws-alpha-${n}`);
      } else if (grp === 'custom') {
        const orig = l.path.slice(1).join('/');
        let sl = slug(orig);
        let varName = `--ws-mc-${sl}`;
        let i = 2;
        const seen = new Set(cuArr.map((x) => x.name));
        while (seen.has(varName)) varName = `--ws-mc-${sl}-${i++}`;
        let value, note;
        if (l.kind === 'alias') {
          const inner = l.alias.replace(/[{}]/g, '').split('.').pop();
          value = `var(--${inner})`;
          note = `alias ${l.alias}`;
        } else if (l.kind === 'color') {
          value = toCssColor(l.hex, l.alpha);
          note = `${l.hex}${l.alpha < 0.999 ? ' @' + round(l.alpha) : ''}`;
        } else {
          value = l.num != null ? String(l.num) : l.str;
          note = 'raw';
        }
        cuArr.push({ name: varName, value, orig, note });
        mark(f, l.key, `quarantine ${varName}`);
      }
      // unknown group → left unclassified (fails coverage)
    }
  }

  // ── THEME: shadows/blur (emit) + colors (skip dup) + scales (verify) ─────────
  {
    const f = byCol('theme');
    const T = f.json;
    const layerStr = (L, inset) => {
      const c = L.color.$value;
      const a = c.alpha !== undefined ? c.alpha : 1;
      const parts = [
        inset ? 'inset' : null,
        px(L['offset-x'].$value),
        px(L['offset-y'].$value),
        px(L['blur-radius'].$value),
        px(L['spread-radius'].$value),
        `rgb(0 0 0 / ${round(a)})`,
      ];
      return parts.filter((x) => x != null).join(' ');
    };
    const compose = (groupName, prefix, inset) => {
      const grp = T[groupName];
      if (!grp) return;
      for (const name of Object.keys(grp)) {
        if (name === '$extensions') continue;
        const node = grp[name];
        let layers;
        if ('offset-x' in node) layers = [node];
        else layers = Object.keys(node).filter((k) => k !== '$extensions').sort().map((k) => node[k]);
        out.shadowBlur.push(`  --${prefix}-${name}: ${layers.map((L) => layerStr(L, inset)).join(', ')};`);
      }
    };
    compose('shadow', 'shadow', false);
    compose('inset-shadow', 'inset-shadow', true);
    compose('drop-shadow', 'drop-shadow', false);
    if (T['blur']) {
      for (const name of Object.keys(T['blur'])) {
        if (name === '$extensions') continue;
        out.shadowBlur.push(`  --blur-${name}: ${px(T['blur'][name].$value)};`);
      }
    }

    for (const l of f.leaves) {
      const g = l.path[0];
      if (g === 'colors') mark(f, l.key, 'skipped:dup-of-Mode');
      else if (g === 'shadow' || g === 'inset-shadow' || g === 'drop-shadow' || g === 'blur') mark(f, l.key, `--${g}-*`);
      else if (g === 'radius') mark(f, l.key, 'verify:already-present(matches)');
      else mark(f, l.key, 'verify:tailwind-default'); // font, breakpoint, container, text, font-weight
    }
  }

  // ── CUSTOM: responsive --ws-* + typographic groups (mobile-first base + md override) ──
  // Typographic paths (heading-xl/font-size, text/xs/font-size, …) end in a
  // sub-property (font-size/line-height/font-weight/letter-spacing/font-family); the
  // group name is every PRECEDING segment joined by `-` (2-level `heading-xl/font-size`
  // → group `heading-xl`; 3-level `text/xs/font-size` → group `text-xs`), emitting
  // `--ws-<group>-<prop>`. Any other path is a single numeric token whose name is every
  // segment joined by `-`, collapsing a segment that repeats its predecessor as a prefix
  // (`spacing/spacing-xs` → `spacing-xs`, not `spacing-spacing-xs`) → `--ws-<name>`.
  const TYPO_PROPS = new Set(['font-family', 'font-size', 'line-height', 'font-weight', 'letter-spacing']);
  const processCustom = (mode) => {
    const f = byCol(`custom-${mode}`);
    const arr = mode === 'mobile' ? out.respBase : out.respMd;
    for (const l of f.leaves) {
      const prop = l.path[l.path.length - 1];
      if (l.path.length >= 2 && TYPO_PROPS.has(prop)) {
        const group = l.path.slice(0, -1).join('-');
        if (prop === 'font-family') {
          mark(f, l.key, 'baked into ws-* utility (constant)');
          continue;
        }
        let value;
        if (prop === 'font-size') value = pxToRem(l.num);
        else if (prop === 'line-height') value = pxToRem(l.num);
        else if (prop === 'font-weight') value = String(l.num);
        else if (prop === 'letter-spacing') {
          // Walk the same nested path (minus the leaf) to find the sibling font-size,
          // so it works whether the group is 2-level (heading-xl) or 3-level (text/xs).
          let node = f.json;
          for (const seg of l.path.slice(0, -1)) node = node[seg];
          const fs = node['font-size'].$value;
          value = `${Number((l.num / fs).toFixed(4))}em`;
        } else value = String(l.num);
        arr.push(`    --ws-${group}-${prop}: ${value};`);
        mark(f, l.key, `--ws-${group}-${prop}`);
      } else {
        const segs = l.path;
        const collapsed = segs.map((s, i) => (i > 0 && s.startsWith(segs[i - 1] + '-') ? s.slice(segs[i - 1].length + 1) : s));
        const name = `--ws-${collapsed.join('-')}`;
        arr.push(`    ${name}: ${pxToRem(l.num)};`);
        mark(f, l.key, name);
      }
    }
  };
  processCustom('mobile');
  processCustom('desktop');

  // ── @theme color-map (utility binding: semantic + alpha) ─────────────────────
  for (const n of [...semanticNames].sort()) out.colorMap.push(`  --color-${n}: var(--${n});`);
  for (const n of [...alphaNames].sort((a, b) => +a - +b)) out.colorMap.push(`  --color-ws-alpha-${n}: var(--ws-alpha-${n});`);

  // ── Assemble block strings ───────────────────────────────────────────────────
  const block = (lines) => lines.join('\n');
  const blocks = {
    'primitives': block(out.primitives),
    'color-map': block(out.colorMap),
    'shadow-blur': block(out.shadowBlur),
    'semantic-light': block(out.semLight),
    'semantic-dark': block(out.semDark),
    'alpha-light': block(out.alphaLight),
    'alpha-dark': block(out.alphaDark),
    'responsive-base': block(out.respBase),
    'responsive-md': block(out.respMd),
  };

  const quarantine = { light: out.customLight, dark: out.customDark };
  const quarantineCss = renderQuarantine(quarantine);

  // ── Coverage tally ───────────────────────────────────────────────────────────
  let totalLeaves = 0, totalClassified = 0;
  const unclassified = [];
  for (const f of files) {
    totalLeaves += f.leaves.length;
    for (const l of f.leaves) {
      if (f.consumed.has(l.key)) totalClassified++;
      else unclassified.push(`${f.collection}: ${l.key}`);
    }
  }

  return {
    blocks,
    quarantine,
    quarantineCss,
    files,
    warnings,
    unclassified,
    totalLeaves,
    totalClassified,
    counts: {
      primitives: out.primitives.length,
      semantics: out.semLight.length,
      alpha: out.alphaLight.length,
      shadowBlur: out.shadowBlur.length,
      custom: out.customLight.length,
    },
  };
}

/** Render the quarantine stylesheet (verbatim Mode/custom tokens, annotated). */
export function renderQuarantine({ light, dark }) {
  return `/* ════════════════════════════════════════════════════════════
   mode-custom-experimental.css — AUTO-GENERATED by the figma-tokens skill
   DO NOT EDIT BY HAND. DO NOT USE THESE TOKENS IN NEW CODE.

   Verbatim quarantine of the Figma collection "Mode → custom": ad-hoc working
   tokens (messy names, duplicates, typos) preserved for traceability only.
   Each var is annotated with its original Figma name. No @theme utilities.
   ════════════════════════════════════════════════════════════ */
:root {
${light.map((c) => `  ${c.name}: ${c.value}; /* Figma: custom/${c.orig} — ${c.note} */`).join('\n')}
}

.dark {
${dark.map((c) => `  ${c.name}: ${c.value}; /* Figma: custom/${c.orig} — ${c.note} */`).join('\n')}
}
`;
}
