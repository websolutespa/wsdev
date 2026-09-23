import { renderTwig } from '~sb/twig';

const TWIG_ID = '@components/layout/footer/footer.twig';

/* footer.twig takes no params: it reads layout.site + layout.footer.columns
   from the globals renderTwig injects (same main.json the production build
   uses), so Default needs no args. */
export default {
  title: 'Layout/Footer',
  render: () => renderTwig(TWIG_ID),
  parameters: { layout: 'fullscreen' },
};

/* ── Default — brand + payoff, 3 link columns, copyright line ─────────────── */

export const Default = {};
