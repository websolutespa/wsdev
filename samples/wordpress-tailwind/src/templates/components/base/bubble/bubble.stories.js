import { renderTwig } from '~sb/twig';
import data from './bubble.twig.json';

const mocks = data.mocks['bubble'];

export default {
  title: 'Base/Bubble',
  render: (args) => renderTwig('@components/base/bubble/bubble.twig', args),
  parameters: { layout: 'centered' },
};

export const Default = { args: mocks['default'] };
export const Secondary = { args: mocks['secondary'] };
export const Muted = { args: mocks['muted'] };
export const Tinted = { args: mocks['tinted'] };
export const Outline = { args: mocks['outline'] };
export const Ghost = { args: mocks['ghost'] };
export const Destructive = { args: mocks['destructive'] };
export const WithReactions = { args: mocks['with-reactions'] };
export const AsLink = { args: mocks['as-link'] };
export const Group = { args: mocks['group'] };
