import { renderTwig } from '~sb/twig';
import { initModules } from '~sb/modules';
import data from './message-scroller.twig.json';

const mocks = data.mocks['message-scroller'];

export default {
  title: 'Base/MessageScroller',
  render: (args) => renderTwig('@components/base/message-scroller/message-scroller.twig', args),
  parameters: { layout: 'fullscreen' },
};

export const Default = { args: mocks['default'] };
export const Short = { args: mocks['short'] };
export const DirectionStart = { args: mocks['direction-start'] };

export const Mounted = {
  args: mocks['default'],
  play: async ({ canvasElement }) => {
    await initModules(canvasElement);
  },
};
