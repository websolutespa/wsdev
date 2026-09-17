import { Calendar } from 'vanilla-calendar-pro';

/**
 * Calendar: vanilla-calendar-pro v3 wearing shadcn's class map.
 *
 * The upstream component is react-day-picker configured through a `classNames`
 * hash; the library here takes the same idea through its `styles` option
 * (verified against node_modules/vanilla-calendar-pro/{styles.d.ts,options.d.ts,
 * types.d.ts} and the layout templates in index.mjs, v3.3.2), so the strings
 * below are the upstream ones re-homed onto its element names. Structural CSS
 * comes from the library's own layout.css, pulled into the base layer by
 * calendar.css so every utility here still wins.
 *
 * The library flags day state on the CELL (`data-vc-date-selected="first"…`),
 * upstream on the day BUTTON (`data-range-start`, `data-selected-single`…), so
 * syncDayState() mirrors one onto the other after every render — a
 * MutationObserver, because a click re-runs the modifiers in place without
 * re-creating the cells.
 *
 * Integration API:
 *   in    CustomEvent 'calendar:set' ({ detail: { selected: String[] } })
 *   out   CustomEvent 'calendar:change' ({ detail: { selected } }, bubbles: true)
 *         + a native bubbling 'change' on the hidden input, when `name` is set
 */

/** buttonVariants({ variant: 'ghost' }) — copied verbatim from button.twig. */
const BUTTON_BASE = 'inline-flex shrink-0 items-center justify-center gap-1.5 rounded-4xl text-sm font-medium whitespace-nowrap transition-all outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*=\'size-\'])]:size-4';
const BUTTON_GHOST = 'hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50';

/** Upstream `button_previous` / `button_next`. */
const NAV_BUTTON = `${BUTTON_BASE} ${BUTTON_GHOST} size-(--cell-size) p-0 select-none aria-disabled:opacity-50`;

/** Upstream `caption_label`, in both captionLayout flavours. */
const CAPTION_LABEL = 'pointer-events-auto text-sm font-medium select-none disabled:pointer-events-none disabled:opacity-100';
const CAPTION_DROPDOWN = 'pointer-events-auto flex h-8 items-center gap-1 rounded-md border border-input pr-1 pl-2 text-sm font-medium shadow-xs select-none outline-none hover:bg-accent hover:text-accent-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50';

/**
 * Upstream `day` + the `today` / `range_*` / `disabled` / `outside` entries,
 * folded into one string: the library gives every cell the same class, so what
 * upstream swaps per modifier is expressed here as data-* variants that
 * syncDayState() drives.
 */
const DAY_CELL = 'group/day relative aspect-square h-full w-full p-0 text-center select-none [&:first-child[data-selected=true]_button]:rounded-l-md [&:last-child[data-selected=true]_button]:rounded-r-md data-[today=true]:rounded-md data-[today=true]:bg-accent data-[today=true]:text-accent-foreground data-[today=true]:data-[selected=true]:rounded-none data-[range-start=true]:rounded-l-md data-[range-start=true]:bg-accent data-[range-middle=true]:rounded-none data-[range-end=true]:rounded-r-md data-[range-end=true]:bg-accent data-[outside=true]:text-muted-foreground data-[disabled=true]:text-muted-foreground data-[disabled=true]:opacity-50';

/** Upstream `CalendarDayButton` (its `size-9` from size="icon" is dropped: the string itself sets size-auto w-full). */
const DAY_BUTTON = `${BUTTON_BASE} ${BUTTON_GHOST} flex aspect-square size-auto w-full min-w-(--cell-size) flex-col gap-1 leading-none font-normal group-data-[focused=true]/day:relative group-data-[focused=true]/day:z-10 group-data-[focused=true]/day:border-ring group-data-[focused=true]/day:ring-[3px] group-data-[focused=true]/day:ring-ring/50 data-[range-end=true]:rounded-md data-[range-end=true]:rounded-r-md data-[range-end=true]:bg-primary data-[range-end=true]:text-primary-foreground data-[range-middle=true]:rounded-none data-[range-middle=true]:bg-accent data-[range-middle=true]:text-accent-foreground data-[range-start=true]:rounded-md data-[range-start=true]:rounded-l-md data-[range-start=true]:bg-primary data-[range-start=true]:text-primary-foreground data-[selected-single=true]:bg-primary data-[selected-single=true]:text-primary-foreground dark:hover:text-accent-foreground [&>span]:text-xs [&>span]:opacity-70`;

