import { renderTwig } from '~sb/twig';
import { demoCard, storyStack } from '~sb/story-helpers';
import data from './bubble.twig.json';

const mocks = data.mocks['bubble'];
const TWIG_ID = '@components/base/bubble/bubble.twig';

export default {
  title: 'Base/Bubble',
  render: (args) => renderTwig(TWIG_ID, args),
  argTypes: {
    content: {
      control: 'text',
      description: 'Testo renderizzato dentro bubble-content.',
      table: { category: 'Content' },
    },
    variant: {
      control: 'select',
      options: ['default', 'secondary', 'muted', 'tinted', 'outline', 'ghost', 'destructive'],
      description: 'Schema colore della bolla.',
      table: { category: 'Appearance', defaultValue: { summary: 'default' } },
    },
    align: {
      control: 'select',
      options: ['start', 'end'],
      description: 'Allineamento orizzontale nella conversazione.',
      table: { category: 'Appearance', defaultValue: { summary: 'start' } },
    },
    url: {
      control: 'text',
      description: 'Se impostato renderizza bubble-content come <a> invece di <div> (pattern upstream asChild).',
      table: { category: 'Behaviour' },
    },
    reactions: {
      control: 'object',
      description: 'Renderizza una pill bubble-reactions: { content, side?, align? }.',
      table: { category: 'Content' },
    },
    group: {
      control: 'object',
      description: 'Array di bolle da renderizzare come BubbleGroup, invece della singola bolla.',
      table: { category: 'Content' },
    },
    id: { table: { disable: true } },
    class: { table: { disable: true } },
    attrs: { table: { disable: true } },
  },
  parameters: { layout: 'centered' },
};

/* ── Default — interactive playground ───────────────────────────────────── */

export const Default = { args: mocks['default'] };

/* ── AsLink — bubble-content rendered as <a> ─────────────────────────────── */

export const AsLink = { args: mocks['as-link'] };

/* ── Catalog — variants, reactions and grouped conversation ──────────────── */

export const Catalog = {
  parameters: { layout: 'padded' },
  render: () => {
    const VARIANTS = [
      { key: 'default', content: 'Ciao! Come posso aiutarti oggi?' },
      { key: 'secondary', content: 'Vorrei informazioni sul mio ordine.' },
      { key: 'muted', content: 'L\'operatore si sta connettendo...' },
      { key: 'tinted', content: 'Il tuo ordine #4521 è stato spedito.' },
      { key: 'outline', content: 'Posso allegare una fattura?' },
      { key: 'ghost', content: 'Digitando...' },
      { key: 'destructive', content: 'Il pagamento non è andato a buon fine.' },
    ];

    const variantsCard = demoCard({
      title: 'Variants',
      intro: 'Tutte e sette le varianti del componente Bubble, ciascuna con un contenuto di esempio.',
      content: `<div class="flex flex-col items-start gap-3">
        ${VARIANTS.map((v) => renderTwig(TWIG_ID, { content: v.content, variant: v.key })).join('\n        ')}
      </div>`,
    });

    const withReactionsCard = demoCard({
      title: 'With reactions',
      intro: 'Il prop <code>reactions</code> renderizza una pill sovrapposta al bordo inferiore della bolla, tipicamente un riepilogo emoji + conteggio.',
      content: `<div class="flex justify-end pb-4">${renderTwig(TWIG_ID, mocks['with-reactions'])}</div>`,
    });

    const groupCard = demoCard({
      title: 'Bubble group',
      intro: 'Il prop array <code>group</code> renderizza un BubbleGroup: uno scambio di messaggi consecutivi, ciascuno allineato in base al proprio <code>align</code>.',
      content: renderTwig(TWIG_ID, mocks['group']),
    });

    return storyStack(variantsCard, withReactionsCard, groupCard);
  },
};
