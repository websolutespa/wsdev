import { renderTwig } from '~sb/twig';
import data from './input-group.twig.json';

const mocks = data.mocks['input-group'];

export default {
  title: 'Base/InputGroup',
  render: (args) => renderTwig('@components/base/input-group/input-group.twig', args),
  parameters: { layout: 'centered' },
};

export const Default = { args: mocks['default'] };
export const WithButton = { args: mocks['with-button'] };
export const Textarea = { args: mocks['textarea'] };
export const Invalid = { args: mocks['invalid'] };
