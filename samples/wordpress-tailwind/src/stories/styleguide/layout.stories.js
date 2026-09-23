import { bindCopy, cell, classBox, pillList, sectionHeader, stage } from './_helpers';

export default {
  title: 'Styleguide/Layout',
  parameters: { layout: 'fullscreen' },
};

const play = async ({ canvasElement }) => {
  bindCopy(canvasElement);
};

const repeat = (n, html) => Array.from({ length: n }, () => html).join('');

/* ═══════════════════════════════════════════════════════════════════════════
   1. Spacing Scale — table with preview and copyable padding/margin utilities.
   Tailwind's default scale (globals.css leaves --spacing untouched).
   ═══════════════════════════════════════════════════════════════════════════ */

// `w` carries the literal `w-<key>` class so the preview bar renders at the
// token's real size (and Tailwind sees a static class string).
const SPACING = [
  { key: '0',   px: 0,   rem: '0',        w: 'w-0' },
  { key: '0.5', px: 2,   rem: '0.125rem', w: 'w-0.5' },
  { key: '1',   px: 4,   rem: '0.25rem',  w: 'w-1' },
  { key: '1.5', px: 6,   rem: '0.375rem', w: 'w-1.5' },
  { key: '2',   px: 8,   rem: '0.5rem',   w: 'w-2' },
  { key: '2.5', px: 10,  rem: '0.625rem', w: 'w-2.5' },
  { key: '3',   px: 12,  rem: '0.75rem',  w: 'w-3' },
  { key: '3.5', px: 14,  rem: '0.875rem', w: 'w-3.5' },
  { key: '4',   px: 16,  rem: '1rem',     w: 'w-4' },
  { key: '5',   px: 20,  rem: '1.25rem',  w: 'w-5' },
  { key: '6',   px: 24,  rem: '1.5rem',   w: 'w-6' },
  { key: '8',   px: 32,  rem: '2rem',     w: 'w-8' },
  { key: '10',  px: 40,  rem: '2.5rem',   w: 'w-10' },
  { key: '12',  px: 48,  rem: '3rem',     w: 'w-12' },
  { key: '16',  px: 64,  rem: '4rem',     w: 'w-16' },
  { key: '20',  px: 80,  rem: '5rem',     w: 'w-20' },
  { key: '24',  px: 96,  rem: '6rem',     w: 'w-24' },
  { key: '32',  px: 128, rem: '8rem',     w: 'w-32' },
];

const PADDING = ['p', 'px', 'py', 'pt', 'pb', 'ps', 'pe'];
const MARGIN = ['m', 'mx', 'my', 'mt', 'mb', 'ms', 'me'];

export const SpacingScale = {
  name: 'Spacing Scale',
  render: () => `
    <div class="p-6">
      <h2 class="mb-2 text-lg font-semibold text-foreground">Spacing scale</h2>
      <p class="mb-6 max-w-3xl text-sm text-muted-foreground">
        Scala Tailwind v4 — base 4px. Ogni chiave alimenta
        <code class="rounded bg-muted px-1 text-xs">p-*</code>,
        <code class="rounded bg-muted px-1 text-xs">m-*</code>,
        <code class="rounded bg-muted px-1 text-xs">gap-*</code>,
        <code class="rounded bg-muted px-1 text-xs">space-*</code>
        e le varianti per lato. Clicca una pill per copiarla.
      </p>
      <div class="overflow-hidden rounded-lg border border-border">
        <table class="w-full border-collapse text-sm">
          <thead>
            <tr class="border-b border-border bg-muted/40 text-left">
              <th class="p-3 text-xs font-medium uppercase text-muted-foreground">Key</th>
              <th class="p-3 text-xs font-medium uppercase text-muted-foreground">Value</th>
              <th class="p-3 text-xs font-medium uppercase text-muted-foreground">rem</th>
              <th class="w-1/6 p-3 text-xs font-medium uppercase text-muted-foreground">Preview</th>
              <th class="p-3 text-xs font-medium uppercase text-muted-foreground">Padding</th>
              <th class="p-3 text-xs font-medium uppercase text-muted-foreground">Margin</th>
            </tr>
          </thead>
          <tbody>
            ${SPACING.map(
    (s) => `
              <tr class="border-b border-border align-middle last:border-0">
                <td class="p-3">
                  <span class="inline-flex items-center rounded-md bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground">${s.key}</span>
                </td>
                <td class="p-3 font-mono text-muted-foreground">${s.px}px</td>
                <td class="p-3 font-mono text-muted-foreground">${s.rem}</td>
                <td class="p-3"><div class="${s.w} h-3 rounded-sm bg-primary/30"></div></td>
                <td class="p-3">${pillList(PADDING.map((p) => `${p}-${s.key}`))}</td>
                <td class="p-3">${pillList(MARGIN.map((m) => `${m}-${s.key}`))}</td>
              </tr>`
  ).join('')}
          </tbody>
        </table>
      </div>
    </div>`,
  play,
};

