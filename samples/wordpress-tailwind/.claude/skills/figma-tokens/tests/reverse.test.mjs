/**
 * Tests for reverse.mjs — code → portable DTCG.
 *
 * reverse.mjs is a self-executing CLI, so this is a SUBPROCESS integration test, not
 * a unit test. It builds its own throwaway `globals.css` + `mode-custom-experimental.css`
 * fixture (this generalized copy of the skill may run before the rest of the sample
 * skeleton — e.g. a real `src/css/globals.css` — exists) and runs the script against it
 * via explicit `--globals`/`--quarantine`/`--out` flags, non-destructively, into a
 * throwaway `--out` dir. It also cross-validates figma-color: every colour reverse
 * writes, fed back through figmaColorToHex, must reproduce the importer's canonical CSS hex.
 */
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, rmSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { figmaColorToHex } from '../scripts/figma/figma-color.mjs';
import { toCssColor } from '../scripts/lib/color.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const REVERSE = resolve(HERE, '../scripts/reverse.mjs');

const FIXTURE_DIR = mkdtempSync(join(tmpdir(), 'figma-reverse-fixture-'));
const OUT = mkdtempSync(join(tmpdir(), 'figma-reverse-out-'));
after(() => {
  rmSync(FIXTURE_DIR, { recursive: true, force: true });
  rmSync(OUT, { recursive: true, force: true });
});

/** Minimal marker fixture covering every block reverse.mjs reads. */
const GLOBALS_FIXTURE = `:root {
/* >>> figma:primitives START >>> */
  --color-cyan-500: #0060C8;
  --color-cyan-900: #001A33;
/* <<< figma:primitives END <<< */
/* >>> figma:semantic-light START >>> */
  --primary: #0060C8;
  --destructive: #B91C1C;
/* <<< figma:semantic-light END <<< */
/* >>> figma:alpha-light START >>> */
  --ws-alpha-50: #FFFFFF80;
/* <<< figma:alpha-light END <<< */
/* >>> figma:shadow-blur START >>> */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --blur-md: 8px;
/* <<< figma:shadow-blur END <<< */
/* >>> figma:responsive-base START >>> */
    --ws-spacing-xs: 0.25rem;
    --ws-text-xs-font-size: 0.75rem;
/* <<< figma:responsive-base END <<< */
/* >>> figma:responsive-md START >>> */
    --ws-spacing-xs: 0.5rem;
    --ws-text-xs-font-size: 0.8125rem;
/* <<< figma:responsive-md END <<< */
}

.dark {
/* >>> figma:semantic-dark START >>> */
  --primary: #3B82F6;
  --destructive: #F87171;
/* <<< figma:semantic-dark END <<< */
/* >>> figma:alpha-dark START >>> */
  --ws-alpha-50: #00000080;
/* <<< figma:alpha-dark END <<< */
}
`;

mkdirSync(join(FIXTURE_DIR, 'css'), { recursive: true });
const GLOBALS_PATH = join(FIXTURE_DIR, 'css', 'globals.css');
const QUARANTINE_PATH = join(FIXTURE_DIR, 'css', 'mode-custom-experimental.css');
writeFileSync(GLOBALS_PATH, GLOBALS_FIXTURE, 'utf8');
// No quarantine file written: buildQuarantineGroup degrades to `{}` when absent.

const run = spawnSync(
  process.execPath,
  [REVERSE, '--globals', GLOBALS_PATH, '--quarantine', QUARANTINE_PATH, '--out', OUT],
  { encoding: 'utf8' },
);

const FILES = [
  '1. TailwindCSS/TailwindCSS.tokens.json',
  '2. Color Palette/Color Palette.tokens.json',
  '3. Mode/Light.tokens.json',
  '3. Mode/Dark.tokens.json',
  '4. Theme/Theme.tokens.json',
  '5. Custom/Mobile.tokens.json',
  '5. Custom/Desktop.tokens.json',
];
const read = (rel) => JSON.parse(readFileSync(join(OUT, rel), 'utf8'));

/** A DTCG colour leaf, cross-checked against the figma-color seam. */
function assertColorLeaf(leaf, where) {
  assert.equal(leaf.$type, 'color', `${where}: $type`);
  const v = leaf.$value;
  assert.ok(v && v.components && typeof v.hex === 'string', `${where}: shape`);
  const { r, g, b } = v.components;
  for (const [ch, n] of Object.entries({ r, g, b })) {
    assert.ok(n >= 0 && n <= 1, `${where}: channel ${ch} out of 0–1`);
  }
  // reverse's components + alpha → figma-color → must equal the importer's canonical hex
  assert.equal(figmaColorToHex({ r, g, b, a: v.alpha }), toCssColor(v.hex, v.alpha), `${where}: round-trip`);
}

test('reverse.mjs exits 0 and writes all 7 DTCG files', () => {
  assert.equal(run.status, 0, `non-zero exit\nstderr:\n${run.stderr}`);
  for (const f of FILES) assert.ok(existsSync(join(OUT, f)), `missing: ${f}`);
});

test('Color Palette — every present family is numeric steps of valid colour leaves', () => {
  const palette = read('2. Color Palette/Color Palette.tokens.json')['Color Palette'];
  assert.ok(Object.keys(palette).length > 0, 'palette should not be empty in the fixture');
  for (const fam of Object.keys(palette)) {
    const steps = Object.keys(palette[fam]);
    assert.ok(steps.length > 0, `family ${fam} has no steps`);
    for (const step of steps) assertColorLeaf(palette[fam][step], `palette ${fam}/${step}`);
  }
});

test('Mode Light/Dark — base + alpha + custom groups; base colours valid', () => {
  for (const mode of ['Light', 'Dark']) {
    const m = read(`3. Mode/${mode}.tokens.json`);
    for (const group of ['base', 'alpha', 'custom']) assert.ok(group in m, `${mode}: missing ${group}`);
    assert.ok(Object.keys(m.base).length > 0, `${mode}: empty base`);
    for (const [name, leaf] of Object.entries(m.base)) assertColorLeaf(leaf, `${mode} base/${name}`);
  }
});

test('Theme — shadow / blur groups present', () => {
  const theme = read('4. Theme/Theme.tokens.json');
  for (const group of ['shadow', 'blur']) assert.ok(group in theme, `theme: missing ${group}`);
});

test('Custom Mobile/Desktop — flat --ws-<name> tokens round-trip as numeric leaves', () => {
  for (const bp of ['Mobile', 'Desktop']) {
    const c = read(`5. Custom/${bp}.tokens.json`);
    assert.equal(typeof c, 'object', `${bp}: not an object`);
    for (const k of Object.keys(c)) assert.equal(typeof c[k], 'object', `${bp}/${k}: not a node`);
  }
  // the fixture's --ws-spacing-xs (mobile 0.25rem = 4px, desktop 0.5rem = 8px) round-trips
  assert.equal(read('5. Custom/Mobile.tokens.json')['spacing-xs'].$value, 4);
  assert.equal(read('5. Custom/Desktop.tokens.json')['spacing-xs'].$value, 8);
});
