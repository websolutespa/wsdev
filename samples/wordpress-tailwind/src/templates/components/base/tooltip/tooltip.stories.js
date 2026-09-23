import { renderTwig } from '~sb/twig';
import { initModules } from '~sb/modules';
import { matrixCard, storyStack } from '~sb/story-helpers';
import data from './tooltip.twig.json';

const mocks = data.mocks['tooltip'];
const TWIG_ID = '@components/base/tooltip/tooltip.twig';

export default {
  title: 'Base/Tooltip',
  render: (args) => renderTwig(TWIG_ID, args),
  argTypes: {
    text: {
      control: 'text',
      description: 'Contenuto del tooltip.',
      table: { category: 'Content' },
    },
    side: {
      control: 'select',
      options: ['top', 'right', 'bottom', 'left'],
      description: 'Lato del trigger su cui posizionare il pannello.',
      table: { category: 'Appearance', defaultValue: { summary: 'top' } },
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
      table: { category: 'Appearance', defaultValue: { summary: '0' } },
    },
    delay: {
      control: 'number',
      description: 'Ritardo in ms prima dell\'apertura su hover/focus.',
      table: { category: 'Behaviour', defaultValue: { summary: '700' } },
    },
    triggerLabel: {
      control: 'text',
      description: 'Etichetta del trigger di default (bottone outline).',
      table: { category: 'Content' },
    },
    id: { table: { disable: true } },
    class: { table: { disable: true } },
  },
  parameters: { layout: 'centered' },
};

/* ── Default — Controls playground ───────────────────────────────────────── */

export const Default = { args: mocks['default'] };

/** Opening is delayed (data-delay, default 700ms) before the panel un-hides. */
export const Shown = {
  args: mocks['default'],
  play: async ({ canvasElement }) => {
    await initModules(canvasElement);
    const trigger = canvasElement.querySelector('[data-tooltip-trigger]');
    trigger.dispatchEvent(new PointerEvent('pointerenter', { bubbles: true }));
    await new Promise((resolve) => setTimeout(resolve, 800));
  },
};

/* ── Catalog ──────────────────────────────────────────────────────────────── */

/**
 * Tooltip activates on hover and focus — not click. Hover over or tab-focus
 * each trigger to reveal the tooltip. Single "Example" column since there is
 * no meaningful disabled state distinct from the trigger button's own.
 */
const SIDE_ROWS = [
  { key: 'default', label: 'Top (default)', args: mocks['default'] },
  { key: 'side-right', label: 'Right', args: mocks['side-right'] },
  { key: 'side-bottom', label: 'Bottom', args: mocks['side-bottom'] },
  { key: 'side-left', label: 'Left', args: mocks['side-left'] },
];

const sidesCard = matrixCard({
  title: 'Tooltip — Side Variants',
  intro:
    'Passa il mouse (o naviga con Tab) su un trigger per rivelare il tooltip. La prop <code>side</code> ' +
    'controlla dove appare il pannello rispetto al trigger.',
  rowAxisLabel: 'Side',
  columns: ['Example'],
  rows: SIDE_ROWS,
  renderCell: (_col, row) =>
    renderTwig(TWIG_ID, {
      id: `tt-cat-${row.key}`,
      ...row.args,
    }),
});

/* ─── 2. Common actions with labels ──────────────────────────────────────── */

/**
 * Demonstrates tooltips on action buttons — a common accessibility pattern.
 * triggerLabel renders an outline button; use the 'trigger' block override in
 * production Twig templates for icon-only buttons.
 */
const ACTION_ROWS = [
  { key: 'search', label: 'Cerca', text: 'Cerca' },
  { key: 'copy', label: 'Copia', text: 'Copia negli appunti' },
  { key: 'settings', label: 'Impostazioni', text: 'Apri le impostazioni' },
  { key: 'info', label: 'Info', text: 'Maggiori informazioni' },
];

const actionsCard = matrixCard({
  title: 'Action Button Triggers',
  intro: 'Tooltip che avvolge trigger a bottone. Passa il mouse o naviga con Tab per rivelare l\'etichetta.',
  rowAxisLabel: 'Action',
  columns: ['Example'],
  rows: ACTION_ROWS,
  renderCell: (_col, row) =>
    renderTwig(TWIG_ID, {
      id: `tt-act-${row.key}`,
      side: 'top',
      triggerLabel: row.label,
      text: row.text,
    }),
});

export const Catalog = {
  parameters: { layout: 'padded' },
  render: () => storyStack(sidesCard, actionsCard),
};
