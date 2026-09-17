#!/usr/bin/env node
/**
 * scaffold-component.mjs — creates `src/templates/components/base/<name>/`
 * from the upstream summary: a typed `{# params #}` Twig stub, a mocks file
 * with one scenario per variant value, and (when the upstream is stateful) a
 * `<name>.module.js` stub following the project's module contract.
 *
 * Usage:
 *   node scaffold-component.mjs <name> [--style <style>] [--force]
 */
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { getUpstreamSummary } from './lib/classes.mjs';
import { componentPaths, sampleRootFromScript, skillPaths } from './lib/paths.mjs';

function parseArgs(argv) {
  const opts = { force: false, style: undefined, name: undefined };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--style') opts.style = argv[++i];
    else if (arg === '--force') opts.force = true;
    else if (arg === '--help' || arg === '-h') opts.help = true;
    else if (!arg.startsWith('-') && !opts.name) opts.name = arg;
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return opts;
}

function printHelp() {
  console.log(`Usage: node scaffold-component.mjs <name> [--style <style>] [--force]

Creates src/templates/components/base/<name>/ with a params-annotated
<name>.twig stub (base + variant/size hashes copied verbatim from the
upstream cva() call), a <name>.twig.json mock file with one scenario per
variant value, and, when the upstream uses Radix or data-[state] styling, a
<name>.module.js stub.

Never overwrites existing files unless --force is given.

Options:
  --style <style>  registry style to read cva variants from
  --force          overwrite existing files
  --help           show this help
`);
}

