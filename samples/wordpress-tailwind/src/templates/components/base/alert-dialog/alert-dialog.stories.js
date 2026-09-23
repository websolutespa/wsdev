import { renderTwig } from '~sb/twig';
import { initModules } from '~sb/modules';
import data from './alert-dialog.twig.json';

const mocks = data.mocks['alert-dialog'];

export default {
  title: 'Base/AlertDialog',
  render: (args) => renderTwig('@components/base/alert-dialog/alert-dialog.twig', args),
  parameters: { layout: 'centered' },
};

export const Default = { args: mocks['default'] };
export const Destructive = { args: mocks['destructive'] };
export const SizeSm = { args: mocks['size-sm'] };
export const WithMedia = { args: mocks['with-media'] };

export const Open = {
  args: mocks['default'],
  play: async ({ canvasElement }) => {
    await initModules(canvasElement);
    canvasElement.querySelector('[data-dialog-trigger]').click();
  },
};
