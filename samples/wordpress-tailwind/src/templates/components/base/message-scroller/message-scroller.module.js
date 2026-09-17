import { uid } from '../../../../js/common/uid';

/**
 * Stick-to-edge scroller for message lists (upstream's @shadcn/react headless
 * primitive re-implemented): while the viewport sits at the target edge new
 * content keeps it pinned there; as soon as the reader scrolls away the jump
 * button activates and new content no longer moves the scroll position.
 *
 * Attributes the upstream class strings hang off:
 *   data-autoscrolling   on the viewport while THIS module is scrolling it
 *   data-pending-scroll  on the viewport until the first jump to the edge landed
 *                        (upstream keeps it invisible so the jump is never seen)
 *   data-active          on the button while the viewport is away from the edge
 *
 * Integration API:
 *   in    CustomEvent 'message-scroller:scroll' on the root — jumps to the edge
 *   out   CustomEvent 'message-scroller:scrolled' { atBottom } (bubbles: true)
 */
export default function MessageScrollerModule(node) {
  const viewport = node.querySelector('[data-slot="message-scroller-viewport"]');
  const content = node.querySelector('[data-slot="message-scroller-content"]');
  const button = node.querySelector('[data-slot="message-scroller-button"]');
  if (!viewport || !content) return () => {};

  const toStart = node.dataset.direction === 'start';
  const threshold = Number.parseInt(node.dataset.threshold, 10) || 24;
  const cleanups = [];
  let stuck = true;
  let autoScrollTimer = null;

  const on = (target, type, handler, options) => {
    target.addEventListener(type, handler, options);
    cleanups.push(() => target.removeEventListener(type, handler, options));
  };

  viewport.id = viewport.id || uid('message-scroller-viewport');
  viewport.setAttribute('role', 'log');
  viewport.setAttribute('aria-live', 'polite');
  viewport.dataset.pendingScroll = '';

  function atEdge() {
    if (toStart) return viewport.scrollTop <= threshold;
    return viewport.scrollHeight - viewport.clientHeight - viewport.scrollTop <= threshold;
  }

  function syncButton() {
    if (button) button.dataset.active = stuck ? 'false' : 'true';
  }

  function jump(behavior) {
    viewport.dataset.autoscrolling = '';
    viewport.scrollTo({ top: toStart ? 0 : viewport.scrollHeight, behavior });
    clearTimeout(autoScrollTimer);
    // No scrollend in every supported browser: drop the flag once the smooth
    // scroll has had time to land (instant jumps clear it on the next tick).
    autoScrollTimer = setTimeout(
      () => {
        delete viewport.dataset.autoscrolling;
      },
      behavior === 'smooth' ? 400 : 0
    );
  }

  function announce() {
    node.dispatchEvent(
      new CustomEvent('message-scroller:scrolled', { bubbles: true, detail: { atBottom: stuck } })
    );
  }

  on(viewport, 'scroll', () => {
    // A programmatic jump is not the reader scrolling away: ignore it.
    if (viewport.dataset.autoscrolling !== undefined) return;
    const next = atEdge();
    if (next === stuck) return;
    stuck = next;
    syncButton();
    announce();
  });

  if (button) {
    on(button, 'click', () => {
      stuck = true;
      syncButton();
      jump('smooth');
      announce();
    });
  }
  on(node, 'message-scroller:scroll', () => {
    stuck = true;
    syncButton();
    jump('smooth');
  });

  // New or resized content keeps the viewport pinned only while it is stuck.
  const observer = new MutationObserver(() => {
    if (stuck) jump('auto');
  });
  observer.observe(content, { childList: true, subtree: true, characterData: true });

  // First paint: land on the edge before the viewport becomes visible.
  requestAnimationFrame(() => {
    jump('auto');
    stuck = atEdge();
    syncButton();
    delete viewport.dataset.pendingScroll;
  });

  return () => {
    observer.disconnect();
    clearTimeout(autoScrollTimer);
    cleanups.forEach((fn) => fn());
    delete viewport.dataset.autoscrolling;
    delete viewport.dataset.pendingScroll;
  };
}
