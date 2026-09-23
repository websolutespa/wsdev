import { renderTwig } from '~sb/twig';
import { initModules } from '~sb/modules';
import { demoCard, storyStack } from '~sb/story-helpers';
import data from './collapsible.twig.json';

const mocks = data.mocks['collapsible'];
const TWIG_ID = '@components/base/collapsible/collapsible.twig';

export default {
  title: 'Base/Collapsible',
  render: (args) => renderTwig(TWIG_ID, args),
  argTypes: {
    triggerLabel: {
      control: 'text',
      description: 'Etichetta del trigger di default (bottone outline).',
      table: { category: 'Content' },
    },
    content: {
      control: 'text',
      description: 'Contenuto HTML del pannello.',
      table: { category: 'Content' },
    },
    open: {
      control: 'boolean',
      description: 'Stato iniziale.',
      table: { category: 'State', defaultValue: { summary: 'false' } },
    },
    id: {
      control: 'text',
      description: 'Se impostato, il pannello riceve id="<id>-content" e il trigger aria-controls a render time.',
      table: { category: 'Advanced' },
    },
    class: { table: { disable: true } },
    attrs: { table: { disable: true } },
  },
  parameters: { layout: 'centered' },
};

/* ── Default — Controls playground ───────────────────────────────────────── */

export const Default = { args: mocks['default'] };

/** Clicks the trigger once, toggling the panel open. */
export const Toggled = {
  args: mocks['default'],
  play: async ({ canvasElement }) => {
    await initModules(canvasElement);
    canvasElement.querySelector('[data-collapsible-trigger]').click();
  },
};

/* ── Catalog ──────────────────────────────────────────────────────────────── */

const closedCard = demoCard({
  title: 'Closed (default)',
  intro: 'Stato iniziale chiuso: il pannello resta nascosto finché il trigger non viene cliccato.',
  content: renderTwig(TWIG_ID, mocks['default']),
});

const openCard = demoCard({
  title: 'Initially open',
  intro: '<code>open: true</code> — il pannello è visibile al primo render senza alcuna interazione JS.',
  content: renderTwig(TWIG_ID, mocks['open']),
});

export const Catalog = {
  parameters: { layout: 'padded' },
  render: () => storyStack(closedCard, openCard),
};
