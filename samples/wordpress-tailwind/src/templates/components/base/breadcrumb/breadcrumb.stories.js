import { renderTwig } from '~sb/twig';
import { demoCard, storyStack } from '~sb/story-helpers';
import data from './breadcrumb.twig.json';

const mocks = data.mocks['breadcrumb'];
const TWIG_ID = '@components/base/breadcrumb/breadcrumb.twig';

export default {
  title: 'Base/Breadcrumb',
  render: (args) => renderTwig(TWIG_ID, args),
  argTypes: {
    items: {
      control: 'object',
      description:
        'Voci del breadcrumb: { label, url?, ellipsis? }. L\'ultima voce (o la prima senza url) è la pagina corrente.',
      table: { category: 'Content' },
    },
    id: { table: { disable: true } },
    class: { table: { disable: true } },
    attrs: { table: { disable: true } },
  },
  parameters: { layout: 'padded' },
};

/* ── Default — Controls playground ───────────────────────────────────────── */

export const Default = { args: mocks['default'] };

/* ── Catalog ──────────────────────────────────────────────────────────────── */

const defaultCard = demoCard({
  title: 'Default',
  intro: 'Percorso a tre livelli: due antenati collegati e la pagina corrente (senza url).',
  content: renderTwig(TWIG_ID, mocks['default']),
});

const ellipsisCard = demoCard({
  title: 'With ellipsis',
  intro: 'Un percorso lungo collassato con un\'indicazione <code>ellipsis: true</code> al posto delle voci intermedie.',
  content: renderTwig(TWIG_ID, mocks['with-ellipsis']),
});

const noLinksCard = demoCard({
  title: 'Plain spans (no url)',
  intro: 'Le voci intermedie senza <code>url</code> sono renderizzate come span non interattivi, come la pagina corrente.',
  content: renderTwig(TWIG_ID, {
    items: [{ label: 'Home', url: '/' }, { label: 'Archivio' }, { label: 'Articolo corrente' }],
  }),
});

export const Catalog = {
  parameters: { layout: 'padded' },
  render: () => storyStack(defaultCard, ellipsisCard, noLinksCard),
};
