import { createRovingNav } from '../../../../js/common/keynav';

/**
 * Toggle group (single|multiple), WAI-ARIA APG toolbar-of-toggle-buttons
 * pattern. Click/Enter/Space toggles an item (single mode unpresses
 * siblings); roving tabindex + ArrowLeft/ArrowRight (Home/End via keynav.js).
 *
 * Integration API:
 *   out CustomEvent 'toggle-group:change' (bubbles: true) on the root —
 *       single: { value: String|null }; multiple: { values: String[] }
 */
export default function ToggleGroupModule(node) {
  const single = node.dataset.type !== 'multiple';
  const items = () => Array.from(node.querySelectorAll('[data-slot="toggle-group-item"]'));

  const setPressed = (item, pressed) => {
    item.setAttribute('aria-pressed', String(pressed));
    item.setAttribute('data-state', pressed ? 'on' : 'off');
  };

  const emit = () => {
    const pressed = items().filter((el) => el.getAttribute('aria-pressed') === 'true');
    const detail = single
      ? { value: pressed[0] ? pressed[0].value : null }
      : { values: pressed.map((el) => el.value) };
    node.dispatchEvent(new CustomEvent('toggle-group:change', { bubbles: true, detail }));
  };

  const toggle = (item) => {
    if (!item || item.disabled) return;
    const wasPressed = item.getAttribute('aria-pressed') === 'true';
    if (single) {
      items().forEach((el) => setPressed(el, el === item && !wasPressed));
    } else {
      setPressed(item, !wasPressed);
    }
    emit();
  };

  const onClick = (event) => {
    const item = event.target.closest('[data-slot="toggle-group-item"]');
    if (item && node.contains(item)) toggle(item);
  };
  node.addEventListener('click', onClick);

  const nav = createRovingNav(node, {
    itemSelector: '[data-slot="toggle-group-item"]',
    orientation: 'horizontal',
    typeahead: false,
    onActivate: (item) => toggle(item),
  });
  // Roving baseline: first enabled item tabbable, others -1.
  const first = nav.getItems()[0];
  if (first) nav.setActive(first, { focus: false });

  return () => {
    node.removeEventListener('click', onClick);
    nav.destroy();
  };
}
