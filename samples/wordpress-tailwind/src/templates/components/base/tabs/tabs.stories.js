import { renderTwig } from '~sb/twig';
import { demoCard, matrixCard, storyStack } from '~sb/story-helpers';
import data from './tabs.twig.json';

const mocks = data.mocks['tabs'];
const TWIG_ID = '@components/base/tabs/tabs.twig';

export default {
  title: 'Base/Tabs',
  render: (args) => renderTwig(TWIG_ID, args),
  argTypes: {
    items: {
      control: 'object',
      description: 'Elenco delle tab: { value, label, content?, icon?, disabled? }.',
      table: { category: 'Content' },
    },
    defaultValue: {
      control: 'text',
      description: 'Valore della tab inizialmente attiva (default: la prima).',
      table: { category: 'Behaviour' },
    },
    orientation: {
      control: 'select',
      options: ['horizontal', 'vertical'],
      description: 'Direzione della lista delle tab.',
      table: { category: 'Appearance', defaultValue: { summary: 'horizontal' } },
    },
    activationMode: {
      control: 'select',
      options: ['automatic', 'manual'],
      description: 'automatic attiva la tab che riceve il focus da tastiera; manual richiede Invio/Spazio o clic.',
      table: { category: 'Behaviour', defaultValue: { summary: 'automatic' } },
    },
    variant: {
      control: 'select',
      options: ['default', 'line'],
      description: 'Aspetto della tabs-list (default = pillola, line = indicatore sottolineato).',
      table: { category: 'Appearance', defaultValue: { summary: 'default' } },
    },
    id: { table: { disable: true } },
    class: { table: { disable: true } },
    attrs: { table: { disable: true } },
  },
  parameters: { layout: 'padded' },
};

/* ── Default — Controls playground ───────────────────────────────────────── */

export const Default = { args: mocks['default'] };

/* ── Catalog ──────────────────────────────────────────────────────────────── */

/* ─── 1. Variant × Orientation matrix ────────────────────────────────────── */

const variantOrientationMatrix = matrixCard({
  title: 'Variant × Orientation',
  rowAxisLabel: 'Orientation',
  intro:
    'La prop <code>variant</code> controlla l\'aspetto della tabs-list (default = pillola, line = indicatore sottolineato). ' +
    'La prop <code>orientation</code> controlla l\'asse flex della lista e la direzione dell\'indicatore.',
  columns: ['default', 'line'],
  rows: [
    { key: 'horizontal', label: 'Horizontal' },
    { key: 'vertical', label: 'Vertical' },
  ],
  renderCell: (variant, row) => renderTwig(TWIG_ID, { ...mocks['default'], variant, orientation: row.key }),
  center: false,
});

/* ─── 2. With icons (vertical) ────────────────────────────────────────────── */

const withIconsCard = demoCard({
  title: 'With icons (vertical)',
  intro: 'Ogni tab può avere un\'icona sprite renderizzata prima dell\'etichetta.',
  content: renderTwig(TWIG_ID, mocks['vertical']),
});

/* ─── 3. Disabled tab ─────────────────────────────────────────────────────── */

const disabledCard = demoCard({
  title: 'With disabled tab',
  intro: 'Una tab disabilitata è renderizzata ma non interattiva; il modulo la salta durante la navigazione da tastiera.',
  content: renderTwig(TWIG_ID, mocks['disabled']),
});

/* ─── 4. Manual activation ────────────────────────────────────────────────── */

const manualCard = demoCard({
  title: 'Manual activation',
  intro:
    '<code>activationMode: "manual"</code> — le frecce spostano il focus senza cambiare il pannello attivo; ' +
    'Invio, Spazio o un clic attivano la tab focalizzata.',
  content: renderTwig(TWIG_ID, mocks['manual']),
});

/* ─── 5. Custom initial tab ───────────────────────────────────────────────── */

const defaultValueCard = demoCard({
  title: 'Custom initial tab',
  intro: '<code>defaultValue</code> sceglie la tab attiva al primo render, indipendentemente dal suo ordine nell\'array <code>items</code>.',
  content: renderTwig(TWIG_ID, { ...mocks['default'], defaultValue: 'billing' }),
});

export const Catalog = {
  parameters: { layout: 'padded' },
  render: () => storyStack(variantOrientationMatrix, withIconsCard, disabledCard, manualCard, defaultValueCard),
};
