import { renderTwig } from '~sb/twig';
import { initModules } from '~sb/modules';
import { demoCard, storyStack } from '~sb/story-helpers';
import data from './message-scroller.twig.json';

const mocks = data.mocks['message-scroller'];
const TWIG_ID = '@components/base/message-scroller/message-scroller.twig';

export default {
  title: 'Base/MessageScroller',
  render: (args) => renderTwig(TWIG_ID, args),
  argTypes: {
    messages: {
      control: 'object',
      description: 'Array di base/message (uno per message-scroller-item): align, avatar, header, bubbles, footer, group.',
      table: { category: 'Content' },
    },
    direction: {
      control: 'select',
      options: ['end', 'start'],
      description: 'Bordo verso cui salta il bottone di scroll.',
      table: { category: 'Behaviour', defaultValue: { summary: 'end' } },
    },
    buttonLabel: {
      control: 'text',
      description: 'Nome accessibile del bottone di scroll.',
      table: { category: 'Accessibility', defaultValue: { summary: 'Vai agli ultimi messaggi' } },
    },
    threshold: {
      control: 'number',
      description: 'Px di margine ancora considerati "agganciato al bordo".',
      table: { category: 'Behaviour', defaultValue: { summary: '24' } },
    },
    id: { table: { disable: true } },
    class: { table: { disable: true } },
    attrs: { table: { disable: true } },
  },
  parameters: { layout: 'fullscreen' },
};

/* ── Default — interactive playground ───────────────────────────────────── */

export const Default = { args: mocks['default'] };

/* ── Mounted — verifies the stick-to-edge module lands on the last message ── */

export const Mounted = {
  args: mocks['default'],
  play: async ({ canvasElement }) => {
    await initModules(canvasElement);
  },
};

/* ── DirectionStart — jump button targets the top edge instead ───────────── */

/**
 * direction="start" reverses the module's stick-to-edge logic: the jump
 * button targets the top of the viewport instead of the bottom, and the
 * arrow icon rotates 180° (data-[direction=start]:[&_svg]:rotate-180).
 */
export const DirectionStart = {
  args: mocks['direction-start'],
  play: async ({ canvasElement }) => {
    await initModules(canvasElement);
  },
};

/* ── Catalog — short conversation and a composed chat card ────────────────── */

const ATTACHMENT_TWIG_ID = '@components/base/attachment/attachment.twig';
const MARKER_TWIG_ID = '@components/base/marker/marker.twig';

export const Catalog = {
  parameters: { layout: 'padded' },
  render: () => {
    const shortCard = demoCard({
      title: 'Short conversation',
      intro: 'Con poche voci in <code>messages</code> il viewport non scrolla e il bottone di salto resta nascosto (già "agganciato" al bordo).',
      content: renderTwig(TWIG_ID, mocks['short']),
    });

    /**
     * Composed conversation demo: base/marker as a day separator above the
     * scroller, base/message + base/bubble entries, and one bubble whose
     * content embeds a rendered base/attachment (bubble content is not
     * escaped, matching the pattern already used by badge/label overrides).
     */
    const composedMessages = [
      {
        align: 'start',
        avatar: { fallback: 'AS' },
        header: 'Assistente · 09:58',
        bubbles: [{ content: 'Buongiorno! Puoi inviarmi il contratto firmato quando puoi?' }],
      },
      {
        align: 'end',
        avatar: { fallback: 'TU' },
        bubbles: [
          {
            variant: 'ghost',
            content: renderTwig(ATTACHMENT_TWIG_ID, {
              title: 'contratto-firmato.pdf',
              description: '1,2 MB',
              size: 'sm',
              media: { variant: 'icon', icon: 'file-text' },
            }),
          },
        ],
      },
      {
        align: 'start',
        avatar: { fallback: 'AS' },
        bubbles: [{ content: 'Perfetto, ricevuto! Controllo e ti aggiorno a breve.' }],
        footer: 'Letto',
      },
    ];

    const composedCard = demoCard({
      title: 'Composed chat conversation',
      intro:
        'Un\'anteprima statica che combina <code>marker</code> (separatore "Oggi"), <code>message</code> + <code>bubble</code> ' +
        'per lo scambio, e un allegato <code>attachment</code> renderizzato dentro il contenuto di una bolla <code>ghost</code>.',
      content: `
        ${renderTwig(MARKER_TWIG_ID, { content: 'Oggi', variant: 'separator' })}
        <div class="mt-3">
          ${renderTwig(TWIG_ID, { messages: composedMessages, attrs: 'style="height: 18rem"' })}
        </div>`,
    });

    return storyStack(shortCard, composedCard);
  },
};
