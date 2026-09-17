let n = 0;

/** Counter-based unique id, collision-free within a page lifecycle. */
export function uid(prefix = 'ws') {
  return `${prefix}-${++n}`;
}
