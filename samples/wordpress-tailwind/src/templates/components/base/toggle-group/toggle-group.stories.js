import { renderTwig } from '~sb/twig';
import { initModules } from '~sb/modules';
import data from './toggle-group.twig.json';

const mocks = data.mocks['toggle-group'];

export default {
  title: 'Base/ToggleGroup',
  render: (args) => renderTwig('@components/base/toggle-group/toggle-group.twig', args),
  parameters: { layout: 'centered' },
};

export const Default = { args: mocks['default'] };
export const Multiple = { args: mocks['multiple'] };
export const Outline = { args: mocks['outline'] };
export const Sm = { args: mocks['sm'] };
export const Disabled = { args: mocks['disabled'] };

/** Single mode: pressing another item unpresses the sibling that was on. */
export const Toggled = {
  args: mocks['default'],
  play: async ({ canvasElement }) => {
    await initModules(canvasElement);
    canvasElement.querySelectorAll('[data-slot="toggle-group-item"]')[1].click();
  },
};
