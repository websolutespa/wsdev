#!/usr/bin/env node
/**
 * register-docs.mjs — adds or updates one component's entry in the docs
 * manifest `src/docs/components.twig.json`, idempotently.
 *
 * Usage:
 *   node register-docs.mjs <name> [--group <id>] [--title <title>] [--description <text>]
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { componentPaths, docsManifestFile, sampleRootFromScript } from './lib/paths.mjs';

const GROUP_TITLES = {
  primitives: 'Primitives',
  forms: 'Forms',
  overlays: 'Overlays',
  navigation: 'Navigation',
  'data-display': 'Data display',
  chat: 'Chat',
  feedback: 'Feedback',
  composites: 'Composites',
};

function parseArgs(argv) {
  const opts = { name: undefined, group: undefined, title: undefined, description: undefined };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--group') opts.group = argv[++i];
    else if (arg === '--title') opts.title = argv[++i];
    else if (arg === '--description') opts.description = argv[++i];
    else if (arg === '--help' || arg === '-h') opts.help = true;
    else if (!arg.startsWith('-') && !opts.name) opts.name = arg;
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return opts;
}

function printHelp() {
  console.log(`Usage: node register-docs.mjs <name> [--group <id>] [--title <title>] [--description <text>]

Adds or updates <name>'s entry in src/docs/components.twig.json. Creates the
manifest (with the standard groups: ${Object.keys(GROUP_TITLES).join(', ')}) if it
does not exist yet. Scenarios are read from the component's own
<name>.twig.json ("mocks.<name>" keys). Idempotent: re-running with the same
arguments does not duplicate the entry.

Options:
  --group <id>          target group id (default: "primitives"; created if unknown)
  --title <title>       display title (default: title-cased <name>)
  --description <text>  one-line description (default: empty string)
  --help                show this help
`);
}

function titleCase(name) {
  return name
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function loadManifest(file) {
  if (existsSync(file)) {
    return JSON.parse(readFileSync(file, 'utf8'));
  }
  return {
    docs: {
      groups: Object.entries(GROUP_TITLES).map(([id, title]) => ({ id, title, components: [] })),
    },
  };
}

function findGroup(manifest, id) {
  return manifest.docs.groups.find((g) => g.id === id);
}

function ensureGroup(manifest, id) {
  let group = findGroup(manifest, id);
  if (!group) {
    group = { id, title: GROUP_TITLES[id] ?? titleCase(id), components: [] };
    manifest.docs.groups.push(group);
  }
  return group;
}

function loadScenarios(sampleRoot, name) {
  const { mocks } = componentPaths(sampleRoot, name);
  if (!existsSync(mocks)) return [];
  const json = JSON.parse(readFileSync(mocks, 'utf8'));
  return Object.keys(json.mocks?.[name] ?? {});
}

/** Removes any existing entry for `name` from every group, returning both the entry and its former group id, if found. */
function extractExisting(manifest, name) {
  for (const group of manifest.docs.groups) {
    const idx = group.components.findIndex((c) => c.name === name);
    if (idx !== -1) return { entry: group.components.splice(idx, 1)[0], groupId: group.id };
  }
  return null;
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
  const file = docsManifestFile(sampleRoot);
  const manifest = loadManifest(file);

  const found = extractExisting(manifest, opts.name);
  const groupId = opts.group ?? found?.groupId ?? 'primitives';
  const group = ensureGroup(manifest, groupId);

  const entry = {
    name: opts.name,
    title: opts.title ?? found?.entry.title ?? titleCase(opts.name),
    description: opts.description ?? found?.entry.description ?? '',
    scenarios: loadScenarios(sampleRoot, opts.name),
  };
  group.components.push(entry);

  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, JSON.stringify(manifest, null, 2) + '\n', 'utf8');

  console.log(`Registered "${opts.name}" in group "${group.id}" (${entry.scenarios.length} scenario(s)).`);
  console.log(`  written: ${file}`);
}

main().catch((err) => {
  console.error(err.stack ?? String(err));
  process.exitCode = 1;
});
