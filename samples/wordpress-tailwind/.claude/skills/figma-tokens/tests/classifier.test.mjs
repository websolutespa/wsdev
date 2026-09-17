/**
 * Tests for classifier.mjs — collection classifier / mapper.
 * A small in-memory fixture covers every collection type; the assertions prove
 * the session rules (1:1 hex colours, alpha overlays, quarantine, theme
 * emit/skip/verify, responsive split) AND that classification is lossless.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { classify } from '../scripts/lib/classifier.mjs';

const leaf = (path, o = {}) => ({
  path,
  key: path.join('/'),
  kind: o.kind ?? 'color',
  hex: o.hex ?? null,
  alpha: o.alpha ?? 1,
  num: o.num ?? null,
  str: o.str ?? null,
  alias: o.alias ?? null,
});
const file = (collection, json, leaves) => ({
  file: `${collection}.tokens.json`,
  abs: `/${collection}`,
  collection,
  json,
  leaves,
  consumed: new Set(),
  entries: [],
});

/** Build the 7 collection files the classifier needs. */
function buildFixture() {
  return [
    file('primitives', {}, [
      leaf(['Color Palette', 'Cyan', '500'], { hex: '#0060C8' }),
      leaf(['Color Palette', 'Cyan', '900-base'], { hex: '#001A33' }),
      leaf(['Color Palette', 'Blue', '600'], { hex: '#008EFF' }),
    ]),
    file('tailwind', {}, [
      leaf(['tailwind colors', 'red', '700'], { hex: '#B91C1C' }),
      leaf(['tailwind spacing', '4'], { kind: 'number', num: 16 }),
    ]),
    file('mode-light', {}, [
      leaf(['base', 'primary'], { hex: '#0060C8' }),
      leaf(['base', 'destructive'], { hex: '#B91C1C' }),
      leaf(['alpha', '50'], { hex: '#FFFFFF', alpha: 0.5 }),
      leaf(['custom', 'My Weird Token'], { hex: '#123456' }),
    ]),
    file('mode-dark', {}, [leaf(['base', 'primary'], { hex: '#0060C8' })]),
    file(
      'theme',
      {
        shadow: {
          sm: {
            'offset-x': { $value: 0 },
            'offset-y': { $value: 1 },
            'blur-radius': { $value: 2 },
            'spread-radius': { $value: 0 },
            color: { $value: { hex: '#000000', alpha: 0.05 } },
          },
        },
      },
      [
        leaf(['colors', 'primary'], { hex: '#0060C8' }),
        leaf(['shadow', 'sm', 'offset-x'], { kind: 'number', num: 0 }),
        leaf(['radius', 'lg'], { kind: 'number', num: 8 }),
        leaf(['font', 'sans'], { kind: 'string', str: 'Noto Sans' }),
      ],
    ),
    file(
      'custom-mobile',
      {
        'heading-xl': { 'font-size': { $value: 48 } },
        text: { xs: { 'font-size': { $value: 12 } } },
      },
      [
        leaf(['container-padding-x'], { kind: 'number', num: 16 }),
        leaf(['heading-xl', 'font-size'], { kind: 'number', num: 48 }),
        leaf(['heading-xl', 'line-height'], { kind: 'number', num: 56 }),
        leaf(['heading-xl', 'font-weight'], { kind: 'number', num: 700 }),
        leaf(['heading-xl', 'letter-spacing'], { kind: 'number', num: -1.2 }),
        leaf(['heading-xl', 'font-family'], { kind: 'string', str: 'Noto Sans' }),
        // 3-level typographic path (this Figma kit's "Responsive" collection)
        leaf(['text', 'xs', 'font-size'], { kind: 'number', num: 12 }),
        leaf(['text', 'xs', 'line-height'], { kind: 'number', num: 16 }),
        leaf(['text', 'xs', 'letter-spacing'], { kind: 'number', num: -0.24 }),
        // 2-level numeric path with a redundant repeated prefix
        leaf(['spacing', 'spacing-xs'], { kind: 'number', num: 4 }),
      ],
    ),
    file('custom-desktop', {}, [
      leaf(['container-padding-x'], { kind: 'number', num: 24 }),
      leaf(['spacing', 'spacing-xs'], { kind: 'number', num: 8 }),
    ]),
  ];
}

test('classification is lossless — every leaf classified, no warnings', () => {
  const r = classify(buildFixture());
  assert.equal(r.unclassified.length, 0);
  assert.equal(r.totalClassified, r.totalLeaves);
  assert.equal(r.warnings.length, 0);
});

