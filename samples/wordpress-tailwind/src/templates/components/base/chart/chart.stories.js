import { renderTwig } from '~sb/twig';
import { initModules } from '~sb/modules';
import data from './chart.twig.json';

const mocks = data.mocks['chart'];

export default {
  title: 'Base/Chart',
  render: (args) => renderTwig('@components/base/chart/chart.twig', args),
  parameters: { layout: 'padded' },
};

export const Default = { args: mocks['default'] };
export const Bar = { args: mocks['bar'] };
export const Area = { args: mocks['area'] };
export const Pie = { args: mocks['pie'] };
export const Donut = { args: mocks['donut'] };
export const Themed = { args: mocks['themed'] };

export const Mounted = {
  args: mocks['default'],
  play: async ({ canvasElement }) => {
    await initModules(canvasElement);
  },
};
