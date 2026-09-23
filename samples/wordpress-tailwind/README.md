# 🔵 WsViteWordpressTailwind

WordPress theme sample with Tailwind v4 (CSS-first) and the full shadcn/ui component
library ported to Twig + vanilla JS (no React, no Radix), a boilerplate built with 🖤 by
Websolute.

This is a **frontend workspace**: a Vite + Twig project that authors components and
assets, not a WordPress theme and not PHP. It shares the same `build:wp`/`watch:wp`
contract as the `wordpress` (SCSS) sample — see [WordPress integration](#wordpress-integration).

### Stack

- [Vite](https://vitejs.dev/) + [Vituum](https://vituum.dev/) + [Twig](https://twig.symfony.com/doc/3.x/) via `@websolutespa/ws-vite`
- [Tailwind CSS v4](https://tailwindcss.com/), CSS-first (no `tailwind.config.js`)
- [shadcn/ui](https://ui.shadcn.com/) registry (`new-york-v4` style) ported by hand to Twig, vanilla JS modules and native HTML APIs (`<dialog>`, native inputs) — no React, no Radix ([ADR 0002](docs/adr/0002-native-html-apis-instead-of-radix.md))
- Design tokens imported from the company's **shadcn/ui kit for Figma – Boilerplate** ([ADR 0001](docs/adr/0001-tailwind-v4-css-first-figma-token-zones.md), [ADR 0003](docs/adr/0003-new-york-v4-base-figma-wins.md))

### Folder tree (short)

```
.storybook/                  Storybook config — main.ts, preview.ts, twig.ts (runtime Twig render), spritemap.ts, fonts.ts
src/
  css/                     globals.css (entry point), shadcn.css (vendored), components.css
  js/                      main.js entry, common/ utilities (floating, dismiss, keynav, menuTree…)
  templates/
    components/
      base/<name>/         the ~60 ported shadcn/ui components (<name>.twig[.json], .stories.js, .module.js, .css)
      layout/               meta, fonts, header, main-menu, footer, hero
      blocks/               text-only, card-grid, faq, cta-banner
    stories/                Storybook-only demo templates (e.g. forms/form-demo.twig), never a WP page
    layouts/layout.twig     shared page shell
  theme/main.json           layout/labels/menu/footer globals + page defaults
  index.twig[.json]         homepage
  404.twig
scripts/                    check:classes gate + scaffold-stories wrapper (see .claude/skills/shadcn-port)
.claude/skills/              shadcn-port, figma-tokens
docs/                        WORKLOG.md, DECISIONS.md, adr/, reports/ (process tracking)
PORTING.md                   porting conventions (read this first)
CONTEXT.md                   project glossary
```

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

### Other scripts

- `npm run check:classes` — the porting gate: diffs every `base/<name>` component's class
  strings against its upstream shadcn/ui registry entry (`new-york-v4`). Exits non-zero on
  any MISSING class; EXTRA/composition/derived-override cases print as warnings. See
  [Porting workflow](#porting-workflow).
- `npm run storybook` — dev server on `:6006` for the component/blocks/forms showcase. See
  [Storybook](#storybook).
- `npm run build:storybook` — static build into `dist/storybook`.
- `npm run build:vercel` — `build` then `build:storybook`, in that order (see
  [Storybook](#storybook)); this is the Vercel project's build command.
- `npm run scaffold:stories -- <name>` — generates `<name>.stories.js` from an existing
  `<name>.twig.json`'s mock scenarios (`--all` for every component).
- `npm run check:types` — `tsc --noEmit` on `.storybook/**/*.ts`.
- `npx eslint src --ext .js` — lints the JS modules.

### Dependencies

⬅ [See dependencies](https://github.com/websolutespa/wsdev/blob/main/docs/DEPENDENCIES.md)

### Contents

[Introduction](https://github.com/websolutespa/wsdev/blob/main/docs/INTRODUCTION.md)

[Customization](#customization)

[Styling & design tokens](#styling--design-tokens)

[Templating](#templating)

[shadcn/ui components](#shadcnui-components)

[Porting workflow](#porting-workflow)

[Design tokens / Figma sync](#design-tokens--figma-sync)

[Layout and blocks](#layout-and-blocks)

[Forms](#forms)

[Integration API](#integration-api)

[Icons](#icons)

[Images](#images)

[Accessibility](#accessibility)

[Storybook](#storybook)

[WordPress integration](#wordpress-integration)

[Browser support](#browser-support)

[Project tracking](#project-tracking)

[Contribution](#contribution)

## Customization

How to customize the WsVite plugin.

See [Customization Guide](https://github.com/websolutespa/wsdev/blob/main/docs/CUSTOMIZATION.md)

## Styling & design tokens

Tailwind v4 is CSS-first: there is no `tailwind.config.js`, `theme.json` or Sass. The single entry point is `src/css/globals.css`, which imports Tailwind itself, the vendored `shadcn.css` (shadcn/ui base layer, updated by re-copying the file — never hand-edited), the token quarantine `mode-custom-experimental.css`, and the per-component aggregator `components.css`.

Design tokens live inside nine paired markers (`figma:semantic-light`, `figma:semantic-dark`, `figma:alpha-light`, `figma:alpha-dark`, `figma:primitives`, `figma:shadow-blur`, `figma:color-map`, `figma:responsive-base`, `figma:responsive-md`). Everything between a `START`/`END` pair is owned by the Figma token import and must not be hand-edited; everything outside is project-owned (including the `prose-ws` and `scrollbar-*` utilities at the end of the file). See [docs/SHADCN.md](../../docs/SHADCN.md) for the full zone reference.

## Templating

Learn how to use the corporate templating plugins.

See [Templating Guide](https://github.com/websolutespa/wsdev/blob/main/docs/TEMPLATING.md)

## shadcn/ui components

Every component under `src/templates/components/base/` is a hand-ported shadcn/ui component (Twig + vanilla JS, no React, no Radix). **60 of the 64 upstream components are ported.** Four have no faithful equivalent on this platform and are substituted instead:

| Upstream component | Substitution |
|---|---|
| `direction` | `dir="rtl"` — a plain HTML attribute, no component needed |
| `form` | `field` (base component) + `form.module.js` (Constraint Validation API) + an optional Formidable adapter — see [Forms](#forms) |
| `toast` | `sonner` (the `sonner` package ported as-is; upstream's own `toast` primitive is superseded by it) |
| `questionnaire` | not part of the `new-york-v4` registry (404) |

The porting rules, the upstream registry used as a base, the Figma-vs-upstream precedence policy and the JS module contract are documented in [`PORTING.md`](PORTING.md) — read it before touching anything under `base/`.

## Porting workflow

Components are ported one at a time with the [`shadcn-port`](.claude/skills/shadcn-port/SKILL.md) skill's 9-step pipeline (fetch upstream → scaffold → adapt → gate → docs). Two things enforce fidelity to the upstream registry:

- `npm run check:classes [-- <name>]` — the automated gate; must exit 0 (MISSING = 0) before a component is considered done.
- `.claude/skills/shadcn-port/scripts/upstream-exceptions.json` — every deliberate divergence from upstream (a Figma override, a port exception, a composition, or a derived override) is recorded here with its reason, so the gate can tell an intentional exception from a regression.

## Design tokens / Figma sync

The `.claude/skills/figma-tokens` skill imports the project's Figma token kit into the marker zones of `globals.css`. From the sample root:

```sh
node .claude/skills/figma-tokens/scripts/import-tokens.mjs
```

runs report-only (no file changes); add `--apply` to write the generated blocks inside the markers.

## Layout and blocks

Two extra template tiers sit above the base components, dispatched by `page.components[].schema` (see [PORTING.md § Blocks and layout](PORTING.md#blocks-and-layout)):

- **Layout** (`src/templates/components/layout/`) — `meta`, `fonts`, `header` (sticky, desktop `navigation-menu` + mobile `sheet`), `main-menu` (desktop/mobile variants, data from `layout.menu`), `footer` (link columns from `layout.footer.columns`), `hero`.
- **Blocks** (`src/templates/components/blocks/`) — `text-only`, `card-grid`, `faq`, `cta-banner`; each is composed from base components and section spacing utilities (`py-ws-*`).

Neither tier is gated by `check:classes` (they are not shadcn/ui components); see the dedicated `Blocks/*` stories in [Storybook](#storybook) instead.

## Forms

There is no ported `form` component (see [shadcn/ui components](#shadcnui-components)). Instead:

- `base/field` renders labelled controls with error slots.
- `src/js/common/form.module.js` (loaded via `data-module="form.module"`) drives validation with the native Constraint Validation API — at blur and at submit — and dispatches `form:invalid`, `form:submitted` and `form:error` (see the [Integration API](#integration-api)). It supports native submission and `data-submit="fetch"`.
- `src/css/adapters/formidable.css` is an optional stylesheet that reskins Formidable Forms' own markup with the kit's component classes, for WP projects where forms are authored in Formidable rather than hand-built with `field`. Import is commented out by default in `globals.css`.

See it live under `Forms/*` in [Storybook](#storybook).

## Integration API

The public contract for how host pages/blocks talk to a component's module — `CustomEvent`s in and out, `data-*` hooks, no `window.*` globals — is documented in [PORTING.md § Integration API](PORTING.md#integration-api).

## Icons

A plugin for spritemap generation and svg optimization with [SVGO](https://github.com/svg/svgo) is seamlessy integrated with the template engine.

See [Icons Guide](https://github.com/websolutespa/wsdev/blob/main/docs/ICONS.md)

## Images

Easily compress images and generate srcset using [Sharp](https://sharp.pixelplumbing.com/) a high performance Node.js image processing.

See [Images Guide](https://github.com/websolutespa/wsdev/blob/main/docs/IMAGES.md)

## Accessibility

With [AxeCore](https://www.deque.com/axe/) accessibility testing tools.

See [Accessibility Guide](https://github.com/websolutespa/wsdev/blob/main/docs/ACCESSIBILITY.md)

## Storybook

The component/blocks/forms showcase — never shipped to the host theme:

- `npm run storybook` — dev server on `http://localhost:6006`, one story per component
  mock scenario under `Base/*` and `Blocks/*`, plus the form demos under `Forms/*`.
  Interactive components (anything with a `.module.js`) get an extra `play` story
  that drives the real DOM trigger — see [PORTING.md § Story shape](PORTING.md#story-shape).
- `npm run build:storybook` — static build into `dist/storybook`; `npm run build:vercel`
  runs `build` then `build:storybook` in that order (`vite build` empties `dist/` first,
  so the reverse order would delete the Storybook output) — **this must be the Vercel
  project's build command**, not `build` alone.
- Stories are compiled from Twig **at runtime** with the same `twig ^1.17` engine the
  production build uses (`.storybook/twig.ts`), so there is no separate rendering path
  to keep in sync — see [ADR 0004](docs/adr/0004-storybook-twigjs.md).
- `npm run scaffold:stories -- <name>` (or `--all`) generates `<name>.stories.js` for a
  new or updated component from its `<name>.twig.json` mock scenarios.
- `npm run check:types` type-checks `.storybook/**/*.ts`.

## WordPress integration

This frontend workspace expects three sibling folders one level up from `client/` in the host WordPress theme: `../views` (compiled Twig components and resource partials), `../static` (built CSS/JS/asset bundles) and `../templates` (the PHP/Timber theme that consumes them).

- `npm run build:wp` builds once and copies everything into those folders.
- `npm run watch:wp` does the same plus live reload on `:35729` and keeps watching.
- ws-vite names the built JS chunk after the basename of the CSS file linked in the layout: since `layout.twig` links `globals.css`, the build always produces `static/css/globals.min.css` and `static/js/globals.min.js` — do not rename the CSS entry without updating `src/templates/partials/resources/prod/*.twig` to match.

After scaffolding a new project from this sample, set `layout.wp.textDomain` in `src/theme/main.json` to the target theme's actual text domain.

## Browser support

Floor: Baseline 2023 (Chrome/Edge 111+, Safari 16.4+, Firefox 128+ — see `browserslist` in `package.json`). `<dialog>`, `:has()`, `@property`, native CSS nesting and popover are used without polyfills.

## Project tracking

This sample's own history and rationale, kept alongside the code:

- [`CONTEXT.md`](CONTEXT.md) — glossary of project-specific terms.
- [`docs/DECISIONS.md`](docs/DECISIONS.md) — one row per decision taken with the user, with rationale and discarded alternatives.
- [`docs/adr/`](docs/adr/) — the three hard-to-reverse architectural decisions, in full ADR format.
- [`docs/WORKLOG.md`](docs/WORKLOG.md) — diary of every batch/phase (orchestrator-owned).
- [`docs/reports/`](docs/reports/) — one report per batch.

## Contribution

⬅ See [Contributing Guide](https://github.com/websolutespa/wsdev/blob/main/CONTRIBUTING.md)
