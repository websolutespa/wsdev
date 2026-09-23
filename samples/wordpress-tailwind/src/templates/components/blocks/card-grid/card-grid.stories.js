import { renderTwig } from '~sb/twig';
import data from './card-grid.twig.json';

const mocks = data.mocks['card-grid'];
const TWIG_ID = '@components/blocks/card-grid/card-grid.twig';

export default {
  title: 'Blocks/CardGrid',
  render: (args) => renderTwig(TWIG_ID, args),
  argTypes: {
    title: { control: 'text', table: { category: 'Content' }, description: 'Titolo di sezione, sopra la griglia.' },
    collection: {
      control: 'object',
      table: { category: 'Content' },
      description: 'Array<{ title, abstract?, media?: { src, alt? }, cta?: { label, url, variant? } }>: una card per item.',
    },
    columns: {
      control: { type: 'select' },
      options: [2, 3],
      table: { category: 'Appearance', defaultValue: { summary: '3' } },
      description: 'Colonne della griglia da md in su (sempre 1 su mobile). Solo 2 o 3 sono gestite dal template.',
    },
    id: { control: 'text', table: { category: 'Content' }, description: 'Id sulla section per gli anchor link.' },
    class: { table: { disable: true } },
  },
  parameters: { layout: 'fullscreen' },
};

/* ── Default — 3 colonne, ogni card con media e cta ───────────────────────── */

export const Default = { args: mocks.default };

/* ── TwoColumns — stessa collection, columns:2 ─────────────────────────────── */

export const TwoColumns = { args: { ...mocks.default, columns: 2 } };

/* ── WithoutMedia — card testuali, senza immagine (plate non renderizzato) ── */

export const WithoutMedia = {
  args: {
    ...mocks.default,
    collection: mocks.default.collection.map(({ media, ...entry }) => entry),
  },
};

/* ── WithoutCta — card senza footer azione ─────────────────────────────────── */

export const WithoutCta = {
  args: {
    ...mocks.default,
    collection: mocks.default.collection.map(({ cta, ...entry }) => entry),
  },
};
