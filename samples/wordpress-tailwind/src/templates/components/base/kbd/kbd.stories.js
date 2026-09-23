import { renderTwig } from '~sb/twig';
import data from './kbd.twig.json';

const mocks = data.mocks['kbd'];

export default {
  title: 'Base/Kbd',
  render: (args) => renderTwig('@components/base/kbd/kbd.twig', args),
  parameters: { layout: 'centered' },
};

export const Default = { args: mocks['default'] };
export const Letter = { args: mocks['letter'] };
export const GroupSeparated = { args: mocks['group-separated'] };
export const GroupWithIcon = { args: mocks['group-with-icon'] };
