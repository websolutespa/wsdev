import { renderTwig } from '~sb/twig';
import { initModules } from '~sb/modules';
import data from './resizable.twig.json';

const mocks = data.mocks['resizable'];

export default {
  title: 'Base/Resizable',
  render: (args) => renderTwig('@components/base/resizable/resizable.twig', args),
  parameters: { layout: 'padded' },
};

export const Default = { args: mocks['default'] };
export const WithHandle = { args: mocks['with-handle'] };
export const Vertical = { args: mocks['vertical'] };
export const ThreePanels = { args: mocks['three-panels'] };

export const Mounted = {
  args: mocks['default'],
  play: async ({ canvasElement }) => {
    await initModules(canvasElement);
  },
};
