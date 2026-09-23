import { renderTwig, renderTwigSource } from '~sb/twig';
import { demoCard, storyStack } from '~sb/story-helpers';
import data from './empty.twig.json';

const mocks = data.mocks['empty'];
const TWIG_ID = '@components/base/empty/empty.twig';

export default {
  title: 'Base/Empty',
  render: (args) => renderTwig(TWIG_ID, args),
  argTypes: {
    icon: {
      control: 'text',
      description: 'Nome icona sprite mostrata nello swatch media empty-icon.',
      table: { category: 'Content' },
    },
    title: {
      control: 'text',
      description: 'Titolo dell\'empty state.',
      table: { category: 'Content' },
    },
    description: {
      control: 'text',
      description: 'Descrizione dell\'empty state.',
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

/* ── Catalog — composition variants ──────────────────────────────────────── */

// empty.twig exposes `content` as a Twig block: filling it requires an
// {% embed %} override (see the twig header comment for the exact wrapper
// markup, which the override must reproduce since the default is empty).
// renderTwigSource runs the embed through the same twig.js engine/registry
// as renderTwig, so the action card below comes straight from empty.twig.
export const Catalog = {
  parameters: { layout: 'padded' },
  render: () => {
    const titleOnly = demoCard({
      title: 'Title only',
      intro: 'Empty state minimale: solo un titolo, nessuna icona o descrizione.',
      content: renderTwig(TWIG_ID, mocks['title-only']),
    });

    const withIcon = demoCard({
      title: 'With icon',
      intro:
        'Icona in un tile arrotondato attenuato (<code>empty-icon</code>, mostrato automaticamente quando <code>icon</code> è impostato). ' +
        'Lo slug icona deve esistere nello sprite.',
      content: renderTwig(TWIG_ID, mocks['default']),
    });

    const searchVariant = demoCard({
      title: 'Search results',
      intro: 'Stessa composizione icona + titolo + descrizione, usata per un empty state di ricerca senza risultati.',
      content: renderTwig(TWIG_ID, mocks['search']),
    });

    const withAction = demoCard({
      title: 'With CTA action',
      intro:
        'Override del block <code>content</code> per aggiungere un\'azione sotto la descrizione. ' +
        'L\'override deve includere il div wrapper <code>empty-content</code> verbatim (vedi commento header del twig).',
      content: renderTwigSource(`{% embed '@components/base/empty/empty.twig' with { icon: icon, title: title, description: description } only %}
  {% block content %}<div data-slot="empty-content" class="flex w-full max-w-sm min-w-0 flex-col items-center gap-4 text-sm text-balance">{% include '@components/base/button/button.twig' with { label: 'Crea progetto', size: 'sm' } only %}</div>{% endblock %}
{% endembed %}`, mocks['default']),
    });

    const noIcon = demoCard({
      title: 'No icon',
      intro: 'Nessun prop <code>icon</code> passato: il blocco media viene saltato del tutto.',
      content: renderTwig(TWIG_ID, mocks['no-icon']),
    });

    return storyStack(titleOnly, withIcon, searchVariant, withAction, noIcon);
  },
};
