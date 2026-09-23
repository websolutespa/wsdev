import { renderTwig } from '~sb/twig';
import { initModules } from '~sb/modules';
import { demoCard, storyStack } from '~sb/story-helpers';
import data from './resizable.twig.json';

const mocks = data.mocks['resizable'];
const TWIG_ID = '@components/base/resizable/resizable.twig';

export default {
  title: 'Base/Resizable',
  render: (args) => renderTwig(TWIG_ID, args),
  argTypes: {
    direction: {
      control: 'select',
      options: ['horizontal', 'vertical'],
      description: 'Direzione dello split.',
      table: { category: 'Appearance', defaultValue: { summary: 'horizontal' } },
    },
    panels: {
      control: 'object',
      description: 'Array pannelli: { defaultSize, minSize, maxSize, content, class }; uno per pannello, con una handle tra ogni coppia.',
      table: { category: 'Content' },
    },
    withHandle: {
      control: 'boolean',
      description: 'Mostra il glifo grip dentro ogni handle.',
      table: { category: 'Appearance', defaultValue: { summary: 'false' } },
    },
    handleLabel: {
      control: 'text',
      description: 'aria-label di ogni handle.',
      table: { category: 'Accessibility', defaultValue: { summary: 'Ridimensiona i pannelli' } },
    },
    id: { table: { disable: true } },
    class: { table: { disable: true } },
    attrs: { table: { disable: true } },
  },
  parameters: { layout: 'padded' },
};

/* ── Default — interactive playground ───────────────────────────────────── */

export const Default = { args: mocks['default'] };

/* ── HorizontalWithHandle — play() demo: keyboard ArrowLeft on handle ────── */

export const HorizontalWithHandle = {
  args: mocks['with-handle'],
  play: async ({ canvasElement }) => {
    await initModules(canvasElement);
    const handle = canvasElement.querySelector('[data-slot="resizable-handle"]');
    if (handle) {
      handle.focus();
      handle.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
    }
  },
};

/* ── Vertical — play() demo: keyboard ArrowDown on handle ────────────────── */

export const Vertical = {
  args: mocks['vertical'],
  play: async ({ canvasElement }) => {
    await initModules(canvasElement);
    const handle = canvasElement.querySelector('[data-slot="resizable-handle"]');
    if (handle) {
      handle.focus();
      handle.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    }
  },
};

/* ── Catalog ─────────────────────────────────────────────────────────────── */

export const Catalog = {
  parameters: { layout: 'padded' },
  render: () => {
    const horizontalCard = demoCard({
      title: 'Horizontal with grip handle',
      intro:
        'direction="horizontal" + withHandle=true — i pannelli sono affiancati; il divisore mostra un\'icona grip. ' +
        'Trascina o usa i tasti freccia con la handle a fuoco per ridimensionare.',
      content: renderTwig(TWIG_ID, mocks['with-handle']),
    });

    const verticalCard = demoCard({
      title: 'Vertical without handle',
      intro: 'direction="vertical" — i pannelli sono impilati sopra/sotto; il divisore è una linea semplice da 1px.',
      content: renderTwig(TWIG_ID, { ...mocks['vertical'], withHandle: false }),
    });

    const threePanelsCard = demoCard({
      title: 'Three panels',
      intro: 'Il prop <code>panels</code> accetta un numero arbitrario di voci: qui tre pannelli con due handle.',
      content: renderTwig(TWIG_ID, mocks['three-panels']),
    });

    return storyStack(horizontalCard, verticalCard, threePanelsCard);
  },
};
