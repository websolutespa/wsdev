import { renderTwig } from '~sb/twig';
import data from './aspect-ratio.twig.json';

const mocks = data.mocks['aspect-ratio'];

export default {
  title: 'Base/AspectRatio',
  render: (args) => renderTwig('@components/base/aspect-ratio/aspect-ratio.twig', args),
  parameters: { layout: 'centered' },
};

export const Default = { args: mocks['default'] };
export const Square = { args: mocks['square'] };
export const Classic = { args: mocks['classic'] };
export const Photo = { args: mocks['photo'] };
export const Cinematic = { args: mocks['cinematic'] };
