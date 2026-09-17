import { closeWithAnimation, setState } from '../../../../js/common/dataState';
import { pushDismissLayer } from '../../../../js/common/dismiss';
import { createFloating } from '../../../../js/common/floating';
import { saveFocus } from '../../../../js/common/focus';
import { uid } from '../../../../js/common/uid';

/**
 * Popover: non-modal floating panel anchored to its trigger (WAI-ARIA dialog
 * pattern, non-modal — focus moves into the panel but is not trapped).
 * Anchored positioning via common/floating.js, which writes data-side /
 * data-align / --transform-origin so the upstream shadcn animation classes
 * work. Light dismiss (outside pointerdown + ESC) goes through the shared
 * dismiss-layer stack so nested floating components compose.
 *
 * Integration API:
 *   in    CustomEvent 'popover:open' / 'popover:close' on the component root
 *   out   CustomEvent 'popover:opened' / 'popover:closed' (bubbles: true) on the root
 *   hooks [data-popover-trigger] (click toggles), [data-popover-close] (inside
 *         the panel, closes it), data-side/data-align/data-side-offset on the
 *         root → positioning config
 */
export default function PopoverModule(node) {
  const trigger = node.querySelector('[data-popover-trigger]');
  const panel = node.querySelector('[data-slot="popover-content"]');
  if (!trigger || !panel) return () => {};

  const side = node.dataset.side || 'bottom';
  const align = node.dataset.align || 'center';
  const sideOffset = parseFloat(node.dataset.sideOffset || '4');
  const placement = align === 'center' ? side : `${side}-${align}`;

  let floating = null;
  let releaseLayer = null;
  let restoreFocus = null;
  let closing = false;
  const cleanups = [];

  const on = (target, type, handler, options) => {
    target.addEventListener(type, handler, options);
    cleanups.push(() => target.removeEventListener(type, handler, options));
  };

  // Runtime ARIA wiring (ids generated only when Twig didn't receive them).
  panel.id = panel.id || uid('popover-content');
  trigger.setAttribute('aria-controls', panel.id);
  trigger.setAttribute('aria-expanded', 'false');
  if (!trigger.hasAttribute('aria-haspopup')) trigger.setAttribute('aria-haspopup', 'dialog');
  const title = panel.querySelector('[data-slot="popover-title"]');
  if (title) {
    title.id = title.id || uid('popover-title');
    panel.setAttribute('aria-labelledby', title.id);
  }
  const description = panel.querySelector('[data-slot="popover-description"]');
  if (description) {
    description.id = description.id || uid('popover-description');
    panel.setAttribute('aria-describedby', description.id);
  }

  // Hoisted function declarations (not const arrows): open() and close()
  // reference each other, so whichever is declared as a const would trip
  // no-use-before-define on the other.
  function open() {
    if (!panel.hidden) return;
    closing = false;
    restoreFocus = saveFocus();
    // Unhide before measuring: computePosition needs the panel in layout.
    panel.hidden = false;
    floating = createFloating(trigger, panel, { placement, offset: sideOffset });
    // Synchronous: animate-in is keyframe-based, it plays from first paint.
    setState(panel, 'open');
    trigger.setAttribute('aria-expanded', 'true');
    panel.focus();
    releaseLayer = pushDismissLayer({
      onDismiss: (reason) => close({ refocus: reason === 'escape' }),
      exclude: [trigger, panel],
    });
    node.dispatchEvent(new CustomEvent('popover:opened', { bubbles: true }));
  }

  function close({ refocus = true } = {}) {
    if (panel.hidden || closing) return;
    closing = true;
    if (releaseLayer) {
      releaseLayer();
      releaseLayer = null;
    }
    trigger.setAttribute('aria-expanded', 'false');
    closeWithAnimation(panel, () => {
      closing = false;
      // Never orphan focus: restore it unless the dismissing interaction
      // already moved it outside the panel (outside click on a focusable).
      const focusInside = panel.contains(document.activeElement);
      panel.hidden = true;
      if (floating) {
        floating.destroy();
        floating = null;
      }
      if ((refocus || focusInside) && restoreFocus) restoreFocus();
      restoreFocus = null;
      node.dispatchEvent(new CustomEvent('popover:closed', { bubbles: true }));
    });
  }

  on(trigger, 'click', () => {
    if (panel.hidden) {
      open();
    } else {
      close();
    }
  });
  on(panel, 'click', (event) => {
    if (event.target.closest('[data-popover-close]')) close();
  });
  on(node, 'popover:open', open);
  on(node, 'popover:close', () => close());

  return () => {
    if (releaseLayer) releaseLayer();
    if (floating) floating.destroy();
    cleanups.forEach((fn) => fn());
  };
}
