#!/usr/bin/env node
/**
 * diff-figma-upstream.mjs — proposes Tailwind utility overrides for a "kit
 * component" by comparing its default upstream classes against its measured
 * Figma geometry. Never writes upstream-exceptions.json itself: the
 * orchestrator reviews the proposal and copies approved entries by hand.
 *
 * Usage:
 *   node diff-figma-upstream.mjs <name> [--style <style>] [--json]
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { getUpstreamSummary } from './lib/classes.mjs';
import { figmaComponentsDir, sampleRootFromScript } from './lib/paths.mjs';

/** Tailwind's default spacing scale exceptions (rem steps not on the 0.25rem/4px grid); everything else is n*4px. */
const SPACING_FRACTIONS_PX = { 0.5: 2, 1.5: 6, 2.5: 10, 3.5: 14 };

/** Figma px -> kit radius utility, per the kit's radius scale (docs/adr/0003 §radius). */
const RADIUS_PX_TO_UTILITY = [
  [2, 'rounded-xs'],
  [6, 'rounded-sm'],
  [8, 'rounded-md'],
  [10, 'rounded-lg'],
  [14, 'rounded-xl'],
  [18, 'rounded-2xl'],
  [22, 'rounded-3xl'],
  [26, 'rounded-4xl'],
  [9999, 'rounded-full'],
];

/** Tailwind text-size utility -> { fontSize, lineHeight } in px, per this kit's type scale. */
const TEXT_SIZE_PX = {
  xs: { fontSize: 12, lineHeight: 16 },
  sm: { fontSize: 14, lineHeight: 20 },
  base: { fontSize: 16, lineHeight: 24 },
  lg: { fontSize: 18, lineHeight: 28 },
  xl: { fontSize: 20, lineHeight: 28 },
  '2xl': { fontSize: 24, lineHeight: 32 },
};

function parseArgs(argv) {
  const opts = { name: undefined, style: undefined, json: false };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--style') opts.style = argv[++i];
    else if (arg === '--json') opts.json = true;
    else if (arg === '--help' || arg === '-h') opts.help = true;
    else if (!arg.startsWith('-') && !opts.name) opts.name = arg;
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return opts;
}

function printHelp() {
  console.log(`Usage: node diff-figma-upstream.mjs <name> [--style <style>] [--json]

Compares the default upstream Tailwind classes for <name> against
tokens/figma-components/<name>.json (produced by normalize-figma-measure.mjs)
and proposes utility overrides (height, padding, gap, radius, font-size /
line-height). Prints a proposal { component, overrides: [{from, to, reason,
node}] }; it never writes upstream-exceptions.json itself.

Options:
  --style <style>  registry style
  --json           print only the JSON proposal
  --help           show this help
`);
}

/** Tailwind spacing-scale numeric suffix -> px (0.25rem steps, with the kit's fractional exceptions). */
function spacingToPx(n) {
  if (n in SPACING_FRACTIONS_PX) return SPACING_FRACTIONS_PX[n];
  return n * 4;
}

/** px -> the closest Tailwind spacing-scale numeric suffix (searches 0..96 plus the fractional exceptions). */
function pxToSpacing(px) {
  let best = 0;
  let bestDiff = Infinity;
  const candidates = [...Object.keys(SPACING_FRACTIONS_PX).map(Number), ...Array.from({ length: 97 }, (_, n) => n)];
  for (const n of candidates) {
    const diff = Math.abs(spacingToPx(n) - px);
    if (diff < bestDiff) {
      bestDiff = diff;
      best = n;
    }
  }
  return best;
}

/** Figma corner radius px -> nearest kit radius utility. */
function pxToRadiusUtility(px) {
  let best = RADIUS_PX_TO_UTILITY[0];
  let bestDiff = Infinity;
  for (const entry of RADIUS_PX_TO_UTILITY) {
    const diff = Math.abs(entry[0] - px);
    if (diff < bestDiff) {
      bestDiff = diff;
      best = entry;
    }
  }
  return best[1];
}

/** Figma font size px -> nearest Tailwind text-<size> key, or null if no text data. */
function pxToTextSizeKey(fontSizePx) {
  let best = null;
  let bestDiff = Infinity;
  for (const [key, { fontSize }] of Object.entries(TEXT_SIZE_PX)) {
    const diff = Math.abs(fontSize - fontSizePx);
    if (diff < bestDiff) {
      bestDiff = diff;
      best = key;
    }
  }
  return best;
}

/** Concatenates the base class plus each axis's default-variant classes, so single-utility regexes can scan it. */
function combinedDefaultClasses(summary) {
  const parts = summary.classStrings.map((c) => c.value);
  for (const cva of summary.cvaVariants) {
    if (cva.base) parts.push(cva.base);
    for (const [axis, values] of Object.entries(cva.variants ?? {})) {
      const def = cva.defaultVariants?.[axis];
      if (def && values[def]) parts.push(values[def]);
    }
  }
  return parts.join(' ');
}

/** Picks the Figma variant that looks like "default" (all variant props matching /default/i), else the first one. */
function pickDefaultVariant(figmaFile) {
  if (!figmaFile?.variants?.length) return null;
  const isDefaultish = (v) => Object.values(v.props ?? {}).every((val) => /default/i.test(String(val)));
  return figmaFile.variants.find(isDefaultish) ?? figmaFile.variants[0];
}

