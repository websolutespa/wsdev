import { closeWithAnimation, setState } from '../../../../js/common/dataState';
import { pushDismissLayer } from '../../../../js/common/dismiss';
import { createRovingNav } from '../../../../js/common/keynav';
import { uid } from '../../../../js/common/uid';

/**
 * Navigation menu per the WAI-ARIA APG "Disclosure Navigation" pattern.
 *
 * Two layouts, chosen by data-viewport on the root:
 *   true  — one shared viewport below the list; the open panel is MOVED into it
 *           (Radix portals it there) and the viewport is sized from that panel,
 *           which is what --viewport-width / --viewport-height mean. Moving the
 *           node, rather than cloning it, keeps link focus and ids stable.
 *   false — every panel stays under its own item and styles itself through the
 *           group-data-[viewport=false] utilities already in the class string.
 *
 * data-motion on the panel encodes the direction of a menu-to-menu switch so the
 * upstream slide-in/out utilities play the right way.
 *
 * Integration API:
 *   in    CustomEvent 'navigation-menu:open' (detail.index: Number, default 0),
 *         'navigation-menu:close'
 *   out   CustomEvent 'navigation-menu:opened' ({ index }), 'navigation-menu:closed'
 *         ({ index }) — bubbling from the nav root
 *
 * Manual keyboard checklist status: not run (no browser tool in this session).
 */
const OPEN_DELAY = 150;
const CLOSE_DELAY = 300;

