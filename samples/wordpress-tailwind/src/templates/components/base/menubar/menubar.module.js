import { setState } from '../../../../js/common/dataState';
import { createRovingNav } from '../../../../js/common/keynav';
import { createMenuTree } from '../../../../js/common/menuTree';
import { uid } from '../../../../js/common/uid';

/**
 * Menubar per the WAI-ARIA APG "Menubar" pattern.
 *
 * The bar owns a horizontal roving tabindex across its triggers; the open menu
 * is one common/menuTree.js tree (shared with dropdown-menu and context-menu),
 * re-opened against a different trigger when the active menu changes — so a
 * menubar menu gets submenus, typeahead and checkbox/radio items for free.
 * ArrowLeft/ArrowRight inside an open panel move to the adjacent menu through
 * the tree's onHorizontal hook; hovering another trigger while a menu is open
 * switches to it, as in Radix.
 *
 * Integration API:
 *   in    CustomEvent 'menu:open' (detail.index: Number, default 0), 'menu:close'
 *   out   CustomEvent 'menu:select' { label, value, checked?, index }, 'menu:opened'
 *         ({ index }), 'menu:closed' ({ index }) — all bubbling from the menubar root
 *
 * Manual keyboard checklist status: not run (no browser tool in this session).
 */
export default function MenubarModule(node) {
  const menus = Array.from(node.querySelectorAll('[data-slot="menubar-menu"]'));
  const triggers = menus.map((menu) => menu.querySelector('[data-slot="menubar-trigger"]'));
  const panels = menus.map((menu) => menu.querySelector('[data-slot="menubar-content"]'));
  if (!menus.length || triggers.some((t) => !t) || panels.some((p) => !p)) return () => {};

  const cleanups = [];
  const on = (target, type, handler, options) => {
    target.addEventListener(type, handler, options);
    cleanups.push(() => target.removeEventListener(type, handler, options));
  };

  // Runtime ARIA wiring (ids generated only when Twig didn't receive them).
  triggers.forEach((trigger, index) => {
    const panel = panels[index];
    panel.id = panel.id || uid('menubar-content');
    trigger.setAttribute('aria-controls', panel.id);
  });

  let openIndex = -1;

  // bindKeys: false so the bar can intercept ArrowDown/Enter before the nav.
  const barNav = createRovingNav(node, {
    itemSelector: '[data-slot="menubar-trigger"]',
    orientation: 'horizontal',
    loop: true,
    mode: 'roving',
    typeahead: false,
    bindKeys: false,
  });

  const tree = createMenuTree(node, {
    prefix: 'menubar',
    sideOffset: { mainAxis: 8, crossAxis: -4 },
    onSelect: (detail) =>
      node.dispatchEvent(new CustomEvent('menu:select', { bubbles: true, detail: { ...detail, index: openIndex } })),
    onOpen: ({ anchor }) => {
      anchor.setAttribute('aria-expanded', 'true');
      setState(anchor, 'open');
      node.dispatchEvent(new CustomEvent('menu:opened', { bubbles: true, detail: { index: openIndex } }));
    },
    onClose: ({ anchor, refocus, reason }) => {
      const index = triggers.indexOf(anchor);
      anchor.setAttribute('aria-expanded', 'false');
      setState(anchor, 'closed');
      // 'switch' means another menu is opening right now: openIndex already
      // points at it, and refocusing the outgoing trigger would fight the move.
      if (reason !== 'switch') openIndex = -1;
      if (refocus) anchor.focus();
      node.dispatchEvent(new CustomEvent('menu:closed', { bubbles: true, detail: { index } }));
    },
    onHorizontal: (direction) => {
      step(direction, 'first');
      return true;
    },
  });

  // Hoisted declarations: they call the tree created just above, and the
  // tree's onHorizontal callback calls step() (eslint no-use-before-define).
  function openMenu(index, focusTarget) {
    if (index < 0 || index >= menus.length || index === openIndex) return;
    openIndex = index;
    // Upstream's alignOffset = -4 cancels the panel's own p-1, keeping the
    // first item's text aligned with its trigger's text.
    tree.open(panels[index], triggers[index], 'bottom-start', focusTarget);
  }

  function step(direction, focusTarget) {
    const next = (openIndex + direction + menus.length) % menus.length;
    barNav.setActive(triggers[next]);
    openMenu(next, focusTarget);
  }

  on(node, 'keydown', (event) => {
    // Inside an open panel the tree handles the keys.
    if (event.target.closest('[role="menu"]')) return;
    const index = triggers.indexOf(event.target);
    if (index === -1) return;
    if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (openIndex === index) tree.focusFirst();
      else openMenu(index, 'first');
      return;
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (openIndex === index) tree.focusLast();
      else openMenu(index, 'last');
      return;
    }
    if (!barNav.handleKey(event)) return;
    // The roving nav moved focus to another trigger: an open menu follows it.
    const moved = triggers.indexOf(document.activeElement);
    if (openIndex !== -1 && moved !== -1 && moved !== openIndex) openMenu(moved, 'panel');
  });

  triggers.forEach((trigger, index) => {
    on(trigger, 'click', () => {
      barNav.setActive(trigger);
      if (openIndex === index) tree.close();
      else openMenu(index, 'panel');
    });
    // Radix behaviour: hovering another trigger switches menus, but hovering
    // with everything closed does not open anything.
    on(trigger, 'pointerenter', () => {
      if (openIndex === -1 || openIndex === index) return;
      barNav.setActive(trigger, { focus: false });
      openMenu(index, 'panel');
    });
  });

  on(node, 'menu:open', (event) => {
    const index = (event.detail && event.detail.index) || 0;
    barNav.setActive(triggers[index]);
    openMenu(index, 'first');
  });
  on(node, 'menu:close', () => tree.close());

  return () => {
    tree.destroy();
    barNav.destroy();
    cleanups.forEach((fn) => fn());
  };
}
