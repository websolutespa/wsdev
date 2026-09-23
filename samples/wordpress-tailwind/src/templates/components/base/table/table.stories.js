import { renderTwig } from '~sb/twig';
import { demoCard, storyStack } from '~sb/story-helpers';
import data from './table.twig.json';

const mocks = data.mocks['table'];
const TWIG_ID = '@components/base/table/table.twig';

export default {
  title: 'Base/Table',
  render: (args) => renderTwig(TWIG_ID, args),
  argTypes: {
    caption: {
      control: 'text',
      description: 'Testo renderizzato in table-caption.',
      table: { category: 'Content' },
    },
    columns: {
      control: 'object',
      description: 'Array di celle di intestazione: { label, class? }.',
      table: { category: 'Content' },
    },
    rows: {
      control: 'object',
      description: 'Array di righe body: { cells: [{ value, class? }], selected? }.',
      table: { category: 'Content' },
    },
    footer: {
      control: 'object',
      description: 'Array di righe footer: { cells: [{ value, class? }] }.',
      table: { category: 'Content' },
    },
    id: { table: { disable: true } },
    class: { table: { disable: true } },
    attrs: { table: { disable: true } },
  },
  parameters: { layout: 'padded' },
};

/* ── Default — interactive playground ───────────────────────────────────── */

export const Default = { args: mocks['default'] };

/* ── Catalog — table compositions ────────────────────────────────────────── */

export const Catalog = {
  parameters: { layout: 'padded' },
  render: () => {
    const plain = demoCard({
      title: 'Default',
      intro:
        'Tabella data-driven guidata dai prop <code>columns[]</code> e <code>rows[]</code>. ' +
        'La riga <code>PR-2202</code> mostra <code>selected: true</code> → <code>data-state="selected"</code>.',
      content: renderTwig(TWIG_ID, mocks['default']),
    });

    const withFooter = demoCard({
      title: 'With footer',
      intro: 'Il prop <code>footer</code> renderizza una riga <code>&lt;tfoot&gt;</code> per i totali riepilogativi.',
      content: renderTwig(TWIG_ID, mocks['with-footer']),
    });

    const captionOnly = demoCard({
      title: 'Caption only',
      intro: 'Nessun <code>columns</code>/<code>rows</code>: solo il testo di <code>caption</code>, utile come segnaposto durante il caricamento.',
      content: renderTwig(TWIG_ID, { caption: 'Nessuna pratica trovata per i filtri selezionati.' }),
    });

    return storyStack(plain, withFooter, captionOnly);
  },
};
