import { renderTwig } from '~sb/twig';
import { demoCard, matrixCard, storyStack, stateProps } from '~sb/story-helpers';
import data from './textarea.twig.json';

const mocks = data.mocks['textarea'];
const TWIG_ID = '@components/base/textarea/textarea.twig';

export default {
  title: 'Base/Textarea',
  render: (args) => renderTwig(TWIG_ID, args),
  argTypes: {
    name: {
      control: 'text',
      description: 'Name del campo, richiesto per il submit del form.',
      table: { category: 'Content' },
    },
    id: {
      control: 'text',
      description: 'Richiesto per collegare un <label for> lato SSR (mai generato in Twig).',
      table: { category: 'Accessibility' },
    },
    value: {
      control: 'text',
      description: 'Contenuto iniziale.',
      table: { category: 'Content' },
    },
    placeholder: {
      control: 'text',
      description: 'Testo segnaposto mostrato quando il campo è vuoto.',
      table: { category: 'Content' },
    },
    rows: {
      control: 'number',
      description: 'Fallback nativo di righe, usato dove field-sizing-content non è supportato.',
      table: { category: 'Appearance' },
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
      description: 'Imposta aria-invalid="true", attivando le classi aria-invalid.',
      table: { category: 'State' },
    },
    ariaLabel: {
      control: 'text',
      description: 'Nome accessibile quando non è presente un <label for> visibile.',
      table: { category: 'Accessibility' },
    },
    class: { table: { disable: true } },
    attrs: { table: { disable: true } },
  },
  parameters: { layout: 'padded' },
};

/* ── Default — interactive playground ─────────────────────────────────── */

export const Default = { args: mocks.default };

/* ── Catalog — mock scenarios + configuration × state matrix ─────────────── */

function ta(args) {
  return renderTwig(TWIG_ID, args);
}

const mocksCard = demoCard({
  title: 'Mock scenarios',
  intro: 'Tutti gli scenari definiti in <code>textarea.twig.json</code>.',
  content: `<div class="flex flex-col gap-3 max-w-sm">
    ${ta(mocks.value)}
    ${ta(mocks.invalid)}
    ${ta(mocks.disabled)}
    ${ta(mocks.rows)}
  </div>`,
});

/**
 * Textarea configurations × states. textarea.twig defines focus-visible: ring
 * classes but no hover:/active: utilities — a static Hover/Active column would
 * render identically to Default, so only Default/Focus/Invalid/Disabled are shown.
 */
const STATE_COLS = ['Default', 'Focus', 'Invalid', 'Disabled'];

const CONFIG_ROWS = [
  {
    key: 'placeholder',
    label: 'Placeholder',
    base: { name: 'messaggio', id: 'messaggio', placeholder: 'Scrivi qui il tuo messaggio' },
  },
  {
    key: 'withValue',
    label: 'With value',
    base: {
      name: 'brief',
      id: 'brief',
      value: 'Cliente contattato il 12/09, richiamare la prossima settimana.',
    },
  },
  {
    key: 'rows',
    label: 'rows=6',
    base: { name: 'long-message', id: 'long-message', rows: 6, placeholder: 'Descrivi la tua richiesta in dettaglio' },
  },
];

const configMatrix = matrixCard({
  title: 'Textarea States',
  rowAxisLabel: 'Configuration',
  intro:
    'Configurazioni × stati di validazione. <code>invalid</code> imposta ' +
    '<code>aria-invalid="true"</code>, attivando la ring <code>aria-invalid:border-destructive</code>. ' +
    '<code>disabled</code> usa l’attributo nativo. Il campo si auto-dimensiona con ' +
    '<code>field-sizing-content</code>; <code>rows</code> imposta l’altezza minima di fallback.',
  columns: STATE_COLS,
  rows: CONFIG_ROWS,
  center: false,
  renderCell: (col, row) => {
    if (col === 'Invalid') return ta({ ...row.base, invalid: true });
    if (col === 'Disabled') return ta({ ...row.base, disabled: true });
    if (col === 'Focus') return ta({ ...row.base, ...stateProps('Focus') });
    return ta({ ...row.base });
  },
});

export const Catalog = {
  parameters: { layout: 'padded' },
  render: () => storyStack(mocksCard, configMatrix),
};
