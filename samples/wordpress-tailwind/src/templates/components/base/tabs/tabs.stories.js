import { renderTwig } from '~sb/twig';
import { initModules } from '~sb/modules';
import data from './tabs.twig.json';

const mocks = data.mocks['tabs'];

export default {
  title: 'Base/Tabs',
  render: (args) => renderTwig('@components/base/tabs/tabs.twig', args),
  parameters: { layout: 'padded' },
};

export const Default = { args: mocks['default'] };
export const Line = { args: mocks['line'] };
export const Vertical = { args: mocks['vertical'] };
export const Manual = { args: mocks['manual'] };
export const Disabled = { args: mocks['disabled'] };

export const Switched = {
  args: mocks['default'],
  play: async ({ canvasElement }) => {
    await initModules(canvasElement);
    canvasElement.querySelector('[data-slot="tabs-trigger"][data-value="password"]').click();
  },
};
