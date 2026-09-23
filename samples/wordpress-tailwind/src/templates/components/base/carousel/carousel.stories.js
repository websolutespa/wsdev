import { renderTwig } from '~sb/twig';
import { initModules } from '~sb/modules';
import data from './carousel.twig.json';

const mocks = data.mocks['carousel'];

export default {
  title: 'Base/Carousel',
  render: (args) => renderTwig('@components/base/carousel/carousel.twig', args),
  parameters: { layout: 'padded' },
};

export const Default = { args: mocks['default'] };
export const Vertical = { args: mocks['vertical'] };
export const Loop = { args: mocks['loop'] };
export const Multiple = { args: mocks['multiple'] };
export const WithDots = { args: mocks['with-dots'] };
export const NoArrows = { args: mocks['no-arrows'] };

export const NextSlide = {
  args: mocks['default'],
  play: async ({ canvasElement }) => {
    await initModules(canvasElement);
    canvasElement.querySelector('[data-carousel-next]').click();
  },
};
