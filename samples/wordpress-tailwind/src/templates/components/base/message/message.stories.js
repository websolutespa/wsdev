import { renderTwig } from '~sb/twig';
import data from './message.twig.json';

const mocks = data.mocks['message'];

export default {
  title: 'Base/Message',
  render: (args) => renderTwig('@components/base/message/message.twig', args),
  parameters: { layout: 'centered' },
};

export const Default = { args: mocks['default'] };
export const Reply = { args: mocks['reply'] };
export const WithFooter = { args: mocks['with-footer'] };
export const NoAvatar = { args: mocks['no-avatar'] };
export const Group = { args: mocks['group'] };
