import { renderTwig } from '~sb/twig';
import { demoCard, storyStack } from '~sb/story-helpers';
import data from './marker.twig.json';

const mocks = data.mocks['marker'];
const TWIG_ID = '@components/base/marker/marker.twig';

export default {
  title: 'Base/Marker',
  render: (args) => renderTwig(TWIG_ID, args),
  argTypes: {
    content: {
      control: 'text',
      description: 'Testo renderizzato in marker-content.',
      table: { category: 'Content' },
    },
    icon: {
      control: 'text',
      description: 'Nome icona sprite renderizzata prima del contenuto.',
      table: { category: 'Content' },
    },
    variant: {
      control: 'select',
      options: ['default', 'separator', 'border'],
      description: 'default: riga semplice. separator: linee before/after (es. "oppure"). border: bordo inferiore (es. intestazione sezione).',
      table: { category: 'Appearance', defaultValue: { summary: 'default' } },
    },
    url: {
      control: 'text',
      description: 'Se impostato renderizza <a> invece di <div> (pattern upstream asChild).',
      table: { category: 'Behaviour' },
    },
    items: {
      control: 'object',
      description: 'Array di marker da renderizzare impilati, uno per entry (es. una timeline di step).',
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

/* ── AsLink — marker rendered as <a> ─────────────────────────────────────── */

export const AsLink = { args: mocks['as-link'] };

/* ── Catalog — variants and step timeline ────────────────────────────────── */

export const Catalog = {
  parameters: { layout: 'padded' },
  render: () => {
    const variantsCard = demoCard({
      title: 'Variants',
      intro:
        '<strong>DEFAULT</strong>: riga di testo semplice, opzionalmente con icona. ' +
        '<strong>SEPARATOR</strong>: linee prima/dopo, per dividere due gruppi di contenuto (es. "oppure"). ' +
        '<strong>BORDER</strong>: bordo inferiore, per intestazioni di sezione all\'interno di una lista.',
      content: `<div class="flex w-80 flex-col gap-3">
        ${renderTwig(TWIG_ID, mocks['default'])}
        ${renderTwig(TWIG_ID, mocks['with-icon'])}
        ${renderTwig(TWIG_ID, mocks['separator'])}
        ${renderTwig(TWIG_ID, mocks['border'])}
      </div>`,
    });

    const stepsCard = demoCard({
      title: 'Steps timeline',
      intro: 'Il prop array <code>items</code> renderizza un marker per entry, impilati: pattern comune per una timeline di stato ordine/pratica.',
      content: `<div class="w-80">${renderTwig(TWIG_ID, mocks['steps'])}</div>`,
    });

    return storyStack(variantsCard, stepsCard);
  },
};
