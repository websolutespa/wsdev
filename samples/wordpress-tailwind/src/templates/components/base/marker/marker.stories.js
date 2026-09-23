import { renderTwig } from '~sb/twig';
import data from './marker.twig.json';

const mocks = data.mocks['marker'];

export default {
  title: 'Base/Marker',
  render: (args) => renderTwig('@components/base/marker/marker.twig', args),
  parameters: { layout: 'centered' },
};

export const Default = { args: mocks['default'] };
export const WithIcon = { args: mocks['with-icon'] };
export const Separator = { args: mocks['separator'] };
export const Border = { args: mocks['border'] };
export const AsLink = { args: mocks['as-link'] };
export const Steps = { args: mocks['steps'] };
