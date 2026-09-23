import { renderTwig } from '~sb/twig';
import { initModules } from '~sb/modules';
import { demoCard, storyStack } from '~sb/story-helpers';
import data from './context-menu.twig.json';

const mocks = data.mocks['context-menu'];
const TWIG_ID = '@components/base/context-menu/context-menu.twig';

export default {
  title: 'Base/ContextMenu',
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
      description: 'Testo dentro l\'area di clic destro di default.',
      table: { category: 'Content' },
    },
    triggerClass: {
      control: 'text',
      description: 'Classi sull\'area di clic destro di default (default: box tratteggiato 8rem).',
      table: { category: 'Appearance' },
    },
    id: { table: { disable: true } },
    class: { table: { disable: true } },
    attrs: { table: { disable: true } },
  },
  parameters: { layout: 'centered' },
};

/* ── Default — Controls playground ───────────────────────────────────────── */

export const Default = { args: mocks['default'] };

/** Simulates the right-click that opens the menu (the module has no click-to-open path). */
export const Opened = {
  args: mocks['default'],
  play: async ({ canvasElement }) => {
    await initModules(canvasElement);
    const trigger = canvasElement.querySelector('[data-slot="context-menu-trigger"]');
    const rect = trigger.getBoundingClientRect();
    trigger.dispatchEvent(
      new MouseEvent('contextmenu', {
        bubbles: true,
        cancelable: true,
        clientX: rect.left + rect.width / 2,
        clientY: rect.top + rect.height / 2,
      })
    );
  },
};

/* ── Catalog ──────────────────────────────────────────────────────────────── */

/**
 * Context-menu has no trigger button variant axis — the trigger is always the
 * right-click surface (block target), so the mock scenarios are stacked as
 * demoCards rather than a matrix. Right-click each dashed area to open the menu.
 */

const standardDemo = demoCard({
  title: 'Standard Items',
  intro:
    'Clic destro sull\'area tratteggiata per aprire il menu. Voci regolari con icone e scorciatoie, un separatore.',
  content: renderTwig(TWIG_ID, { id: 'ctx-cat-standard', ...mocks['default'] }),
});

const submenuDemo = demoCard({
  title: 'With Submenu',
  intro: 'Menu contestuale con un sottomenu annidato.',
  content: renderTwig(TWIG_ID, { id: 'ctx-cat-submenu', ...mocks['with-submenu'] }),
});

const selectionDemo = demoCard({
  title: 'Selection Items (Checkbox + Radio)',
  intro: 'Menu contestuale con voci checkbox e radio raggruppate.',
  content: renderTwig(TWIG_ID, { id: 'ctx-cat-selection', ...mocks['checkbox-radio'] }),
});

const destructiveDemo = demoCard({
  title: 'Destructive Item',
  intro: 'Menu contestuale con una voce distruttiva (<code>variant: "destructive"</code>).',
  content: renderTwig(TWIG_ID, { id: 'ctx-cat-destructive', ...mocks['destructive'] }),
});

export const Catalog = {
  parameters: { layout: 'padded' },
  render: () => storyStack(standardDemo, submenuDemo, selectionDemo, destructiveDemo),
};
