/**
 * registry.mjs — shadcn/ui registry HTTP client with an on-disk cache.
 *
 * Every item is fetched from `https://ui.shadcn.com/r/styles/<style>/<name>.json`
 * and cached at `<sampleRoot>/.cache/registry/<style>/<name>.json`. Callers pass
 * `{ refresh: true }` to bypass a cache hit and re-download.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { registryCacheDir } from './paths.mjs';

/** Registry style in effect for the whole run, overridable via SHADCN_STYLE. */
export const DEFAULT_STYLE = process.env.SHADCN_STYLE ?? 'new-york-v4';

/**
 * @param {string} name - registry item name (e.g. "button")
 * @param {string} [style]
 * @returns {string} the registry item URL
 */
export function registryUrl(name, style = DEFAULT_STYLE) {
  return `https://ui.shadcn.com/r/styles/${style}/${name}.json`;
}

/**
 * Downloads (or reads from cache) one registry item.
 * @param {string} sampleRoot
 * @param {string} name
 * @param {{ style?: string, refresh?: boolean }} [opts]
 * @returns {Promise<object>} the parsed registry item JSON
 */
export async function fetchRegistryItem(sampleRoot, name, opts = {}) {
  const style = opts.style ?? DEFAULT_STYLE;
  const dir = registryCacheDir(sampleRoot, style);
  const cacheFile = join(dir, `${name}.json`);

  if (!opts.refresh && existsSync(cacheFile)) {
    return JSON.parse(readFileSync(cacheFile, 'utf8'));
  }

  const url = registryUrl(name, style);
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`GET ${url} failed: ${res.status} ${res.statusText}`);
  }
  const json = await res.json();

  mkdirSync(dir, { recursive: true });
  writeFileSync(cacheFile, JSON.stringify(json, null, 2), 'utf8');
  return json;
}

/**
 * Checks whether a registry item exists, trying HEAD first and falling back
 * to GET (some hosts answer HEAD incorrectly for statically-served JSON).
 * @param {string} name
 * @param {{ style?: string }} [opts]
 * @returns {Promise<{ ok: boolean, status: number, error?: string }>}
 */
export async function probeRegistryItem(name, opts = {}) {
  const style = opts.style ?? DEFAULT_STYLE;
  const url = registryUrl(name, style);
  try {
    const head = await fetch(url, { method: 'HEAD' });
    if (head.ok) return { ok: true, status: head.status };
    const get = await fetch(url, { method: 'GET' });
    return { ok: get.ok, status: get.status };
  } catch (err) {
    return { ok: false, status: 0, error: String(err?.message ?? err) };
  }
}

/**
 * Runs `probeRegistryItem` over a list of names with bounded concurrency.
 * @param {string[]} names
 * @param {{ style?: string, concurrency?: number }} [opts]
 * @returns {Promise<Array<{ name: string, ok: boolean, status: number, error?: string }>>}
 */
export async function probeAll(names, opts = {}) {
  const concurrency = opts.concurrency ?? 6;
  const queue = [...names];
  const results = [];

  async function worker() {
    for (;;) {
      const name = queue.shift();
      if (name === undefined) return;
      const result = await probeRegistryItem(name, opts);
      results.push({ name, ...result });
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, names.length) }, worker));
  return results;
}
