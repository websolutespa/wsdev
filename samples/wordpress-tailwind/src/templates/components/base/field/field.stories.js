import { renderTwig } from '~sb/twig';
import data from './field.twig.json';

const mocks = data.mocks['field'];

export default {
  title: 'Base/Field',
  render: (args) => renderTwig('@components/base/field/field.twig', args),
  parameters: { layout: 'centered' },
};

export const Default = { args: mocks['default'] };
export const Horizontal = { args: mocks['horizontal'] };
export const Invalid = { args: mocks['invalid'] };
export const Disabled = { args: mocks['disabled'] };
