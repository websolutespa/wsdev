import { renderTwig } from '~sb/twig';
import { initModules } from '~sb/modules';
import data from './sidebar.twig.json';

const mocks = data.mocks['sidebar'];

export default {
  title: 'Base/Sidebar',
  render: (args) => renderTwig('@components/base/sidebar/sidebar.twig', args),
  parameters: { layout: 'fullscreen' },
};

export const Default = { args: mocks['default'] };
export const CollapsibleIcon = { args: mocks['collapsible-icon'] };
export const VariantFloating = { args: mocks['variant-floating'] };
export const VariantInset = { args: mocks['variant-inset'] };
export const SideRight = { args: mocks['side-right'] };
export const Loading = { args: mocks['loading'] };
export const CollapsibleNone = { args: mocks['collapsible-none'] };

export const ToggledWithTrigger = {
  args: mocks['default'],
  play: async ({ canvasElement }) => {
    await initModules(canvasElement);
    canvasElement.querySelector('[data-slot="sidebar-trigger"]').click();
  },
};
