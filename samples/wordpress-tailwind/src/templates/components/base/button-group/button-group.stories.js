import { renderTwig } from '~sb/twig';
import { demoCard, matrixCard, storyStack } from '~sb/story-helpers';
import data from './button-group.twig.json';

const mocks = data.mocks['button-group'];
const TWIG_ID = '@components/base/button-group/button-group.twig';

export default {
  title: 'Base/ButtonGroup',
  render: (args) => renderTwig(TWIG_ID, args),
  argTypes: {
    orientation: {
      control: 'select',
      options: ['horizontal', 'vertical'],
      description: 'Direzione del gruppo: \'horizontal\' affianca i figli, \'vertical\' li impila.',
      table: { category: 'Appearance', defaultValue: { summary: 'horizontal' } },
    },
    items: {
      control: 'object',
      description:
        'Contenuto data-driven del gruppo: array di { kind: \'button\'|\'text\'|\'separator\', text?, icon?, ' +
        '…props di base/button per kind "button" }.',
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

/* ── Catalog — orientation, content patterns ─────────────────────────────── */

function grp(overrides) {
  return renderTwig(TWIG_ID, overrides);
}

const ORIENTATIONS = [
  { key: 'horizontal', label: 'Horizontal' },
  { key: 'vertical', label: 'Vertical' },
];

const CONTENT_ROWS = [
  { key: 'buttons', label: 'Buttons' },
  { key: 'withSeparator', label: 'With separator' },
  { key: 'withText', label: 'With text' },
];

/* ─── 1. Orientation × Content type matrix ───────────────────────────────── */

const orientationCard = matrixCard({
  title: 'Orientation × Content type',
  rowAxisLabel: 'Content',
  intro:
    'Il gruppo fonde i bordi adiacenti dei figli via selettori CSS — nessun markup extra ' +
    'necessario. Ogni voce di <code>items</code> ha un <code>kind</code>: <code>button</code> ' +
    '(default), <code>text</code> (chip readonly) o <code>separator</code>.',
  columns: ORIENTATIONS.map((o) => o.label),
  rows: CONTENT_ROWS,
  center: false,
  renderCell: (col, row) => {
    const orientation = ORIENTATIONS.find((o) => o.label === col)?.key ?? 'horizontal';

    if (row.key === 'withSeparator') {
      return grp({
        orientation,
        items: [
          { label: 'Copia', icon: 'copy' },
          { kind: 'separator' },
          { label: 'Elimina', icon: 'x' },
        ],
      });
    }

    if (row.key === 'withText') {
      return grp({
        orientation,
        items: [
          { kind: 'text', text: 'https://' },
          { label: 'websolute.it' },
        ],
      });
    }

    // buttons
    return grp({
      orientation,
      items: [{ label: 'Giorno' }, { label: 'Settimana', variant: 'default' }, { label: 'Mese' }],
    });
  },
});

/* ─── 2. Mixed variants ─────────────────────────────────────────────────── */

const mixedVariantsCard = demoCard({
  title: 'Mixed variants',
  intro: 'Ogni pulsante del gruppo può avere una propria variante — utile per combinazioni azione primaria + secondaria.',
  content: `
    <div class="flex flex-col gap-4">
      <div class="flex items-center gap-3">
        <span class="text-muted-foreground w-32 shrink-0 text-xs">Primary + outline</span>
        ${grp({
    items: [
      { label: 'Pubblica', variant: 'default' },
      { icon: 'chevron-down', variant: 'default', size: 'icon', ariaLabel: 'Altre opzioni' },
    ],
  })}
      </div>
      <div class="flex items-center gap-3">
        <span class="text-muted-foreground w-32 shrink-0 text-xs">Destructive split</span>
        ${grp({
    items: [
      { label: 'Elimina', variant: 'destructive' },
      { icon: 'chevron-down', variant: 'outline', size: 'icon', ariaLabel: 'Opzioni eliminazione' },
    ],
  })}
      </div>
    </div>
  `,
});

/* ─── 3. With text prefix (URL-copy pattern) ─────────────────────────────── */

const textPrefixCard = demoCard({
  title: 'With text prefix',
  intro: 'La voce di kind <code>text</code> renderizza una chip readonly prima dei pulsanti — utile per pattern copia-URL o etichetta filtro.',
  content: grp({
    items: [
      { kind: 'text', text: 'https://agenzia.example/campagna-primavera' },
      { icon: 'copy', variant: 'outline', size: 'icon', ariaLabel: 'Copia link' },
    ],
  }),
});

export const Catalog = {
  parameters: { layout: 'padded' },
  render: () => storyStack(orientationCard, mixedVariantsCard, textPrefixCard),
};
