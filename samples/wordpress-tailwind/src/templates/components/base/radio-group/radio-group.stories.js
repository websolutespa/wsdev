import { renderTwig } from '~sb/twig';
import { demoCard, matrixCard, storyStack } from '~sb/story-helpers';
import data from './radio-group.twig.json';

const mocks = data.mocks['radio-group'];
const TWIG_ID = '@components/base/radio-group/radio-group.twig';

export default {
  title: 'Base/RadioGroup',
  render: (args) => renderTwig(TWIG_ID, args),
  argTypes: {
    name: {
      control: 'text',
      description: 'Name nativo condiviso, OBBLIGATORIO; usato anche per derivare gli id delle opzioni.',
      table: { category: 'Content' },
    },
    options: {
      control: 'object',
      description:
        'Array di { label, value, id?, checked?, disabled?, description? }.',
      table: { category: 'Content' },
    },
    legend: {
      control: 'text',
      description: 'Testo del <legend>; il fieldset porta comunque sempre role="radiogroup".',
      table: { category: 'Content' },
    },
    orientation: {
      control: 'select',
      options: ['vertical', 'horizontal'],
      description: 'Asse di layout del gruppo.',
      table: { category: 'Appearance', defaultValue: { summary: 'vertical' } },
    },
    invalid: {
      control: 'boolean',
      description: 'Imposta aria-invalid="true" su ogni radio input.',
      table: { category: 'State' },
    },
    id: { table: { disable: true } },
    class: { table: { disable: true } },
    attrs: { table: { disable: true } },
  },
  parameters: { layout: 'centered' },
};

/* ── Default — interactive playground ─────────────────────────────────── */

export const Default = { args: mocks.default };

/* ── Catalog — mock scenarios + state matrix + descriptions/orientation ──── */

function rg(overrides = {}) {
  return renderTwig(TWIG_ID, overrides);
}

const mocksCard = demoCard({
  title: 'Mock scenarios',
  intro: 'Tutti gli scenari definiti in <code>radio-group.twig.json</code>.',
  content: `<div class="flex flex-col gap-6">
    ${rg(mocks.disabled)}
    ${rg(mocks.invalid)}
  </div>`,
});

/*
 * Axes:
 *   Columns: Unselected | Selected
 *   Rows:    Enabled | All disabled | Invalid | Item disabled
 *
 * radio-group.twig has no group-level `disabled` prop (only per-option
 * `option.disabled`) — "All disabled" is simulated by marking every option
 * disabled, not by a group prop. focus-visible: IS defined on the radio input,
 * but radio_item_classes is a fixed string at template scope with no
 * per-option class hook, so is-focus-visible cannot be simulated here.
 * hover:/active: are also not defined — Hover/Active/Focus columns are omitted.
 */

const SELECTED_COLUMNS = ['Unselected', 'Selected'];

const STATE_ROWS = [
  { key: 'enabled', label: 'Enabled', invalid: false, itemsDisabled: false },
  { key: 'all-disabled', label: 'All disabled', invalid: false, itemsDisabled: true },
  { key: 'invalid', label: 'Invalid', invalid: true, itemsDisabled: false },
  { key: 'item-disabled', label: 'Item disabled', invalid: false, itemsDisabled: 'partial' },
];

function makeOptions(selected, row) {
  return [
    { label: 'Opzione A', value: 'a', checked: selected === 'Selected', disabled: row.itemsDisabled === true },
    { label: 'Opzione B', value: 'b', disabled: row.itemsDisabled === true || row.itemsDisabled === 'partial' },
  ];
}

const statesMatrix = matrixCard({
  title: 'Radio Group — States',
  rowAxisLabel: 'State',
  intro:
    'Unselected vs selected attraverso Enabled, All disabled (ogni opzione disabilitata), ' +
    'Invalid e Item disabled (solo un’opzione disabilitata). Focus/Hover/Active non sono ' +
    'simulabili: <code>radio_item_classes</code> è una stringa fissa a livello di template, ' +
    'senza hook di classe per singola opzione.',
  columns: SELECTED_COLUMNS,
  rows: STATE_ROWS,
  renderCell: (col, row) =>
    rg({
      name: `rg-cat-${row.key}-${col.toLowerCase()}`,
      options: makeOptions(col, row),
      invalid: row.invalid ? true : undefined,
    }),
});

const descriptionsCard = demoCard({
  title: 'With Descriptions',
  intro: 'Ogni opzione porta una riga di descrizione secondaria sotto la label, con allineamento "items-start".',
  content: rg(mocks.description),
});

const horizontalCard = demoCard({
  title: 'Horizontal Orientation',
  intro:
    '<code>orientation="horizontal"</code> passa il gruppo a <code>grid-flow-col auto-cols-max</code> — ' +
    'utile per scelte binarie compatte.',
  content: rg(mocks.horizontal),
});

export const Catalog = {
  parameters: { layout: 'padded' },
  render: () => storyStack(mocksCard, statesMatrix, descriptionsCard, horizontalCard),
};
