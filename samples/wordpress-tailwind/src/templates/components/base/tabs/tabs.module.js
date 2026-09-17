import { createRovingNav } from '../../../../js/common/keynav';
import { uid } from '../../../../js/common/uid';

/**
 * Tabs per the WAI-ARIA APG pattern: roving tabindex on the triggers,
 * arrow-key navigation (axis from [data-orientation]), Home/End, and
 * automatic|manual activation ([data-activation-mode], matching Radix's own
 * TabsPrimitive.Root prop/values — automatic activates the tab that receives
 * arrow-key focus, manual waits for Enter/Space or click).
 * Wires tab <-> panel aria-controls/aria-labelledby at init via uid().
 *
 * Integration API:
 *   out CustomEvent 'tabs:change' { value } (bubbles: true) on every activation
 */
export default function TabsModule(node) {
  const list = node.querySelector('[data-slot="tabs-list"]');
  if (!list) return () => {};

  const triggers = Array.from(list.querySelectorAll('[role="tab"]'));
  // Direct panels only — keeps nested tabs instances independent.
  const panels = Array.from(node.querySelectorAll('[data-slot="tabs-content"]')).filter(
    (panel) => panel.closest('[data-slot="tabs"]') === node
  );
  const panelFor = (value) => panels.find((panel) => panel.dataset.value === value);

  // Runtime ARIA wiring (ids generated only when Twig didn't receive them).
  triggers.forEach((tab) => {
    const panel = panelFor(tab.dataset.value);
    if (!panel) return;
    tab.id = tab.id || uid('tabs-trigger');
    panel.id = panel.id || uid('tabs-content');
    tab.setAttribute('aria-controls', panel.id);
    panel.setAttribute('aria-labelledby', tab.id);
  });

  const initiallyActive = triggers.find((tab) => tab.dataset.state === 'active');
  let currentValue = initiallyActive ? initiallyActive.dataset.value : null;

  const activate = (value) => {
    if (value == null || value === currentValue) return;
    currentValue = value;
    triggers.forEach((tab) => {
      const active = tab.dataset.value === value;
      tab.setAttribute('data-state', active ? 'active' : 'inactive');
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
    });
    panels.forEach((panel) => {
      const active = panel.dataset.value === value;
      panel.setAttribute('data-state', active ? 'active' : 'inactive');
      panel.hidden = !active;
    });
    node.dispatchEvent(new CustomEvent('tabs:change', { bubbles: true, detail: { value } }));
  };

  const nav = createRovingNav(list, {
    itemSelector: '[role="tab"]',
    orientation: node.dataset.orientation === 'vertical' ? 'vertical' : 'horizontal',
    typeahead: false,
    onFocusChange: (tab) => {
      if (node.dataset.activationMode !== 'manual') activate(tab.dataset.value);
    },
    onActivate: (tab) => activate(tab.dataset.value),
  });

  const onClick = (event) => {
    const tab = event.target.closest('[role="tab"]');
    if (!tab || !list.contains(tab) || tab.disabled) return;
    activate(tab.dataset.value);
    nav.setActive(tab, { focus: false });
  };
  list.addEventListener('click', onClick);

  // Roving baseline; falls back to the first enabled tab when the SSR default
  // is disabled or matches no item.
  const startTab = initiallyActive && !initiallyActive.disabled ? initiallyActive : nav.getItems()[0];
  if (startTab) {
    if (startTab !== initiallyActive) activate(startTab.dataset.value);
    nav.setActive(startTab, { focus: false });
  }

  return () => {
    list.removeEventListener('click', onClick);
    nav.destroy();
  };
}