function firstMatch(classes, re) {
  const m = classes.match(re);
  return m ? m[1] : null;
}

/**
 * Compares one measured dimension (in px) against the currently-applied
 * utility's implied px value and, if they disagree beyond `tolerance`,
 * returns an override proposal.
 */
function proposeSpacingOverride({ classes, prefix, measuredPx, node, label, tolerance = 1 }) {
  if (measuredPx === null || measuredPx === undefined) return null;
  const current = firstMatch(classes, new RegExp(`\\b${prefix}-(\\d+(?:\\.\\d+)?)\\b`));
  const currentPx = current !== null ? spacingToPx(Number(current)) : null;
  if (currentPx !== null && Math.abs(currentPx - measuredPx) <= tolerance) return null;
  const proposedSuffix = pxToSpacing(measuredPx);
  const to = `${prefix}-${proposedSuffix}`;
  const from = current !== null ? `${prefix}-${current}` : `(no ${prefix}-* utility found)`;
  if (from === to) return null;
  return { from, to, reason: `Figma ${label} = ${measuredPx}px vs upstream ${currentPx ?? 'unset'}px`, node };
}

function proposeRadiusOverride({ classes, measuredPx, node }) {
  if (measuredPx === null || measuredPx === undefined) return null;
  const current = firstMatch(classes, /\brounded(-[a-z0-9]+)?\b/) ?? null;
  const currentUtility = current !== null ? `rounded${current ?? ''}` : null;
  const proposedUtility = pxToRadiusUtility(measuredPx);
  if (currentUtility === proposedUtility) return null;
  return {
    from: currentUtility ?? '(no rounded-* utility found)',
    to: proposedUtility,
    reason: `Figma corner radius = ${measuredPx}px`,
    node,
  };
}

function proposeTextOverride({ classes, fontSizePx, node }) {
  if (!fontSizePx) return null;
  const current = firstMatch(classes, /\btext-(xs|sm|base|lg|xl|2xl|3xl)\b/);
  const proposedKey = pxToTextSizeKey(fontSizePx);
  if (!proposedKey || current === proposedKey) return null;
  return {
    from: current ? `text-${current}` : '(no text-* size utility found)',
    to: `text-${proposedKey}`,
    reason: `Figma font-size = ${fontSizePx}px (maps to text-${proposedKey} = ${TEXT_SIZE_PX[proposedKey].fontSize}/${TEXT_SIZE_PX[proposedKey].lineHeight})`,
    node,
  };
}

async function main() {
  let opts;
  try {
    opts = parseArgs(process.argv.slice(2));
  } catch (err) {
    console.error(err.message);
    process.exitCode = 1;
    return;
  }
  if (opts.help || !opts.name) {
    printHelp();
    process.exitCode = opts.help ? 0 : 1;
    return;
  }

  const sampleRoot = sampleRootFromScript(import.meta.url);
  const figmaFile = join(figmaComponentsDir(sampleRoot), `${opts.name}.json`);
  if (!existsSync(figmaFile)) {
    console.error(`Not a kit component (or not yet exported): ${figmaFile} does not exist.`);
    console.error('Run normalize-figma-measure.mjs first, or skip this step for upstream-only components.');
    process.exitCode = 1;
    return;
  }

  const summary = await getUpstreamSummary(sampleRoot, opts.name, { style: opts.style });
  const figma = JSON.parse(readFileSync(figmaFile, 'utf8'));
  const variant = pickDefaultVariant(figma);
  if (!variant) {
    console.error(`${figmaFile} has no variants.`);
    process.exitCode = 1;
    return;
  }

  const classes = combinedDefaultClasses(summary);
  const node = variant.node;
  const overrides = [
    proposeSpacingOverride({ classes, prefix: 'h', measuredPx: variant.box?.height, node, label: 'height' }),
    proposeSpacingOverride({ classes, prefix: 'px', measuredPx: variant.padding?.left, node, label: 'padding-x' }),
    proposeSpacingOverride({ classes, prefix: 'py', measuredPx: variant.padding?.top, node, label: 'padding-y' }),
    proposeSpacingOverride({ classes, prefix: 'gap', measuredPx: variant.gap, node, label: 'gap' }),
    proposeRadiusOverride({ classes, measuredPx: variant.radius, node }),
    proposeTextOverride({ classes, fontSizePx: variant.text?.fontSize, node }),
  ].filter(Boolean);

  const proposal = { component: opts.name, overrides };

  if (opts.json) {
    console.log(JSON.stringify(proposal, null, 2));
    return;
  }

  console.log(`${opts.name}: ${overrides.length} proposed override(s) (default variant, node ${node ?? '(unknown)'})`);
  for (const o of overrides) {
    console.log(`  ${o.from}  ->  ${o.to}   (${o.reason})`);
  }
  if (!overrides.length) console.log('  (upstream already matches the Figma measurements within tolerance)');
  console.log('\nThis is a proposal only — review and copy approved entries into scripts/upstream-exceptions.json.');
}

main().catch((err) => {
  console.error(err.stack ?? String(err));
  process.exitCode = 1;
});
