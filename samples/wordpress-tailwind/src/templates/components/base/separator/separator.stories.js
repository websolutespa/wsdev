import { renderTwig } from '~sb/twig';
import data from './separator.twig.json';

const mocks = data.mocks['separator'];

export default {
  title: 'Base/Separator',
  render: (args) => renderTwig('@components/base/separator/separator.twig', args),
  parameters: { layout: 'centered' },
};

export const Default = { args: mocks['default'] };
export const Vertical = { args: mocks['vertical'] };
export const Semantic = { args: mocks['semantic'] };
