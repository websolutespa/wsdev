import { renderTwig } from '~sb/twig';
import { initModules } from '~sb/modules';
import { demoCard, storyStack } from '~sb/story-helpers';
import data from './menubar.twig.json';

const mocks = data.mocks['menubar'];
const TWIG_ID = '@components/base/menubar/menubar.twig';

export default {
  title: 'Base/Menubar',
  render: (args) => renderTwig(TWIG_ID, args),
  argTypes: {
    menus: {
      control: 'object',
      description: 'Un elemento per ogni menu di primo livello: { label, items }.',
      table: { category: 'Content' },
    },
    ariaLabel: {
      control: 'text',
      description: 'aria-label sulla menubar.',
      table: { category: 'Accessibility', defaultValue: { summary: 'Barra dei menu' } },
    },
    id: { table: { disable: true } },
    class: { table: { disable: true } },
    attrs: { table: { disable: true } },
  },
  parameters: { layout: 'padded' },
};

/* ── Default — Controls playground ───────────────────────────────────────── */

export const Default = { args: mocks['default'] };

/* ── Open — first menu opened; ArrowRight switches to second ─────────────── */

export const Open = {
  args: mocks['default'],
  play: async ({ canvasElement }) => {
    await initModules(canvasElement);
    const triggers = canvasElement.querySelectorAll('[data-slot="menubar-trigger"]');
    if (!triggers.length) return;
    triggers[0].focus();
    triggers[0].click();
    triggers[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true }));
  },
};

/* ── Catalog ──────────────────────────────────────────────────────────────── */

/**
 * Menubar has no trigger variant or side axis — it's always a full horizontal
 * bar. The Catalog stacks the mock scenarios as demoCards; click a trigger to
 * open its menu and use arrow keys to navigate between menus.
 */

const appMenubarDemo = demoCard({
  title: 'Application Menubar',
  intro:
    'Menubar applicativa completa con menu File, Modifica e Aiuto. Clic su un trigger per aprire; ' +
    'frecce direzionali per navigare tra i menu.',
  content: renderTwig(TWIG_ID, { id: 'mb-cat-app', ...mocks['default'] }),
});

const submenuDemo = demoCard({
  title: 'With Submenu',
  intro: 'Menubar con un sottomenu annidato a più livelli e una voce distruttiva.',
  content: renderTwig(TWIG_ID, { id: 'mb-cat-submenu', ...mocks['with-submenu'] }),
});

const selectionDemo = demoCard({
  title: 'Checkbox & Radio Items',
  intro: 'Menubar con voci checkbox e un gruppo radio (zoom), più una sezione con voci con indentazione.',
  content: renderTwig(TWIG_ID, { id: 'mb-cat-selection', ...mocks['checkbox-radio'] }),
});

export const Catalog = {
  parameters: { layout: 'padded' },
  render: () => storyStack(appMenubarDemo, submenuDemo, selectionDemo),
};
