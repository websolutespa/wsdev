import { renderTwig } from '~sb/twig';
import { initModules } from '~sb/modules';
import { demoCard, storyStack } from '~sb/story-helpers';
import data from './navigation-menu.twig.json';

const mocks = data.mocks['navigation-menu'];
const TWIG_ID = '@components/base/navigation-menu/navigation-menu.twig';

export default {
  title: 'Base/NavigationMenu',
  render: (args) => renderTwig(TWIG_ID, args),
  argTypes: {
    items: {
      control: 'object',
      description: 'Voci del menu: label, url ed eventuale items[] per un pannello ricco.',
      table: { category: 'Content' },
    },
    viewport: {
      control: 'boolean',
      description: 'Se true, i pannelli condividono un viewport morphing comune.',
      table: { category: 'Behaviour', defaultValue: { summary: 'true' } },
    },
    indicator: {
      control: 'boolean',
      description: 'Mostra la freccia indicatore che segue il trigger aperto.',
      table: { category: 'Appearance', defaultValue: { summary: 'false' } },
    },
    ariaLabel: {
      control: 'text',
      description: 'aria-label sul <nav>.',
      table: { category: 'Accessibility', defaultValue: { summary: 'Navigazione principale' } },
    },
    id: { table: { disable: true } },
    class: { table: { disable: true } },
    attrs: { table: { disable: true } },
  },
  parameters: { layout: 'centered' },
};

/* ── Default — Controls playground ───────────────────────────────────────── */

export const Default = { args: mocks['default'] };

/* ── Open — play() demo: opens the first panel ───────────────────────────── */

export const Open = {
  args: mocks['default'],
  play: async ({ canvasElement }) => {
    await initModules(canvasElement);
    canvasElement.querySelector('[data-slot="navigation-menu-trigger"]').click();
  },
};

/* ── Catalog ──────────────────────────────────────────────────────────────── */

const fullMenuCard = demoCard({
  title: 'Full menu (shared viewport)',
  intro:
    'Mix di trigger con pannello ricco (Prodotti, Risorse) e link semplici (Prezzi, Contatti). ' +
    'Clic su un trigger nel canvas per aprire il pannello.',
  content: renderTwig(TWIG_ID, mocks['default']),
});

const noViewportCard = demoCard({
  title: 'No shared viewport',
  intro: 'Con <code>viewport: false</code> ogni pannello resta sotto la propria voce invece di condividere un viewport morphing.',
  content: renderTwig(TWIG_ID, mocks['no-viewport']),
});

const indicatorCard = demoCard({
  title: 'With indicator arrow',
  intro: 'Con <code>indicator: true</code> viene mostrata la freccia che segue il trigger aperto.',
  content: renderTwig(TWIG_ID, mocks['with-indicator']),
});

const linksOnlyCard = demoCard({
  title: 'Links only (no panels)',
  intro: 'Tutte le voci sono semplici <code>&lt;a&gt;</code> — nessun pannello, nessun trigger.',
  content: renderTwig(TWIG_ID, mocks['links-only']),
});

export const Catalog = {
  parameters: { layout: 'padded' },
  render: () => storyStack(fullMenuCard, noViewportCard, indicatorCard, linksOnlyCard),
};
