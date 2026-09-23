import { renderTwig } from '~sb/twig';
import { initModules } from '~sb/modules';
import data from './calendar.twig.json';

const mocks = data.mocks['calendar'];

export default {
  title: 'Base/Calendar',
  render: (args) => renderTwig('@components/base/calendar/calendar.twig', args),
  parameters: { layout: 'padded' },
};

export const Default = { args: mocks['default'] };
export const Range = { args: mocks['range'] };
export const Multiple = { args: mocks['multiple'] };
export const MultipleMonths = { args: mocks['multiple-months'] };
export const DropdownCaption = { args: mocks['dropdown-caption'] };
export const MinMax = { args: mocks['min-max'] };
export const DisabledDays = { args: mocks['disabled-days'] };

export const Mounted = {
  args: mocks['default'],
  play: async ({ canvasElement }) => {
    await initModules(canvasElement);
  },
};
