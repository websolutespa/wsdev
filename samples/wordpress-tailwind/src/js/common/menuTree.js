import { closeWithAnimation, setState } from './dataState.js';
import { pushDismissLayer } from './dismiss.js';
import { createFloating } from './floating.js';
import { createRovingNav } from './keynav.js';
import { uid } from './uid.js';

/**
 * Shared machinery for the three Radix menu families that behave identically
 * once open: dropdown-menu, context-menu and menubar.
 *
 * A "level" is one open panel (root content or an open submenu): its own
 * floating position, its own roving-tabindex nav and its own listeners.
 * Submenus live in the DOM as siblings of their sub-trigger, so the direct-
 * child scoping in ITEM_SELECTOR keeps a level's nav blind to deeper items.
 * One dismiss layer covers the whole tree.
 *
 * The caller owns everything outside the panels (trigger markup, aria-expanded
 * on the trigger, refocus policy, public events) and is notified through
 * onOpen/onClose/onSelect.
 */
const ITEM_SELECTOR = ':scope > [role^="menuitem"], :scope > [role="group"] > [role^="menuitem"]';

/**
 * @param {HTMLElement} root — component root; the dismiss layer excludes it wholesale
 * @param {object} options
 * @param {string} options.prefix — data-slot prefix ('dropdown-menu' | 'context-menu' | 'menubar')
 * @param {number} [options.sideOffset] — root panel distance from its anchor, px
 * @param {number} [options.subOffset] — submenu panel distance from its sub-trigger, px
 * @param {(detail: {label: string, value: string|null, checked?: boolean}) => void} [options.onSelect]
 * @param {(info: {anchor: Element|object}) => void} [options.onOpen]
 * @param {(info: {anchor: Element|object, refocus: boolean, reason: string}) => void} [options.onClose]
 * @param {(direction: -1|1) => boolean} [options.onHorizontal] — root-level ArrowLeft/ArrowRight
 *        that the tree itself cannot use (menubar moves to the adjacent menu); return true if handled
 * @returns {{
 *   open: (panel: HTMLElement, anchor: Element|object, placement: string, focusTarget?: string) => void,
 *   close: (opts?: {refocus?: boolean, immediate?: boolean, reason?: string}) => void,
 *   isOpen: () => boolean,
 *   getAnchor: () => Element|object|null,
 *   focusFirst: () => void,
 *   focusLast: () => void,
 *   destroy: () => void
 * }}
 */
