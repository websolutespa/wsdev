import { renderTwig } from '~sb/twig';
import { demoCard, storyStack } from '~sb/story-helpers';
import data from './aspect-ratio.twig.json';

const mocks = data.mocks['aspect-ratio'];
const TWIG_ID = '@components/base/aspect-ratio/aspect-ratio.twig';

export default {
  title: 'Base/AspectRatio',
  render: (args) => renderTwig(TWIG_ID, args),
  argTypes: {
    ratio: {
      control: 'select',
      options: ['16_9', '1_1', '4_3', '3_2', '21_9'],
      description: 'Rapporto d\'aspetto del box, mappato su una utility Tailwind aspect-* letterale.',
      table: { category: 'Appearance', defaultValue: { summary: '16_9' } },
    },
    src: {
      control: 'text',
      description: 'URL immagine; se impostato renderizza un <img> che riempie il box.',
      table: { category: 'Content' },
    },
    alt: {
      control: 'text',
      description: 'Testo alternativo, obbligatorio quando src è impostato.',
      table: { category: 'Accessibility' },
    },
    id: { table: { disable: true } },
    class: { table: { disable: true } },
    attrs: { table: { disable: true } },
  },
  parameters: { layout: 'padded' },
};

/* ── Default — interactive playground ───────────────────────────────────── */

export const Default = { args: mocks['default'] };

/* ── Catalog — all five ratios ───────────────────────────────────────────── */

export const Catalog = {
  parameters: { layout: 'padded' },
  render: () => {
    const RATIOS = [
      { key: '16_9', label: '16 / 9', mock: mocks['default'], maxWidth: '' },
      { key: '1_1', label: '1 / 1', mock: mocks['square'], maxWidth: 'max-w-md' },
      { key: '4_3', label: '4 / 3', mock: mocks['classic'], maxWidth: 'max-w-md' },
      { key: '3_2', label: '3 / 2', mock: mocks['photo'], maxWidth: '' },
      { key: '21_9', label: '21 / 9', mock: mocks['cinematic'], maxWidth: '' },
    ];

    const cards = RATIOS.map(({ key, label, mock, maxWidth }) => {
      const args = { ...mock, ratio: key };
      if (maxWidth) args.class = maxWidth;
      return demoCard({
        title: label,
        intro: `<code>ratio="${key}"</code>`,
        content: renderTwig(TWIG_ID, args),
      });
    });

    return storyStack(...cards);
  },
};
