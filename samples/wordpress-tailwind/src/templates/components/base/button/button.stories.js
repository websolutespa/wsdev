import { renderTwig } from '~sb/twig';
import data from './button.twig.json';

const mocks = data.mocks['button'];

export default {
  title: 'Base/Button',
  render: (args) => renderTwig('@components/base/button/button.twig', args),
  parameters: { layout: 'centered' },
};

export const Default = { args: mocks['default'] };
export const Destructive = { args: mocks['destructive'] };
export const Outline = { args: mocks['outline'] };
export const Secondary = { args: mocks['secondary'] };
export const Ghost = { args: mocks['ghost'] };
export const Link = { args: mocks['link'] };
export const SizeXs = { args: mocks['size-xs'] };
export const SizeSm = { args: mocks['size-sm'] };
export const SizeLg = { args: mocks['size-lg'] };
export const SizeIcon = { args: mocks['size-icon'] };
export const SizeIconXs = { args: mocks['size-icon-xs'] };
export const SizeIconSm = { args: mocks['size-icon-sm'] };
export const SizeIconLg = { args: mocks['size-icon-lg'] };
export const WithIcon = { args: mocks['with-icon'] };
export const WithIconAfter = { args: mocks['with-icon-after'] };
export const Disabled = { args: mocks['disabled'] };
export const AsLink = { args: mocks['as-link'] };
