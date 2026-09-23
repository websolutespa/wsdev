import { bindCopy, classBox, contrastVsWhite, relLuminance, resolveRgb, toHex } from './_helpers';

export default {
  title: 'Styleguide/Palette',
  parameters: { layout: 'fullscreen' },
};

const SEMANTIC_GROUPS = [
  {
    label: 'Surfaces',
    tokens: ['background', 'foreground', 'card', 'card-foreground', 'popover', 'popover-foreground'],
  },
  {
    label: 'Actions',
    tokens: ['primary', 'primary-foreground', 'secondary', 'secondary-foreground', 'accent', 'accent-foreground'],
  },
  {
    label: 'Muted & Destructive',
    tokens: ['muted', 'muted-foreground', 'destructive', 'destructive-foreground'],
  },
  {
    label: 'Borders & Rings',
    tokens: ['border', 'input', 'ring', 'ring-offset'],
  },
  {
    label: 'Chart',
    tokens: ['chart-1', 'chart-2', 'chart-3', 'chart-4', 'chart-5'],
  },
  {
    label: 'Sidebar',
    tokens: [
      'sidebar', 'sidebar-foreground',
      'sidebar-primary', 'sidebar-primary-foreground',
      'sidebar-accent', 'sidebar-accent-foreground',
      'sidebar-border', 'sidebar-ring',
    ],
  },
];

function swatchCard(token) {
  return `
    <div class="overflow-hidden rounded-lg border border-border">
      <div class="h-14 border-b border-border" style="background:var(--${token})" data-swatch></div>
      <div class="space-y-1 bg-card p-3">
        <div class="truncate text-sm font-medium text-card-foreground">${token}</div>
        <code class="block truncate font-mono text-xs text-foreground" data-hex>…</code>
        ${classBox(`--${token}`)}
      </div>
    </div>`;
}

export const SemanticColors = {
  name: 'Semantic Colors',
  render: () => `
    <div class="space-y-8 p-6">
      <div>
        <h2 class="text-xl font-semibold text-foreground">Semantic colors</h2>
        <p class="mt-1 max-w-2xl text-sm text-muted-foreground">
          Tutti i design token del progetto. I valori sono letti live dal DOM e si invertono attivando il tema dark.
          Usa sempre <code class="rounded bg-muted px-1 text-xs">bg-*</code> / <code class="rounded bg-muted px-1 text-xs">text-*</code> — mai colori hardcoded.
        </p>
      </div>
      ${SEMANTIC_GROUPS.map((g) => `
        <section class="space-y-3">
          <h3 class="text-sm font-semibold text-foreground">${g.label}</h3>
          <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            ${g.tokens.map(swatchCard).join('')}
          </div>
        </section>
      `).join('')}
    </div>`,
  play: async ({ canvasElement }) => {
    bindCopy(canvasElement);
    const update = () => {
      canvasElement.querySelectorAll('[data-swatch]').forEach((sw) => {
        const rgb = resolveRgb(getComputedStyle(sw).backgroundColor);
        const hexEl = sw.parentElement.querySelector('[data-hex]');
        if (hexEl) hexEl.textContent = rgb ? toHex(rgb) : '—';
      });
    };
    update();
    const obs = new MutationObserver(update);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  },
};

/* ───────────────────────────────────────────────────────────────────────────
   Alpha Overlays — semi-transparent veils `--ws-alpha-5…90` (utility
   bg-ws-alpha-*). White in light, near-black (#0A0A0A) in dark: they invert
   with the theme. Shown on a checkerboard to make the transparency visible;
   the 8-digit hex is read live.
   ─────────────────────────────────────────────────────────────────────────── */

const ALPHA_STEPS = [5, 10, 20, 30, 40, 50, 60, 70, 80, 90];

function alphaSwatchCard(step) {
  const token = `ws-alpha-${step}`;
  return `
    <div class="overflow-hidden rounded-lg border border-border">
      <div class="relative h-14 border-b border-border" style="background:repeating-conic-gradient(#d4d4d4 0 25%, #ffffff 0 50%) 0 0 / 16px 16px">
        <div class="absolute inset-0" style="background:var(--${token})" data-alpha-swatch></div>
      </div>
      <div class="space-y-1 bg-card p-3">
        <div class="truncate text-sm font-medium text-card-foreground">${token}</div>
        <code class="block truncate font-mono text-xs text-foreground" data-hex>…</code>
        ${classBox(`bg-${token}`)}
      </div>
    </div>`;
}