/* ═══════════════════════════════════════════════════════════════════════════
   2. Spacing Utilities — visual demos of padding, margin, gap, space-between
   ═══════════════════════════════════════════════════════════════════════════ */

const paddingDemo = (cls) =>
  stage({
    title: cls,
    cls,
    body: `<div class="inline-block rounded-sm border border-primary/30 bg-primary/10 ${cls}">
      <div class="h-6 w-32 rounded-xs bg-primary/30"></div>
    </div>`,
  });

export const SpacingUtilities = {
  name: 'Spacing Utilities',
  render: () => `
    <div class="space-y-10 p-6">
      ${sectionHeader(
    'Spacing utilities',
    'Demo visive di padding, margin, gap e space-between sugli stessi box accent. La dimensione si sceglie dalla Spacing Scale; qui si mostrano forma e direzione.'
  )}

      <section class="space-y-4">
        <h3 class="text-base font-semibold text-foreground">Padding · tutti i lati</h3>
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          ${['p-2', 'p-4', 'p-6', 'p-8'].map(paddingDemo).join('')}
        </div>
      </section>

      <section class="space-y-4">
        <h3 class="text-base font-semibold text-foreground">Padding · per asse e per lato</h3>
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          ${['px-6', 'py-6', 'pt-6', 'pb-6', 'ps-6', 'pe-6'].map(paddingDemo).join('')}
        </div>
      </section>

      <section class="space-y-4">
        <h3 class="text-base font-semibold text-foreground">Margin</h3>
        <p class="text-sm text-muted-foreground">
          La cornice tratteggiata è il parent — il box accent è il child che porta il margin.
        </p>
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          ${['m-4', 'mx-6', 'my-6', 'mt-6', 'mb-6', 'ms-6']
    .map(
      (cls) => `
            <div class="space-y-2">
              <h4 class="text-sm font-medium text-foreground">${cls}</h4>
              <div class="rounded-lg border-2 border-dashed border-border bg-card">
                ${cell('child', cls)}
              </div>
              ${classBox(cls)}
            </div>`
    )
    .join('')}
        </div>
      </section>

      <section class="space-y-4">
        <h3 class="text-base font-semibold text-foreground">Gap (dentro un parent flex/grid)</h3>
        <div class="grid gap-4 sm:grid-cols-2">
          ${['gap-2', 'gap-4', 'gap-6', 'gap-8']
    .map((cls) =>
      stage({
        title: cls,
        cls,
        body: `<div class="flex ${cls}">${cell('A')}${cell('B')}${cell('C')}${cell('D')}</div>`,
      })
    )
    .join('')}
        </div>
      </section>

      <section class="space-y-4">
        <h3 class="text-base font-semibold text-foreground">Space-between tra fratelli</h3>
        <p class="text-sm text-muted-foreground">
          <code class="rounded bg-muted px-1 text-xs">space-x-*</code> /
          <code class="rounded bg-muted px-1 text-xs">space-y-*</code> applicano margin a tutti i
          figli dopo il primo — utile quando il parent non è flex/grid.
        </p>
        <div class="grid gap-4 sm:grid-cols-2">
          ${stage({
    title: 'space-x-4',
    cls: 'space-x-4',
    body: `<div class="space-x-4">${cell('A')}${cell('B')}${cell('C')}</div>`,
  })}
          ${stage({
    title: 'space-y-3',
    cls: 'space-y-3',
    body: `<div class="space-y-3">${cell('A', 'block w-full')}${cell('B', 'block w-full')}${cell('C', 'block w-full')}</div>`,
  })}
        </div>
      </section>
    </div>`,
  play,
};

/* ═══════════════════════════════════════════════════════════════════════════
   3. WS Spacing Scale — this project's own responsive spacing tokens
   `--ws-spacing-xs…9xl`, exposed as `p-ws-*` / `gap-ws-*` / `m-ws-*` utilities
   (globals.css @theme inline). Mobile-first: values update from ≥768px. The
   underlying --ws-spacing-* custom properties are what's queryable live —
   the @theme-inline --spacing-ws-* keys only exist inlined into the utilities.
   ═══════════════════════════════════════════════════════════════════════════ */

