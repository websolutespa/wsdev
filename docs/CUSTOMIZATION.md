# 🔵 WsVite

## Customization

WsVite is an highly opinionated boilerplate built with Vite and used by Websolute web agency.
It offers a simple configuration step with `vite.config.js` file.

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

---
#### What's next
[Theme Guide](THEMING.md)  
[Templating Guide](TEMPLATING.md)   
[Icons Guide](ICONS.md)  
[Images Guide](IMAGES.md)  
[Accessibility Guide](ACCESSIBILITY.md)  

See [Contributing Guide](../CONTRIBUTING.md)
