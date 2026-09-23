import { renderTwig } from '~sb/twig';
import { demoCard, matrixCard, storyStack, STATE_COLUMNS, stateProps } from '~sb/story-helpers';
import data from './button.twig.json';

const mocks = data.mocks['button'];
const TWIG_ID = '@components/base/button/button.twig';

export default {
  title: 'Base/Button',
  render: (args) => renderTwig(TWIG_ID, args),
  argTypes: {
    label: {
      control: 'text',
      description: 'Testo visibile; ometterlo per le taglie icon-only e usare ariaLabel.',
      table: { category: 'Content' },
    },
    variant: {
      control: 'select',
      options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'],
      description: 'Variante visiva del pulsante.',
      table: { category: 'Appearance', defaultValue: { summary: 'default' } },
    },
    size: {
      control: 'select',
      options: ['default', 'xs', 'sm', 'lg', 'icon', 'icon-xs', 'icon-sm', 'icon-lg'],
      description: 'Dimensione del pulsante, incluse le taglie quadrate icon-only.',
      table: { category: 'Appearance', defaultValue: { summary: 'default' } },
    },
    url: {
      control: 'text',
      description: 'Se impostato, il componente renderizza un tag <a> invece di <button>.',
      table: { category: 'Behaviour' },
    },
    target: {
      control: 'select',
      options: [undefined, '_self', '_blank'],
      description: 'Target del link quando è impostato url.',
      table: { category: 'Behaviour' },
    },
    type: {
      control: 'select',
      options: ['button', 'submit', 'reset'],
      description: 'Attributo type del <button> nativo.',
      table: { category: 'Behaviour', defaultValue: { summary: 'button' } },
    },
    disabled: {
      control: 'boolean',
      description: 'Disabilita il pulsante (o lo rende inerte se renderizzato come link).',
      table: { category: 'State' },
    },
    icon: {
      control: 'text',
      description: 'Nome icona sprite renderizzata prima della label.',
      table: { category: 'Content' },
    },
    iconAfter: {
      control: 'text',
      description: 'Nome icona sprite renderizzata dopo la label.',
      table: { category: 'Content' },
    },
    ariaLabel: {
      control: 'text',
      description: 'Etichetta accessibile, obbligatoria quando non è presente label (taglie icon-only).',
      table: { category: 'Accessibility' },
    },
    slot: {
      control: 'text',
      description: 'Valore di data-slot (default \'button\'); usato quando l\'include riempie una parte di un altro componente.',
      table: { category: 'Advanced', disable: true },
    },
    labelClass: {
      control: 'text',
      description: 'Classi aggiuntive sullo <span> della label, additive.',
      table: { category: 'Advanced' },
    },
    id: { table: { disable: true } },
    class: { table: { disable: true } },
    attrs: { table: { disable: true } },
  },
  parameters: { layout: 'centered' },
};

/* ── Default — interactive playground ─────────────────────────────────── */

export const Default = { args: mocks.default };

/* ── AsLink — button rendered as <a> ───────────────────────────────────── */

/**
 * Quando la prop `url` è impostata il template emette un tag <a> invece di
 * <button>: utile per azioni di navigazione che devono essere link reali
 * (apertura in nuova scheda, tasto destro → copia link, ecc.).
 */
export const AsLink = {
  args: mocks['as-link'],
  parameters: { layout: 'centered' },
};

/* ── Catalog — full mock/variant/size/icon/state grids ───────────────────── */

const VARIANTS = [
  { key: 'default', label: 'Default' },
  { key: 'secondary', label: 'Secondary' },
  { key: 'outline', label: 'Outline' },
  { key: 'ghost', label: 'Ghost' },
  { key: 'link', label: 'Link' },
  { key: 'destructive', label: 'Destructive' },
];

/** Render a button with optional overrides merged into a base context. */
function btn(base, overrides = {}) {
  return renderTwig(TWIG_ID, { ...base, ...overrides });
}

/* ─── 1. Mock scenarios ──────────────────────────────────────────────────── */

