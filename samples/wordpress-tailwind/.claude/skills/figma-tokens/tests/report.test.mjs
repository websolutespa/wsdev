/**
 * Tests for report.mjs — the code→Figma divergence report formatter.
 * Pure string output: assert the 3 groups render, both sides show, missing fields
 * fall back to the em-dash, pipes are escaped, and empty groups say "_none_".
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderDivergenceReport } from '../scripts/figma/report.mjs';

const sample = {
  diverging: [
    {
      token: '--primary',
      code: { file: 'globals.css', selector: ':root', value: '#0060C8' },
      figma: { collection: 'Mode', mode: 'Light', path: 'base/primary', value: '#0F9173' },
    },
  ],
  aligned: [
    {
      token: '--background',
      code: { file: 'globals.css', selector: ':root', value: '#FFFFFF' },
      figma: { collection: 'Mode', mode: 'Light', path: 'base/background', value: '#FFFFFF' },
    },
  ],
  aliasSkip: [
    {
      token: '--ring',
      code: { file: 'globals.css', selector: ':root', value: '#0060C8' },
      figma: { collection: 'Mode', mode: 'Light', path: 'base/ring', value: '→ alias' },
    },
  ],
};

test('renders the three group headings + summary counts', () => {
  const md = renderDivergenceReport(sample);
  assert.match(md, /# code → Figma — divergence report/);
  assert.match(md, /## ⚠️ Diverging/);
  assert.match(md, /## ✓ Aligned/);
  assert.match(md, /## 🔒 Alias-skip/);
  assert.match(md, /Summary: ⚠️ 1 diverging · ✓ 1 aligned · 🔒 1 alias-skip/);
});

test('shows both sides for an entry (code value + figma value)', () => {
  const md = renderDivergenceReport(sample);
  assert.match(md, /`--primary`/);
  assert.match(md, /`#0060C8`/); // code side
  assert.match(md, /`#0F9173`/); // figma side
  assert.match(md, /`base\/primary`/);
});

test('empty groups render "_none_", not an empty table', () => {
  const md = renderDivergenceReport({ diverging: [], aligned: [], aliasSkip: [] });
  assert.match(md, /## ⚠️ Diverging[\s\S]*?_none_/);
  assert.match(md, /Summary: ⚠️ 0 diverging · ✓ 0 aligned · 🔒 0 alias-skip/);
  assert.doesNotMatch(md, /\| Token \|/); // no table headers when all empty
});

test('missing fields fall back to the em-dash placeholder', () => {
  const md = renderDivergenceReport({ diverging: [{ token: '--x' }] });
  assert.match(md, /`--x` \| — · — · — \| — · — · — · — \|/);
});

test('pipes in a value are escaped so the table row survives', () => {
  const md = renderDivergenceReport({
    diverging: [{ token: '--grad', code: { value: 'a | b' }, figma: {} }],
  });
  assert.match(md, /a \\\| b/);
});

test('optional meta (fileKey / transport / generated) is included when given', () => {
  const md = renderDivergenceReport(sample, { fileKey: 'ABC123', mode: 'MCP', generated: '2026-06-24' });
  assert.match(md, /Figma file: `ABC123`/);
  assert.match(md, /Transport: MCP/);
  assert.match(md, /Generated: 2026-06-24/);
});
