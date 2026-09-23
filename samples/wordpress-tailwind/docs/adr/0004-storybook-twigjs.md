# ADR 0004 — Storybook html-vite con compilazione Twig runtime via twig.js

Data: 2026-09-18 · Stato: accettato

## Contesto

La decisione #11 (`DECISIONS.md`) escludeva Storybook a favore di una docs page generata (`src/docs/components.twig`, manifest JSON, ogni scenario in light/dark). L'utente ha richiesto di sostituirla con Storybook, sul modello di un progetto interno precedente (repo separata, con un ADR omologo "0003-storybook-twigjs.md"), senza toccare componenti, classi o pipeline `check:classes`.

Storybook non renderizza Twig nativamente. Il vincolo di fondo è lo stesso del progetto di riferimento: la build di produzione (Vituum / `@vituum/vite-plugin-twig`) dipende da `twig ^1.17` — cioè twig.js stesso — quindi compilare le story con twig.js pinnato alla stessa major elimina ogni divergenza di sintassi tra build e Storybook.

## Decisione

- `@storybook/html-vite` (Storybook 10) + compilazione runtime con **twig.js**, `twig` pinnato a `^1.17.1` come dipendenza esplicita del sample (dedup con l'engine usato da `@vituum/vite-plugin-twig`).
- `.storybook/twig.ts`: ogni `src/templates/**/*.twig` importato raw (`import.meta.glob`) e registrato nel registry twig.js con id relativo a `src/templates/` più l'alias `@components/...` risolto dagli `{% include %}`; i placeholder `%BASE_URL%|%DEV%|...` (esistono solo nella pipeline Vite) sono rimossi a registrazione; il registry viene azzerato a ogni HMR per evitare l'errore "id duplicato" di twig.js. Globals passati a ogni render: `{ ...main, labels, mocks }` — `labels` derivata da `main.layout.labels` come fa `vite.config.js`; `mocks` è l'unione di tutti i `components/**/*.twig.json` (`import.meta.glob` eager), così le story leggono `mocks['<name>'].<scenario>` dallo stesso file usato dal gate e dai mock reali, senza duplicare i dati.
- `.storybook/twig-functions.ts`: mirror delle 9 Twig functions registrate dal plugin twig di ws-vite (`classNames, entries, htmlDecode, htmlEncode, icon, image, jsonParse, jsonStringify, style`). Nessuna è usata dai template attuali, ma resta l'unico punto di drift possibile fra build e Storybook: se ws-vite cambia le sue funzioni, questo file va aggiornato a mano.
- `.storybook/spritemap.ts` ricostruisce lo sprite icone (`icon-<name>`) da `src/assets/icons/*.svg`: `virtual:spritemap` esiste solo dentro la pipeline ws-vite.
- `.storybook/modules.ts` inizializza `[data-module]:not(.init)` in modo sincrono e deterministico (stesso contratto di `src/js/common/lazyLoad.js`, senza IntersectionObserver perché il canvas Storybook non ha viewport reale); il decorator in `preview.ts` chiama `dispose()` della story precedente prima di inizializzare quella nuova.
- `.storybook/fonts.ts` inietta il link Google Fonts da `main.json`, stesso URL percent-encoded di `layout/fonts/fonts.twig`.
- Compatibilità con `ws create` (scaffold CLI, `packages/ws-cli`): la CLI copia il sample verbatim (dot-dirs incluse, `node_modules` esclusa) e riscrive solo `@websolutespa/*` → `latest` e il nome pacchetto; nessun path relativo al monorepo è quindi permesso in `.storybook/` o `package.json`. Per questo `vite`, `tailwindcss` e `@tailwindcss/vite` sono dipendenze esplicite del sample (niente hoisting di workspace) anche se già presenti a livello di monorepo.

## Aggiornamento (Fase 8) — parità organizzativa con il progetto di riferimento

La Fase 7 portava il motore e uno scaffold minimo (un export CSF per scenario mock, nessun
`argTypes`, nessuna pagina di token). La Fase 8 allinea l'organizzazione delle story a quella
del progetto di riferimento senza copiarne i valori (token, brand, nomi) — solo la struttura:

- **`Styleguide/*`** (`src/stories/styleguide/`): Logo, Layout, Palette, Typography, Borders,
  Shadows, Icons — una pagina per famiglia di token, letta live da `globals.css`/`main.json`
  invece di valori hardcoded, così resta sincronizzata quando i token cambiano. Precede
  `Base/*`/`Blocks/*`/`Layout/*` nell'ordine della sidebar (`storySort` in `preview.ts`).
- **`Catalog`**: ogni componente `Base/*`/`Blocks/*` aggiunge, oltre a `Default` (playground
  Controls) e agli export `play` interattivi, un export `Catalog` che impila `matrixCard`/
  `demoCard` (`.storybook/story-helpers.ts`) in una griglia varianti × taglie × stati — la
  superficie di QA visiva vera e propria, equivalente a una pagina Styleguide ma per singolo
  componente. Sostituisce l'elenco piatto "una story per scenario mock" della Fase 7.
- **Pannello "Parametri"** (`.storybook/manager.tsx`, addon `wordpress-tailwind/params`):
  legge `argTypes` (`description`/`table.category`/`table.defaultValue`) e li mostra in un
  pannello dedicato accanto a Controls/Actions — necessario perché `argTypes` ora arriva
  scaffoldato dall'header `{# Params: #}` di ogni `.twig` (`scaffold-stories.mjs`), non più
  scritto a mano da zero.
- **Simulatori di stato**: `@custom-variant hover|focus-visible|active` Storybook-only in
  `.storybook/story-utilities.css` fa scattare `hover:`/`focus-visible:`/`active:` anche sulle
  classi statiche `.is-hover`/`.is-focus-visible`/`.is-active` (`stateProps()` in
  `story-helpers.ts`), per mostrare uno stato interattivo in una cella di matrice senza un
  vero evento DOM.
- **`@source not '../templates/**/*.stories.js'`** in `src/css/globals.css`: le utility
  Tailwind usate solo dalle story (grid/table della Catalog, `is-hover` ecc.) non finiscono
  nel bundle CSS di produzione — verificato con una prova end-to-end (story sonda con classi
  mai usate altrove, rimossa dal build finale).
- **`renderTwigSource(source, ctx)`** (nuovo export di `.storybook/twig.ts`, accanto a
  `renderTwig`): renderizza una sorgente Twig inline (es. un `{% embed %}` costruito al volo
  per `Layout/Hero`, che non ha un proprio `.twig.json`) con lo stesso
  engine/registry/globals di `renderTwig`, senza dover scrivere un file `.twig` usa-e-getta.

## Conseguenze

- Story vive con controls sui parametri Twig, toolbar dark mode (`withThemeByClassName` su `.dark`), addon a11y (`test: 'todo'`) e docs (`codePanel: true`, sostituisce le pagine autodocs).
- `react`/`react-dom` entrano in `devDependencies` solo come peer di `@storybook/addon-docs`; non sono usati da nessun componente del sample.
- Ordine di build vincolato: `npm run build:vercel` esegue `build` poi `build:storybook` in sequenza (`vite build` svuota `dist/` prima di scrivere; se l'ordine si invertisse, `build:storybook` cancellerebbe l'output statico).
- Le Twig functions mirrorate in `twig-functions.ts` vanno tenute allineate a mano se ws-vite cambia il proprio plugin twig (nessun test automatico le collega).
- La docs page generata (`src/docs/**`, `register-docs.mjs`, il global `docs` di `vite.config.js`) è stata rimossa: Storybook ne è il superset, unica fonte di showcase per `Base/*`, `Blocks/*` e `Forms/*`.
