#!/usr/bin/env node
/**
 * scaffold-stories.mjs — generates a CSF3 `<name>.stories.js` skeleton next to
 * a component's `<name>.twig.json`: `Default` (Controls playground from the
 * `default` mock) + `argTypes` parsed from `<name>.twig`'s `{# Params: #}`
 * header + a `Catalog` with one demoCard per mock scenario. Interactive
 * `play` stories and full matrixCard grids are added by hand afterwards
 * (see PORTING.md § Story shape) — this script only lays the skeleton.
 *
 * Usage:
 *   node scaffold-stories.mjs <name> [--group base|blocks] [--force]
 *   node scaffold-stories.mjs --all [--group base|blocks] [--force]
 *   node scaffold-stories.mjs <name> [--group base|blocks] --stdout
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

// Param names whose argType always lands in the Advanced category (identifier
// plumbing, not a visual/behavioural knob).
const ADVANCED_NAMES = new Set(['id', 'slot', 'labelClass', 'headingLevel']);
// Param names always shown as Appearance when not otherwise classified.
const APPEARANCE_NAMES = new Set(['variant', 'size', 'showCloseButton']);
// Param names always shown as Behaviour when not otherwise classified.
const BEHAVIOUR_NAMES = new Set(['url', 'target', 'type', 'static', 'placeholder']);
// Params excluded from argTypes entirely (raw/plumbing, additive-only).
const HIDDEN_NAMES = new Set(['class', 'attrs']);
// Header entries that document something other than a twig param (see
// PORTING.md rule 5: "- blocks: <names>" lists the component's named
// {% block %}s, not a data prop) — never real argTypes.
const NON_PARAM_NAMES = new Set(['blocks']);

function parseArgs(argv) {
  const opts = { names: [], all: false, group: 'base', force: false, stdout: false };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--all') opts.all = true;
    else if (arg === '--group') opts.group = argv[++i];
    else if (arg === '--force') opts.force = true;
    else if (arg === '--stdout') opts.stdout = true;
    else if (arg === '--help' || arg === '-h') opts.help = true;
    else if (!arg.startsWith('-')) opts.names.push(arg);
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return opts;
}

function printHelp() {
  console.log(`Usage: node scaffold-stories.mjs <name> [--group base|blocks] [--force]
       node scaffold-stories.mjs --all [--group base|blocks] [--force]
       node scaffold-stories.mjs <name> [--group base|blocks] --stdout

Generates <group>/<name>/<name>.stories.js: \`Default\` (args from
mocks['default']), \`argTypes\` parsed from <name>.twig's "Params:" header
(best-effort — descriptions come through verbatim in English and category
guesses are heuristic; both are meant to be refined by hand, translated to
Italian per the existing convention), and a \`Catalog\` stacking one demoCard
per mock scenario (title = the scenario key humanised). Interactive \`play\`
stories and full matrixCard grids are NOT generated — add them by hand.

Idempotent: an existing stories file is skipped unless --force is given.

Options:
  --group <id>  component group directory (default: "base")
  --force       overwrite an existing <name>.stories.js
  --all         process every component directory in the group
  --stdout      print the generated file for one <name> instead of writing it
                (ignores --force; refuses to combine with --all)
  --help        show this help
`);
}

/**
 * Converts a kebab/camelCase mock scenario key into a PascalCase JS
 * identifier (used only for the file's title, not for exports anymore).
 * @param {string} key
 * @returns {string}
 */
function pascalCase(key) {
  const words = key.split(/[-_\s]+/).filter(Boolean);
  return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join('');
}

/**
 * Converts a kebab/snake-case mock scenario key into a human sentence
 * fragment for a demoCard title, e.g. "no-close-button" -> "No close button".
 * @param {string} key
 * @returns {string}
 */
