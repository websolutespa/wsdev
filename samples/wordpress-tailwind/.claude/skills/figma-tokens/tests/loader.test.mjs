/**
 * Tests for loader.mjs — collection routing (`collectionOf`) + the pure leaf-flattening
 * helper (`leaves`). Covers the pre-existing rules (kept from the area-broker copy) and
 * the routing added for this Figma kit's collection names (Brand, Responsive).
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { collectionOf, leaves } from '../scripts/lib/loader.mjs';

test('collectionOf — pre-existing rules still route by their original folder names', () => {
  assert.equal(collectionOf('0. TailwindCSS/TailwindCSS.tokens.json'), 'tailwind');
  assert.equal(collectionOf('2. Color Palette/Color Palette.tokens.json'), 'primitives');
  assert.equal(collectionOf('2. Theme/Theme.tokens.json'), 'theme');
  assert.equal(collectionOf('3. Mode/Light.tokens.json'), 'mode-light');
  assert.equal(collectionOf('3. Mode/Dark.tokens.json'), 'mode-dark');
  assert.equal(collectionOf('4. Custom/Desktop.tokens.json'), 'custom-desktop');
  assert.equal(collectionOf('4. Custom/Mobile.tokens.json'), 'custom-mobile');
});

test('collectionOf — this kit\'s Brand collection routes to primitives', () => {
  assert.equal(collectionOf('1. Brand/Brand.tokens.json'), 'primitives');
});

test('collectionOf — this kit\'s Responsive collection routes to custom-desktop/custom-mobile', () => {
  assert.equal(collectionOf('4. Responsive/Desktop.tokens.json'), 'custom-desktop');
  assert.equal(collectionOf('4. Responsive/Mobile.tokens.json'), 'custom-mobile');
});

test('collectionOf — an unrecognised file falls back to "unknown"', () => {
  assert.equal(collectionOf('9. Icon Library/Icon Library.tokens.json'), 'unknown');
});

test('leaves — flattens a color, number, string, and alias leaf', () => {
  const out = [];
  leaves(
    {
      base: { foreground: { $value: { hex: '#111111', alpha: 1 } } },
      spacing: { xs: { $value: 4 } },
      font: { sans: { $value: 'DM Sans' } },
      alias: { role: { $value: '{base.foreground}' } },
    },
    [],
    out,
  );
  const byKey = Object.fromEntries(out.map((l) => [l.key, l]));
  assert.equal(byKey['base/foreground'].kind, 'color');
  assert.equal(byKey['base/foreground'].hex, '#111111');
  assert.equal(byKey['spacing/xs'].kind, 'number');
  assert.equal(byKey['spacing/xs'].num, 4);
  assert.equal(byKey['font/sans'].kind, 'string');
  assert.equal(byKey['font/sans'].str, 'DM Sans');
  assert.equal(byKey['alias/role'].kind, 'alias');
  assert.equal(byKey['alias/role'].alias, '{base.foreground}');
});
