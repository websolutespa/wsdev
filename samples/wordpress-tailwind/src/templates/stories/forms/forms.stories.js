import { renderTwig } from '~sb/twig';
import { initModules } from '~sb/modules';

export default {
  title: 'Forms/Form',
  parameters: { layout: 'padded' },
};

/** base/field composition validated by form.module.js (blur + submit, honeypot, fetch submit). */
export const Native = {
  render: () => renderTwig('stories/forms/form-demo.twig'),
  play: async ({ canvasElement }) => {
    await initModules(canvasElement);
  },
};

/** Static Formidable markup; styled only because .storybook/preview.css imports the adapter CSS. */
export const Formidable = {
  render: () => renderTwig('stories/forms/formidable-demo.twig'),
};
