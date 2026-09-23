import { renderTwig } from '~sb/twig';
import { initModules } from '~sb/modules';
import data from './sonner.twig.json';

const mocks = data.mocks['sonner'];

export default {
  title: 'Base/Sonner',
  render: (args) => renderTwig('@components/base/sonner/sonner.twig', args),
  parameters: { layout: 'centered' },
};

export const Default = { args: mocks['default'] };
export const RichColors = { args: mocks['rich-colors'] };
export const TopCenter = { args: mocks['top-center'] };
export const Loading = { args: mocks['loading'] };
export const NoCloseButton = { args: mocks['no-close-button'] };
export const Expand = { args: mocks['expand'] };

/** Clicks the first declarative [data-sonner-show] trigger to publish a toast. */
export const Toast = {
  args: mocks['default'],
  play: async ({ canvasElement }) => {
    await initModules(canvasElement);
    canvasElement.querySelector('[data-sonner-show]').click();
  },
};