/** vanilla-calendar-pro `styles` keys → the upstream classNames entry they stand in for. */
function buildStyles(captionLayout) {
  const caption = captionLayout === 'dropdown' ? CAPTION_DROPDOWN : CAPTION_LABEL;
  return {
    // `months`: the single-month root doubles as the months container.
    calendar: 'relative flex w-fit flex-col gap-4',
    // `nav`: only the multi-month layout has this row; it floats over the captions.
    controls: 'absolute inset-x-0 top-0 z-20 flex w-full items-center justify-between gap-1 px-0 py-0',
    grid: 'relative flex w-full flex-col gap-4 md:flex-row',
    column: 'flex w-full flex-col gap-4',
    // `month_caption` + `nav`: the single-month header holds both.
    header: 'relative flex h-(--cell-size) w-full items-center justify-between gap-1',
    // `dropdowns`, centred over the arrows; the buttons take the pointer back.
    headerContent: 'pointer-events-none absolute inset-x-0 flex h-(--cell-size) items-center justify-center gap-1.5 text-sm font-medium',
    month: caption,
    year: caption,
    arrowPrev: NAV_BUTTON,
    arrowNext: NAV_BUTTON,
    wrapper: 'flex w-full',
    content: 'flex w-full flex-col',
    // `weekdays` / `weekday`
    week: 'flex w-full',
    weekDay: 'flex-1 rounded-md text-[0.8rem] font-normal text-muted-foreground select-none',
    weekNumbersTitle: 'w-(--cell-size) select-none',
    weekNumber: 'text-[0.8rem] text-muted-foreground select-none',
    // `month_grid` / `week` / `day`
    dates: 'w-full border-collapse',
    datesRow: 'mt-2 flex w-full',
    date: DAY_CELL,
    dateBtn: DAY_BUTTON,
    // month / year pickers, reached from a dropdown caption
    monthsMonth: `${BUTTON_BASE} ${BUTTON_GHOST} h-8 w-full px-2`,
    yearsYear: `${BUTTON_BASE} ${BUTTON_GHOST} h-8 w-full px-2`,
  };
}

const SELECTION_MODES = { single: 'single', multiple: 'multiple', range: 'multiple-ranged' };

