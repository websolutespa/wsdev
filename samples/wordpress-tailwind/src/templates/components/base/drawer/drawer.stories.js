import { renderTwig } from '~sb/twig';
import { initModules } from '~sb/modules';
import { matrixCard, storyStack } from '~sb/story-helpers';
import data from './drawer.twig.json';

const mocks = data.mocks['drawer'];
const TWIG_ID = '@components/base/drawer/drawer.twig';

export default {
  title: 'Base/Drawer',
  render: (args) => renderTwig(TWIG_ID, args),
  argTypes: {
    direction: {
      control: 'select',
      options: ['top', 'right', 'bottom', 'left'],
      description: 'Bordo dal quale scorre il pannello.',
      table: { category: 'Appearance', defaultValue: { summary: 'bottom' } },
    },
    title: {
      control: 'text',
      description: 'Testo del titolo (drawer-title), fortemente consigliato.',
      table: { category: 'Content' },
    },
    description: {
      control: 'text',
      description: 'Testo descrittivo (drawer-description).',
      table: { category: 'Content' },
    },
    triggerLabel: {
      control: 'text',
      description:
        'Etichetta del trigger di default (bottone outline); se omesso, apertura solo esterna via data-dialog-open.',
      table: { category: 'Content' },
    },
    static: {
      control: 'boolean',
      description: 'Disabilita la chiusura al click sullo sfondo (Esc resta attivo).',
      table: { category: 'Behaviour', defaultValue: { summary: 'false' } },
    },
    id: {
      control: 'text',
      description: 'Necessario per targeting esterno o più drawer sulla stessa pagina.',
      table: { category: 'Advanced' },
    },
    class: { table: { disable: true } },
    attrs: { table: { disable: true } },
  },
  parameters: { layout: 'centered' },
};

/* ── Default — Controls playground ───────────────────────────────────────── */

export const Default = { args: mocks['direction-bottom'] };

/* ── Open — drawer opened programmatically (one per direction) ──────────── */

const openPlay = async ({ canvasElement }) => {
  await initModules(canvasElement);
  canvasElement.querySelector('[data-dialog-trigger]').click();
};

export const Bottom = { args: mocks['direction-bottom'], play: openPlay };
export const Top = { args: mocks['direction-top'], play: openPlay };
export const Right = { args: mocks['direction-right'], play: openPlay };
export const Left = { args: mocks['direction-left'], play: openPlay };

/* ── Catalog ──────────────────────────────────────────────────────────────── */

/**
 * Rows: the four directions exposed by the `direction` prop, closed triggers
 * only — open state is covered by the Bottom/Top/Right/Left play() stories
 * above. The grab handle only appears for direction == 'bottom' (Twig behaviour).
 */
const DIRECTION_ROWS = [
  { key: 'direction-bottom', label: 'Bottom (default)', args: mocks['direction-bottom'] },
  { key: 'direction-top', label: 'Top', args: mocks['direction-top'] },
  { key: 'direction-right', label: 'Right', args: mocks['direction-right'] },
  { key: 'direction-left', label: 'Left', args: mocks['direction-left'] },
];

const STATE_COLUMNS = ['Default', 'Disabled'];

const directionsCard = matrixCard({
  title: 'Drawer — Direction Variants',
  intro:
    'La prop <code>direction</code> controlla il bordo di scorrimento; <code>bottom</code> (default) include ' +
    'la maniglia di trascinamento. Clic su un trigger per aprire; la colonna <code>Disabled</code> mostra solo lo stato visivo.',
  rowAxisLabel: 'Direction',
  columns: STATE_COLUMNS,
  rows: DIRECTION_ROWS,
  renderCell: (col, row) => {
    if (col === 'Disabled') {
      return renderTwig('@components/base/button/button.twig', {
        label: row.args.triggerLabel,
        variant: 'outline',
        disabled: true,
      });
    }
    return renderTwig(TWIG_ID, {
      id: `drawer-cat-${row.key}`,
      ...row.args,
    });
  },
});

export const Catalog = {
  parameters: { layout: 'padded' },
  render: () => storyStack(directionsCard),
};