/** kebab-case -> PascalCase, e.g. "dropdown-menu" -> "DropdownMenu" */
function toPascalCase(name) {
  return name
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

/** naive singular->plural for a cva axis key used as a Twig hash name, e.g. "variant" -> "variants" */
function pluralize(word) {
  return word.endsWith('s') ? word : `${word}s`;
}

/** Quotes a Twig hash key when it is not a bare identifier (e.g. "icon-xs" -> "'icon-xs'"), so hyphenated cva values stay valid Twig. */
function twigHashKey(key) {
  return /^[A-Za-z_][A-Za-z0-9_]*$/.test(key) ? key : `'${key}'`;
}

/** Picks the cva block most likely to describe the component root (matches "<Pascal>Variants", else the first block). */
function pickPrimaryCvaBlock(summary, pascalName) {
  if (!summary.cvaVariants.length) return null;
  const byOwner = summary.cvaVariants.find((v) => v.owner === `${pascalName}Variants`);
  return byOwner ?? summary.cvaVariants[0];
}

/**
 * Builds the `{# params #}` header, the `{% set %}` hashes and the root
 * element markup for a component, from its primary cva block (if any).
 */
function buildTwigStub(name, summary) {
  const pascal = toPascalCase(name);
  const cva = pickPrimaryCvaBlock(summary, pascal);
  const axes = cva ? Object.entries(cva.variants) : [];

  const paramLines = axes.map(([axis, values]) => {
    const options = Object.keys(values)
      .map((v) => `'${v}'`)
      .join('|');
    const def = cva.defaultVariants?.[axis] ?? Object.keys(values)[0];
    return `  - ${axis}?: ${options} as string (default: '${def}')`;
  });
  paramLines.push(
    '  - class?: String — appended last; additive utilities only',
    '  - attrs?: String — raw extra attributes, trusted input only',
    '  - id?: String',
  );

  const hashLines = [];
  const varNames = {};
  if (cva?.base !== undefined && cva?.base !== null) {
    hashLines.push(`{% set ${name.replace(/-/g, '_')}_base = ${JSON.stringify(cva.base)} %}`);
  }
  for (const [axis, values] of axes) {
    const hashName = `${name.replace(/-/g, '_')}_${pluralize(axis)}`;
    varNames[axis] = hashName;
    const entries = Object.entries(values)
      .map(([k, v]) => `  ${twigHashKey(k)}: ${JSON.stringify(v)}`)
      .join(',\n');
    hashLines.push(`{% set ${hashName} = {\n${entries}\n} %}`);
  }

  const dataAttrs = axes
    .map(([axis]) => `  data-${axis}="{{ ${axis}|default('${cva.defaultVariants?.[axis] ?? Object.keys(cva.variants[axis])[0]}') }}"`)
    .join('\n');

  const classPieces = [];
  const base = name.replace(/-/g, '_');
  if (cva?.base !== undefined && cva?.base !== null) classPieces.push(`{{ ${base}_base }}`);
  for (const [axis] of axes) {
    classPieces.push(`{{ ${varNames[axis]}[${axis}|default('${cva.defaultVariants?.[axis] ?? ''}')] }}`);
  }
  // No separating space here: the {% if %} body below supplies " {{ class }}" only when class is truthy.
  const classAttr = `${classPieces.join(' ')}{% if class is defined and class %} {{ class }}{% endif %}`;

  return `{#
  Params:
${paramLines.join('\n')}
#}
${hashLines.join('\n')}
<div
  data-slot="${name}"
${dataAttrs ? `${dataAttrs}\n` : ''}  {% if id is defined and id %}id="{{ id }}"{% endif %}
  class="${classAttr}"
  {% if attrs is defined and attrs %}{{ attrs|raw }}{% endif %}
>
  {# TODO: port markup from upstream — see .claude/skills/shadcn-port/upstream/${name}.summary.json #}
</div>
`;
}

/** Builds `<name>.twig.json`: a "default" scenario plus one per non-default axis value. */
function buildMocks(name, summary, pascal) {
  const cva = pickPrimaryCvaBlock(summary, pascal);
  const scenarios = { default: {} };
  if (cva) {
    for (const [axis, values] of Object.entries(cva.variants)) {
      const def = cva.defaultVariants?.[axis];
      for (const value of Object.keys(values)) {
        if (value === def) continue;
        const key = axis === 'variant' ? value : `${axis}-${value}`;
        scenarios[key] = { [axis]: value };
      }
    }
  }
  return { mocks: { [name]: scenarios } };
}

function buildModuleStub(name, summary) {
  const pascal = toPascalCase(name);
  return `// ${pascal} module — behaviour TODO, see upstream/${name}.summary.json
// (radixImports: ${summary.radixImports.join(', ') || 'none'}; dataAttributes: ${summary.dataAttributes.slice(0, 4).join(', ') || 'none'})
// import { setState } from '../../../../js/common/dataState.js';
// import { onDismiss } from '../../../../js/common/dismiss.js';
// import { trapFocus, returnFocus } from '../../../../js/common/focus.js';
// import { rovingIndex } from '../../../../js/common/keynav.js';
// import { attachFloating } from '../../../../js/common/floating.js';
export default function ${pascal}Module(node) {
  const cleanups = [];
  const on = (target, type, handler, options) => {
    target.addEventListener(type, handler, options);
    cleanups.push(() => target.removeEventListener(type, handler, options));
  };
  /* TODO */
  return () => cleanups.forEach((fn) => fn());
}
`;
}

function needsModule(summary) {
  return summary.radixImports.length > 0 || summary.dataAttributes.some((a) => a.startsWith('data-[state'));
}

function writeUnlessExists(file, content, force, written) {
  if (existsSync(file) && !force) {
    console.log(`  skip (exists): ${file}`);
    return;
  }
  writeFileSync(file, content, 'utf8');
  written.push(file);
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
  const summary = await getUpstreamSummary(sampleRoot, opts.name, { style: opts.style });
  const paths = componentPaths(sampleRoot, opts.name);
  const pascal = toPascalCase(opts.name);

  mkdirSync(paths.dir, { recursive: true });

  const written = [];
  writeUnlessExists(paths.twig, buildTwigStub(opts.name, summary), opts.force, written);
  writeUnlessExists(paths.mocks, JSON.stringify(buildMocks(opts.name, summary, pascal), null, 2) + '\n', opts.force, written);
  if (needsModule(summary)) {
    writeUnlessExists(paths.module, buildModuleStub(opts.name, summary), opts.force, written);
  }

  console.log(`Scaffolded ${opts.name}:`);
  for (const f of written) console.log(`  wrote: ${f}`);
  if (!written.length) console.log('  (nothing written — all files already exist; use --force to overwrite)');
  const { upstreamDir } = skillPaths(sampleRoot);
  console.log(`See ${upstreamDir}/${opts.name}.summary.json for the full upstream data.`);
}

main().catch((err) => {
  console.error(err.stack ?? String(err));
  process.exitCode = 1;
});
