/**
 * classes.mjs — regex/bracket-matching extraction of Tailwind class strings,
 * CVA variant maps, data-* usage, Radix vars/imports and lucide icons out of
 * upstream React/TSX source, plus the summary builder that ties it together.
 *
 * Deliberately not a TS/JS parser: every extractor is a tolerant heuristic
 * (string-literal scanning + bracket matching) good enough for shadcn/ui's
 * fairly uniform component style. False positives/negatives are expected on
 * unusual code and are resolved by hand or via upstream-exceptions.json.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { skillPaths } from './paths.mjs';
import { DEFAULT_STYLE, fetchRegistryItem } from './registry.mjs';

const UTILITY_ALLOWLIST = new Set([
  'flex',
  'grid',
  'block',
  'hidden',
  'relative',
  'absolute',
  'fixed',
  'sticky',
  'inline-flex',
]);

/** Lucide export names whose kebab-case icon slug is not a plain transform of the name. */
const LUCIDE_ICON_RENAMES = {
  MoreHorizontal: 'ellipsis',
  MoreVertical: 'ellipsis-vertical',
  Loader2: 'loader-circle',
};

/**
 * Scans `source` for string literals: `"..."`, `'...'`, and template literals
 * that contain no `${}` interpolation (interpolated templates are skipped
 * entirely, since their static text alone would be misleading). Comments are
 * skipped so commented-out code doesn't leak into results.
 * @param {string} source
 * @returns {Array<{ value: string, start: number, end: number, quote: string }>}
 */
export function extractStringLiterals(source) {
  const literals = [];
  const n = source.length;
  let i = 0;

  while (i < n) {
    const ch = source[i];

    if (ch === '/' && source[i + 1] === '/') {
      const end = source.indexOf('\n', i);
      i = end === -1 ? n : end + 1;
      continue;
    }
    if (ch === '/' && source[i + 1] === '*') {
      const end = source.indexOf('*/', i + 2);
      i = end === -1 ? n : end + 2;
      continue;
    }

    if (ch === '"' || ch === "'" || ch === '`') {
      const quote = ch;
      const start = i;
      let j = i + 1;
      let value = '';
      let hasInterpolation = false;
      let closed = false;

      while (j < n) {
        const c = source[j];
        if (c === '\\') {
          value += source[j + 1] ?? '';
          j += 2;
          continue;
        }
        if (quote === '`' && c === '$' && source[j + 1] === '{') {
          hasInterpolation = true;
          let depth = 1;
          j += 2;
          while (j < n && depth > 0) {
            if (source[j] === '{') depth++;
            else if (source[j] === '}') depth--;
            j++;
          }
          continue;
        }
        if (c === quote) {
          closed = true;
          j++;
          break;
        }
        value += c;
        j++;
      }

      if (closed && !(quote === '`' && hasInterpolation)) {
        literals.push({ value, start, end: j, quote });
      }
      i = j;
      continue;
    }

    i++;
  }

  return literals;
}

/**
 * Heuristic: a string literal "looks like" a Tailwind class list when it has
 * at least 2 whitespace-separated tokens and 60%+ of them either sit in a
 * small layout-keyword allowlist or contain a Tailwind-ish character
 * (`-`, `:`, `[`, `/`).
 * @param {string} value
 * @returns {boolean}
 */
export function isClassString(value) {
  const tokens = value.trim().split(/\s+/).filter(Boolean);
  if (tokens.length < 2) return false;
  const hits = tokens.filter((t) => UTILITY_ALLOWLIST.has(t) || /[-:[\]/]/.test(t)).length;
  return hits / tokens.length >= 0.6;
}

/** Finds top-level `function Name` and `const Name =` declarations, in source order. */
function findDeclarations(source) {
  const decls = [];
  const re = /(?:export\s+)?(?:default\s+)?function\s+([A-Za-z_$][\w$]*)|(?:export\s+)?const\s+([A-Za-z_$][\w$]*)\s*(?::[^=]+)?=/g;
  let m;
  while ((m = re.exec(source))) {
    const name = m[1] ?? m[2];
    if (name) decls.push({ name, index: m.index });
  }
  return decls;
}

