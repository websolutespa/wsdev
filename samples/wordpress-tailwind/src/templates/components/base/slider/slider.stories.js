import { renderTwig } from '~sb/twig';
import { initModules } from '~sb/modules';
import data from './slider.twig.json';

const mocks = data.mocks['slider'];

export default {
  title: 'Base/Slider',
  render: (args) => renderTwig('@components/base/slider/slider.twig', args),
  parameters: { layout: 'centered' },
};

export const Default = { args: mocks['default'] };
export const ShowValue = { args: mocks['showValue'] };
export const Range = { args: mocks['range'] };
export const Vertical = { args: mocks['vertical'] };
export const Disabled = { args: mocks['disabled'] };

export const Mounted = {
  args: mocks['default'],
  play: async ({ canvasElement }) => {
    await initModules(canvasElement);
  },
};
