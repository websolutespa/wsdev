import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import wsVite from '@websolutespa/ws-vite';
import main from './src/theme/main.json';
import docsManifest from './src/docs/components.twig.json';

const rootDir = fileURLToPath(new URL('.', import.meta.url));

// main.schema.json requires layout.labels as an array of {id, text}; derive a
// keyed map here so templates can do labels['some.id'] instead of a linear scan.
const labels = Object.fromEntries(main.layout.labels.map((label) => [label.id, label.text]));

// docsManifest.docs (the components docs group manifest, registered by
// register-docs.mjs) is exposed globally so the per-group pages under
// src/docs/components/<group>.twig can read it too — only its own "page" key
// stays local (paired automatically with components.twig by vituum), which is
// why this imports the "docs" key only, not the whole file, into globals.
const docs = docsManifest.docs;

export default wsVite({
  paths: {
    src: './src',
    dist: './dist',
    assets: './assets',
    images: './assets/img',
    icons: './assets/icons',
  },
  // Tailwind v4 CSS-first (ws-vite wraps @tailwindcss/vite): tokens and @source live in src/css/globals.css.
  tailwind: true,
  twig: {
    namespaces: { components: './src/templates/components' },
    root: './src/templates',
    // vituum's processData globs these with FastGlob's default cwd (the vite
    // process's cwd, i.e. this sample's root) but then resolves each match
    // against vite's own root (./src) — the two only agree when the patterns
    // are absolute, so plain './theme/**/*.json' silently matches nothing.
    data: [resolve(rootDir, 'src/theme/**/*.json'), resolve(rootDir, 'src/templates/components/**/*.twig.json')],
    globals: { ...main, labels, docs },
  },
  icons: true,
  image: true,
  html: {
    prettify: true,
    minify: false,
  },
  accessible: true,
  server: {
    host: 'localhost',
    port: 8000,
  },
});