const mocksCard = demoCard({
  title: 'Mock scenarios',
  intro: 'Tutti gli scenari definiti in <code>button.twig.json</code>.',
  content: `<div class="flex flex-wrap items-center gap-3">
    ${btn(mocks.destructive)}
    ${btn(mocks.outline)}
    ${btn(mocks.secondary)}
    ${btn(mocks.ghost)}
    ${btn(mocks.link)}
    ${btn(mocks['with-icon'])}
    ${btn(mocks['with-icon-after'])}
    ${btn(mocks.disabled)}
  </div>`,
});

/* ─── 2. Button States Grid ──────────────────────────────────────────────── */

const statesGrid = matrixCard({
  title: 'Button States Grid',
  rowAxisLabel: 'Variant',
  intro:
    'Ogni variante × ogni stato interattivo. Hover, Focus e Active sono simulati ' +
    'staticamente tramite le classi <code>is-hover</code> / <code>is-focus-visible</code> / ' +
    '<code>is-active</code> (custom variant Storybook-only in ' +
    '<code>.storybook/story-utilities.css</code>).',
  columns: [...STATE_COLUMNS],
  rows: VARIANTS,
  renderCell: (col, row) => btn({ label: 'Button', variant: row.key }, stateProps(col)),
});

/* ─── 3. Button Sizes Grid ───────────────────────────────────────────────── */

const SIZES = [
  { key: 'xs', label: 'XS' },
  { key: 'sm', label: 'SM' },
  { key: 'default', label: 'Default' },
  { key: 'lg', label: 'LG' },
];

const sizesGrid = matrixCard({
  title: 'Button Sizes Grid',
  rowAxisLabel: 'Size',
  intro:
    'Matrice size × variant per le quattro taglie testuali (<code>xs</code>, <code>sm</code>, ' +
    '<code>default</code>, <code>lg</code>). Le taglie icon-only (<code>icon-*</code>) sono ' +
    'mostrate nella grid Square Button Sizes qui sotto.',
  columns: VARIANTS.map((v) => v.label),
  rows: SIZES,
  renderCell: (col, row) => {
    const variant = VARIANTS.find((v) => v.label === col)?.key ?? 'default';
    return btn({ label: 'Button', variant, size: row.key });
  },
});

/* ─── 4. With Icons ──────────────────────────────────────────────────────── */

const ICON_COLUMNS = ['Icon Left', 'Icon Right', 'Icon Left (XS)', 'Icon Only (XS)'];

const ICON_ROWS = [
  {
    key: 'default',
    label: 'Default',
    cells: {
      'Icon Left': btn({ label: 'Crea', icon: 'plus', variant: 'default' }),
      'Icon Right': btn({ label: 'Continua', iconAfter: 'arrow-right', variant: 'default' }),
      'Icon Left (XS)': btn({ label: 'Crea', icon: 'plus', variant: 'default', size: 'xs' }),
      'Icon Only (XS)': btn({ icon: 'plus', variant: 'default', size: 'icon-xs', ariaLabel: 'Crea' }),
    },
  },
  {
    key: 'secondary',
    label: 'Secondary',
    cells: {
      'Icon Left': btn({ label: 'Filtra', icon: 'settings', variant: 'secondary' }),
      'Icon Right': btn({ label: 'Opzioni', iconAfter: 'chevron-down', variant: 'secondary' }),
      'Icon Left (XS)': btn({ label: 'Filtra', icon: 'settings', variant: 'secondary', size: 'xs' }),
      'Icon Only (XS)': btn({ icon: 'settings', variant: 'secondary', size: 'icon-xs', ariaLabel: 'Impostazioni' }),
    },
  },
  {
    key: 'outline',
    label: 'Outline',
    cells: {
      'Icon Left': btn({ label: 'Scarica', icon: 'arrow-down', variant: 'outline' }),
      'Icon Right': btn({ label: 'Dettagli', iconAfter: 'chevron-right', variant: 'outline' }),
      'Icon Left (XS)': btn({ label: 'Cerca', icon: 'search', variant: 'outline', size: 'xs' }),
      'Icon Only (XS)': btn({ icon: 'x', variant: 'outline', size: 'icon-xs', ariaLabel: 'Chiudi' }),
    },
  },
  {
    key: 'ghost',
    label: 'Ghost',
    cells: {
      'Icon Left': btn({ label: 'Reimposta', icon: 'x', variant: 'ghost' }),
      'Icon Right': btn({ label: 'Altro', iconAfter: 'chevron-down', variant: 'ghost' }),
      'Icon Left (XS)': btn({ label: 'Reimposta', icon: 'x', variant: 'ghost', size: 'xs' }),
      'Icon Only (XS)': btn({ icon: 'search', variant: 'ghost', size: 'icon-xs', ariaLabel: 'Cerca' }),
    },
  },
  {
    key: 'link',
    label: 'Link',
    cells: {
      'Icon Left': btn({ label: 'Apri', icon: 'arrow-right', variant: 'link' }),
      'Icon Right': btn({ label: 'Scopri di più', iconAfter: 'arrow-right', variant: 'link' }),
      'Icon Left (XS)': btn({ label: 'Apri', icon: 'arrow-right', variant: 'link', size: 'xs' }),
      'Icon Only (XS)': btn({ icon: 'arrow-right', variant: 'link', size: 'icon-xs', ariaLabel: 'Apri' }),
    },
  },
  {
    key: 'destructive',
    label: 'Destructive',
    cells: {
      'Icon Left': btn({ label: 'Elimina', icon: 'x', variant: 'destructive' }),
      'Icon Right': btn({ label: 'Rimuovi', iconAfter: 'x', variant: 'destructive' }),
      'Icon Left (XS)': btn({ label: 'Elimina', icon: 'x', variant: 'destructive', size: 'xs' }),
      'Icon Only (XS)': btn({ icon: 'x', variant: 'destructive', size: 'icon-xs', ariaLabel: 'Elimina' }),
    },
  },
];

