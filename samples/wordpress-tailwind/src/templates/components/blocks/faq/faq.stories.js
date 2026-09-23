import { renderTwig } from '~sb/twig';
import data from './faq.twig.json';

const mocks = data.mocks['faq'];

export default {
  title: 'Blocks/Faq',
  render: (args) => renderTwig('@components/blocks/faq/faq.twig', args),
  parameters: { layout: 'fullscreen' },
};

export const Default = { args: mocks['default'] };
