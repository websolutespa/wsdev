import { renderTwig } from '~sb/twig';
import data from './item.twig.json';

const mocks = data.mocks['item'];

export default {
  title: 'Base/Item',
  render: (args) => renderTwig('@components/base/item/item.twig', args),
  parameters: { layout: 'centered' },
};

export const Default = { args: mocks['default'] };
export const Muted = { args: mocks['muted'] };
export const WithImage = { args: mocks['with-image'] };
export const WithActions = { args: mocks['with-actions'] };
export const SizeSm = { args: mocks['size-sm'] };
export const AsLink = { args: mocks['as-link'] };
export const Group = { args: mocks['group'] };