function humanize(key) {
  const text = key.replace(/[-_]+/g, ' ').trim();
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** @param {string} name @param {string} group */
function layoutFor(name, group) {
  if (group === 'blocks') return 'fullscreen';
  if (FULLSCREEN_NAMES.has(name)) return 'fullscreen';
  if (PADDED_NAMES.has(name)) return 'padded';
  return 'centered';
}

/**
 * Quotes a JS string literal with single quotes, escaping backslashes and
 * single quotes (project eslint config requires single-quoted strings).
 * @param {string} str
 */
function q(str) {
  return `'${str.replace(/\\/g, '\\\\').replace(/'/g, '\\\'')}'`;
}

/* ───────────────────────────────────────────────────────────────────────────
   {# Params: #} header parsing → argTypes
   ─────────────────────────────────────────────────────────────────────────── */

/**
 * Extracts the raw param entries (`{ name, optional, rest }`) from the first
 * `{# ... #}` comment's "Params" list in a twig source string. `rest` is the
 * first line's text after `name?:` plus any deeper-indented continuation
 * lines, still containing the type, an optional `(default: ...)` and an
 * optional ` — description` — see `parseParamEntry` for the split.
 * @param {string} twigSource
 * @returns {{ name: string, optional: boolean, rest: string }[]}
 */
function extractParamLines(twigSource) {
  const commentEnd = twigSource.indexOf('#}');
  if (!twigSource.startsWith('{#') || commentEnd === -1) return [];
  const comment = twigSource.slice(0, commentEnd);
  const lines = comment.split(/\r?\n/);

  const headingIndex = lines.findIndex((l) => /^\s*Params\b.*:\s*$/i.test(l));
  if (headingIndex === -1) return [];

  const entries = [];
  let current = null;
  let baseline = null;

  for (let i = headingIndex + 1; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim() === '') break;
    const indent = line.length - line.trimStart().length;
    const dashMatch = line.match(/^\s*-\s*([A-Za-z_$][\w$]*)(\?)?:\s*(.*)$/);

    if (baseline === null) {
      if (!dashMatch) continue; // skip stray lines before the first real param
      baseline = indent;
    }

    if (indent === baseline && dashMatch) {
      current = { name: dashMatch[1], optional: Boolean(dashMatch[2]), rest: dashMatch[3] };
      entries.push(current);
    } else if (indent === baseline) {
      current = null; // unparseable line at param depth (e.g. `{% block x %}`) — skip it
    } else if (indent > baseline && current) {
      current.rest += ` ${line.trim()}`;
    } else if (indent < baseline) {
      break;
    }
  }
  return entries;
}

/**
 * Splits one param entry's `rest` text into its type string, optional
 * `default` summary and English description, in whatever order the header
 * happens to place them (`Type (default: x) — desc` and `Type — desc
 * (default: x)` both occur in this codebase).
 * @param {string} rest
 * @returns {{ typeStr: string, defaultSummary: string|null, description: string }}
 */
function splitParamRest(rest) {
  let text = rest;
  let defaultSummary = null;
  const defaultMatch = text.match(/\(default:\s*([^)]*)\)/);
  if (defaultMatch) {
    defaultSummary = defaultMatch[1].trim().replace(/^'(.*)'$/, '$1');
    text = text.slice(0, defaultMatch.index) + text.slice(defaultMatch.index + defaultMatch[0].length);
    text = text.replace(/\s+([;,.)])/g, '$1').replace(/\s{2,}/g, ' ');
  }
  const dashIndex = text.indexOf(' — ');
  const typeStr = (dashIndex === -1 ? text : text.slice(0, dashIndex)).trim();
  const description = dashIndex === -1 ? '' : text.slice(dashIndex + 3).trim();
  return { typeStr, defaultSummary, description };
}

/**
 * Picks a Storybook control + optional enum options for a parsed type string.
 * Falls through to a plain text control for anything not recognized (kept
 * usable but flagged for manual review via the returned `unrecognized` flag).
 * @param {string} typeStr
 */
