import { setState } from '../../../../js/common/dataState';
import { createMenuTree } from '../../../../js/common/menuTree';
import { uid } from '../../../../js/common/uid';

/**
 * Context menu per the WAI-ARIA APG "Menu" pattern, anchored to the pointer
 * instead of to an element: the panel is positioned against a virtual anchor
 * (a zero-size rect at the event coordinates) that @floating-ui/dom accepts in
 * place of an Element. The open-panel machinery (levels, roving nav, typeahead,
 * submenus, checkbox/radio indicators, dismiss layer) is common/menuTree.js,
 * shared with dropdown-menu and menubar.
 *
 * Opens on right-click, on a 500 ms long-press (touch/pen), and on Shift+F10 or
 * the ContextMenu key while the trigger area has focus (then anchored at its centre).
 *
 * Integration API:
 *   in    CustomEvent 'menu:open' (detail.x / detail.y in viewport px, optional), 'menu:close'
 *   out   CustomEvent 'menu:select' { label, value, checked? }, 'menu:opened',
 *         'menu:closed' — all bubbling from the component root
 *
 * Manual keyboard checklist status: not run (no browser tool in this session).
 */
const LONG_PRESS_MS = 500;

export default function ContextMenuModule(node) {
  const trigger = node.querySelector('[data-slot="context-menu-trigger"]');
  const content = node.querySelector('[data-slot="context-menu-content"]');
  if (!trigger || !content) return () => {};

  const cleanups = [];
  const on = (target, type, handler, options) => {
    target.addEventListener(type, handler, options);
    cleanups.push(() => target.removeEventListener(type, handler, options));
  };

  // Runtime ARIA wiring (ids generated only when Twig didn't receive them).
  content.id = content.id || uid('context-menu-content');
  trigger.setAttribute('aria-controls', content.id);
  trigger.setAttribute('aria-expanded', 'false');
  setState(trigger, 'closed');

  let longPressTimer = null;

  const tree = createMenuTree(node, {
    prefix: 'context-menu',
    sideOffset: 0,
    onSelect: (detail) => node.dispatchEvent(new CustomEvent('menu:select', { bubbles: true, detail })),
    onOpen: () => {
      trigger.setAttribute('aria-expanded', 'true');
      setState(trigger, 'open');
      node.dispatchEvent(new CustomEvent('menu:opened', { bubbles: true }));
    },
    onClose: ({ refocus }) => {
      trigger.setAttribute('aria-expanded', 'false');
      setState(trigger, 'closed');
      // The anchor is virtual and cannot take focus: always return it to the
      // trigger area the menu was opened from.
      if (refocus) trigger.focus();
      node.dispatchEvent(new CustomEvent('menu:closed', { bubbles: true }));
    },
  });

  /** Zero-size rect at viewport coordinates — the standard context-menu anchor. */
  const virtualAnchor = (x, y) => ({
    getBoundingClientRect: () => new DOMRect(x, y, 0, 0),
  });

  const openAt = (x, y, focusTarget) =>
    tree.open(content, virtualAnchor(x, y), 'right-start', focusTarget);

  const cancelLongPress = () => {
    clearTimeout(longPressTimer);
    longPressTimer = null;
  };

  on(trigger, 'contextmenu', (event) => {
    event.preventDefault();
    cancelLongPress();
    openAt(event.clientX, event.clientY, 'panel');
  });

  // Touch/pen long-press: browsers on those inputs do not fire contextmenu.
  on(trigger, 'pointerdown', (event) => {
    if (event.pointerType === 'mouse') return;
    cancelLongPress();
    const { clientX, clientY } = event;
    longPressTimer = setTimeout(() => openAt(clientX, clientY, 'first'), LONG_PRESS_MS);
  });
  on(trigger, 'pointerup', cancelLongPress);
  on(trigger, 'pointercancel', cancelLongPress);
  on(trigger, 'pointermove', cancelLongPress);

  on(trigger, 'keydown', (event) => {
    if (event.key !== 'ContextMenu' && !(event.key === 'F10' && event.shiftKey)) return;
    event.preventDefault();
    const rect = trigger.getBoundingClientRect();
    openAt(rect.left + rect.width / 2, rect.top + rect.height / 2, 'first');
  });

  on(node, 'menu:open', (event) => {
    if (tree.isOpen()) return;
    const detail = event.detail || {};
    if (typeof detail.x === 'number' && typeof detail.y === 'number') {
      openAt(detail.x, detail.y, 'first');
      return;
    }
    const rect = trigger.getBoundingClientRect();
    openAt(rect.left + rect.width / 2, rect.top + rect.height / 2, 'first');
  });
  on(node, 'menu:close', () => tree.close());

  return () => {
    cancelLongPress();
    tree.destroy();
    cleanups.forEach((fn) => fn());
  };
}
