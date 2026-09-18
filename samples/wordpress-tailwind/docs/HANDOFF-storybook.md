# Handoff — integrare Storybook nel sample `wordpress-tailwind`

Scritto per: una nuova sessione Claude Code che deve produrre **solo un piano di implementazione** (plan mode) per aggiungere Storybook a questo sample, sul modello di area-broker. Nessuna implementazione in quella sessione finché il piano non è approvato.

## 1. Richiesta dell'utente

La docs page generata (`src/docs/components.twig` + `src/docs/components/<group>.twig`, "lista dei componenti") non piace: l'utente vuole **Storybook integrato come in area-broker** (`C:\Users\m.carletti\source\repos\area-broker\client`). Il piano deve coprire l'integrazione di Storybook e basta: niente refactor dei componenti, niente nuove feature.

Decisioni da rivedere nel piano (oggi dicono il contrario): `docs/DECISIONS.md` #11 (Storybook escluso) e #12 (docs page unica); `.claude/skills/shadcn-port/SKILL.md` riga "No Storybook, no React, no SCSS" e step 7/9 (render sulla docs page, `register-docs.mjs`); `PORTING.md` §Files per component (nessun `.stories.js`); `docs/adr/0001` non menziona Storybook. Il piano deve dire cosa succede alla docs page (rimuovere, o tenere come demo statica per Vercel) e ai suoi script (`register-docs.mjs`, manifest `src/docs/components.twig.json`).

## 2. Stato del sample (branch `feat/wordpress-tailwind`, 13 commit, non pushato)