const WS_SPACING = [
  { key: 'xs', desc: 'Spaziatura minima — tra elementi strettamente correlati' },
  { key: 'sm', desc: 'Spaziatura piccola' },
  { key: 'base', desc: 'Spaziatura di base' },
  { key: 'lg', desc: 'Spaziatura media' },
  { key: 'xl', desc: 'Spaziatura grande' },
  { key: '2xl', desc: 'Spaziatura extra-large' },
  { key: '3xl', desc: 'Gap tra blocchi' },
  { key: '4xl', desc: 'Gap tra sezioni interne' },
  { key: '5xl', desc: 'Gap tra sezioni' },
  { key: '6xl', desc: 'Gap ampio' },
  { key: '7xl', desc: 'Gap molto ampio' },
  { key: '8xl', desc: 'Gap massimo (flip a lg su desktop)' },
  { key: '9xl', desc: 'Gap massimo (flip a lg su desktop)' },
];

export const WsSpacingScale = {
  name: 'WS Spacing Scale',
  render: () => `
    <div class="space-y-4 p-6">
      <div>
        <h2 class="text-lg font-semibold text-foreground">WS spacing scale</h2>
        <p class="mt-1 max-w-3xl text-sm text-muted-foreground">
          Token di spaziatura responsive proprietari del progetto —
          <code class="rounded bg-muted px-1 text-xs">--ws-spacing-xs…9xl</code>, esposti dalle utility
          <code class="rounded bg-muted px-1 text-xs">p-ws-*</code> /
          <code class="rounded bg-muted px-1 text-xs">gap-ws-*</code> /
          <code class="rounded bg-muted px-1 text-xs">m-ws-*</code> — la scala <code class="rounded bg-muted px-1 text-xs">--spacing</code>
          nativa di Tailwind resta intatta. Mobile-first: i valori si aggiornano da
          <code class="rounded bg-muted px-1 text-xs">≥768px</code>. Il valore è letto live; la barra è
          larga quanto il token — ridimensiona il canvas per vedere il flip.
        </p>
      </div>
      <div class="overflow-hidden rounded-lg border border-border">
        <table class="w-full border-collapse text-sm">
          <thead>
            <tr class="border-b border-border bg-muted/40 text-left">
              <th class="p-3 text-xs font-medium uppercase text-muted-foreground">Token</th>
              <th class="p-3 text-xs font-medium uppercase text-muted-foreground">Valore live</th>
              <th class="w-1/3 p-3 text-xs font-medium uppercase text-muted-foreground">Preview</th>
              <th class="p-3 text-xs font-medium uppercase text-muted-foreground">Utility</th>
            </tr>
          </thead>
          <tbody>
            ${WS_SPACING.map(
    ({ key, desc }) => `
              <tr class="border-b border-border align-middle last:border-0">
                <td class="p-3"><code class="font-mono text-xs text-foreground">--ws-spacing-${key}</code></td>
                <td class="p-3 font-mono text-muted-foreground" data-ws-var="${key}">…</td>
                <td class="p-3"><div class="h-3 rounded-sm bg-primary/30" style="width:var(--ws-spacing-${key})"></div></td>
                <td class="p-3">${pillList([`p-ws-${key}`, `gap-ws-${key}`, `m-ws-${key}`])}</td>
              </tr>`
  ).join('')}
          </tbody>
        </table>
      </div>
      <p class="text-xs text-muted-foreground">Descrizioni: ${WS_SPACING.map((s) => s.desc).join(' · ')}</p>
    </div>`,
  play: async ({ canvasElement }) => {
    bindCopy(canvasElement);
    const val = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim() || '—';
    const update = () => {
      canvasElement.querySelectorAll('[data-ws-var]').forEach((el) => {
        el.textContent = val(`--ws-spacing-${el.dataset.wsVar}`);
      });
    };
    update();
    window.addEventListener('resize', update);
  },
};

/* ═══════════════════════════════════════════════════════════════════════════
   4. Breakpoints — Tailwind defaults, unmodified in this project
   ═══════════════════════════════════════════════════════════════════════════ */

const BREAKPOINTS = [
  { cls: 'sm',  minWidth: '640px',  description: 'Telefoni grandi, telefoni in landscape' },
  { cls: 'md',  minWidth: '768px',  description: 'Tablet portrait' },
  { cls: 'lg',  minWidth: '1024px', description: 'Tablet landscape, laptop piccoli' },
  { cls: 'xl',  minWidth: '1280px', description: 'Desktop' },
  { cls: '2xl', minWidth: '1536px', description: 'Desktop grandi' },
];

export const Breakpoints = {
  render: () => `
    <div class="p-6">
      <h2 class="mb-4 text-lg font-semibold text-foreground">Breakpoints</h2>
      <table class="w-full border-collapse text-sm">
        <thead>
          <tr class="border-b border-border text-left">
            <th class="p-2 font-medium text-foreground">Prefix</th>
            <th class="p-2 font-medium text-foreground">min-width</th>
            <th class="p-2 font-medium text-foreground">Esempi</th>
            <th class="p-2 font-medium text-foreground">Descrizione</th>
          </tr>
        </thead>
        <tbody>
          ${BREAKPOINTS.map(
    (b) => `
            <tr class="border-b border-border">
              <td class="p-2 font-mono text-foreground">${b.cls}</td>
              <td class="p-2 font-mono text-muted-foreground">${b.minWidth}</td>
              <td class="p-2">${pillList([`${b.cls}:flex`, `${b.cls}:grid-cols-2`, `${b.cls}:hidden`])}</td>
              <td class="p-2 text-sm text-muted-foreground">${b.description}</td>
            </tr>`
  ).join('')}
        </tbody>
      </table>
    </div>`,
  play,
};

