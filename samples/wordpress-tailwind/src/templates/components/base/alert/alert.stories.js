import { renderTwig } from '~sb/twig';
import data from './alert.twig.json';

const mocks = data.mocks['alert'];

export default {
  title: 'Base/Alert',
  render: (args) => renderTwig('@components/base/alert/alert.twig', args),
  parameters: { layout: 'centered' },
};

export const Default = { args: mocks['default'] };
export const Destructive = { args: mocks['destructive'] };
export const NoIcon = { args: mocks['no-icon'] };
