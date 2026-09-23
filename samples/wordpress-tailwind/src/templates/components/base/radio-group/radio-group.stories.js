import { renderTwig } from '~sb/twig';
import data from './radio-group.twig.json';

const mocks = data.mocks['radio-group'];

export default {
  title: 'Base/RadioGroup',
  render: (args) => renderTwig('@components/base/radio-group/radio-group.twig', args),
  parameters: { layout: 'centered' },
};

export const Default = { args: mocks['default'] };
export const Horizontal = { args: mocks['horizontal'] };
export const Description = { args: mocks['description'] };
export const Disabled = { args: mocks['disabled'] };
export const Invalid = { args: mocks['invalid'] };
