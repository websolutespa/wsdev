import { closeWithAnimation, setState } from '../../../../js/common/dataState';
import { pushDismissLayer } from '../../../../js/common/dismiss';
import { createFloating } from '../../../../js/common/floating';

/**
 * Hover card: like a tooltip but content-rich, with open/close delays
 * (Radix HoverCard parity). Config read from the root's data attributes:
 *   data-open-delay / data-close-delay  — ms (defaults 700 / 300)
 *   data-side / data-align / data-side-offset — anchored positioning
 *
 * Behavior: pointerenter (non-touch) or focusin opens after openDelay;
 * pointerleave/focusout of BOTH trigger and panel closes after closeDelay,
 * cancelled when re-entered; Escape / pointerdown outside → immediate close
 * (via the shared dismiss-layer stack). No aria-haspopup/aria-expanded on the
 * trigger (Radix parity: hover cards are a sighted-pointer enhancement;
 * keyboard reach via focusin/focusout).
 */
export default function HoverCardModule(node) {
  const trigger = node.querySelector('[data-slot="hover-card-trigger"]');
  const panel = node.querySelector('[data-slot="hover-card-content"]');
  if (!trigger || !panel) return () => {};

  const openDelay = Number(node.dataset.openDelay || 700);
  const closeDelay = Number(node.dataset.closeDelay || 300);
  const side = node.dataset.side || 'bottom';
  const align = node.dataset.align || 'center';
  const sideOffset = Number(node.dataset.sideOffset || 4);
  const placement = align === 'center' ? side : `${side}-${align}`;

  let floating = null;
  let releaseDismiss = null;
  let openTimer = 0;
  let closeTimer = 0;
  let isOpen = false;
  let generation = 0; // invalidates pending close animations on reopen
  const cleanups = [];

  const on = (target, type, handler, options) => {
    target.addEventListener(type, handler, options);
    cleanups.push(() => target.removeEventListener(type, handler, options));
  };

  const clearTimers = () => {
    clearTimeout(openTimer);
    clearTimeout(closeTimer);
  };

  // Hoisted function declarations (not const arrows): openNow() and closeNow()
  // reference each other, so whichever is declared as a const would trip
  // no-use-before-define on the other.
  function openNow() {
    if (isOpen) return;
    isOpen = true;
    generation += 1;
    panel.hidden = false;
    // Hide until positioned: un-hiding restarts CSS animations and the panel
    // still sits at its un-positioned location for a frame.
    panel.style.visibility = 'hidden';
    if (!floating) {
      floating = createFloating(trigger, panel, { placement, offset: sideOffset });
    }
    floating.update().then(() => {
      if (!isOpen) return;
      panel.style.visibility = '';
      // data-state=open AFTER positioning so animate-in plays from the right
      // spot with the --transform-origin floating.js just computed.
      setState(panel, 'open');
      setState(trigger, 'open');
    });
    releaseDismiss = pushDismissLayer({
      onDismiss: () => closeNow(),
      exclude: [node],
    });
  }

  function closeNow() {
    if (!isOpen) return;
    isOpen = false;
    generation += 1;
    const snapshot = generation;
    if (releaseDismiss) {
      releaseDismiss();
      releaseDismiss = null;
    }
    setState(trigger, 'closed');
    closeWithAnimation(panel, () => {
      if (generation !== snapshot || isOpen) return; // reopened meanwhile
      panel.hidden = true;
      if (floating) {
        floating.destroy();
        floating = null;
      }
    });
  }

  // Radix parity: opening clears a pending close and vice versa.
  const scheduleOpen = () => {
    clearTimers();
    if (isOpen) return;
    openTimer = setTimeout(openNow, openDelay);
  };
  const scheduleClose = () => {
    clearTimers();
    closeTimer = setTimeout(closeNow, closeDelay);
  };

  // Hover cards are unreachable by touch by design (Radix excludeTouch).
  const excludeTouch = (handler) => (event) => {
    if (event.pointerType !== 'touch') handler(event);
  };

  on(trigger, 'pointerenter', excludeTouch(scheduleOpen));
  on(trigger, 'pointerleave', excludeTouch(scheduleClose));
  // Entering the panel cancels the close started by leaving the trigger.
  on(panel, 'pointerenter', excludeTouch(clearTimers));
  on(panel, 'pointerleave', excludeTouch(scheduleClose));

  // Keyboard users: focus opens, leaving trigger+panel closes. node wraps
  // both (no portal), so focus moving within it never schedules a close.
  on(node, 'focusin', () => {
    clearTimeout(closeTimer);
    if (!isOpen) scheduleOpen();
  });
  on(node, 'focusout', (event) => {
    if (event.relatedTarget && node.contains(event.relatedTarget)) return;
    scheduleClose();
  });

  return () => {
    clearTimers();
    if (releaseDismiss) releaseDismiss();
    if (floating) floating.destroy();
    if (isOpen) {
      panel.hidden = true;
      setState(panel, 'closed');
      setState(trigger, 'closed');
    }
    cleanups.forEach((fn) => fn());
  };
}
