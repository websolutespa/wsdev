import { renderTwig } from '~sb/twig';
import { demoCard, storyStack } from '~sb/story-helpers';
import data from './message.twig.json';

const mocks = data.mocks['message'];
const TWIG_ID = '@components/base/message/message.twig';

export default {
  title: 'Base/Message',
  render: (args) => renderTwig(TWIG_ID, args),
  argTypes: {
    align: {
      control: 'select',
      options: ['start', 'end'],
      description: 'Allineamento del messaggio nella conversazione (start: ricevuto, end: inviato).',
      table: { category: 'Appearance', defaultValue: { summary: 'start' } },
    },
    avatar: {
      control: 'object',
      description: 'Renderizza message-avatar: { src?, alt?, fallback? }; omettere per un messaggio consecutivo senza avatar.',
      table: { category: 'Content' },
    },
    header: {
      control: 'text',
      description: 'Testo sopra le bolle (es. mittente + orario).',
      table: { category: 'Content' },
    },
    footer: {
      control: 'text',
      description: 'Testo sotto le bolle (es. stato di consegna).',
      table: { category: 'Content' },
    },
    bubbles: {
      control: 'object',
      description: 'Array di base/bubble dentro message-content: [{ variant?, align?, content }].',
      table: { category: 'Content' },
    },
    group: {
      control: 'object',
      description: 'Array di message da renderizzare come MessageGroup, invece del singolo messaggio.',
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

/* ── Catalog — conversation exchange, footer, no-avatar and grouping ──────── */

export const Catalog = {
  parameters: { layout: 'padded' },
  render: () => {
    const exchangeCard = demoCard({
      title: 'Conversation exchange',
      intro: 'Un messaggio ricevuto (<code>align: "start"</code>) seguito da una risposta inviata (<code>align: "end"</code>), ciascuno con avatar e header.',
      content: `<div class="flex w-96 flex-col gap-4">
        ${renderTwig(TWIG_ID, mocks['default'])}
        ${renderTwig(TWIG_ID, mocks['reply'])}
      </div>`,
    });

    const withFooterCard = demoCard({
      title: 'With delivery status',
      intro: 'Il prop <code>footer</code> mostra lo stato di consegna sotto le bolle, allineato a destra quando <code>align: "end"</code>.',
      content: `<div class="w-96">${renderTwig(TWIG_ID, mocks['with-footer'])}</div>`,
    });

    const noAvatarCard = demoCard({
      title: 'No avatar (consecutive message)',
      intro: 'Omettere <code>avatar</code> per un messaggio consecutivo dello stesso mittente: il contenuto resta allineato senza ripetere la foto profilo.',
      content: `<div class="w-96">${renderTwig(TWIG_ID, mocks['no-avatar'])}</div>`,
    });

    const groupCard = demoCard({
      title: 'Message group',
      intro: 'Il prop array <code>group</code> renderizza un MessageGroup: più messaggi consecutivi dello stesso mittente, con un solo avatar visibile.',
      content: `<div class="w-96">${renderTwig(TWIG_ID, mocks['group'])}</div>`,
    });

    return storyStack(exchangeCard, withFooterCard, noAvatarCard, groupCard);
  },
};
