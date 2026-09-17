/**
 * Two-state toggle button (WAI-ARIA APG "Button" toggle pattern): each click
 * flips aria-pressed and data-state ("on"/"off") so the upstream
 * data-[state=on]: classes apply. Native [disabled] already blocks clicks;
 * the guard also covers programmatic dispatch.
 *
 * Integration API:
 *   out CustomEvent 'toggle:change' { pressed: Boolean } (bubbles: true) on the root
 */
export default function ToggleModule(node) {
  const onClick = () => {
    if (node.disabled) return;
    const pressed = node.getAttribute('aria-pressed') === 'true';
    node.setAttribute('aria-pressed', String(!pressed));
    node.setAttribute('data-state', pressed ? 'off' : 'on');
    node.dispatchEvent(new CustomEvent('toggle:change', { bubbles: true, detail: { pressed: !pressed } }));
  };
  node.addEventListener('click', onClick);
  return () => node.removeEventListener('click', onClick);
}
