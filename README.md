# 🔵 WsDev

WsDev is the official monorepo of the [ws-vite](packages/ws-vite/README.md) and [ws-cli](packages/ws-cli/README.md) plugin and boilerplate samples of [Websolute](https://www.websolute.com) web agency.

## Using this repository

### Install dependencies

```sh
npm i -g @websolutespa/ws-cli
```
### Create 

```sh
ws create
```

Follow the instruction and select your boilerplate sample.

## What's inside?  

The monorepo includes the following packages and samples:

## Packages

|package                      |version                                                                                                           | changelog                                   |
|:----------------------------|:---------------------------------------------------------------------------------------------------------------- |:--------------------------------------------|	
|[ws-vite](packages/ws-vite)  |[![ws-vite version](https://img.shields.io/npm/v/@websolutespa/ws-vite.svg?label=%20)](packages/ws-vite/CHANGELOG.md)    |[changelog](packages/ws-vite/CHANGELOG.md)   |
|[ws-cli](packages/ws-vite)   |[![ws-cli version](https://img.shields.io/npm/v/@websolutespa/ws-cli.svg?label=%20)](packages/ws-cli/CHANGELOG.md)       |[changelog](packages/ws-cli/CHANGELOG.md)    |

## Samples

|sample                                 |description                  |demo                                                     |
|:--------------------------------------|:----------------------------|:--------------------------------------------------------|
|[liquid](samples/liquid/README.md)     |the basic Liquid sample      |[view demo](https://wsdev-liquid.vercel.app/)            |
|[twig](samples/twig/README.md)         |the basic Twig sample        |[view demo](https://wsdev-twig.vercel.app/)              |
|[tailwind](samples/tailwind/README.md) |the basic Tailwind sample    |[view demo](https://wsdev-tailwind.vercel.app/)          |
|`shopify`                              |the basic Shopify sample     |🕣 todo                                                  |
|`react`                                |the basic React sample       |🕣 todo                                                  |

## Dependencies

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

## In detail

Vite bundler consists of two major parts:

- A dev server that serves your source files over [native ES modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules), with [rich built-in features](https://vitejs.dev/guide/features.html) and fast [Hot Module Replacement (HMR)](https://vitejs.dev/guide/features.html#hot-module-replacement).

- A [build command](https://vitejs.dev/guide/build.html) that bundles your code with [Rollup](https://rollupjs.org), pre-configured to output highly optimized static assets for production.

In addition, Vite is highly extensible via its [Plugin API](https://vitejs.dev/guide/api-plugin.html).

Read [Vite Docs to Learn More](https://vitejs.dev)

## Contribution

See [Contributing Guide](CONTRIBUTING.md)

## Roadmap

See [Roadmap Chart](docs/ROADMAP.md)
