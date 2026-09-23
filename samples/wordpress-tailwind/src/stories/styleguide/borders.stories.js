import { bindCopy, classBox } from './_helpers';

export default {
  title: 'Styleguide/Borders',
  parameters: { layout: 'fullscreen' },
};

const play = async ({ canvasElement }) => {
  bindCopy(canvasElement);
};

/* Multiplicative scale on --radius (0.625rem = 10px), per the kit comment in
   globals.css: xs ×0.2 · sm ×0.6 · md ×0.8 · lg ×1 · xl ×1.4 · 2xl ×1.8 · 3xl ×2.2 · 4xl ×2.6. */
const RADII = [
  { cls: 'rounded-none', label: '0' },
  { cls: 'rounded-xs',   label: '--radius × 0.2 = 2px' },
  { cls: 'rounded-sm',   label: '--radius × 0.6 = 6px' },
  { cls: 'rounded-md',   label: '--radius × 0.8 = 8px' },
  { cls: 'rounded-lg',   label: '--radius × 1 = 10px (base)' },
  { cls: 'rounded-xl',   label: '--radius × 1.4 = 14px' },
  { cls: 'rounded-2xl',  label: '--radius × 1.8 = 18px' },
  { cls: 'rounded-3xl',  label: '--radius × 2.2 = 22px' },
  { cls: 'rounded-4xl',  label: '--radius × 2.6 = 26px' },
  { cls: 'rounded-full', label: '9999px' },
];

const WIDTHS = [
  { cls: 'border-0', label: '0px' },
  { cls: 'border',   label: '1px (default)' },
  { cls: 'border-2', label: '2px' },
  { cls: 'border-4', label: '4px' },
  { cls: 'border-8', label: '8px' },
];

const COLORS = [
  { cls: 'border-border',      label: 'var(--border)' },
  { cls: 'border-primary',     label: 'var(--primary)' },
  { cls: 'border-secondary',   label: 'var(--secondary)' },
  { cls: 'border-accent',      label: 'var(--accent)' },
  { cls: 'border-destructive', label: 'var(--destructive)' },
  { cls: 'border-muted',       label: 'var(--muted)' },
  { cls: 'border-input',       label: 'var(--input)' },
];

function tile(cls, label, previewHtml) {
  return `
    <div class="space-y-3 rounded-lg border border-border bg-card p-4">
      <div class="flex h-16 items-center justify-center">${previewHtml}</div>
      <div>
        <div class="text-sm font-medium text-card-foreground">${cls}</div>
        <div class="mt-0.5 text-xs text-muted-foreground">${label}</div>
      </div>
      ${classBox(cls)}
    </div>`;
}

export const RadiusScale = {
  name: 'Radius Scale',
  render: () => `
    <div class="space-y-6 p-6">
      <div>
        <h2 class="text-xl font-semibold text-foreground">Border radius</h2>
        <p class="mt-1 text-sm text-muted-foreground">
          Scala di arrotondamento moltiplicativa su
          <code class="rounded bg-muted px-1 text-xs">--radius</code> (0.625rem) — la base per tutti
          i componenti. A differenza dei valori di default shadcn/ui, qui ogni step è un multiplo
          esplicito di <code class="rounded bg-muted px-1 text-xs">--radius</code> (vedi
          <code class="rounded bg-muted px-1 text-xs">globals.css</code>, blocco radius scale).
        </p>
      </div>
      <div class="grid grid-cols-2 gap-4 sm:grid-cols-4">
        ${RADII.map((r) =>
    tile(r.cls, r.label, `<div class="${r.cls} h-14 w-14 bg-primary"></div>`)
  ).join('')}
      </div>
    </div>`,
  play,
};

export const WidthAndColor = {
  name: 'Width & Color',
  render: () => `
    <div class="space-y-10 p-6">
      <section class="space-y-4">
        <h2 class="text-xl font-semibold text-foreground">Border widths</h2>
        <div class="grid grid-cols-2 gap-4 sm:grid-cols-5">
          ${WIDTHS.map((w) =>
    tile(w.cls, w.label, `<div class="${w.cls} border-foreground h-14 w-14 rounded-lg bg-card"></div>`)
  ).join('')}
        </div>
      </section>
      <section class="space-y-4">
        <h2 class="text-xl font-semibold text-foreground">Border token colors</h2>
        <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          ${COLORS.map((c) =>
    tile(c.cls, c.label, `<div class="${c.cls} h-14 w-full rounded-lg border-4 bg-card"></div>`)
  ).join('')}
        </div>
      </section>
    </div>`,
  play,
};
