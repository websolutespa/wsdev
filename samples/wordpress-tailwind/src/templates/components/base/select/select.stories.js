import { renderTwig } from '~sb/twig';
import { initModules } from '~sb/modules';
import { demoCard, matrixCard, storyStack } from '~sb/story-helpers';
import data from './select.twig.json';

const mocks = data.mocks['select'];
const TWIG_ID = '@components/base/select/select.twig';

export default {
  title: 'Base/Select',
  render: (args) => renderTwig(TWIG_ID, args),
  argTypes: {
    name: {
      control: 'text',
      description: 'Name della <select> nativa nascosta che porta il valore al submit, OBBLIGATORIO.',
      table: { category: 'Content' },
    },
    options: {
      control: 'object',
      description:
        'Elenco ordinato di Option { label, value, disabled? }, Group { kind: \'group\', label?, options }, ' +
        'Separator { kind: \'separator\' } o Label { kind: \'label\', label }. Ogni value deve essere univoco.',
      table: { category: 'Content' },
    },
    value: {
      control: 'text',
      description: 'Opzione preselezionata.',
      table: { category: 'Content' },
    },
    placeholder: {
      control: 'text',
      description: 'Mostrato in select-value quando nulla è selezionato.',
      table: { category: 'Content' },
    },
    size: {
      control: 'select',
      options: ['default', 'sm'],
      description: 'Dimensione del trigger.',
      table: { category: 'Appearance', defaultValue: { summary: 'default' } },
    },
    disabled: {
      control: 'boolean',
      description: 'Disabilita il trigger.',
      table: { category: 'State' },
    },
    required: {
      control: 'boolean',
      description: 'Sulla select nativa, così si applica la validazione del form.',
      table: { category: 'State' },
    },
    invalid: {
      control: 'boolean',
      description: 'Imposta aria-invalid="true" sul trigger.',
      table: { category: 'State' },
    },
    id: {
      control: 'text',
      description: 'Id del trigger, per un label[for]; mai generato in Twig.',
      table: { category: 'Accessibility' },
    },
    class: { table: { disable: true } },
    attrs: { table: { disable: true } },
  },
  parameters: { layout: 'centered' },
};

/* ── Default — interactive playground ─────────────────────────────────── */

export const Default = { args: mocks.default };

/* ── Open — play(): trigger click opens the listbox ───────────────────────── */

export const Open = {
  args: mocks.default,
  play: async ({ canvasElement }) => {
    await initModules(canvasElement);
    canvasElement.querySelector('[data-slot="select-trigger"]').click();
  },
};

/* ── Catalog — mock scenarios + configuration × state matrix ─────────────── */

function sel(args) {
  return renderTwig(TWIG_ID, args);
}

const mocksCard = demoCard({
  title: 'Mock scenarios',
  intro: 'Tutti gli scenari definiti in <code>select.twig.json</code>: pre-selezionato, gruppi con separatore, small, opzioni disabilitate.',
  content: `<div class="flex flex-wrap items-start gap-4">
    ${sel(mocks['with-value'])}
    ${sel(mocks.groups)}
    ${sel(mocks.sm)}
    ${sel(mocks['disabled-options'])}
  </div>`,
});

/**
 * Select configurations × states: Default / Invalid / Disabled.
 * No Hover/Focus/Active columns: the trigger uses focus-visible: ring via the
 * class string but no is-* custom-variant hook is defined for select.
 * The open dropdown and item selection are demonstrated in the Open story above.
 */
const flatOptions = [
  { label: 'Sviluppo web', value: 'sviluppo-web' },
  { label: 'Design UX/UI', value: 'design-ux-ui' },
  { label: 'E-commerce', value: 'e-commerce' },
  { label: 'SEO & Content', value: 'seo-content' },
];

const groupedOptions = [
  {
    kind: 'group',
    label: 'Italia',
    options: [
      { label: 'Milano', value: 'milano' },
      { label: 'Pesaro', value: 'pesaro' },
      { label: 'Roma', value: 'roma' },
    ],
  },
  {
    kind: 'group',
    label: 'Estero',
    options: [
      { label: 'Londra', value: 'londra' },
      { label: 'New York', value: 'new-york', disabled: true },
    ],
  },
];

const STATE_COLS = ['Default', 'Invalid', 'Disabled'];

const CONFIG_ROWS = [
  { key: 'flat', label: 'Flat options', base: { name: 'servizio', placeholder: 'Seleziona un servizio', options: flatOptions } },
  { key: 'preselected', label: 'Pre-selected', base: { name: 'servizio', value: 'design-ux-ui', options: flatOptions } },
  { key: 'groups', label: 'Grouped options', base: { name: 'sede', placeholder: 'Scegli una sede', options: groupedOptions } },
  {
    key: 'small',
    label: 'Small (sm)',
    base: {
      name: 'lingua',
      size: 'sm',
      value: 'it',
      options: [
        { label: 'Italiano', value: 'it' },
        { label: 'Inglese', value: 'en' },
        { label: 'Francese', value: 'fr' },
      ],
    },
  },
];

const configMatrix = matrixCard({
  title: 'Select States',
  rowAxisLabel: 'Configuration',
  intro:
    'Configurazioni × stati. <code>invalid</code> imposta <code>aria-invalid="true"</code> sul ' +
    'trigger, attivando la ring <code>aria-invalid:border-destructive</code>. <code>disabled</code> ' +
    'disabilita il trigger e la select nascosta.',
  columns: STATE_COLS,
  rows: CONFIG_ROWS,
  renderCell: (col, row) => {
    if (col === 'Invalid') return sel({ ...row.base, invalid: true });
    if (col === 'Disabled') return sel({ ...row.base, disabled: true });
    return sel({ ...row.base });
  },
});

export const Catalog = {
  parameters: { layout: 'padded' },
  render: () => storyStack(mocksCard, configMatrix),
};
