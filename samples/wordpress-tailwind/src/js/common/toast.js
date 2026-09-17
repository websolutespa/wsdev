/**
 * Toast store (sonner-style imperative API). Pure state: DOM rendering lives
 * in base/sonner/sonner.module.js, which subscribes to this store.
 *
 *   toast('Saved');
 *   toast.success('Saved', { description: '...', action: { label: 'Undo', onClick } });
 *   toast.dismiss(id);
 */
let counter = 0;
const toasts = new Map();
const listeners = new Set();

function emit() {
  const list = Array.from(toasts.values());
  listeners.forEach((fn) => fn(list));
}

export function toast(message, options = {}) {
  const id = options.id ?? ++counter;
  toasts.set(id, { type: 'default', duration: 4000, ...options, id, message });
  emit();
  return id;
}

for (const type of ['success', 'info', 'warning', 'error', 'loading']) {
  toast[type] = (message, options = {}) => toast(message, { ...options, type });
}

toast.dismiss = (id) => {
  if (id === undefined) {
    toasts.clear();
  } else {
    toasts.delete(id);
  }
  emit();
};

export function subscribe(fn) {
  listeners.add(fn);
  fn(Array.from(toasts.values()));
  return () => listeners.delete(fn);
}
