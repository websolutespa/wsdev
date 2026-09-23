import { renderTwig } from '~sb/twig';
import { initModules } from '~sb/modules';
import data from './select.twig.json';

const mocks = data.mocks['select'];

export default {
  title: 'Base/Select',
  render: (args) => renderTwig('@components/base/select/select.twig', args),
  parameters: { layout: 'centered' },
};

export const Default = { args: mocks['default'] };
export const WithValue = { args: mocks['with-value'] };
export const Groups = { args: mocks['groups'] };
export const Sm = { args: mocks['sm'] };
export const DisabledOptions = { args: mocks['disabled-options'] };
export const Disabled = { args: mocks['disabled'] };
export const Invalid = { args: mocks['invalid'] };

export const Open = {
  args: mocks['default'],
  play: async ({ canvasElement }) => {
    await initModules(canvasElement);
    canvasElement.querySelector('[data-slot="select-trigger"]').click();
  },
};