/* ═══════════════════════════════════════════════════════════════════════════
   5. Containers — max-w-*, container, mx-auto, aspect-*, min-h-*
   ═══════════════════════════════════════════════════════════════════════════ */

export const Containers = {
  render: () => `
    <div class="space-y-10 p-6">
      ${sectionHeader(
    'Containers',
    'Vincola la larghezza del contenuto con max-w-*; centra con mx-auto. Usa container per un wrapper responsive che cresce a ogni breakpoint. aspect-* riserva un rapporto larghezza/altezza senza script.'
  )}

      <section class="space-y-4">
        <h3 class="text-base font-semibold text-foreground">Scala max-width</h3>
        <div class="space-y-3">
          ${['max-w-xs', 'max-w-sm', 'max-w-md', 'max-w-lg', 'max-w-xl', 'max-w-2xl', 'max-w-3xl', 'max-w-4xl']
    .map(
      (cls) => `
            <div class="space-y-1">
              <div class="rounded-lg border border-border bg-card p-2">
                <div class="${cls} rounded-sm border border-primary/30 bg-primary/10 px-3 py-2 font-mono text-xs text-primary">${cls}</div>
              </div>
              ${classBox(cls)}
            </div>`
    )
    .join('')}
        </div>
      </section>

      <section class="space-y-4">
        <h3 class="text-base font-semibold text-foreground">Centratura con <code>mx-auto</code></h3>
        ${stage({
    cls: 'max-w-md mx-auto',
    body: '<div class="mx-auto max-w-md rounded-sm border border-primary/30 bg-primary/10 px-3 py-2 text-center font-mono text-xs text-primary">max-w-md · mx-auto</div>',
  })}
      </section>

      <section class="space-y-4">
        <h3 class="text-base font-semibold text-foreground">Responsive <code>container</code></h3>
        <p class="text-sm text-muted-foreground">
          La utility <code class="rounded bg-muted px-1 text-xs">container</code> imposta la width
          alla min-width del breakpoint corrente. Combinala con
          <code class="rounded bg-muted px-1 text-xs">mx-auto</code> e un padding orizzontale per i
          wrapper di pagina tipici.
        </p>
        ${stage({
    cls: 'container mx-auto px-4',
    body: `<div class="container mx-auto px-4">
            <div class="rounded-sm border border-primary/30 bg-primary/10 px-3 py-2 text-center font-mono text-xs text-primary">container · mx-auto · px-4</div>
          </div>`,
  })}
      </section>

      <section class="space-y-4">
        <h3 class="text-base font-semibold text-foreground">Aspect ratio</h3>
        <div class="grid gap-4 sm:grid-cols-2">
          ${['aspect-square', 'aspect-video']
    .map((cls) =>
      stage({
        title: cls,
        cls,
        body: `<div class="${cls} flex items-center justify-center rounded-sm border border-primary/30 bg-primary/10 font-mono text-xs text-primary">${cls}</div>`,
      })
    )
    .join('')}
        </div>
      </section>

      <section class="space-y-4">
        <h3 class="text-base font-semibold text-foreground">Altezze minime</h3>
        ${pillList(['min-h-0', 'min-h-screen', 'min-h-dvh', 'min-h-svh', 'min-h-lvh', 'min-h-fit'])}
      </section>
    </div>`,
  play,
};

/* ═══════════════════════════════════════════════════════════════════════════
   6. Grid System — equal, sized and responsive columns (12-col grid)
   ═══════════════════════════════════════════════════════════════════════════ */

const gridRow = (cells) => `<div class="grid grid-cols-12 gap-3">${cells}</div>`;

