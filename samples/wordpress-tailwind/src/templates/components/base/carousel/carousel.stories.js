import { renderTwig } from '~sb/twig';
import { demoCard, storyStack } from '~sb/story-helpers';
import data from './carousel.twig.json';

const mocks = data.mocks['carousel'];
const TWIG_ID = '@components/base/carousel/carousel.twig';

export default {
  title: 'Base/Carousel',
  render: (args) => renderTwig(TWIG_ID, args),
  argTypes: {
    slides: {
      control: 'object',
      description: 'Un carousel-item per elemento: { media?: {src, alt?}, title?, content? }.',
      table: { category: 'Content' },
    },
    orientation: {
      control: 'select',
      options: ['horizontal', 'vertical'],
      description: 'Direzione di scorrimento della track.',
      table: { category: 'Appearance', defaultValue: { summary: 'horizontal' } },
    },
    loop: {
      control: 'boolean',
      description: 'Opzione embla `loop`.',
      table: { category: 'Behaviour', defaultValue: { summary: 'false' } },
    },
    align: {
      control: 'select',
      options: ['start', 'center', 'end'],
      description: 'Opzione embla `align`.',
      table: { category: 'Behaviour', defaultValue: { summary: 'start' } },
    },
    showArrows: {
      control: 'boolean',
      description: 'Mostra le frecce precedente/successiva.',
      table: { category: 'Appearance', defaultValue: { summary: 'true' } },
    },
    showDots: {
      control: 'boolean',
      description: 'Mostra un pager a pallini (non presente upstream).',
      table: { category: 'Appearance', defaultValue: { summary: 'false' } },
    },
    contentClass: {
      control: 'text',
      description: 'Classi extra sulla track flessibile (una carousel verticale ha bisogno dell\'altezza qui).',
      table: { category: 'Appearance' },
    },
    slideClass: {
      control: 'text',
      description: 'Classi extra su ogni carousel-item (es. "md:basis-1/2").',
      table: { category: 'Appearance' },
    },
    ariaLabel: {
      control: 'text',
      description: 'Etichetta della regione radice (fortemente consigliata).',
      table: { category: 'Accessibility' },
    },
    labelPrev: {
      control: 'text',
      description: 'aria-label del bottone precedente.',
      table: { category: 'Accessibility', defaultValue: { summary: 'Slide precedente' } },
    },
    labelNext: {
      control: 'text',
      description: 'aria-label del bottone successivo.',
      table: { category: 'Accessibility', defaultValue: { summary: 'Slide successiva' } },
    },
    id: { table: { disable: true } },
    class: { table: { disable: true } },
    attrs: { table: { disable: true } },
  },
  parameters: { layout: 'padded' },
};

/* ── Default — Controls playground ───────────────────────────────────────── */

export const Default = { args: mocks['default'] };

/* ── Catalog ──────────────────────────────────────────────────────────────── */

/**
 * Multiple embla instances in the same story are safe: carousel.module.js
 * creates a new EmblaCarousel(viewport, opts) per [data-module] node with no
 * shared singleton state.
 */

const singleCard = demoCard({
  title: 'Single slide (default)',
  intro: 'Carousel orizzontale, una slide a piena larghezza visibile alla volta, con frecce precedente/successiva.',
  content: renderTwig(TWIG_ID, mocks['default']),
});

const multipleCard = demoCard({
  title: 'Multi-slide',
  intro: '<code>slideClass: "md:basis-1/3"</code> — tre slide visibili contemporaneamente.',
  content: renderTwig(TWIG_ID, mocks['multiple']),
});

const loopCard = demoCard({
  title: 'Loop',
  intro: '<code>loop: true</code> — le frecce non si disabilitano mai agli estremi.',
  content: renderTwig(TWIG_ID, mocks['loop']),
});

const withDotsCard = demoCard({
  title: 'With dots',
  intro: '<code>showDots: true</code> aggiunge una riga di pallini indicatori sotto la track, gestiti dal modulo.',
  content: renderTwig(TWIG_ID, mocks['with-dots']),
});

const noArrowsCard = demoCard({
  title: 'No arrows',
  intro: '<code>showArrows: false</code> con <code>showDots: true</code> — navigazione solo tramite pallini o gesture.',
  content: renderTwig(TWIG_ID, mocks['no-arrows']),
});

const verticalCard = demoCard({
  title: 'Vertical',
  intro: '<code>orientation: "vertical"</code> — le frecce ruotano di 90° e la track scorre dall\'alto verso il basso.',
  content: renderTwig(TWIG_ID, { ...mocks['vertical'], class: 'mx-auto max-w-xs' }),
});

export const Catalog = {
  parameters: { layout: 'padded' },
  render: () => storyStack(singleCard, multipleCard, loopCard, withDotsCard, noArrowsCard, verticalCard),
};
