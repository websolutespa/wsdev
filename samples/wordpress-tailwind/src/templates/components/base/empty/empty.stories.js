import { renderTwig } from '~sb/twig';
import data from './empty.twig.json';

const mocks = data.mocks['empty'];

export default {
  title: 'Base/Empty',
  render: (args) => renderTwig('@components/base/empty/empty.twig', args),
  parameters: { layout: 'centered' },
};

export const Default = { args: mocks['default'] };
export const Search = { args: mocks['search'] };
export const TitleOnly = { args: mocks['title-only'] };
export const NoIcon = { args: mocks['no-icon'] };
