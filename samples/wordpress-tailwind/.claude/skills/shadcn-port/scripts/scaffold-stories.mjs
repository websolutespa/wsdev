#!/usr/bin/env node
/**
 * scaffold-stories.mjs — generates a CSF3 `<name>.stories.js` next to a
 * component's `<name>.twig.json`, one named export per mock scenario key
 * (CSF requires static exports, so scenarios cannot be built in a loop).
 *
 * Usage:
 *   node scaffold-stories.mjs <name> [--group base|blocks] [--force]
 *   node scaffold-stories.mjs --all [--group base|blocks] [--force]
 */
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { componentPaths, componentsGroupDir, sampleRootFromScript } from './lib/paths.mjs';

const GROUP_TITLES = { base: 'Base', blocks: 'Blocks' };

const FULLSCREEN_NAMES = new Set(['sidebar', 'message-scroller']);
const PADDED_NAMES = new Set([
  'table',
  'card',
  'accordion',
  'tabs',
  'carousel',
  'chart',
  'calendar',
  'date-picker',
  'command',
  'combobox',
  'navigation-menu',
  'menubar',
  'breadcrumb',
  'pagination',
  'resizable',
]);

const JS_RESERVED_WORDS = new Set([
  'break', 'case', 'catch', 'class', 'const', 'continue', 'debugger', 'default', 'delete', 'do',
  'else', 'export', 'extends', 'finally', 'for', 'function', 'if', 'import', 'in', 'instanceof',
  'new', 'return', 'super', 'switch', 'this', 'throw', 'try', 'typeof', 'var', 'void', 'while',
  'with', 'yield', 'let', 'static', 'enum', 'await', 'implements', 'package', 'protected',
  'interface', 'private', 'public', 'null', 'true', 'false',
]);

function parseArgs(argv) {
  const opts = { names: [], all: false, group: 'base', force: false };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--all') opts.all = true;
    else if (arg === '--group') opts.group = argv[++i];
    else if (arg === '--force') opts.force = true;
    else if (arg === '--help' || arg === '-h') opts.help = true;
    else if (!arg.startsWith('-')) opts.names.push(arg);
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return opts;
}

function printHelp() {
  console.log(`Usage: node scaffold-stories.mjs <name> [--group base|blocks] [--force]
       node scaffold-stories.mjs --all [--group base|blocks] [--force]

Generates <group>/<name>/<name>.stories.js from <name>.twig.json's
"mocks.<name>" scenarios. One named export per scenario key: "default" ->
Default, kebab-case -> PascalCase (e.g. "no-close-button" -> NoCloseButton).

Idempotent: an existing stories file is skipped unless --force is given.

Options:
  --group <id>  component group directory (default: "base")
  --force       overwrite an existing <name>.stories.js
  --all         process every component directory in the group
  --help        show this help
`);
}

/**
 * Converts a kebab/camelCase mock scenario key into a PascalCase JS
 * identifier suitable for a named export.
 * @param {string} key
 * @returns {string}
 */
function pascalCase(key) {
  const words = key.split(/[-_\s]+/).filter(Boolean);
  return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join('');
}

/**
 * Resolves a valid, unique export identifier for a scenario key, warning
 * (via the returned `warning`) when it had to prefix or suffix the name.
 * @param {string} key
 * @param {Set<string>} used - identifiers already claimed in this file
 * @returns {{ identifier: string, warning: string|null }}
 */
function exportNameFor(key, used) {
  let name = pascalCase(key);
  let warning = null;
  if (!/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(name) || JS_RESERVED_WORDS.has(name)) {
    name = `_${name}`;
    warning = `scenario "${key}" is not a valid identifier as "${pascalCase(key)}", using "${name}"`;
  }
  if (used.has(name)) {
    const original = name;
    let n = 2;
    while (used.has(`${original}${n}`)) n++;
    name = `${original}${n}`;
    warning = `scenario "${key}" collides with an earlier export, using "${name}"`;
  }
  used.add(name);
  return { identifier: name, warning };
}

