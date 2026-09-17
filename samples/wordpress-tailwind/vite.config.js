import wsVite from '@websolutespa/ws-vite';
import main from './src/theme/main.json';

// main.schema.json requires layout.labels as an array of {id, text}; derive a
// keyed map here so templates can do labels['some.id'] instead of a linear scan.
const labels = Object.fromEntries(main.layout.labels.map((label) => [label.id, label.text]));

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
    data: ['./theme/**/*.json', './templates/components/**/*.twig.json'],
    globals: { ...main, labels },
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
