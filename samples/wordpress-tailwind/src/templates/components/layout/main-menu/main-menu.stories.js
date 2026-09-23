import { renderTwig } from '~sb/twig';

const TWIG_ID = '@components/layout/main-menu/main-menu.twig';

/* Default items come from layout.menu (the global renderTwig injects); the
   `items` argType lets Controls try a shorter/longer menu without editing
   main.json. */
export default {
  title: 'Layout/Main Menu',
  render: (args) => renderTwig(TWIG_ID, args),
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['desktop', 'mobile'],
      table: { category: 'Appearance', defaultValue: { summary: 'desktop' } },
      description: 'desktop renders base/navigation-menu (with panels); mobile renders a flat vertical list, used inside the header\'s sheet.',
    },
    items: {
      control: 'object',
      table: { category: 'Content', defaultValue: { summary: 'layout.menu' } },
      description: 'Stessa shape di base/navigation-menu items; default a layout.menu.',
    },
    class: { table: { disable: true } },
  },
  parameters: { layout: 'padded' },
};

/* ── Default — desktop variant, real site menu (megamenu panels) ──────────── */

export const Default = { args: { variant: 'desktop' } };

/* ── Mobile — flat vertical list, as embedded in header's mobile sheet ─────── */

export const Mobile = { args: { variant: 'mobile' } };