export const GridSystem = {
  name: 'Grid System',
  render: () => `
    <div class="space-y-10 p-6">
      ${sectionHeader(
    'Grid system',
    'Griglia Tailwind a 12 colonne costruita su grid grid-cols-12. Le celle occupano le track con col-span-*. Le righe stanno in un parent con gap fisso (qui gap-3).'
  )}

      <section class="space-y-4">
        <h3 class="text-base font-semibold text-foreground">Colonne uguali</h3>
        ${stage({
    cls: 'grid grid-cols-12 gap-3 · celle con col-span-1 / 2 / 3 / 4 / 6',
    body: `<div class="space-y-3">
            ${gridRow(repeat(12, cell('col', 'col-span-1')))}
            ${gridRow(repeat(6, cell('col', 'col-span-2')))}
            ${gridRow(repeat(4, cell('col', 'col-span-3')))}
            ${gridRow(repeat(3, cell('col', 'col-span-4')))}
            ${gridRow(repeat(2, cell('col', 'col-span-6')))}
          </div>`,
  })}
      </section>

      <section class="space-y-4">
        <h3 class="text-base font-semibold text-foreground">Colonne dimensionate</h3>
        ${stage({
    cls: 'grid grid-cols-12 gap-3 · celle con col-span-* misti',
    body: `<div class="space-y-3">
            ${gridRow(cell('col-span-6', 'col-span-6') + cell('col-span-6', 'col-span-6'))}
            ${gridRow(cell('col-span-4', 'col-span-4') + cell('col-span-8', 'col-span-8'))}
            ${gridRow(cell('col-span-3', 'col-span-3') + cell('col-span-6', 'col-span-6') + cell('col-span-3', 'col-span-3'))}
            ${gridRow(cell('col-span-2', 'col-span-2') + cell('col-span-7', 'col-span-7') + cell('col-span-3', 'col-span-3'))}
          </div>`,
  })}
      </section>

      <section class="space-y-4">
        <h3 class="text-base font-semibold text-foreground">Colonne responsive</h3>
        <p class="text-sm text-muted-foreground">
          Stack su mobile, metà a <code class="rounded bg-muted px-1 text-xs">md</code>, un quarto a
          <code class="rounded bg-muted px-1 text-xs">lg</code>. Ridimensiona il canvas per vedere il reflow.
        </p>
        ${stage({
    cls: 'col-span-12 md:col-span-6 lg:col-span-3',
    body: gridRow(
      cell('card 1', 'col-span-12 md:col-span-6 lg:col-span-3') +
              cell('card 2', 'col-span-12 md:col-span-6 lg:col-span-3') +
              cell('card 3', 'col-span-12 md:col-span-6 lg:col-span-3') +
              cell('card 4', 'col-span-12 md:col-span-6 lg:col-span-3')
    ),
  })}
      </section>

      <section class="space-y-4">
        <h3 class="text-base font-semibold text-foreground">Column start &amp; offset</h3>
        ${stage({
    cls: 'col-start-* combinato con col-span-*',
    body: `<div class="space-y-3">
            ${gridRow(cell('col-start-3 · col-span-4', 'col-span-4 col-start-3') + cell('col-start-10 · col-span-3', 'col-span-3 col-start-10'))}
            ${gridRow(cell('col-start-4 · col-span-6', 'col-span-6 col-start-4'))}
          </div>`,
  })}
      </section>

      <section class="space-y-4">
        <h3 class="text-base font-semibold text-foreground">Row span</h3>
        ${stage({
    cls: 'row-span-2 sulla prima cella',
    body: `<div class="grid grid-cols-4 gap-3">
            ${cell('tall', 'row-span-2')}${cell('a')}${cell('b')}${cell('c')}${cell('d')}${cell('e')}${cell('f')}
          </div>`,
  })}
      </section>
    </div>`,
  play,
};

/* ═══════════════════════════════════════════════════════════════════════════
   7. Grid Alignment — place/justify/align items + content
   ═══════════════════════════════════════════════════════════════════════════ */

export const GridAlignment = {
  name: 'Grid Alignment',
  render: () => `
    <div class="space-y-10 p-6">
      ${sectionHeader(
    'Grid alignment',
    'place-* / justify-* / align-* controllano come le celle si allineano nelle track (items) e come l’intera griglia si allinea nel container (content).'
  )}

      <section class="space-y-4">
        <h3 class="text-base font-semibold text-foreground">place-items-*</h3>
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          ${['place-items-start', 'place-items-center', 'place-items-end', 'place-items-stretch']
    .map((cls) =>
      stage({
        title: cls,
        cls,
        body: `<div class="grid h-32 grid-cols-3 gap-2 ${cls}">${cell('1')}${cell('2')}${cell('3')}</div>`,
      })
    )
    .join('')}
        </div>
      </section>

      <section class="space-y-4">
        <h3 class="text-base font-semibold text-foreground">justify-items-*</h3>
        <div class="grid gap-4 sm:grid-cols-3">
          ${['justify-items-start', 'justify-items-center', 'justify-items-end']
    .map((cls) =>
      stage({
        title: cls,
        cls,
        body: `<div class="grid h-24 grid-cols-3 gap-2 ${cls}">${cell('1')}${cell('2')}${cell('3')}</div>`,
      })
    )
    .join('')}
        </div>
      </section>

      <section class="space-y-4">
        <h3 class="text-base font-semibold text-foreground">items-* (asse di blocco)</h3>
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          ${['items-start', 'items-center', 'items-end', 'items-stretch']
    .map((cls) =>
      stage({
        title: cls,
        cls,
        body: `<div class="grid h-32 grid-cols-3 gap-2 ${cls}">${cell('1')}${cell('2')}${cell('3')}</div>`,
      })
    )
    .join('')}
        </div>
      </section>

      <section class="space-y-4">
        <h3 class="text-base font-semibold text-foreground">place-content-* (intera griglia nel container)</h3>
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          ${['place-content-start', 'place-content-center', 'place-content-end', 'place-content-between']
    .map((cls) =>
      stage({
        title: cls,
        cls,
        body: `<div class="grid h-32 grid-cols-2 gap-2 ${cls}">${cell('1')}${cell('2')}</div>`,
      })
    )
    .join('')}
        </div>
      </section>
    </div>`,
  play,
};

