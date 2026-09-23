import { renderTwig } from '~sb/twig';
import data from './skeleton.twig.json';

const mocks = data.mocks['skeleton'];

export default {
  title: 'Base/Skeleton',
  render: (args) => renderTwig('@components/base/skeleton/skeleton.twig', args),
  parameters: { layout: 'centered' },
};

export const Default = { args: mocks['default'] };
export const Avatar = { args: mocks['avatar'] };
export const Card = { args: mocks['card'] };
