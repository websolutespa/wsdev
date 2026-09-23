import { bindCopy, utilityTableCard } from './_helpers';

export default {
  title: 'Styleguide/Typography',
  parameters: { layout: 'fullscreen' },
};

/* ───────────────────────────────────────────────────────────────────────────
   Three-font system (kit: DM Sans / Tenor Sans / Geist Mono, see globals.css
   --font-sans/--font-serif/--font-mono and main.json fonts.googleFontsUrl):
   • DM Sans (font-sans)    → body / UI copy. Variable, weights 100–1000, italic.
   • Tenor Sans (font-serif) → heading / display. Single style, weight 400, no italic.
   • Geist Mono (font-mono)  → code / tokens. Variable, weights 100–900.
   ─────────────────────────────────────────────────────────────────────────── */

const FONTS = [
  {
    label: 'DM Sans',
    cls: 'font-sans',
    role: 'Body / UI copy',
    token: '--font-sans',
    range: 'Variable · 100–1000 · italic',
  },
  {
    label: 'Tenor Sans',
    cls: 'font-serif',
    role: 'Heading / Display',
    token: '--font-serif',
    range: 'Singolo stile · 400 · no italic',
  },
  {
    label: 'Geist Mono',
    cls: 'font-mono',
    role: 'Codice / token',
    token: '--font-mono',
    range: 'Variable · 100–900',
  },
];

/* text-* is not a static scale here: globals.css maps it to the responsive
   --ws-text-{key}-font-size/line-height vars (mobile-first, flip at ≥768px),
   so every row's rendered size can differ between mobile and desktop. */
const TYPE_SCALE = [
  'xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl', '7xl', '8xl', '9xl',
];

/* Only H1 (hero.twig) and H2 (card-grid/faq/text-only) are actually used by
   components today; H3–H6 extrapolate the same responsive text-* scale one
   step at a time for completeness — not yet consumed anywhere. */
const HEADINGS = [
  { cls: 'font-serif text-5xl', role: 'H1', usage: 'hero.twig', key: '5xl' },
  { cls: 'font-serif text-3xl', role: 'H2', usage: 'card-grid / faq / text-only', key: '3xl' },
  { cls: 'font-serif text-2xl', role: 'H3', usage: 'estrapolato — non ancora usato', key: '2xl' },
  { cls: 'font-serif text-xl',  role: 'H4', usage: 'estrapolato — non ancora usato', key: 'xl' },
  { cls: 'font-serif text-lg',  role: 'H5', usage: 'estrapolato — non ancora usato', key: 'lg' },
  { cls: 'font-serif text-base', role: 'H6', usage: 'estrapolato — non ancora usato', key: 'base' },
];

/* DM Sans and Geist Mono share the same named-weight ladder Tailwind exposes
   (100–900); the variable axis extends to 1000 but no utility reaches past
   font-black (900). */
const VARIABLE_WEIGHTS = [
  { cls: 'font-thin',       w: 100 },
  { cls: 'font-extralight', w: 200 },
  { cls: 'font-light',      w: 300 },
  { cls: 'font-normal',     w: 400 },
  { cls: 'font-medium',     w: 500 },
  { cls: 'font-semibold',   w: 600 },
  { cls: 'font-bold',       w: 700 },
  { cls: 'font-extrabold',  w: 800 },
  { cls: 'font-black',      w: 900 },
];

/* ───────────────────────────────────────────────────────────────────────────
   Tester — text input + size slider + family toggle to try all three fonts.
   Live font-size is real runtime state driven by the slider (10–120px),
   injected as inline fontSize on the samples container.
   ─────────────────────────────────────────────────────────────────────────── */

const TESTER_DEFAULT_TEXT = 'Il design system dei componenti';
const TESTER_DEFAULT_SIZE = 30;

