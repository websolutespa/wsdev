import { renderTwig } from '~sb/twig';
import data from './breadcrumb.twig.json';

const mocks = data.mocks['breadcrumb'];

export default {
  title: 'Base/Breadcrumb',
  render: (args) => renderTwig('@components/base/breadcrumb/breadcrumb.twig', args),
  parameters: { layout: 'padded' },
};

export const Default = { args: mocks['default'] };
export const WithEllipsis = { args: mocks['with-ellipsis'] };