/* ═══════════════════════════════════════════════════════════════════════════
   8. Gutters — gap-*, gap-x-*, gap-y-*
   ═══════════════════════════════════════════════════════════════════════════ */

export const Gutters = {
  render: () => `
    <div class="space-y-10 p-6">
      ${sectionHeader(
    'Gutters',
    'Usa gap-* su un parent flex/grid per spaziare i figli in modo uniforme. gap-x-* / gap-y-* controllano ogni asse in modo indipendente.'
  )}

      <section class="space-y-4">
        <h3 class="text-base font-semibold text-foreground">Gap uniforme su una riga flex</h3>
        <div class="space-y-4">
          ${['gap-0', 'gap-1', 'gap-2', 'gap-3', 'gap-4', 'gap-6', 'gap-8', 'gap-12']
    .map((cls) =>
      stage({
        title: cls,
        cls,
        body: `<div class="flex ${cls}">${cell('A')}${cell('B')}${cell('C')}${cell('D')}${cell('E')}</div>`,
      })
    )
    .join('')}
        </div>
      </section>

      <section class="space-y-4">
        <h3 class="text-base font-semibold text-foreground">Gap per asse su una griglia</h3>
        <div class="grid gap-4 sm:grid-cols-2">
          ${[
    { cls: 'gap-x-8 gap-y-2', label: 'orizzontale largo, verticale stretto' },
    { cls: 'gap-x-2 gap-y-8', label: 'orizzontale stretto, verticale largo' },
  ]
    .map((c) =>
      stage({
        title: c.cls,
        cls: c.cls,
        body: `<div class="grid grid-cols-3 ${c.cls}">${cell('1')}${cell('2')}${cell('3')}${cell('4')}${cell('5')}${cell('6')}</div>`,
      })
    )
    .join('')}
        </div>
      </section>
    </div>`,
  play,
};

/* ═══════════════════════════════════════════════════════════════════════════
   9. Flex Utilities — direction, justify, items, wrap, grow/shrink/basis
   ═══════════════════════════════════════════════════════════════════════════ */

export const FlexUtilities = {
  name: 'Flex Utilities',
  render: () => `
    <div class="space-y-10 p-6">
      ${sectionHeader(
    'Flex utilities',
    'Applica display: flex con la utility flex. I figli si allineano con justify-* (asse principale) e items-* (asse trasversale). Usa grow / shrink / basis per il sizing.'
  )}

      <section class="space-y-4">
        <h3 class="text-base font-semibold text-foreground">Direction</h3>
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          ${['flex-row', 'flex-row-reverse', 'flex-col', 'flex-col-reverse']
    .map((cls) =>
      stage({
        title: cls,
        cls: `flex ${cls}`,
        body: `<div class="flex gap-2 ${cls}">${cell('1')}${cell('2')}${cell('3')}</div>`,
      })
    )
    .join('')}
        </div>
      </section>

      <section class="space-y-4">
        <h3 class="text-base font-semibold text-foreground">Asse principale: justify-*</h3>
        <div class="space-y-4">
          ${['justify-start', 'justify-center', 'justify-end', 'justify-between', 'justify-around', 'justify-evenly']
    .map((cls) =>
      stage({
        title: cls,
        cls: `flex ${cls}`,
        body: `<div class="flex ${cls}">${cell('1')}${cell('2')}${cell('3')}</div>`,
      })
    )
    .join('')}
        </div>
      </section>

      <section class="space-y-4">
        <h3 class="text-base font-semibold text-foreground">Asse trasversale: items-*</h3>
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          ${['items-start', 'items-center', 'items-end', 'items-baseline', 'items-stretch']
    .map((cls) =>
      stage({
        title: cls,
        cls: `flex ${cls}`,
        body: `<div class="flex h-24 gap-2 ${cls}">${cell('tall')}${cell('taller', 'py-4')}${cell('tall')}</div>`,
      })
    )
    .join('')}
        </div>
      </section>

      <section class="space-y-4">
        <h3 class="text-base font-semibold text-foreground">Wrap</h3>
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          ${['flex-wrap', 'flex-nowrap', 'flex-wrap-reverse']
    .map((cls) =>
      stage({
        title: cls,
        cls: `flex ${cls}`,
        body: `<div class="flex gap-2 ${cls}">${Array.from({ length: 8 }, (_, i) => cell(`item ${i + 1}`, 'w-24')).join('')}</div>`,
      })
    )
    .join('')}
        </div>
      </section>

      <section class="space-y-4">
        <h3 class="text-base font-semibold text-foreground">Grow / shrink / basis</h3>
        <div class="space-y-4">
          ${stage({
    title: 'flex-1 sul figlio centrale',
    cls: 'flex-1',
    body: `<div class="flex gap-2">${cell('fixed')}${cell('flex-1 (riempie lo spazio)', 'flex-1')}${cell('fixed')}</div>`,
  })}
          ${stage({
    title: 'grow su tutti i figli',
    cls: 'grow',
    body: `<div class="flex gap-2">${cell('grow', 'grow')}${cell('grow', 'grow')}${cell('grow', 'grow')}</div>`,
  })}
          ${stage({
    title: 'shrink-0 impedisce il restringimento',
    cls: 'shrink-0',
    body: `<div class="flex w-64 gap-2 overflow-hidden">${cell('shrink-0 · w-40', 'w-40 shrink-0')}${cell('shrink-0 · w-40', 'w-40 shrink-0')}</div>`,
  })}
        </div>
      </section>
    </div>`,
  play,
};