/** @param {string} name @param {string} group */
function layoutFor(name, group) {
  if (group === 'blocks') return 'fullscreen';
  if (FULLSCREEN_NAMES.has(name)) return 'fullscreen';
  if (PADDED_NAMES.has(name)) return 'padded';
  return 'centered';
}

/**
 * Builds the stories file source for one component.
 * @returns {{ source: string, warnings: string[] }}
 */
function buildStoriesSource(name, group, scenarioKeys) {
  const groupTitle = GROUP_TITLES[group] ?? pascalCase(group);
  const title = `${groupTitle}/${pascalCase(name)}`;
  const layout = layoutFor(name, group);
  const used = new Set();
  const warnings = [];

  const exportLines = scenarioKeys.map((key) => {
    const { identifier, warning } = exportNameFor(key, used);
    if (warning) warnings.push(warning);
    return `export const ${identifier} = { args: mocks['${key}'] };`;
  });

  const source = `import { renderTwig } from '~sb/twig';
import data from './${name}.twig.json';

const mocks = data.mocks['${name}'];

export default {
  title: '${title}',
  render: (args) => renderTwig('@components/${group}/${name}/${name}.twig', args),
  parameters: { layout: '${layout}' },
};

${exportLines.join('\n')}
`;

  return { source, warnings };
}

/**
 * @returns {{ status: 'created'|'skipped'|'error', message: string, warnings: string[] }}
 */
function scaffoldOne(sampleRoot, name, group, force) {
  const paths = componentPaths(sampleRoot, name, group);
  if (!existsSync(paths.mocks)) {
    return { status: 'error', message: `${name}: no ${name}.twig.json found at ${paths.mocks}`, warnings: [] };
  }
  let data;
  try {
    data = JSON.parse(readFileSync(paths.mocks, 'utf8'));
  } catch (err) {
    return { status: 'error', message: `${name}: invalid JSON in ${paths.mocks} (${err.message})`, warnings: [] };
  }
  const scenarios = data.mocks?.[name];
  if (!scenarios || typeof scenarios !== 'object') {
    return { status: 'error', message: `${name}: ${paths.mocks} has no "mocks.${name}" entry`, warnings: [] };
  }
  if (existsSync(paths.stories) && !force) {
    return { status: 'skipped', message: `${name}: ${paths.stories} already exists (use --force to overwrite)`, warnings: [] };
  }

  const { source, warnings } = buildStoriesSource(name, group, Object.keys(scenarios));
  writeFileSync(paths.stories, source, 'utf8');
  return { status: 'created', message: `${name}: wrote ${paths.stories}`, warnings };
}

function defaultNames(sampleRoot, group) {
  const dir = componentsGroupDir(sampleRoot, group);
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter((entry) => statSync(`${dir}/${entry}`).isDirectory());
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
  if (!opts.all && opts.names.length === 0) {
    printHelp();
    process.exitCode = 1;
    return;
  }

  const sampleRoot = sampleRootFromScript(import.meta.url);
  const names = opts.all ? defaultNames(sampleRoot, opts.group) : opts.names;
  if (!names.length) {
    console.error(`No component directories found under src/templates/components/${opts.group}/.`);
    process.exitCode = 1;
    return;
  }

  const results = names.map((name) => scaffoldOne(sampleRoot, name, opts.group, opts.force));

  const created = results.filter((r) => r.status === 'created');
  const skipped = results.filter((r) => r.status === 'skipped');
  const errored = results.filter((r) => r.status === 'error');

  for (const r of results) {
    const marker = r.status === 'created' ? '✓' : r.status === 'skipped' ? '○' : '✗';
    console.log(`${marker} ${r.message}`);
    for (const w of r.warnings) console.log(`    ⚠ ${w}`);
  }

  console.log(`\ncreated ${created.length}, skipped ${skipped.length}, errors ${errored.length}`);
  process.exitCode = errored.length ? 1 : 0;
}

main().catch((err) => {
  console.error(err.stack ?? String(err));
  process.exitCode = 1;
});
