import { renderTwig } from '~sb/twig';
import { initModules } from '~sb/modules';
import data from './avatar.twig.json';

const mocks = data.mocks['avatar'];

export default {
  title: 'Base/Avatar',
  render: (args) => renderTwig('@components/base/avatar/avatar.twig', args),
  parameters: { layout: 'centered' },
};

export const Default = { args: mocks['default'] };
export const FallbackOnly = { args: mocks['fallback-only'] };
export const BrokenImage = { args: mocks['broken-image'] };
export const SizeSm = { args: mocks['size-sm'] };
export const SizeLg = { args: mocks['size-lg'] };
export const WithBadge = { args: mocks['with-badge'] };
export const WithBadgeIcon = { args: mocks['with-badge-icon'] };
export const Group = { args: mocks['group'] };

export const Mounted = {
  args: mocks['default'],
  play: async ({ canvasElement }) => {
    await initModules(canvasElement);
  },
};
