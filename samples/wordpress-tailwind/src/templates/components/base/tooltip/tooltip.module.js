import { closeWithAnimation, setState } from '../../../../js/common/dataState';
import { pushDismissLayer } from '../../../../js/common/dismiss';
import { createFloating } from '../../../../js/common/floating';
import { uid } from '../../../../js/common/uid';

/**
 * WAI-ARIA APG Tooltip: the panel shows on pointer hover / keyboard focus of
 * the trigger (after an optional delay) and hides on leave, blur or Escape —
 * it never steals focus. The trigger is wired to the panel via
 * aria-describedby; floating.js provides anchored positioning and writes the
 * data-side / data-align / --transform-origin hooks shadcn's animation
 * classes rely on. Positioning config is read from the panel's data
 * attributes (data-side, data-align, data-side-offset, data-delay).
 *
 * Integration API: emits 'tooltip:shown' / 'tooltip:hidden' (bubbles: true)
 * on the component root; no incoming commands (hover/focus-driven only).
 */
export default function TooltipModule(node) {
  const trigger = node.querySelector('[data-tooltip-trigger]');
  const panel = node.querySelector('[data-slot="tooltip-content"]');
  if (!trigger || !panel) return () => {};

  const arrowEl = panel.querySelector('[data-slot="tooltip-arrow"]');
  // Out of flow before the first measurement so size-2.5 applies to the
  // inline span and floating-ui reads real arrow dimensions on update #1.
  if (arrowEl) arrowEl.style.position = 'absolute';

  const side = panel.dataset.side || 'top';
  const align = panel.dataset.align || 'center';
  const placement = align === 'center' ? side : `${side}-${align}`;
  const sideOffset = Number(panel.dataset.sideOffset) || 0;
  const delay = Number(panel.dataset.delay) || 0;

  // Runtime ARIA wiring (id generated only when Twig didn't receive one).
  panel.id = panel.id || uid('tooltip-content');
  trigger.setAttribute('aria-describedby', panel.id);

  let floating = null;
  let releaseDismiss = null;
  let showTimer = null;
  let open = false;
  const cleanups = [];

  const on = (target, type, handler, options) => {
    target.addEventListener(type, handler, options);
    cleanups.push(() => target.removeEventListener(type, handler, options));
  };

  const cancelShow = () => {
    if (showTimer) {
      clearTimeout(showTimer);
      showTimer = null;
    }
  };

  // Hoisted function declarations (not const arrows): show() and hide()
  // reference each other, so whichever is declared as a const would trip
  // no-use-before-define on the other.
  function show() {
    cancelShow();
    if (open) return;
    open = true;
    panel.hidden = false;
    if (!floating) {
      floating = createFloating(trigger, panel, {
        placement,
        offset: sideOffset,
        arrow: arrowEl,
      });
    }
    floating.update().then(() => {
      // Position first, then flip data-state so animate-in plays in place.
      if (open) setState(panel, 'open');
    });
    // Escape dismisses the topmost layer only; no light dismiss on
    // outside click (APG: tooltips close on blur/leave/Escape).
    releaseDismiss = pushDismissLayer({ onDismiss: hide, outsideClick: false });
    node.dispatchEvent(new CustomEvent('tooltip:shown', { bubbles: true }));
  }

  const scheduleShow = () => {
    if (open || showTimer) return;
    if (delay > 0) {
      showTimer = setTimeout(show, delay);
    } else {
      show();
    }
  };

  function hide() {
    cancelShow();
    if (!open) return;
    open = false;
    if (releaseDismiss) {
      releaseDismiss();
      releaseDismiss = null;
    }
    closeWithAnimation(panel, () => {
      if (open) return; // re-shown during the exit animation
      panel.hidden = true;
      if (floating) {
        floating.destroy();
        floating = null;
      }
      node.dispatchEvent(new CustomEvent('tooltip:hidden', { bubbles: true }));
    });
  }

  on(trigger, 'pointerenter', (event) => {
    // Hover/focus only — no tooltip on touch (no hover state to leave).
    if (event.pointerType === 'touch') return;
    scheduleShow();
  });
  on(trigger, 'pointerleave', hide);
  on(trigger, 'focusin', scheduleShow);
  on(trigger, 'focusout', hide);

  return () => {
    cancelShow();
    if (releaseDismiss) releaseDismiss();
    if (floating) floating.destroy();
    cleanups.forEach((fn) => fn());
  };
}
