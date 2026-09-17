import { closeWithAnimation, setState } from '../../../../js/common/dataState';
import { pushDismissLayer } from '../../../../js/common/dismiss';
import { createFloating } from '../../../../js/common/floating';
import { createRovingNav } from '../../../../js/common/keynav';
import { uid } from '../../../../js/common/uid';

/**
 * Select per the WAI-ARIA APG "Select-Only Combobox": DOM focus stays on the
 * trigger button (role="combobox"), the highlighted option is tracked with
 * aria-activedescendant + data-highlighted (keynav 'activedescendant' mode) —
 * hence the data-[highlighted]:* utilities the Twig adds on top of upstream's
 * focus:* ones, which can never fire without focus inside the listbox.
 *
 * A visually hidden native <select> mirrors the value so a plain form submit,
 * a form reset and constraint validation keep working without JS glue.
 *
 * Integration API:
 *   in    CustomEvent 'select:open' / 'select:close' on the component root
 *   out   CustomEvent 'select:change' { value, label }, 'select:opened',
 *         'select:closed' (bubbles) + a native 'change' on the hidden <select>
 *
 * Manual keyboard checklist status: not run (no browser tool in this session).
 */
const TYPEAHEAD_RESET_MS = 1000;

export default function SelectModule(node) {
  const trigger = node.querySelector('[data-slot="select-trigger"]');
  const panel = node.querySelector('[data-slot="select-content"]');
  const native = node.querySelector('select');
  const valueEl = node.querySelector('[data-slot="select-value"]');
  const scrollUp = node.querySelector('[data-slot="select-scroll-up-button"]');
  const scrollDown = node.querySelector('[data-slot="select-scroll-down-button"]');
  if (!trigger || !panel) return () => {};

  const cleanups = [];
  const on = (target, type, handler, options) => {
    target.addEventListener(type, handler, options);
    cleanups.push(() => target.removeEventListener(type, handler, options));
  };

  // Runtime ARIA wiring (ids generated only when Twig didn't receive them).
  panel.id = panel.id || uid('select-content');
  trigger.setAttribute('aria-controls', panel.id);
  panel.querySelectorAll('[role="option"]').forEach((option) => {
    option.id = option.id || uid('select-item');
  });
  panel.querySelectorAll('[role="group"]').forEach((group) => {
    const label = group.querySelector(':scope > [data-slot="select-label"]');
    if (label) {
      label.id = label.id || uid('select-label');
      group.setAttribute('aria-labelledby', label.id);
    }
  });

  let isOpen = false;
  let floating = null;
  let releaseDismiss = null;
  let typeBuffer = '';
  let typeTimer = null;

  // Hoisted: nav's onActivate calls selectItem(), declared further down.
  const nav = createRovingNav(panel, {
    itemSelector: '[role="option"]',
    mode: 'activedescendant',
    bindKeys: false,
    onActivate: (item) => selectItem(item),
    // The combobox keeps DOM focus, so aria-activedescendant must live on the
    // trigger — keynav only writes it on its own container.
    onFocusChange: (item) => trigger.setAttribute('aria-activedescendant', item.id),
  });

  /** Radix only shows a scroll button when there is something to scroll to. */
  function syncScrollButtons() {
    if (scrollUp) scrollUp.hidden = panel.scrollTop <= 0;
    if (scrollDown) {
      scrollDown.hidden = panel.scrollTop + panel.clientHeight >= panel.scrollHeight - 1;
    }
  }

  function openPanel() {
    if (isOpen || trigger.disabled) return;
    isOpen = true;
    panel.hidden = false;
    if (floating) floating.destroy();
    floating = createFloating(trigger, panel, { placement: 'bottom-start', matchWidth: true });
    floating.update();
    // Synchronous: animate-in is keyframe-based, it plays from first paint.
    setState(panel, 'open');
    trigger.setAttribute('aria-expanded', 'true');
    releaseDismiss = pushDismissLayer({
      onDismiss: (reason) => closePanel({ refocus: reason === 'escape' }),
      exclude: [trigger, panel],
    });
    const items = nav.getItems();
    const selected = items.find((option) => option.getAttribute('aria-selected') === 'true');
    if (selected || items.length) nav.setActive(selected || items[0]);
    syncScrollButtons();
    node.dispatchEvent(new CustomEvent('select:opened', { bubbles: true }));
  }

  function closePanel({ refocus = false } = {}) {
    if (!isOpen) return;
    isOpen = false;
    if (releaseDismiss) {
      releaseDismiss();
      releaseDismiss = null;
    }
    trigger.setAttribute('aria-expanded', 'false');
    trigger.removeAttribute('aria-activedescendant');
    nav.clearActive();
    closeWithAnimation(panel, () => {
      if (isOpen) return; // reopened while the exit animation was playing
      panel.hidden = true;
      if (floating) {
        floating.destroy();
        floating = null;
      }
      node.dispatchEvent(new CustomEvent('select:closed', { bubbles: true }));
    });
    if (refocus) trigger.focus();
  }

  function selectItem(item, { refocus = true } = {}) {
    if (!item || item.hasAttribute('data-disabled')) return;
    const value = item.dataset.value || '';
    const label = (item.textContent || '').trim();
    panel.querySelectorAll('[role="option"]').forEach((option) => {
      const selected = option === item;
      option.setAttribute('aria-selected', selected ? 'true' : 'false');
      const check = option.querySelector('[data-slot="select-item-indicator"] svg');
      if (check) check.classList.toggle('hidden', !selected);
    });
    if (valueEl) valueEl.textContent = label;
    if (value) trigger.removeAttribute('data-placeholder');
    else trigger.setAttribute('data-placeholder', '');
    if (native) {
      native.value = value;
      native.dispatchEvent(new Event('change', { bubbles: true }));
    }
    node.dispatchEvent(new CustomEvent('select:change', { bubbles: true, detail: { value, label } }));
    closePanel({ refocus });
  }

  /** While closed there is no listbox to highlight, so typeahead selects outright. */
  function closedTypeahead(key) {
    clearTimeout(typeTimer);
    typeBuffer += key.toLowerCase();
    typeTimer = setTimeout(() => {
      typeBuffer = '';
    }, TYPEAHEAD_RESET_MS);
    const items = nav.getItems();
    const current = items.findIndex((option) => option.getAttribute('aria-selected') === 'true');
    const start = Math.max(0, current);
    const ordered = items.slice(start + (typeBuffer.length === 1 ? 1 : 0)).concat(items.slice(0, start));
    const match = ordered.find((option) => (option.textContent || '').trim().toLowerCase().startsWith(typeBuffer));
    if (match) selectItem(match, { refocus: false });
  }

  on(trigger, 'click', () => {
    if (isOpen) closePanel({ refocus: true });
    else openPanel();
  });

  on(trigger, 'keydown', (event) => {
    if (isOpen) {
      if (event.key === 'Tab') {
        // APG: Tab commits the highlighted option; focus then moves on natively.
        const active = nav.getActive();
        if (active) selectItem(active, { refocus: false });
        else closePanel();
        return;
      }
      // Arrows / Home / End / Enter / Space / typeahead. Escape belongs to the
      // dismiss layer (document-level capture).
      nav.handleKey(event);
      return;
    }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp' || event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openPanel();
      return;
    }
    if (event.key.length === 1 && event.key !== ' ' && !event.ctrlKey && !event.metaKey && !event.altKey) {
      closedTypeahead(event.key);
    }
  });

  on(panel, 'click', (event) => {
    const item = event.target.closest('[role="option"]');
    if (item && panel.contains(item)) selectItem(item);
  });

  // Pointer hover moves the highlight, like Radix.
  on(panel, 'pointermove', (event) => {
    const item = event.target.closest('[role="option"]');
    if (item && panel.contains(item) && !item.hasAttribute('data-disabled') && item !== nav.getActive()) {
      nav.setActive(item);
    }
  });

  on(panel, 'scroll', syncScrollButtons);

  on(node, 'select:open', () => openPanel());
  on(node, 'select:close', () => closePanel());

  return () => {
    clearTimeout(typeTimer);
    if (releaseDismiss) releaseDismiss();
    if (floating) floating.destroy();
    nav.destroy();
    panel.hidden = true;
    setState(panel, 'closed');
    cleanups.forEach((fn) => fn());
  };
}
