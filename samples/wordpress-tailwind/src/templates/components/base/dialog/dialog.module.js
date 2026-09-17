import { closeWithAnimation, setState } from '../../../../js/common/dataState';
import { saveFocus } from '../../../../js/common/focus';
import { lockScroll, unlockScroll } from '../../../../js/common/scrollLock';
import { uid } from '../../../../js/common/uid';

/**
 * Shared module for the whole overlay family (dialog, alert-dialog, sheet,
 * drawer): native <dialog> + showModal() gives focus trap, ESC, inert
 * background and top layer for free. Behavior flags read from the markup:
 *   [data-static]  — no light dismiss on backdrop click (alert-dialog)
 *   data-state     — drives shadcn animate-in/out classes (+ ::backdrop)
 *
 * Integration API:
 *   in    CustomEvent 'dialog:open' / 'dialog:close' on the component root
 *   out   CustomEvent 'dialog:opened' / 'dialog:closed' (bubbles: true) on the root
 *   hooks [data-dialog-trigger] inside the component, [data-dialog-close] inside
 *         the <dialog>, [data-dialog-open="<id>"] anywhere in the page (requires id)
 */
export default function DialogModule(node) {
  const dialog = node.querySelector('dialog');
  if (!dialog) return () => {};
  const isStatic = dialog.hasAttribute('data-static');
  // Upstream mirrors data-state onto the close button too (hover style while
  // open); the native <dialog> only carries data-state on itself.
  const closeButton = dialog.querySelector('[data-slot$="-close"]');
  let restoreFocus = null;
  let closing = false;
  const cleanups = [];

  const on = (target, type, handler, options) => {
    target.addEventListener(type, handler, options);
    cleanups.push(() => target.removeEventListener(type, handler, options));
  };

  // Runtime ARIA wiring (ids generated only when Twig didn't receive them).
  const title = dialog.querySelector('[data-slot$="-title"]');
  if (title) {
    title.id = title.id || uid('dialog-title');
    dialog.setAttribute('aria-labelledby', title.id);
  }
  const description = dialog.querySelector('[data-slot$="-description"]');
  if (description) {
    description.id = description.id || uid('dialog-description');
    dialog.setAttribute('aria-describedby', description.id);
  }

  const open = () => {
    if (dialog.open) return;
    closing = false;
    restoreFocus = saveFocus();
    dialog.showModal();
    lockScroll();
    // Synchronous: animate-in is keyframe-based, it plays from first paint
    // (and rAF is throttled in hidden tabs).
    setState(dialog, 'open');
    if (closeButton) setState(closeButton, 'open');
    node.dispatchEvent(new CustomEvent('dialog:opened', { bubbles: true }));
  };

  const close = (returnValue) => {
    if (!dialog.open || closing) return;
    closing = true;
    if (closeButton) setState(closeButton, 'closed');
    closeWithAnimation(dialog, () => {
      dialog.close(typeof returnValue === 'string' ? returnValue : '');
      closing = false;
      unlockScroll();
      if (restoreFocus) restoreFocus();
      node.dispatchEvent(new CustomEvent('dialog:closed', { bubbles: true }));
    });
  };

  on(node, 'click', (event) => {
    if (event.target.closest('[data-dialog-trigger]')) open();
  });
  on(dialog, 'click', (event) => {
    if (event.target.closest('[data-dialog-close]')) {
      close();
      return;
    }
    // Backdrop click: the <dialog> itself is the target only outside the panel
    // content... but our dialog IS the panel, so a click on the backdrop hits
    // the dialog element with coordinates outside its box.
    if (!isStatic && event.target === dialog) {
      const rect = dialog.getBoundingClientRect();
      const inside =
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom;
      if (!inside) close();
    }
  });
  // ESC → animated close instead of instant native close (APG: Escape always
  // dismisses, even a static/alertdialog one — only outside-click is disabled).
  on(dialog, 'cancel', (event) => {
    event.preventDefault();
    close();
  });
  if (node.id) {
    on(document, 'click', (event) => {
      if (event.target.closest(`[data-dialog-open="${node.id}"]`)) open();
    });
  }
  on(node, 'dialog:open', open);
  on(node, 'dialog:close', () => close());

  return () => {
    if (dialog.open) {
      dialog.close();
      unlockScroll();
    }
    cleanups.forEach((fn) => fn());
  };
}
