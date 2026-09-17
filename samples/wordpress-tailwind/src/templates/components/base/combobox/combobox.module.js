import { closeWithAnimation, setState } from '../../../../js/common/dataState';
import { pushDismissLayer } from '../../../../js/common/dismiss';
import { createFloating } from '../../../../js/common/floating';
import { createRovingNav } from '../../../../js/common/keynav';
import { uid } from '../../../../js/common/uid';

/**
 * WAI-ARIA APG "Editable Combobox With List Autocomplete", in two flavours:
 * single value (input-group control) and multiple values (chips). DOM focus never
 * leaves the text input — aria-activedescendant + data-highlighted track the
 * active option, which is what upstream's data-highlighted:* utilities style.
 *
 * Filtering is a case-insensitive substring match on the item label; an empty
 * result writes data-empty on combobox-content and combobox-list (the two parts
 * upstream's data-empty:p-0 / group-data-empty:flex utilities hang off).
 * The hidden native <select> mirror is the single source of truth for the value:
 * every selection writes it and fires a native 'change', so plain form submits
 * and common/formValidation.js need to know nothing about this module.
 *
 * Integration API:
 *   in    CustomEvent 'combobox:open' / 'combobox:close' on the component root
 *   out   CustomEvent 'combobox:change' — { value, label } (single) or
 *         { values, labels } (chips) — 'combobox:opened' / 'combobox:closed',
 *         all bubbling, plus a native 'change' on the hidden <select>
 */