/** Returns the name of the last declaration starting at or before `index`. */
function ownerAt(decls, index) {
  let owner = null;
  for (const d of decls) {
    if (d.index <= index) owner = d.name;
    else break;
  }
  return owner;
}

/**
 * Extracts every class-like string literal from `source`, tagged with the
 * enclosing function/const name when detectable.
 * @param {string} source
 * @returns {Array<{ owner: string|null, value: string }>}
 */
export function extractClassStrings(source) {
  const decls = findDeclarations(source);
  return extractStringLiterals(source)
    .filter((lit) => isClassString(lit.value))
    .map((lit) => ({ owner: ownerAt(decls, lit.start), value: lit.value }));
}

/** Matches the closing delimiter for an opening one at `openIndex`, skipping over string literals. */
function matchDelimiter(text, openIndex, open, close) {
  let depth = 0;
  let i = openIndex;
  const n = text.length;
  while (i < n) {
    const c = text[i];
    if (c === '"' || c === "'" || c === '`') {
      const quote = c;
      i++;
      while (i < n) {
        if (text[i] === '\\') {
          i += 2;
          continue;
        }
        if (text[i] === quote) {
          i++;
          break;
        }
        i++;
      }
      continue;
    }
    if (c === open) depth++;
    else if (c === close) {
      depth--;
      if (depth === 0) return i;
    }
    i++;
  }
  return -1;
}

/** Splits `text` on top-level commas, respecting nested `(){}[]` and string literals. */
function splitTopLevel(text) {
  const parts = [];
  let depth = 0;
  let current = '';
  let i = 0;
  const n = text.length;
  while (i < n) {
    const c = text[i];
    if (c === '"' || c === "'" || c === '`') {
      const quote = c;
      current += c;
      i++;
      while (i < n) {
        current += text[i];
        if (text[i] === '\\') {
          current += text[i + 1] ?? '';
          i += 2;
          continue;
        }
        if (text[i] === quote) {
          i++;
          break;
        }
        i++;
      }
      continue;
    }
    if ('{[('.includes(c)) depth++;
    else if ('}])'.includes(c)) depth--;
    if (c === ',' && depth === 0) {
      parts.push(current);
      current = '';
      i++;
      continue;
    }
    current += c;
    i++;
  }
  if (current.trim()) parts.push(current);
  return parts;
}