/* ═══════════════════════════════════════════════════════════════════════════
   10. Display & Visibility — block, inline, flex, grid, hidden, sr-only
   ═══════════════════════════════════════════════════════════════════════════ */

export const DisplayVisibility = {
  name: 'Display & Visibility',
  render: () => `
    <div class="space-y-10 p-6">
      ${sectionHeader(
    'Display &amp; visibility',
    'Imposta il box type con le utility display. hidden rimuove l’elemento dal layout; sr-only lo nasconde visivamente ma lo lascia agli screen reader. Prefissa con sm:/md:/lg: per i flip responsive.'
  )}

      <section class="space-y-4">
        <h3 class="text-base font-semibold text-foreground">Display types</h3>
        <div class="space-y-2">
          ${['block', 'inline-block', 'inline', 'flex', 'inline-flex', 'grid', 'inline-grid']
    .map(
      (cls) => `
            <div class="flex items-center gap-3">
              <div class="w-44 shrink-0">${pillList([cls])}</div>
              <div class="grow rounded-sm border border-border p-2">
                <div class="${cls} rounded-sm border border-primary/30 bg-primary/10 px-2 py-1 font-mono text-xs text-primary">${cls}</div>
                <div class="${cls} rounded-sm border border-primary/30 bg-primary/10 px-2 py-1 font-mono text-xs text-primary">${cls}</div>
              </div>
            </div>`
    )
    .join('')}
        </div>
      </section>

      <section class="space-y-4">
        <h3 class="text-base font-semibold text-foreground">hidden</h3>
        ${stage({
    cls: 'hidden',
    body: `<div class="flex gap-2">${cell('visibile')}${cell('hidden (non renderizzato)', 'hidden')}${cell('visibile')}</div>`,
  })}
      </section>

      <section class="space-y-4">
        <h3 class="text-base font-semibold text-foreground">Show/hide responsive</h3>
        <p class="text-sm text-muted-foreground">
          Ridimensiona il canvas: la prima cella si nasconde da
          <code class="rounded bg-muted px-1 text-xs">md</code> in su, la seconda si mostra solo da
          <code class="rounded bg-muted px-1 text-xs">md</code> in su.
        </p>
        ${stage({
    cls: 'block md:hidden · hidden md:block',
    body: `<div class="flex gap-2">${cell('block · md:hidden', 'block md:hidden')}${cell('hidden · md:block', 'hidden md:block')}${cell('sempre visibile')}</div>`,
  })}
      </section>

      <section class="space-y-4">
        <h3 class="text-base font-semibold text-foreground">Solo screen-reader</h3>
        <p class="text-sm text-muted-foreground">
          <code class="rounded bg-muted px-1 text-xs">sr-only</code> mantiene un elemento
          accessibile alle tecnologie assistive nascondendolo visivamente. Utile per i bottoni
          icon-only che hanno comunque bisogno di una label.
        </p>
        ${stage({
    cls: 'sr-only',
    body: `<button type="button" class="inline-flex items-center gap-2 rounded-sm border border-primary/30 bg-primary/10 px-3 py-2 text-sm text-primary">
            <span aria-hidden="true">★</span>
            <span class="sr-only">Aggiungi ai preferiti</span>
          </button>`,
  })}
      </section>

      <section class="space-y-4">
        <h3 class="text-base font-semibold text-foreground">Overflow utilities</h3>
        ${pillList(['overflow-auto', 'overflow-hidden', 'overflow-visible', 'overflow-scroll', 'overflow-x-auto', 'overflow-y-auto'])}
      </section>

      <section class="space-y-4">
        <h3 class="text-base font-semibold text-foreground">Visibility &amp; opacity</h3>
        ${pillList(['visible', 'invisible', 'opacity-0', 'opacity-50', 'opacity-100'])}
      </section>
    </div>`,
  play,
};