export const AlphaOverlays = {
  name: 'Alpha Overlays',
  render: () => `
    <div class="space-y-4 p-6">
      <div>
        <h2 class="text-xl font-semibold text-foreground">Alpha overlays</h2>
        <p class="mt-1 max-w-2xl text-sm text-muted-foreground">
          Veli semitrasparenti <code class="rounded bg-muted px-1 text-xs">--ws-alpha-5…90</code>
          (utility <code class="rounded bg-muted px-1 text-xs">bg-ws-alpha-*</code>), importati dalla
          collezione Figma "Mode → alpha". Bianchi in light, quasi-neri in dark: si invertono attivando il tema.
          Sono resi su una scacchiera per mostrare la trasparenza; l'hex 8-digit è letto live dal DOM.
        </p>
      </div>
      <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        ${ALPHA_STEPS.map(alphaSwatchCard).join('')}
      </div>
    </div>`,
  play: async ({ canvasElement }) => {
    bindCopy(canvasElement);
    const toHex8 = (color) => {
      const m = color.match(/^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,\s/]+([\d.]+))?/i);
      if (!m) return '—';
      const h = (n) => Math.round(+n).toString(16).padStart(2, '0');
      const a = m[4] === undefined ? 1 : +m[4];
      const aa = a >= 0.999 ? '' : Math.round(a * 255).toString(16).padStart(2, '0');
      return `#${h(m[1])}${h(m[2])}${h(m[3])}${aa}`.toUpperCase();
    };
    const update = () => {
      canvasElement.querySelectorAll('[data-alpha-swatch]').forEach((sw) => {
        const card = sw.closest('.overflow-hidden');
        const hexEl = card?.querySelector('[data-hex]');
        if (hexEl) hexEl.textContent = toHex8(getComputedStyle(sw).backgroundColor);
      });
    };
    update();
    const obs = new MutationObserver(update);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  },
};

/* ───────────────────────────────────────────────────────────────────────────
   Tailwind Palette — the full Tailwind v4 default palette. Swatches use
   bg-<hue>-<step>, classes built dynamically and force-generated via
   @source inline in .storybook/preview.css (Storybook only, not in production).
   Hex/rgb are resolved live from the DOM in play(); the header badge is the
   WCAG contrast of white text on the 500 shade.
   ─────────────────────────────────────────────────────────────────────────── */

const TW_HUES = [
  'red', 'orange', 'amber', 'yellow', 'lime', 'green', 'emerald', 'teal', 'cyan', 'sky', 'blue',
  'indigo', 'violet', 'purple', 'fuchsia', 'pink', 'rose', 'slate', 'gray', 'zinc', 'neutral', 'stone',
];
const TW_STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];

function colorScaleCard(hue, steps) {
  return `
    <div class="overflow-hidden rounded-lg border border-border bg-card" data-scale-card="${hue}">
      <div class="bg-${hue}-500 flex items-start justify-between gap-3 p-4 text-white">
        <div class="min-w-0">
          <div class="text-base font-semibold capitalize">${hue}</div>
          <div class="font-mono text-xs text-white/80" data-scale-default>Default: …</div>
        </div>
        <span class="rounded-md bg-white/20 px-2 py-0.5 text-xs font-medium whitespace-nowrap" data-scale-badge></span>
      </div>
      <table class="w-full border-collapse text-sm">
        <thead>
          <tr class="border-b border-border text-left">
            <th class="p-2 text-xs font-medium uppercase text-muted-foreground">Swatch</th>
            <th class="p-2 text-xs font-medium uppercase text-muted-foreground">Color info</th>
            <th class="p-2 text-xs font-medium uppercase text-muted-foreground">Classe CSS</th>
          </tr>
        </thead>
        <tbody>
          ${steps
    .map(
      (step) => `
            <tr class="border-b border-border align-middle last:border-0">
              <td class="p-2">
                <span data-step="${step}" class="bg-${hue}-${step} inline-flex rounded-md px-2 py-1 font-mono text-xs">${hue}-${step}</span>
              </td>
              <td class="p-2 font-mono text-xs">
                <div class="text-foreground" data-scale-info>…</div>
                <div class="text-muted-foreground">--color-${hue}-${step}</div>
              </td>
              <td class="p-2">${classBox(`bg-${hue}-${step}`)}</td>
            </tr>`
    )
    .join('')}
        </tbody>
      </table>
    </div>`;
}

/* ───────────────────────────────────────────────────────────────────────────
   Brand Palette — this project's own color scales, defined as PROJECT-OWNED
   primitives in globals.css (the "figma:primitives" seed zone). Same visual
   style as the Tailwind Palette. bg-<slug>-<step> classes are force-generated
   for Storybook via @source inline in .storybook/preview.css.
   Hex/rgb resolved live from the DOM; the badge is the WCAG contrast of white on `default`.
   ─────────────────────────────────────────────────────────────────────────── */

