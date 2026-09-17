#!/usr/bin/env node
/**
 * normalize-figma-measure.mjs — converts a raw `use_figma` node dump into the
 * stable `tokens/figma-components/<name>.json` schema consumed by
 * diff-figma-upstream.mjs.
 *
 * Usage:
 *   node normalize-figma-measure.mjs <rawFile> [--name <component>] [--out <path>]
 *
 * `rawFile` is a JSON array (or `{ nodes: [...] }`) of Figma node dumps, each
 * shaped roughly as `{ id, name, variantProperties, width, height,
 * padding:[t,r,b,l], itemSpacing, cornerRadius, strokeWeight, fills, strokes,
 * effects, boundVariables, text:{...}, children:[...] }`. Every field is
 * optional — missing data becomes `null` rather than failing the run.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';
import { figmaComponentsDir, sampleRootFromScript } from './lib/paths.mjs';

function parseArgs(argv) {
  const opts = { rawFile: undefined, name: undefined, out: undefined };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--name') opts.name = argv[++i];
    else if (arg === '--out') opts.out = argv[++i];
    else if (arg === '--help' || arg === '-h') opts.help = true;
    else if (!arg.startsWith('-') && !opts.rawFile) opts.rawFile = arg;
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return opts;
}

function printHelp() {
  console.log(`Usage: node normalize-figma-measure.mjs <rawFile> [--name <component>] [--out <path>]

Normalizes a raw use_figma node dump (JSON array, or { nodes: [...] }) into
tokens/figma-components/<name>.json: { component, exportedAt, variants: [...] },
de-duplicated by variantProperties. Missing fields become null.

Options:
  --name <component>  component name (default: <rawFile> basename with a
                       leading "raw-"/"figma-" prefix and extension stripped)
  --out <path>         output path (default: tokens/figma-components/<name>.json)
  --help                show this help
`);
}

function inferName(rawFile) {
  return basename(rawFile).replace(/\.[^.]+$/, '').replace(/^(raw-|figma-)/, '');
}

function normalizePadding(padding) {
  if (!Array.isArray(padding) || padding.length < 4) return null;
  const [top, right, bottom, left] = padding;
  return { top: top ?? null, right: right ?? null, bottom: bottom ?? null, left: left ?? null };
}

/** Recursively normalizes one raw Figma node into the stable variant schema (tolerant of missing fields). */
function normalizeNode(node) {
  return {
    props: node.variantProperties ?? {},
    node: node.id ?? null,
    box: { width: node.width ?? null, height: node.height ?? null },
    padding: normalizePadding(node.padding),
    gap: node.itemSpacing ?? null,
    radius: node.cornerRadius ?? null,
    strokeWeight: node.strokeWeight ?? null,
    fills: node.fills ?? null,
    text: node.text ?? null,
    bound: node.boundVariables ?? {},
    children: Array.isArray(node.children) ? node.children.map(normalizeNode) : null,
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
  if (opts.help || !opts.rawFile) {
    printHelp();
    process.exitCode = opts.help ? 0 : 1;
    return;
  }
  if (!existsSync(opts.rawFile)) {
    console.error(`Raw file not found: ${opts.rawFile}`);
    process.exitCode = 1;
    return;
  }

  const sampleRoot = sampleRootFromScript(import.meta.url);
  const component = opts.name ?? inferName(opts.rawFile);
  const raw = JSON.parse(readFileSync(opts.rawFile, 'utf8'));
  const nodes = Array.isArray(raw) ? raw : (raw.nodes ?? [raw]);

  const seen = new Set();
  const variants = [];
  for (const node of nodes) {
    const normalized = normalizeNode(node);
    const key = JSON.stringify(normalized.props);
    if (seen.has(key)) continue;
    seen.add(key);
    variants.push(normalized);
  }

  const output = { component, exportedAt: new Date().toISOString(), variants };
  const outFile = opts.out ?? join(figmaComponentsDir(sampleRoot), `${component}.json`);
  mkdirSync(dirname(outFile), { recursive: true });
  writeFileSync(outFile, JSON.stringify(output, null, 2) + '\n', 'utf8');

  console.log(`Normalized ${nodes.length} node(s) into ${variants.length} distinct variant(s).`);
  console.log(`  written: ${outFile}`);
}

main().catch((err) => {
  console.error(err.stack ?? String(err));
  process.exitCode = 1;
});
