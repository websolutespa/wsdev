import wsVite from '@websolutespa/ws-vite';
import main from './src/theme/main.json';
import theme from './src/theme/theme.json';

export default wsVite({
  paths: {
    src: './src',
    dist: './dist',
    assets: './src/assets',
    icons: './src/assets/icons',
  },
  theme,
  /*
  twig: {
    globals: {
      ...main,
      theme,
    },
  },
  */
  liquid: {
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
