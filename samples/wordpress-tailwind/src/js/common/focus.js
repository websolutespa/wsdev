const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

export function getFocusable(root) {
  return Array.from(root.querySelectorAll(FOCUSABLE_SELECTOR)).filter(
    (node) => node.offsetParent !== null || node === document.activeElement
  );
}

export function focusFirst(root) {
  const nodes = getFocusable(root);
  if (nodes[0]) {
    nodes[0].focus();
    return true;
  }
  return false;
}

/** Captures the focused element; the returned function restores focus to it. */
export function saveFocus() {
  const node = document.activeElement;
  return () => {
    if (node && typeof node.focus === 'function' && document.contains(node)) {
      node.focus();
    }
  };
}