test('primitives — emitted as --color-<family>-<step> verbatim hex, -base dropped', () => {
  const r = classify(buildFixture());
  assert.match(r.blocks.primitives, /--color-cyan-500: #0060C8;/);
  assert.match(r.blocks.primitives, /--color-cyan-900: #001A33;/); // 900-base → 900
  assert.match(r.blocks.primitives, /--color-blue-600: #008EFF;/);
});

test('semantics — emitted as literal hex (no OKLCH, no var() resolution)', () => {
  const r = classify(buildFixture());
  assert.match(r.blocks['semantic-light'], /--primary: #0060C8;/);
  assert.match(r.blocks['semantic-light'], /--destructive: #B91C1C;/);
});

test('@theme color-map binds each semantic + alpha utility', () => {
  const r = classify(buildFixture());
  assert.match(r.blocks['color-map'], /--color-primary: var\(--primary\);/);
  assert.match(r.blocks['color-map'], /--color-ws-alpha-50: var\(--ws-alpha-50\);/);
});

test('alpha overlays → --ws-alpha-* as 8-digit hex', () => {
  const r = classify(buildFixture());
  assert.match(r.blocks['alpha-light'], /--ws-alpha-50: #FFFFFF80;/); // white @ 0.5
});

test('Mode/custom → verbatim quarantine (--ws-mc-*, hex, original name in comment)', () => {
  const r = classify(buildFixture());
  assert.equal(r.quarantine.light.length, 1);
  assert.equal(r.quarantine.light[0].name, '--ws-mc-my-weird-token');
  assert.match(r.quarantineCss, /--ws-mc-my-weird-token: #123456; \/\* Figma: custom\/My Weird Token/);
});

test('Theme — shadow emitted (exact alpha via rgb), colors skipped, radius/font verified', () => {
  const r = classify(buildFixture());
  assert.match(r.blocks['shadow-blur'], /--shadow-sm: 0 1px 2px 0 rgb\(0 0 0 \/ 0\.05\);/);
  const theme = r.files.find((f) => f.collection === 'theme');
  const dest = (k) => theme.entries.find((e) => e.key === k)?.dest;
  assert.equal(dest('colors/primary'), 'skipped:dup-of-Mode');
  assert.equal(dest('radius/lg'), 'verify:already-present(matches)');
  assert.equal(dest('font/sans'), 'verify:tailwind-default');
});

test('Custom — responsive mobile base + desktop md override; heading letter-spacing → em', () => {
  const r = classify(buildFixture());
  assert.match(r.blocks['responsive-base'], /--ws-container-padding-x: 1rem;/);
  assert.match(r.blocks['responsive-base'], /--ws-heading-xl-font-size: 3rem;/);
  assert.match(r.blocks['responsive-base'], /--ws-heading-xl-letter-spacing: -0\.025em;/); // -1.2 / 48
  assert.match(r.blocks['responsive-md'], /--ws-container-padding-x: 1\.5rem;/); // 24px desktop
});

test('Custom — 3-level typographic path (text/xs/font-size) → --ws-text-xs-<prop>', () => {
  const r = classify(buildFixture());
  assert.match(r.blocks['responsive-base'], /--ws-text-xs-font-size: 0\.75rem;/); // 12px
  assert.match(r.blocks['responsive-base'], /--ws-text-xs-line-height: 1rem;/); // 16px
  assert.match(r.blocks['responsive-base'], /--ws-text-xs-letter-spacing: -0\.02em;/); // -0.24 / 12
});

test('Custom — 2-level numeric path collapses a repeated prefix (spacing/spacing-xs → --ws-spacing-xs)', () => {
  const r = classify(buildFixture());
  assert.match(r.blocks['responsive-base'], /--ws-spacing-xs: 0\.25rem;/); // 4px mobile
  assert.match(r.blocks['responsive-md'], /--ws-spacing-xs: 0\.5rem;/); // 8px desktop
  assert.doesNotMatch(r.blocks['responsive-base'], /--ws-spacing-spacing-xs/); // no duplicated prefix
});

test('coverage gate — an unknown group is left unclassified (fails losslessness)', () => {
  const fixture = buildFixture();
  fixture
    .find((f) => f.collection === 'mode-light')
    .leaves.push(leaf(['mystery', 'thing'], { hex: '#abcdef' }));
  const r = classify(fixture);
  assert.equal(r.unclassified.length, 1);
  assert.match(r.unclassified[0], /mode-light: mystery\/thing/);
});

test('primitives — nested family under the collection root joins the middle segments', () => {
  const r = classify([
    file('primitives', {}, [
      leaf(['Brand', 'brand', 'blue', '800'], { hex: '#1e40af' }),
      leaf(['Brand', 'brand', 'orange', '600-base'], { hex: '#ea580c' }),
    ]),
  ]);
  assert.match(r.blocks.primitives, /--color-brand-blue-800: #1E40AF;/);
  assert.match(r.blocks.primitives, /--color-brand-orange-600: #EA580C;/);
});
