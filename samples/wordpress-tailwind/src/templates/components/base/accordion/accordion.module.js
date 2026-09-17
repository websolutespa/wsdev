import { closeWithAnimation, setState } from '../../../../js/common/dataState';
import { createRovingNav } from '../../../../js/common/keynav';
import { uid } from '../../../../js/common/uid';

/**
 * Accordion (single|multiple) per the WAI-ARIA APG Accordion pattern:
 * heading > button[aria-expanded][aria-controls] + div[role=region][aria-labelledby].
 * Behaviour flags read from the markup:
 *   data-type="single|multiple"  — single closes the open sibling
 *   data-collapsible="false"     — single mode: clicking the open item does not close it
 * Height animation: sets --radix-accordion-content-height (KEPT as-is, PORTING.md
 * Adaptation table — the accordion-down/up keyframes in src/css/shadcn.css reference
 * this exact variable) before flipping data-state, so the entry/exit animation can
 * play; closed panels get the hidden attribute once the exit animation finishes.
 *
 * Integration API:
 *   out CustomEvent 'accordion:change' { value, open } (bubbles: true) on every toggle
 */
export default function AccordionModule(node) {
  const single = node.dataset.type !== 'multiple';
  const collapsible = node.dataset.collapsible !== 'false';
  const cleanups = [];

  const on = (target, type, handler, options) => {
    target.addEventListener(type, handler, options);
    cleanups.push(() => target.removeEventListener(type, handler, options));
  };

  // Direct children only, so a nested accordion inside a panel is untouched.
  const items = () => Array.from(node.querySelectorAll(':scope > [data-slot="accordion-item"]'));
  const partsOf = (item) => ({
    trigger: item.querySelector('[data-slot="accordion-trigger"]'),
    content: item.querySelector('[data-slot="accordion-content"]'),
  });

  // Runtime ARIA wiring (ids generated at init — never in Twig).
  items().forEach((item) => {
    const { trigger, content } = partsOf(item);
    if (!trigger || !content) return;
    trigger.id = trigger.id || uid('accordion-trigger');
    content.id = content.id || uid('accordion-content');
    trigger.setAttribute('aria-controls', content.id);
    content.setAttribute('aria-labelledby', trigger.id);
  });

  const openItem = (item) => {
    const { trigger, content } = partsOf(item);
    content.hidden = false;
    // Measure first, then flip state: accordion-down animates 0 -> var(...).
    content.style.setProperty('--radix-accordion-content-height', `${content.scrollHeight}px`);
    setState(item, 'open');
    setState(trigger, 'open');
    setState(content, 'open');
    trigger.setAttribute('aria-expanded', 'true');
  };

  const closeItem = (item) => {
    const { trigger, content } = partsOf(item);
    content.style.setProperty('--radix-accordion-content-height', `${content.scrollHeight}px`);
    setState(item, 'closed');
    setState(trigger, 'closed');
    trigger.setAttribute('aria-expanded', 'false');
    closeWithAnimation(content, () => {
      // Guard against a reopen racing the exit animation's timeout fallback.
      if (content.dataset.state === 'closed') content.hidden = true;
    });
  };

  const emit = (value, open) => {
    node.dispatchEvent(new CustomEvent('accordion:change', { bubbles: true, detail: { value, open } }));
  };

  const toggle = (trigger) => {
    if (!trigger || trigger.disabled) return;
    const item = trigger.closest('[data-slot="accordion-item"]');
    const isOpen = trigger.getAttribute('aria-expanded') === 'true';
    if (isOpen) {
      if (single && !collapsible) return; // keep the last open item open
      closeItem(item);
      emit(trigger.dataset.value, false);
      return;
    }
    if (single) {
      items().forEach((sibling) => {
        if (sibling !== item && sibling.dataset.state === 'open') closeItem(sibling);
      });
    }
    openItem(item);
    emit(trigger.dataset.value, true);
  };

  on(node, 'click', (event) => {
    const trigger = event.target.closest('[data-slot="accordion-trigger"]');
    if (trigger && trigger.closest('[data-slot="accordion"]') === node) toggle(trigger);
  });

  // ArrowUp/Down/Home/End across triggers (APG). Buttons handle Enter/Space
  // natively, but keynav swallows them via preventDefault — onActivate clicks.
  const nav = createRovingNav(node, {
    itemSelector: '[data-slot="accordion-trigger"]',
    orientation: 'vertical',
    loop: false,
    mode: 'roving',
    typeahead: false,
    bindKeys: true,
    onActivate: (item) => item.click(),
  });

  return () => {
    nav.destroy();
    cleanups.forEach((fn) => fn());
  };
}