export const Tester = {
  render: () => `
    <div class="p-6">
      <div class="overflow-hidden rounded-xl border border-border shadow-sm">
        <div class="bg-primary px-5 py-4 text-primary-foreground">
          <strong class="font-semibold">Font Tester — DM Sans, Tenor Sans &amp; Geist Mono</strong>
        </div>
        <div class="space-y-6 p-5">
          <div class="flex flex-wrap items-center gap-4">
            <input
              id="sg-tester-text"
              type="text"
              value="${TESTER_DEFAULT_TEXT}"
              placeholder="${TESTER_DEFAULT_TEXT}"
              aria-label="Testo di prova"
              class="w-full max-w-md rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-2 focus:outline-ring"
            />
            <div class="inline-flex overflow-hidden rounded-md border border-input" role="group" aria-label="Famiglia font">
              <button type="button" data-tester-font="font-sans" aria-pressed="true"
                class="px-3 py-1.5 text-sm font-medium text-foreground transition-colors data-[active=true]:bg-primary data-[active=true]:text-primary-foreground" data-active="true">DM Sans</button>
              <button type="button" data-tester-font="font-serif" aria-pressed="false"
                class="border-l border-input px-3 py-1.5 text-sm font-medium text-foreground transition-colors data-[active=true]:bg-primary data-[active=true]:text-primary-foreground" data-active="false">Tenor Sans</button>
              <button type="button" data-tester-font="font-mono" aria-pressed="false"
                class="border-l border-input px-3 py-1.5 text-sm font-medium text-foreground transition-colors data-[active=true]:bg-primary data-[active=true]:text-primary-foreground" data-active="false">Geist Mono</button>
            </div>
            <input
              id="sg-tester-size"
              type="range"
              min="10"
              max="120"
              step="1"
              value="${TESTER_DEFAULT_SIZE}"
              aria-label="Dimensione font"
              class="w-full max-w-xs accent-primary"
            />
            <span
              id="sg-tester-badge"
              class="inline-flex items-center rounded-md border border-border px-2 py-0.5 font-mono text-xs uppercase text-foreground"
            >${TESTER_DEFAULT_SIZE}px</span>
          </div>
          <div id="sg-tester-samples" class="flex flex-col gap-3 font-sans" style="font-size:${TESTER_DEFAULT_SIZE}px">
            ${VARIABLE_WEIGHTS.map(
    (w) => `
              <div>
                <small class="font-sans text-xs text-muted-foreground">${w.cls} · ${w.w}</small>
                <div class="${w.cls} break-words leading-tight text-foreground" data-tester-sample>${TESTER_DEFAULT_TEXT}</div>
              </div>`
  ).join('')}
          </div>
          <p class="text-xs text-muted-foreground">
            Tenor Sans ha un solo stile (400): passando a "Tenor Sans" tutte le righe rimangono
            visivamente identiche — è atteso, non un bug del tester.
          </p>
        </div>
      </div>
    </div>`,
  play: async ({ canvasElement }) => {
    const text = canvasElement.querySelector('#sg-tester-text');
    const size = canvasElement.querySelector('#sg-tester-size');
    const badge = canvasElement.querySelector('#sg-tester-badge');
    const samples = canvasElement.querySelector('#sg-tester-samples');
    const fontBtns = canvasElement.querySelectorAll('[data-tester-font]');

    text?.addEventListener('input', () => {
      const value = text.value || TESTER_DEFAULT_TEXT;
      canvasElement.querySelectorAll('[data-tester-sample]').forEach((el) => {
        el.textContent = value;
      });
    });
    size?.addEventListener('input', () => {
      if (samples) samples.style.fontSize = `${size.value}px`;
      if (badge) badge.textContent = `${size.value}px`;
    });
    fontBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        if (!samples) return;
        samples.classList.remove('font-sans', 'font-serif', 'font-mono');
        samples.classList.add(btn.dataset.testerFont);
        fontBtns.forEach((b) => {
          const active = b === btn;
          b.dataset.active = String(active);
          b.setAttribute('aria-pressed', String(active));
        });
      });
    });
  },
};

/* ───────────────────────────────────────────────────────────────────────────
   AllStyles — family overview, heading specimen (Tenor Sans) and weights for
   the two variable fonts (DM Sans, Geist Mono).
   ─────────────────────────────────────────────────────────────────────────── */

