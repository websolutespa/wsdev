import { renderTwig } from '~sb/twig';
import { initModules } from '~sb/modules';
import { matrixCard, storyStack } from '~sb/story-helpers';
import data from './popover.twig.json';

const mocks = data.mocks['popover'];
const TWIG_ID = '@components/base/popover/popover.twig';

export default {
  title: 'Base/Popover',
  render: (args) => renderTwig(TWIG_ID, args),
  argTypes: {
    title: {
      control: 'text',
      description: 'Titolo nel popover-header (collegato via aria-labelledby a runtime).',
      table: { category: 'Content' },
    },
    text: {
      control: 'text',
      description: 'Testo del corpo nel popover-header (aria-describedby).',
      table: { category: 'Content' },
    },
    triggerLabel: {
      control: 'text',
      description: 'Etichetta del trigger di default (bottone outline).',
      table: { category: 'Content' },
    },
    side: {
      control: 'select',
      options: ['top', 'right', 'bottom', 'left'],
      description: 'Lato del trigger su cui posizionare il pannello.',
      table: { category: 'Appearance', defaultValue: { summary: 'bottom' } },
    },
    align: {
      control: 'select',
      options: ['start', 'center', 'end'],
      description: 'Allineamento del pannello lungo il lato scelto.',
      table: { category: 'Appearance', defaultValue: { summary: 'center' } },
    },
    sideOffset: {
      control: 'number',
      description: 'Distanza in px tra trigger e pannello.',
      table: { category: 'Appearance', defaultValue: { summary: '4' } },
    },
    id: {
      control: 'text',
      description: 'Id del popover-content (target aria-controls); generato dal modulo se omesso.',
      table: { category: 'Advanced' },
    },
    class: { table: { disable: true } },
    attrs: { table: { disable: true } },
  },
  parameters: { layout: 'centered' },
};

/* ── Default — Controls playground ───────────────────────────────────────── */

export const Default = { args: mocks['default'] };

/* ── Open — popover programmatically opened ──────────────────────────────── */

export const Open = {
  args: mocks['default'],
  play: async ({ canvasElement }) => {
    await initModules(canvasElement);
    canvasElement.querySelector('[data-popover-trigger]').click();
  },
};

/* ── Catalog ──────────────────────────────────────────────────────────────── */

/* ─── 1. Side/align variants — closed triggers ──────────────────────────── */

const SIDE_ROWS = [
  { key: 'default', label: 'Bottom (default)', args: mocks['default'] },
  { key: 'side-top', label: 'Top', args: mocks['side-top'] },
  { key: 'align-start', label: 'Align start', args: mocks['align-start'] },
  { key: 'align-end', label: 'Align end', args: mocks['align-end'] },
];

const STATE_COLUMNS = ['Default', 'Disabled'];

const sidesCard = matrixCard({
  title: 'Popover — Side & Align Variants',
  intro:
    'Le prop <code>side</code> e <code>align</code> controllano il posizionamento del pannello. ' +
    'Clic su un trigger per aprire; la colonna <code>Disabled</code> mostra solo lo stato visivo.',
  rowAxisLabel: 'Scenario',
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
      id: `pop-cat-${row.key}`,
      ...row.args,
    });
  },
});

export const Catalog = {
  parameters: { layout: 'padded' },
  render: () => storyStack(sidesCard),
};
