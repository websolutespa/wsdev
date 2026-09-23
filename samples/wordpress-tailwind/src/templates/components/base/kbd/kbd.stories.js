import { renderTwig } from '~sb/twig';
import { demoCard, storyStack } from '~sb/story-helpers';
import data from './kbd.twig.json';

const mocks = data.mocks['kbd'];
const TWIG_ID = '@components/base/kbd/kbd.twig';

export default {
  title: 'Base/Kbd',
  render: (args) => renderTwig(TWIG_ID, args),
  argTypes: {
    label: {
      control: 'text',
      description: 'Label per un singolo tasto (es. \'⌘\', \'Ctrl\', \'S\'); ignorata quando è impostato keys.',
      table: { category: 'Content' },
    },
    icon: {
      control: 'text',
      description: 'Nome icona sprite al posto o accanto alla label testuale.',
      table: { category: 'Content' },
    },
    keys: {
      control: 'object',
      description: 'Array di { label?, icon? }: se impostato, renderizza un KbdGroup di tasti separati da "+".',
      table: { category: 'Content' },
    },
    id: { table: { disable: true } },
    class: { table: { disable: true } },
    attrs: { table: { disable: true } },
  },
  parameters: { layout: 'centered' },
};

/* ── Default — interactive playground ─────────────────────────────────── */

export const Default = { args: mocks.default };

/* ── Catalog — mock scenarios, single keys and combo shortcuts ───────────── */

function kbd(overrides) {
  return renderTwig(TWIG_ID, overrides);
}

const SINGLE_KEYS = [
  { label: '⌘', description: '⌘ (Command)' },
  { label: '⌃', description: '⌃ (Control)' },
  { label: '⌥', description: '⌥ (Option)' },
  { label: '⇧', description: '⇧ (Shift)' },
  { label: '↵', description: '↵ (Enter)' },
  { label: 'Esc', description: 'Esc' },
  { label: 'Tab', description: 'Tab' },
  { label: 'S', description: 'S (lettera)' },
];

/* ─── 1. Single keys (mock scenarios: default, letter) ───────────────────── */

const singleKeysCard = demoCard({
  title: 'Single keys',
  intro:
    'Le prop <code>label</code> / <code>icon</code> renderizzano un singolo elemento ' +
    '<code>&lt;kbd&gt;</code>. Simboli modificatori comuni e tasti con nome.',
  content: `<div class="flex flex-wrap items-center gap-2">
    ${SINGLE_KEYS.map((k) => kbd({ label: k.label })).join('\n    ')}
  </div>`,
});

/* ─── 2. Combo shortcuts (mock scenarios: group-separated, group-with-icon) ── */

const COMBOS = [
  { keys: [{ label: '⌘' }, { label: 'K' }], description: 'Command palette' },
  { keys: [{ label: '⌘' }, { label: 'S' }], description: 'Salva' },
  { keys: [{ label: '⌘' }, { label: 'Z' }], description: 'Annulla' },
  { keys: [{ label: '⌘' }, { label: '⇧' }, { label: 'Z' }], description: 'Ripeti' },
  { keys: [{ label: 'Ctrl' }, { label: 'Maiusc' }, { label: 'S' }], description: 'Salva con nome (Win)' },
  { keys: [{ icon: 'chevron-up' }, { label: 'K' }], description: 'Cronologia comandi' },
];

const comboCard = demoCard({
  title: 'Combo shortcuts',
  intro:
    'Un array in <code>keys</code> renderizza un wrapper <code>&lt;kbd data-slot="kbd-group"&gt;</code> ' +
    'con un chip per tasto, separati da "+". Un elemento può portare <code>icon</code> invece di <code>label</code>.',
  content: `
    <div class="grid grid-cols-2 gap-x-8 gap-y-3">
      ${COMBOS.map(
    (c) => `
      <div class="flex items-center gap-3">
        ${kbd({ keys: c.keys })}
        <span class="text-muted-foreground text-xs">${c.description}</span>
      </div>`
  ).join('')}
    </div>
  `,
});

/* ─── 3. In context (menu row) ────────────────────────────────────────────── */

const inContextCard = demoCard({
  title: 'In context',
  intro: 'Scorciatoie da tastiera mostrate in linea accanto a etichette azione — pattern comune in menu, tooltip e command palette.',
  content: `
    <div class="border-border bg-card divide-border w-56 divide-y rounded-md border text-sm">
      ${[
    { label: 'Nuovo file', keys: [{ label: '⌘' }, { label: 'N' }] },
    { label: 'Apri…', keys: [{ label: '⌘' }, { label: 'O' }] },
    { label: 'Salva', keys: [{ label: '⌘' }, { label: 'S' }] },
    { label: 'Trova', keys: [{ label: '⌘' }, { label: 'F' }] },
  ]
    .map(
      (r) => `
      <div class="flex items-center justify-between px-3 py-2">
        <span class="text-foreground">${r.label}</span>
        ${kbd({ keys: r.keys })}
      </div>`
    )
    .join('')}
    </div>
  `,
});

export const Catalog = {
  parameters: { layout: 'padded' },
  render: () => storyStack(singleKeysCard, comboCard, inContextCard),
};
