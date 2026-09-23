import { renderTwig } from '~sb/twig';
import data from './input.twig.json';

const mocks = data.mocks['input'];

export default {
  title: 'Base/Input',
  render: (args) => renderTwig('@components/base/input/input.twig', args),
  parameters: { layout: 'centered' },
};

export const Default = { args: mocks['default'] };
export const Email = { args: mocks['email'] };
export const Password = { args: mocks['password'] };
export const Value = { args: mocks['value'] };
export const Invalid = { args: mocks['invalid'] };
export const Disabled = { args: mocks['disabled'] };
export const Readonly = { args: mocks['readonly'] };
export const File = { args: mocks['file'] };
