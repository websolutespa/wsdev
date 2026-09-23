/**
 * paths.mjs — sample-root discovery and shared path layout for shadcn-port.
 *
 * Uses the same root marker as the sibling figma-tokens skill: the nearest
 * ancestor directory that has BOTH package.json and src/css/globals.css.
 * Every other path used by the shadcn-port scripts is derived from that root.
 */
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Walk up from `start` to the nearest directory containing both
 * `package.json` and `src/css/globals.css`.
 * @param {string} start - directory to start the search from
 * @returns {string|null} the sample root, or null if none was found
 */
export function findSampleRoot(start) {
  let dir = start;
  for (;;) {
    if (existsSync(join(dir, 'package.json')) && existsSync(join(dir, 'src', 'css', 'globals.css'))) {
      return dir;
    }
    const parent = dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}

/**
 * Resolves the sample root for a script, given its own `import.meta.url`.
 * Throws a descriptive error (rather than returning null) since every CLI
 * entry point needs a root to do anything useful.
 * @param {string} importMetaUrl - the calling script's `import.meta.url`
 * @returns {string} the sample root
 */
export function sampleRootFromScript(importMetaUrl) {
  const start = dirname(fileURLToPath(importMetaUrl));
  const root = findSampleRoot(start);
  if (!root) {
    throw new Error(
      `Could not find the sample root above ${start} (looked for a directory with both package.json and src/css/globals.css).`,
    );
  }
  return root;
}

/**
 * Paths inside the shadcn-port skill folder, relative to a sample root.
 * @param {string} sampleRoot
 */
export function skillPaths(sampleRoot) {
  const skillRoot = join(sampleRoot, '.claude', 'skills', 'shadcn-port');
  return {
    skillRoot,
    scriptsDir: join(skillRoot, 'scripts'),
    upstreamDir: join(skillRoot, 'upstream'),
    registryIndexFile: join(skillRoot, 'registry-index.json'),
    adaptationRulesFile: join(skillRoot, 'adaptation-rules.json'),
    referencesDir: join(skillRoot, 'references'),
  };
}

/**
 * @param {string} sampleRoot
 * @param {string} [group] - component group directory (e.g. "base", "blocks")
 */
export function componentsGroupDir(sampleRoot, group = 'base') {
  return join(sampleRoot, 'src', 'templates', 'components', group);
}

/** @param {string} sampleRoot */
export function componentsBaseDir(sampleRoot) {
  return componentsGroupDir(sampleRoot, 'base');
}

/**
 * @param {string} sampleRoot
 * @param {string} name - component directory name
 * @param {string} [group] - component group directory (e.g. "base", "blocks")
 */
export function componentPaths(sampleRoot, name, group = 'base') {
  const dir = join(componentsGroupDir(sampleRoot, group), name);
  return {
    dir,
    twig: join(dir, `${name}.twig`),
    mocks: join(dir, `${name}.twig.json`),
    module: join(dir, `${name}.module.js`),
    css: join(dir, `${name}.css`),
    stories: join(dir, `${name}.stories.js`),
  };
}

/** @param {string} sampleRoot */
export function storiesDir(sampleRoot) {
  return join(sampleRoot, 'src', 'templates', 'stories');
}

/**
 * @param {string} sampleRoot
 * @param {string} style - registry style (e.g. "new-york-v4")
 */
export function registryCacheDir(sampleRoot, style) {
  return join(sampleRoot, '.cache', 'registry', style);
}

/** @param {string} sampleRoot */
export function upstreamExceptionsFile(sampleRoot) {
  return join(sampleRoot, 'scripts', 'upstream-exceptions.json');
}

/** @param {string} sampleRoot */
export function figmaComponentsDir(sampleRoot) {
  return join(sampleRoot, 'tokens', 'figma-components');
}
