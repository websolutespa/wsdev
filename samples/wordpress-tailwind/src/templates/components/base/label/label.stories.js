import { renderTwig } from '~sb/twig';
import data from './label.twig.json';

const mocks = data.mocks['label'];

export default {
  title: 'Base/Label',
  render: (args) => renderTwig('@components/base/label/label.twig', args),
  parameters: { layout: 'centered' },
};

export const Default = { args: mocks['default'] };
export const Disabled = { args: mocks['disabled'] };