/* ═══════════════════════════════════════════════════════════════════════════
   11. Position — relative/absolute/fixed/sticky + inset/z-index
   ═══════════════════════════════════════════════════════════════════════════ */

export const Position = {
  render: () => `
    <div class="space-y-10 p-6">
      ${sectionHeader(
    'Position',
    'static è il default. relative stabilisce il positioning context; absolute, fixed e sticky posizionano i figli con inset-* / top-* / right-* / bottom-* / left-*. z-* controlla lo stacking.'
  )}

      <section class="space-y-4">
        <h3 class="text-base font-semibold text-foreground">relative + absolute</h3>
        ${stage({
    cls: 'relative · absolute · top-2 right-2',
    body: `<div class="relative h-32 rounded-sm border border-border bg-card">
            ${cell('top-2 · left-2', 'absolute top-2 left-2')}
            ${cell('top-2 · right-2', 'absolute top-2 right-2')}
            ${cell('bottom-2 · left-2', 'absolute bottom-2 left-2')}
            ${cell('bottom-2 · right-2', 'absolute right-2 bottom-2')}
            ${cell('centrato', 'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2')}
          </div>`,
  })}
      </section>

      <section class="space-y-4">
        <h3 class="text-base font-semibold text-foreground">Scorciatoie inset-*</h3>
        <div class="grid gap-4 sm:grid-cols-2">
          ${['inset-0', 'inset-x-4', 'inset-y-4']
    .map((cls) =>
      stage({
        title: cls,
        cls: `absolute ${cls}`,
        body: `<div class="relative h-24 rounded-sm border border-border bg-card">
                  <div class="absolute ${cls} flex items-center justify-center rounded-sm border border-primary/30 bg-primary/10 font-mono text-xs text-primary">${cls}</div>
                </div>`,
      })
    )
    .join('')}
        </div>
      </section>

      <section class="space-y-4">
        <h3 class="text-base font-semibold text-foreground">sticky</h3>
        <p class="text-sm text-muted-foreground">
          Scrolla il box qui sotto — l’header resta attaccato in cima al suo scroll container.
        </p>
        ${stage({
    cls: 'sticky top-0',
    body: `<div class="max-h-48 overflow-y-auto rounded-sm border border-border bg-card">
            <div class="sticky top-0 border-b border-primary/30 bg-primary/10 px-3 py-2 font-mono text-xs text-primary">sticky · top-0</div>
            <div class="space-y-2 p-3">${repeat(20, '<div class="h-6 rounded-sm bg-muted/40"></div>')}</div>
          </div>`,
  })}
      </section>

      <section class="space-y-4">
        <h3 class="text-base font-semibold text-foreground">fixed</h3>
        <p class="text-sm text-muted-foreground">
          <code class="rounded bg-muted px-1 text-xs">fixed</code> si aggancia al viewport — meglio
          dimostrarlo nell’app reale, non nello scroll container di Storybook. Da usare con
          parsimonia: modali, toast, chrome di pagina.
        </p>
        ${pillList(['fixed', 'fixed inset-0', 'fixed top-0 right-0', 'fixed bottom-4 right-4'])}
      </section>

      <section class="space-y-4">
        <h3 class="text-base font-semibold text-foreground">Stack z-index</h3>
        ${stage({
    cls: 'z-0 / z-10 / z-20 / z-30',
    body: `<div class="relative h-32">
            <div class="absolute top-0 left-0 z-0 rounded-sm border border-primary/30 bg-primary/10 px-3 py-2 font-mono text-xs text-primary">z-0</div>
            <div class="absolute top-4 left-8 z-10 rounded-sm border border-primary/40 bg-primary/20 px-3 py-2 font-mono text-xs text-primary">z-10</div>
            <div class="absolute top-8 left-16 z-20 rounded-sm border border-primary/50 bg-primary/30 px-3 py-2 font-mono text-xs text-primary">z-20</div>
            <div class="absolute top-12 left-24 z-30 rounded-sm border border-primary/60 bg-primary/40 px-3 py-2 font-mono text-xs text-primary">z-30</div>
          </div>`,
  })}
      </section>
    </div>`,
  play,
};
