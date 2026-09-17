import { uid } from '../../../../js/common/uid';

/**
 * Resizable panel group — WAI-ARIA APG window splitter, one focusable
 * separator per adjacent panel pair. Each panel owns a `--panel-size`
 * (a flex-grow share, percent-like); a drag or a key press moves size from
 * one panel of the pair to the other, so the shares always sum to 100 and
 * the group never overflows.
 *
 * Integration API:
 *   in    CustomEvent 'resizable:set' ({ detail: { sizes: Number[] } }) on the root
 *   out   CustomEvent 'resizable:change' ({ detail: { sizes } }, bubbles: true)
 *   hooks data-panel-group-direction on the root; data-min-size / data-max-size
 *         per panel; --panel-size per panel (also the SSR value)
 *
 * Keyboard (on a handle): ArrowLeft/ArrowRight (horizontal group) or
 * ArrowUp/ArrowDown (vertical) move by STEP, Shift for a coarse step;
 * Home/End collapse the pair to the leading/trailing bound.
 */
const STEP = 2;
const COARSE_STEP = 10;

export default function ResizableModule(node) {
  const panels = Array.from(node.querySelectorAll(':scope > [data-slot="resizable-panel"]'));
  const handles = Array.from(node.querySelectorAll(':scope > [data-slot="resizable-handle"]'));
  if (panels.length < 2 || !handles.length) return () => {};

  const cleanups = [];
  const on = (target, type, handler, options) => {
    target.addEventListener(type, handler, options);
    cleanups.push(() => target.removeEventListener(type, handler, options));
  };

  const isVertical = node.dataset.panelGroupDirection === 'vertical';
  const sizes = panels.map((panel) => parseFloat(panel.style.getPropertyValue('--panel-size')) || 0);
  const minSizes = panels.map((panel) => parseFloat(panel.dataset.minSize ?? '10'));
  const maxSizes = panels.map((panel) => parseFloat(panel.dataset.maxSize ?? '90'));

  // Hoisted declarations: applySizes(), pairBounds() and emitChange() call each other.
  function pairBounds(index) {
    // The pair (index, index + 1) shares a constant total, so each panel's own
    // min/max also bounds the other one.
    const total = sizes[index] + sizes[index + 1];
    return {
      total,
      min: Math.max(minSizes[index], total - maxSizes[index + 1]),
      max: Math.min(maxSizes[index], total - minSizes[index + 1]),
    };
  }

  function emitChange() {
    node.dispatchEvent(new CustomEvent('resizable:change', {
      bubbles: true,
      detail: { sizes: sizes.slice() },
    }));
  }

  function applySizes() {
    panels.forEach((panel, i) => {
      panel.style.setProperty('--panel-size', String(sizes[i]));
    });
    handles.forEach((handle, i) => {
      const { min, max } = pairBounds(i);
      handle.setAttribute('aria-valuenow', String(Math.round(sizes[i])));
      handle.setAttribute('aria-valuemin', String(Math.round(min)));
      handle.setAttribute('aria-valuemax', String(Math.round(max)));
    });
  }

  /** Sets the leading panel of pair `index` to `value`, the trailing one to the rest. */
  function resizePair(index, value) {
    const { total, min, max } = pairBounds(index);
    const clamped = Math.min(max, Math.max(min, value));
    if (clamped === sizes[index]) return;
    sizes[index] = clamped;
    sizes[index + 1] = total - clamped;
    applySizes();
    emitChange();
  }

  handles.forEach((handle, index) => {
    const leading = panels[index];
    if (!leading.id) leading.id = uid('resizable-panel');
    handle.setAttribute('aria-controls', leading.id);

    let dragging = false;

    on(handle, 'pointerdown', (event) => {
      if (event.button !== 0) return;
      dragging = true;
      handle.setPointerCapture(event.pointerId);
      handle.dataset.dragging = '';
      event.preventDefault();
    });

    on(handle, 'pointermove', (event) => {
      if (!dragging) return;
      // Measure against the pair only: the pointer position inside the two
      // panels maps to the leading panel's share of their common total.
      const groupRect = node.getBoundingClientRect();
      const groupSize = isVertical ? groupRect.height : groupRect.width;
      if (!groupSize) return;
      const leadingRect = leading.getBoundingClientRect();
      const start = isVertical ? leadingRect.top : leadingRect.left;
      const pointer = isVertical ? event.clientY : event.clientX;
      const { total } = pairBounds(index);
      const pairPixels = (total / 100) * groupSize;
      if (pairPixels <= 0) return;
      resizePair(index, ((pointer - start) / pairPixels) * total);
    });

    const endDrag = (event) => {
      if (!dragging) return;
      dragging = false;
      delete handle.dataset.dragging;
      if (handle.hasPointerCapture(event.pointerId)) handle.releasePointerCapture(event.pointerId);
    };
    on(handle, 'pointerup', endDrag);
    on(handle, 'pointercancel', endDrag);

    on(handle, 'dblclick', () => {
      const { total } = pairBounds(index);
      resizePair(index, total / 2);
    });

    on(handle, 'keydown', (event) => {
      const step = event.shiftKey ? COARSE_STEP : STEP;
      const { min, max } = pairBounds(index);
      const decrease = isVertical ? 'ArrowUp' : 'ArrowLeft';
      const increase = isVertical ? 'ArrowDown' : 'ArrowRight';
      let next;
      if (event.key === decrease) next = sizes[index] - step;
      else if (event.key === increase) next = sizes[index] + step;
      else if (event.key === 'Home') next = min;
      else if (event.key === 'End') next = max;
      else return;
      event.preventDefault();
      resizePair(index, next);
    });
  });

  on(node, 'resizable:set', (event) => {
    const next = event.detail && event.detail.sizes;
    if (!Array.isArray(next) || next.length !== sizes.length) return;
    next.forEach((value, i) => {
      if (Number.isFinite(value)) sizes[i] = value;
    });
    applySizes();
    emitChange();
  });

  applySizes();

  return () => {
    cleanups.forEach((fn) => fn());
  };
}
