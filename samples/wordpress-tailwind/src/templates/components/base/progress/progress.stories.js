import { renderTwig } from '~sb/twig';
import data from './progress.twig.json';

const mocks = data.mocks['progress'];

export default {
  title: 'Base/Progress',
  render: (args) => renderTwig('@components/base/progress/progress.twig', args),
  parameters: { layout: 'centered' },
};

export const Default = { args: mocks['default'] };
export const Empty = { args: mocks['empty'] };
export const Complete = { args: mocks['complete'] };
