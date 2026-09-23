import { renderTwig } from '~sb/twig';
import data from './switch.twig.json';

const mocks = data.mocks['switch'];

export default {
  title: 'Base/Switch',
  render: (args) => renderTwig('@components/base/switch/switch.twig', args),
  parameters: { layout: 'centered' },
};

export const Default = { args: mocks['default'] };
export const Checked = { args: mocks['checked'] };
export const Description = { args: mocks['description'] };
export const Sm = { args: mocks['sm'] };
export const Disabled = { args: mocks['disabled'] };
export const DisabledChecked = { args: mocks['disabled-checked'] };
export const Bare = { args: mocks['bare'] };
