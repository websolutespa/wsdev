import { renderTwig } from '~sb/twig';
import data from './attachment.twig.json';

const mocks = data.mocks['attachment'];

export default {
  title: 'Base/Attachment',
  render: (args) => renderTwig('@components/base/attachment/attachment.twig', args),
  parameters: { layout: 'centered' },
};

export const Default = { args: mocks['default'] };
export const Image = { args: mocks['image'] };
export const Uploading = { args: mocks['uploading'] };
export const Processing = { args: mocks['processing'] };
export const Error = { args: mocks['error'] };
export const Idle = { args: mocks['idle'] };
export const SizeXs = { args: mocks['size-xs'] };
export const Vertical = { args: mocks['vertical'] };
export const Group = { args: mocks['group'] };
