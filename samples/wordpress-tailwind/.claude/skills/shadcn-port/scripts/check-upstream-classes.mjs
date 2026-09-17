#!/usr/bin/env node
/**
 * check-upstream-classes.mjs — the porting gate: for each component, checks
 * that every upstream Tailwind class token (after adaptation rewrites and
 * approved exceptions) also appears in the ported Twig file.
 *
 * Usage:
 *   node check-upstream-classes.mjs [name...] [--style <style>] [--refresh] [--json]
 *
 * MISSING (an upstream token nowhere in the twig, unjustified) -> exit 1.
 * EXTRA (a twig token not traced to upstream) and missing data-slot values
 * are reported as warnings only.
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { getUpstreamSummary } from './lib/classes.mjs';
import { componentsBaseDir, componentPaths, sampleRootFromScript, skillPaths, upstreamExceptionsFile } from './lib/paths.mjs';
import { DEFAULT_STYLE } from './lib/registry.mjs';
import { extractTwigClassTokens, extractTwigDataSlots } from './lib/twig.mjs';

function parseArgs(argv) {
  const opts = { names: [], style: undefined, refresh: false, json: false };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--style') opts.style = argv[++i];
    else if (arg === '--refresh') opts.refresh = true;
    else if (arg === '--json') opts.json = true;
    else if (arg === '--help' || arg === '-h') opts.help = true;
    else if (!arg.startsWith('-')) opts.names.push(arg);
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return opts;
}

function printHelp() {
  console.log(`Usage: node check-upstream-classes.mjs [name...] [--style <style>] [--refresh] [--json]

Gates every named component (default: every directory under
src/templates/components/base/) by comparing its upstream Tailwind class
tokens against its Twig file, after applying:
  1. global rewrites from adaptation-rules.json (regex "from" -> "to")
  2. per-component exceptions from scripts/upstream-exceptions.json
     ("to": null drops the token; "from": "*" skips the whole component;
     "composition": true skips it too, without fetching upstream at all —
     for a component with no registry item to diff against)

Exit code is non-zero if any component has unjustified MISSING tokens, or a
named/default component has no <name>.twig file.

Options:
  --style <style>  registry style (default: $SHADCN_STYLE or "${DEFAULT_STYLE}")
  --refresh        bypass the on-disk registry cache and re-download
  --json           print the full report as JSON instead of a table
  --help           show this help
`);
}

/** @returns {Array<{from: RegExp, to: string}>} */
function loadAdaptationRules(sampleRoot) {
  const { adaptationRulesFile } = skillPaths(sampleRoot);
  if (!existsSync(adaptationRulesFile)) return [];
  const raw = JSON.parse(readFileSync(adaptationRulesFile, 'utf8'));
  return raw.map((r) => ({ from: new RegExp(r.from), to: r.to }));
}

/** @returns {Record<string, Array<{from: string, to: string|null, source: string, note?: string}>>} */
function loadExceptions(sampleRoot) {
  const file = upstreamExceptionsFile(sampleRoot);
  if (!existsSync(file)) return {};
  const raw = JSON.parse(readFileSync(file, 'utf8'));
  return raw.components ?? {};
}

function defaultComponentNames(sampleRoot) {
  const dir = componentsBaseDir(sampleRoot);
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter((entry) => statSync(join(dir, entry)).isDirectory());
}

/**
 * Applies the global adaptation rules then the per-component exceptions to
 * one upstream token.
 * @returns {{ dropped: boolean, value: string }}
 */
function rewriteToken(token, rules, componentExceptions) {
  const exact = componentExceptions.find((e) => e.from === token);
  if (exact) {
    return exact.to === null ? { dropped: true, value: token } : { dropped: false, value: exact.to };
  }
  let value = token;
  for (const rule of rules) {
    if (rule.from.test(value)) value = value.replace(rule.from, rule.to);
  }
  return { dropped: false, value };
}

/**
 * Builds the report for a single component.
 * @returns {Promise<object>}
 */
