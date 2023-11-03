# 🔵 WsDev Dependencies

This monorepo uses some additional tools already setup for you:

- [Vite](https://vitejs.dev/) a next generation frontend tooling
- [Vituum](https://vituum.dev/) a Vite plugin for bundling multiple pages
- [@vituum/vite-plugin-liquid](https://vituum.dev/plugins/liquid.html) a Vite plugin for bundling [Liquid](https://liquidjs.com/) templates
- [@vituum/vite-plugin-twig](https://vituum.dev/plugins/twig.html) a Vite plugin for bundling [Twig](https://twig.symfony.com/doc/3.x/) templates
- [Sass](https://www.npmjs.com/package/sass) a distribution of [DartSass](https://sass-lang.com/dart-sass/)
- [Theme](packages/ws-vite/src/plugins/theme.js) corporate Vite plugin for scss and css vars generation
- [Icons](packages/ws-vite/src/plugins/icons.js) corporate Vite plugin for svg sprite map generation with [SVGO](https://github.com/svg/svgo)
- [Html](packages/ws-vite/src/plugins/html.js) corporate Vite plugin with prettifier and minifier using [HtmlMinifierTerser](https://www.npmjs.com/package/html-minifier-terser) a highly configurable HTML minifier
- [Image](packages/ws-vite/src/plugins/image.js) corporate Vite plugin with [Sharp](https://sharp.pixelplumbing.com/) a high performance Node.js image processing
- [Accessible](packages/ws-vite/src/plugins/accessible.js) corporate Vite plugin with [AxeCore](https://www.deque.com/axe/) accessibility testing tools
- [Prettier](https://prettier.io) for code formatting
- [ESLint](https://eslint.org/) for code linting
- [ESLintConfigWebsolute](https://www.npmjs.com/package/eslint-config-websolute) corporate ESLint linting
- [Rollup](https://rollupjs.org/configuration-options/) module bundler used on build step
- [Turborepo](https://turbo.build/) a high-performance build system for monorepo

---
#### ↩ back to [Readme](../README.md) 
