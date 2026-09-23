import { renderTwig } from '~sb/twig';
import { initModules } from '~sb/modules';
import data from './accordion.twig.json';

const mocks = data.mocks['accordion'];

export default {
  title: 'Base/Accordion',
  render: (args) => renderTwig('@components/base/accordion/accordion.twig', args),
  parameters: { layout: 'padded' },
};

export const Default = { args: mocks['default'] };
export const Multiple = { args: mocks['multiple'] };
export const NotCollapsible = { args: mocks['not-collapsible'] };
export const Disabled = { args: mocks['disabled'] };

/** Opens the second (closed) item, exercising the single-mode close-sibling behaviour. */
export const Expanded = {
  args: mocks['default'],
  play: async ({ canvasElement }) => {
    await initModules(canvasElement);
    canvasElement.querySelector('[data-slot="accordion-trigger"][data-value="returns"]').click();
  },
};
