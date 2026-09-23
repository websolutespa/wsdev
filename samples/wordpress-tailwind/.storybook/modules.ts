/**
 * Deterministic data-module init for stories.
 * Same contract as src/js/common/lazyLoad.js (`export default (node) => dispose`)
 * but synchronous discovery — no IntersectionObserver — so play() functions can
 * await a fully initialized component.
 */
const MODULES = import.meta.glob('../src/templates/components/**/*.module.js');

export async function initModules(root: HTMLElement): Promise<() => void> {
  const disposers: Array<() => void> = [];
  for (const node of Array.from(root.querySelectorAll<HTMLElement>('[data-module]:not(.init)'))) {
    const key = node.dataset.module!;
    const entry = Object.entries(MODULES).find(([k]) => k.includes(`/${key}`));
    if (!entry) {
      console.warn(`[storybook/modules] no module found for data-module="${key}"`);
      continue;
    }
    const mod = (await entry[1]()) as { default: (node: HTMLElement) => (() => void) | void };
    const dispose = mod.default(node);
    node.classList.add('init');
    if (typeof dispose === 'function') {
      disposers.push(dispose);
    }
  }
  return () => disposers.forEach((d) => d());
}
