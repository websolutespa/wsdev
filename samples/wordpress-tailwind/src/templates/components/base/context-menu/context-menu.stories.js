import { renderTwig } from '~sb/twig';
import { initModules } from '~sb/modules';
import data from './context-menu.twig.json';

const mocks = data.mocks['context-menu'];

export default {
  title: 'Base/ContextMenu',
  render: (args) => renderTwig('@components/base/context-menu/context-menu.twig', args),
  parameters: { layout: 'centered' },
};

export const Default = { args: mocks['default'] };
export const WithSubmenu = { args: mocks['with-submenu'] };
export const CheckboxRadio = { args: mocks['checkbox-radio'] };
export const Destructive = { args: mocks['destructive'] };

/** Simulates the right-click that opens the menu (the module has no click-to-open path). */
export const Opened = {
  args: mocks['default'],
  play: async ({ canvasElement }) => {
    await initModules(canvasElement);
    const trigger = canvasElement.querySelector('[data-slot="context-menu-trigger"]');
    const rect = trigger.getBoundingClientRect();
    trigger.dispatchEvent(
      new MouseEvent('contextmenu', {
        bubbles: true,
        cancelable: true,
        clientX: rect.left + rect.width / 2,
        clientY: rect.top + rect.height / 2,
      })
    );
  },
};
