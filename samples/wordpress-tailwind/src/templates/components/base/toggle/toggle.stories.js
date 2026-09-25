import { renderTwig } from '~sb/twig';
import { matrixCard, storyStack, stateProps } from '~sb/story-helpers';
import data from './toggle.twig.json';

const mocks = data.mocks['toggle'];
const TWIG_ID = '@components/base/toggle/toggle.twig';

export default {
  title: 'Base/Toggle',
  render: (args) => renderTwig(TWIG_ID, args),
  argTypes: {
    label: {
      control: 'text',
      description: 'Testo visibile; ometterlo per le taglie icon-only e usare ariaLabel.',
      table: { category: 'Content' },
    },
    icon: {
      control: 'text',
      description: 'Nome icona sprite renderizzata prima della label.',
      table: { category: 'Content' },
    },
    ariaLabel: {
      control: 'text',
      description: 'OBBLIGATORIO quando non è presente label (toggle icon-only).',
      table: { category: 'Accessibility' },
    },
    variant: {
      control: 'select',
      options: ['default', 'outline'],
      description: 'Variante visiva.',
      table: { category: 'Appearance', defaultValue: { summary: 'default' } },
    },
    size: {
      control: 'select',
      options: ['default', 'sm', 'lg'],
      description: 'Dimensione del toggle.',
      table: { category: 'Appearance', defaultValue: { summary: 'default' } },
    },
    pressed: {
      control: 'boolean',
      description: 'Stato premuto iniziale.',
      table: { category: 'State' },
    },
    disabled: {
      control: 'boolean',
      description: 'Disabilita il controllo.',
      table: { category: 'State' },
    },
    id: { table: { disable: true } },
    class: { table: { disable: true } },
    attrs: { table: { disable: true } },
  },
  parameters: { layout: 'centered' },
};

/* ── Default — interactive playground ─────────────────────────────────── */

export const Default = { args: mocks.default };

/* ── Catalog — variant × size matrix and states ───────────────────────────── */

function tog(base, overrides = {}) {
  return renderTwig(TWIG_ID, { ...base, ...overrides });
}

const VARIANTS = [
  { key: 'default', label: 'Default' },
  { key: 'outline', label: 'Outline' },
];

const SIZES = [
  { key: 'sm', label: 'SM' },
  { key: 'default', label: 'Default' },
  { key: 'lg', label: 'LG' },
];

/* ─── 1. Variants × Sizes ─────────────────────────────────────────────────── */

const variantSizesCard = matrixCard({
  title: 'Variants × Sizes',
  rowAxisLabel: 'Size',
  intro: 'Entrambe le varianti (<code>default</code> / <code>outline</code>) alle tre dimensioni disponibili.',
  columns: VARIANTS.map((v) => v.label),
  rows: SIZES,
  renderCell: (col, row) => {
    const variant = VARIANTS.find((v) => v.label === col)?.key ?? 'default';
    return tog({ label: 'Grassetto', variant, size: row.key });
  },
});

/* ─── 2. Variants × Sizes — icon-only ─────────────────────────────────────── */

const iconSizesCard = matrixCard({
  title: 'Icon-only × Sizes',
  rowAxisLabel: 'Size',
  intro: 'Toggle icon-only (senza label; <code>ariaLabel</code> obbligatorio per accessibilità) tra varianti e dimensioni.',
  columns: VARIANTS.map((v) => v.label),
  rows: SIZES,
  renderCell: (col, row) => {
    const variant = VARIANTS.find((v) => v.label === col)?.key ?? 'default';
    return tog({ icon: 'check', ariaLabel: 'Attiva grassetto', variant, size: row.key });
  },
});

/* ─── 3. Pressed state ────────────────────────────────────────────────────── */
// Toggle twig defines hover:bg-muted / focus-visible:border-ring / focus-visible:ring-*
// but no active: utility, so the Active column is skipped in favor of the real pressed prop.

const PRESSED_COLUMNS = ['Off', 'On (pressed)', 'Disabled'];

const pressedCard = matrixCard({
  title: 'Pressed state',
  rowAxisLabel: 'Variant',
  intro:
    'La prop <code>pressed</code> imposta <code>data-state="on"</code> che attiva ' +
    '<code>data-[state=on]:bg-accent</code>. Disabled usa la prop reale <code>disabled</code>.',
  columns: PRESSED_COLUMNS,
  rows: VARIANTS,
  renderCell: (col, row) => {
    if (col === 'Off') return tog({ label: 'Grassetto', variant: row.key });
    if (col === 'On (pressed)') return tog({ label: 'Grassetto', variant: row.key, pressed: true });
    return tog({ label: 'Grassetto', variant: row.key, disabled: true });
  },
});

/* ─── 4. States (hover / focus) ───────────────────────────────────────────── */
// hover:bg-muted / hover:text-muted-foreground → Hover column works.
// focus-visible:border-ring / focus-visible:ring-* → Focus column works.
// No active: utilities defined → Active column omitted.

const STATE_COLS = ['Default', 'Hover', 'Focus', 'Disabled'];

const statesCard = matrixCard({
  title: 'Interactive States',
  rowAxisLabel: 'Variant',
  intro:
    'Hover e Focus sono simulati tramite le classi <code>is-hover</code> / <code>is-focus-visible</code> ' +
    '(custom variant Storybook-only). Active è omesso perché il twig non definisce utility <code>active:</code>.',
  columns: STATE_COLS,
  rows: VARIANTS,
  renderCell: (col, row) => {
    if (col === 'Disabled') return tog({ label: 'Grassetto', variant: row.key, disabled: true });
    return tog({ label: 'Grassetto', variant: row.key }, stateProps(col));
  },
});

export const Catalog = {
  parameters: { layout: 'padded' },
  render: () => storyStack(variantSizesCard, iconSizesCard, pressedCard, statesCard),
};
