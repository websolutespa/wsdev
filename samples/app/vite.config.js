import wsVite from '@websolutespa/ws-vite';
import main from './src/theme/main.json';
import theme from './src/theme/theme.json';

export default wsVite({
  paths: {
    src: './src',
    dist: './dist',
    assets: './assets',
    images: './assets/img',
    icons: './assets/icons',
  },
  theme,
  twig: {
    globals: {
      ...main,
      theme,
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
