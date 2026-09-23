import { renderTwig, renderTwigSource } from '~sb/twig';
import { demoCard, storyStack } from '~sb/story-helpers';
import data from './card.twig.json';

const mocks = data.mocks['card'];
const TWIG_ID = '@components/base/card/card.twig';

export default {
  title: 'Base/Card',
  render: (args) => renderTwig(TWIG_ID, args),
  argTypes: {
    title: {
      control: 'text',
      description: 'Titolo della card; l\'header viene emesso solo se title o description sono impostati.',
      table: { category: 'Content' },
    },
    description: {
      control: 'text',
      description: 'Descrizione della card (stesso vincolo del title per l\'header).',
      table: { category: 'Content' },
    },
    id: { table: { disable: true } },
    class: { table: { disable: true } },
    attrs: { table: { disable: true } },
  },
  parameters: { layout: 'centered' },
};

/* ── Default — interactive playground ───────────────────────────────────── */

export const Default = { args: { ...mocks['default'], class: 'w-96' } };

/* ── Catalog — card composition showcase ─────────────────────────────────── */

// card.twig exposes header/action/content/footer as Twig blocks: filling them
// requires an {% embed %} override (see the twig header comment for the exact
// wrapper markup, which action/content/footer must reproduce since their
// defaults are empty). renderTwigSource runs the embed through the same
// twig.js engine/registry as renderTwig, so the composed markup below comes
// straight from card.twig instead of a hand-copied duplicate.
export const Catalog = {
  parameters: { layout: 'padded' },
  render: () => {
    const headerOnly = demoCard({
      title: 'Header only',
      intro: 'Card con i prop <code>title</code> + <code>description</code> — nessun content o footer.',
      content: renderTwig(TWIG_ID, { ...mocks['default'], class: 'w-96' }),
    });

    const noHeader = demoCard({
      title: 'No header',
      intro: 'Nessun <code>title</code> né <code>description</code>: l\'header non viene emesso.',
      content: renderTwig(TWIG_ID, { ...mocks['no-header'], class: 'w-96 h-24' }),
    });

    const withAction = demoCard({
      title: 'Header with action',
      intro:
        'Lo slot <code>card-action</code> posiziona un\'azione secondaria in alto a destra nell\'header — ' +
        'richiede un override del block <code>action</code> con il wrapper <code>data-slot="card-action"</code> documentato nel twig.',
      content: renderTwigSource(`{% embed '@components/base/card/card.twig' with { title: title, description: description, class: 'w-96' } only %}
  {% block action %}<div data-slot="card-action" class="col-start-2 row-span-2 row-start-1 self-start justify-self-end">{% include '@components/base/button/button.twig' with { label: 'Esporta', variant: 'outline', size: 'sm' } only %}</div>{% endblock %}
{% endembed %}`, {
        title: 'Campagna primavera 2026',
        description: 'Performance della campagna social per il lancio della nuova collezione.',
      }),
    });

    const withFooter = demoCard({
      title: 'With content and footer',
      intro:
        'Testo nello slot <code>card-content</code> e una CTA a piena larghezza in <code>card-footer</code> — ' +
        'entrambi richiedono override di block con i wrapper documentati nel commento header del twig.',
      content: renderTwigSource(`{% embed '@components/base/card/card.twig' with { title: title, description: description, class: 'w-96' } only %}
  {% block content %}<div data-slot="card-content" class="px-6"><p class="text-sm">Le interazioni sono cresciute del 24% rispetto al mese scorso, con un picco nelle stories del weekend.</p></div>{% endblock %}
  {% block footer %}<div data-slot="card-footer" class="flex items-center px-6 [.border-t]:pt-6">{% include '@components/base/button/button.twig' with { label: 'Vai al report completo', class: 'w-full' } only %}</div>{% endblock %}
{% endembed %}`, {
        title: 'Campagna primavera 2026',
        description: 'Performance della campagna social per il lancio della nuova collezione.',
      }),
    });

    return storyStack(headerOnly, noHeader, withAction, withFooter);
  },
};
