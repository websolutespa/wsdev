import { renderTwig } from '~sb/twig';
import {
  demoCard,
  matrixCard,
  storyStack,
  stateProps
} from '~sb/story-helpers';
import data from './badge.twig.json';

const mocks = data.mocks['badge'];
const TWIG_ID = '@components/base/badge/badge.twig';

export default {
  title: 'Base/Badge',
  render: (args) => renderTwig(TWIG_ID, args),
  argTypes: {
    label: {
      control: 'text',
      description: 'Testo del badge.',
      table: { category: 'Content' },
    },
    variant: {
      control: 'select',
      options: [
        'default',
        'secondary',
        'destructive',
        'outline',
        'ghost',
        'link',
      ],
      description: 'Schema colore del badge.',
      table: { category: 'Appearance', defaultValue: { summary: 'default' } },
    },
    size: {
      control: 'select',
      options: ['default', 'number'],
      description:
        'Dimensione: \'number\' è il contatore compatto (Badge Number del Figma).',
      table: { category: 'Appearance', defaultValue: { summary: 'default' } },
    },
    icon: {
      control: 'text',
      description: 'Nome icona sprite renderizzata prima del label.',
      table: { category: 'Content' },
    },
    iconAfter: {
      control: 'text',
      description: 'Nome icona sprite renderizzata dopo il label.',
      table: { category: 'Content' },
    },
    url: {
      control: 'text',
      description:
        'Se impostato renderizza <a> invece di <span> (pattern upstream asChild).',
      table: { category: 'Behaviour' },
    },
    target: {
      control: 'select',
      options: ['_self', '_blank'],
      description: 'Target del link quando url è impostato.',
      table: { category: 'Behaviour' },
    },
    id: { table: { disable: true } },
    class: { table: { disable: true } },
    attrs: { table: { disable: true } },
  },
  parameters: { layout: 'centered' },
};

/* ── Default — interactive playground ───────────────────────────────────── */

export const Default = { args: mocks['default'] };

/* ── AsLink — badge rendered as <a> ──────────────────────────────────────── */

/**
 * Con `url` impostato il template emette un <a> invece di <span>. Gli stili
 * hover (definiti come [a&]:hover:*) si attivano solo sull'elemento anchor.
 */
export const AsLink = {
  args: mocks['as-link'],
  parameters: { layout: 'centered' },
};

/* ── NumberBadge — compact counter (Figma "Badge Number") ────────────────── */

export const NumberBadge = { name: 'Number', args: mocks['number'] };

/* ── Catalog — full variant showcase ─────────────────────────────────────── */

function badge(overrides) {
  return renderTwig(TWIG_ID, overrides);
}

const VARIANTS = [
  { key: 'default', label: 'Default' },
  { key: 'secondary', label: 'Secondary' },
  { key: 'destructive', label: 'Destructive' },
  { key: 'outline', label: 'Outline' },
  { key: 'ghost', label: 'Ghost' },
  { key: 'link', label: 'Link' },
];

/* ─── 1. Badges ─────────────────────────────────────────────────────────── */

const badgesCard = demoCard({
  title: 'Badges',
  intro:
    'Le cinque varianti del Figma più <code>link</code>, che viene da shadcn e non esiste nel kit. Gli effetti hover/focus si attivano solo quando il badge è renderizzato come <code>&lt;a&gt;</code> tramite il prop <code>url</code>.',
  content: `<div class="flex flex-wrap items-center gap-3">
    ${VARIANTS.map((v) => badge({ label: v.label, variant: v.key })).join('\n    ')}
  </div>`,
});

/* ─── 2. With icon ──────────────────────────────────────────────────────── */

const withIconCard = demoCard({
  title: 'With icon',
  intro:
    'Icona SVG sprite prima del label (<code>icon</code>) o dopo (<code>iconAfter</code>), dimensionata a 12 px da <code>[&amp;&gt;svg]:size-3</code>. Gli esempi riproducono quelli del Figma.',
  content: `<div class="flex flex-col gap-4">
    <div class="flex flex-wrap items-center gap-3">
      ${badge(mocks['with-icon'])}
      ${badge(mocks.alert)}
    </div>
    <div class="flex flex-wrap items-center gap-3">
      ${['default', 'secondary', 'destructive', 'outline'].map((v) => badge({ label: 'Link', variant: v, iconAfter: 'arrow-right' })).join('\n      ')}
    </div>
  </div>`,
});

/* ─── 3. Number ─────────────────────────────────────────────────────────── */

const numberCard = demoCard({
  title: 'Number',
  intro:
    'Con <code>size: \'number\'</code> il badge diventa un contatore compatto (altezza 20 px, larghezza minima 20 px, padding 4 px), come il componente Badge Number del Figma.',
  content: `<div class="flex flex-wrap items-center gap-3">
    ${badge({ label: '8', size: 'number' })}
    ${badge({ label: '99', size: 'number', variant: 'destructive' })}
    ${badge({ label: '20+', size: 'number', variant: 'outline' })}
    ${badge({ label: '3', size: 'number', variant: 'secondary' })}
    ${badge({ label: '5', size: 'number', variant: 'ghost' })}
  </div>`,
});

/* ─── 4. States ─────────────────────────────────────────────────────────── */

const STATES = ['Default', 'Hover', 'Focus'];

const statesGrid = matrixCard({
  title: 'States',
  rowAxisLabel: 'Variant',
  intro:
    'Hover e Focus si applicano solo al badge renderizzato come <code>&lt;a&gt;</code> (prop <code>url</code>); ' +
    'qui sono simulati con le classi <code>is-hover</code> / <code>is-focus-visible</code>.',
  columns: STATES,
  rows: VARIANTS,
  renderCell: (col, row) =>
    badge({ label: 'Badge', variant: row.key, url: '#', ...stateProps(col) }),
});

/* ─── 5. As link ────────────────────────────────────────────────────────── */

const asLinkCard = demoCard({
  title: 'As link',
  intro:
    'Con il prop <code>url</code> impostato il badge diventa un elemento <code>&lt;a&gt;</code> navigabile, mantenendo l\'aspetto visivo della variante.',
  content: `<div class="flex flex-wrap items-center gap-3">
    ${badge(mocks['as-link'])}
    ${badge(mocks['with-icon-after'])}
    ${badge(mocks.link)}
  </div>`,
});

export const Catalog = {
  parameters: { layout: 'padded' },
  render: () =>
    storyStack(badgesCard, withIconCard, numberCard, statesGrid, asLinkCard),
};