async function checkComponent(sampleRoot, name, opts, rules, exceptionsByComponent) {
  const componentExceptions = exceptionsByComponent[name] ?? [];
  const compositionEntry = componentExceptions.find((e) => e.composition === true);
  if (compositionEntry) {
    return { name, composition: true, note: compositionEntry.note ?? '(no note)', missing: [], extra: [], missingSlots: [] };
  }
  if (componentExceptions.some((e) => e.from === '*')) {
    const note = componentExceptions.find((e) => e.from === '*')?.note ?? '(no note)';
    return { name, skipped: true, note, missing: [], extra: [], missingSlots: [] };
  }

  const paths = componentPaths(sampleRoot, name);
  if (!existsSync(paths.twig)) {
    return { name, error: `twig file not found: ${paths.twig}`, missing: [], extra: [], missingSlots: [] };
  }

  const summary = await getUpstreamSummary(sampleRoot, name, { style: opts.style, refresh: opts.refresh });
  const upstreamTokens = new Set();
  for (const cs of summary.classStrings) {
    for (const t of cs.value.trim().split(/\s+/).filter(Boolean)) upstreamTokens.add(t);
  }

  const finalUpstream = new Set();
  for (const token of upstreamTokens) {
    const { dropped, value } = rewriteToken(token, rules, componentExceptions);
    if (!dropped) finalUpstream.add(value);
  }

  const twigSource = readFileSync(paths.twig, 'utf8');
  const twigTokens = extractTwigClassTokens(twigSource);
  const twigSlots = new Set(extractTwigDataSlots(twigSource));

  const missing = [...finalUpstream].filter((t) => !twigTokens.has(t)).sort();
  const extra = [...twigTokens].filter((t) => !finalUpstream.has(t)).sort();
  const missingSlots = summary.slots.filter((s) => !twigSlots.has(s));

  return { name, missing, extra, missingSlots };
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
  if (opts.help) {
    printHelp();
    return;
  }

  const sampleRoot = sampleRootFromScript(import.meta.url);
  const names = opts.names.length ? opts.names : defaultComponentNames(sampleRoot);
  if (!names.length) {
    console.error('No component names given and none found under src/templates/components/base/.');
    process.exitCode = 1;
    return;
  }

  const rules = loadAdaptationRules(sampleRoot);
  const exceptionsByComponent = loadExceptions(sampleRoot);

  const reports = [];
  for (const name of names) {
    reports.push(await checkComponent(sampleRoot, name, opts, rules, exceptionsByComponent));
  }

  const hasFailure = reports.some((r) => r.error || (!r.skipped && !r.composition && r.missing.length > 0));

  if (opts.json) {
    console.log(JSON.stringify({ ok: !hasFailure, components: reports }, null, 2));
    process.exitCode = hasFailure ? 1 : 0;
    return;
  }

  for (const r of reports) {
    if (r.error) {
      console.log(`✗ ${r.name}: ${r.error}`);
      continue;
    }
    if (r.composition) {
      console.log(`○ ${r.name}: composition — ${r.note}`);
      continue;
    }
    if (r.skipped) {
      console.log(`○ ${r.name}: skipped — ${r.note}`);
      continue;
    }
    const status = r.missing.length ? '✗' : '✓';
    console.log(`${status} ${r.name}: MISSING ${r.missing.length}, EXTRA ${r.extra.length}, missing data-slot ${r.missingSlots.length}`);
    if (r.missing.length) console.log(`    MISSING: ${r.missing.join(' ')}`);
    if (r.extra.length) console.log(`    EXTRA (warning): ${r.extra.join(' ')}`);
    if (r.missingSlots.length) console.log(`    missing data-slot (warning): ${r.missingSlots.join(', ')}`);
  }

  console.log(hasFailure ? '\ncheck:classes FAILED' : '\ncheck:classes OK');
  process.exitCode = hasFailure ? 1 : 0;
}

main().catch((err) => {
  console.error(err.stack ?? String(err));
  process.exitCode = 1;
});
