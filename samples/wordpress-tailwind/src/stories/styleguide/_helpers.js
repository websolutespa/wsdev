/*
 * Shared helpers for the styleguide stories — mirrors stories/_helpers.tsx from the
 * design-system reference. Stories return HTML strings, so interactivity (copy-to-clipboard)
 * is wired in play() by calling bindCopy(canvasElement).
 *
 * Does not match main.ts's story glob, so it never becomes a story on its own.
 */

/** Clickable pill: copies the class to the clipboard (text feedback). */
export function classPill(cls) {
  return `<button type="button" data-copy="${cls}" aria-label="Copia ${cls}"
    class="inline-flex items-center rounded-md border border-border bg-muted/40 px-2 py-0.5 font-mono text-xs leading-5 text-foreground transition-colors hover:bg-muted">${cls}</button>`;
}

export function pillList(items) {
  return `<div class="flex flex-wrap gap-1">${items.map(classPill).join('')}</div>`;
}

/** Full-width "CSS class" box: class on the left, copy icon on the right. */
export function classBox(cls) {
  return `
    <button type="button" data-copy="${cls}" aria-label="Copia ${cls}"
      class="flex w-full items-center justify-between gap-2 rounded-md border border-border bg-muted/40 px-2 py-1.5 font-mono text-xs text-foreground transition-colors hover:bg-muted">
      <span class="truncate">${cls}</span>
      <svg class="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" focusable="false">
        <use data-copy-icon href="#icon-copy"></use>
      </svg>
    </button>`;
}

/**
 * Delegated listener for every [data-copy] in the story. Idempotent:
 * call it from play() on any story that uses classPill/classBox.
 */
export function bindCopy(canvasElement) {
  if (canvasElement.dataset.copyBound) return;
  canvasElement.dataset.copyBound = 'true';
  canvasElement.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-copy]');
    if (!btn || !canvasElement.contains(btn)) return;
    navigator.clipboard?.writeText(btn.dataset.copy).then(() => {
      const icon = btn.querySelector('[data-copy-icon]');
      if (icon) {
        icon.setAttribute('href', '#icon-check');
        setTimeout(() => icon.setAttribute('href', '#icon-copy'), 1200);
      } else {
        const original = btn.textContent;
        btn.textContent = '✓ copiato';
        setTimeout(() => {
          btn.textContent = original;
        }, 1200);
      }
    }, () => undefined);
  });
}

/* ───────────────────────────────────────────────────────────────────────────
   Live color resolution. Tokens are hex in this project's sources, but some
   Tailwind utilities (the default palette) are OKLCH — so the *rendered*
   swatch color is read and normalized to sRGB via a 1×1 canvas, which works
   for any color space and reflects the current light/dark theme.
   ─────────────────────────────────────────────────────────────────────────── */

export function resolveRgb(color) {
  if (typeof document === 'undefined' || !color) return null;
  const m = color.match(/^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/i);
  if (m) return { r: Math.round(+m[1]), g: Math.round(+m[2]), b: Math.round(+m[3]) };
  // Fallback: let the browser resolve any color space (oklch, color(), …).
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return null;
  ctx.fillStyle = '#000';
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 1, 1);
  const d = ctx.getImageData(0, 0, 1, 1).data;
  return { r: d[0], g: d[1], b: d[2] };
}

export function toHex({ r, g, b }) {
  const h = (n) => n.toString(16).padStart(2, '0');
  return `#${h(r)}${h(g)}${h(b)}`;
}

function channel(c) {
  const s = c / 255;
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

export function relLuminance({ r, g, b }) {
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

/** WCAG contrast ratio of a color against white (luminance 1). */
export function contrastVsWhite(rgb) {
  return 1.05 / (relLuminance(rgb) + 0.05);
}

/* ───────────────────────────────────────────────────────────────────────────
   Layout demo primitives. Tokens only — no arbitrary values. `cell` is the
   accent box used as a visual placeholder, `stage` frames a demo with a
   border, a title and the copyable class.
   ─────────────────────────────────────────────────────────────────────────── */

export function cell(content = '', cls = '') {
  return `<div class="inline-flex items-center justify-center rounded-sm border border-primary/30 bg-primary/10 px-3 py-2 text-center font-mono text-xs text-primary ${cls}">${content}</div>`;
}

export function stage({ title = '', cls = '', body }) {
  return `
    <div class="space-y-2">
      ${title ? `<h3 class="text-sm font-medium text-foreground">${title}</h3>` : ''}
      <div class="rounded-lg border border-border bg-card p-4">${body}</div>
      ${cls ? classBox(cls) : ''}
    </div>`;
}

export function sectionHeader(title, hint = '') {
  return `
    <header class="space-y-1">
      <h2 class="text-lg font-semibold text-foreground">${title}</h2>
      ${hint ? `<p class="text-sm text-muted-foreground">${hint}</p>` : ''}
    </header>`;
}

/**
 * Card with a brand header + a SAMPLE / DETAILS / CSS CLASS table.
 * Each row shows the live specimen and its copyable utility.
 * rows: [{ sample, details, cls }]
 */
export function utilityTableCard(title, rows) {
  return `
    <div class="overflow-hidden rounded-lg border border-border bg-card">
      <div class="bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground">${title}</div>
      <table class="w-full border-collapse text-sm">
        <thead>
          <tr class="border-b border-border bg-muted/40 text-left">
            <th class="p-3 text-xs font-medium uppercase text-muted-foreground">Sample</th>
            <th class="p-3 text-xs font-medium uppercase text-muted-foreground">Dettagli</th>
            <th class="w-56 p-3 text-xs font-medium uppercase text-muted-foreground">Classe CSS</th>
          </tr>
        </thead>
        <tbody>
          ${rows
    .map(
      (r) => `
            <tr class="border-b border-border align-middle last:border-0">
              <td class="max-w-xs overflow-hidden p-3">${r.sample}</td>
              <td class="p-3 text-xs text-muted-foreground">${r.details}</td>
              <td class="p-3">${classBox(r.cls)}</td>
            </tr>`
    )
    .join('')}
        </tbody>
      </table>
    </div>`;
}
