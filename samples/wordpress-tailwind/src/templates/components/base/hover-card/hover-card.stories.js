import { renderTwig } from '~sb/twig';
import { initModules } from '~sb/modules';
import data from './hover-card.twig.json';

const mocks = data.mocks['hover-card'];

export default {
  title: 'Base/HoverCard',
  render: (args) => renderTwig('@components/base/hover-card/hover-card.twig', args),
  parameters: { layout: 'centered' },
};

export const Default = { args: mocks['default'] };
export const SideTop = { args: mocks['side-top'] };
export const AlignStart = { args: mocks['align-start'] };

/** Opening is delayed (openDelay, default 700ms) before the panel un-hides. */
export const Shown = {
  args: mocks['default'],
  play: async ({ canvasElement }) => {
    await initModules(canvasElement);
    const trigger = canvasElement.querySelector('[data-slot="hover-card-trigger"]');
    trigger.dispatchEvent(new PointerEvent('pointerenter', { bubbles: true }));
    await new Promise((resolve) => setTimeout(resolve, 800));
  },
};
