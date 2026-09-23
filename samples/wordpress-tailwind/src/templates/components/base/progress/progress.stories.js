import { renderTwig } from '~sb/twig';
import { demoCard, storyStack } from '~sb/story-helpers';
import data from './progress.twig.json';

const mocks = data.mocks['progress'];
const TWIG_ID = '@components/base/progress/progress.twig';

// The bar is w-full — stories wrap it in a fixed-width container so the
// centered layout does not collapse it to zero width (demo chrome only).
const render = (args) => `<div class="w-80">${renderTwig(TWIG_ID, args)}</div>`;

export default {
  title: 'Base/Progress',
  render,
  argTypes: {
    value: {
      control: { type: 'range', min: 0, max: 100, step: 1 },
      description: 'Percentuale 0–100; guida aria-valuenow e la larghezza dell\'indicatore.',
      table: { category: 'State', defaultValue: { summary: '0' } },
    },
    ariaLabel: {
      control: 'text',
      description: 'Nome accessibile per il progressbar.',
      table: { category: 'Accessibility' },
    },
    id: { table: { disable: true } },
    class: { table: { disable: true } },
    attrs: { table: { disable: true } },
  },
  parameters: { layout: 'centered' },
};

/* ── Default — interactive playground ───────────────────────────────────── */

export const Default = { args: mocks['default'] };

/* ── Catalog ─────────────────────────────────────────────────────────────── */

function prog(value, ariaLabel) {
  return renderTwig(TWIG_ID, { value, ariaLabel: ariaLabel ?? `Avanzamento ${value}%` });
}

const VALUES = [
  { value: 0, label: '0%' },
  { value: 25, label: '25%' },
  { value: 50, label: '50%' },
  { value: 75, label: '75%' },
  { value: 100, label: '100% — completo' },
];

const valuesCard = demoCard({
  title: 'Progress values',
  intro:
    'Il prop <code>value</code> (0–100) guida <code>transform: translateX()</code> sull\'indicatore. ' +
    'Il calcolo avviene direttamente in Twig, senza JS runtime, perché <code>value</code> è noto al render.',
  content: `
    <div class="flex flex-col gap-4 w-80">
      ${VALUES.map((v) => `
      <div class="flex flex-col gap-1.5">
        <div class="flex justify-between">
          <span class="text-xs text-muted-foreground">${v.label}</span>
        </div>
        ${prog(v.value, `Avanzamento ${v.label}`)}
      </div>`).join('')}
    </div>
  `,
});

const inContextCard = demoCard({
  title: 'In context',
  intro: 'Barra di avanzamento con etichetta visibile sopra e testo di stato sotto — pattern comune per upload e wizard multi-step.',
  content: `
    <div class="flex flex-col gap-4 w-80">
      <div class="flex flex-col gap-1.5">
        <div class="flex justify-between">
          <span class="text-sm font-medium">Caricamento pratica</span>
          <span class="text-xs text-muted-foreground">40%</span>
        </div>
        ${renderTwig(TWIG_ID, { value: 40, ariaLabel: 'Caricamento pratica' })}
      </div>
      <div class="flex flex-col gap-1.5">
        <div class="flex justify-between">
          <span class="text-sm font-medium">Upload documenti</span>
          <span class="text-xs text-muted-foreground">completato</span>
        </div>
        ${renderTwig(TWIG_ID, { value: 100, ariaLabel: 'Upload completato' })}
      </div>
    </div>
  `,
});

export const Catalog = {
  parameters: { layout: 'padded' },
  render: () => storyStack(valuesCard, inContextCard),
};
