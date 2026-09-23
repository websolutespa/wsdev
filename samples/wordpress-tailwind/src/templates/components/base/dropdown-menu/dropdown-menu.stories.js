import { renderTwig } from '~sb/twig';
import { initModules } from '~sb/modules';
import data from './dropdown-menu.twig.json';

const mocks = data.mocks['dropdown-menu'];

export default {
  title: 'Base/DropdownMenu',
  render: (args) => renderTwig('@components/base/dropdown-menu/dropdown-menu.twig', args),
  parameters: { layout: 'centered' },
};

export const Default = { args: mocks['default'] };
export const Groups = { args: mocks['groups'] };
export const WithSubmenu = { args: mocks['with-submenu'] };
export const CheckboxRadio = { args: mocks['checkbox-radio'] };
export const Destructive = { args: mocks['destructive'] };
export const DisabledItems = { args: mocks['disabled-items'] };
export const AlignEnd = { args: mocks['align-end'] };

export const Open = {
  args: mocks['default'],
  play: async ({ canvasElement }) => {
    await initModules(canvasElement);
    canvasElement.querySelector('[data-menu-trigger]').click();
  },
};
