import { renderTwig } from '~sb/twig';
import { initModules } from '~sb/modules';
import { matrixCard, storyStack } from '~sb/story-helpers';
import data from './hover-card.twig.json';

const mocks = data.mocks['hover-card'];
const TWIG_ID = '@components/base/hover-card/hover-card.twig';

export default {
  title: 'Base/HoverCard',
  render: (args) => renderTwig(TWIG_ID, args),
  argTypes: {
    triggerLabel: {
      control: 'text',
      description: 'Testo del trigger di default (link).',
      table: { category: 'Content' },
    },
    triggerUrl: {
      control: 'text',
      description: 'Href del trigger di default.',
      table: { category: 'Content', defaultValue: { summary: '#' } },
    },
    title: {
      control: 'text',
      description: 'Titolo del layout di contenuto di default.',
      table: { category: 'Content' },
    },
    text: {
      control: 'text',
      description: 'Testo del corpo del layout di contenuto di default.',
      table: { category: 'Content' },
    },
    meta: {
      control: 'text',
      description: 'Riga di nota a piè di pagina, in tono attenuato.',
      table: { category: 'Content' },
    },
    openDelay: {
      control: 'number',
      description: 'Millisecondi di attesa prima dell\'apertura su hover/focus.',
      table: { category: 'Behaviour', defaultValue: { summary: '700' } },
    },
    closeDelay: {
      control: 'number',
      description: 'Millisecondi di attesa dopo l\'uscita da trigger e pannello prima della chiusura.',
      table: { category: 'Behaviour', defaultValue: { summary: '300' } },
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
    id: { table: { disable: true } },
    class: { table: { disable: true } },
    attrs: { table: { disable: true } },
  },
  parameters: { layout: 'centered' },
};

/* ── Default — Controls playground ───────────────────────────────────────── */

export const Default = { args: mocks['default'] };

/* ── Open — card opened via focus (openDelay: 0 for stability) ───────────── */

export const Open = {
  args: { ...mocks['default'], openDelay: 0 },
  play: async ({ canvasElement }) => {
    await initModules(canvasElement);
    canvasElement.querySelector('[data-slot="hover-card-trigger"]').focus();
  },
};

/* ── Catalog ──────────────────────────────────────────────────────────────── */

/**
 * Hover-card opens on hover/focus, not click — each cell is a link trigger;
 * hover or tab-focus it to reveal the card. Single "Example" column since
 * there is no meaningful disabled state for a plain link trigger.
 */
const SIDE_ROWS = [
  { key: 'default', label: 'Bottom (default)', args: mocks['default'] },
  { key: 'side-top', label: 'Top', args: mocks['side-top'] },
  { key: 'align-start', label: 'Align start', args: mocks['align-start'] },
];

const sidesCard = matrixCard({
  title: 'HoverCard — Side & Align Variants',
  intro:
    'Passa il mouse (o naviga con Tab) su un trigger per rivelare la card. Le prop <code>side</code> e ' +
    '<code>align</code> controllano dove si apre il pannello rispetto al trigger.',
  rowAxisLabel: 'Scenario',
  columns: ['Example'],
  rows: SIDE_ROWS,
  renderCell: (_col, row) =>
    renderTwig(TWIG_ID, {
      id: `hc-cat-${row.key}`,
      openDelay: 200,
      ...row.args,
    }),
});

/* ─── 2. Open delay variants ─────────────────────────────────────────────── */

const DELAY_ROWS = [
  { key: 'instant', label: 'Instant (0 ms)', delay: 0 },
  { key: 'default', label: 'Default (700 ms)', delay: 700 },
  { key: 'slow', label: 'Slow (1500 ms)', delay: 1500 },
];

const delayCard = matrixCard({
  title: 'Open Delay',
  intro: 'La prop <code>openDelay</code> (ms) controlla quanto attendere prima di mostrare la card su hover/focus.',
  rowAxisLabel: 'Delay',
  columns: ['Example'],
  rows: DELAY_ROWS,
  renderCell: (_col, row) =>
    renderTwig(TWIG_ID, {
      id: `hc-delay-${row.key}`,
      openDelay: row.delay,
      triggerLabel: `Passa il mouse qui (${row.label})`,
      triggerUrl: '#',
      title: 'Hover card',
      text: 'Questa card si apre dopo il ritardo configurato.',
    }),
});

export const Catalog = {
  parameters: { layout: 'padded' },
  render: () => storyStack(sidesCard, delayCard),
};
