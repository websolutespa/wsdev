/**
 * color.mjs — value formatting (pure, deterministic).
 *
 * 1:1 with the Figma export: every colour is emitted as the EXACT hex declared in
 * the JSON — no OKLCH, no colour-space conversion, no transformation. Opaque
 * colours stay 6-digit `#RRGGBB`; transparency is expressed as 8-digit `#RRGGBBAA`
 * (the lossless-for-RGB way to carry alpha in a hex). Also exports the small
 * value/string helpers the importer shares (round, px, pxToRem, slug).
 */

/**
 * Figma colour {hex, alpha} → CSS hex, verbatim.
 * alpha ≥ 0.999 → `#RRGGBB`; alpha < 1 → `#RRGGBBAA` (AA = round(alpha·255)).
 */
export function toCssColor(hex, alpha = 1) {
  const base = hex.toUpperCase();
  // An 8-digit hex already carries its alpha (some exporters emit both): never append twice.
  if (base.length === 9 || alpha >= 0.999) return base;
  const aa = Math.round(Math.min(1, Math.max(0, alpha)) * 255)
    .toString(16)
    .padStart(2, '0')
    .toUpperCase();
  return base + aa;
}

/** Round to 3 decimals, dropping trailing zeros (used for shadow alpha). */
export const round = (n) => Number(n.toFixed(3));

/** px number → px string (0 stays bare `0`). */
export const px = (n) => (n === 0 ? '0' : `${Number(n.toFixed(3))}px`);

/** px number → rem string at 16px root (0 stays bare `0`). */
export const pxToRem = (n) => (n === 0 ? '0' : `${Number((n / 16).toFixed(4))}rem`);

/** Lowercase, collapse non-alphanumerics to single hyphens, trim edge hyphens. */
export const slug = (s) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
