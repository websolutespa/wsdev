import { renderTwig } from '~sb/twig';
import data from './card.twig.json';

const mocks = data.mocks['card'];

export default {
  title: 'Base/Card',
  render: (args) => renderTwig('@components/base/card/card.twig', args),
  parameters: { layout: 'padded' },
};

export const Default = { args: mocks['default'] };
export const TitleOnly = { args: mocks['title-only'] };
export const NoHeader = { args: mocks['no-header'] };
