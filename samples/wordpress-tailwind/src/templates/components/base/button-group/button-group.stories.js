import { renderTwig, renderTwigSource } from '~sb/twig';
import { demoCard, matrixCard, storyStack } from '~sb/story-helpers';
import data from './button-group.twig.json';

const mocks = data.mocks['button-group'];
const TWIG_ID = '@components/base/button-group/button-group.twig';
const BUTTON_ID = '@components/base/button/button.twig';
const INPUT_ID = '@components/base/input/input.twig';
const INPUT_GROUP_ID = '@components/base/input-group/input-group.twig';
const SELECT_ID = '@components/base/select/select.twig';
const DROPDOWN_MENU_ID = '@components/base/dropdown-menu/dropdown-menu.twig';
const FIELD_ID = '@components/base/field/field.twig';

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

/**
 * Builds a Twig `{% include %}` tag for a component, JSON-serializing `props`
 * as the hash literal (twig.js accepts JSON-shaped hash/array literals).
 * `only` isolates scope — the included leaf templates never need the parent's
 * globals (main/labels/mocks).
 */
function include(id, props = {}) {
  return `{% include '${id}' with ${JSON.stringify(props)} only %}`;
}

/**
 * Builds a Twig `{% embed %}` tag with one or more block overrides, each
 * block body itself built from `include`/`embed` snippets — used whenever a
 * pattern needs custom composition beyond button-group's `items` schema
 * (nested groups, inputs, selects, dropdown-menu triggers).
 */
function embed(id, props, blocks) {
  const blockStrs = Object.entries(blocks)
    .map(([name, body]) => `{% block ${name} %}\n${body}\n{% endblock %}`)
    .join('\n');
  return `{% embed '${id}' with ${JSON.stringify(props)} only %}\n${blockStrs}\n{% endembed %}`;
}

/** A button-group whose content is custom-composed (real components, not `items`). */
function customGroup(groupProps, parts) {
  return renderTwigSource(embed(TWIG_ID, groupProps, { content: parts.join('\n') }));
}

