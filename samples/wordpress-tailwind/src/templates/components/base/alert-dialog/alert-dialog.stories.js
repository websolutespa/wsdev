import { renderTwig } from '~sb/twig';
import { initModules } from '~sb/modules';
import { matrixCard, storyStack } from '~sb/story-helpers';
import data from './alert-dialog.twig.json';

const mocks = data.mocks['alert-dialog'];
const TWIG_ID = '@components/base/alert-dialog/alert-dialog.twig';

export default {
  title: 'Base/AlertDialog',
  render: (args) => renderTwig(TWIG_ID, args),
  argTypes: {
    title: {
      control: 'text',
      description: 'Testo del titolo (alert-dialog-title).',
      table: { category: 'Content' },
    },
    description: {
      control: 'text',
      description: 'Testo descrittivo (alert-dialog-description).',
      table: { category: 'Content' },
    },
    icon: {
      control: 'text',
      description: 'Nome icona sprite renderizzata nello slot media opzionale.',
      table: { category: 'Content' },
    },
    cancelLabel: {
      control: 'text',
      description: 'Etichetta del pulsante di annullamento.',
      table: { category: 'Content', defaultValue: { summary: 'Annulla' } },
    },
    actionLabel: {
      control: 'text',
      description: 'Etichetta del pulsante di conferma.',
      table: { category: 'Content', defaultValue: { summary: 'Continua' } },
    },
    destructive: {
      control: 'boolean',
      description: 'Il pulsante di conferma usa la variante distruttiva.',
      table: { category: 'Appearance', defaultValue: { summary: 'false' } },
    },
    size: {
      control: 'select',
      options: ['default', 'sm'],
      description: 'Dimensione del contenuto (data-size).',
      table: { category: 'Appearance', defaultValue: { summary: 'default' } },
    },
    triggerLabel: {
      control: 'text',
      description:
        'Etichetta del trigger di default (bottone outline); se omesso, apertura solo esterna via data-dialog-open.',
      table: { category: 'Content' },
    },
    id: {
      control: 'text',
      description: 'Necessario per targeting esterno o più alert dialog sulla stessa pagina.',
      table: { category: 'Advanced' },
    },
    class: { table: { disable: true } },
    attrs: { table: { disable: true } },
  },
  parameters: { layout: 'centered' },
};

/* ── Default — Controls playground ───────────────────────────────────────── */

export const Default = { args: mocks['default'] };

/* ── Open — alert dialog programmatically opened ─────────────────────────── */

export const Open = {
  args: mocks['default'],
  play: async ({ canvasElement }) => {
    await initModules(canvasElement);
    canvasElement.querySelector('[data-dialog-trigger]').click();
  },
};

/* ── Catalog ──────────────────────────────────────────────────────────────── */

/**
 * Rows: the mock scenarios (default, destructive, small size, with media icon).
 * Columns: working trigger vs. disabled trigger visual state.
 */
const VARIANT_ROWS = [
  { key: 'default', label: 'Default', args: mocks['default'] },
  { key: 'destructive', label: 'Destructive', args: mocks['destructive'] },
  { key: 'size-sm', label: 'Small size', args: mocks['size-sm'] },
  { key: 'with-media', label: 'With media icon', args: mocks['with-media'] },
];

const STATE_COLUMNS = ['Default', 'Disabled'];

const variantsCard = matrixCard({
  title: 'Alert Dialog Variants',
  intro:
    'Scenari di conferma (<code>default</code>), azione distruttiva, dimensione <code>sm</code> e slot media ' +
    'con icona. Clic su un trigger per aprire; la colonna <code>Disabled</code> mostra solo lo stato visivo.',
  rowAxisLabel: 'Scenario',
  columns: STATE_COLUMNS,
  rows: VARIANT_ROWS,
  renderCell: (col, row) => {
    if (col === 'Disabled') {
      return renderTwig('@components/base/button/button.twig', {
        label: 'Apri alert',
        variant: 'outline',
        disabled: true,
      });
    }
    return renderTwig(TWIG_ID, {
      id: `alert-dialog-cat-${row.key}`,
      ...row.args,
    });
  },
});

export const Catalog = {
  parameters: { layout: 'padded' },
  render: () => storyStack(variantsCard),
};
