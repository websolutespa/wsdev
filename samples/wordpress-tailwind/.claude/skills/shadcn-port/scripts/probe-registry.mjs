#!/usr/bin/env node
/**
 * probe-registry.mjs — checks which components exist in a shadcn/ui registry
 * style and writes `.claude/skills/shadcn-port/registry-index.json`.
 *
 * Usage:
 *   node probe-registry.mjs [--style <style>] [--json]
 *
 * Probes a fixed catalogue of 63 candidate names against
 * `https://ui.shadcn.com/r/styles/<style>/<name>.json` (HEAD, falling back to
 * GET) with concurrency 6, and writes `{ style, date, available, missing }`.
 */
import { writeFileSync } from 'node:fs';
import { probeAll } from './lib/registry.mjs';
import { sampleRootFromScript, skillPaths } from './lib/paths.mjs';

/** The full candidate list this sample's pipeline targets (Fase 2b of the porting plan). */
export const CANDIDATE_NAMES = [
  'accordion', 'alert', 'alert-dialog', 'aspect-ratio', 'attachment', 'avatar', 'badge',
  'breadcrumb', 'bubble', 'button', 'button-group', 'calendar', 'card', 'carousel', 'chart',
  'checkbox', 'collapsible', 'combobox', 'command', 'context-menu', 'dialog', 'direction',
  'drawer', 'dropdown-menu', 'empty', 'field', 'form', 'hover-card', 'input', 'input-group',
  'input-otp', 'item', 'kbd', 'label', 'marker', 'menubar', 'message', 'message-scroller',
  'native-select', 'navigation-menu', 'pagination', 'popover', 'progress', 'questionnaire',
  'radio-group', 'resizable', 'scroll-area', 'select', 'separator', 'sheet', 'sidebar',
  'skeleton', 'slider', 'sonner', 'spinner', 'switch', 'table', 'tabs', 'textarea', 'toast',
  'toggle', 'toggle-group', 'tooltip',
];

function parseArgs(argv) {
  const opts = { style: undefined, json: false };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--style') opts.style = argv[++i];
    else if (arg === '--json') opts.json = true;
    else if (arg === '--help' || arg === '-h') opts.help = true;
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return opts;
}

function printHelp() {
  console.log(`Usage: node probe-registry.mjs [--style <style>] [--json]

Probes ${CANDIDATE_NAMES.length} candidate component names against the shadcn/ui
registry and writes .claude/skills/shadcn-port/registry-index.json.

Options:
  --style <style>  registry style to probe (default: $SHADCN_STYLE or "new-york-v4")
  --json           print the result as JSON instead of a summary table
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
  if (opts.help) {
    printHelp();
    return;
  }

  const sampleRoot = sampleRootFromScript(import.meta.url);
  const style = opts.style ?? process.env.SHADCN_STYLE ?? 'new-york-v4';

  const results = await probeAll(CANDIDATE_NAMES, { style, concurrency: 6 });
  const byName = new Map(results.map((r) => [r.name, r]));
  const available = CANDIDATE_NAMES.filter((n) => byName.get(n)?.ok).sort();
  const missing = CANDIDATE_NAMES.filter((n) => !byName.get(n)?.ok).sort();

  const index = { style, date: new Date().toISOString(), available, missing };
  const { registryIndexFile } = skillPaths(sampleRoot);
  writeFileSync(registryIndexFile, JSON.stringify(index, null, 2), 'utf8');

  if (opts.json) {
    console.log(JSON.stringify(index, null, 2));
    return;
  }

  console.log(`shadcn/ui registry probe — style "${style}"`);
  console.log(`  available: ${available.length}/${CANDIDATE_NAMES.length}`);
  console.log(`  missing:   ${missing.length ? missing.join(', ') : '(none)'}`);
  console.log(`  written:   ${registryIndexFile}`);
}

main().catch((err) => {
  console.error(err.stack ?? String(err));
  process.exitCode = 1;
});
