import { renderTwig } from '~sb/twig';
import { demoCard, matrixCard, storyStack, stateProps } from '~sb/story-helpers';
import data from './input.twig.json';

const mocks = data.mocks['input'];
const TWIG_ID = '@components/base/input/input.twig';

export default {
  title: 'Base/Input',
  render: (args) => renderTwig(TWIG_ID, args),
  argTypes: {
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'search', 'tel', 'url', 'file', 'date', 'time'],
      description: 'Tipo di input HTML.',
      table: { category: 'Behaviour', defaultValue: { summary: 'text' } },
    },
    name: {
      control: 'text',
      description: 'Attributo name dell’input, OBBLIGATORIO.',
      table: { category: 'Content' },
    },
    id: {
      control: 'text',
      description: 'Richiesto quando un <label for> esterno punta al campo (mai generato in Twig).',
      table: { category: 'Accessibility' },
    },
    placeholder: {
      control: 'text',
      description: 'Testo segnaposto mostrato quando il campo è vuoto.',
      table: { category: 'Content' },
    },
    value: {
      control: 'text',
      description: 'Valore corrente del campo.',
      table: { category: 'Content' },
    },
    disabled: {
      control: 'boolean',
      description: 'Disabilita il campo.',
      table: { category: 'State' },
    },
    required: {
      control: 'boolean',
      description: 'Rende il campo obbligatorio.',
      table: { category: 'State' },
    },
    readonly: {
      control: 'boolean',
      description: 'Rende il campo di sola lettura.',
      table: { category: 'State' },
    },
    invalid: {
      control: 'boolean',
      description: 'Emette aria-invalid="true" attivando gli stili aria-invalid di upstream.',
      table: { category: 'State' },
    },
    autocomplete: {
      control: 'text',
      description: 'Suggerimento di autocompletamento, es. \'email\' | \'name\' | \'new-password\' | \'off\'.',
      table: { category: 'Behaviour' },
    },
    min: {
      control: 'text',
      description: 'Valore minimo, per i tipi number/date/time.',
      table: { category: 'Behaviour' },
    },
    max: {
      control: 'text',
      description: 'Valore massimo, per i tipi number/date/time.',
      table: { category: 'Behaviour' },
    },
    step: {
      control: 'text',
      description: 'Incremento, per i tipi number/date/time.',
      table: { category: 'Behaviour' },
    },
    class: { table: { disable: true } },
    attrs: { table: { disable: true } },
  },
  parameters: { layout: 'padded' },
};

/* ── Default — interactive playground ─────────────────────────────────── */

export const Default = { args: mocks.default };

/* ── Catalog — mock scenarios + type/state matrix ─────────────────────────── */

function inp(args) {
  return renderTwig(TWIG_ID, args);
}

const mocksCard = demoCard({
  title: 'Mock scenarios',
  intro: 'Tutti gli scenari definiti in <code>input.twig.json</code>.',
  content: `<div class="flex flex-col gap-3 max-w-sm">
    ${inp(mocks.email)}
    ${inp(mocks.password)}
    ${inp(mocks.value)}
    ${inp(mocks.invalid)}
    ${inp(mocks.disabled)}
    ${inp(mocks.readonly)}
    ${inp(mocks.file)}
  </div>`,
});

/**
 * Type/config × state matrix. Only Default/Focus/Invalid/Disabled columns are
 * shown: input.twig defines focus-visible: ring classes but no hover:/active:
 * utilities, so a static Hover/Active column would render identically to
 * Default — that would be misleading, not informative.
 */
const STATE_COLS = ['Default', 'Focus', 'Invalid', 'Disabled'];

const TYPE_ROWS = [
  { key: 'text', label: 'Text', base: { name: 'nome', value: 'Giulia Ferrari' } },
  {
    key: 'email',
    label: 'Email',
    base: { name: 'email', type: 'email', placeholder: 'nome@studiocreativo.it', autocomplete: 'email' },
  },
  {
    key: 'password',
    label: 'Password',
    base: { name: 'password', type: 'password', placeholder: 'Minimo 8 caratteri', autocomplete: 'new-password' },
  },
  { key: 'file', label: 'File', base: { name: 'brief', type: 'file' } },
];

const statesMatrix = matrixCard({
  title: 'Input States',
  rowAxisLabel: 'Type / Config',
  intro:
    'Tipi di input × stati di validazione. <code>invalid</code> attiva le classi ' +
    '<code>aria-invalid:border-destructive</code> definite nel template. <code>disabled</code> ' +
    'usa l’attributo nativo. Focus è simulato staticamente con <code>is-focus-visible</code> ' +
    '(custom variant Storybook-only).',
  columns: STATE_COLS,
  rows: TYPE_ROWS,
  center: false,
  renderCell: (col, row) => {
    if (col === 'Invalid') return inp({ ...row.base, invalid: true });
    if (col === 'Disabled') return inp({ ...row.base, disabled: true });
    if (col === 'Focus') return inp({ ...row.base, ...stateProps('Focus') });
    return inp({ ...row.base });
  },
});

export const Catalog = {
  parameters: { layout: 'padded' },
  render: () => storyStack(mocksCard, statesMatrix),
};