- Percorso: `C:\Users\m.carletti\source\repos\wsdev\samples\wordpress-tailwind` (monorepo npm workspaces + Turborepo, `npm` obbligatorio, Node `.nvmrc` v23.6.1, root `npm run dev:wordpress-tailwind` / `build:wordpress-tailwind`).
- Stack: Vite 6 via `@websolutespa/ws-vite: "*"` (workspace symlink a `packages/ws-vite`, pubblicato 0.0.12), Twig via vituum (`@vituum/vite-plugin-twig`, motore `twig` 1.17), Tailwind v4 CSS-first (`tailwind: true`), unica entry CSS `src/css/globals.css` linkata nel layout (bundle `globals.min.css`/`globals.min.js`: il nome dipende dal CSS linkato, vedi `docs/reports/phase-1-skeleton.md`).
- 60 componenti in `src/templates/components/base/<name>/` con: `<name>.twig` (header `{# params #}`), `<name>.twig.json` con shape **`{ "mocks": { "<name>": { "default": {…}, "<scenario>": {…} } } }`** (diversa dal flat `{ "default": {…} }` di area-broker), opzionale `<name>.module.js` (`export default function XModule(node) { …; return dispose }`, caricato da `src/js/common/lazyLoad.js` via `data-module`; eager-init in `src/js/main.js` per sonner/sidebar/command), opzionale `<name>.css` aggregato in `src/css/components.css`.
- Icone: sprite SVG generata da ws-vite (`virtual:spritemap`) da `src/assets/icons/*.svg`; i twig usano `<svg><use href="#icon-x">`. In Storybook la sprite va iniettata a mano (area-broker: `.storybook/spritemap.ts`).
- Dati Twig: `vite.config.js` passa `twig.data` (glob assoluti su `src/theme/**/*.json` e `src/templates/components/**/*.twig.json` → global `mocks`), `twig.globals` con `main.json` (`layout`, `labels` derivate, `fonts`) e il manifest `docs`. Namespace `@components` → `src/templates/components`. Filtri/funzioni Twig custom di ws-vite eventualmente usati dai componenti: verificare in `packages/ws-vite/src/plugins/twig.js` cosa registra (area-broker li replicava in `.storybook/twig-functions.ts`).
- Dark mode: classe `.dark` su `<html>` (`src/js/common/colorScheme.js`, script no-flash nel layout). Font via Google Fonts `<link>` in `components/layout/fonts/fonts.twig`.
- Gate componenti: `npm run check:classes` (`scripts/check-upstream-classes.mjs` → skill `shadcn-port`), eccezioni in `scripts/upstream-exceptions.json`.
- Verifica a11y/tastiera **mai eseguita** (nessun tool browser in sessione): checklist in `.claude/skills/shadcn-port/references/keyboard-checklist.md`. Storybook + `@storybook/addon-a11y` potrebbe diventare il veicolo di questa verifica: il piano lo consideri.
- Documentazione di processo da mantenere aggiornata a ogni batch (regola dell'utente): `docs/WORKLOG.md`, `docs/DECISIONS.md`, `docs/adr/`, `docs/reports/phase-*.md`, `CONTEXT.md`.

## 3. Come era fatto in area-broker (fatti verificati, da rileggere nel repo)

- Dipendenze (`client/package.json`): `storybook ^10.4.3`, `@storybook/html-vite ^10.4.3`, `@storybook/addon-a11y`, `@storybook/addon-docs`, `@storybook/addon-themes`, `twig ^1.17.1`, `@types/twig`, `react`/`react-dom ^19` (solo per il manager), `typescript`, `patch-package` (postinstall: controllare quale pacchetto patchano). Script: `storybook` (`storybook dev -p 6006`), `build-storybook`, `build:storybook` (`--output-dir dist/storybook`), `build:vercel` (`build` + `build:storybook`).
- `client/.storybook/`: `main.ts`, `manager.tsx`, `modules.ts` (init dei `data-module` nel canvas: `initModules(canvasElement)`), `preview.css` (importa `globals.css` + `@source inline(...)` per utility che il JIT non vede nelle story), `preview.ts` (decorator temi light/dark via addon-themes, decorator che inizializza i moduli), `spritemap.ts` (sprite icone iniettata nel canvas), `story-helpers.ts`, `story-utilities.css`, `twig-functions.ts` (funzioni/filtri Twig replicati per twig.js), `twig.ts` (`renderTwig(path, args)` con alias `~sb/twig`, namespace `@components`).
- Story shape (`client/PORTING.md` §Story shape): `export default { title: 'Base/<Name>', render: (args) => renderTwig('@components/base/<name>/<name>.twig', args), argTypes, parameters: { layout: 'centered' } }; export const Default = { args: mocks.default };` con `play` che chiama `initModules` per gli interattivi; una story per variante/stato.
- ADR area-broker `docs/adr/0003-storybook-twigjs.md`: Storybook renderizza Twig a runtime con twig.js, pinnato allo stesso motore `twig ^1.17` del plugin Vite per evitare drift di sintassi; PORTING.md regola 10 limita le feature Twig a quelle identiche su twig.js e Twig PHP (già rispettata nel sample).
- Deploy: Storybook servito sotto `dist/storybook` per Vercel (vedi anche skill globale `storybook-on-vercel` in `~/.claude/skills` per il pattern `<base>` + subpath).

## 4. Vincoli e trappole note

- Registry style `new-york-v4`, "Figma vince": Storybook non deve toccare classi né componenti. Solo `.storybook/`, `*.stories.js`, `package.json`, docs.
- Mock: le story devono leggere `mocks.<name>.<scenario>` dal `.twig.json` esistente (non riscrivere i JSON nel flat di area-broker, o motivare il cambio: `vite.config.js`/`twig.data` e la docs page dipendono dalla shape attuale).
- Moduli: il canvas Storybook non ha `lazyLoad`/IntersectionObserver del sito; serve un `initModules` che importi `**/*.module.js` (glob Vite) e li inizializzi sui nodi `[data-module]`, con `dispose` al cambio story. `sonner`/`sidebar`/`command` sono eager-init nel sito (`main.js`): in Storybook vanno inizializzati esplicitamente. `dialog.module` usa `<dialog>` + `showModal` (top layer: funziona nell'iframe).
- CSS: `globals.css` importa `./shadcn.css`, `./components.css`, `./mode-custom-experimental.css` e ha `@source '../templates'` e `@source '../js'`; in Storybook il file va importato da `preview.css` con path corretti e con `@source` che copra anche `.storybook/` e `*.stories.js` se le story compongono utility.
- Sprite icone: senza `virtual:spritemap` gli `<use href="#icon-x">` sono vuoti; area-broker genera la sprite in `.storybook/spritemap.ts` leggendo `src/assets/icons`.
- Funzioni Twig di ws-vite: se i componenti usano `image()`/`icon()` o altri helper del plugin (verificare: `grep -rn "{{ *[a-z_]*(" src/templates`), twig.js deve riceverli.
- Naming bundle: non aggiungere entry `.twig` a `src/` (ogni twig fuori da `src/templates` diventa una pagina); Storybook vive fuori dalla build di ws-vite.
- Eslint del sample estende `websolute` (regole `quotes`, `no-use-before-define`, `comma-dangle`): i file `.storybook/*.ts` e `*.stories.js` vanno resi lint-clean o esclusi in `.eslintignore`.
- Build monorepo: `turbo run build --filter=@wordpress-tailwind/web` non deve rompersi; `build-storybook` va tenuto fuori dal task `build` o aggiunto con criterio (peso: react + storybook nel workspace, `package-lock.json` root).
- Tempo/token: l'utente ha chiesto di non parallelizzare troppi agent e di tararsi sul budget; chiedere all'inizio della sessione singolo vs multi-agent (regola CLAUDE.md globale).

## 5. Domande che il piano deve chiudere (con raccomandazione)

1. Storybook al posto della docs page o affiancato (Vercel demo)? Cosa fare di `register-docs.mjs` e del manifest.
2. Una story per componente (60 file `.stories.js` in `base/<name>/`) generate da uno script dagli scenari dei mock, o scritte a mano? Raccomandazione attesa: generatore + rifinitura manuale per gli interattivi (`play`).
3. Storybook 10 `html-vite` con twig.js a runtime (come area-broker) vs render server-side pre-compilato: restare su twig.js pinnato a `twig ^1.17`.
4. Temi: `@storybook/addon-themes` con `withThemeByClassName({ light: '', dark: 'dark' })` sull'`<html>` dell'iframe.
5. a11y: `@storybook/addon-a11y` come veicolo della checklist mai eseguita; eventuale `test-runner`/Vitest addon per la tastiera (attenzione al peso).
6. Aggiornamenti documentali: DECISIONS #11/#12, ADR nuovo `0004-storybook-twigjs.md`, PORTING.md (Files per component + Story shape), SKILL.md di `shadcn-port` (step 7/9, riga "No Storybook"), README del sample, `docs/SHADCN.md`.
7. Vercel: `build:vercel` e `azure-pipelines-VERCEL.yml` (`vercelCWD: '.'`).

## 6. File da leggere per primi

Sample: `README.md`, `PORTING.md`, `docs/DECISIONS.md`, `docs/WORKLOG.md`, `docs/reports/phase-5-b8a-followups-docs.md`, `vite.config.js`, `src/css/globals.css`, `src/js/main.js`, `src/js/common/lazyLoad.js`, `src/templates/components/base/{button,dialog,dropdown-menu}/*`, `src/docs/components.twig`, `src/templates/partials/docs/component-section.twig`, `.claude/skills/shadcn-port/SKILL.md`, `.eslintrc.cjs`.
Area-broker: `client/.storybook/*`, `client/package.json`, `client/PORTING.md` §Story shape, `docs/adr/0003-storybook-twigjs.md`, un paio di `client/src/templates/components/base/{button,dialog}/*.stories.js`, `client/src/stories/styleguide/*` (styleguide dei token, opzionale).
Monorepo: `packages/ws-vite/src/plugins/twig.js` (funzioni Twig registrate), `packages/ws-vite/src/plugin.js`, root `package.json`, `turbo.json`, `.eslintrc.cjs`.

## 7. Cose fuori scope (non toccare nel piano Storybook)

Push/PR del branch (in attesa dell'ok dell'utente), follow-up CLI (`ts-node --esm` su Node 22, `copyDirectory` che copia `tokens/` e `.cache/`), tooltip della sidebar collassata, `expand`/swipe di sonner: sono elencati in `docs/reports/phase-6-verification.md` e nei report B7b.
