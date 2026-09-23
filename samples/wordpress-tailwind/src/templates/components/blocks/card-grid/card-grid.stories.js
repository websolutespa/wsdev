import { renderTwig } from '~sb/twig';
import data from './card-grid.twig.json';

const mocks = data.mocks['card-grid'];

export default {
  title: 'Blocks/CardGrid',
  render: (args) => renderTwig('@components/blocks/card-grid/card-grid.twig', args),
  parameters: { layout: 'fullscreen' },
};

export const Default = { args: mocks['default'] };
