import './slider.css';

/**
 * Slider: native <input type="range">(s) do all the interaction work (drag,
 * click-to-jump for a single thumb, arrow/Home/End/PageUp/PageDown keys, form
 * submission); this module only paints the filled `slider-range` div
 * (--slider-from / --slider-to percentages, see slider.css) and, for a
 * 2-thumb range, clamps each thumb so it cannot cross the other.
 *
 * Integration API:
 *   out CustomEvent 'slider:change' { values: Number[] } (bubbles: true) on every input
 */
export default function SliderModule(node) {
  const thumbs = Array.from(node.querySelectorAll('[data-slot="slider-thumb"]'));
  const range = node.querySelector('[data-slot="slider-range"]');
  if (!thumbs.length) return () => {};

  const min = parseFloat(thumbs[0].min || '0');
  const max = parseFloat(thumbs[0].max || '100');
  const step = parseFloat(thumbs[0].step || '1');
  const isRange = thumbs.length > 1;
  const cleanups = [];

  const on = (target, type, handler, options) => {
    target.addEventListener(type, handler, options);
    cleanups.push(() => target.removeEventListener(type, handler, options));
  };

  const percentOf = (value) => (max > min ? ((value - min) / (max - min)) * 100 : 0);

  function paint() {
    if (!range) return;
    const values = thumbs.map((t) => parseFloat(t.value));
    if (isRange) {
      range.style.setProperty('--slider-from', `${percentOf(Math.min(...values))}%`);
      range.style.setProperty('--slider-to', `${percentOf(Math.max(...values))}%`);
    } else {
      range.style.setProperty('--slider-value', `${percentOf(values[0])}%`);
    }
  }

  function emit() {
    node.dispatchEvent(
      new CustomEvent('slider:change', {
        bubbles: true,
        detail: { values: thumbs.map((t) => parseFloat(t.value)) },
      })
    );
  }

  // Keeps the two thumbs of a range from crossing: the lower thumb is clamped
  // to (upper - step) and vice versa, mirroring Radix's own SliderPrimitive
  // multi-thumb behaviour.
  function clamp(index) {
    if (!isRange) return;
    const value = parseFloat(thumbs[index].value);
    const other = thumbs[index === 0 ? 1 : 0];
    const otherValue = parseFloat(other.value);
    if (index === 0 && value > otherValue - step) thumbs[index].value = String(Math.max(min, otherValue - step));
    if (index === 1 && value < otherValue + step) thumbs[index].value = String(Math.min(max, otherValue + step));
  }

  thumbs.forEach((thumb, index) => {
    on(thumb, 'input', () => {
      clamp(index);
      paint();
      emit();
    });
  });

  paint();

  return () => cleanups.forEach((fn) => fn());
}
