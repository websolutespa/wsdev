import { renderTwig } from '~sb/twig';
import { demoCard, storyStack } from '~sb/story-helpers';
import data from './spinner.twig.json';

const mocks = data.mocks['spinner'];
const TWIG_ID = '@components/base/spinner/spinner.twig';

export default {
  title: 'Base/Spinner',
  render: (args) => renderTwig(TWIG_ID, args),
  argTypes: {
    size: {
      control: 'select',
      options: ['12', '16', '20', '24', '32'],
      description: 'Diametro in px (dimensioni kit Figma); "16" combacia con la dimensione fissa upstream.',
      table: { category: 'Appearance', defaultValue: { summary: '16' } },
    },
    ariaLabel: {
      control: 'text',
      description: 'Nome accessibile (default: "Loading", combacia con upstream).',
      table: { category: 'Accessibility' },
    },
    id: { table: { disable: true } },
    class: { table: { disable: true } },
    attrs: { table: { disable: true } },
  },
  parameters: { layout: 'centered' },
};

/* ── Default — interactive playground ───────────────────────────────────── */

export const Default = { args: mocks['default'] };

/* ── InButton — spinner-in-button pattern ────────────────────────────────── */

/**
 * Il bottone Twig non ha uno slot children: passiamo lo spinner come icona del
 * bottone via `icon: 'loader-circle'` — lo stesso sprite usato da spinner.twig,
 * animato a livello di bottone con `[&_svg]:animate-spin`.
 */
export const InButton = {
  render: () =>
    renderTwig('@components/base/button/button.twig', {
      label: 'Invio in corso',
      icon: 'loader-circle',
      disabled: true,
      class: '[&_svg]:animate-spin',
    }),
};

/* ── Catalog — sizes and in-context usage ────────────────────────────────── */

function sp(overrides) {
  return renderTwig(TWIG_ID, overrides);
}

const SIZES = [
  { key: '12', label: 'XS (12 px)' },
  { key: '16', label: 'SM (16 px)' },
  { key: '20', label: 'MD (20 px)' },
  { key: '24', label: 'LG (24 px)' },
  { key: '32', label: 'XL (32 px)' },
];

const sizesCard = demoCard({
  title: 'Sizes',
  intro: 'La dimensione dello spinner è guidata dal prop <code>size</code>, mappato sulle dimensioni del kit (<code>tokens/figma-components/spinner.json</code>). La base è <code>size-4</code> (16 px).',
  content: `<div class="flex items-end gap-6">
    ${SIZES.map((s) =>
    `<div class="flex flex-col items-center gap-2">
        ${sp({ size: s.key })}
        <span class="text-xs text-muted-foreground whitespace-nowrap">${s.label}</span>
      </div>`
  ).join('\n    ')}
  </div>`,
});

const inContextCard = demoCard({
  title: 'In context',
  intro: 'Pattern d\'uso comuni: indicatore di stato standalone, dentro un bottone (via <code>icon: \'loader-circle\'</code>) e come stato di caricamento pagina.',
  content: `
    <div class="flex flex-col gap-6">
      <div class="flex items-center gap-3">
        <span class="text-xs text-muted-foreground w-28 shrink-0">Standalone</span>
        ${sp({})}
      </div>
      <div class="flex items-center gap-3">
        <span class="text-xs text-muted-foreground w-28 shrink-0">In button</span>
        ${renderTwig('@components/base/button/button.twig', {
    label: 'Invio in corso',
    icon: 'loader-circle',
    disabled: true,
    class: '[&_svg]:animate-spin',
  })}
      </div>
      <div class="flex items-center gap-3">
        <span class="text-xs text-muted-foreground w-28 shrink-0">Large status</span>
        ${sp({ size: '32', ariaLabel: 'Caricamento pagina' })}
      </div>
    </div>
  `,
});

export const Catalog = {
  parameters: { layout: 'padded' },
  render: () => storyStack(sizesCard, inContextCard),
};