export const AllStyles = {
  name: 'All Styles',
  render: () => `
    <div class="space-y-6 p-6">
      ${utilityTableCard(
    'Font del sistema',
    FONTS.map((f) => ({
      sample: `<span class="${f.cls} text-2xl text-foreground">Aa Bb Cc 0123 — àèìòù €</span>`,
      details: `<strong class="text-foreground">${f.label}</strong> · ${f.role}<br><span class="text-muted-foreground">${f.range} · token <code>${f.token}</code></span>`,
      cls: f.cls,
    }))
  )}
      ${utilityTableCard(
    'Heading — Tenor Sans (serif)',
    HEADINGS.map((h) => ({
      sample: `<span class="${h.cls} block truncate text-foreground">Testo di esempio</span>`,
      details: `${h.role} · <span class="text-muted-foreground">${h.usage}</span>`,
      cls: h.cls,
    }))
  )}
      ${utilityTableCard(
    'Paragrafo in evidenza — Tenor Sans (serif)',
    [
      {
        sample: '<p class="font-serif text-2xl text-foreground">Un paragrafo introduttivo in Tenor Sans per dare risalto all\'apertura di una sezione.</p>',
        details: 'Lead / intro · convenzione, nessun token dedicato',
        cls: 'font-serif text-2xl',
      },
    ]
  )}
      ${utilityTableCard(
    'Pesi — DM Sans (body, 100–900)',
    VARIABLE_WEIGHTS.map((w) => ({
      sample: `<span class="font-sans ${w.cls} text-lg">Testo di esempio</span>`,
      details: `DM Sans ${w.w}`,
      cls: w.cls,
    }))
  )}
      ${utilityTableCard(
    'Pesi — Geist Mono (codice, 100–900)',
    VARIABLE_WEIGHTS.map((w) => ({
      sample: `<span class="font-mono ${w.cls} text-lg">Testo di esempio</span>`,
      details: `Geist Mono ${w.w}`,
      cls: w.cls,
    }))
  )}
      ${utilityTableCard(
    'Tenor Sans — nota',
    [
      {
        sample: '<span class="font-serif text-lg text-foreground">Testo di esempio</span>',
        details: 'Font a stile singolo: nessuna variante di peso o corsivo disponibile',
        cls: 'font-serif',
      },
    ]
  )}
    </div>`,
  play: async ({ canvasElement }) => {
    bindCopy(canvasElement);
  },
};

/* ───────────────────────────────────────────────────────────────────────────
   Responsive Scale — the project's text-* utilities aren't a static scale:
   globals.css maps --text-{key} to the responsive --ws-text-{key}-font-size /
   -line-height vars, which flip at ≥768px (mobile-first). The custom
   properties (not the theme-inlined --text-* ones) are what's queryable live,
   so values are read straight off --ws-text-*. Resize the canvas to see the flip.
   ─────────────────────────────────────────────────────────────────────────── */

function scaleRow(key) {
  return `
    <tr class="border-b border-border align-middle last:border-0">
      <td class="p-3"><code class="font-mono text-xs text-foreground">text-${key}</code></td>
      <td class="p-3"><span class="text-${key} block truncate leading-tight text-foreground">Testo di esempio</span></td>
      <td class="p-3 font-mono text-xs text-muted-foreground" data-ws-text="${key}">…</td>
    </tr>`;
}

export const ResponsiveScale = {
  name: 'Responsive Scale',
  render: () => `
    <div class="space-y-4 p-6">
      <div>
        <h2 class="text-xl font-semibold text-foreground">Scala tipografica responsive</h2>
        <p class="mt-1 max-w-2xl text-sm text-muted-foreground">
          Le utility <code class="rounded bg-muted px-1 text-xs">text-*</code> di questo progetto non sono
          una scala fissa: sono mappate sulle variabili responsive
          <code class="rounded bg-muted px-1 text-xs">--ws-text-*-font-size</code> /
          <code class="rounded bg-muted px-1 text-xs">-line-height</code>, che cambiano da
          <code class="rounded bg-muted px-1 text-xs">≥768px</code> (mobile-first). Il valore accanto a
          ogni riga è letto live dal DOM — ridimensiona il canvas per vedere il flip.
        </p>
      </div>
      <div class="overflow-hidden rounded-lg border border-border">
        <table class="w-full border-collapse text-sm">
          <thead>
            <tr class="border-b border-border bg-muted/40 text-left">
              <th class="p-3 text-xs font-medium uppercase text-muted-foreground">Classe</th>
              <th class="p-3 text-xs font-medium uppercase text-muted-foreground">Sample</th>
              <th class="p-3 text-xs font-medium uppercase text-muted-foreground">font-size / line-height</th>
            </tr>
          </thead>
          <tbody>
            ${TYPE_SCALE.map(scaleRow).join('')}
          </tbody>
        </table>
      </div>
    </div>`,
  play: async ({ canvasElement }) => {
    bindCopy(canvasElement);
    const cs = () => getComputedStyle(document.documentElement);
    const val = (name) => cs().getPropertyValue(name).trim() || '—';
    const update = () => {
      canvasElement.querySelectorAll('[data-ws-text]').forEach((el) => {
        const key = el.dataset.wsText;
        el.textContent = `${val(`--ws-text-${key}-font-size`)} / ${val(`--ws-text-${key}-line-height`)}`;
      });
    };
    update();
    window.addEventListener('resize', update);
  },
};
