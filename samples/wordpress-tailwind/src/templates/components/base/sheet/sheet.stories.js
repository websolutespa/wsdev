import { renderTwig } from '~sb/twig';
import { initModules } from '~sb/modules';
import data from './sheet.twig.json';

const mocks = data.mocks['sheet'];

export default {
  title: 'Base/Sheet',
  render: (args) => renderTwig('@components/base/sheet/sheet.twig', args),
  parameters: { layout: 'centered' },
};

export const SideRight = { args: mocks['side-right'] };
export const SideLeft = { args: mocks['side-left'] };
export const SideTop = { args: mocks['side-top'] };
export const SideBottom = { args: mocks['side-bottom'] };

export const Open = {
  args: mocks['side-right'],
  play: async ({ canvasElement }) => {
    await initModules(canvasElement);
    canvasElement.querySelector('[data-dialog-trigger]').click();
  },
};
