import { setState } from '../../../../js/common/dataState';
import { createMenuTree } from '../../../../js/common/menuTree';
import { uid } from '../../../../js/common/uid';

/**
 * Dropdown menu per the WAI-ARIA APG "Menu Button" pattern. The open-panel
 * machinery (levels, roving nav, typeahead, submenus, checkbox/radio
 * indicators, dismiss layer) lives in common/menuTree.js, shared with
 * context-menu and menubar; this module only owns the trigger.
 *
 * Integration API:
 *   in    CustomEvent 'menu:open' (detail.focus: 'first'|'last'|'panel'), 'menu:close'
 *   out   CustomEvent 'menu:select' { label, value, checked? }, 'menu:opened',
 *         'menu:closed' — all bubbling from the component root
 *   hooks [data-menu-trigger] toggles the menu; data-side / data-align /
 *         data-side-offset on the root configure positioning
 *
 * Manual keyboard checklist status: not run (no browser tool in this session).
 */
export default function DropdownMenuModule(node) {
  const trigger = node.querySelector('[data-menu-trigger]');
  const content = node.querySelector('[data-slot="dropdown-menu-content"]');
  if (!trigger || !content) return () => {};

  const side = node.dataset.side || 'bottom';
  const align = node.dataset.align || 'start';
  const parsedOffset = Number.parseFloat(node.dataset.sideOffset);
  const sideOffset = Number.isNaN(parsedOffset) ? 4 : parsedOffset;
  const placement = align === 'center' ? side : `${side}-${align}`;

  const cleanups = [];
  const on = (target, type, handler, options) => {
    target.addEventListener(type, handler, options);
    cleanups.push(() => target.removeEventListener(type, handler, options));
  };

  // Runtime ARIA wiring (ids generated only when Twig didn't receive them).
  content.id = content.id || uid('dropdown-menu-content');
  trigger.setAttribute('aria-controls', content.id);
  trigger.setAttribute('aria-expanded', 'false');
  if (!trigger.hasAttribute('aria-haspopup')) trigger.setAttribute('aria-haspopup', 'menu');
  setState(trigger, 'closed');

  const tree = createMenuTree(node, {
    prefix: 'dropdown-menu',
    sideOffset,
    onSelect: (detail) => node.dispatchEvent(new CustomEvent('menu:select', { bubbles: true, detail })),
    onOpen: () => {
      trigger.setAttribute('aria-expanded', 'true');
      setState(trigger, 'open');
      node.dispatchEvent(new CustomEvent('menu:opened', { bubbles: true }));
    },
    onClose: ({ refocus }) => {
      trigger.setAttribute('aria-expanded', 'false');
      setState(trigger, 'closed');
      if (refocus) trigger.focus();
      node.dispatchEvent(new CustomEvent('menu:closed', { bubbles: true }));
    },
  });

  const openMenu = (focusTarget) => tree.open(content, trigger, placement, focusTarget);

  on(trigger, 'click', () => {
    if (tree.isOpen()) tree.close();
    else openMenu('panel');
  });

  on(trigger, 'keydown', (event) => {
    if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (tree.isOpen()) tree.focusFirst();
      else openMenu('first');
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (tree.isOpen()) tree.focusLast();
      else openMenu('last');
    }
  });

  on(node, 'menu:open', (event) => {
    if (tree.isOpen()) return;
    openMenu((event.detail && event.detail.focus) || 'first');
  });
  on(node, 'menu:close', () => tree.close());

  return () => {
    tree.destroy();
    cleanups.forEach((fn) => fn());
  };
}
