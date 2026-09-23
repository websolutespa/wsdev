import { renderTwig } from '~sb/twig';
import data from './scroll-area.twig.json';

const mocks = data.mocks['scroll-area'];

export default {
  title: 'Base/ScrollArea',
  render: (args) => renderTwig('@components/base/scroll-area/scroll-area.twig', args),
  parameters: { layout: 'centered' },
};

export const Default = { args: mocks['default'] };
export const Horizontal = { args: mocks['horizontal'] };
