import { renderTwig, renderTwigSource } from '~sb/twig';
import { demoCard, storyStack } from '~sb/story-helpers';
import data from './scroll-area.twig.json';

const mocks = data.mocks['scroll-area'];
const TWIG_ID = '@components/base/scroll-area/scroll-area.twig';

export default {
  title: 'Base/ScrollArea',
  render: (args) => renderTwig(TWIG_ID, args),
  argTypes: {
    orientation: {
      control: 'select',
      options: ['vertical', 'horizontal', 'both'],
      description: 'Asse di scroll.',
      table: { category: 'Appearance', defaultValue: { summary: 'vertical' } },
    },
    items: {
      control: 'object',
      description: 'Contenuto di default data-driven (una riga per elemento); ignorato quando il block content è sovrascritto.',
      table: { category: 'Content' },
    },
    ariaLabel: {
      control: 'text',
      description: 'Nome accessibile della regione scrollabile (role="region").',
      table: { category: 'Accessibility' },
    },
    id: { table: { disable: true } },
    class: { table: { disable: true } },
    attrs: { table: { disable: true } },
  },
  parameters: { layout: 'centered' },
};

/* ── Default — interactive playground ───────────────────────────────────── */

export const Default = { args: mocks['default'] };

/* ── Catalog — orientations and in-context usage ─────────────────────────── */

// scroll-area.twig exposes the scrollable content as a Twig `content` block.
// renderTwigSource runs the {% embed %} override through the same twig.js
// engine/registry as renderTwig, so the "with separators" card below comes
// straight from scroll-area.twig, composing real separator.twig includes
// between rows instead of duplicating the markup as a JS template string.
export const Catalog = {
  parameters: { layout: 'padded' },
  render: () => {
    const verticalCard = demoCard({
      title: 'Vertical',
      intro: 'orientation="vertical" — contenitore ad altezza fissa con una lista scrollabile sottile di tag, guidata dal prop <code>items</code>.',
      content: renderTwig(TWIG_ID, mocks['default']),
    });

    const horizontalCard = demoCard({
      title: 'Horizontal',
      intro: 'orientation="horizontal" — contenitore a larghezza fissa con un elenco di allegati scrollabile orizzontalmente.',
      content: renderTwig(TWIG_ID, mocks['horizontal']),
    });

    const withSeparatorsCard = demoCard({
      title: 'Vertical — with separators',
      intro: 'Ogni riga separata da un Separator orizzontale, pattern comune per liste di notifiche o attività.',
      content: renderTwigSource(`{% embed '@components/base/scroll-area/scroll-area.twig' with { class: 'h-48 w-full rounded-md border', ariaLabel: 'Notifiche recenti' } only %}
  {% block content %}<div class="p-4"><h4 class="mb-4 text-sm leading-none font-medium">Notifiche</h4>{% for item in items %}<div class="text-sm py-1">{{ item }}</div>{% if not loop.last %}{% include '@components/base/separator/separator.twig' with { class: 'my-2' } only %}{% endif %}{% endfor %}</div>{% endblock %}
{% endembed %}`, { items: mocks['default'].items }),
    });

    return storyStack(verticalCard, horizontalCard, withSeparatorsCard);
  },
};