export function createMenuTree(root, options) {
  const {
    prefix,
    sideOffset = 4,
    subOffset = 0,
    onSelect = () => {},
    onOpen = () => {},
    onClose = () => {},
    onHorizontal = () => false,
  } = options;

  const SUB_TRIGGER = `${prefix}-sub-trigger`;
  const SUB_CONTENT = `${prefix}-sub-content`;

  const levels = []; // open panels, root level first
  let rootAnchor = null;
  let releaseDismiss = null;

  wireAria();

  /** Ids/aria that Twig cannot generate (no random() in templates). */
  function wireAria() {
    root.querySelectorAll(`[data-slot="${SUB_TRIGGER}"]`).forEach((subTrigger) => {
      const subPanel = subTrigger.nextElementSibling;
      if (subPanel && subPanel.dataset.slot === SUB_CONTENT) {
        subPanel.id = subPanel.id || uid(`${prefix}-sub`);
        subTrigger.setAttribute('aria-controls', subPanel.id);
      }
    });
    root.querySelectorAll('[role="group"]').forEach((group) => {
      const label = group.querySelector(`:scope > [data-slot="${prefix}-label"]`);
      if (label) {
        label.id = label.id || uid(`${prefix}-label`);
        group.setAttribute('aria-labelledby', label.id);
      }
    });
  }

  const isOpen = () => levels.length > 0;

  const isDisabled = (item) =>
    item.hasAttribute('data-disabled') || item.getAttribute('aria-disabled') === 'true';

  // A download link must keep its native activation: window.location.assign
  // drops the `download` attribute and the file opens inline instead.
  const isDownload = (item) => item.tagName === 'A' && item.hasAttribute('download');

  function getLabel(item) {
    const clone = item.cloneNode(true);
    clone
      .querySelectorAll(`svg, [data-slot="${prefix}-shortcut"]`)
      .forEach((child) => child.remove());
    return clone.textContent.trim();
  }

  // Checkbox/radio indicator: the span > svg is always in the DOM, visibility
  // toggled with the `hidden` class so it matches Radix's ItemIndicator.
  function setIndicator(item, checked) {
    item.setAttribute('aria-checked', checked ? 'true' : 'false');
    setState(item, checked ? 'checked' : 'unchecked');
    const icon = item.querySelector(':scope > span > svg');
    if (icon) icon.classList.toggle('hidden', !checked);
  }

  function closeLevel(level, immediate) {
    level.cleanups.forEach((fn) => fn());
    level.nav.destroy();
    if (level.isSub) {
      level.anchor.setAttribute('aria-expanded', 'false');
      setState(level.anchor, 'closed');
    }
    const finish = () => {
      // Guard against hiding a panel that was reopened mid exit-animation.
      if (level.panel.dataset.state === 'closed') level.panel.hidden = true;
      level.floating.destroy();
    };
    if (immediate) {
      setState(level.panel, 'closed');
      finish();
    } else {
      closeWithAnimation(level.panel, finish);
    }
  }

  function closeLevelsFrom(index, immediate) {
    while (levels.length > index) closeLevel(levels.pop(), immediate);
  }

  function close({ refocus = false, immediate = false, reason = 'programmatic' } = {}) {
    if (!isOpen()) return;
    const anchor = rootAnchor;
    closeLevelsFrom(0, immediate);
    if (releaseDismiss) {
      releaseDismiss();
      releaseDismiss = null;
    }
    rootAnchor = null;
    onClose({ anchor, refocus, reason });
  }

  const levelOf = (element) =>
    levels.find((level) => level.panel === element.closest('[role="menu"]'));

  function openSub(subTrigger) {
    const parent = levelOf(subTrigger);
    if (!parent) return;
    const parentIndex = levels.indexOf(parent);
    const next = levels[parentIndex + 1];
    if (next && next.anchor === subTrigger) {
      closeLevelsFrom(parentIndex + 1); // toggle an already-open submenu
      return;
    }
    closeLevelsFrom(parentIndex + 1);
    const subPanel = subTrigger.nextElementSibling;
    if (!subPanel || subPanel.dataset.slot !== SUB_CONTENT) return;
    const level = openLevel(subPanel, subTrigger, 'right-start', true);
    subTrigger.setAttribute('aria-expanded', 'true');
    setState(subTrigger, 'open');
    level.nav.focusFirst();
  }

  function activate(item, { fromClick = false } = {}) {
    if (isDisabled(item)) return;
    const slot = item.dataset.slot;
    if (slot === SUB_TRIGGER) {
      openSub(item);
      return;
    }
    if (slot === `${prefix}-checkbox-item`) {
      const checked = item.getAttribute('aria-checked') !== 'true';
      setIndicator(item, checked);
      onSelect({ label: getLabel(item), value: item.dataset.value || null, checked });
      return;
    }
    if (slot === `${prefix}-radio-item`) {
      const group = item.closest('[role="group"]') || item.parentElement;
      group
        .querySelectorAll(':scope > [role="menuitemradio"]')
        .forEach((radio) => setIndicator(radio, radio === item));
      onSelect({ label: getLabel(item), value: item.dataset.value || null, checked: true });
      return;
    }
    const href = item.tagName === 'A' ? item.getAttribute('href') : null;
    if (href) {
      if (isDownload(item)) {
        // Keyboard activation is synthetic: replay it as a real click so the
        // browser performs the download. The replayed click re-enters here
        // with fromClick, which stops after close().
        if (!fromClick) item.click();
        close({ refocus: true, reason: 'select' });
        return;
      }
      close({ reason: 'select' });
      window.location.assign(href);
      return;
    }
    onSelect({ label: getLabel(item), value: item.dataset.value || null });
    close({ refocus: true, reason: 'select' });
  }

  function openLevel(panel, anchor, panelPlacement, isSub) {
    panel.hidden = false;
    const floating = createFloating(anchor, panel, {
      placement: panelPlacement,
      offset: isSub ? subOffset : sideOffset,
    });
    const nav = createRovingNav(panel, {
      itemSelector: ITEM_SELECTOR,
      orientation: 'vertical',
      loop: true,
      mode: 'roving',
      typeahead: true,
      bindKeys: false,
      onActivate: activate,
    });
    const level = { panel, anchor, floating, nav, isSub, cleanups: [] };
    const onLevel = (type, handler) => {
      panel.addEventListener(type, handler);
      level.cleanups.push(() => panel.removeEventListener(type, handler));
    };

    // Events bubbling out of a deeper open submenu belong to that level only.
    const ownEvent = (event) => event.target.closest('[role="menu"]') === panel;

    onLevel('keydown', (event) => {
      if (!ownEvent(event)) return;
      if (event.key === 'Escape') return; // handled by the dismiss layer
      if (event.key === 'Tab') {
        // APG: Tab closes the menu; refocus the anchor first so the default
        // Tab/Shift+Tab then moves focus relative to it.
        close({ refocus: true, reason: 'tab' });
        return;
      }
      if (event.key === 'ArrowRight') {
        const item = event.target.closest('[role^="menuitem"]');
        if (item && item.dataset.slot === SUB_TRIGGER && !isDisabled(item)) {
          event.preventDefault();
          openSub(item);
          return;
        }
        if (!isSub && onHorizontal(1)) event.preventDefault();
        return;
      }
      if (event.key === 'ArrowLeft') {
        if (isSub) {
          event.preventDefault();
          closeLevelsFrom(levels.indexOf(level));
          anchor.focus();
          return;
        }
        if (onHorizontal(-1)) event.preventDefault();
        return;
      }
      nav.handleKey(event);
    });

    onLevel('click', (event) => {
      if (!ownEvent(event)) return;
      const item = event.target.closest('[role^="menuitem"]');
      if (!item || isDisabled(item)) return;
      if (item.tagName === 'A' && !isDownload(item)) event.preventDefault(); // route through activate()
      activate(item, { fromClick: true });
    });

    // Menus move focus on hover; hovering a parent item closes open submenus
    // (except the hovered sub-trigger's own open submenu).
    onLevel('pointerover', (event) => {
      if (!ownEvent(event)) return;
      const item = event.target.closest('[role^="menuitem"]');
      if (!item || isDisabled(item)) return;
      const index = levels.indexOf(level);
      const next = levels[index + 1];
      if (next && next.anchor !== item) closeLevelsFrom(index + 1);
      nav.setActive(item);
    });

    setState(panel, 'open');
    floating.update();
    levels.push(level);
    return level;
  }

  function open(panel, anchor, placement, focusTarget = 'panel') {
    if (isOpen()) close({ immediate: true, reason: 'switch' });
    rootAnchor = anchor;
    releaseDismiss = pushDismissLayer({
      onDismiss: (reason) => close({ refocus: reason === 'escape', reason }),
      exclude: [root],
    });
    const level = openLevel(panel, anchor, placement, false);
    onOpen({ anchor });
    if (focusTarget === 'first') level.nav.focusFirst();
    else if (focusTarget === 'last') level.nav.focusLast();
    else if (focusTarget === 'panel') panel.focus();
  }

  return {
    open,
    close,
    isOpen,
    getAnchor: () => rootAnchor,
    focusFirst: () => levels[0] && levels[0].nav.focusFirst(),
    focusLast: () => levels[0] && levels[0].nav.focusLast(),
    destroy: () => close({ immediate: true, reason: 'destroy' }),
  };
}
