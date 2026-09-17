/**
 * Tests for Module 4 — marker injector + coverage/collision gate.
 * Pure string ops: assert regions are replaced, surroundings preserved, and the
 * gates throw on a missing marker, an unclassified leaf, and a name collision.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  assertCoverage,
  assertNoCollisions,
  extractGeneratedNames,
  findCollisions,
  injectAll,
  injectMarkers,
} from '../scripts/lib/injector.mjs';

const withMarker = (name, body) =>
  `:root {\n/* >>> figma:${name} START >>> */\n${body}\n/* <<< figma:${name} END <<< */\n}\n`;

test('injectMarkers replaces the region and preserves the surroundings', () => {
  const css = withMarker('primitives', '  --color-old: red;');
  const out = injectMarkers(css, 'primitives', '  --color-new: blue;');
  assert.match(out, /--color-new: blue;/);
  assert.doesNotMatch(out, /--color-old/);
  assert.match(out, /:root \{/); // surrounding preserved
  assert.match(out, /\/\* >>> figma:primitives START >>> \*\//);
  assert.match(out, /\/\* <<< figma:primitives END <<< \*\//);
});

test('injectMarkers throws when a marker is missing', () => {
  assert.throws(() => injectMarkers(':root {}', 'primitives', 'x'), /marker missing for "primitives"/);
});

test('injectAll injects every block', () => {
  const css = withMarker('primitives', 'old1') + withMarker('color-map', 'old2');
  const out = injectAll(css, { primitives: 'NEW1', 'color-map': 'NEW2' });
  assert.match(out, /NEW1/);
  assert.match(out, /NEW2/);
});

test('extractGeneratedNames collects every --token declared in the blocks', () => {
  const names = extractGeneratedNames({
    primitives: '  --color-x: red;\n  --color-y: blue;',
    'color-map': '  --color-z: var(--z);',
  });
  assert.deepEqual([...names].sort(), ['--color-x', '--color-y', '--color-z']);
});

test('findCollisions flags only generated names hand-declared OUTSIDE the markers', () => {
  const css =
    withMarker('primitives', '  --color-x: red;\n  --color-y: blue;') +
    ':root {\n  --color-x: green;\n  --radius: 8px;\n}\n'; // --color-x duplicated outside
  const collisions = findCollisions(css, new Set(['--color-x', '--color-y']));
  assert.deepEqual(collisions, ['--color-x']); // --color-y only lives inside markers → safe
});

test('findCollisions returns empty when nothing overlaps', () => {
  const css = withMarker('primitives', '  --color-x: red;') + ':root { --radius: 8px; }';
  assert.deepEqual(findCollisions(css, new Set(['--color-x'])), []);
});

test('findCollisions ignores names re-declared inside a figma-tokens:overrides region', () => {
  // intentional-override pattern: --primary lives in the semantic-light marker AND is intentionally
  // re-declared to a brand value inside an overrides region — the override wins the cascade
  // on purpose, so it must NOT count as a collision that aborts --apply.
  const css =
    withMarker('semantic-light', '  --primary: #171717;') +
    ':root {\n' +
    '  /* figma-tokens:overrides START */\n' +
    '  --primary: var(--color-brand-red-800);\n' +
    '  /* figma-tokens:overrides END */\n' +
    '}\n';
  assert.deepEqual(findCollisions(css, new Set(['--primary'])), []);
  // a re-declaration OUTSIDE the overrides region is still a collision
  const bad = css + ':root { --primary: green; }\n';
  assert.deepEqual(findCollisions(bad, new Set(['--primary'])), ['--primary']);
});

test('assertCoverage throws on unclassified, passes when empty', () => {
  assert.throws(() => assertCoverage(['mode-light: mystery/thing']), /coverage gate failed: 1/);
  assert.doesNotThrow(() => assertCoverage([]));
});

test('assertNoCollisions throws on collisions, passes when empty', () => {
  assert.throws(() => assertNoCollisions(['--color-x']), /name collisions/);
  assert.doesNotThrow(() => assertNoCollisions([]));
});
