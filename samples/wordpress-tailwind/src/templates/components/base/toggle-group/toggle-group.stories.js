import { renderTwig } from '~sb/twig';
import { initModules } from '~sb/modules';
import { matrixCard, demoCard, storyStack } from '~sb/story-helpers';
import data from './toggle-group.twig.json';

const mocks = data.mocks['toggle-group'];
const TWIG_ID = '@components/base/toggle-group/toggle-group.twig';

export default {
  title: 'Base/ToggleGroup',
  render: (args) => renderTwig(TWIG_ID, args),
  argTypes: {
    type: {
      control: 'select',
      options: ['single', 'multiple'],
      description: 'In single, selezionare un item deselezione i fratelli.',
      table: { category: 'Behaviour', defaultValue: { summary: 'single' } },
    },
    items: {
      control: 'object',
      description: 'Array di { label?, icon?, ariaLabel?, value, pressed?, disabled? }.',
      table: { category: 'Content' },
    },
    variant: {
      control: 'select',
      options: ['default', 'outline'],
      description: 'Variante visiva condivisa da tutti gli item.',
      table: { category: 'Appearance', defaultValue: { summary: 'default' } },
    },
    size: {
      control: 'select',
      options: ['default', 'sm', 'lg'],
      description: 'Dimensione condivisa da tutti gli item.',
      table: { category: 'Appearance', defaultValue: { summary: 'default' } },
    },
    ariaLabel: {
      control: 'text',
      description: 'Nome accessibile del gruppo, OBBLIGATORIO.',
      table: { category: 'Accessibility' },
    },
    id: { table: { disable: true } },
    class: { table: { disable: true } },
    attrs: { table: { disable: true } },
  },
  parameters: { layout: 'centered' },
};

/* ── Default — interactive playground ─────────────────────────────────── */

export const Default = { args: mocks.default };

/* ── Toggled — play() verifies single-mode mutual exclusion ───────────────── */

/** Single mode: pressing another item unpresses the sibling that was on. */
export const Toggled = {
  args: mocks.default,
  play: async ({ canvasElement }) => {
    await initModules(canvasElement);
    canvasElement.querySelectorAll('[data-slot="toggle-group-item"]')[1].click();
  },
};

/* ── Catalog — mock scenarios + type × variant × size and content patterns ── */

function grp(overrides) {
  return renderTwig(TWIG_ID, overrides);
}

const mocksCard = demoCard({
  title: 'Mock scenarios',
  intro: 'Tutti gli scenari definiti in <code>toggle-group.twig.json</code>.',
  content: `<div class="flex flex-col gap-4">
    ${grp(mocks.multiple)}
    ${grp(mocks.outline)}
    ${grp(mocks.sm)}
    ${grp(mocks.disabled)}
  </div>`,
});

const textItems = (labels) => labels.map((l, i) => ({ label: l, value: String(i), pressed: i === 0 }));

const iconItems = [
  { icon: 'align-left', ariaLabel: 'Allinea a sinistra', value: 'left', pressed: true },
  { icon: 'align-center', ariaLabel: 'Allinea al centro', value: 'center' },
  { icon: 'align-right', ariaLabel: 'Allinea a destra', value: 'right' },
];

const VARIANTS = [
  { key: 'default', label: 'Default' },
  { key: 'outline', label: 'Outline' },
];

const SIZES = [
  { key: 'sm', label: 'SM' },
  { key: 'default', label: 'Default' },
  { key: 'lg', label: 'LG' },
];

/* ─── 1. Variant × Size (text items, single mode) ─────────────────────────── */

const variantSizesCard = matrixCard({
  title: 'Variant × Size',
  rowAxisLabel: 'Size',
  intro: 'Item con label testuale in modalità <code>type="single"</code> attraverso entrambe le varianti e tutte e tre le dimensioni.',
  columns: VARIANTS.map((v) => v.label),
  rows: SIZES,
  renderCell: (col, row) => {
    const variant = VARIANTS.find((v) => v.label === col)?.key ?? 'default';
    return grp({ ariaLabel: 'Opzioni', variant, size: row.key, items: textItems(['Alfa', 'Beta', 'Gamma']) });
  },
});

/* ─── 2. Variant × Size (icon items, single mode) ─────────────────────────── */

const iconSizesCard = matrixCard({
  title: 'Icon-only × Size',
  rowAxisLabel: 'Size',
  intro: 'Item icon-only — ogni item richiede <code>ariaLabel</code> per accessibilità.',
  columns: VARIANTS.map((v) => v.label),
  rows: SIZES,
  renderCell: (col, row) => {
    const variant = VARIANTS.find((v) => v.label === col)?.key ?? 'default';
    return grp({ ariaLabel: 'Allineamento testo', variant, size: row.key, items: iconItems });
  },
});

/* ─── 3. Type: single vs multiple ─────────────────────────────────────────── */

const typeCard = demoCard({
  title: 'Selection type',
  intro:
    'In <code>type="single"</code> selezionare un nuovo item deseleziona il precedente. ' +
    'In <code>type="multiple"</code> gli item sono indipendenti — più di uno può essere attivo contemporaneamente.',
  content: `
    <div class="flex flex-col gap-4">
      <div class="flex items-center gap-3">
        <span class="text-muted-foreground w-20 shrink-0 text-xs">Single</span>
        ${grp({ ariaLabel: 'Allineamento testo', type: 'single', items: textItems(['Sinistra', 'Centro', 'Destra']) })}
      </div>
      <div class="flex items-center gap-3">
        <span class="text-muted-foreground w-20 shrink-0 text-xs">Multiple</span>
        ${grp({
    ariaLabel: 'Stile testo',
    type: 'multiple',
    items: [
      { label: 'Grassetto', value: 'bold', pressed: true },
      { label: 'Corsivo', value: 'italic', pressed: true },
      { label: 'Sottolineato', value: 'underline' },
    ],
  })}
      </div>
    </div>
  `,
});

/* ─── 4. With disabled item ────────────────────────────────────────────────── */

const disabledItemCard = demoCard({
  title: 'Disabled item',
  intro: 'I singoli item possono essere disabilitati via <code>item.disabled: true</code> — il gruppo resta funzionante per gli altri item.',
  content: grp({
    ariaLabel: 'Vista',
    variant: 'outline',
    items: [
      { label: 'Griglia', value: 'grid', pressed: true },
      { label: 'Elenco', value: 'list' },
      { label: 'Mappa', value: 'map', disabled: true },
    ],
  }),
});

export const Catalog = {
  parameters: { layout: 'padded' },
  render: () => storyStack(mocksCard, variantSizesCard, iconSizesCard, typeCard, disabledItemCard),
};
