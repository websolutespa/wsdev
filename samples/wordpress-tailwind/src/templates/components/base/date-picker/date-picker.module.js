/**
 * Date picker: the composition's own wiring only — the popover opens and closes
 * itself (popover.module.js) and the calendar owns the grid (calendar.module.js).
 * This module listens to the calendar's bubbling `calendar:change`, formats the
 * selection for the trigger, mirrors it into the hidden input and decides when
 * the panel has served its purpose: a single date closes it, a range waits for
 * both ends.
 *
 * Integration API:
 *   out   CustomEvent 'date-picker:change' ({ detail: { value: String[] } },
 *         bubbles: true) on the root, plus a native bubbling 'change' on the
 *         hidden input
 *   in    the nested calendar accepts 'calendar:set'; the nested popover
 *         accepts 'popover:open' / 'popover:close'
 */
export default function DatePickerModule(node) {
  const trigger = node.querySelector('[data-date-picker-trigger]');
  const popover = node.querySelector('[data-slot="popover"]');
  const input = node.querySelector('[data-slot="date-picker-input"]');
  if (!trigger || !popover) return () => {};

  let config = {};
  try {
    config = JSON.parse(node.dataset.config || '{}');
  } catch {
    config = {};
  }
  const mode = config.mode || 'single';
  const placeholder = config.placeholder || 'Seleziona una data';
  const formatter = new Intl.DateTimeFormat(config.locale || 'it-IT', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });
  // The trigger label is button.twig's own <span>; the icon is a sibling <svg>.
  const label = trigger.querySelector('span');

  const cleanups = [];
  const on = (target, type, handler, options) => {
    target.addEventListener(type, handler, options);
    cleanups.push(() => target.removeEventListener(type, handler, options));
  };

  /** Formats an ISO day without letting the parser drift by a timezone. */
  function formatDate(iso) {
    const [year, month, day] = String(iso).split('-').map(Number);
    if (!year || !month || !day) return String(iso);
    return formatter.format(new Date(year, month - 1, day));
  }

  function describe(selected) {
    if (!selected.length) return placeholder;
    if (mode === 'range') {
      return selected.length > 1
        ? `${formatDate(selected[0])} – ${formatDate(selected[selected.length - 1])}`
        : formatDate(selected[0]);
    }
    return selected.map(formatDate).join(', ');
  }

  on(node, 'calendar:change', (event) => {
    const selected = (event.detail && event.detail.selected) || [];
    if (label) label.textContent = describe(selected);
    trigger.dataset.empty = selected.length ? 'false' : 'true';
    if (input) {
      input.value = selected.join(',');
      input.dispatchEvent(new Event('change', { bubbles: true }));
    }
    node.dispatchEvent(new CustomEvent('date-picker:change', {
      bubbles: true,
      detail: { value: selected },
    }));
    // A range stays open until both ends exist; everything else is done on pick.
    const complete = mode === 'range' ? selected.length > 1 : selected.length > 0;
    if (complete) popover.dispatchEvent(new CustomEvent('popover:close'));
  });

  return () => {
    cleanups.forEach((fn) => fn());
  };
}
