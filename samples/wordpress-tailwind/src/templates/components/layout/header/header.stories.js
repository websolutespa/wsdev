import { renderTwig } from '~sb/twig';
import { initModules } from '~sb/modules';
import main from '../../../../theme/main.json';

const TWIG_ID = '@components/layout/header/header.twig';

/* header.twig takes no params: it reads layout.site/menu/header.cta straight from
   the globals renderTwig injects (same main.json the production build uses), so
   Default needs no args. Variants below override just the `layout` slice they
   need, spread over the real main.layout so site/menu/footer stay in sync. */
export default {
  title: 'Layout/Header',
  render: () => renderTwig(TWIG_ID),
  parameters: { layout: 'fullscreen' },
};

/* ── Default — sticky bar with desktop nav, theme toggle and header cta ───── */

export const Default = {};

/* ── WithoutHeaderCta — header.cta absent → button hidden, layout unaffected */

export const WithoutHeaderCta = {
  render: () => renderTwig(TWIG_ID, { layout: { ...main.layout, header: { cta: null } } }),
};

/* ── MobileMenuOpen — opens the sheet reusing dialog.module, no viewport resize
   needed to review it. The theme toggle button has no [data-module] of its own
   (colorScheme.js self-registers globally in src/js/main.js, outside Storybook's
   per-story initModules) — use Storybook's own theme toolbar to preview dark mode. */

export const MobileMenuOpen = {
  play: async ({ canvasElement }) => {
    await initModules(canvasElement);
    canvasElement.querySelector('[data-dialog-open="mobile-menu"]')?.click();
  },
};