function controlFor(typeStr) {
  const quoted = [...typeStr.matchAll(/'([^']*)'/g)].map((m) => m[1]);
  if (quoted.length) return { control: 'select', options: quoted };
  if (/^Boolean$/.test(typeStr)) return { control: 'boolean' };
  if (/^Number\b/.test(typeStr) && !typeStr.includes('|')) return { control: 'number' };
  if (/^(Array|Object|\{)/.test(typeStr)) return { control: 'object' };
  if (/^String$/.test(typeStr)) return { control: 'text' };
  return { control: 'text', unrecognized: true };
}

/** Best-effort argType category guess — review by eye, see PORTING.md § Story shape. */
function categoryFor(name, control) {
  if (ADVANCED_NAMES.has(name)) return 'Advanced';
  if (/^aria[A-Z]/.test(name)) return 'Accessibility';
  if (control === 'boolean') return 'State';
  if (APPEARANCE_NAMES.has(name)) return 'Appearance';
  if (BEHAVIOUR_NAMES.has(name)) return 'Behaviour';
  return 'Content';
}

/**
 * Builds the `argTypes` object source (as formatted JS, not JSON — options
 * may contain a bare `undefined` for an optional enum with no default) plus
 * any warnings about unrecognized types worth a human look.
 * @param {string} twigSource
 * @returns {{ source: string, warnings: string[] }}
 */
function buildArgTypes(twigSource) {
  const entries = extractParamLines(twigSource);
  if (!entries.length) return { source: '', warnings: [] };

  const warnings = [];
  const lines = [];

  for (const { name, optional, rest } of entries) {
    if (NON_PARAM_NAMES.has(name)) continue;
    if (HIDDEN_NAMES.has(name)) {
      lines.push(`    ${name}: { table: { disable: true } },`);
      continue;
    }
    const { typeStr, defaultSummary, description } = splitParamRest(rest);
    const { control, options, unrecognized } = controlFor(typeStr);
    if (unrecognized) {
      warnings.push(`param "${name}": type "${typeStr}" not recognized, defaulting to a text control`);
    }
    let opts = options;
    if (control === 'select' && optional && !defaultSummary) opts = [undefined, ...opts];

    const category = categoryFor(name, control);
    const tableProps = [`category: ${q(category)}`];
    if (defaultSummary) tableProps.push(`defaultValue: { summary: ${q(defaultSummary)} }`);

    const props = [`control: ${q(control)}`];
    if (opts) props.push(`options: [${opts.map((o) => (o === undefined ? 'undefined' : q(o))).join(', ')}]`);
    if (description) props.push(`description: ${q(description)}`);
    props.push(`table: { ${tableProps.join(', ')} }`);

    lines.push(`    ${name}: {\n      ${props.join(',\n      ')},\n    },`);
  }

  return { source: `  argTypes: {\n${lines.join('\n')}\n  },\n`, warnings };
}

/* ───────────────────────────────────────────────────────────────────────────
   Stories file assembly
   ─────────────────────────────────────────────────────────────────────────── */

/**
 * Builds the stories file source for one component.
 * @returns {{ source: string, warnings: string[] }}
 */
function buildStoriesSource(name, group, scenarioKeys, twigSource) {
  const groupTitle = GROUP_TITLES[group] ?? pascalCase(group);
  const title = `${groupTitle}/${pascalCase(name)}`;
  const layout = layoutFor(name, group);
  const twigId = `@components/${group}/${name}/${name}.twig`;
  const warnings = [];

  const { source: argTypesSource, warnings: argTypeWarnings } = buildArgTypes(twigSource);
  warnings.push(...argTypeWarnings);

  const defaultKey = scenarioKeys.includes('default') ? 'default' : scenarioKeys[0];
  if (defaultKey !== 'default') {
    warnings.push(`no "default" mock scenario, using "${defaultKey}" for the Default story`);
  }

  const cardVars = scenarioKeys.map((key, i) => `scenario${i}Card`);
  const cardDeclarations = scenarioKeys
    .map(
      (key, i) => `const ${cardVars[i]} = demoCard({
  title: ${q(humanize(key))},
  content: renderTwig(TWIG_ID, mocks['${key}']),
});`
    )
    .join('\n\n');

  const source = `import { renderTwig } from '~sb/twig';
import { demoCard, storyStack } from '~sb/story-helpers';
import data from './${name}.twig.json';

const mocks = data.mocks['${name}'];
const TWIG_ID = '${twigId}';

export default {
  title: '${title}',
  render: (args) => renderTwig(TWIG_ID, args),
${argTypesSource}  parameters: { layout: '${layout}' },
};

/* ── Default — Controls playground ───────────────────────────────────────── */

export const Default = { args: mocks['${defaultKey}'] };

/* ── Catalog — one demoCard per mock scenario (refine into matrixCard grids
   by hand, see PORTING.md § Story shape) ─────────────────────────────────── */

${cardDeclarations}

export const Catalog = {
  parameters: { layout: 'padded' },
  render: () => storyStack(${cardVars.join(', ')}),
};
`;

  return { source, warnings };
}

/**
 * @returns {{ status: 'created'|'skipped'|'error', message: string, warnings: string[], source?: string }}
 */
function scaffoldOne(sampleRoot, name, group, force, stdout) {
  const paths = componentPaths(sampleRoot, name, group);
  if (!existsSync(paths.mocks)) {
    return { status: 'error', message: `${name}: no ${name}.twig.json found at ${paths.mocks}`, warnings: [] };
  }
  if (!existsSync(paths.twig)) {
    return { status: 'error', message: `${name}: no ${name}.twig found at ${paths.twig}`, warnings: [] };
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
  if (!stdout && existsSync(paths.stories) && !force) {
    return { status: 'skipped', message: `${name}: ${paths.stories} already exists (use --force to overwrite)`, warnings: [] };
  }

  const twigSource = readFileSync(paths.twig, 'utf8');
  const { source, warnings } = buildStoriesSource(name, group, Object.keys(scenarios), twigSource);

  if (stdout) {
    return { status: 'created', message: `${name}: (stdout, not written)`, warnings, source };
  }
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
  if (opts.stdout && (opts.all || opts.names.length !== 1)) {
    console.error('--stdout requires exactly one <name> and cannot be combined with --all.');
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

  const results = names.map((name) => scaffoldOne(sampleRoot, name, opts.group, opts.force, opts.stdout));

  if (opts.stdout) {
    const [result] = results;
    if (result.status === 'error') {
      console.error(result.message);
      process.exitCode = 1;
      return;
    }
    for (const w of result.warnings) console.error(`⚠ ${w}`);
    console.log(result.source);
    return;
  }

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
