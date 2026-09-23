import { renderTwig } from '~sb/twig';
import { demoCard, storyStack } from '~sb/story-helpers';
import data from './pagination.twig.json';

const mocks = data.mocks['pagination'];
const TWIG_ID = '@components/base/pagination/pagination.twig';

export default {
  title: 'Base/Pagination',
  render: (args) => renderTwig(TWIG_ID, args),
  argTypes: {
    items: {
      control: 'object',
      description: 'Voci pagina, data-driven: { page, url?, ellipsis? }.',
      table: { category: 'Content' },
    },
    current: {
      control: 'text',
      description: 'Valore `page` della voce attiva.',
      table: { category: 'State' },
    },
    prevUrl: {
      control: 'text',
      description: 'Omettere per disabilitare il link precedente.',
      table: { category: 'Content' },
    },
    nextUrl: {
      control: 'text',
      description: 'Omettere per disabilitare il link successivo.',
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
  intro: 'Cinque pagine visibili, con link precedente e successivo attivi.',
  content: renderTwig(TWIG_ID, mocks['default']),
});

const ellipsisCard = demoCard({
  title: 'With ellipsis',
  intro: 'Una voce con <code>ellipsis: true</code> collassa l\'intervallo di pagine nascoste.',
  content: renderTwig(TWIG_ID, mocks['with-ellipsis']),
});

const firstPageCard = demoCard({
  title: 'First page',
  intro: 'Alla prima pagina <code>prevUrl</code> è omesso: il link precedente è disabilitato.',
  content: renderTwig(TWIG_ID, mocks['first-page']),
});

export const Catalog = {
  parameters: { layout: 'padded' },
  render: () => storyStack(defaultCard, ellipsisCard, firstPageCard),
};
