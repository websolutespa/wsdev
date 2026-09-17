/**
 * Global dismiss-layer stack: one set of document listeners; Escape and
 * outside-pointerdown dismiss the TOPMOST layer only, so nested floating
 * components (menu in popover in dialog) compose correctly.
 */
const layers = [];
let bound = false;

function onKeydown(event) {
  if (event.key !== 'Escape' || layers.length === 0) return;
  const layer = layers[layers.length - 1];
  if (!layer.escape) return;
  event.preventDefault();
  layer.onDismiss('escape');
}

function onPointerDown(event) {
  if (layers.length === 0) return;
  const layer = layers[layers.length - 1];
  if (!layer.outsideClick) return;
  if (layer.exclude.some((node) => node && node.contains(event.target))) return;
  layer.onDismiss('outside');
}

function bind() {
  if (bound) return;
  document.addEventListener('keydown', onKeydown, true);
  document.addEventListener('pointerdown', onPointerDown, true);
  bound = true;
}

/**
 * @param {{ onDismiss: (reason: 'escape'|'outside') => void, outsideClick?: boolean, escape?: boolean, exclude?: Element[] }} options
 * @returns {() => void} release
 */
export function pushDismissLayer({ onDismiss, outsideClick = true, escape = true, exclude = [] }) {
  bind();
  const layer = { onDismiss, outsideClick, escape, exclude };
  layers.push(layer);
  return function release() {
    const index = layers.indexOf(layer);
    if (index !== -1) layers.splice(index, 1);
  };
}
