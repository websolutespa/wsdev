import { renderTwig } from '~sb/twig';
import { initModules } from '~sb/modules';
import data from './combobox.twig.json';

const mocks = data.mocks['combobox'];

export default {
  title: 'Base/Combobox',
  render: (args) => renderTwig('@components/base/combobox/combobox.twig', args),
  parameters: { layout: 'padded' },
};

export const Default = { args: mocks['default'] };
export const WithValue = { args: mocks['with-value'] };
export const Grouped = { args: mocks['grouped'] };
export const DisabledItem = { args: mocks['disabled-item'] };
export const Chips = { args: mocks['chips'] };
export const Disabled = { args: mocks['disabled'] };
export const Invalid = { args: mocks['invalid'] };

export const Open = {
  args: mocks['default'],
  play: async ({ canvasElement }) => {
    await initModules(canvasElement);
    canvasElement.querySelector('[data-slot="combobox-input"]').click();
  },
};
