import { renderTwig } from '~sb/twig';
import data from './native-select.twig.json';

const mocks = data.mocks['native-select'];

export default {
  title: 'Base/NativeSelect',
  render: (args) => renderTwig('@components/base/native-select/native-select.twig', args),
  parameters: { layout: 'centered' },
};

export const Default = { args: mocks['default'] };
export const SizeSm = { args: mocks['size-sm'] };
export const WithOptgroups = { args: mocks['with-optgroups'] };
export const Disabled = { args: mocks['disabled'] };
export const Invalid = { args: mocks['invalid'] };
