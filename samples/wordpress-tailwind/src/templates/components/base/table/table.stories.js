import { renderTwig } from '~sb/twig';
import data from './table.twig.json';

const mocks = data.mocks['table'];

export default {
  title: 'Base/Table',
  render: (args) => renderTwig('@components/base/table/table.twig', args),
  parameters: { layout: 'padded' },
};

export const Default = { args: mocks['default'] };
export const WithFooter = { args: mocks['with-footer'] };
