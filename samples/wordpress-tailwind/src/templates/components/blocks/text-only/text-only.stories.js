import { renderTwig } from '~sb/twig';
import data from './text-only.twig.json';

const mocks = data.mocks['text-only'];

export default {
  title: 'Blocks/TextOnly',
  render: (args) => renderTwig('@components/blocks/text-only/text-only.twig', args),
  parameters: { layout: 'fullscreen' },
};

export const Default = { args: mocks['default'] };
