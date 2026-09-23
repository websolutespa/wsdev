import { renderTwig } from '~sb/twig';
import { initModules } from '~sb/modules';
import data from './navigation-menu.twig.json';

const mocks = data.mocks['navigation-menu'];

export default {
  title: 'Base/NavigationMenu',
  render: (args) => renderTwig('@components/base/navigation-menu/navigation-menu.twig', args),
  parameters: { layout: 'padded' },
};

export const Default = { args: mocks['default'] };
export const NoViewport = { args: mocks['no-viewport'] };
export const WithIndicator = { args: mocks['with-indicator'] };
export const LinksOnly = { args: mocks['links-only'] };

export const Open = {
  args: mocks['default'],
  play: async ({ canvasElement }) => {
    await initModules(canvasElement);
    canvasElement.querySelector('[data-slot="navigation-menu-trigger"]').click();
  },
};
