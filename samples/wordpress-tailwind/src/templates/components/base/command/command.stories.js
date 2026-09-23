import { renderTwig } from '~sb/twig';
import { initModules } from '~sb/modules';
import data from './command.twig.json';

const mocks = data.mocks['command'];

export default {
  title: 'Base/Command',
  render: (args) => renderTwig('@components/base/command/command.twig', args),
  parameters: { layout: 'padded' },
};

export const Default = { args: mocks['default'] };
export const WithLinks = { args: mocks['with-links'] };
export const DisabledItem = { args: mocks['disabled-item'] };
export const Dialog = { args: mocks['dialog'] };

/** Types a query to exercise the ranked substring filter (command.module.js scores matches). */
export const Filtered = {
  args: mocks['default'],
  play: async ({ canvasElement }) => {
    await initModules(canvasElement);
    const input = canvasElement.querySelector('[data-slot="command-input"]');
    input.focus();
    input.value = 'Preferenze';
    input.dispatchEvent(new Event('input', { bubbles: true }));
  },
};