const BRAND_SCALES = [
  // `default`: the shade this scale is actually used at in the semantic tokens
  // (header + badge + highlighted row) — brand-blue-800 backs --primary (light),
  // brand-orange-400 backs --secondary (light).
  { name: 'Brand Blue', slug: 'brand-blue', default: 800, usage: 'Backs --primary (light)' },
  { name: 'Brand Orange', slug: 'brand-orange', default: 400, usage: 'Backs --secondary (light)' },
];

function brandScaleCard({ name, slug, default: defStep = 500, usage = '' }, steps) {
  return `
    <div class="overflow-hidden rounded-lg border border-border bg-card" data-scale-card="${slug}" data-default-step="${defStep}">
      <div class="bg-${slug}-${defStep} flex items-start justify-between gap-3 p-4 text-white">
        <div class="min-w-0">
          <div class="text-base font-semibold">${name}</div>
          ${usage ? `<div class="mt-0.5 text-xs text-white/90">${usage}</div>` : ''}
          <div class="mt-1 font-mono text-xs text-white/80" data-scale-default>Default: …</div>
        </div>
        <span class="rounded-md bg-white/20 px-2 py-0.5 text-xs font-medium whitespace-nowrap" data-scale-badge></span>
      </div>
      <table class="w-full border-collapse text-sm">
        <thead>
          <tr class="border-b border-border text-left">
            <th class="p-2 text-xs font-medium uppercase text-muted-foreground">Swatch</th>
            <th class="p-2 text-xs font-medium uppercase text-muted-foreground">Color info</th>
            <th class="p-2 text-xs font-medium uppercase text-muted-foreground">Classe CSS</th>
          </tr>
        </thead>
        <tbody>
          ${steps
    .map(
      (step) => `
            <tr class="border-b border-border align-middle last:border-0${step === defStep ? ' bg-muted/60' : ''}">
              <td class="p-2">
                <span data-step="${step}" class="bg-${slug}-${step} inline-flex rounded-md px-2 py-1 font-mono text-xs">${slug}-${step}</span>
                ${step === defStep ? '<span class="ml-2 inline-flex rounded bg-foreground px-1.5 py-0.5 align-middle text-[10px] font-semibold uppercase tracking-wide text-background">Default</span>' : ''}
              </td>
              <td class="p-2 font-mono text-xs">
                <div class="text-foreground" data-scale-info>…</div>
                <div class="text-muted-foreground">--color-${slug}-${step}</div>
              </td>
              <td class="p-2">${classBox(`bg-${slug}-${step}`)}</td>
            </tr>`
    )
    .join('')}
        </tbody>
      </table>
    </div>`;
}

/* This project has no dedicated off-white/surface token (unlike other kits) —
   the neutral scale is only the two native utilities. */
const NEUTRALS = [
  { name: 'White', cls: 'bg-white', hex: '#ffffff', note: 'Nativo · bg-white' },
  { name: 'Black', cls: 'bg-black', hex: '#000000', note: 'Nativo · bg-black' },
];

function neutralCard({ name, cls, hex, note }) {
  return `
    <div class="overflow-hidden rounded-lg border border-border bg-card">
      <div class="h-16 border-b border-border ${cls}"></div>
      <div class="space-y-1 p-3">
        <div class="text-sm font-medium text-card-foreground">${name}</div>
        <code class="block font-mono text-xs text-muted-foreground">${hex}</code>
        <div class="text-xs text-muted-foreground">${note}</div>
        <div class="pt-1">${classBox(cls)}</div>
      </div>
    </div>`;
}

