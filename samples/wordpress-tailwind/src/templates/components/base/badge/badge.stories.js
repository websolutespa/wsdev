import { renderTwig } from '~sb/twig';
import data from './badge.twig.json';

const mocks = data.mocks['badge'];

export default {
  title: 'Base/Badge',
  render: (args) => renderTwig('@components/base/badge/badge.twig', args),
  parameters: { layout: 'centered' },
};

export const Default = { args: mocks['default'] };
export const Secondary = { args: mocks['secondary'] };
export const Destructive = { args: mocks['destructive'] };
export const Outline = { args: mocks['outline'] };
export const Ghost = { args: mocks['ghost'] };
export const Link = { args: mocks['link'] };
export const WithIcon = { args: mocks['with-icon'] };
export const AsLink = { args: mocks['as-link'] };
