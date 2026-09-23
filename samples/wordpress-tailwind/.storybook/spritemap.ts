/**
 * In the app, ws-vite's `virtual:spritemap` injects the SVG sprite. That
 * virtual module only exists inside the ws-vite pipeline, so Storybook builds
 * an equivalent sprite from the same source SVGs (flat dir → id "icon-<name>",
 * matching ws-vite's 'icon-[dir]-[name]' pattern).
 */
const icons = import.meta.glob('../src/assets/icons/*.svg', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

export function injectSpritemap() {
  if (document.getElementById('sb-spritemap')) {
    return;
  }
  const symbols = Object.entries(icons)
    .map(([path, svg]) => {
      const name = path.split('/').pop()!.replace('.svg', '');
      const clean = svg.slice(svg.indexOf('<svg')); // strip license comments
      // Root-tag width/height would force <use> to the intrinsic size and clip the
      // icon; ws-vite's virtual:spritemap drops them too.
      const openEnd = clean.indexOf('>');
      const open = clean.slice(0, openEnd).replace(/\s(?:width|height)="[^"]*"/g, '');
      return (open + clean.slice(openEnd))
        .replace('<svg', `<symbol id="icon-${name}"`)
        .replace('</svg>', '</symbol>');
    })
    .join('');
  const host = document.createElement('div');
  host.id = 'sb-spritemap';
  host.style.display = 'none';
  host.setAttribute('aria-hidden', 'true');
  host.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg">${symbols}</svg>`;
  document.body.prepend(host);
}
