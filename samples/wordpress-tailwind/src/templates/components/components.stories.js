import { renderTwig } from '~sb/twig';
import cardGrid from './blocks/card-grid/card-grid.twig.json';
import ctaBanner from './blocks/cta-banner/cta-banner.twig.json';
import faq from './blocks/faq/faq.twig.json';
import textOnly from './blocks/text-only/text-only.twig.json';

const TWIG_ID = '@components/components.twig';

/* components.twig is the dispatcher for `page.components[]`: a plain include
   loop keyed by `component.schema` (docs/PORTING.md), no adjacency engine —
   this sample's version stays deliberately simple. The story demonstrates the
   dispatcher itself, so `page` stays one disabled object control rather than
   exposing per-block controls here (each block already has its own story). */
const page = {
  components: [
    { schema: 'card-grid', ...cardGrid.mocks['card-grid'].default },
    { schema: 'text-only', ...textOnly.mocks['text-only'].default },
    { schema: 'faq', ...faq.mocks['faq'].default },
    { schema: 'cta-banner', ...ctaBanner.mocks['cta-banner'].default, id: 'cta-banner' },
  ],
};

export default {
  title: 'Layout/Page Dispatcher',
  render: (args) => renderTwig(TWIG_ID, args),
  argTypes: {
    page: { control: 'object', table: { disable: true } },
  },
  parameters: { layout: 'fullscreen' },
};

/* ── Default — the four blocks in the order index.twig composes them ──────── */

export const Default = { args: { page } };
