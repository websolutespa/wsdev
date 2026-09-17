#!/usr/bin/env node
/**
 * fetch-upstream.mjs — downloads/caches one registry item and writes its
 * extracted summary to `.claude/skills/shadcn-port/upstream/<name>.summary.json`.
 *
 * Usage:
 *   node fetch-upstream.mjs <name> [--style <style>] [--refresh] [--json]
 */
import { getUpstreamSummary } from './lib/classes.mjs';
import { sampleRootFromScript, skillPaths } from './lib/paths.mjs';
import { DEFAULT_STYLE } from './lib/registry.mjs';

function parseArgs(argv) {
  const opts = { refresh: false, json: false, style: undefined, name: undefined };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--style') opts.style = argv[++i];
    else if (arg === '--refresh') opts.refresh = true;
    else if (arg === '--json') opts.json = true;
    else if (arg === '--help' || arg === '-h') opts.help = true;
    else if (!arg.startsWith('-') && !opts.name) opts.name = arg;
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return opts;
}

function printHelp() {
  console.log(`Usage: node fetch-upstream.mjs <name> [--style <style>] [--refresh] [--json]

Downloads (or reads from cache) the shadcn/ui registry item <name> and writes
.claude/skills/shadcn-port/upstream/<name>.summary.json with its extracted
data-slot values, class strings, cva variant maps, data-* attributes, Radix
vars/imports and lucide icons.

Options:
  --style <style>  registry style (default: $SHADCN_STYLE or "${DEFAULT_STYLE}")
  --refresh        bypass the on-disk registry cache and re-download
  --json           print the summary as JSON instead of a short report
  --help           show this help
`);
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
  const summary = await getUpstreamSummary(sampleRoot, opts.name, { style: opts.style, refresh: opts.refresh });
  const { upstreamDir } = skillPaths(sampleRoot);

  if (opts.json) {
    console.log(JSON.stringify(summary, null, 2));
    return;
  }

  console.log(`${summary.name} (${summary.style})`);
  console.log(`  written:              ${upstreamDir}/${summary.name}.summary.json`);
  console.log(`  files:                ${summary.files.map((f) => f.path).join(', ')}`);
  console.log(`  registryDependencies: ${summary.registryDependencies.join(', ') || '(none)'}`);
  console.log(`  slots:                ${summary.slots.join(', ') || '(none)'}`);
  console.log(`  cvaVariants:          ${summary.cvaVariants.map((v) => v.owner ?? '(anonymous)').join(', ') || '(none)'}`);
  console.log(`  dataAttributes:       ${summary.dataAttributes.join(', ') || '(none)'}`);
  console.log(`  radixVars:            ${summary.radixVars.join(', ') || '(none)'}`);
  console.log(`  lucideIcons:          ${summary.lucideIcons.join(', ') || '(none)'}`);
  console.log(`  radixImports:         ${summary.radixImports.join(', ') || '(none)'}`);
}

main().catch((err) => {
  console.error(err.stack ?? String(err));
  process.exitCode = 1;
});