export const BrandPalette = {
  name: 'Brand Palette',
  render: () => `
    <div class="space-y-4 p-6">
      <div>
        <h2 class="text-lg font-semibold text-foreground">Brand scales</h2>
        <p class="mt-1 max-w-3xl text-sm text-muted-foreground">
          Le scale di colore proprietarie del progetto — ${BRAND_SCALES.length} scale ·
          ${BRAND_SCALES.length * TW_STEPS.length} tonalità, disponibili come utility
          (<code class="rounded bg-muted px-1 text-xs">bg-*</code>,
          <code class="rounded bg-muted px-1 text-xs">text-*</code>,
          <code class="rounded bg-muted px-1 text-xs">border-*</code>).
          Definite come PROJECT-OWNED in <code class="rounded bg-muted px-1 text-xs">globals.css</code>
          (token <code class="rounded bg-muted px-1 text-xs">--color-&lt;slug&gt;-&lt;step&gt;</code>).
          La tonalità di <strong class="text-foreground">default</strong> di ogni scala è quella che
          alimenta i token semantici (evidenziata in tabella); il badge nell'header è il contrasto
          WCAG del testo bianco su di essa.
        </p>
      </div>
      <div class="grid grid-cols-1 gap-6 xl:grid-cols-2">
        ${BRAND_SCALES.map((scale) => brandScaleCard(scale, TW_STEPS)).join('')}
      </div>
      <section class="space-y-3 pt-2">
        <h3 class="text-sm font-semibold text-foreground">Neutrals</h3>
        <p class="max-w-3xl text-sm text-muted-foreground">
          Bianco e nero sono le utility native
          (<code class="rounded bg-muted px-1 text-xs">bg-white</code> /
          <code class="rounded bg-muted px-1 text-xs">bg-black</code>) — questo progetto non definisce
          un token off-white/surface dedicato.
        </p>
        <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          ${NEUTRALS.map(neutralCard).join('')}
        </div>
      </section>
    </div>`,
  play: async ({ canvasElement }) => {
    bindCopy(canvasElement);
    canvasElement.querySelectorAll('[data-scale-card]').forEach((card) => {
      const defStep = card.dataset.defaultStep || '500';
      let def = null;
      card.querySelectorAll('[data-step]').forEach((pill) => {
        const rgb = resolveRgb(getComputedStyle(pill).backgroundColor);
        if (!rgb) return;
        const hex = toHex(rgb);
        pill.classList.add(relLuminance(rgb) > 0.5 ? 'text-black' : 'text-white');
        const info = pill.closest('tr')?.querySelector('[data-scale-info]');
        if (info) info.textContent = `${hex} · rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
        if (pill.dataset.step === defStep) def = { rgb, hex };
      });
      if (!def) return;
      const defaultEl = card.querySelector('[data-scale-default]');
      if (defaultEl) {
        defaultEl.textContent = `Default (${defStep}): ${def.hex} · rgb(${def.rgb.r}, ${def.rgb.g}, ${def.rgb.b})`;
      }
      const badge = card.querySelector('[data-scale-badge]');
      if (badge) {
        const cr = contrastVsWhite(def.rgb);
        const level = cr >= 7 ? 'AAA' : cr >= 4.5 ? 'AA' : cr >= 3 ? 'AA Large' : 'Fail';
        badge.textContent = `${cr.toFixed(2)} ${level}`;
      }
    });
  },
};

export const TailwindPalette = {
  name: 'Tailwind Palette',
  render: () => `
    <div class="space-y-4 p-6">
      <div>
        <h2 class="text-lg font-semibold text-foreground">Color scales</h2>
        <p class="mt-1 max-w-3xl text-sm text-muted-foreground">
          La palette di default Tailwind v4 completa — ${TW_HUES.length} scale ·
          ${TW_HUES.length * TW_STEPS.length} tonalità, disponibili come utility
          (<code class="rounded bg-muted px-1 text-xs">bg-*</code>,
          <code class="rounded bg-muted px-1 text-xs">text-*</code>,
          <code class="rounded bg-muted px-1 text-xs">border-*</code>).
          <strong class="text-foreground">Non sono design token</strong>: preferisci i token
          semantici. Il badge nell'header è il contrasto WCAG del testo bianco sulla tonalità 500.
          Force-generate per questa story via <code class="rounded bg-muted px-1 text-xs">@source inline</code>
          in <code class="rounded bg-muted px-1 text-xs">.storybook/preview.css</code>.
          Sono disponibili anche <code class="rounded bg-muted px-1 text-xs">bg-black</code> /
          <code class="rounded bg-muted px-1 text-xs">bg-white</code>.
        </p>
      </div>
      <div class="grid grid-cols-1 gap-6 xl:grid-cols-2">
        ${TW_HUES.map((hue) => colorScaleCard(hue, TW_STEPS)).join('')}
      </div>
    </div>`,
  play: async ({ canvasElement }) => {
    bindCopy(canvasElement);
    canvasElement.querySelectorAll('[data-scale-card]').forEach((card) => {
      let def = null;
      card.querySelectorAll('[data-step]').forEach((pill) => {
        const rgb = resolveRgb(getComputedStyle(pill).backgroundColor);
        if (!rgb) return;
        const hex = toHex(rgb);
        pill.classList.add(relLuminance(rgb) > 0.5 ? 'text-black' : 'text-white');
        const info = pill.closest('tr')?.querySelector('[data-scale-info]');
        if (info) info.textContent = `${hex} · rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
        if (pill.dataset.step === '500') def = { rgb, hex };
      });
      if (!def) return;
      const defaultEl = card.querySelector('[data-scale-default]');
      if (defaultEl) {
        defaultEl.textContent = `Default: ${def.hex} · rgb(${def.rgb.r}, ${def.rgb.g}, ${def.rgb.b})`;
      }
      const badge = card.querySelector('[data-scale-badge]');
      if (badge) {
        const cr = contrastVsWhite(def.rgb);
        const level = cr >= 7 ? 'AAA' : cr >= 4.5 ? 'AA' : cr >= 3 ? 'AA Large' : 'Fail';
        badge.textContent = `${cr.toFixed(2)} ${level}`;
      }
    });
  },
};
