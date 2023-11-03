/**
 * Simple object check.
 * @param item
 * @returns {boolean}
 */
export function isObject(item: unknown): boolean {
  return item !== undefined && typeof item === 'object' && !Array.isArray(item);
}

/**
 * Deep merge two objects.
 * @param target
 * @param ...sources
 */
export function deepMerge<T, R = T>(target: Partial<T>, source: Partial<R>): T & R {
  const output: { [key: string]: unknown } = { ...target };
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach((key) => {
      const r: keyof R = key as any;
      const t: keyof T = key as any;
      if (isObject(source[r])) {
        if (!(key in target)) {
          Object.assign(output, { [key]: source[r] });
        } else {
          output[key] = deepMerge(target[t] as any, source[r] as any);
        }
      } else {
        Object.assign(output, { [key]: source[r] });
      }
    });
  }
  return output as T & R;
}
