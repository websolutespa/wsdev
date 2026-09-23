import { renderTwig } from '~sb/twig';
import { demoCard, storyStack } from '~sb/story-helpers';
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
      options: ['default', 'secondary', 'destructive', 'outline', 'ghost', 'link'],
      description: 'Schema colore del badge.',
      table: { category: 'Appearance', defaultValue: { summary: 'default' } },
    },
    icon: {
      control: 'text',
      description: 'Nome icona sprite renderizzata prima del label.',
      table: { category: 'Content' },
    },
    url: {
      control: 'text',
      description: 'Se impostato renderizza <a> invece di <span> (pattern upstream asChild).',
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
  intro: 'Tutte le sei varianti del componente Badge. I badge non hanno stati interattivi propri — gli effetti hover/focus si attivano solo quando renderizzati come <code>&lt;a&gt;</code> tramite il prop <code>url</code>.',
  content: `<div class="flex flex-wrap items-center gap-3">
    ${VARIANTS.map((v) => badge({ label: v.label, variant: v.key })).join('\n    ')}
  </div>`,
});

/* ─── 2. With icon ──────────────────────────────────────────────────────── */

const withIconCard = demoCard({
  title: 'With icon',
  intro: 'Icona SVG sprite renderizzata prima del label tramite il prop <code>icon</code>. L\'icona è dimensionata a 12 px da <code>[&gt;svg]:size-3</code> sulla classe base del badge.',
  content: `<div class="flex flex-wrap items-center gap-3">
    ${VARIANTS.map((v) => badge({ label: v.label, variant: v.key, icon: 'circle-check' })).join('\n    ')}
  </div>`,
});

/* ─── 3. As link ────────────────────────────────────────────────────────── */

const asLinkCard = demoCard({
  title: 'As link',
  intro: 'Con il prop <code>url</code> impostato il badge diventa un elemento <code>&lt;a&gt;</code> navigabile, mantenendo l\'aspetto visivo della variante.',
  content: `<div class="flex flex-wrap items-center gap-3">
    ${badge({ label: 'Promo -20%', variant: 'default', url: 'https://www.websolute.it', target: '_blank' })}
    ${badge({ label: 'Vedi dettagli', variant: 'link', url: '#' })}
  </div>`,
});

export const Catalog = {
  parameters: { layout: 'padded' },
  render: () => storyStack(badgesCard, withIconCard, asLinkCard),
};
