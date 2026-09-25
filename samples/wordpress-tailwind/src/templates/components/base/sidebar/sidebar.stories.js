import { renderTwig } from '~sb/twig';
import data from './sidebar.twig.json';

const mocks = data.mocks['sidebar'];
const TWIG_ID = '@components/base/sidebar/sidebar.twig';

/**
 * Sidebar is a full-page app-shell layout (min-h-svh, fixed container,
 * fullscreen layout parameter). Fitting it inside a demoCard / storyStack
 * would clip the fixed-position sidebar container and break the interaction
 * model entirely, so there is no Catalog here — the individual scenario and
 * interaction stories below cover all axes (side, variant, collapsible mode,
 * keyboard/trigger toggles).
 */
export default {
  title: 'Base/Sidebar',
  render: (args) => renderTwig(TWIG_ID, args),
  argTypes: {
    side: {
      control: 'select',
      options: ['left', 'right'],
      description: 'Bordo su cui ancorare la sidebar.',
      table: { category: 'Appearance', defaultValue: { summary: 'left' } },
    },
    variant: {
      control: 'select',
      options: ['sidebar', 'floating', 'inset'],
      description: 'Stile del contenitore sidebar.',
      table: { category: 'Appearance', defaultValue: { summary: 'sidebar' } },
    },
    collapsible: {
      control: 'select',
      options: ['offcanvas', 'icon', 'none'],
      description: 'Modalità di collasso della sidebar su desktop.',
      table: { category: 'Behaviour', defaultValue: { summary: 'offcanvas' } },
    },
    defaultOpen: {
      control: 'boolean',
      description: 'Stato iniziale quando non è presente il cookie sidebar_state.',
      table: { category: 'Behaviour', defaultValue: { summary: 'true' } },
    },
    brand: {
      control: 'object',
      description: 'Contenuto di default dell\'header: { title?, subtitle?, icon? }.',
      table: { category: 'Content' },
    },
    search: {
      control: 'object',
      description: 'Campo di ricerca nell\'header: { name, placeholder?, id? }.',
      table: { category: 'Content' },
    },
    groups: {
      control: 'object',
      description: 'Gruppi di menu: label?, action?, skeletonRows?, items[] (label, url?, icon?, active?, badge?, sub?).',
      table: { category: 'Content' },
    },
    insetTitle: {
      control: 'text',
      description: 'Titolo mostrato accanto al trigger nell\'header inset di default.',
      table: { category: 'Content' },
    },
    id: { table: { disable: true } },
    class: { table: { disable: true } },
    attrs: { table: { disable: true } },
  },
  parameters: { layout: 'fullscreen' },
};

export const Default = { args: mocks['default'] };
export const CollapsibleIcon = { args: mocks['collapsible-icon'] };
export const VariantFloating = { args: mocks['variant-floating'] };
export const VariantInset = { args: mocks['variant-inset'] };
export const RightSide = { args: mocks['side-right'] };
export const Loading = { args: mocks['loading'] };
export const CollapsibleNone = { args: mocks['collapsible-none'] };

export const DefaultOpen = { args: mocks['default'] };
