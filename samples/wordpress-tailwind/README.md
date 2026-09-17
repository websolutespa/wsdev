# 🔵 WsViteWordpressTailwind

WordPress theme sample with Tailwind v4 (CSS-first) and shadcn/ui ported to Twig, a boilerplate built with 🖤 by Websolute

### Node Version

```sh
nvm use
```

### Install

```sh
npm install
```

### Run static version

```sh
npm start
```

### Build static version

```sh
npm run build
```

### Wordpress dev mode

Lets you work within wordpress enviroment with live reload js/css/twig

```sh
npm run watch:wp
```

### Build for Wordpress

Compiles minified resources and copies component to Wordpress theme template folder.

```sh
npm run build:wp
```

### Dependencies

⬅ [See dependencies](https://github.com/websolutespa/wsdev/blob/main/docs/DEPENDENCIES.md)

### Contents

[Introduction](https://github.com/websolutespa/wsdev/blob/main/docs/INTRODUCTION.md)

[Customization](#customization)

[Styling & design tokens](#styling--design-tokens)

[Templating](#templating)

[shadcn components](#shadcn-components)

[Design tokens / Figma sync](#design-tokens--figma-sync)

[Icons](#icons)

[Images](#images)

[Accessibility](#accessibility)

[WordPress integration](#wordpress-integration)

[Browser support](#browser-support)

[Contribution](#contribution)

## Customization

How to customize the WsVite plugin.

See [Customization Guide](https://github.com/websolutespa/wsdev/blob/main/docs/CUSTOMIZATION.md)

## Styling & design tokens

Tailwind v4 is CSS-first: there is no `tailwind.config.js`, `theme.json` or Sass. The single entry point is `src/css/globals.css`, which imports Tailwind itself, the vendored `shadcn.css` (shadcn/ui base layer, updated by re-copying the file — never hand-edited), the token quarantine `mode-custom-experimental.css`, and the per-component aggregator `components.css`.

Design tokens live inside nine paired markers (`figma:semantic-light`, `figma:semantic-dark`, `figma:alpha-light`, `figma:alpha-dark`, `figma:primitives`, `figma:shadow-blur`, `figma:color-map`, `figma:responsive-base`, `figma:responsive-md`). Everything between a `START`/`END` pair is owned by the Figma token import and must not be hand-edited; everything outside is project-owned. See [docs/SHADCN.md](../../docs/SHADCN.md) for the full zone reference.

## Templating

Learn how to use the corporate templating plugins.

See [Templating Guide](https://github.com/websolutespa/wsdev/blob/main/docs/TEMPLATING.md)

## shadcn components

Every component under `src/templates/components/base/` is a hand-ported shadcn/ui component (Twig + vanilla JS, no React, no Radix). The porting rules, the upstream registry used as a base, and the Figma-vs-upstream precedence policy are documented in `PORTING.md` (coming).

## Design tokens / Figma sync

The `.claude/skills/figma-tokens` skill imports the project's Figma token kit into the marker zones of `globals.css`. From the sample root:

```sh
node .claude/skills/figma-tokens/scripts/import-tokens.mjs
```

runs report-only (no file changes); add `--apply` to write the generated blocks inside the markers.

## Icons

A plugin for spritemap generation and svg optimization with [SVGO](https://github.com/svg/svgo) is seamlessy integrated with the template engine.

See [Icons Guide](https://github.com/websolutespa/wsdev/blob/main/docs/ICONS.md)

## Images

Easily compress images and generate srcset using [Sharp](https://sharp.pixelplumbing.com/) a high performance Node.js image processing.

See [Images Guide](https://github.com/websolutespa/wsdev/blob/main/docs/IMAGES.md)

## Accessibility

With [AxeCore](https://www.deque.com/axe/) accessibility testing tools.

See [Accessibility Guide](https://github.com/websolutespa/wsdev/blob/main/docs/ACCESSIBILITY.md)

## WordPress integration

This frontend workspace expects three sibling folders one level up from `client/` in the host WordPress theme: `../views` (compiled Twig components and resource partials), `../static` (built CSS/JS/asset bundles) and `../templates` (the PHP/Timber theme that consumes them).

- `npm run build:wp` builds once and copies everything into those folders.
- `npm run watch:wp` does the same plus live reload on `:35729` and keeps watching.
- ws-vite names the built JS chunk after the basename of the CSS file linked in the layout: since `layout.twig` links `globals.css`, the build always produces `static/css/globals.min.css` and `static/js/globals.min.js` — do not rename the CSS entry without updating `src/templates/partials/resources/prod/*.twig` to match.

After scaffolding a new project from this sample, set `layout.wp.textDomain` in `src/theme/main.json` to the target theme's actual text domain.

## Browser support

Floor: Baseline 2023 (Chrome/Edge 111+, Safari 16.4+, Firefox 128+ — see `browserslist` in `package.json`). `<dialog>`, `:has()`, `@property`, native CSS nesting and popover are used without polyfills.

## Contribution

⬅ See [Contributing Guide](https://github.com/websolutespa/wsdev/blob/main/CONTRIBUTING.md)
