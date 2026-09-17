import { createRovingNav } from '../../../../js/common/keynav';
import { uid } from '../../../../js/common/uid';

/**
 * Command palette (cmdk without cmdk), on the APG combobox-with-listbox pattern:
 * focus stays in the input and aria-activedescendant tracks the active item.
 *
 * Filter: case-insensitive substring on data-value, ranked 3/2/1 for an exact,
 * prefix or word-start match and 0 when it only matches mid-word; non-matching
 * items are hidden and each group re-orders its survivors by score (cmdk sorts
 * too). Empty groups and every separator hide while a query is active.
 *
 * ADAPT: keynav's activedescendant mode marks the active item with
 * data-highlighted; upstream styles it with data-[selected=true]:*, so
 * onFocusChange mirrors the highlight onto data-selected + aria-selected.
 *
 * Integration API:
 *   out   CustomEvent 'command:select' { value, label } (bubbles) — an item with
 *         data-url navigates instead; inside a dialog both also close it
 *   hooks data-shortcut="<key>" on the root binds Ctrl/Cmd+<key> to 'dialog:open'
 *         on the surrounding [data-slot="dialog"]
 */
export default function CommandModule(node) {
  const input = node.querySelector('[data-slot="command-input"]');
  const list = node.querySelector('[data-slot="command-list"]');
  const empty = node.querySelector('[data-slot="command-empty"]');
  if (!input || !list) return () => {};

  const items = Array.from(list.querySelectorAll('[data-slot="command-item"]'));
  const groups = Array.from(list.querySelectorAll('[data-slot="command-group"]'));
  const separators = Array.from(list.querySelectorAll('[data-slot="command-separator"]'));
  const dialog = node.closest('[data-slot="dialog"]');
  const cleanups = [];

  const on = (target, type, handler, options) => {
    target.addEventListener(type, handler, options);
    cleanups.push(() => target.removeEventListener(type, handler, options));
  };

  // Runtime ARIA wiring (ids generated only when Twig didn't receive them).
  list.id = list.id || uid('command-list');
  input.setAttribute('aria-controls', list.id);
  items.forEach((item) => {
    item.id = item.id || uid('command-item');
  });
  groups.forEach((group) => {
    const heading = group.querySelector('[data-slot="command-group-heading"]');
    if (!heading) return;
    heading.id = heading.id || uid('command-group-heading');
    group.setAttribute('aria-labelledby', heading.id);
  });
  // The original order, so clearing the query restores it.
  const order = new Map(items.map((item, index) => [item, index]));

  /** 3 = exact, 2 = prefix, 1 = word start, 0 = no match worth showing. */
  function score(text, query) {
    const value = text.toLowerCase();
    if (value === query) return 3;
    if (value.startsWith(query)) return 2;
    const index = value.indexOf(query);
    if (index === -1) return 0;
    return /[\s\-_/.]/.test(value[index - 1]) ? 1 : 0.5;
  }

  const nav = createRovingNav(list, {
    itemSelector: '[data-slot="command-item"]:not([hidden])',
    mode: 'activedescendant',
    typeahead: false,
    bindKeys: false,
    onActivate: (item) => activate(item),
    onFocusChange: (item) => {
      // keynav put aria-activedescendant on the listbox; the combobox input is
      // the focused element, so it owns the attribute.
      list.removeAttribute('aria-activedescendant');
      input.setAttribute('aria-activedescendant', item ? item.id : '');
      items.forEach((other) => {
        const active = other === item;
        other.setAttribute('data-selected', active ? 'true' : 'false');
        other.setAttribute('aria-selected', active ? 'true' : 'false');
      });
    },
  });

  function activate(item) {
    if (!item || item.hidden || item.getAttribute('data-disabled') === 'true') return;
    const label = (item.querySelector(':scope > span:not([data-slot])') || item).textContent.trim();
    if (item.dataset.url) {
      window.location.assign(item.dataset.url);
    } else {
      node.dispatchEvent(
        new CustomEvent('command:select', {
          bubbles: true,
          detail: { value: item.dataset.value || label, label },
        })
      );
    }
    if (dialog) dialog.dispatchEvent(new CustomEvent('dialog:close'));
  }

  function applyFilter() {
    const query = input.value.trim().toLowerCase();
    const scores = new Map();
    let visible = 0;
    items.forEach((item) => {
      const value = score(item.dataset.value || item.textContent.trim(), query);
      const match = query === '' || value > 0;
      item.hidden = !match;
      scores.set(item, match ? value : 0);
      if (match) visible += 1;
    });
    groups.forEach((group) => {
      const own = Array.from(group.querySelectorAll('[data-slot="command-item"]'));
      group.hidden = !own.some((item) => !item.hidden);
      if (!query) {
        own
          .slice()
          .sort((a, b) => order.get(a) - order.get(b))
          .forEach((item) => group.appendChild(item));
        return;
      }
      own
        .slice()
        .sort((a, b) => scores.get(b) - scores.get(a) || order.get(a) - order.get(b))
        .forEach((item) => group.appendChild(item));
    });
    separators.forEach((separator) => {
      separator.hidden = Boolean(query);
    });
    if (empty) empty.hidden = visible > 0;
    nav.clearActive();
    const first = nav.getItems()[0];
    if (first) {
      nav.setActive(first);
      return;
    }
    input.removeAttribute('aria-activedescendant');
    items.forEach((item) => {
      item.setAttribute('data-selected', 'false');
      item.setAttribute('aria-selected', 'false');
    });
  }

  on(input, 'input', applyFilter);
  on(input, 'keydown', (event) => {
    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowUp':
      case 'Home':
      case 'End':
        nav.handleKey(event);
        break;
      case 'Enter': {
        const active = nav.getActive();
        if (active && !active.hidden) {
          event.preventDefault();
          activate(active);
        }
        break;
      }
      default:
    }
  });

  // Pointer parity with cmdk: hover highlights, click runs.
  on(list, 'pointermove', (event) => {
    const item = event.target.closest('[data-slot="command-item"]');
    if (item && items.includes(item) && item !== nav.getActive() && item.getAttribute('data-disabled') !== 'true') {
      nav.setActive(item);
    }
  });
  on(list, 'click', (event) => {
    const item = event.target.closest('[data-slot="command-item"]');
    if (item && items.includes(item)) activate(item);
  });

  const shortcut = (node.dataset.shortcut || '').toLowerCase();
  if (shortcut && dialog) {
    on(document, 'keydown', (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === shortcut) {
        event.preventDefault();
        dialog.dispatchEvent(new CustomEvent('dialog:open'));
      }
    });
    // A fresh palette every time it opens.
    on(dialog, 'dialog:opened', () => {
      input.value = '';
      applyFilter();
      input.focus();
    });
  }

  applyFilter();

  return () => {
    nav.destroy();
    cleanups.forEach((fn) => fn());
  };
}
