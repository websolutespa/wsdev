/**
 * story-helpers.ts — Shared HTML-string helpers for Storybook stories.
 * Storybook-only: NOT shipped in the WordPress production build.
 * Keep Tailwind classes used here in sync with the @source directive in
 * story-utilities.css so Tailwind v4 emits utilities for this dot-directory file.
 */

/* ───────────────────────────────────────────────────────────────────────────
   Internal: shared card shell (border + card bg + header bar + optional intro)
   ─────────────────────────────────────────────────────────────────────────── */

function cardShell(title: string, intro: string | undefined, body: string): string {
  const introRow = intro
    ? `<div class="text-muted-foreground border-border border-b px-4 py-3 text-xs">${intro}</div>`
    : '';
  return `
<div class="border-border bg-card overflow-hidden rounded-lg border">
  <div class="bg-muted/40 border-border border-b px-4 py-3 text-sm font-semibold">${title}</div>
  ${introRow}
  ${body}
</div>`.trim();
}

/* ───────────────────────────────────────────────────────────────────────────
   demoCard — generic demo wrapper with a p-6 body.
   ─────────────────────────────────────────────────────────────────────────── */

/**
 * Renders a card with a labelled header, an optional intro row, and a padded
 * body wrapping arbitrary HTML content.
 *
 * @param title   - Header text (trusted HTML).
 * @param intro   - Optional subtitle / description row (trusted HTML).
 * @param content - Body HTML (trusted HTML).
 */
export function demoCard({
  title,
  intro,
  content,
}: {
  title: string;
  intro?: string;
  content: string;
}): string {
  return cardShell(title, intro, `<div class="p-6">${content}</div>`);
}

/* ───────────────────────────────────────────────────────────────────────────
   matrixCard — columns × rows matrix card for component variant catalogs.
   ─────────────────────────────────────────────────────────────────────────── */

/**
 * Renders a card containing a matrix table: column headers (variant names)
 * across the top, row labels (sizes / states / etc.) on the left.
 *
 * @param title        - Header text (trusted HTML).
 * @param intro        - Optional intro row (trusted HTML).
 * @param rowAxisLabel - Label for the top-left corner cell (e.g. "Variant").
 * @param columns      - Column header strings (rendered uppercase via CSS).
 * @param rows         - Row descriptors: `key` (unique), `label` (row header),
 *                       plus any extra fields that `renderCell` may read.
 * @param renderCell   - `(column, row) => string` — returns the TD inner HTML.
 * @param center       - When true (default) wraps each cell in a flex-center
 *                       div.
 */
export function matrixCard<R extends { key: string; label: string } & Record<string, unknown>>({
  title,
  intro,
  rowAxisLabel = '',
  columns,
  rows,
  renderCell,
  center = true,
}: {
  title: string;
  intro?: string;
  rowAxisLabel?: string;
  columns: string[];
  rows: R[];
  renderCell: (column: string, row: R) => string;
  center?: boolean;
}): string {
  const thead = `
  <thead>
    <tr class="text-muted-foreground border-border border-b text-left">
      <th class="p-3 text-xs font-medium uppercase">${rowAxisLabel}</th>
      ${columns.map((c) => `<th class="p-3 text-center text-xs font-medium uppercase">${c}</th>`).join('\n      ')}
    </tr>
  </thead>`;

  const tbody = `
  <tbody>
    ${rows
    .map(
      (r) => `
    <tr class="border-border border-b align-middle last:border-0">
      <td class="text-foreground p-3 text-xs font-semibold whitespace-nowrap uppercase">${r.label}</td>
      ${columns
    .map((c) => {
      const cell = renderCell(c, r);
      const inner = center ? `<div class="flex justify-center">${cell}</div>` : cell;
      return `<td class="p-3 text-center">${inner}</td>`;
    })
    .join('\n      ')}
    </tr>`
    )
    .join('')}
  </tbody>`;

  const table = `
<div class="overflow-x-auto">
  <table class="w-full border-collapse text-sm">
    ${thead}
    ${tbody}
  </table>
</div>`;

  return cardShell(title, intro, table);
}

/* ───────────────────────────────────────────────────────────────────────────
   storyStack — vertical stack of cards with consistent gap.
   ─────────────────────────────────────────────────────────────────────────── */

/**
 * Wraps multiple card HTML strings in a vertically-stacked flex column with
 * gap-6 spacing.
 *
 * @param sections - One or more HTML strings (cards) to stack vertically.
 */
export function storyStack(...sections: string[]): string {
  return `<div class="flex flex-col gap-6">${sections.join('\n')}</div>`;
}

/* ───────────────────────────────────────────────────────────────────────────
   Interactive-state helpers — shared across all catalog stories.
   ─────────────────────────────────────────────────────────────────────────── */

/**
 * Column labels for the interactive-state axis used in States Grid and
 * Square Button States Grid cards.
 */
export const STATE_COLUMNS = ['Default', 'Hover', 'Focus', 'Active', 'Disabled'] as const;

export type StateColumn = (typeof STATE_COLUMNS)[number];

/**
 * Maps a STATE_COLUMNS label to the Twig button props that simulate that state.
 *
 * - Hover   → adds `is-hover` class (triggers `hover:` via @custom-variant)
 * - Focus   → adds `is-focus-visible` class (triggers `focus-visible:` variant)
 * - Active  → adds `is-active` class (triggers `active:` variant)
 * - Disabled→ sets `disabled: true` (no extra class)
 * - Default → no overrides
 *
 * Returned object is spread into the twig context, e.g.:
 *   renderTwig('@components/base/button/button.twig', { ...stateProps(col), variant, label })
 */
export function stateProps(state: StateColumn): { class?: string; disabled?: boolean } {
  switch (state) {
    case 'Hover':
      return { class: 'is-hover' };
    case 'Focus':
      return { class: 'is-focus-visible' };
    case 'Active':
      return { class: 'is-active' };
    case 'Disabled':
      return { disabled: true };
    default:
      return {};
  }
}
