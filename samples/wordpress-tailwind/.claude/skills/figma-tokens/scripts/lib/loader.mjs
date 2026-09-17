/**
 * loader.mjs — thin wrapper: load + normalise the Figma DTCG export.
 *
 * Generalized copy of the area-broker `figma-tokens` skill
 * (area-broker/.claude/skills/figma-tokens/scripts/lib/loader.mjs), adapted to the
 * wsdev `wordpress-tailwind` sample layout (and any project scaffolded from it).
 *
 * Reads every `*.tokens.json` under the source folder, flattens each file to a
 * list of leaf tokens `{path, key, kind, hex, alpha, num, str, alias}`, and tags
 * each file with its collection. Also owns repo-root discovery, the default I/O
 * paths, and the config-driven collection-routing table.
 *
 * Kept deliberately thin: no token semantics live here (that's the classifier).
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';

/**
 * Config-driven routing: each rule matches a file path by the distinctive word(s)
 * it must contain, optionally narrowed by a regex. Order matters — first match
 * wins (folders carry numeric prefixes like "3. Mode", so we match on words, not
 * slash-segments). Adjusting how a collection is handled is a localised change here.
 */
export const DEFAULT_CONFIG = {
  mdBreakpoint: '48rem', // Tailwind `md`
  collections: [
    { name: 'tailwind', includes: ['TailwindCSS'] },
    { name: 'primitives', includes: ['Color Palette'] },
    { name: 'primitives', includes: ['Brand'] },
    { name: 'theme', includes: ['Theme'] },
    { name: 'mode-light', includes: ['Mode'], matches: 'Light\\.tokens' },
    { name: 'mode-dark', includes: ['Mode'], matches: 'Dark\\.tokens' },
    { name: 'custom-desktop', includes: ['Custom'], matches: 'Desktop\\.tokens' },
    { name: 'custom-desktop', includes: ['Responsive'], matches: 'Desktop\\.tokens' },
    { name: 'custom-mobile', includes: ['Custom'], matches: 'Mobile\\.tokens' },
    { name: 'custom-mobile', includes: ['Responsive'], matches: 'Mobile\\.tokens' },
  ],
};

/**
 * Walk up from `start` to the nearest directory that contains BOTH `package.json`
 * and `src/css/globals.css` — the marker of a wsdev-scaffolded project root (the
 * sample itself, or any project generated from it via `ws create`). Returns `null`
 * if no such directory is found (the caller decides the fallback).
 */
export function findRepoRoot(start) {
  let dir = start;
  for (;;) {
    if (existsSync(join(dir, 'package.json')) && existsSync(join(dir, 'src', 'css', 'globals.css'))) {
      return dir;
    }
    const parent = dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}

/** Default I/O paths relative to the repo root (wsdev sample layout). */
export function defaultPaths(repoRoot) {
  return {
    srcDir: resolve(repoRoot, 'tokens/figma-export'),
    globals: resolve(repoRoot, 'src/css/globals.css'),
    quarantine: resolve(repoRoot, 'src/css/mode-custom-experimental.css'),
    blocksPreview: resolve(repoRoot, 'tokens/audits/generated-blocks.css'),
    coverage: resolve(repoRoot, 'tokens/audits/token-coverage-report.md'),
  };
}

/** Recursively collect every `*.tokens.json` path under `dir`. */
export function walkFiles(dir) {
  const out = [];
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) out.push(...walkFiles(p));
    else if (e.endsWith('.tokens.json')) out.push(p);
  }
  return out;
}

/** Flatten a DTCG object into leaf tokens (mutates `out`). */
export function leaves(node, path, out) {
  if (node && typeof node === 'object' && '$value' in node) {
    const v = node.$value;
    let kind, hex = null, alpha = 1, num = null, str = null, alias = null;
    if (v && typeof v === 'object' && ('components' in v || 'hex' in v)) {
      kind = 'color';
      hex = v.hex;
      alpha = v.alpha !== undefined ? v.alpha : 1;
    } else if (typeof v === 'number') {
      kind = 'number';
      num = v;
    } else if (typeof v === 'string' && v.trim().startsWith('{')) {
      kind = 'alias';
      alias = v.trim();
    } else {
      kind = 'string';
      str = String(v);
    }
    out.push({ path: [...path], key: path.join('/'), kind, hex, alpha, num, str, alias });
    return;
  }
  if (node && typeof node === 'object') {
    for (const k of Object.keys(node)) {
      if (k === '$extensions' || k === '$type') continue;
      leaves(node[k], [...path, k], out);
    }
  }
}

/** Map a file path to its collection name per the config (or `'unknown'`). */
export function collectionOf(file, config = DEFAULT_CONFIG) {
  const p = file.replace(/\\/g, '/');
  for (const rule of config.collections) {
    if (!rule.includes.every((w) => p.includes(w))) continue;
    if (rule.matches && !new RegExp(rule.matches).test(p)) continue;
    return rule.name;
  }
  return 'unknown';
}

/**
 * Load + normalise the whole export.
 * @returns {Array<{file,abs,collection,json,leaves,consumed:Set,entries:Array}>}
 */
export function loadExport(srcDir, { repoRoot, config = DEFAULT_CONFIG } = {}) {
  const root = repoRoot || srcDir;
  return walkFiles(srcDir).map((abs) => {
    const json = JSON.parse(readFileSync(abs, 'utf8'));
    const lv = [];
    leaves(json, [], lv);
    return {
      file: relative(root, abs).replace(/\\/g, '/'),
      abs,
      collection: collectionOf(abs, config),
      json,
      leaves: lv,
      consumed: new Set(),
      entries: [],
    };
  });
}
