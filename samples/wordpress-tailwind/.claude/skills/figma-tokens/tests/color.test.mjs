/**
 * Tests for color.mjs — 1:1 hex formatting + value helpers.
 * Colours are emitted verbatim from the JSON; transparency → 8-digit hex.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { px, pxToRem, round, slug, toCssColor } from '../scripts/lib/color.mjs';

test('toCssColor — opaque colour stays 6-digit hex, uppercased verbatim', () => {
  assert.equal(toCssColor('#008EFF'), '#008EFF');
  assert.equal(toCssColor('#26d5ff'), '#26D5FF');
  assert.equal(toCssColor('#FFFFFF', 1), '#FFFFFF');
  assert.equal(toCssColor('#0060C8', 0.999), '#0060C8'); // ≥0.999 treated as opaque
});

test('toCssColor — transparency → 8-digit #RRGGBBAA (AA = round(alpha·255))', () => {
  assert.equal(toCssColor('#FFFFFF', 0.5), '#FFFFFF80'); // 127.5 → 128 → 80
  assert.equal(toCssColor('#FFFFFF', 0.4), '#FFFFFF66'); // 102 → 66 (exact)
  assert.equal(toCssColor('#008EFF', 0.2), '#008EFF33'); // 51 → 33 (exact)
  assert.equal(toCssColor('#F0CB2F', 0.3), '#F0CB2F4D'); // 76.5 → 77 → 4D
});

test('round — 3 decimals, trailing zeros dropped', () => {
  assert.equal(round(0.5), 0.5);
  assert.equal(round(0.05), 0.05);
  assert.equal(round(0.123456), 0.123);
});

test('px / pxToRem — 0 stays bare, otherwise unit suffix', () => {
  assert.equal(px(0), '0');
  assert.equal(px(16), '16px');
  assert.equal(pxToRem(0), '0');
  assert.equal(pxToRem(24), '1.5rem');
  assert.equal(pxToRem(16), '1rem');
});

test('slug — lowercase, collapse non-alnum, trim hyphens', () => {
  assert.equal(slug('Cyan'), 'cyan');
  assert.equal(slug('Light Blue'), 'light-blue');
  assert.equal(slug('3. Mode / Light'), '3-mode-light');
});

test('toCssColor — 8-digit hex already carrying alpha is returned as-is (no double suffix)', () => {
  assert.equal(toCssColor('#fffffff2', 0.95), '#FFFFFFF2');
  assert.equal(toCssColor('#0A0A0AF2', 0.95), '#0A0A0AF2');
});