/** A labelled demo row: fixed-width caption + rendered markup, reused across every card below. */
function row(label, html) {
  return `
    <div class="flex items-center gap-3">
      <span class="text-muted-foreground w-32 shrink-0 text-xs">${label}</span>
      ${html}
    </div>`;
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
    '(default), <code>text</code> (chip readonly, ora pill-ended) o <code>separator</code>.',
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
      if (orientation === 'vertical') {
        return '<span class="text-muted-foreground text-xs">—</span>';
      }
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

/* ─── 2. Sizes — matching text/icon size across the whole group ─────────── */
/* Figma 18686:4075 (sm), 18686:4109 (default), 18686:4626 (lg): outline text
   buttons ending with a same-size icon button. `items` defaults every entry
   to size 'sm', so default/lg groups must set `size` on every entry — the
   button-group rule (sm↔icon-sm, default↔icon, lg↔icon-lg) is not enforced
   by the twig, only by matching what every entry declares. */

const SIZE_COLUMNS = [
  { size: 'sm', icon: 'icon-sm', label: 'Small' },
  { size: 'default', icon: 'icon', label: 'Default' },
  { size: 'lg', icon: 'icon-lg', label: 'Large' },
];

const sizesCard = matrixCard({
  title: 'Sizes',
  rowAxisLabel: 'Group',
  intro:
    'Ogni pulsante del gruppo condivide la stessa taglia, incluso quello finale a sola icona: ' +
    '<code>sm</code> con <code>icon-sm</code>, <code>default</code> con <code>icon</code>, ' +
    '<code>lg</code> con <code>icon-lg</code>.',
  columns: SIZE_COLUMNS.map((s) => s.label),
  rows: [{ key: 'group', label: 'Outline + icona' }],
  renderCell: (col) => {
    const { size, icon } = SIZE_COLUMNS.find((s) => s.label === col);
    return grp({
      items: [
        { label: 'Modifica', size },
        { label: 'Duplica', size },
        { icon: 'ellipsis', ariaLabel: 'Altre opzioni', size: icon },
      ],
    });
  },
});

/* ─── 3. Variants — primary/secondary pairs, separators, split actions ───── */
/* Folds in the former "Mixed variants" card content (rows 6–7): every icon-only
   segment stays icon-sm paired with sm text buttons. */

const variantsCard = demoCard({
  title: 'Variants',
  intro:
    'Ogni pulsante del gruppo può avere una propria variante — utile per combinazioni ' +
    'primaria + secondaria, coppie di azioni o split action con indicatore a icona.',
  content: `
    <div class="flex flex-col gap-4">
      ${row(
    'Outline',
    grp({ items: [{ label: 'Attivi' }, { label: 'In pausa' }, { label: 'Completati' }] })
  )}
      ${row(
    'Primary pair',
    grp({
      items: [
        { label: 'Pulsante', variant: 'default' },
        { label: 'Inizia', variant: 'default', iconAfter: 'arrow-right' },
      ],
    })
  )}
      ${row(
    'Secondary pair',
    grp({ items: [{ label: 'Modifica', variant: 'secondary' }, { label: 'Duplica', variant: 'secondary' }] })
  )}
      ${row(
    'Secondary + separatore',
    grp({
      items: [
        { label: 'Copia', icon: 'copy', variant: 'secondary' },
        { kind: 'separator' },
        // Figma "Paste" has no clipboard/paste icon in the sprite: file-text is the
        // closest existing icon (a document/content glyph).
        { label: 'Incolla', icon: 'file-text', variant: 'secondary' },
      ],
    })
  )}
      ${row(
    'Secondary + icona finale',
    grp({
      items: [
        { label: 'Aggiungi', variant: 'secondary' },
        { icon: 'plus', variant: 'secondary', size: 'icon-sm', ariaLabel: 'Aggiungi elemento' },
      ],
    })
  )}
      ${row(
    'Primary + azioni',
    grp({
      items: [
        { label: 'Pubblica', variant: 'default' },
        { icon: 'chevron-down', variant: 'default', size: 'icon-sm', ariaLabel: 'Altre opzioni' },
      ],
    })
  )}
      ${row(
    'Destructive split',
    grp({
      items: [
        { label: 'Elimina', variant: 'destructive' },
        { icon: 'chevron-down', variant: 'outline', size: 'icon-sm', ariaLabel: 'Opzioni eliminazione' },
      ],
    })
  )}
    </div>
  `,
});

/* ─── 4. Nested groups & pagination ───────────────────────────────────────── */
/* button-group's own base string adds gap-2 whenever a direct child is itself
   a [data-slot=button-group] (has-[>[data-slot=button-group]]:gap-2) — nested
   groups below are plain nested `{% include %}`s, no extra gap classes needed. */

const nestedGroupsCard = demoCard({
  title: 'Nested groups & pagination',
  intro:
    'Un <code>button-group</code> può contenere altri <code>button-group</code> come figli ' +
    'diretti (gap automatico) — utile per toolbar composte e paginazioni.',
  content: `
    <div class="flex flex-col gap-4">
      ${row(
    'Toolbar',
    customGroup({}, [
      include(BUTTON_ID, { icon: 'arrow-left', ariaLabel: 'Indietro', variant: 'outline', size: 'icon-sm' }),
      // Figma "Archive" / "Report" / "Snooze" have no matching icons in the sprite:
      // inbox (archive tray), triangle-alert (flagging/reporting) and bell (reused,
      // still a notification glyph) are the closest existing stand-ins.
      include(TWIG_ID, {
        items: [
          { icon: 'inbox', ariaLabel: 'Archivia', size: 'icon-sm' },
          { icon: 'triangle-alert', ariaLabel: 'Segnala', size: 'icon-sm' },
        ],
      }),
      include(TWIG_ID, {
        items: [
          { icon: 'bell', ariaLabel: 'Posticipa', size: 'icon-sm' },
          { icon: 'ellipsis', ariaLabel: 'Altre opzioni', size: 'icon-sm' },
        ],
      }),
    ])
  )}
      ${row(
    'Numeri + frecce',
    customGroup({}, [
      include(TWIG_ID, {
        items: [{ label: '1' }, { label: '2', variant: 'default' }, { label: '3' }],
      }),
      include(TWIG_ID, {
        items: [
          { icon: 'arrow-left', ariaLabel: 'Precedente', size: 'icon-sm' },
          { icon: 'arrow-right', ariaLabel: 'Successivo', size: 'icon-sm' },
        ],
      }),
    ])
  )}
      ${row(
    'Previous 1 2 3 4 Next',
    grp({
      items: [
        { label: 'Precedente', icon: 'arrow-left' },
        { label: '1' },
        { label: '2', variant: 'default' },
        { label: '3' },
        { label: '4' },
        { label: 'Successivo', iconAfter: 'arrow-right' },
      ],
    })
  )}
    </div>
  `,
});

/* ─── 5. With inputs ───────────────────────────────────────────────────────── */
/* input/input-group both render a single flat element as the button-group's
   direct child, so the join/rounding selectors reach them like any button. */

const withInputsCard = demoCard({
  title: 'With inputs',
  intro:
    'Input e input-group come figli diretti del gruppo: stessa altezza dei pulsanti adiacenti ' +
    '(<code>size: default</code> ⇄ input a 36px) perché base/input non ha una propria scala di taglie.',
  content: `
    <div class="flex flex-col gap-4">
      ${row(
    'Input + button',
    customGroup({}, [
      include(INPUT_ID, { type: 'search', name: 'bg-search-a', placeholder: 'Cerca prodotti…' }),
      include(BUTTON_ID, { label: 'Cerca', icon: 'search', variant: 'outline', size: 'default' }),
    ])
  )}
      ${row(
    'Button + input',
    customGroup({}, [
      include(BUTTON_ID, { label: 'https://', variant: 'secondary', size: 'default' }),
      include(INPUT_ID, { type: 'text', name: 'bg-url-b', placeholder: 'tuosito.it' }),
    ])
  )}
      ${row(
    'Prefix + input + button',
    customGroup({}, [
      include(BUTTON_ID, { label: 'https://', variant: 'secondary', size: 'default' }),
      include(INPUT_ID, { type: 'text', name: 'bg-url-c', placeholder: 'esempio.com' }),
      include(BUTTON_ID, { icon: 'arrow-right', ariaLabel: 'Vai', variant: 'outline', size: 'icon' }),
    ])
  )}
      ${row(
    'Secondary icon prefix + input',
    customGroup({}, [
      // "GPU Size" has no dedicated hardware icon in the sprite: settings (generic
      // config/gear glyph) is the closest existing stand-in.
      include(BUTTON_ID, { label: 'GPU Size', icon: 'settings', variant: 'secondary', size: 'default' }),
      include(INPUT_ID, { type: 'text', name: 'bg-gpu-d', placeholder: '16 GB' }),
    ])
  )}
      ${row(
    'Icon buttons + input (% addon)',
    customGroup({}, [
      include(BUTTON_ID, { icon: 'minus', ariaLabel: 'Diminuisci', variant: 'outline', size: 'icon' }),
      include(INPUT_GROUP_ID, {
        input: { name: 'bg-percent-e', value: '10', ariaLabel: 'Percentuale' },
        addonEnd: { text: '%' },
      }),
      include(BUTTON_ID, { icon: 'plus', ariaLabel: 'Aumenta', variant: 'outline', size: 'icon' }),
    ])
  )}
      ${row(
    'Text chip prefix',
    grp({
      items: [
        { kind: 'text', text: 'https://agenzia.example/campagna-primavera' },
        { icon: 'copy', variant: 'outline', size: 'icon-sm', ariaLabel: 'Copia link' },
      ],
    })
  )}
    </div>
  `,
});

/* ─── 6. With select / dropdown-menu ───────────────────────────────────────── */
/* select and dropdown-menu wrap their trigger in the module root; button-group joins it
   through its [data-module] > [data-slot$=-trigger] rules. Menus stay closed here. */

const withSelectCard = demoCard({
  title: 'With select / dropdown-menu',
  intro:
    'Trigger di select riutilizzati com\'è il componente; split action il cui chevron è un ' +
    'trigger di <code>dropdown-menu</code> (menu chiuso, overlay non aperto in questa pagina).',
  content: `
    <div class="flex flex-col gap-4">
      ${row(
    'Select + input',
    customGroup({}, [
      include(SELECT_ID, {
        id: 'bg-select-hours',
        name: 'bg-select-hours-value',
        options: [
          { label: 'Ore', value: 'hours' },
          { label: 'Giorni', value: 'days' },
          { label: 'Settimane', value: 'weeks' },
        ],
        value: 'hours',
      }),
      include(INPUT_ID, { type: 'text', name: 'bg-hours-note', placeholder: 'Nota (opzionale)' }),
    ])
  )}
      ${row(
    'Select + input + button',
    customGroup({}, [
      include(SELECT_ID, {
        id: 'bg-select-currency',
        name: 'bg-select-currency-value',
        options: [
          { label: '$', value: 'usd' },
          { label: '€', value: 'eur' },
          { label: '£', value: 'gbp' },
        ],
        value: 'usd',
      }),
      include(INPUT_ID, { type: 'text', name: 'bg-amount', value: '10.00' }),
      include(BUTTON_ID, { icon: 'arrow-right', ariaLabel: 'Conferma', variant: 'outline', size: 'icon' }),
    ])
  )}
      ${row(
    'Follow ▾',
    customGroup({}, [
      include(BUTTON_ID, { label: 'Segui', variant: 'default', size: 'sm' }),
      embed(
        DROPDOWN_MENU_ID,
        {
          id: 'bg-dd-follow',
          items: [
            { label: 'Notifiche attive' },
            { label: 'Silenzia autore' },
            { kind: 'separator' },
            { label: 'Smetti di seguire' },
          ],
        },
        {
          trigger: include(BUTTON_ID, {
            ariaLabel: 'Altre opzioni su Segui',
            icon: 'chevron-down',
            variant: 'default',
            size: 'icon-sm',
            slot: 'dropdown-menu-trigger',
            attrs: 'data-menu-trigger aria-haspopup="menu" aria-expanded="false" data-state="closed"',
          }),
        }
      ),
    ])
  )}
      ${row(
    'Update ▾ (destructive item)',
    customGroup({}, [
      include(BUTTON_ID, { label: 'Aggiorna', variant: 'default', size: 'sm' }),
      embed(
        DROPDOWN_MENU_ID,
        {
          id: 'bg-dd-update',
          items: [
            { label: 'Salva modifiche' },
            { label: 'Duplica' },
            { kind: 'separator' },
            { label: 'Elimina', variant: 'destructive', icon: 'x' },
          ],
        },
        {
          trigger: include(BUTTON_ID, {
            ariaLabel: 'Altre opzioni su Aggiorna',
            icon: 'chevron-down',
            variant: 'default',
            size: 'icon-sm',
            slot: 'dropdown-menu-trigger',
            attrs: 'data-menu-trigger aria-haspopup="menu" aria-expanded="false" data-state="closed"',
          }),
        }
      ),
    ])
  )}
      ${row(
    'Actions ▾ (secondary)',
    customGroup({}, [
      include(BUTTON_ID, { label: 'Azioni', variant: 'secondary', size: 'sm' }),
      embed(
        DROPDOWN_MENU_ID,
        {
          id: 'bg-dd-actions',
          items: [
            { label: 'Esporta', icon: 'external-link' },
            { label: 'Rinomina' },
            { label: 'Archivia', icon: 'inbox' },
          ],
        },
        {
          trigger: include(BUTTON_ID, {
            ariaLabel: 'Altre opzioni',
            icon: 'chevron-down',
            variant: 'secondary',
            size: 'icon-sm',
            slot: 'dropdown-menu-trigger',
            attrs: 'data-menu-trigger aria-haspopup="menu" aria-expanded="false" data-state="closed"',
          }),
        }
      ),
    ])
  )}
    </div>
  `,
});

/* ─── 7. Toggle-like / counter & Field composition ────────────────────────── */

const toggleAndFieldCard = demoCard({
  title: 'Toggle-like / counter & Field',
  intro:
    'Un pulsante affiancato a una chip di testo readonly può fungere da contatore; ' +
    '<code>field.twig</code> può incapsulare un intero button-group come proprio controllo.',
  content: `
    <div class="flex flex-col gap-4">
      ${row(
    'Like counter',
    grp({ items: [{ label: 'Mi piace' }, { kind: 'text', text: '1.2K' }] })
  )}
      <div>
        ${renderTwigSource(
    embed(FIELD_ID, { label: 'Allineamento testo', for: 'bg-align' }, {
      control: embed(TWIG_ID, { id: 'bg-align' }, {
        content: [
          // Figma has no dedicated align-left/center/right/justify icons: arrow-left,
          // circle (centered dot), arrow-right and menu (stacked full-width lines,
          // closest to a "justified" glyph) are the closest existing stand-ins.
          include(BUTTON_ID, { icon: 'arrow-left', ariaLabel: 'Allinea a sinistra', variant: 'outline', size: 'icon-sm' }),
          include(BUTTON_ID, { icon: 'circle', ariaLabel: 'Allinea al centro', variant: 'outline', size: 'icon-sm' }),
          include(BUTTON_ID, { icon: 'arrow-right', ariaLabel: 'Allinea a destra', variant: 'outline', size: 'icon-sm' }),
          include(BUTTON_ID, { icon: 'menu', ariaLabel: 'Giustifica', variant: 'outline', size: 'icon-sm' }),
        ].join('\n'),
      }),
    })
  )}
      </div>
    </div>
  `,
});

/* ─── 8. Vertical patterns ─────────────────────────────────────────────────── */

const VERTICAL_STACK_VARIANTS = [
  { key: 'outline', label: 'Outline' },
  { key: 'secondary', label: 'Secondary' },
];

const verticalCard = demoCard({
  title: 'Vertical',
  intro:
    'Il gruppo verticale fonde gli stessi bordi/angoli del gruppo orizzontale, ruotati di 90°: ' +
    'estremi con il raggio pill, giunzioni interne squadrate.',
  content: `
    <div class="flex flex-col gap-4">
      ${VERTICAL_STACK_VARIANTS.map((v) =>
    row(
      `Text sm — ${v.label}`,
      grp({
        orientation: 'vertical',
        items: [
          { label: 'Aumenta', icon: 'plus', variant: v.key },
          { label: 'Diminuisci', icon: 'minus', variant: v.key },
        ],
      })
    )
  ).join('')}
      ${row(
    'Icon',
    grp({
      orientation: 'vertical',
      items: [
        { icon: 'plus', ariaLabel: 'Aumenta', size: 'icon' },
        { icon: 'minus', ariaLabel: 'Diminuisci', size: 'icon' },
      ],
    })
  )}
      ${row(
    'Toolbar icon-lg',
    `<div class="flex flex-col gap-2">
    ${grp({
    orientation: 'vertical',
    items: [
      { icon: 'search', ariaLabel: 'Cerca', size: 'icon-lg' },
      { icon: 'copy', ariaLabel: 'Copia', size: 'icon-lg' },
      { icon: 'share', ariaLabel: 'Condividi', size: 'icon-lg' },
    ],
  })}
    ${grp({
    orientation: 'vertical',
    items: [
      { icon: 'flip-horizontal', ariaLabel: 'Rifletti in orizzontale', size: 'icon-lg' },
      { icon: 'flip-vertical', ariaLabel: 'Rifletti in verticale', size: 'icon-lg' },
      { icon: 'rotate-cw', ariaLabel: 'Ruota', size: 'icon-lg' },
    ],
  })}
    ${renderTwig(BUTTON_ID, { icon: 'trash', ariaLabel: 'Elimina', variant: 'outline', size: 'icon-lg' })}
    </div>`
  )}
    </div>
  `,
});

export const Catalog = {
  parameters: { layout: 'padded' },
  render: () =>
    storyStack(
      orientationCard,
      sizesCard,
      variantsCard,
      nestedGroupsCard,
      withInputsCard,
      withSelectCard,
      toggleAndFieldCard,
      verticalCard
    ),
};
