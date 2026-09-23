import { renderTwig } from '~sb/twig';
import { initModules } from '~sb/modules';
import { matrixCard, storyStack } from '~sb/story-helpers';
import data from './sheet.twig.json';

const mocks = data.mocks['sheet'];
const TWIG_ID = '@components/base/sheet/sheet.twig';

export default {
  title: 'Base/Sheet',
  render: (args) => renderTwig(TWIG_ID, args),
  argTypes: {
    side: {
      control: 'select',
      options: ['top', 'right', 'bottom', 'left'],
      description: 'Bordo dal quale scorre il pannello.',
      table: { category: 'Appearance', defaultValue: { summary: 'right' } },
    },
    title: {
      control: 'text',
      description: 'Testo del titolo (sheet-title), fortemente consigliato.',
      table: { category: 'Content' },
    },
    description: {
      control: 'text',
      description: 'Testo descrittivo (sheet-description).',
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
      description: 'Necessario per targeting esterno o più sheet sulla stessa pagina.',
      table: { category: 'Advanced' },
    },
    class: { table: { disable: true } },
    attrs: { table: { disable: true } },
  },
  parameters: { layout: 'centered' },
};

/* ── Default — Controls playground ───────────────────────────────────────── */

export const Default = { args: mocks['side-right'] };

/* ── Open stories — sheet opened programmatically (one per side) ─────────── */

const openPlay = async ({ canvasElement }) => {
  await initModules(canvasElement);
  canvasElement.querySelector('[data-dialog-trigger]').click();
};

export const Right = { args: mocks['side-right'], play: openPlay };
export const Left = { args: mocks['side-left'], play: openPlay };
export const Top = { args: mocks['side-top'], play: openPlay };
export const Bottom = { args: mocks['side-bottom'], play: openPlay };

/* ── Catalog ──────────────────────────────────────────────────────────────── */

/**
 * Rows: the four sides exposed by the `side` prop, closed triggers only —
 * the open state is covered by the Right/Left/Top/Bottom play() stories above.
 */
const SIDE_ROWS = [
  { key: 'side-right', label: 'Right (default)', args: mocks['side-right'] },
  { key: 'side-left', label: 'Left', args: mocks['side-left'] },
  { key: 'side-top', label: 'Top', args: mocks['side-top'] },
  { key: 'side-bottom', label: 'Bottom', args: mocks['side-bottom'] },
];

const STATE_COLUMNS = ['Default', 'Disabled'];

const sidesCard = matrixCard({
  title: 'Sheet — Side Variants',
  intro:
    'La prop <code>side</code> (right / left / top / bottom) controlla il bordo di scorrimento. ' +
    'Clic su un trigger per aprire; la colonna <code>Disabled</code> mostra solo lo stato visivo.',
  rowAxisLabel: 'Side',
  columns: STATE_COLUMNS,
  rows: SIDE_ROWS,
  renderCell: (col, row) => {
    if (col === 'Disabled') {
      return renderTwig('@components/base/button/button.twig', {
        label: row.args.triggerLabel,
        variant: 'outline',
        disabled: true,
      });
    }
    return renderTwig(TWIG_ID, {
      id: `sheet-cat-${row.key}`,
      ...row.args,
    });
  },
});

export const Catalog = {
  parameters: { layout: 'padded' },
  render: () => storyStack(sidesCard),
};
