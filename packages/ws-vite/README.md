# 🔵 ws-vite

[![npm version](https://badge.fury.io/js/%40websolutespa%2Fws-vite.svg)](https://badge.fury.io/js/%40websolutespa%2Fws-vite)

[![status alpha](https://img.shields.io/badge/status-alpha-red.svg)](https://shields.io/)

WsVite is an highly opinionated boilerplate built with Vite and used by Websolute web agency.
It offers a simple configuration step with `vite.config.js` file.
___
[WsDev](https://github.com/websolutespa/wsdev) is the official monorepo of the [ws-vite](https://github.com/websolutespa/wsdev/blob/main/packages/ws-vite/README.md) and [ws-cli](https://github.com/websolutespa/wsdev/blob/main/packages/ws-cli/README.md) plugin and boilerplate samples of [Websolute](https://www.websolute.com) web agency.

## Using this repository

### Install dependencies

```sh
npm i @websolutespa/ws-vite --save-dev
```
### Create 

***vite.config.js***
```js
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
```

However you can go deep in customization and offer your own `vite.config.js`
using the internal plugin framework:

***vite.config.js***
```js
import {wsVitePlugin} from '@websolutespa/ws-vite';
import main from './src/theme/main.json';
import theme from './src/theme/theme.json';

export default {
  // ... other config options
  plugins: [
    wsVitePlugin({
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
    })
  ],
};
```
