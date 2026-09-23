import { renderTwig } from '~sb/twig';
import { demoCard, matrixCard, storyStack } from '~sb/story-helpers';
import data from './native-select.twig.json';

const mocks = data.mocks['native-select'];
const TWIG_ID = '@components/base/native-select/native-select.twig';

export default {
  title: 'Base/NativeSelect',
  render: (args) => renderTwig(TWIG_ID, args),
  argTypes: {
    options: {
      control: 'object',
      description: 'Opzioni flat: Array<{ value, label, selected?, disabled? }>, rese prima degli optgroup.',
      table: { category: 'Content' },
    },
    optgroups: {
      control: 'object',
      description: 'Opzioni raggruppate: Array<{ label, options: Array<{ value, label, selected?, disabled? }> }>.',
      table: { category: 'Content' },
    },
    name: {
      control: 'text',
      description: 'Attributo name.',
      table: { category: 'Content' },
    },
    id: {
      control: 'text',
      description: 'Richiesto quando un <label for> esterno punta al campo.',
      table: { category: 'Accessibility' },
    },
    size: {
      control: 'select',
      options: ['default', 'sm'],
      description: 'Altezza della select.',
      table: { category: 'Appearance', defaultValue: { summary: 'default' } },
    },
    disabled: {
      control: 'boolean',
      description: 'Disabilita la select.',
      table: { category: 'State' },
    },
    required: {
      control: 'boolean',
      description: 'Rende la select obbligatoria.',
      table: { category: 'State' },
    },
    invalid: {
      control: 'boolean',
      description: 'Emette aria-invalid="true", attivando le classi aria-invalid.',
      table: { category: 'State' },
    },
    ariaLabel: {
      control: 'text',
      description: 'Nome accessibile quando non è collegato un <label for> esterno.',
      table: { category: 'Accessibility' },
    },
    class: { table: { disable: true } },
    attrs: { table: { disable: true } },
  },
  parameters: { layout: 'centered' },
};

/* ── Default — interactive playground ─────────────────────────────────── */

export const Default = { args: mocks.default };

/* ── Catalog — mock scenarios + configuration × state matrix ─────────────── */

function ns(args) {
  return renderTwig(TWIG_ID, args);
}

const mocksCard = demoCard({
  title: 'Mock scenarios',
  intro: 'Tutti gli scenari definiti in <code>native-select.twig.json</code>: size sm, optgroup, disabled, invalid.',
  content: `<div class="flex flex-wrap items-start gap-4">
    ${ns(mocks['size-sm'])}
    ${ns(mocks['with-optgroups'])}
    ${ns(mocks.disabled)}
  </div>`,
});

/**
 * Native select configurations × states: Default / Invalid / Disabled.
 * No static Hover/Focus/Active: the select uses focus-visible: ring and
 * dark:hover: via the class string but no is-* custom-variant hook exists.
 * The optgroups row demonstrates the grouped variant; small demonstrates
 * data-[size=sm]:h-8.
 */
const flatOptions = [
  { value: 'design', label: 'Design' },
  { value: 'frontend', label: 'Sviluppo frontend' },
  { value: 'backend', label: 'Sviluppo backend' },
  { value: 'pm', label: 'Project management', selected: true },
];

const groupedOptions = [
  {
    label: 'Italia',
    options: [
      { value: 'pesaro', label: 'Pesaro' },
      { value: 'milano', label: 'Milano', selected: true },
      { value: 'roma', label: 'Roma' },
    ],
  },
  {
    label: 'Estero',
    options: [
      { value: 'londra', label: 'Londra' },
      { value: 'berlino', label: 'Berlino', disabled: true },
    ],
  },
];

const STATE_COLS = ['Default', 'Invalid', 'Disabled'];

const CONFIG_ROWS = [
  { key: 'flat', label: 'Flat options', base: { name: 'reparto', id: 'reparto', ariaLabel: 'Seleziona un reparto', options: flatOptions } },
  { key: 'groups', label: 'Grouped options', base: { name: 'sede', id: 'sede', ariaLabel: 'Seleziona una sede', optgroups: groupedOptions } },
  { key: 'small', label: 'Small (sm)', base: { name: 'lingua', id: 'lingua', size: 'sm', ariaLabel: 'Seleziona una lingua', options: flatOptions } },
];

const configMatrix = matrixCard({
  title: 'Native Select States',
  rowAxisLabel: 'Configuration',
  intro:
    'Configurazioni × stati. <code>invalid</code> imposta <code>aria-invalid="true"</code>, ' +
    'attivando la ring <code>aria-invalid:border-destructive</code>. <code>disabled</code> usa ' +
    'l\'attributo nativo; <code>has-[select:disabled]:opacity-50</code> affievolisce il wrapper.',
  columns: STATE_COLS,
  rows: CONFIG_ROWS,
  renderCell: (col, row) => {
    if (col === 'Invalid') return ns({ ...row.base, invalid: true });
    if (col === 'Disabled') return ns({ ...row.base, disabled: true });
    return ns({ ...row.base });
  },
});

export const Catalog = {
  parameters: { layout: 'padded' },
  render: () => storyStack(mocksCard, configMatrix),
};
