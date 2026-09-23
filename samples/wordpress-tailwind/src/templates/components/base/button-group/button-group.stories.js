import { renderTwig } from '~sb/twig';
import data from './button-group.twig.json';

const mocks = data.mocks['button-group'];

export default {
  title: 'Base/ButtonGroup',
  render: (args) => renderTwig('@components/base/button-group/button-group.twig', args),
  parameters: { layout: 'centered' },
};

export const Default = { args: mocks['default'] };
export const Vertical = { args: mocks['vertical'] };
export const WithText = { args: mocks['with-text'] };
