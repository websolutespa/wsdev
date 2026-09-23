import { renderTwig } from '~sb/twig';
import data from './checkbox.twig.json';

const mocks = data.mocks['checkbox'];

export default {
  title: 'Base/Checkbox',
  render: (args) => renderTwig('@components/base/checkbox/checkbox.twig', args),
  parameters: { layout: 'centered' },
};

export const Default = { args: mocks['default'] };
export const Checked = { args: mocks['checked'] };
export const Description = { args: mocks['description'] };
export const Disabled = { args: mocks['disabled'] };
export const DisabledChecked = { args: mocks['disabled-checked'] };
export const Invalid = { args: mocks['invalid'] };
export const Bare = { args: mocks['bare'] };
