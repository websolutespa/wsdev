import { renderTwig } from '~sb/twig';
import data from './textarea.twig.json';

const mocks = data.mocks['textarea'];

export default {
  title: 'Base/Textarea',
  render: (args) => renderTwig('@components/base/textarea/textarea.twig', args),
  parameters: { layout: 'centered' },
};

export const Default = { args: mocks['default'] };
export const Value = { args: mocks['value'] };
export const Invalid = { args: mocks['invalid'] };
export const Disabled = { args: mocks['disabled'] };
export const Rows = { args: mocks['rows'] };
