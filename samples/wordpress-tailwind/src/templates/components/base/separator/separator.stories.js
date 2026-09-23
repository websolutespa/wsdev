import { renderTwig } from '~sb/twig';
import { demoCard, matrixCard, storyStack } from '~sb/story-helpers';
import data from './separator.twig.json';

const mocks = data.mocks['separator'];
const TWIG_ID = '@components/base/separator/separator.twig';

export default {
  title: 'Base/Separator',
  render: (args) => renderTwig(TWIG_ID, args),
  argTypes: {
    orientation: {
      control: 'select',
      options: ['horizontal', 'vertical'],
      description: 'Direzione del separatore.',
      table: { category: 'Appearance', defaultValue: { summary: 'horizontal' } },
    },
    decorative: {
      control: 'boolean',
      description: 'true (default) rende role="none" (puramente visivo); false rende role="separator" + aria-orientation.',
      table: { category: 'Accessibility', defaultValue: { summary: 'true' } },
    },
    slot: { table: { disable: true } },
    id: { table: { disable: true } },
    class: { table: { disable: true } },
    attrs: { table: { disable: true } },
  },
  parameters: { layout: 'centered' },
};

/* ── Default — interactive playground ───────────────────────────────────── */

export const Default = { args: mocks['default'] };

/* ── Catalog — orientations, semantic mode and in-context usage ─────────── */

function sep(overrides) {
  return renderTwig(TWIG_ID, overrides);
}

const ORIENTATIONS = [
  { key: 'horizontal', label: 'Horizontal' },
  { key: 'vertical', label: 'Vertical' },
];

const MODES = [
  { key: 'decorative', label: 'Decorative (role=none)', decorative: true },
  { key: 'semantic', label: 'Semantic (role=separator)', decorative: false },
];

const orientationCard = matrixCard({
  title: 'Orientation × Semantic mode',
  rowAxisLabel: 'Mode',
  intro:
    'Horizontal renderizza una riga alta 1 px a larghezza piena; vertical renderizza una riga larga 1 px ad altezza piena. ' +
    '<code>decorative: true</code> (default) emette <code>role="none"</code> — puramente visivo. ' +
    '<code>decorative: false</code> emette <code>role="separator"</code> + <code>aria-orientation</code> per le tecnologie assistive.',
  columns: ORIENTATIONS.map((o) => o.label),
  rows: MODES,
  renderCell: (col, row) => {
    const orientation = ORIENTATIONS.find((o) => o.label === col)?.key ?? 'horizontal';
    if (orientation === 'horizontal') {
      return `<div class="w-48">${sep({ orientation, decorative: row.decorative })}</div>`;
    }
    return `<div class="h-10">${sep({ orientation, decorative: row.decorative })}</div>`;
  },
});

const horizontalContextCard = demoCard({
  title: 'Horizontal — in context',
  intro: 'Riga orizzontale tra due blocchi di testo. Uso comune per dividere sezioni in card, pannelli impostazioni e pagine di documentazione.',
  content: `
    <div class="w-80">
      <div class="space-y-1">
        <h4 class="text-sm leading-none font-medium">Linee guida del brand</h4>
        <p class="text-muted-foreground text-sm">Tono di voce, palette colori e componenti UI del progetto.</p>
      </div>
      ${sep({ class: 'my-4' })}
      <p class="text-muted-foreground text-sm">Aggiornate con il rilascio 2.4 del design system.</p>
    </div>
  `,
});

const verticalContextCard = demoCard({
  title: 'Vertical — in context',
  intro: 'Separatori verticali dentro una riga di navigazione inline. Il separatore deve stare in un contenitore flex con un\'altezza definita (<code>h-5</code> qui).',
  content: `
    <div class="flex h-5 items-center space-x-4 text-sm">
      <div>Blog</div>
      ${sep({ orientation: 'vertical' })}
      <div>Progetti</div>
      ${sep({ orientation: 'vertical' })}
      <div>Contatti</div>
    </div>
  `,
});

export const Catalog = {
  parameters: { layout: 'padded' },
  render: () => storyStack(orientationCard, horizontalContextCard, verticalContextCard),
};
