import { toCharCase } from './babelcase.js';

export function getStyle(style) {
  const styles = Object.entries(style).filter(([k, v]) => k !== '_keys').map(([k, v]) => [toCharCase(k), v]);
  return styles.map(x => `${x[0]}:${x[1]};`).join(' ');
}
