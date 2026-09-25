import { renderTwig } from '~sb/twig';
import { demoCard, matrixCard, storyStack } from '~sb/story-helpers';
import data from './slider.twig.json';

const mocks = data.mocks['slider'];
const TWIG_ID = '@components/base/slider/slider.twig';

export default {
  title: 'Base/Slider',
  render: (args) => renderTwig(TWIG_ID, args),
  argTypes: {
    name: {
      control: 'text',
      description: 'Name nativo dell’input, OBBLIGATORIO (range a 2 thumb: name[] su entrambi gli input).',
      table: { category: 'Content' },
    },
    id: {
      control: 'text',
      description: 'Impostato sul primo thumb input (SSR label[for] wiring).',
      table: { category: 'Accessibility' },
    },
    min: {
      control: 'number',
      description: 'Valore minimo.',
      table: { category: 'Behaviour', defaultValue: { summary: '0' } },
    },
    max: {
      control: 'number',
      description: 'Valore massimo.',
      table: { category: 'Behaviour', defaultValue: { summary: '100' } },
    },
    step: {
      control: 'number',
      description: 'Incremento.',
      table: { category: 'Behaviour', defaultValue: { summary: '1' } },
    },
    values: {
      control: 'object',
      description: '1 elemento = thumb singolo, 2 elementi = range.',
      table: { category: 'Content', defaultValue: { summary: '[50]' } },
    },
    value: {
      control: 'number',
      description: 'Scorciatoia per values: [value] (ignorato quando è impostato values).',
      table: { category: 'Content' },
    },
    labels: {
      control: 'object',
      description: 'Nome accessibile per thumb (default \'Valore\', o \'Valore minimo\'/\'Valore massimo\' per un range).',
      table: { category: 'Accessibility' },
    },
    label: {
      control: 'text',
      description: 'Renderizza una riga di label sopra lo slider.',
      table: { category: 'Content' },
    },
    showValue: {
      control: 'boolean',
      description: 'Renderizza la lettura del valore live accanto alla label.',
      table: { category: 'Content' },
    },
    orientation: {
      control: 'select',
      options: ['horizontal', 'vertical'],
      description: 'Asse dello slider.',
      table: { category: 'Appearance', defaultValue: { summary: 'horizontal' } },
    },
    disabled: {
      control: 'boolean',
      description: 'Disabilita il controllo.',
      table: { category: 'State' },
    },
    class: { table: { disable: true } },
    attrs: { table: { disable: true } },
  },
  decorators: [(story) => `<div class="w-80">${story()}</div>`],
  parameters: { layout: 'centered' },
};

/* ── Default — interactive playground ─────────────────────────────────── */

export const Default = { args: mocks.default };

/* ── Catalog — mock scenarios + configuration × disabled matrix ──────────── */

function sl(overrides = {}) {
  return `<div class="w-64">${renderTwig(TWIG_ID, overrides)}</div>`;
}

const mocksCard = demoCard({
  title: 'Mock scenarios',
  intro: 'Tutti gli scenari definiti in <code>slider.twig.json</code>: valore con readout, range a 2 thumb, orientamento verticale.',
  content: `<div class="flex flex-col gap-6">
    <div class="w-64">${renderTwig(TWIG_ID, mocks.showValue)}</div>
    <div class="w-64">${renderTwig(TWIG_ID, mocks.range)}</div>
    <div class="h-44">${renderTwig(TWIG_ID, mocks.vertical)}</div>
  </div>`,
});

/*
 * Axes:
 *   Columns: Default | Disabled
 *   Rows:    value/step configurations
 *
 * Track fill, thumb and range are styled via slider.css pseudo-element
 * selectors — they cannot carry is-* utility classes, so hover/focus/active
 * simulation is not applicable. Only the real disabled prop state is shown.
 */

const SLIDER_COLUMNS = ['Default', 'Disabled'];

const CONFIG_ROWS = [
  { key: 'bare', label: 'Bare (no label)', base: { name: 'sl-bare', values: [50] } },
  { key: 'with-label', label: 'With label + value', base: { name: 'sl-label', label: 'Volume', showValue: true, values: [60] } },
  { key: 'low', label: 'Low value (10)', base: { name: 'sl-low', label: 'Luminosità', showValue: true, values: [10] } },
  { key: 'high', label: 'High value (90)', base: { name: 'sl-high', label: 'Velocità', showValue: true, values: [90] } },
  {
    key: 'steps-10',
    label: 'Steps (10)',
    base: { name: 'sl-steps', label: 'Quantità', showValue: true, min: 0, max: 100, step: 10, values: [30] },
  },
  {
    key: 'custom-range',
    label: 'Custom range (200–800)',
    base: { name: 'sl-range', label: 'Budget (€)', showValue: true, min: 200, max: 800, step: 50, values: [400] },
  },
];

const configMatrix = matrixCard({
  title: 'Slider — Configurations × Disabled',
  rowAxisLabel: 'Configuration',
  intro:
    'Configurazioni di valore e step mostrate in stato Default e Disabled. Riempimento, ' +
    'thumb e range sono stilizzati via selettori pseudo-elemento in <code>slider.css</code> — ' +
    'non possono ricevere classi utility Tailwind, quindi è mostrato solo lo stato reale ' +
    '<code>disabled</code>.',
  columns: SLIDER_COLUMNS,
  rows: CONFIG_ROWS,
  center: false,
  renderCell: (col, row) => {
    const disabled = col === 'Disabled';
    const id = `${row.base.name}-${col.toLowerCase()}`;
    return sl({ ...row.base, id, name: id, disabled });
  },
});

export const Catalog = {
  parameters: { layout: 'padded' },
  render: () => storyStack(mocksCard, configMatrix),
};
