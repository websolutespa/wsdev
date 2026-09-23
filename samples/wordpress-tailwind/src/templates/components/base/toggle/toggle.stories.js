import { renderTwig } from '~sb/twig';
import { initModules } from '~sb/modules';
import data from './toggle.twig.json';

const mocks = data.mocks['toggle'];

export default {
  title: 'Base/Toggle',
  render: (args) => renderTwig('@components/base/toggle/toggle.twig', args),
  parameters: { layout: 'centered' },
};

export const Default = { args: mocks['default'] };
export const Outline = { args: mocks['outline'] };
export const Sm = { args: mocks['sm'] };
export const Lg = { args: mocks['lg'] };
export const Pressed = { args: mocks['pressed'] };
export const Disabled = { args: mocks['disabled'] };

export const Toggled = {
  args: mocks['default'],
  play: async ({ canvasElement }) => {
    await initModules(canvasElement);
    canvasElement.querySelector('[data-slot="toggle"]').click();
  },
};
