import { renderTwig, renderTwigSource } from '~sb/twig';
import { demoCard, matrixCard, storyStack } from '~sb/story-helpers';
import data from './accordion.twig.json';

const mocks = data.mocks['accordion'];
const TWIG_ID = '@components/base/accordion/accordion.twig';

export default {
  title: 'Base/Accordion',
  render: (args) => renderTwig(TWIG_ID, args),
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'border'],
      description: 'border racchiude le voci in un box con bordo e angoli arrotondati (Figma "Accordion/Border").',
      table: { category: 'Appearance', defaultValue: { summary: 'default' } },
    },
    type: {
      control: 'select',
      options: ['single', 'multiple'],
      description: 'single chiude la voce eventualmente aperta quando se ne apre un\'altra.',
      table: { category: 'Behaviour', defaultValue: { summary: 'single' } },
    },
    collapsible: {
      control: 'boolean',
      description: 'Solo type: single — permette di richiudere la voce aperta.',
      table: { category: 'Behaviour', defaultValue: { summary: 'true' } },
    },
    items: {
      control: 'object',
      description: 'Voci dell\'accordion: { value, title, content, open?, disabled? }.',
      table: { category: 'Content' },
    },
    headingLevel: {
      control: 'select',
      options: ['h3', 'h4'],
      description: 'Tag di intestazione che avvolge ogni trigger.',
      table: { category: 'Accessibility', defaultValue: { summary: 'h3' } },
    },
    id: { table: { disable: true } },
    class: { table: { disable: true } },
    attrs: { table: { disable: true } },
  },
  parameters: { layout: 'padded' },
};

/* ── Default — Controls playground ───────────────────────────────────────── */

export const Default = { args: { ...mocks['default'], class: 'w-96' } };

/* ── Catalog ──────────────────────────────────────────────────────────────── */

const acc = (args) => renderTwig(TWIG_ID, { ...args, class: 'w-80' });

const singleCard = demoCard({
  title: 'Single (default)',
  intro: 'Una sola voce aperta alla volta. Clic su una voce aperta la richiude (<code>collapsible: true</code>).',
  content: acc(mocks['default']),
});

const borderCard = demoCard({
  title: 'Border',
  intro: 'Con <code>variant: "border"</code> le voci sono racchiuse in un box con bordo e angoli arrotondati; la voce aperta ha lo sfondo <code>muted/50</code>.',
  content: acc(mocks['border']),
});

const IN_CARD_SOURCE = `{% embed '@components/base/card/card.twig' with { title: title, description: description, accordion: accordion, class: 'w-96' } only %}
  {% block content %}<div data-slot="card-content" class="px-6">{% include '@components/base/accordion/accordion.twig' with accordion only %}</div>{% endblock %}
{% endembed %}`;

const inCardCard = demoCard({
  title: 'Border in a card',
  intro: 'Composizione Figma: accordion <code>border</code> nel contenuto di una Card.',
  content: renderTwigSource(IN_CARD_SOURCE, {
    title: 'Abbonamento e fatturazione',
    description: 'Domande frequenti su account, piani, pagamenti e disdette.',
    accordion: mocks['border'],
  }),
});

const multipleCard = demoCard({
  title: 'Multiple',
  intro: 'Con <code>type: "multiple"</code> possono essere aperte più voci contemporaneamente.',
  content: acc(mocks['multiple']),
});

const notCollapsibleCard = demoCard({
  title: 'Not collapsible',
  intro: 'Con <code>collapsible: false</code> la voce aperta in modalità single non può essere richiusa cliccandola di nuovo.',
  content: acc(mocks['not-collapsible']),
});

const disabledCard = demoCard({
  title: 'Disabled item',
  intro: 'Una voce con <code>disabled: true</code> è renderizzata ma non interattiva.',
  content: acc(mocks['disabled']),
});

const headingLevelCard = matrixCard({
  title: 'Heading levels',
  rowAxisLabel: 'headingLevel',
  intro: 'Il tag di intestazione che avvolge ogni trigger può essere h3 o h4.',
  columns: ['h3', 'h4'],
  rows: [{ key: 'default', label: 'Single' }],
  renderCell: (col) => acc({ ...mocks['default'], headingLevel: col }),
  center: false,
});

export const Catalog = {
  parameters: { layout: 'padded' },
  render: () => storyStack(singleCard, borderCard, inCardCard, multipleCard, notCollapsibleCard, disabledCard, headingLevelCard),
};
