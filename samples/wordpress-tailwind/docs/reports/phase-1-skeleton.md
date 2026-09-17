# Report — Fase 1: skeleton, pipeline WP, registrazione CLI (2026-09-17)

Eseguita da un agent Sonnet su brief dell'orchestratore; gate rieseguiti dall'orchestratore prima del commit `c5e599a`.

## File creati

`samples/wordpress-tailwind/`: dotfiles copiati da `samples/wordpress` (`.gitignore` + `/tokens` + `/.cache`), `azure-pipelines-VERCEL.yml` (`vercelCWD: '.'`), `package.json` (`@wordpress-tailwind/web`; script WP senza `build:copy:fonts`; `check:classes`; deps `@floating-ui/dom`, `embla-carousel`, `vanilla-calendar-pro`, `chart.js`; devDeps `tw-animate-css`, `@websolutespa/ws-vite: "*"`; `browserslist` Baseline 2023), `vite.config.js` (`tailwind: true`, `twig.data` con i mock, global `labels` derivato dall'array `layout.labels`), `src/theme/main.json` (+ `layout.wp`, `layout.site`, label `skip.content`/`theme.toggle`), `src/css/{globals,shadcn,components,mode-custom-experimental}.css`, `src/js/main.js` (+ `eagerInit`), `src/js/common/{colorScheme (nuovo), lazyLoad}.js`, layout con script no-flash `.dark`, `layout/{fonts,header,footer,meta}`, partial resources dev/prod (`globals.min.css` / `globals.min.js`), `index.twig(.json)`, `404.twig`, asset/icone/media copiati.

## File modificati nel monorepo

`packages/ws-cli/src/create/create.wizard.ts` (voce `wordpress-tailwind`), root `package.json` (3 script), `README.md` (righe `wordpress`, `wordpress-tailwind`, `drupal`), `docs/ROADMAP.md`, `CONTRIBUTING.md`, `package-lock.json`.

## Deviazioni dal brief (motivate)

1. `layout.labels` resta un array (lo schema `main.schema.json` lo impone); un global Twig `labels` a mappa è derivato in `vite.config.js`.
2. Aggiunto `src/404.twig`: con una sola pagina ws-vite nomina il bundle dopo la pagina (`index.min.*`); servono ≥ 2 pagine e `<script>` prima di `<link>` per ottenere `globals.min.*` (verificato su `samples/tailwind` e area-broker).
3. Lo script inline no-flash non può contenere commenti `//`: il prettifier HTML di ws-vite unisce le righe e il commento inghiottiva l'IIFE. Commenti spostati in `{# #}`.

## Gate

| Gate | Esito |
|---|---|
| `npm install` | ok; ws-vite risolto dal symlink del workspace, nessun `@websolutespa` locale |
| `npm run build:wordpress-tailwind` | `dist/css/globals.min.css`, `dist/js/globals.min.js`; `index.html` referenzia `/js/globals.min.js`; link Google Fonts presente |
| dev server | `GET /index.html` 200, contiene `bg-background`; `/404.html` 200 |
| eslint | solo i 2 errori `turbo/no-undeclared-env-vars` in `main.js`, identici in tutti i sample (baseline del monorepo) |

## Note aperte

- In `vite build` l'URL Google Fonts perde i `..` dei range (`9..40` → `9.40`); non dipende da prettify/minify di ws-vite. Il font carica ma senza range variabile completo. Da indagare in Fase 5.
