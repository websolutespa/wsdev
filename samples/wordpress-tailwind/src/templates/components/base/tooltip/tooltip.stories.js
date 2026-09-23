import { renderTwig } from '~sb/twig';
import { initModules } from '~sb/modules';
import data from './tooltip.twig.json';

const mocks = data.mocks['tooltip'];

export default {
  title: 'Base/Tooltip',
  render: (args) => renderTwig('@components/base/tooltip/tooltip.twig', args),
  parameters: { layout: 'centered' },
};

export const Default = { args: mocks['default'] };
export const SideRight = { args: mocks['side-right'] };
export const SideBottom = { args: mocks['side-bottom'] };
export const SideLeft = { args: mocks['side-left'] };

/** Opening is delayed (data-delay, default 700ms) before the panel un-hides. */
export const Shown = {
  args: mocks['default'],
  play: async ({ canvasElement }) => {
    await initModules(canvasElement);
    const trigger = canvasElement.querySelector('[data-tooltip-trigger]');
    trigger.dispatchEvent(new PointerEvent('pointerenter', { bubbles: true }));
    await new Promise((resolve) => setTimeout(resolve, 800));
  },
};
