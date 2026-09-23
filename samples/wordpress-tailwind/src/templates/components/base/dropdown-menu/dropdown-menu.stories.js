import { renderTwig } from '~sb/twig';
import { initModules } from '~sb/modules';
import { matrixCard, storyStack } from '~sb/story-helpers';
import data from './dropdown-menu.twig.json';

const mocks = data.mocks['dropdown-menu'];
const TWIG_ID = '@components/base/dropdown-menu/dropdown-menu.twig';

export default {
  title: 'Base/DropdownMenu',
  render: (args) => renderTwig(TWIG_ID, args),
  argTypes: {
    items: {
      control: 'object',
      description:
        'Contenuto del menu, in ordine: ogni voce ha kind (item/checkbox/radio/separator/label/group/sub), label, icon, ecc.',
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
      table: { category: 'Appearance', defaultValue: { summary: 'start' } },
    },
    sideOffset: {
      control: 'number',
      description: 'Distanza in px tra trigger e pannello.',
      table: { category: 'Appearance', defaultValue: { summary: '4' } },
    },
    id: { table: { disable: true } },
    class: { table: { disable: true } },
    attrs: { table: { disable: true } },
  },
  parameters: { layout: 'centered' },
};

/* ── Default — Controls playground ───────────────────────────────────────── */

export const Default = { args: mocks['default'] };

/* ── Open — menu programmatically opened via ArrowDown ───────────────────── */

export const Open = {
  args: mocks['default'],
  play: async ({ canvasElement }) => {
    await initModules(canvasElement);
    const trigger = canvasElement.querySelector('[data-menu-trigger]');
    trigger.focus();
    trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true }));
  },
};

/* ── Catalog ──────────────────────────────────────────────────────────────── */

/* ─── 1. Content types (mock scenarios) ─────────────────────────────────── */

const CONTENT_ROWS = [
  { key: 'default', label: 'Standard', args: mocks['default'] },
  { key: 'groups', label: 'Groups', args: mocks['groups'] },
  { key: 'with-submenu', label: 'Submenu', args: mocks['with-submenu'] },
  { key: 'checkbox-radio', label: 'Checkbox/Radio', args: mocks['checkbox-radio'] },
  { key: 'destructive', label: 'Destructive item', args: mocks['destructive'] },
  { key: 'disabled-items', label: 'Disabled items', args: mocks['disabled-items'] },
];

const STATE_COLUMNS = ['Default', 'Disabled trigger'];

const contentTypesCard = matrixCard({
  title: 'Dropdown Content Types',
  intro:
    'Sei forme di contenuto — voci standard, gruppi, submenu, checkbox/radio, azione distruttiva, voci disabilitate — ' +
    'attraverso i trigger Default e Disabled. Ogni cella è un dropdown funzionante: clic per aprire.',
  rowAxisLabel: 'Content',
  columns: STATE_COLUMNS,
  rows: CONTENT_ROWS,
  renderCell: (col, row) => {
    if (col === 'Disabled trigger') {
      return renderTwig('@components/base/button/button.twig', {
        label: row.args.triggerLabel,
        variant: 'outline',
        disabled: true,
      });
    }
    return renderTwig(TWIG_ID, {
      id: `dd-cat-${row.key}`,
      ...row.args,
    });
  },
});

/* ─── 2. Side & align placement ──────────────────────────────────────────── */

const PLACEMENT_ROWS = [
  { key: 'bottom', label: 'Bottom (default)', args: { side: 'bottom', triggerLabel: 'Apri' } },
  { key: 'top', label: 'Top', args: { side: 'top', triggerLabel: 'Apri' } },
  { key: 'right', label: 'Right', args: { side: 'right', triggerLabel: 'Apri' } },
  { key: 'left', label: 'Left', args: { side: 'left', triggerLabel: 'Apri' } },
  { key: 'align-end', label: 'Align end', args: mocks['align-end'] },
];

const placementCard = matrixCard({
  title: 'Side & Align Placement',
  intro:
    'Le prop <code>side</code> e <code>align</code> controllano dove si apre il pannello rispetto al trigger. ' +
    'Clic su ogni trigger per verificare il posizionamento.',
  rowAxisLabel: 'Placement',
  columns: ['Example'],
  rows: PLACEMENT_ROWS,
  renderCell: (_col, row) =>
    renderTwig(TWIG_ID, {
      id: `dd-place-${row.key}`,
      items: mocks['destructive'].items,
      ...row.args,
    }),
});

export const Catalog = {
  parameters: { layout: 'padded' },
  render: () => storyStack(contentTypesCard, placementCard),
};
