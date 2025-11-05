import wsVite from '@websolutespa/ws-vite';
import { functions } from './postcss.functions.mjs';
import main from './src/theme/main.json';

export default wsVite({
  paths: {
    src: './src',
    dist: './dist',
    assets: './assets',
    images: './assets/img',
    icons: './assets/icons',
  },
  tailwind: true,
  postcssFunctions: {
    functions,
  },
  twig: {
    globals: {
      ...main,
    },
  },
  icons: true,
  image: true,
  html: {
    prettify: true,
    minify: true,
  },
  accessible: true,
  server: {
    host: 'localhost',
    port: 8000,
  },
});