export default function CalendarModule(node) {
  const host = node.querySelector('[data-slot="calendar-host"]');
  if (!host) return () => {};

  let config = {};
  try {
    config = JSON.parse(node.dataset.config || '{}');
  } catch {
    config = {};
  }

  const mode = SELECTION_MODES[config.mode] ? config.mode : 'single';
  const months = Number(config.numberOfMonths) || 1;
  const input = node.querySelector('[data-slot="calendar-input"]');
  // Declared up front: the callbacks below read it, and the library needs them
  // in the options object it is constructed with.
  let calendar = null;
  const cleanups = [];
  const on = (target, type, handler, options) => {
    target.addEventListener(type, handler, options);
    cleanups.push(() => target.removeEventListener(type, handler, options));
  };

  /** Mirrors the library's cell attributes onto the upstream day-button contract. */
  function syncDayState() {
    host.querySelectorAll('[data-vc-date]').forEach((cell) => {
      const selected = cell.getAttribute('data-vc-date-selected');
      const button = cell.querySelector('[data-vc-date-btn]');
      const isRangeStart = selected === 'first' || selected === 'first-and-last';
      const isRangeEnd = selected === 'last' || selected === 'first-and-last';
      const isRangeMiddle = selected === 'middle';
      cell.dataset.selected = selected === null ? 'false' : 'true';
      cell.dataset.today = cell.hasAttribute('data-vc-date-today') ? 'true' : 'false';
      cell.dataset.disabled = cell.hasAttribute('data-vc-date-disabled') ? 'true' : 'false';
      cell.dataset.outside = cell.dataset.vcDateMonth === 'current' ? 'false' : 'true';
      cell.dataset.rangeStart = String(isRangeStart);
      cell.dataset.rangeEnd = String(isRangeEnd);
      cell.dataset.rangeMiddle = String(isRangeMiddle);
      if (!button) return;
      button.dataset.day = cell.dataset.vcDate || '';
      button.dataset.selectedSingle = String(selected === '');
      button.dataset.rangeStart = String(isRangeStart);
      button.dataset.rangeEnd = String(isRangeEnd);
      button.dataset.rangeMiddle = String(isRangeMiddle);
    });
  }

  function currentSelection() {
    return calendar ? Array.from(calendar.context.selectedDates || []) : [];
  }

  function emitChange() {
    const selected = currentSelection();
    if (input) {
      input.value = selected.join(',');
      input.dispatchEvent(new Event('change', { bubbles: true }));
    }
    node.dispatchEvent(new CustomEvent('calendar:change', { bubbles: true, detail: { selected } }));
  }

  const options = {
    locale: config.locale || 'it-IT',
    firstWeekday: Number.isInteger(config.weekStart) ? config.weekStart : 1,
    type: months > 1 ? 'multiple' : 'default',
    displayMonthsCount: months > 1 ? months : undefined,
    monthsToSwitch: 1,
    selectionDatesMode: SELECTION_MODES[mode],
    selectionMonthsMode: config.captionLayout === 'dropdown',
    selectionYearsMode: config.captionLayout === 'dropdown',
    styles: buildStyles(config.captionLayout),
    onClickDate: () => {
      syncDayState();
      emitChange();
    },
    onUpdate: syncDayState,
    onInit: syncDayState,
  };
  if (Array.isArray(config.selected) && config.selected.length) options.selectedDates = config.selected;
  if (config.min) options.dateMin = config.min;
  if (config.max) options.dateMax = config.max;
  if (Array.isArray(config.disabled) && config.disabled.length) options.disableDates = config.disabled;
  if (options.displayMonthsCount === undefined) delete options.displayMonthsCount;

  calendar = new Calendar(host, options);
  calendar.init();
  syncDayState();

  // Cells keep their identity across selections, so the modifiers land as plain
  // attribute writes: watch those instead of re-reading on a timer.
  const observer = new MutationObserver(syncDayState);
  observer.observe(host, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ['data-vc-date-selected', 'data-vc-date-today', 'data-vc-date-disabled', 'data-vc-date-month'],
  });

  // `group-data-[focused=true]/day` is upstream's focus ring; react-day-picker
  // owns a focused day, here the browser does.
  on(host, 'focusin', (event) => {
    const cell = event.target.closest && event.target.closest('[data-vc-date]');
    host.querySelectorAll('[data-vc-date][data-focused="true"]').forEach((el) => {
      el.dataset.focused = 'false';
    });
    if (cell) cell.dataset.focused = 'true';
  });
  on(host, 'focusout', (event) => {
    const cell = event.target.closest && event.target.closest('[data-vc-date]');
    if (cell) cell.dataset.focused = 'false';
  });

  on(node, 'calendar:set', (event) => {
    const selected = event.detail && event.detail.selected;
    if (!Array.isArray(selected)) return;
    calendar.set({ selectedDates: selected });
    syncDayState();
    emitChange();
  });

  return () => {
    observer.disconnect();
    cleanups.forEach((fn) => fn());
    calendar.destroy();
  };
}
