import { renderTwig } from '~sb/twig';
import { initModules } from '~sb/modules';
import { demoCard, matrixCard, storyStack } from '~sb/story-helpers';
import data from './dialog.twig.json';

const mocks = data.mocks['dialog'];
const TWIG_ID = '@components/base/dialog/dialog.twig';

export default {
  title: 'Base/Dialog',
  render: (args) => renderTwig(TWIG_ID, args),
  argTypes: {
    title: {
      control: 'text',
      description: 'Testo del titolo (dialog-title), collegato via aria-labelledby a runtime.',
      table: { category: 'Content' },
    },
    description: {
      control: 'text',
      description: 'Testo descrittivo (dialog-description), collegato via aria-describedby a runtime.',
      table: { category: 'Content' },
    },
    triggerLabel: {
      control: 'text',
      description:
        'Etichetta del trigger di default (bottone outline); se omesso, apertura solo esterna via data-dialog-open.',
      table: { category: 'Content' },
    },
    showCloseButton: {
      control: 'boolean',
      description: 'Mostra il pulsante di chiusura in alto a destra.',
      table: { category: 'Appearance', defaultValue: { summary: 'true' } },
    },
    static: {
      control: 'boolean',
      description: 'Disabilita la chiusura al click sullo sfondo (Esc resta attivo).',
      table: { category: 'Behaviour', defaultValue: { summary: 'false' } },
    },
    id: {
      control: 'text',
      description: 'Necessario per targeting esterno (data-dialog-open) o più dialog sulla stessa pagina.',
      table: { category: 'Advanced' },
    },
    class: { table: { disable: true } },
    attrs: { table: { disable: true } },
  },
  parameters: { layout: 'centered' },
};

/* ── Default — Controls playground ───────────────────────────────────────── */

export const Default = { args: mocks['default'] };

/* ── Open — dialog programmatically opened ───────────────────────────────── */

export const Open = {
  args: mocks['default'],
  play: async ({ canvasElement }) => {
    await initModules(canvasElement);
    canvasElement.querySelector('[data-dialog-trigger]').click();
  },
};

/* ── Catalog ──────────────────────────────────────────────────────────────── */

/* ─── 1. Trigger variants (mock scenarios) ──────────────────────────────── */

const TRIGGER_ROWS = [
  { key: 'default', label: 'Default', args: mocks['default'] },
  { key: 'no-close-button', label: 'No close button', args: mocks['no-close-button'] },
  { key: 'static', label: 'Static (no light dismiss)', args: mocks['static'] },
];

const STATE_COLUMNS = ['Default', 'Disabled'];

const triggerCard = matrixCard({
  title: 'Dialog Triggers',
  intro:
    'Ogni cella è un trigger funzionante: clic per aprire. La colonna <code>Disabled</code> mostra il ' +
    'trigger nel suo stato visivo disabilitato, senza aprire nulla.',
  rowAxisLabel: 'Scenario',
  columns: STATE_COLUMNS,
  rows: TRIGGER_ROWS,
  renderCell: (col, row) => {
    if (col === 'Disabled') {
      return renderTwig('@components/base/button/button.twig', {
        label: 'Apri dialog',
        variant: 'outline',
        disabled: true,
      });
    }
    return renderTwig(TWIG_ID, {
      id: `dialog-cat-${row.key}`,
      triggerLabel: 'Apri dialog',
      ...row.args,
    });
  },
});

/* ─── 2. Demo — full dialog with footer ─────────────────────────────────── */

const footerDemo = demoCard({
  title: 'With Footer Actions',
  intro:
    'Dialog con header, descrizione e footer a due pulsanti secondo la convenzione ' +
    '<code>flex-col-reverse sm:flex-row sm:justify-end</code>.',
  content: renderTwig(TWIG_ID, {
    id: 'dialog-cat-footer',
    triggerLabel: 'Modifica profilo',
    title: 'Modifica profilo',
    description: 'Aggiorna le informazioni del tuo profilo. Clicca su salva quando hai finito.',
  }),
});

export const Catalog = {
  parameters: { layout: 'padded' },
  render: () => storyStack(triggerCard, footerDemo),
};
