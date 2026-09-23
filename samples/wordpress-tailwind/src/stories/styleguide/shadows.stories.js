import { bindCopy, classBox } from './_helpers';

export default {
  title: 'Styleguide/Shadows',
  parameters: { layout: 'fullscreen' },
};

const play = async ({ canvasElement }) => {
  bindCopy(canvasElement);
};

const SHADOWS = [
  { cls: 'shadow-none', label: 'Nessuna ombra' },
  { cls: 'shadow-2xs',  label: '0 1px · 5%' },
  { cls: 'shadow-xs',   label: '0 1px 2px · 5%' },
  { cls: 'shadow-sm',   label: '2 layer · 10% — campi input' },
  { cls: 'shadow-md',   label: '2 layer · 10% — popover' },
  { cls: 'shadow-lg',   label: '2 layer · 10% — dialog' },
  { cls: 'shadow-xl',   label: '2 layer · 10%' },
  { cls: 'shadow-2xl',  label: '0 25px 50px · 25%' },
];

/* Inset shadows — box-shadow inset. Utility inset-shadow-*, var --inset-shadow-*
   imported from the Figma "Theme" collection. */
const INSET_SHADOWS = [
  { cls: 'inset-shadow-2xs', label: 'inset 0 1px · 5%' },
  { cls: 'inset-shadow-xs',  label: 'inset 0 1px 1px · 5%' },
  { cls: 'inset-shadow-sm',  label: 'inset 0 2px 4px · 5%' },
];

/* Drop shadow — filter drop-shadow(), follows the element's shape/alpha.
   Utility drop-shadow-*, var --drop-shadow-* imported from Figma "Theme". */
const DROP_SHADOWS = [
  { cls: 'drop-shadow-xs',  label: '0 1px 1px · 5%' },
  { cls: 'drop-shadow-sm',  label: '0 1px 2px · 15%' },
  { cls: 'drop-shadow-md',  label: '0 3px 3px · 12%' },
  { cls: 'drop-shadow-lg',  label: '0 4px 4px · 15%' },
  { cls: 'drop-shadow-xl',  label: '0 9px 7px · 10%' },
  { cls: 'drop-shadow-2xl', label: '0 25px 25px · 15%' },
];

const BLURS = [
  { cls: 'blur-xs',  label: '4px' },
  { cls: 'blur-sm',  label: '8px' },
  { cls: 'blur-md',  label: '12px' },
  { cls: 'blur-lg',  label: '16px' },
  { cls: 'blur-xl',  label: '24px' },
  { cls: 'blur-2xl', label: '40px' },
  { cls: 'blur-3xl', label: '64px' },
];

function shadowTile(cls, label) {
  return `
    <div class="space-y-3 rounded-lg border border-border bg-card p-4">
      <div class="flex h-20 items-center justify-center">
        <div class="${cls} h-14 w-28 rounded-lg border border-border bg-card"></div>
      </div>
      <div>
        <div class="text-sm font-medium text-card-foreground">${cls}</div>
        <div class="mt-0.5 text-xs text-muted-foreground">${label}</div>
      </div>
      ${classBox(cls)}
    </div>`;
}

function blurTile(cls, label) {
  return `
    <div class="space-y-3 rounded-lg border border-border bg-card p-4">
      <div class="flex h-20 items-center justify-center">
        <div
          class="${cls} h-14 w-14 rounded-lg"
          style="background:linear-gradient(135deg,var(--primary),var(--destructive))"
        ></div>
      </div>
      <div>
        <div class="text-sm font-medium text-card-foreground">${cls}</div>
        <div class="mt-0.5 text-xs text-muted-foreground">${label}</div>
      </div>
      ${classBox(cls)}
    </div>`;
}

export const Elevation = {
  render: () => `
    <div class="space-y-6 p-6">
      <div>
        <h2 class="text-xl font-semibold text-foreground">Elevation (box-shadow)</h2>
        <p class="mt-1 text-sm text-muted-foreground">
          Scala shadow importata da Figma "Theme". Convenzione: campi →
          <code class="rounded bg-muted px-1 text-xs">shadow-xs</code>, card →
          <code class="rounded bg-muted px-1 text-xs">shadow-sm</code>, popover →
          <code class="rounded bg-muted px-1 text-xs">shadow-md</code>, dialog →
          <code class="rounded bg-muted px-1 text-xs">shadow-lg</code>.
        </p>
      </div>
      <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        ${SHADOWS.map((s) => shadowTile(s.cls, s.label)).join('')}
      </div>
    </div>`,
  play,
};

export const InsetShadow = {
  name: 'Inset Shadow',
  render: () => `
    <div class="space-y-6 p-6">
      <div>
        <h2 class="text-xl font-semibold text-foreground">Inset shadow</h2>
        <p class="mt-1 text-sm text-muted-foreground">
          Ombre interne (<code class="rounded bg-muted px-1 text-xs">inset-shadow-*</code>) — utili per
          incassare campi, well e superfici premute. Var <code class="rounded bg-muted px-1 text-xs">--inset-shadow-*</code>
          importate dalla collezione Figma "Theme".
        </p>
      </div>
      <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        ${INSET_SHADOWS.map((s) => shadowTile(s.cls, s.label)).join('')}
      </div>
    </div>`,
  play,
};

export const DropShadow = {
  name: 'Drop Shadow',
  render: () => `
    <div class="space-y-6 p-6">
      <div>
        <h2 class="text-xl font-semibold text-foreground">Drop shadow</h2>
        <p class="mt-1 text-sm text-muted-foreground">
          Ombre via <code class="rounded bg-muted px-1 text-xs">filter: drop-shadow()</code>
          (<code class="rounded bg-muted px-1 text-xs">drop-shadow-*</code>): seguono la forma e la
          trasparenza dell'elemento (icone, PNG, forme). Var
          <code class="rounded bg-muted px-1 text-xs">--drop-shadow-*</code> importate da Figma "Theme".
        </p>
      </div>
      <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        ${DROP_SHADOWS.map((s) => shadowTile(s.cls, s.label)).join('')}
      </div>
    </div>`,
  play,
};

export const Blur = {
  render: () => `
    <div class="space-y-6 p-6">
      <div>
        <h2 class="text-xl font-semibold text-foreground">Blur</h2>
        <p class="mt-1 text-sm text-muted-foreground">
          Scala blur — <code class="rounded bg-muted px-1 text-xs">blur-*</code>.
          Usato per backdrop, glass effect, placeholder. Il gradiente mostra la translucenza.
        </p>
      </div>
      <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        ${BLURS.map((b) => blurTile(b.cls, b.label)).join('')}
      </div>
    </div>`,
  play,
};
