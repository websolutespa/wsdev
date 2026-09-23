import { renderTwig } from '~sb/twig';
import { demoCard, matrixCard, storyStack } from '~sb/story-helpers';
import data from './switch.twig.json';

const mocks = data.mocks['switch'];
const TWIG_ID = '@components/base/switch/switch.twig';

export default {
  title: 'Base/Switch',
  render: (args) => renderTwig(TWIG_ID, args),
  argTypes: {
    name: {
      control: 'text',
      description: 'Attributo name.',
      table: { category: 'Content' },
    },
    id: {
      control: 'text',
      description: 'Richiesto quando è impostato label (SSR label[for] wiring).',
      table: { category: 'Accessibility' },
    },
    value: {
      control: 'text',
      description: 'Attributo value.',
      table: { category: 'Content', defaultValue: { summary: 'on' } },
    },
    checked: {
      control: 'boolean',
      description: 'Stato iniziale acceso/spento.',
      table: { category: 'State' },
    },
    size: {
      control: 'select',
      options: ['default', 'sm'],
      description: 'Dimensione del track.',
      table: { category: 'Appearance', defaultValue: { summary: 'default' } },
    },
    disabled: {
      control: 'boolean',
      description: 'Disabilita il controllo.',
      table: { category: 'State' },
    },
    required: {
      control: 'boolean',
      description: 'Rende il controllo obbligatorio.',
      table: { category: 'State' },
    },
    ariaLabel: {
      control: 'text',
      description: 'Nome accessibile quando non è presente label.',
      table: { category: 'Accessibility', defaultValue: { summary: 'Interruttore' } },
    },
    label: {
      control: 'text',
      description: 'Testo visibile della label, reso via base/label.',
      table: { category: 'Content' },
    },
    description: {
      control: 'text',
      description: 'Testo di aiuto sotto la label; richiede label + id.',
      table: { category: 'Content' },
    },
    class: { table: { disable: true } },
    attrs: { table: { disable: true } },
  },
  parameters: { layout: 'centered' },
};

/* ── Default — interactive playground ─────────────────────────────────── */

export const Default = { args: mocks.default };

/* ── Catalog — mock scenarios + state matrices ────────────────────────────── */

function sw(overrides = {}) {
  return renderTwig(TWIG_ID, { name: 'demo', ...overrides });
}

const mocksCard = demoCard({
  title: 'Mock scenarios',
  intro: 'Tutti gli scenari definiti in <code>switch.twig.json</code>.',
  content: `<div class="flex flex-col gap-4">
    ${sw(mocks.description)}
    ${sw(mocks['disabled-checked'])}
    ${sw(mocks.bare)}
  </div>`,
});

/*
 * Axes:
 *   Columns: Off | On
 *   Rows:    Enabled | Disabled
 *
 * The switch root uses focus-within: (not focus-visible:), so is-focus-visible
 * does NOT reach the root label — the hidden sr-only input is inside, and the
 * custom variant targets the root element. Hover/Focus/Active static columns
 * are omitted; only real prop states (disabled, checked) apply.
 */

const ONOFF_COLUMNS = ['Off', 'On'];

const ENABLED_ROWS = [
  { key: 'enabled', label: 'Enabled', disabled: false },
  { key: 'disabled', label: 'Disabled', disabled: true },
];

const bareMatrix = matrixCard({
  title: 'Switch — Default Size',
  rowAxisLabel: 'State',
  intro:
    'Off vs on attraverso Enabled e Disabled. Il root dello switch usa ' +
    '<code>focus-within:</code> (non <code>focus-visible:</code>), quindi le classi ' +
    '<code>is-*</code> statiche non lo raggiungono — sono mostrati solo gli stati reali.',
  columns: ONOFF_COLUMNS,
  rows: ENABLED_ROWS,
  renderCell: (col, row) => sw({ checked: col === 'On', disabled: row.disabled }),
});

const smMatrix = matrixCard({
  title: 'Switch — Small Size',
  rowAxisLabel: 'State',
  intro:
    'Stessa matrice Off × On × Enabled/Disabled per <code>size="sm"</code>. ' +
    'Il thumb passa da 16px a 12px; il track da 44×20px a 28×16px.',
  columns: ONOFF_COLUMNS,
  rows: ENABLED_ROWS,
  renderCell: (col, row) => sw({ size: 'sm', checked: col === 'On', disabled: row.disabled }),
});

/*
 * WithLabel card — field layout (label + description) for both sizes.
 */

const SIZE_ROWS = [
  { key: 'default', label: 'Default', size: 'default' },
  { key: 'sm', label: 'Small', size: 'sm' },
];

const labelMatrix = matrixCard({
  title: 'With Label & Description',
  rowAxisLabel: 'Size',
  intro:
    'Layout stile field: label visibile e testo di descrizione accanto al track. ' +
    'Il wrapper esterno porta <code>data-disabled="true"</code> così la label si affievolisce ' +
    'via <code>group-data-[disabled=true]:opacity-50</code>.',
  columns: ONOFF_COLUMNS,
  rows: SIZE_ROWS,
  renderCell: (col, row) =>
    sw({
      id: `switch-cat-${row.key}-${col.toLowerCase()}`,
      size: row.size,
      checked: col === 'On',
      label: 'Iscriviti alla newsletter',
      description: 'Ricevi aggiornamenti sui nostri servizi.',
    }),
});

export const Catalog = {
  parameters: { layout: 'padded' },
  render: () => storyStack(mocksCard, bareMatrix, smMatrix, labelMatrix),
};
