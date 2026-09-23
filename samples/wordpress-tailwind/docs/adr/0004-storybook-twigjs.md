# ADR 0004 — Storybook html-vite con compilazione Twig runtime via twig.js

Data: 2026-09-18 · Stato: accettato

## Contesto

La decisione #11 (`DECISIONS.md`) escludeva Storybook a favore di una docs page generata (`src/docs/components.twig`, manifest JSON, ogni scenario in light/dark). L'utente ha richiesto di sostituirla con Storybook, sul modello di `area-broker` (repo separata, `area-broker/docs/adr/0003-storybook-twigjs.md`), senza toccare componenti, classi o pipeline `check:classes`.

Storybook non renderizza Twig nativamente. Il vincolo di fondo è lo stesso di area-broker: la build di produzione (Vituum / `@vituum/vite-plugin-twig`) dipende da `twig ^1.17` — cioè twig.js stesso — quindi compilare le story con twig.js pinnato alla stessa major elimina ogni divergenza di sintassi tra build e Storybook.

## Decisione

- `@storybook/html-vite` (Storybook 10) + compilazione runtime con **twig.js**, `twig` pinnato a `^1.17.1` come dipendenza esplicita del sample (dedup con l'engine usato da `@vituum/vite-plugin-twig`).
- `.storybook/twig.ts`: ogni `src/templates/**/*.twig` importato raw (`import.meta.glob`) e registrato nel registry twig.js con id relativo a `src/templates/` più l'alias `@components/...` risolto dagli `{% include %}`; i placeholder `%BASE_URL%|%DEV%|...` (esistono solo nella pipeline Vite) sono rimossi a registrazione; il registry viene azzerato a ogni HMR per evitare l'errore "id duplicato" di twig.js. Globals passati a ogni render: `{ ...main, labels, mocks }` — `labels` derivata da `main.layout.labels` come fa `vite.config.js`; `mocks` è l'unione di tutti i `components/**/*.twig.json` (`import.meta.glob` eager), così le story leggono `mocks['<name>'].<scenario>` dallo stesso file usato dal gate e dai mock reali, senza duplicare i dati.
- `.storybook/twig-functions.ts`: mirror delle 9 Twig functions registrate dal plugin twig di ws-vite (`classNames, entries, htmlDecode, htmlEncode, icon, image, jsonParse, jsonStringify, style`). Nessuna è usata dai template attuali, ma resta l'unico punto di drift possibile fra build e Storybook: se ws-vite cambia le sue funzioni, questo file va aggiornato a mano.
- `.storybook/spritemap.ts` ricostruisce lo sprite icone (`icon-<name>`) da `src/assets/icons/*.svg`: `virtual:spritemap` esiste solo dentro la pipeline ws-vite.
- `.storybook/modules.ts` inizializza `[data-module]:not(.init)` in modo sincrono e deterministico (stesso contratto di `src/js/common/lazyLoad.js`, senza IntersectionObserver perché il canvas Storybook non ha viewport reale); il decorator in `preview.ts` chiama `dispose()` della story precedente prima di inizializzare quella nuova.
- `.storybook/fonts.ts` inietta il link Google Fonts da `main.json`, stesso URL percent-encoded di `layout/fonts/fonts.twig`.
- Compatibilità con `ws create` (scaffold CLI, `packages/ws-cli`): la CLI copia il sample verbatim (dot-dirs incluse, `node_modules` esclusa) e riscrive solo `@websolutespa/*` → `latest` e il nome pacchetto; nessun path relativo al monorepo è quindi permesso in `.storybook/` o `package.json`. Per questo `vite`, `tailwindcss` e `@tailwindcss/vite` sono dipendenze esplicite del sample (niente hoisting di workspace) anche se già presenti a livello di monorepo.

## Conseguenze

- Story vive con controls sui parametri Twig, toolbar dark mode (`withThemeByClassName` su `.dark`), addon a11y (`test: 'todo'`) e docs (`codePanel: true`, sostituisce le pagine autodocs).
- `react`/`react-dom` entrano in `devDependencies` solo come peer di `@storybook/addon-docs`; non sono usati da nessun componente del sample.
- Ordine di build vincolato: `npm run build:vercel` esegue `build` poi `build:storybook` in sequenza (`vite build` svuota `dist/` prima di scrivere; se l'ordine si invertisse, `build:storybook` cancellerebbe l'output statico).
- Le Twig functions mirrorate in `twig-functions.ts` vanno tenute allineate a mano se ws-vite cambia il proprio plugin twig (nessun test automatico le collega).
- La docs page generata (`src/docs/**`, `register-docs.mjs`, il global `docs` di `vite.config.js`) è stata rimossa: Storybook ne è il superset, unica fonte di showcase per `Base/*`, `Blocks/*` e `Forms/*`.
