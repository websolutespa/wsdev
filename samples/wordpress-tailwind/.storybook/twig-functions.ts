/**
 * Mirror of the Twig functions registered by ws-vite's twig plugin
 * (node_modules/@websolutespa/ws-vite/src/plugins/twig.js + helpers/).
 * Build pipeline and Storybook share the same twig.js engine; these functions
 * are the only configuration to keep in sync (see docs/adr/0004-storybook-twigjs.md).
 */

function isCollection(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function collectionToString(className: Record<string, unknown>): string {
  return Object.keys(className)
    .filter((key) => key !== '_keys' && Boolean(className[key]))
    .join(' ');
}

export function classNames(...props: unknown[]): string {
  let out = '';
  for (const value of props) {
    if (!value) continue;
    out += ' ' + (isCollection(value) ? collectionToString(value) : String(value).trim());
  }
  return out.trim();
}

export function entries(object: Record<string, unknown>) {
  return Object.entries(object);
}

export function htmlEncode(html: unknown): string {
  return String(html)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function htmlDecode(html: unknown): string {
  return String(html)
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, '\'')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

export function icon(name: string): string {
  return `<svg class="icon icon--${name}" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink"><use xlink:href="#icon-${name}"></use></svg>`;
}

/**
 * Simplified stand-in for ws-vite's image() (which rewrites srcs through the
 * Sharp pipeline). Mock data in this boilerplate uses plain URLs via the
 * base/media component, so a plain <img> is enough for stories.
 */
export function image(userOptions: Record<string, unknown> = {}): string {
  const options: Record<string, unknown> = { alt: 'picture', loading: 'lazy', ...userOptions };
  const attrs = ['src', 'srcset', 'sizes', 'width', 'height', 'loading', 'alt']
    .filter((k) => options[k] !== undefined)
    .map((k) => `${k}="${options[k]}"`)
    .join(' ');
  return `<img ${attrs}>`;
}

export function jsonParse(json: string) {
  return JSON.parse(json);
}

export function jsonStringify(json: unknown) {
  return JSON.stringify(json, null, 2);
}

function toCharCase(value: string): string {
  return value.replace(/([A-Z])/g, '-$1').toLowerCase();
}

export function style(styleObject: Record<string, unknown>): string {
  return Object.entries(styleObject)
    .filter(([k]) => k !== '_keys')
    .map(([k, v]) => `${toCharCase(k)}:${v};`)
    .join(' ');
}

export const twigFunctions = {
  classNames,
  entries,
  htmlDecode,
  htmlEncode,
  icon,
  image,
  jsonParse,
  jsonStringify,
  style,
};
