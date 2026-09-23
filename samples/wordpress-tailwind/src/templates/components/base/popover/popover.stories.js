import { renderTwig } from '~sb/twig';
import { initModules } from '~sb/modules';
import data from './popover.twig.json';

const mocks = data.mocks['popover'];

export default {
  title: 'Base/Popover',
  render: (args) => renderTwig('@components/base/popover/popover.twig', args),
  parameters: { layout: 'centered' },
};

export const Default = { args: mocks['default'] };
export const AlignStart = { args: mocks['align-start'] };
export const AlignEnd = { args: mocks['align-end'] };
export const SideTop = { args: mocks['side-top'] };

export const Open = {
  args: mocks['default'],
  play: async ({ canvasElement }) => {
    await initModules(canvasElement);
    canvasElement.querySelector('[data-popover-trigger]').click();
  },
};
