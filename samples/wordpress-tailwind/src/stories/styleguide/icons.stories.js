import { bindCopy, classBox } from './_helpers';

export default {
  title: 'Styleguide/Icons',
  parameters: { layout: 'fullscreen' },
};

// Icon names derived from the sprite sources, not hardcoded, so the catalog
// never drifts from src/assets/icons/*.svg.
const ICONS = Object.keys(import.meta.glob('../../assets/icons/*.svg'))
  .map((path) => path.match(/([^/]+)\.svg$/)[1])
  .sort();

function iconCard(name) {
  return `
    <div class="overflow-hidden rounded-lg border border-border" data-icon-name="${name}">
      <div class="flex h-20 items-center justify-center bg-muted/40">
        <svg class="size-7 text-foreground" aria-hidden="true" focusable="false">
          <use href="#icon-${name}"></use>
        </svg>
      </div>
      <div class="space-y-2 p-3">
        <div class="text-sm font-medium text-card-foreground">${name}</div>
        ${classBox(`#icon-${name}`)}
      </div>
    </div>`;
}

export const Catalog = {
  render: () => `
    <div class="space-y-4 p-6">
      <div>
        <h2 class="text-xl font-semibold text-foreground">Icons — ${ICONS.length} disponibili</h2>
        <p class="mt-1 max-w-2xl text-sm text-muted-foreground">
          SVG sprite generato da <code class="rounded bg-muted px-1 text-xs">src/assets/icons/*.svg</code>.
          Usa <code class="rounded bg-muted px-1 text-xs">&lt;svg&gt;&lt;use href="#icon-{name}"&gt;&lt;/svg&gt;</code>.
        </p>
      </div>
      <div class="relative max-w-sm">
        <svg
          class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true" focusable="false"
        >
          <use href="#icon-search"></use>
        </svg>
        <input
          id="sg-icon-search"
          type="text"
          placeholder="Cerca icona…"
          aria-label="Cerca icona"
          class="w-full rounded-md border border-input bg-background py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-2 focus:outline-ring"
        />
      </div>
      <p class="text-xs text-muted-foreground" id="sg-icon-count">${ICONS.length} icone</p>
      <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6" id="sg-icon-grid">
        ${ICONS.map(iconCard).join('')}
      </div>
    </div>`,
  play: async ({ canvasElement }) => {
    bindCopy(canvasElement);
    const input = canvasElement.querySelector('#sg-icon-search');
    const countEl = canvasElement.querySelector('#sg-icon-count');
    const allCards = () => [...canvasElement.querySelectorAll('[data-icon-name]')];

    input?.addEventListener('input', () => {
      const q = input.value.trim().toLowerCase();
      let visible = 0;
      allCards().forEach((card) => {
        const match = !q || card.dataset.iconName.includes(q);
        card.style.display = match ? '' : 'none';
        if (match) visible++;
      });
      if (countEl) countEl.textContent = `${visible} icone`;
    });
  },
};
