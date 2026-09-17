import { closeWithAnimation, setState } from '../../../../js/common/dataState';
import { uid } from '../../../../js/common/uid';

/**
 * Disclosure widget (WAI-ARIA APG "Disclosure" pattern): a native button
 * toggles the visibility of a content panel. Enter/Space come for free from
 * the <button>; the module owns aria-expanded/aria-controls and mirrors
 * data-state="open|closed" on root, trigger and content so any consumer-added
 * transition classes work. The panel is hidden only AFTER the exit animation
 * (closeWithAnimation — instant when no animation is defined).
 *
 * Integration API:
 *   in    CustomEvent 'collapsible:open' / 'collapsible:close' / 'collapsible:toggle'
 *         on the component root
 *   out   CustomEvent 'collapsible:opened' / 'collapsible:closed' (bubbles: true)
 *   hooks [data-collapsible-trigger] inside the component (click toggles)
 */
export default function CollapsibleModule(node) {
  const content = node.querySelector('[data-slot="collapsible-content"]');
  const trigger = node.querySelector('[data-collapsible-trigger]');
  if (!content) return () => {};
  const cleanups = [];

  const on = (target, type, handler, options) => {
    target.addEventListener(type, handler, options);
    cleanups.push(() => target.removeEventListener(type, handler, options));
  };

  const syncTrigger = (state) => {
    if (!trigger) return;
    setState(trigger, state);
    trigger.setAttribute('aria-expanded', state === 'open' ? 'true' : 'false');
  };

  // Runtime ARIA wiring (ids generated only when Twig didn't receive them).
  if (trigger) {
    content.id = content.id || uid('collapsible-content');
    trigger.setAttribute('aria-controls', content.id);
  }
  syncTrigger(node.dataset.state || 'closed');

  const open = () => {
    if (node.dataset.state === 'open') return;
    content.hidden = false;
    setState(node, 'open');
    setState(content, 'open');
    syncTrigger('open');
    node.dispatchEvent(new CustomEvent('collapsible:opened', { bubbles: true }));
  };

  const close = () => {
    if (node.dataset.state === 'closed') return;
    setState(node, 'closed');
    syncTrigger('closed');
    closeWithAnimation(content, () => {
      // Re-opened mid-animation: leave the panel visible.
      if (content.dataset.state !== 'closed') return;
      content.hidden = true;
      node.dispatchEvent(new CustomEvent('collapsible:closed', { bubbles: true }));
    });
  };

  const toggle = () => (node.dataset.state === 'open' ? close() : open());

  on(node, 'click', (event) => {
    const hit = event.target.closest('[data-collapsible-trigger]');
    // Ignore triggers of nested collapsibles bubbling through this root.
    if (hit && hit.closest('[data-slot="collapsible"]') === node) toggle();
  });
  on(node, 'collapsible:open', open);
  on(node, 'collapsible:close', close);
  on(node, 'collapsible:toggle', toggle);

  return () => cleanups.forEach((fn) => fn());
}
