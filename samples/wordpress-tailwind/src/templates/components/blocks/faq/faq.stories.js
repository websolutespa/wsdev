import { renderTwig } from '~sb/twig';
import data from './faq.twig.json';

const mocks = data.mocks['faq'];
const TWIG_ID = '@components/blocks/faq/faq.twig';

export default {
  title: 'Blocks/Faq',
  render: (args) => renderTwig(TWIG_ID, args),
  argTypes: {
    title: { control: 'text', table: { category: 'Content' }, description: 'Titolo di sezione, opzionale.' },
    items: {
      control: 'object',
      table: { category: 'Content' },
      description: 'Array<{ value, title, content }>: passato invariato a base/accordion (type: single, collapsible).',
    },
    id: { control: 'text', table: { category: 'Content' }, description: 'Id sulla section per gli anchor link.' },
    class: { table: { disable: true } },
  },
  parameters: { layout: 'fullscreen' },
};

/* ── Default — accordion con 4 domande, il primo item collassato ────────────
   L'accordion monta il suo modulo via il decorator globale di preview.ts
   (initModules su canvasElement) → interattivo senza play() esplicito. */

export const Default = { args: mocks.default };
