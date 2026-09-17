import { closeWithAnimation, setState } from '../../../../js/common/dataState';
import { subscribe, toast } from '../../../../js/common/toast';
import { uid } from '../../../../js/common/uid';

/**
 * Toast renderer for the `sonner` port: reconciles the store in
 * src/js/common/toast.js into the [data-slot="sonner-list"] region.
 *
 * The toast and icon markup is cloned from the two <template>s in sonner.twig,
 * so every Tailwind class stays in the template (nothing is built from strings
 * here). Timers pause while the pointer is over the list; `loading` toasts never
 * auto-dismiss. Swipe-to-dismiss is not implemented (no drag library, ADR 0002).
 *
 * Integration API:
 *   in    CustomEvent 'toast:show' on document — { message, type?, description?, duration? }
 *   out   CustomEvent 'sonner:shown' / 'sonner:dismissed' (bubbles: true) { id, type }
 *   hooks [data-sonner-show] anywhere in the page, reading data-sonner-message /
 *         data-sonner-type / data-sonner-description / data-sonner-duration
 *   also  the imperative `toast()` API from src/js/common/toast.js
 *
 * One renderer per position: the store is global, so a second toaster pinned to
 * the same corner would stack the same toasts pixel-on-pixel. Later toasters at
 * an already-claimed position stay inert; their [data-sonner-show] triggers keep
 * working, since that hook is document-wide.
 */
const owners = new Map();
// The 'toast:show' / [data-sonner-show] hooks are document-wide: exactly one
// toaster binds them, whichever renderer mounted first.
let hookOwner = null;

export default function SonnerModule(node) {
  const position = node.dataset.position || 'bottom-right';
  const claimed = owners.get(position);
  if (claimed && claimed.isConnected && claimed !== node) return () => {};
  owners.set(position, node);
  const list = node.querySelector('[data-slot="sonner-list"]');
  const toastTemplate = node.querySelector('[data-slot="sonner-toast-template"]');
  const iconTemplate = node.querySelector('[data-slot="sonner-icons"]');
  if (!list || !toastTemplate) return () => {};

  const defaultDuration = Number.parseInt(node.dataset.duration, 10) || 0;
  const richColors = node.dataset.richColors === 'true';
  const showCloseButton = node.dataset.closeButton !== 'false';

  /** @type {Map<string|number, { el: HTMLElement, timer: number|null, remaining: number, startedAt: number }>} */
  const entries = new Map();
  let paused = false;
  const cleanups = [];

  const on = (target, type, handler, options) => {
    target.addEventListener(type, handler, options);
    cleanups.push(() => target.removeEventListener(type, handler, options));
  };

  function iconFor(type) {
    if (!iconTemplate) return null;
    const source = iconTemplate.content.querySelector(`[data-type="${type}"]`);
    return source ? source.firstElementChild.cloneNode(true) : null;
  }

  function build(item) {
    const el = toastTemplate.content.firstElementChild.cloneNode(true);
    const type = item.type || 'default';
    el.id = uid('sonner-toast');
    el.dataset.type = type;
    el.dataset.richColors = richColors ? 'true' : 'false';
    el.setAttribute('role', type === 'error' ? 'alert' : 'status');

    const icon = iconFor(type);
    const iconSlot = el.querySelector('[data-slot="sonner-icon"]');
    if (icon && iconSlot) iconSlot.appendChild(icon);

    el.querySelector('[data-slot="sonner-title"]').textContent = item.message || '';
    const description = el.querySelector('[data-slot="sonner-description"]');
    if (item.description) {
      description.textContent = item.description;
      description.hidden = false;
    }

    const close = el.querySelector('[data-slot="sonner-close"]');
    if (close) {
      if (showCloseButton) close.addEventListener('click', () => toast.dismiss(item.id));
      else close.remove();
    }
    return el;
  }

  function clearTimer(id) {
    const entry = entries.get(id);
    if (!entry || entry.timer === null) return;
    clearTimeout(entry.timer);
    entry.timer = null;
  }

  function startTimer(id, delay) {
    const entry = entries.get(id);
    if (!entry || delay <= 0) return;
    clearTimer(id);
    entry.remaining = delay;
    entry.startedAt = Date.now();
    entry.timer = setTimeout(() => toast.dismiss(id), delay);
  }

  function pause() {
    if (paused) return;
    paused = true;
    entries.forEach((entry, id) => {
      if (entry.timer === null) return;
      entry.remaining = Math.max(0, entry.remaining - (Date.now() - entry.startedAt));
      clearTimer(id);
    });
  }

  function resume() {
    if (!paused) return;
    paused = false;
    entries.forEach((entry, id) => {
      if (entry.remaining > 0) startTimer(id, entry.remaining);
    });
  }

  function remove(id) {
    const entry = entries.get(id);
    if (!entry) return;
    clearTimer(id);
    entries.delete(id);
    const type = entry.el.dataset.type;
    closeWithAnimation(entry.el, () => {
      entry.el.remove();
      node.dispatchEvent(new CustomEvent('sonner:dismissed', { bubbles: true, detail: { id, type } }));
    });
  }

  /** Reconciles the store snapshot: appends what is new, animates out what is gone. */
  function reconcile(items) {
    const seen = new Set();
    items.forEach((item) => {
      seen.add(item.id);
      if (entries.has(item.id)) return;
      const el = build(item);
      list.appendChild(el);
      setState(el, 'open');
      const delay = item.type === 'loading' ? 0 : (item.duration ?? defaultDuration);
      entries.set(item.id, { el, timer: null, remaining: delay, startedAt: 0 });
      if (!paused) startTimer(item.id, delay);
      node.dispatchEvent(
        new CustomEvent('sonner:shown', { bubbles: true, detail: { id: item.id, type: item.type || 'default' } })
      );
    });
    Array.from(entries.keys()).forEach((id) => {
      if (!seen.has(id)) remove(id);
    });
  }

  const unsubscribe = subscribe(reconcile);

  on(list, 'pointerenter', pause);
  on(list, 'pointerleave', resume);
  on(list, 'focusin', pause);
  on(list, 'focusout', resume);

  if (!hookOwner || !hookOwner.isConnected) {
    hookOwner = node;
    on(document, 'toast:show', (event) => {
      const { message, ...options } = event.detail || {};
      if (message) toast(message, options);
    });
    on(document, 'click', (event) => {
      const trigger = event.target.closest('[data-sonner-show]');
      if (!trigger) return;
      const { sonnerMessage, sonnerType, sonnerDescription, sonnerDuration } = trigger.dataset;
      toast(sonnerMessage || '', {
        type: sonnerType || 'default',
        description: sonnerDescription,
        duration: sonnerDuration ? Number.parseInt(sonnerDuration, 10) : undefined,
      });
    });
  }

  return () => {
    unsubscribe();
    entries.forEach((entry, id) => {
      clearTimer(id);
      entry.el.remove();
    });
    entries.clear();
    cleanups.forEach((fn) => fn());
    if (owners.get(position) === node) owners.delete(position);
    if (hookOwner === node) hookOwner = null;
  };
}
