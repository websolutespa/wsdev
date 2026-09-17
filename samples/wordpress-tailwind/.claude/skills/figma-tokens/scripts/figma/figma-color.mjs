/**
 * figma-color.mjs — the lossless seam between Figma's Plugin-API colour shape
 * and the project's 1:1 CSS hex.
 *
 * Figma stores a COLOR variable value as `{ r, g, b, a }` with every channel a
 * float in 0–1 (see `figma/figma-variable-shape.md`). The project's canonical form
 * is verbatim 8-bit hex — `#RRGGBB`, or `#RRGGBBAA` when there's transparency
 * (no OKLCH, no colour-space conversion). This module is the ONLY place that
 * conversion lives, so `code-to-figma` (hex → Figma) and `figma-to-code`
 * (Figma → hex) round-trip exactly at 8 bits.
 *
 * The hex side reuses `lib/color.mjs#toCssColor` so the alpha contract
 * (alpha ≥ 0.999 ⇒ opaque, drop the AA byte) has a single source of truth.
 */
import { toCssColor } from '../lib/color.mjs';

const clamp01 = (n) => Math.min(1, Math.max(0, n));
/** float 0–1 → 8-bit channel 0–255 (round, clamped). */
const to8 = (n) => Math.round(clamp01(n) * 255);
/** 8-bit channel → 2-digit uppercase hex. */
const hex2 = (n) => n.toString(16).padStart(2, '0').toUpperCase();

/**
 * Figma COLOR `{ r, g, b, a }` (floats 0–1) → CSS hex, verbatim at 8-bit.
 * Missing `a` → opaque. a ≥ 0.999 → `#RRGGBB`; a < 0.999 → `#RRGGBBAA`.
 */
export function figmaColorToHex({ r, g, b, a = 1 }) {
  const baseHex = '#' + hex2(to8(r)) + hex2(to8(g)) + hex2(to8(b));
  return toCssColor(baseHex, a);
}

/**
 * CSS hex (`#RRGGBB` or `#RRGGBBAA`, any case) → Figma COLOR `{ r, g, b, a }`
 * (floats 0–1). A 6-digit hex → `a: 1`. Throws on a non-hex string.
 */
export function hexToFigmaColor(cssHex) {
  const v = String(cssHex).trim().toUpperCase();
  const m = /^#([0-9A-F]{2})([0-9A-F]{2})([0-9A-F]{2})([0-9A-F]{2})?$/.exec(v);
  if (!m) throw new Error(`not a hex colour: ${cssHex}`);
  return {
    r: parseInt(m[1], 16) / 255,
    g: parseInt(m[2], 16) / 255,
    b: parseInt(m[3], 16) / 255,
    a: m[4] !== undefined ? parseInt(m[4], 16) / 255 : 1,
  };
}
