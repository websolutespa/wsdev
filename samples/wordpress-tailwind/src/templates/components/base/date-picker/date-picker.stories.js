import { renderTwig } from '~sb/twig';
import { initModules } from '~sb/modules';
import data from './date-picker.twig.json';

const mocks = data.mocks['date-picker'];

export default {
  title: 'Base/DatePicker',
  render: (args) => renderTwig('@components/base/date-picker/date-picker.twig', args),
  parameters: { layout: 'padded' },
};

export const Default = { args: mocks['default'] };
export const WithValue = { args: mocks['with-value'] };
export const Range = { args: mocks['range'] };
export const RangeWithValue = { args: mocks['range-with-value'] };
export const MinMax = { args: mocks['min-max'] };
export const DropdownCaption = { args: mocks['dropdown-caption'] };

/** Opens the nested popover+calendar via the trigger both modules share. */
export const Open = {
  args: mocks['default'],
  play: async ({ canvasElement }) => {
    await initModules(canvasElement);
    canvasElement.querySelector('[data-date-picker-trigger]').click();
  },
};
