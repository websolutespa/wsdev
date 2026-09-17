/**
 * Tests for figma-color.mjs — the Figma {r,g,b,a} ⇄ CSS hex seam.
 * Proves the conversion is lossless at 8 bits in both directions and honours the
 * project's alpha contract (alpha ≥ 0.999 ⇒ opaque, drop the AA byte).
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { figmaColorToHex, hexToFigmaColor } from '../scripts/figma/figma-color.mjs';

test('figmaColorToHex — opaque colour → 6-digit hex, uppercased', () => {
  assert.equal(figmaColorToHex({ r: 0, g: 0.5607843, b: 0.7843137, a: 1 }), '#008FC8');
  assert.equal(figmaColorToHex({ r: 1, g: 1, b: 1 }), '#FFFFFF'); // a defaults to 1
  assert.equal(figmaColorToHex({ r: 0, g: 0, b: 0, a: 0.999 }), '#000000'); // ≥0.999 = opaque
});

test('figmaColorToHex — transparency → 8-digit #RRGGBBAA', () => {
  assert.equal(figmaColorToHex({ r: 1, g: 1, b: 1, a: 0.5 }), '#FFFFFF80'); // 127.5 → 128 → 80
  assert.equal(figmaColorToHex({ r: 0, g: 0, b: 0, a: 0.2 }), '#00000033'); // 51 → 33
});

test('figmaColorToHex — channels are rounded + clamped to 0–255', () => {
  assert.equal(figmaColorToHex({ r: 1.5, g: -0.2, b: 0.5, a: 1 }), '#FF0080'); // clamp + round(127.5)
});

test('hexToFigmaColor — 6-digit → {r,g,b,a:1}', () => {
  assert.deepEqual(hexToFigmaColor('#FF0000'), { r: 1, g: 0, b: 0, a: 1 });
  assert.deepEqual(hexToFigmaColor('#000000'), { r: 0, g: 0, b: 0, a: 1 });
});

test('hexToFigmaColor — 8-digit carries alpha; case-insensitive', () => {
  const c = hexToFigmaColor('#ffffff80');
  assert.equal(c.r, 1);
  assert.equal(c.a, 128 / 255);
});

test('hexToFigmaColor — rejects a non-hex string', () => {
  assert.throws(() => hexToFigmaColor('rgb(0,0,0)'), /not a hex colour/);
  assert.throws(() => hexToFigmaColor('#FFF'), /not a hex colour/); // 3-digit shorthand unsupported
});

test('round-trip hex → Figma → hex is the identity (opaque + 8-bit alpha)', () => {
  for (const hex of ['#0060C8', '#008EFF', '#B91C1C', '#FFFFFF', '#000000', '#F0CB2F80', '#00000033']) {
    assert.equal(figmaColorToHex(hexToFigmaColor(hex)), hex, hex);
  }
});

test('round-trip Figma → hex → Figma preserves channels within 8-bit precision', () => {
  const src = { r: 0.376, g: 0.6, b: 0.0392157, a: 1 };
  const back = hexToFigmaColor(figmaColorToHex(src));
  for (const ch of ['r', 'g', 'b']) assert.ok(Math.abs(back[ch] - src[ch]) <= 1 / 255, ch);
});
