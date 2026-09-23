import { renderTwig } from '~sb/twig';
import data from './spinner.twig.json';

const mocks = data.mocks['spinner'];

export default {
  title: 'Base/Spinner',
  render: (args) => renderTwig('@components/base/spinner/spinner.twig', args),
  parameters: { layout: 'centered' },
};

export const Default = { args: mocks['default'] };
export const Size12 = { args: mocks['size-12'] };
export const Size20 = { args: mocks['size-20'] };
export const Size24 = { args: mocks['size-24'] };
export const Size32 = { args: mocks['size-32'] };
