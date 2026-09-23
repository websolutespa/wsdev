import { renderTwig } from '~sb/twig';
import { initModules } from '~sb/modules';
import data from './drawer.twig.json';

const mocks = data.mocks['drawer'];

export default {
  title: 'Base/Drawer',
  render: (args) => renderTwig('@components/base/drawer/drawer.twig', args),
  parameters: { layout: 'centered' },
};

export const DirectionBottom = { args: mocks['direction-bottom'] };
export const DirectionTop = { args: mocks['direction-top'] };
export const DirectionRight = { args: mocks['direction-right'] };
export const DirectionLeft = { args: mocks['direction-left'] };

export const Open = {
  args: mocks['direction-bottom'],
  play: async ({ canvasElement }) => {
    await initModules(canvasElement);
    canvasElement.querySelector('[data-dialog-trigger]').click();
  },
};