const iconsGrid = matrixCard({
  title: 'With Icons',
  rowAxisLabel: 'Variant',
  intro:
    'Posizionamento icona e taglie compatte dedicate <code>xs</code> / <code>icon-xs</code>. ' +
    'Usare <code>icon</code> per le icone prima della label, <code>iconAfter</code> per quelle dopo.',
  columns: ICON_COLUMNS,
  rows: ICON_ROWS,
  renderCell: (col, row) => row.cells[col],
});

/* ─── 5. Square Button States ────────────────────────────────────────────── */

const squareStatesGrid = matrixCard({
  title: 'Square Button States',
  rowAxisLabel: 'Variant',
  intro:
    'Button icon-only (impronta quadrata, <code>size="icon"</code>) attraverso ogni stato ' +
    'interattivo, con le stesse varianti e token del button rettangolare.',
  columns: [...STATE_COLUMNS],
  rows: VARIANTS,
  renderCell: (col, row) =>
    btn({ icon: 'settings', variant: row.key, size: 'icon', ariaLabel: 'Impostazioni' }, stateProps(col)),
});

/* ─── 6. Square Button Sizes ─────────────────────────────────────────────── */

const SQUARE_SIZES = [
  { key: 'icon-xs', label: 'XS (24PX)' },
  { key: 'icon-sm', label: 'SM (32PX)' },
  { key: 'icon', label: 'Default (36PX)' },
  { key: 'icon-lg', label: 'LG (40PX)' },
];

const squareSizesGrid = matrixCard({
  title: 'Square Button Sizes',
  rowAxisLabel: 'Size',
  intro:
    'Le quattro taglie icon-only (<code>icon-xs</code>, <code>icon-sm</code>, <code>icon</code>, ' +
    '<code>icon-lg</code> → 24 / 32 / 36 / 40 px), una riga per taglia.',
  columns: VARIANTS.map((v) => v.label),
  rows: SQUARE_SIZES,
  renderCell: (col, row) => {
    const variant = VARIANTS.find((v) => v.label === col)?.key ?? 'default';
    return btn({ icon: 'settings', variant, size: row.key, ariaLabel: 'Impostazioni' });
  },
});

export const Catalog = {
  parameters: { layout: 'padded' },
  render: () =>
    storyStack(mocksCard, statesGrid, sizesGrid, iconsGrid, squareStatesGrid, squareSizesGrid),
};
