import { renderTwig } from '~sb/twig';
import { initModules } from '~sb/modules';
import data from './collapsible.twig.json';

const mocks = data.mocks['collapsible'];

export default {
  title: 'Base/Collapsible',
  render: (args) => renderTwig('@components/base/collapsible/collapsible.twig', args),
  parameters: { layout: 'centered' },
};

export const Default = { args: mocks['default'] };
export const Open = { args: mocks['open'] };

export const Expanded = {
  args: mocks['default'],
  play: async ({ canvasElement }) => {
    await initModules(canvasElement);
    canvasElement.querySelector('[data-collapsible-trigger]').click();
  },
};
