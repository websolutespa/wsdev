import { renderTwig } from '~sb/twig';
import { initModules } from '~sb/modules';
import data from './dialog.twig.json';

const mocks = data.mocks['dialog'];

export default {
  title: 'Base/Dialog',
  render: (args) => renderTwig('@components/base/dialog/dialog.twig', args),
  parameters: { layout: 'centered' },
};

export const Default = { args: mocks['default'] };
export const NoCloseButton = { args: mocks['no-close-button'] };
export const Static = { args: mocks['static'] };

export const Open = {
  args: mocks['default'],
  play: async ({ canvasElement }) => {
    await initModules(canvasElement);
    canvasElement.querySelector('[data-dialog-trigger]').click();
  },
};