/** Splits a single `key: value` fragment; the key has surrounding quotes stripped. */
function parseEntry(part) {
  const idx = part.indexOf(':');
  if (idx === -1) return null;
  const rawKey = part.slice(0, idx).trim();
  const rawValue = part.slice(idx + 1).trim();
  const key = rawKey.replace(/^["'`]|["'`]$/g, '');
  return { key, rawValue };
}

/** Extracts the first string literal's value out of a raw value fragment, if any. */
function literalValueOf(rawValue) {
  const lit = extractStringLiterals(rawValue)[0];
  return lit ? lit.value : null;
}

/** Parses `{ key: "value", ... }` into a plain object of string values (non-string values are dropped). */
function parseStringMap(objectText) {
  const start = objectText.indexOf('{');
  if (start === -1) return {};
  const end = matchDelimiter(objectText, start, '{', '}');
  const inner = objectText.slice(start + 1, end === -1 ? undefined : end);
  const map = {};
  for (const entry of splitTopLevel(inner).map(parseEntry).filter(Boolean)) {
    const value = literalValueOf(entry.rawValue);
    if (value !== null) map[entry.key] = value;
  }
  return map;
}

/**
 * Tolerantly parses every `cva("base", { variants: {...}, defaultVariants: {...} })`
 * call in `source` — no TS parser, just bracket matching and top-level comma
 * splitting, which is enough for cva's fairly uniform shape.
 * @param {string} source
 * @returns {Array<{ owner: string|null, base: string|null, variants: Record<string, Record<string,string>>, defaultVariants: Record<string,string> }>}
 */
export function extractCvaBlocks(source) {
  const decls = findDeclarations(source);
  const blocks = [];
  const re = /\bcva\s*\(/g;
  let m;
  while ((m = re.exec(source))) {
    const parenStart = re.lastIndex - 1;
    const parenEnd = matchDelimiter(source, parenStart, '(', ')');
    if (parenEnd === -1) continue;
    re.lastIndex = parenEnd;

    const args = splitTopLevel(source.slice(parenStart + 1, parenEnd));
    const base = args[0] ? literalValueOf(args[0]) : null;

    const variants = {};
    let defaultVariants = {};
    const optionsArg = args[1];
    if (optionsArg) {
      const objStart = optionsArg.indexOf('{');
      if (objStart !== -1) {
        const objEnd = matchDelimiter(optionsArg, objStart, '{', '}');
        const inner = optionsArg.slice(objStart + 1, objEnd === -1 ? undefined : objEnd);
        for (const entry of splitTopLevel(inner).map(parseEntry).filter(Boolean)) {
          if (entry.key === 'variants') {
            const vStart = entry.rawValue.indexOf('{');
            const vEnd = matchDelimiter(entry.rawValue, vStart, '{', '}');
            const vInner = entry.rawValue.slice(vStart + 1, vEnd === -1 ? undefined : vEnd);
            for (const axis of splitTopLevel(vInner).map(parseEntry).filter(Boolean)) {
              variants[axis.key] = parseStringMap(axis.rawValue);
            }
          } else if (entry.key === 'defaultVariants') {
            defaultVariants = parseStringMap(entry.rawValue);
          }
        }
      }
    }

    blocks.push({ owner: ownerAt(decls, m.index), base, variants, defaultVariants });
  }
  return blocks;
}

/** @param {string} source @returns {string[]} distinct `data-slot="..."` values */
export function extractDataSlots(source) {
  const slots = new Set();
  const re = /data-slot=["']([^"']+)["']/g;
  let m;
  while ((m = re.exec(source))) slots.add(m[1]);
  return [...slots].sort();
}

/**
 * @param {string} source
 * @returns {string[]} distinct `data-[...]` arbitrary-variant selectors and bare `data-*` attribute names
 */
export function extractDataAttributes(source) {
  const found = new Set();
  const bracketRe = /data-\[[^\]]+\]/g;
  let m;
  while ((m = bracketRe.exec(source))) found.add(m[0]);
  const attrRe = /\bdata-[a-z][a-z0-9-]*(?=[=\s/>])/g;
  while ((m = attrRe.exec(source))) found.add(m[0]);
  return [...found].sort();
}

/** @param {string} source @returns {string[]} distinct `--radix-*` custom property names */
export function extractRadixVars(source) {
  const vars = new Set();
  const re = /--radix-[a-z0-9-]+/gi;
  let m;
  while ((m = re.exec(source))) vars.add(m[0]);
  return [...vars].sort();
}

/** Converts a PascalCase/camelCase identifier to kebab-case (e.g. "DropdownMenu" -> "dropdown-menu"). */
function toKebabCase(identifier) {
  return identifier
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
    .toLowerCase();
}

/** Converts a PascalCase lucide export name (with or without trailing "Icon") to its kebab-case slug. */
export function lucideIconSlug(importedName) {
  const base = importedName.replace(/Icon$/, '');
  if (LUCIDE_ICON_RENAMES[base]) return LUCIDE_ICON_RENAMES[base];
  return toKebabCase(base);
}

/** @param {string} source @returns {string[]} lucide-react import names found in `source` */
function extractLucideImportNames(source) {
  const names = [];
  const re = /import\s*\{([^}]+)\}\s*from\s*["']lucide-react["']/g;
  let m;
  while ((m = re.exec(source))) {
    for (const part of m[1].split(',')) {
      const name = part.trim().split(/\s+as\s+/)[0].trim();
      if (name) names.push(name);
    }
  }
  return names;
}

/** @param {string} source @returns {string[]} distinct kebab-case lucide icon slugs used in `source` */
export function extractLucideIcons(source) {
  return [...new Set(extractLucideImportNames(source).map(lucideIconSlug))].sort();
}

/** @param {string} source @returns {string[]} distinct Radix primitive names imported (kebab-case) */
export function extractRadixImports(source) {
  const names = new Set();
  const scopedRe = /from\s*["']@radix-ui\/react-([a-z0-9-]+)["']/g;
  let m;
  while ((m = scopedRe.exec(source))) names.add(m[1]);

  const unifiedRe = /import\s*\{([^}]+)\}\s*from\s*["']radix-ui["']/g;
  while ((m = unifiedRe.exec(source))) {
    for (const part of m[1].split(',')) {
      const name = part.trim().split(/\s+as\s+/)[0].trim();
      if (name) names.add(toKebabCase(name));
    }
  }
  return [...names].sort();
}

/**
 * Reduces one raw shadcn/ui registry item into the flat summary shape persisted
 * as `<name>.summary.json`, aggregating extraction results across every file.
 * @param {object} item - parsed registry item ({ name, dependencies, registryDependencies, files })
 * @param {{ style: string }} meta
 * @returns {object} the summary object
 */
export function summarizeRegistryItem(item, meta) {
  const files = Array.isArray(item.files) ? item.files : [];
  const slots = new Set();
  const classStrings = [];
  const cvaVariants = [];
  const dataAttributes = new Set();
  const radixVars = new Set();
  const lucideIcons = new Set();
  const radixImports = new Set();

  for (const file of files) {
    const content = file.content ?? '';
    extractDataSlots(content).forEach((s) => slots.add(s));
    classStrings.push(...extractClassStrings(content));
    cvaVariants.push(...extractCvaBlocks(content));
    extractDataAttributes(content).forEach((a) => dataAttributes.add(a));
    extractRadixVars(content).forEach((v) => radixVars.add(v));
    extractLucideIcons(content).forEach((i) => lucideIcons.add(i));
    extractRadixImports(content).forEach((p) => radixImports.add(p));
  }

  return {
    name: item.name,
    style: meta.style,
    dependencies: item.dependencies ?? [],
    registryDependencies: item.registryDependencies ?? [],
    files: files.map((f) => ({ path: f.path, kind: f.type ?? f.target ?? 'unknown' })),
    slots: [...slots].sort(),
    classStrings,
    cvaVariants,
    dataAttributes: [...dataAttributes].sort(),
    radixVars: [...radixVars].sort(),
    lucideIcons: [...lucideIcons].sort(),
    radixImports: [...radixImports].sort(),
  };
}

/**
 * Loads `<skillRoot>/upstream/<name>.summary.json` if present (and not
 * `refresh`), otherwise fetches the registry item and (re)builds it.
 * @param {string} sampleRoot
 * @param {string} name
 * @param {{ style?: string, refresh?: boolean }} [opts]
 * @returns {Promise<object>} the summary object
 */
export async function getUpstreamSummary(sampleRoot, name, opts = {}) {
  const style = opts.style ?? DEFAULT_STYLE;
  const { upstreamDir } = skillPaths(sampleRoot);
  const summaryFile = join(upstreamDir, `${name}.summary.json`);

  if (!opts.refresh && existsSync(summaryFile)) {
    return JSON.parse(readFileSync(summaryFile, 'utf8'));
  }

  const item = await fetchRegistryItem(sampleRoot, name, { style, refresh: opts.refresh });
  const summary = summarizeRegistryItem(item, { style });
  mkdirSync(upstreamDir, { recursive: true });
  writeFileSync(summaryFile, JSON.stringify(summary, null, 2), 'utf8');
  return summary;
}
