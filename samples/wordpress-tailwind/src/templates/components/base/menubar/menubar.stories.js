import { renderTwig } from '~sb/twig';
import { initModules } from '~sb/modules';
import data from './menubar.twig.json';

const mocks = data.mocks['menubar'];

export default {
  title: 'Base/Menubar',
  render: (args) => renderTwig('@components/base/menubar/menubar.twig', args),
  parameters: { layout: 'padded' },
};

export const Default = { args: mocks['default'] };
export const WithSubmenu = { args: mocks['with-submenu'] };
export const CheckboxRadio = { args: mocks['checkbox-radio'] };

export const Opened = {
  args: mocks['default'],
  play: async ({ canvasElement }) => {
    await initModules(canvasElement);
    canvasElement.querySelector('[data-slot="menubar-trigger"]').click();
  },
};