export default function ComboboxModule(node) {
  const chips = node.dataset.chips === 'true';
  const input = node.querySelector(
    chips ? '[data-slot="combobox-chip-input"]' : '[data-slot="combobox-input"]'
  );
  const panel = node.querySelector('[data-slot="combobox-content"]');
  const list = node.querySelector('[data-slot="combobox-list"]');
  if (!input || !panel || !list) return () => {};

  const native = node.querySelector('select');
  const chipsBox = node.querySelector('[data-slot="combobox-chips"]');
  const chipTemplate = node.querySelector('[data-slot="combobox-chip-template"]');
  const trigger = node.querySelector('[data-slot="combobox-trigger"]');
  const clear = node.querySelector('[data-slot="combobox-clear"]');
  const options = Array.from(list.querySelectorAll('[data-slot="combobox-item"]'));

  const cleanups = [];
  let floating = null;
  let releaseDismiss = null;
  let isOpen = false;
  let closing = false;

  const on = (target, type, handler, options_) => {
    target.addEventListener(type, handler, options_);
    cleanups.push(() => target.removeEventListener(type, handler, options_));
  };

  // Runtime ARIA wiring (ids generated only when the markup didn't carry them).
  list.id = list.id || uid('combobox-list');
  input.setAttribute('aria-controls', list.id);
  options.forEach((option) => {
    option.id = option.id || uid('combobox-option');
  });

  const labelOf = (option) => {
    const text = option.querySelector(':scope > span:first-child');
    return (text ? text.textContent : option.textContent || '').trim();
  };

  const nav = createRovingNav(list, {
    itemSelector: '[data-slot="combobox-item"]:not([hidden])',
    mode: 'activedescendant',
    typeahead: false,
    bindKeys: false,
    onActivate: (option) => select(option),
    onFocusChange: (option) => {
      // keynav writes aria-activedescendant on its container; in a combobox it
      // belongs on the element that holds focus — the input (APG).
      list.removeAttribute('aria-activedescendant');
      input.setAttribute('aria-activedescendant', option ? option.id : '');
    },
  });

  function clearHighlight() {
    nav.clearActive();
    input.removeAttribute('aria-activedescendant');
  }

  /** Case-insensitive substring filter on the item labels. */
  function filter(query) {
    const q = (query || '').trim().toLowerCase();
    let visible = 0;
    options.forEach((option) => {
      const match = q === '' || labelOf(option).toLowerCase().includes(q);
      option.hidden = !match;
      if (match) visible += 1;
    });
    // Hide a group whose every item was filtered out, so its heading goes too.
    list.querySelectorAll('[data-slot="combobox-group"]').forEach((group) => {
      group.hidden = !group.querySelector('[data-slot="combobox-item"]:not([hidden])');
    });
    panel.toggleAttribute('data-empty', visible === 0);
    list.toggleAttribute('data-empty', visible === 0);
  }

  /** @returns {string[]} the values currently selected, read off the native mirror */
  function currentValues() {
    if (!native) return [];
    return Array.from(native.selectedOptions)
      .map((option) => option.value)
      .filter(Boolean);
  }

  function syncNative(values) {
    if (!native) return;
    Array.from(native.options).forEach((option) => {
      option.selected = option.value ? values.includes(option.value) : values.length === 0;
    });
    native.dispatchEvent(new Event('change', { bubbles: true }));
  }

  function syncIndicators(values) {
    options.forEach((option) => {
      const selected = values.includes(option.dataset.value);
      option.setAttribute('aria-selected', selected ? 'true' : 'false');
      const check = option.querySelector('[data-slot="combobox-item-indicator"] svg');
      if (check) check.classList.toggle('hidden', !selected);
    });
  }

  function renderChips(values) {
    if (!chipsBox || !chipTemplate) return;
    chipsBox.querySelectorAll('[data-slot="combobox-chip"]').forEach((chip) => chip.remove());
    values.forEach((value) => {
      const option = options.find((item) => item.dataset.value === value);
      if (!option) return;
      const chip = chipTemplate.content.firstElementChild.cloneNode(true);
      chip.dataset.value = value;
      chip.querySelector('[data-slot="combobox-chip-label"]').textContent = labelOf(option);
      const remove = chip.querySelector('[data-slot="combobox-chip-remove"]');
      if (remove) remove.setAttribute('aria-label', `Rimuovi ${labelOf(option)}`);
      chipsBox.insertBefore(chip, input);
    });
  }

  function commit(values, label) {
    syncNative(values);
    syncIndicators(values);
    if (chips) {
      renderChips(values);
      node.dispatchEvent(
        new CustomEvent('combobox:change', {
          bubbles: true,
          detail: {
            values,
            labels: values.map((value) => {
              const option = options.find((item) => item.dataset.value === value);
              return option ? labelOf(option) : value;
            }),
          },
        })
      );
    } else {
      node.dispatchEvent(
        new CustomEvent('combobox:change', { bubbles: true, detail: { value: values[0] || '', label } })
      );
    }
  }

  function select(option) {
    if (!option || option.hasAttribute('data-disabled')) return;
    const value = option.dataset.value || '';
    const label = labelOf(option);
    if (chips) {
      const values = currentValues();
      const next = values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
      input.value = '';
      filter('');
      commit(next, label);
      input.focus();
      return;
    }
    input.value = label;
    commit([value], label);
    close();
  }

  function open({ resetFilter = true } = {}) {
    if (isOpen || closing || input.disabled) return;
    isOpen = true;
    if (resetFilter) filter(chips ? input.value : '');
    panel.hidden = false;
    input.setAttribute('aria-expanded', 'true');
    floating = createFloating(chips && chipsBox ? chipsBox : input.closest('[data-slot="input-group"]') || input, panel, {
      placement: 'bottom-start',
      offset: 6,
      matchWidth: true,
    });
    floating.update();
    // Synchronous: animate-in is keyframe-based, it plays from first paint.
    setState(panel, 'open');
    // ESC is owned by the dismiss layer (document capture phase, so an input
    // keydown handler could never run first): APG wants the first press to clear
    // the query and only the next one to close the list.
    releaseDismiss = pushDismissLayer({
      onDismiss: (reason) => {
        if (reason === 'escape' && input.value !== '') {
          input.value = '';
          filter('');
          clearHighlight();
          return;
        }
        close();
      },
      exclude: [node],
    });
    const selected = options.find(
      (option) => option.getAttribute('aria-selected') === 'true' && !option.hidden
    );
    if (selected) nav.setActive(selected);
    else clearHighlight();
    node.dispatchEvent(new CustomEvent('combobox:opened', { bubbles: true }));
  }

  function close() {
    if (!isOpen || closing) return;
    closing = true;
    input.setAttribute('aria-expanded', 'false');
    clearHighlight();
    if (releaseDismiss) {
      releaseDismiss();
      releaseDismiss = null;
    }
    closeWithAnimation(panel, () => {
      panel.hidden = true;
      closing = false;
      isOpen = false;
      if (floating) {
        floating.destroy();
        floating = null;
      }
      node.dispatchEvent(new CustomEvent('combobox:closed', { bubbles: true }));
    });
  }

  on(input, 'focus', () => open());
  on(input, 'click', () => open());
  on(input, 'input', () => {
    if (!isOpen) open({ resetFilter: false });
    filter(input.value);
    clearHighlight();
  });
  on(input, 'keydown', (event) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (!isOpen) {
        open();
        if (!nav.getActive()) {
          if (event.key === 'ArrowDown') nav.focusFirst();
          else nav.focusLast();
        }
        return;
      }
      nav.handleKey(event);
      return;
    }
    if ((event.key === 'Home' || event.key === 'End') && isOpen && input.value === '') {
      nav.handleKey(event);
      return;
    }
    if (event.key === 'Enter' && isOpen && nav.getActive()) {
      event.preventDefault();
      select(nav.getActive());
      return;
    }
    if (event.key === 'Backspace' && chips && input.value === '') {
      const values = currentValues();
      if (values.length) commit(values.slice(0, -1), '');
    }
  });
  on(input, 'blur', (event) => {
    if (event.relatedTarget && node.contains(event.relatedTarget)) return;
    close();
  });

  if (trigger) {
    on(trigger, 'click', () => {
      if (isOpen) close();
      else {
        open();
        input.focus();
      }
    });
  }
  if (clear) {
    on(clear, 'click', () => {
      input.value = '';
      filter('');
      commit([], '');
      input.focus();
    });
  }
  if (chipsBox) {
    on(chipsBox, 'click', (event) => {
      const remove = event.target.closest('[data-slot="combobox-chip-remove"]');
      if (remove) {
        const value = remove.closest('[data-slot="combobox-chip"]').dataset.value;
        commit(currentValues().filter((item) => item !== value), '');
        return;
      }
      if (event.target === chipsBox) input.focus();
    });
  }

  // Keep focus on the input while interacting with the list (a blur-close would
  // otherwise race the option click).
  on(panel, 'pointerdown', (event) => event.preventDefault());
  on(panel, 'click', (event) => {
    const option = event.target.closest('[data-slot="combobox-item"]');
    if (option && options.includes(option)) select(option);
  });
  on(panel, 'pointermove', (event) => {
    const option = event.target.closest('[data-slot="combobox-item"]');
    if (option && options.includes(option) && option !== nav.getActive() && !option.hasAttribute('data-disabled')) {
      nav.setActive(option);
    }
  });

  on(node, 'combobox:open', () => open());
  on(node, 'combobox:close', () => close());

  filter('');

  return () => {
    if (releaseDismiss) releaseDismiss();
    if (floating) floating.destroy();
    nav.destroy();
    cleanups.forEach((fn) => fn());
    panel.hidden = true;
    setState(panel, 'closed');
    input.setAttribute('aria-expanded', 'false');
    input.removeAttribute('aria-activedescendant');
  };
}
