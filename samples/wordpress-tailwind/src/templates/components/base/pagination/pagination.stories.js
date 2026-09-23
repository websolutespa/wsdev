import { renderTwig } from '~sb/twig';
import data from './pagination.twig.json';

const mocks = data.mocks['pagination'];

export default {
  title: 'Base/Pagination',
  render: (args) => renderTwig('@components/base/pagination/pagination.twig', args),
  parameters: { layout: 'padded' },
};

export const Default = { args: mocks['default'] };
export const WithEllipsis = { args: mocks['with-ellipsis'] };
export const FirstPage = { args: mocks['first-page'] };
