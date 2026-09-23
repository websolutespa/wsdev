import { renderTwig } from '~sb/twig';
import { demoCard, matrixCard, storyStack } from '~sb/story-helpers';
import data from './checkbox.twig.json';

const mocks = data.mocks['checkbox'];
const TWIG_ID = '@components/base/checkbox/checkbox.twig';

export default {
  title: 'Base/Checkbox',
  render: (args) => renderTwig(TWIG_ID, args),
  argTypes: {
    name: {
      control: 'text',
      description: 'Attributo name.',
      table: { category: 'Content' },
    },
    id: {
      control: 'text',
      description: 'Richiesto quando sono impostati label o description (SSR label[for] wiring).',
      table: { category: 'Accessibility' },
    },
    value: {
      control: 'text',
      description: 'Attributo value.',
      table: { category: 'Content' },
    },
    checked: {
      control: 'boolean',
      description: 'Stato selezionato iniziale.',
      table: { category: 'State' },
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
    invalid: {
      control: 'boolean',
      description: 'Imposta aria-invalid="true" sull’input.',
      table: { category: 'State' },
    },
    label: {
      control: 'text',
      description: 'Testo visibile della label, reso via base/label; richiede id.',
      table: { category: 'Content' },
    },
    description: {
      control: 'text',
      description: 'Testo di aiuto sotto la label; richiede id.',
      table: { category: 'Content' },
    },
    class: { table: { disable: true } },
    attrs: { table: { disable: true } },
  },
  parameters: { layout: 'centered' },
};

/* ── Default — interactive playground ─────────────────────────────────── */

export const Default = { args: mocks.default };

/* ── Catalog — mock scenarios + state matrix + label/description matrix ──── */

function cb(overrides = {}) {
  return renderTwig(TWIG_ID, { name: 'demo', ...overrides });
}

const mocksCard = demoCard({
  title: 'Mock scenarios',
  intro: 'Tutti gli scenari definiti in <code>checkbox.twig.json</code>: checked, description-only, disabled-checked, bare.',
  content: `<div class="flex flex-col gap-3">
    ${cb(mocks.checked)}
    ${cb(mocks.description)}
    ${cb(mocks['disabled-checked'])}
    ${cb(mocks.bare)}
  </div>`,
});

/*
 * Axes:
 *   Columns: Unchecked | Checked
 *   Rows:    Enabled | Disabled | Invalid | Focus
 *
 * focus-visible: is defined on the native input (focus-visible:border-ring /
 * focus-visible:ring-[3px]) so is-focus-visible works. hover: and active: are
 * NOT defined on the checkbox input, so Hover/Active columns are omitted.
 */

const CHECKED_COLUMNS = ['Unchecked', 'Checked'];

const STATE_ROWS = [
  { key: 'enabled', label: 'Enabled', disabled: false, invalid: false },
  { key: 'disabled', label: 'Disabled', disabled: true, invalid: false },
  { key: 'invalid', label: 'Invalid', disabled: false, invalid: true },
  { key: 'focus', label: 'Focus', disabled: false, invalid: false, extraClass: 'is-focus-visible' },
];

const bareMatrix = matrixCard({
  title: 'Checkbox — States',
  rowAxisLabel: 'State',
  intro:
    'Unchecked vs checked attraverso Enabled, Disabled e Invalid. La riga Focus simula ' +
    '<code>focus-visible:</code> tramite la classe <code>is-focus-visible</code> ' +
    '(custom variant Storybook-only). Le colonne Hover e Active sono omesse — ' +
    'l\'input checkbox non definisce né <code>hover:</code> né <code>active:</code>.',
  columns: CHECKED_COLUMNS,
  rows: STATE_ROWS,
  renderCell: (col, row) => {
    const checked = col === 'Checked';
    const extraClass = row.extraClass ?? undefined;
    return cb({
      id: `checkbox-cat-${row.key}-${col.toLowerCase()}`,
      checked,
      disabled: row.disabled,
      invalid: row.invalid,
      ...(extraClass ? { class: extraClass } : {}),
    });
  },
});

/*
 * WithLabel card — full field layout (label + description) across
 * Unchecked/Checked × Enabled/Disabled.
 */

const LABEL_ROWS = [
  { key: 'enabled', label: 'Enabled', disabled: false },
  { key: 'disabled', label: 'Disabled', disabled: true },
];

const labelMatrix = matrixCard({
  title: 'With Label & Description',
  rowAxisLabel: 'State',
  intro:
    'Layout stile field (label + testo di aiuto). La label e il <code>&lt;div&gt;</code> ' +
    'contenitore portano <code>group-data-[disabled=true]:opacity-50</code> — il visual ' +
    'disabled si propaga dal wrapper, non solo dall\'input.',
  columns: CHECKED_COLUMNS,
  rows: LABEL_ROWS,
  renderCell: (col, row) => {
    const checked = col === 'Checked';
    return cb({
      id: `checkbox-cat-label-${row.key}-${col.toLowerCase()}`,
      checked,
      disabled: row.disabled,
      label: 'Accetto i termini e le condizioni',
      description: 'Useremo i tuoi dati solo per ricontattarti.',
    });
  },
});

export const Catalog = {
  parameters: { layout: 'padded' },
  render: () => storyStack(mocksCard, bareMatrix, labelMatrix),
};
