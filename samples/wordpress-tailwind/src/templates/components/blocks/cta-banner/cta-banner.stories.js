import { renderTwig } from '~sb/twig';
import data from './cta-banner.twig.json';

const mocks = data.mocks['cta-banner'];

export default {
  title: 'Blocks/CtaBanner',
  render: (args) => renderTwig('@components/blocks/cta-banner/cta-banner.twig', args),
  parameters: { layout: 'fullscreen' },
};

export const Default = { args: mocks['default'] };