export default function NavigationMenuModule(node) {
  const list = node.querySelector('[data-slot="navigation-menu-list"]');
  if (!list) return () => {};

  const useViewport = node.dataset.viewport !== 'false';
  const viewport = node.querySelector('[data-slot="navigation-menu-viewport"]');
  const indicator = node.querySelector('[data-slot="navigation-menu-indicator"]');
  const items = Array.from(list.querySelectorAll(':scope > [data-slot="navigation-menu-item"]'));
  const triggers = items.map((item) => item.querySelector(':scope > [data-slot="navigation-menu-trigger"]'));
  const panels = items.map((item) => item.querySelector(':scope > [data-slot="navigation-menu-content"]'));

  const cleanups = [];
  const on = (target, type, handler, options) => {
    target.addEventListener(type, handler, options);
    cleanups.push(() => target.removeEventListener(type, handler, options));
  };

  // Runtime ARIA wiring (ids generated only when Twig didn't receive them).
  triggers.forEach((trigger, index) => {
    if (!trigger) return;
    const panel = panels[index];
    panel.id = panel.id || uid('navigation-menu-content');
    trigger.setAttribute('aria-controls', panel.id);
    trigger.setAttribute('aria-expanded', 'false');
  });
  if (indicator) indicator.style.position = 'absolute';

  let openIndex = -1;
  let releaseDismiss = null;
  let openTimer = null;
  let closeTimer = null;
  // Escape refocuses the trigger, whose focus handler would reopen the panel.
  let suppressFocusOpen = false;

  const nav = createRovingNav(list, {
    itemSelector: '[data-slot="navigation-menu-trigger"], :scope > [data-slot="navigation-menu-item"] > [data-slot="navigation-menu-link"]',
    orientation: 'horizontal',
    loop: false,
    mode: 'roving',
    typeahead: false,
    bindKeys: true,
    // Without this the nav would swallow Enter/Space on a top-level link.
    onActivate: (item) => item.click(),
  });
  nav.getItems().forEach((item, index) => {
    item.tabIndex = index === 0 ? 0 : -1;
  });

  const clearTimers = () => {
    clearTimeout(openTimer);
    clearTimeout(closeTimer);
    openTimer = null;
    closeTimer = null;
  };

  function syncIndicator(index) {
    if (!indicator) return;
    if (index === -1) {
      setState(indicator, 'hidden');
      indicator.hidden = true;
      return;
    }
    const trigger = triggers[index];
    const navRect = node.getBoundingClientRect();
    const triggerRect = trigger.getBoundingClientRect();
    indicator.hidden = false;
    indicator.style.left = `${triggerRect.left - navRect.left}px`;
    indicator.style.width = `${triggerRect.width}px`;
    setState(indicator, 'visible');
  }

  /** Viewport mode only: host the panel and size the viewport from it. */
  function mountInViewport(panel) {
    if (!useViewport || !viewport) return;
    // Measure while the panel is still auto-sized inside its own item: the
    // viewport is sized FROM these numbers, so measuring after the move would
    // read the viewport's own width back and lock the panel to it.
    const width = panel.offsetWidth;
    const height = panel.offsetHeight;
    viewport.hidden = false;
    viewport.style.setProperty('--viewport-width', `${width}px`);
    viewport.style.setProperty('--viewport-height', `${height}px`);
    viewport.appendChild(panel);
    setState(viewport, 'open');
  }

  function unmountFromViewport(panel, index) {
    if (!useViewport || !viewport) return;
    if (panel.parentElement === viewport) items[index].appendChild(panel);
  }

  // Hoisted declarations: openPanel() and closePanel() reference each other.
  function closePanel(index, { immediate = false, direction = 0 } = {}) {
    if (index === -1 || openIndex !== index) return;
    const trigger = triggers[index];
    const panel = panels[index];
    openIndex = -1;
    trigger.setAttribute('aria-expanded', 'false');
    setState(trigger, 'closed');
    panel.dataset.motion = direction > 0 ? 'to-start' : 'to-end';

    const finish = () => {
      if (openIndex !== -1) return; // reopened while the exit animation played
      panel.hidden = true;
      delete panel.dataset.motion;
      unmountFromViewport(panel, index);
      if (viewport) {
        viewport.hidden = true;
        setState(viewport, 'closed');
      }
      syncIndicator(-1);
      if (releaseDismiss) {
        releaseDismiss();
        releaseDismiss = null;
      }
      node.dispatchEvent(new CustomEvent('navigation-menu:closed', { bubbles: true, detail: { index } }));
    };

    if (immediate) {
      setState(panel, 'closed');
      finish();
    } else {
      closeWithAnimation(panel, finish);
    }
  }

  function openPanel(index) {
    if (index === -1 || !triggers[index] || openIndex === index) return;
    const previous = openIndex;
    const direction = previous === -1 || index > previous ? 1 : -1;
    if (previous !== -1) closePanel(previous, { immediate: true, direction });

    openIndex = index;
    const trigger = triggers[index];
    const panel = panels[index];
    panel.hidden = false;
    panel.dataset.motion = direction > 0 ? 'from-end' : 'from-start';
    setState(panel, 'open');
    trigger.setAttribute('aria-expanded', 'true');
    setState(trigger, 'open');
    mountInViewport(panel);
    syncIndicator(index);

    if (!releaseDismiss) {
      releaseDismiss = pushDismissLayer({
        onDismiss: (reason) => {
          const current = openIndex;
          closePanel(current, { immediate: reason === 'outside' });
          if (reason === 'escape' && triggers[current]) {
            suppressFocusOpen = true;
            triggers[current].focus();
            suppressFocusOpen = false;
          }
        },
        exclude: [node],
      });
    }
    node.dispatchEvent(new CustomEvent('navigation-menu:opened', { bubbles: true, detail: { index } }));
  }

  triggers.forEach((trigger, index) => {
    if (!trigger) return;
    const panel = panels[index];

    on(trigger, 'click', () => {
      clearTimers();
      if (openIndex === index) closePanel(index);
      else openPanel(index);
    });

    // Radix opens on focus too, so keyboard traversal reveals each panel.
    on(trigger, 'focus', () => {
      if (suppressFocusOpen) return;
      clearTimers();
      openPanel(index);
    });

    on(trigger, 'pointerenter', () => {
      clearTimers();
      openTimer = setTimeout(() => openPanel(index), OPEN_DELAY);
    });
    on(trigger, 'pointerleave', () => {
      clearTimers();
      closeTimer = setTimeout(() => closePanel(index), CLOSE_DELAY);
    });
    on(panel, 'pointerenter', clearTimers);
    on(panel, 'pointerleave', () => {
      clearTimers();
      closeTimer = setTimeout(() => closePanel(index), CLOSE_DELAY);
    });
  });

  // ArrowDown from a trigger enters the open panel; Escape is the dismiss layer's.
  on(list, 'keydown', (event) => {
    if (event.key !== 'ArrowDown') return;
    const index = triggers.indexOf(event.target);
    if (index === -1) return;
    event.preventDefault();
    openPanel(index);
    const firstLink = panels[index].querySelector('[data-slot="navigation-menu-link"]');
    if (firstLink) firstLink.focus();
  });

  on(node, 'navigation-menu:open', (event) => openPanel((event.detail && event.detail.index) || 0));
  on(node, 'navigation-menu:close', () => closePanel(openIndex, { immediate: true }));

  return () => {
    clearTimers();
    closePanel(openIndex, { immediate: true });
    if (releaseDismiss) releaseDismiss();
    nav.destroy();
    cleanups.forEach((fn) => fn());
  };
}
