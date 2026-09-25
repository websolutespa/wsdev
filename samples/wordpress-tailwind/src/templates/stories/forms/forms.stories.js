import { renderTwig } from '~sb/twig';
import { demoCard, storyStack } from '~sb/story-helpers';

export default {
  title: 'Base/Form',
  parameters: { layout: 'padded' },
};

/** base/field composition validated by form.module.js (blur + submit, honeypot, fetch submit). */
export const Native = {
  render: () => renderTwig('stories/forms/form-demo.twig'),
};

/** Static Formidable markup; styled only because .storybook/preview.css imports the adapter CSS. */
export const Formidable = {
  render: () => renderTwig('stories/forms/formidable-demo.twig'),
};

/* ── Catalog — both form flavours at a glance ───────────────────────────────
   Formidable is static here (no play()): the Formidable story above is the
   place to review its own markup in isolation. */

export const Catalog = {
  parameters: { layout: 'padded' },
  render: () =>
    storyStack(
      demoCard({
        title: 'Native',
        intro: 'base/field composition, validated client-side by form.module.js (blur + submit, honeypot, fetch submit).',
        content: renderTwig('stories/forms/form-demo.twig'),
      }),
      demoCard({
        title: 'Formidable',
        intro: 'Static Formidable markup, styled only via the adapter CSS imported by preview.css.',
        content: renderTwig('stories/forms/formidable-demo.twig'),
      })
    ),
};
