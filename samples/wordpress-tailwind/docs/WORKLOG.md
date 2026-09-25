# Diario di lavoro — sample `wordpress-tailwind`

Cronologia di ciò che è stato fatto, da chi (orchestratore o agent) e con quale esito. Le decisioni di progetto sono in [DECISIONS.md](DECISIONS.md) e negli [ADR](adr/); i report dettagliati per fase in [reports/](reports/). Il piano approvato vive fuori dal repo (`~/.claude/plans/questo-progetto-permette-di-prancy-lynx.md`).

Convenzione: una riga per attività, ordine cronologico, stato ✅ fatto · ⏳ in corso · ⛔ bloccato · ⚠️ nota aperta.

## 2026-09-17

### Analisi e piano

- ✅ Esplorazione di wsdev (CLI `ws create`, sample `wordpress` e `tailwind`, ws-vite) e di un progetto interno precedente (Tailwind v4 CSS-first + shadcn portato in Twig) con due agent Explore in parallelo.
- ✅ Verifica del kit Figma `0vHlrWA2vzmhhZCeJQN3ZP` con `use_figma`: 6 collezioni di variabili, font DM Sans, primary `brand/blue/800`, bottoni 36/32/40 px, radius pill 26/22/14. Confronto misure vs registry `radix-vega`, `radix-nova`, `new-york-v4`: il kit è un ibrido `new-york-v4` + personalizzazioni. Dettagli in [reports/phase-0-analysis.md](reports/phase-0-analysis.md).
- ✅ Piano scritto e sottoposto a grill (`/grill-with-docs`, 20 domande): esiti in [DECISIONS.md](DECISIONS.md). Piano approvato.

### Fase 1 — Skeleton + pipeline WP + registrazione CLI (agent Sonnet)

- ✅ Cartella `samples/wordpress-tailwind/` creata dal sample `wordpress` (dotfiles, asset, media, meta, lazyLoad) con `package.json` `@wordpress-tailwind/web`, `vite.config.js` (`tailwind: true`, `twig.data` per i mock), `main.json` (+ `layout.wp`, `layout.site`), `globals.css` con le nove zone marker, `shadcn.css` vendorizzato (shadcn@4.21.0), `main.js`, `colorScheme.js` (`.dark`), layout con script no-flash, partial resources dev/prod, `fonts.twig` (Google Fonts), `404.twig`.
- ✅ Registrazione: wizard ws-cli (`wordpress-tailwind`), script root `dev/build/preview:wordpress-tailwind`, README (tabella Samples: aggiunte anche le righe mancanti `wordpress` e `drupal`), ROADMAP, CONTRIBUTING.
- ✅ Gate: `npm install` (ws-vite risolto dal workspace), build → `dist/css/globals.min.css` + `dist/js/globals.min.js`, dev server 200, eslint (solo i 2 errori `turbo/no-undeclared-env-vars` preesistenti in tutti i sample).
- ⚠️ Scoperte tecniche: il nome del bundle segue il CSS linkato nel layout solo con ≥ 2 pagine e con `<script>` prima di `<link>` (da qui `404.twig`); il prettifier HTML di ws-vite unisce le righe degli script inline (mai commenti `//` inline); in build Vite collassa i `..` dell'URL Google Fonts (`9..40` → `9.40`), il font carica ma senza range variabile — da indagare in Fase 5. Report: [reports/phase-1-skeleton.md](reports/phase-1-skeleton.md).

### Fase 2 — Token da Figma (agent Sonnet per skill ed export, orchestratore per apply)

- ✅ Skill `figma-tokens` copiata da un progetto interno precedente e generalizzata (root discovery generico, routing `Brand`/`Responsive`, gruppi tipografici a 3 livelli, `reverse.mjs` riallineato), 49 test verdi. Report: [reports/phase-2-tokens.md](reports/phase-2-tokens.md).
- ✅ Export DTCG del kit con `use_figma` (874 variabili, 0 alias irrisolti) in `tokens/figma-export/` (git-ignored).
- ✅ Import: report-only 992/992 classificati → `--apply` → `globals.css` aggiornato solo dentro i marker. Due bug trovati e corretti dall'orchestratore: doppio suffisso alpha (`#FFFFFFF2F2`) → guardia sugli hex a 8 cifre in `toCssColor`; primitive nominate `--color-blue-*` (collisione con Tailwind) → famiglia = segmenti intermedi del path (`--color-brand-blue-*`) con il file Brand avvolto nella root di collezione. +2 test. Rimappatura `--text-*` sui token responsive e `--spacing-ws-*` aggiunte in `@theme inline`.
- ✅ Misure Figma dei 22 kit component esportate in `tokens/figma-components/*.json` (agent Sonnet, `use_figma`).

### Fase 2b — Skill `shadcn-port`

- ✅ `SKILL.md` scritto dall'orchestratore via `/prompt-master`; script (probe, fetch, check-classes, scaffold, register-docs, normalize/diff Figma) implementati da un agent Sonnet e testati su rete reale (registry: 61/63 disponibili, mancano `toast` e `questionnaire`). Report: [reports/phase-2b-shadcn-port.md](reports/phase-2b-shadcn-port.md).

### Commit

- ✅ `c5e599a` — fasi 1, 2, 2b (97 file nuovi, 6 modificati) su `feat/wordpress-tailwind`.

### Fase 3 — B1 fondamenta (agent Sonnet)

- ✅ Utility JS comuni (8 file da un progetto interno precedente, `floating.js` + `--viewport-*`), `PORTING.md`, 34 icone lucide, docs page `src/docs/components.twig` (light + dark per scenario), componenti àncora button/separator/label/input/textarea/card/skeleton. 10 override Figma registrati (button pill + gap/padding, input/textarea radius e niente shadow), 3 disaccordi non applicati con motivo. Due bug di tooling corretti (`diff-figma-upstream` padding array; glob `twig.data` assoluti). Gate tutti verdi. Report: [reports/phase-3-b1-foundations.md](reports/phase-3-b1-foundations.md).
- ⚠️ Follow-up: radius dei bottoni icon-only (un solo campione Figma); forma `padding` da riconciliare tra normalizzatore e JSON esportati.

### Fase 4 — B2a statici, parte 1 (agent Sonnet)

- ✅ alert, aspect-ratio, avatar (+modulo), badge, empty, item, kbd, marker, message, bubble, attachment. Override Figma solo su empty/item/kbd (avatar e badge già coerenti), aspect-ratio come port exception (nessuna classe upstream). Tre bug corretti in `diff-figma-upstream.mjs`. Gate verdi (18 componenti). Report: [reports/phase-4-b2a-static.md](reports/phase-4-b2a-static.md).
- ⚠️ Follow-up B8: parametro `slot?` su button/separator per riuso dentro attachment/item.

### Fase 4 — B2b statici, parte 2 + form (agent Sonnet)

- ✅ native-select, progress, spinner, table, breadcrumb, pagination, button-group, input-group, field, scroll-area (+css). Override Figma su table, input-group, field. Form: `formValidation.js`, `form.module.js` (eventi `form:invalid|submitted|error`), adapter `adapters/formidable.css` (import commentato), `docs/forms.twig`. 28 componenti, gate verdi. Report: [reports/phase-4-b2b-static-forms.md](reports/phase-4-b2b-static-forms.md).
- ⚠️ Follow-up B8: `slot?` su button/separator/label (limite emerso in 5 componenti); `.frm_checkbox`/`.frm_radio` dopo B6.

### Fase 4 — B3 + B4 overlay e floating (agent Sonnet)

- ✅ dialog, alert-dialog, sheet, drawer su `dialog.module.js` condiviso; popover, tooltip (override Figma `rounded-xl`), hover-card con `popover/tooltip/hover-card.module.js`. Port exceptions per overlay→`backdrop:` e `data-direction` (regola globale). 35 componenti, gate verdi. Report: [reports/phase-4-b3-b4-overlay-floating.md](reports/phase-4-b3-b4-overlay-floating.md).
- ⛔ Checklist tastiera/a11y non eseguita: manca Playwright MCP nella sessione (a carico dell'utente). Percorsi di codice ESC/outside/focus-return presenti e citati nel report.

### Fase 4 — B5 menu + select (agent Opus)

- ✅ dropdown-menu, context-menu, menubar su `src/js/common/menuTree.js` condiviso; navigation-menu con viewport e `data-motion`; select come combobox select-only con `<select>` nativo nascosto. Override Figma su dropdown-menu e select. 40 componenti, gate verdi. Report: [reports/phase-4-b5-menus-select.md](reports/phase-4-b5-menus-select.md).
- ⚠️ Decisione: context-menu e menubar ereditano gli override di dropdown-menu (stessa superficie) → eseguito in B6.

### Fase 4 — B6 controlli form + disclosure (agent Sonnet)

- ✅ checkbox, radio-group, switch, slider (+css, modulo range a 2 thumb), toggle, toggle-group, input-otp, accordion, collapsible, tabs; override derivati applicati a context-menu/menubar; adapter Formidable completato per checkbox/radio. 50 componenti, gate verdi. Report: [reports/phase-4-b6-form-controls-disclosure.md](reports/phase-4-b6-form-controls-disclosure.md).
- ⚠️ Da ripulire in B7: chiavi duplicate in un'eccezione `select`; `diff-figma-upstream` sui controlli form sceglie la riga label+controllo.

### Fase 4 — B7a librerie terze (agent Opus)

- ✅ carousel (embla), calendar (vanilla-calendar-pro, mappa classi via `styles`), date-picker (composizione popover+calendar), chart (chart.js, contratto `config`→`--color-*`), resizable (N pannelli). Cleanup eccezioni `select`. 55 componenti, gate verdi. Report: [reports/phase-4-b7a-third-party.md](reports/phase-4-b7a-third-party.md).
- ⚠️ `chart.module` 210 kB e `calendar.module` 79 kB (librerie inlinate, lazy); `aria-orientation` sul panel group da valutare con axe.

## 2026-09-18

### Fase 4 — B7b ultimi componenti (agent Opus)

- ✅ combobox, command (+dialog, ⌘K), sonner (`toast:show`), sidebar (cookie, ⌘B, mobile in sheet), message-scroller. Fix `eagerInit`/`lazyLoad`. **60 componenti**: libreria completa. Report: [reports/phase-4-b7b-last-components.md](reports/phase-4-b7b-last-components.md).
- ⚠️ Per B8: gate reale per combobox, `scrollbar-*` in globals, docs page paginata per gruppo, `slot?` su button/separator/label, `composition: true` nelle eccezioni.

### Fase 5 — B8a follow-up tecnici + docs page per gruppo (agent Sonnet)

- ✅ `slot?`/`labelClass?` su button/separator/label e consumer riallineati (slot mancanti 30 → 23, tutti fuori portata); `composition: true` per date-picker; combobox gated per davvero (MISSING 0, eccezione rimossa); `scrollbar-*` in `globals.css`; URL Google Fonts salvato con `%2E%2E`; docs page divisa in indice + 8 pagine gruppo (max 1,8 MB). Report: [reports/phase-5-b8a-followups-docs.md](reports/phase-5-b8a-followups-docs.md).

### Fase 5 — B8b layout, blocks, index, documentazione (agent Sonnet)

- ✅ header/main-menu/footer/hero su componenti base, 4 blocks (text-only, card-grid, faq, cta-banner) + `docs/blocks.twig`, index WP-like, README finale, `docs/SHADCN.md` nel monorepo, dry run `build:wp` verde. Report: [reports/phase-5-b8b-layout-blocks-docs.md](reports/phase-5-b8b-layout-blocks-docs.md).

### Fase 6 — verifica end-to-end (agent Sonnet)

- ✅ Otto verifiche del piano tutte PASS, nessun fix necessario: install, build, gate, dev server, scaffold CLI con build del progetto generato (ws-vite 0.0.12 pubblicato supporta `tailwind: true`), lint, igiene repo, docs. Report: [reports/phase-6-verification.md](reports/phase-6-verification.md).
- ⛔ Sospeso: checklist tastiera/a11y (serve Playwright MCP).
- ⚠️ Follow-up CLI: `ts-node --esm` rotto su Node 22 per gli script dev della CLI; `copyDirectory` copia anche `tokens/` e `.cache/` se presenti su disco.

### Stato finale (a fine Fase 6, superato dalla Fase 7 — vedi sotto)

- Branch `feat/wordpress-tailwind`, 13 commit su `main`, working tree pulito. **60 componenti** (`base/`), 4 blocks, 5 layout, 3 skill/tooling (`figma-tokens`, `shadcn-port`, `check:classes`), docs page per gruppo, README, `docs/SHADCN.md`, ADR 0001–0003, `CONTEXT.md`.
- In attesa dell'utente: push del branch e apertura PR; configurazione Playwright MCP per la verifica a11y.

### Documentazione di processo

- ✅ Creati `docs/WORKLOG.md`, `docs/DECISIONS.md`, `docs/adr/0001–0003`, `docs/reports/*`, `CONTEXT.md` (commit `7bd18f0`). Regola: aggiornati a ogni batch prima del commit.
- ✅ Fase 7 (Storybook): `docs/DECISIONS.md` #11/#12 aggiornate, `docs/adr/0004-storybook-twigjs.md` nuovo, `PORTING.md`/`README.md`/`CONTEXT.md` disallineati dalla docs page rimossa, `docs/reports/phase-7-storybook.md` nuovo, `docs/HANDOFF-storybook.md` rimosso (contenuto ora storia in git). Vedi sezioni Fase 7 sotto.

### Fase 7 — B2a Scaffold story (agent Sonnet)

- ✅ Script `scaffold-stories.mjs` (skill `shadcn-port` + wrapper in `scripts/`), `lib/paths.mjs` estesa con `componentsGroupDir`/`storiesDir`/gruppo su `componentPaths` senza toccare gli export esistenti. CLI: `node scripts/scaffold-stories.mjs <name> [--group base|blocks] [--force]` o `--all [--group base|blocks]`; idempotente, un export CSF per scenario (kebab-case → PascalCase, collisioni con suffisso numerico e warning).
- ✅ Generate 60 `*.stories.js` in `src/templates/components/base/*` (gruppo `base`) e 4 in `src/templates/components/blocks/*` (gruppo `blocks`); nessun componente con `mocks.<name>` fuori standard, nessun errore.
- ✅ Mock dei 4 blocks migrati da `src/docs/blocks.twig.json` a `<name>/<name>.twig.json` (`mocks.<name>.default`, copia verbatim); `blocks.twig.json` non toccato (verrà rimosso in un'altra batch).
- ✅ Template Storybook-only per i form: `src/templates/stories/forms/form-demo.twig` (nativo, `form.module.js`) e `formidable-demo.twig` (markup statico), con header `{# … #}` che segnala che non sono copiati da `build:copy:twig`; `forms.stories.js` con story `Native` (play → `initModules`) e `Formidable`. Confermato leggendo `packages/ws-vite/src/utils/input.js`: le pagine sono ogni `.twig` sotto `src/` **escluso** `src/templates/**`, quindi `src/templates/stories/` non genera pagine WP.
- ✅ Lint: `npx eslint src/templates --ext .js,.mjs` verde (0 problemi) su tutti i file generati. `npx eslint scripts .claude/skills/shadcn-port/scripts --ext .mjs` segnala 21 errori pre-esistenti in `lib/classes.mjs`, `lib/registry.mjs`, `lib/twig.mjs`, `probe-registry.mjs` (non toccati in questa batch, tipo `no-cond-assign` e quote); `scaffold-stories.mjs` e `lib/paths.mjs` (i file generati/modificati qui) sono a 0 errori.
- ⚠️ Follow-up: refinement manuale dei `play` per i componenti con `data-module` (accordion, dialog/alert-dialog/drawer/sheet, avatar, calendar, carousel, chart, collapsible, combobox, command, context-menu, date-picker, dropdown-menu, hover-card, input-otp, menubar, message-scroller, navigation-menu, popover, resizable, select, sidebar, slider, sonner, tabs, toggle, toggle-group, tooltip; field/form.module.js copre il form demo) — vedi report all'orchestratore per la mappa componente → modulo.

### Fase 7 — B2b Story interattive e smoke render (agent Sonnet)

- ✅ Aggiunta una story `play` in più (import `initModules` da `~sb/modules`) per i 30 componenti con `data-module` elencati nel follow-up B2a, letti trigger/eventi reali da `.twig`+`.module.js` invece di indovinarli: `accordion` (Expanded, apre un item chiuso), `alert-dialog`/`dialog`/`drawer`/`sheet` (Open, click `[data-dialog-trigger]`, condividono `dialog.module`), `carousel` (NextSlide, click `[data-carousel-next]`), `collapsible` (Expanded, click `[data-collapsible-trigger]`), `combobox` (Open, click sull'input), `command` (Filtered, digita una query e dispatcha `input`), `context-menu` (Opened, dispatch `contextmenu` sul trigger), `date-picker` (Open, click sul trigger condiviso col popover), `dropdown-menu` (Open, click `[data-menu-trigger]`), `hover-card`/`tooltip` (Shown, dispatch `pointerenter` + attesa del delay di apertura), `input-otp` (Typed, digita un carattere nel primo slot), `menubar` (Opened, click sul primo trigger), `navigation-menu` (Open, click sul primo trigger con pannelli), `popover` (Open, click `[data-popover-trigger]`), `select` (Open, click sul trigger), `sidebar` (ToggledWithTrigger, click `[data-slot="sidebar-trigger"]`), `sonner` (Toast, click sul primo `[data-sonner-show]`), `tabs` (Switched, click su un secondo tab), `toggle` (Toggled, click sul bottone), `toggle-group` (Toggled, click su un secondo item), `avatar`/`calendar`/`chart`/`message-scroller`/`resizable`/`slider` (Mounted, solo `initModules` — nessuna interazione significativa via DOM plain, come da istruzioni).
- ✅ Nessun layout scaffoldato in B2a era palesemente sbagliato: `sidebar` era già `fullscreen`; gli altri `centered`/`padded` restano coerenti con l'ingombro reale del componente.
- ✅ Smoke render Node (script temporaneo `scripts/render-smoke.mjs`, mai commesso — porta inline le 9 twig-functions e la registrazione id `rel`/`@components/...` di `.storybook/twig.ts`, poi eliminato a fine verifica): **307/307** combinazioni `template.twig × scenario mock` renderizzate senza errori (tutti i `components/**/*.twig.json` + `stories/forms/form-demo.twig` e `formidable-demo.twig`). Nessun fallimento da riportare.
- ✅ Lint: `npx eslint src/templates --ext .js` → 0 errori sui file toccati in questa batch.
- ⚠️ Non verificabile in questa sessione (nessun browser disponibile): comportamento runtime reale di `play()` in Storybook (focus trap, animazioni, floating-ui, `pointerenter`/delay di hover-card e tooltip) — il render Node conferma solo l'assenza di errori Twig, non l'esito visivo/interattivo delle story.

### Fase 7 — B3 Rimozione docs page e riferimenti (agent Sonnet)

- ✅ Rimossi `src/docs/**` (22 file), `src/templates/partials/docs/component-section.twig`, `register-docs.mjs`, `docsManifestFile` in `lib/paths.mjs`, il global `docs` di `vite.config.js`. Link aggiornati verso `/storybook/` in `index.twig`, `main.json` e nei mock di command/dropdown-menu/menubar/navigation-menu; commento di documentazione di `field.twig` aggiornato.
- ✅ Gate verdi dopo la rimozione: `npm run build:wordpress-tailwind`, `check:classes`, dev server boot.

### Fase 7 — B1 Storybook engine (agent Sonnet)

- ✅ Motore Storybook portato 1:1 dal `.storybook/` di un progetto interno precedente: `.storybook/main.ts` (framework `@storybook/html-vite`, addon a11y/docs/themes, `staticDirs: ['../src/public']`, `viteFinal` con `@tailwindcss/vite` e alias `~sb`), `twig.ts` (registry twig.js con reset a ogni esecuzione, id `rel` + `@components/...`, strip placeholder `%...%`), `twig-functions.ts` (mirror delle funzioni del plugin twig di ws-vite, puntatore a `docs/adr/0004-storybook-twigjs.md`), `modules.ts` (init `[data-module]:not(.init)` con dispose), `spritemap.ts` (sprite da `src/assets/icons/*.svg`), `fonts.ts` (nuovo: inietta i preconnect + lo stylesheet Google Fonts da `main.json`, stesso URL percent-encoded di `fonts.twig`), `preview.ts` (decorator `withThemeByClassName` + decorator moduli con dispose della story precedente prima del render), `preview.css` (import di `globals.css` + `adapters/formidable.css`, quest'ultimo Storybook-only perché resta commentato in `globals.css`).
- ✅ Adattamenti rispetto alla reference: `labels` derivate da `main.layout.labels` come in `vite.config.js`; global `mocks` aggregato da tutti i `components/**/*.twig.json` (`import.meta.glob` eager) e passato a `renderTwig` insieme a `main`/`labels`; nessun global `docs` (non pertinente in questo sample); `stories` puntato su `../src/templates/**/*.stories.@(ts|js)` (pattern unico, non i due path del progetto di riferimento); non portati `story-helpers.ts`, `story-utilities.css`, `manager.tsx`.
- ✅ `tsconfig.json` nuovo standalone (`target ES2022`, `module ESNext`, `moduleResolution bundler`, `strict true`, `types: ["vite/client"]`, `include: [".storybook/**/*.ts"]`); package.json sample con devDependencies Storybook 10.4.3/`@tailwindcss/vite`/`tailwindcss`/`twig`/`typescript`/`vite`/React 19 (versioni caret compatibili con quanto già installato nel monorepo: vite 6.4.1, tailwindcss 4.1.17, twig 1.17.1) e script `storybook`, `build:storybook`, `build:vercel`, `scaffold:stories`, `check:types`; root `package.json` con `storybook:wordpress-tailwind`, `turbo.json` con task `storybook` (`cache: false`, `persistent: true`); `.gitignore` del sample con `storybook-static`.
- ✅ Due bug di tipizzazione pre-esistenti nel progetto di riferimento (verificati con `npx tsc` anche lì) corretti nel porting: `image()` in `twig-functions.ts` tipizza `options` come `Record<string, unknown>` per l'indexing dinamico; il cast dei `twigFunctions` in `twig.ts` usa `as any` con commento puntuale (le typings di `@types/twig` per `extendFunction` accettano solo funzioni che ritornano `string`, ma `entries()` ritorna un array).
- ✅ Verifiche: `npm install` alla root senza warning/errori di peer dependency (73 pacchetti aggiunti); `npx tsc --noEmit -p tsconfig.json` verde; `npx eslint .storybook --ext .ts` verde (0 errori, 3 warning `no-explicit-any` sui cast Twig, stesso pattern della reference); `npx storybook dev -p 6006 --no-open --ci` → "Storybook ready!" su `http://localhost:6006/` senza errori twig/indexer, processo terminato correttamente dopo verifica; `npx storybook build --output-dir dist/storybook` → "Storybook build completed successfully" (con le story già scaffoldate dalla Fase 7 B2a in parallelo), `dist/storybook` rimosso dopo la verifica.

### Fase 7 — B4 Documentazione e verifica finale (agent Sonnet)

- ✅ `docs/DECISIONS.md`: riga #11 Storybook → **Incluso**, riga #12 Showcase → Storybook (`Base/*`/`Blocks/*`/`Forms/*`), con motivo e scartati aggiornati.
- ✅ `docs/adr/0004-storybook-twigjs.md` nuovo: motore twig.js pinnato a `twig ^1.17` come il plugin Vite, parità dei globals, `twig-functions.ts` come unico punto di drift, sprite ricostruita, init moduli deterministico, regole di compatibilità con `ws create` (dipendenze esplicite, nessun path monorepo, dot-dirs copiate).
- ✅ `PORTING.md`: corretto il blurb iniziale ("Storybook" invece di "no Storybook"), riga `<name>.stories.js` in Files per component, nuova sezione § Story shape (skeleton scaffoldato, pattern `play`, regola `layout`, nota sul `<name>.twig.json` dei blocks), riferimenti `/docs/` in Blocks and layout e Definition of done aggiornati a Storybook.
- ✅ `README.md`: sezione "Docs pages" → "Storybook" (dev/build/build:vercel, ordine di build, scaffold script, check:types), scripts aggiunti alla tabella "Other scripts", `.storybook/` e `src/templates/stories/` nell'albero cartelle, nota sul build command del progetto Vercel, riferimenti `/docs/` in Layout and blocks e Forms aggiornati.
- ✅ `CONTEXT.md`: voce glossario "Docs page" → "Storybook", nuova voce "Story".
- ✅ `docs/WORKLOG.md`: aggiunte le sezioni Fase 7 B3 e B4 (questa), "Stato finale"/"Documentazione di processo" di Fase 6 annotate come superate dalla Fase 7.
- ✅ `docs/reports/phase-7-storybook.md` nuovo (formato phase-6-verification.md): scope, file creati/rimossi, tabella di verifica, punti aperti.
- ✅ `docs/HANDOFF-storybook.md` rimosso: era il brief per la sessione di planning, contenuto ora storia in git (commit `7c9ab2e`).
- ✅ Smoke test `ws create` (B4b, agent Sonnet): sample copiato in una cartella temporanea fuori dal monorepo replicando `updateRepo` di ws-cli (`@websolutespa/*` → `latest`, `@wordpress-tailwind` → `@my-shop`); `npm install` risolve `@websolutespa/ws-vite@0.0.12` da npm (stessa versione del workspace) ed `eslint-config-websolute@2.0.0`; `check:types`, `build`, `build:storybook`, `build:vercel` (entrambi `dist/index.html` e `dist/storybook/index.html` presenti) ed eslint (0 errori, 3 warning `no-explicit-any` in `twig.ts`) tutti verdi; `storybook dev` pronto in ~20s, `index.json` con 337 story (Base 331, Blocks 4, Forms 2); nessun riferimento a path del monorepo nel progetto generato.
- ⚠️ Verifica nel browser (temi, `play`, a11y panel, tastiera) non eseguita in sessione: a carico dell'utente con `npm run storybook`.

## 2026-09-23

### Fase 8 — Step 1 Analisi (orchestratore)

- ✅ Confronto tra la Fase 7 (uno scaffold minimo, un export CSF per scenario mock, nessun
  `argTypes`, nessuna pagina di token) e l'organizzazione delle story del progetto di riferimento
  (Styleguide per famiglia di token, `Catalog` per componente con matrixCard/demoCard,
  pannello "Parametri" per `argTypes`). Piano in 6 step: infrastruttura condivisa (helpers,
  CSS, addon), Styleguide, Base (Default + Catalog + argTypes su tutti i 60 componenti),
  Blocks/Layout/Form, documentazione + scaffold. Nessun file `.stories.js`/`.twig`/`.css`/
  `.storybook/*` toccato in questo step: solo analisi e definizione dei tagli di lavoro per
  gli step successivi.

### Fase 8 — Step 2 Infrastruttura Storybook (agent Sonnet)

- ✅ Portati dal `.storybook/` del progetto di riferimento (verbatim, adattati ai token dello shadcn kit di questo sample, tutti già presenti in `@theme inline` di `globals.css`): `story-helpers.ts` (`demoCard`, `matrixCard`, `storyStack`, `STATE_COLUMNS`, `stateProps`, header ridotto a ≤6 righe, JSDoc di firma intatta), `story-utilities.css` (`@custom-variant hover|focus-visible|active` con simulatori `.is-hover/.is-focus-visible/.is-active` + `@source "./story-helpers.ts"`), `manager.tsx` (pannello "Parametri" che legge `argTypes` description/table.category/table.defaultValue, addon id `wordpress-tailwind/params`).
- ✅ `tsconfig.json`: aggiunto `"jsx": "react-jsx"` e `.storybook/**/*.tsx` in `include` così `npx tsc --noEmit` copre anche `manager.tsx` (prima escluso, stesso gap presente — e non coperto — nel progetto di riferimento); `package.json` con nuove devDependencies `@types/react@^19.2.0` e `@types/react-dom@^19.2.0` (risolte a `19.3.0`, coerenti con React 19.2.7 del progetto).
- ✅ `.storybook/preview.css`: aggiunto import di `./story-utilities.css` dopo `globals.css`/`adapters/formidable.css` (import già presente); `@source '../src/stories'` e `@source '../src/templates/**/*.stories.js'` per generare in Storybook le utility usate solo nelle story; portate le safelist `@source inline(...)` della palette Tailwind di default e delle brand scale (`bg-brand-blue-*`, `bg-brand-orange-*`, adattate ai nomi reali dei token di questo sample — niente `logo-red`/`brand-red`/`surface`, assenti qui) per le story styleguide Palette in arrivo dall'agent parallelo.
- ✅ `.storybook/main.ts`: stories glob esteso a `['../src/stories/**/*.stories.@(ts|js)', '../src/templates/**/*.stories.@(ts|js)']` (prima solo `src/templates`); resto invariato.
- ✅ `.storybook/preview.ts`: `storySort.order` aggiornato a `['Styleguide', ['Logo','Layout','Palette','Typography','Borders','Shadows','Icons'], 'Base', 'Blocks', 'Layout']` (prima `['Base','Blocks','Forms']`); temi, decorator moduli con dispose, `codePanel`, `a11y: { test: 'todo' }`, viewport e `backgrounds: { disable: true }` invariati.
- ✅ `src/css/globals.css`: aggiunto `@source not '../templates/**/*.stories.js';` subito dopo `@source '../templates';` così le classi usate solo nelle story non finiscono nella build di produzione.
- ✅ Verificato che Tailwind 4.1.17 supporta `@source not` (il parser dell'at-rule `@source` in `tailwindcss/dist/chunk-*.mjs` riconosce esplicitamente il prefisso `not `, flag `negated`) con una prova end-to-end: story sonda temporanea con due classi mai usate altrove nel sample (`mix-blend-luminosity`, `backdrop-grayscale`) sotto `src/templates/**/*.stories.js`; `npm run build` con cache Vite pulita → nessuna regola `.mix-blend-luminosity{…}`/`.backdrop-grayscale{…}` in `dist/css/globals.min.css`, mentre una classe reale (`aspect-square`, usata nei `.twig`) resta presente; story sonda rimossa a fine verifica, non commessa.
- ✅ Verifiche: `npx tsc --noEmit -p tsconfig.json` verde (0 errori); `npx eslint .storybook --ext .ts,.tsx` verde (0 errori, i soliti 3 warning `no-explicit-any` pre-esistenti in `twig.ts`, non toccato); `npx storybook build --output-dir <TEMP>/sb-step2` completata ("Storybook build completed successfully"), CSS generato conferma sia i simulatori di stato (`is-hover`) sia le utility di `story-helpers.ts` (`bg-muted/40`), output rimosso a fine verifica; `npm run build` del sample verde.
- ⚠️ Nessuna storia reale sotto `src/stories/styleguide/` esisteva ancora al momento di questo step (in scrittura da un agent parallelo): le safelist della palette in `preview.css` sono quindi verificate solo per sintassi/costruzione, non ancora contro una story `Palette` reale.

### Fase 8 — Step 3 Styleguide (agent Sonnet)

- ✅ `src/stories/styleguide/` nuovo, 7 file, equivalente all'omonima cartella del progetto di riferimento ma adattato ai token/asset reali di questo sample (mai copiati i valori brand del progetto di riferimento): `_helpers.js` (porting 1:1, commenti tradotti in inglese), `logo.stories.js`, `layout.stories.js`, `palette.stories.js`, `typography.stories.js`, `borders.stories.js`, `shadows.stories.js`, `icons.stories.js`. Titoli `Styleguide/Logo|Layout|Palette|Typography|Borders|Shadows|Icons`, copy UI in italiano, codice/commenti in inglese.
- ✅ `palette.stories.js`: Semantic Colors su tutti i token di `globals.css` (background/foreground, card, popover, primary, secondary, muted, accent, destructive, border, input, ring, ring-offset, chart-1..5, sidebar-*) letti live da computed style con toggle tema; Alpha Overlays su `--ws-alpha-5…90` (identici al progetto di riferimento in questo sample); Brand Palette sulle scale PROJECT-OWNED reali (`brand-blue` default 800 = `--primary` chiaro, `brand-orange` default 400 = `--secondary` chiaro, non `brand-red`/`logo-red` del progetto di riferimento che qui non esistono) con badge di contrasto WCAG; Tailwind Palette completa (22 hue × 11 step) come nel progetto di riferimento.
- ✅ `typography.stories.js`: sistema a **tre** font (non due) — DM Sans (font-sans, variable 100–1000, italic), Tenor Sans (font-serif, stile singolo 400, no italic), Geist Mono (font-mono, variable 100–900) — verificati da `globals.css` (`--font-sans/--font-serif/--font-mono`) e `main.json` (`fonts.googleFontsUrl`); Tester con toggle a 3 famiglie; heading H1/H2 = quelli realmente usati dai componenti (`hero.twig` text-5xl, `card-grid`/`faq`/`text-only` text-3xl), H3–H6 estrapolati e segnalati come non ancora in uso; nuova story "Responsive Scale" che sostituisce la "Heading Tokens" del progetto di riferimento (qui inesistente) leggendo live `--ws-text-{key}-font-size/-line-height`, responsive a ≥768px.
- ✅ `borders.stories.js`: scala radius riscritta sulla formula moltiplicativa reale di questo progetto (`--radius × {0.2,0.6,0.8,1,1.4,1.8,2.2,2.6}`, non i valori shadcn di default del progetto di riferimento); width/color dei bordi invariati (Tailwind generico).
- ✅ `shadows.stories.js`: porting sostanzialmente 1:1 (shadow/inset-shadow/drop-shadow/blur di questo sample sono identici ai default shadcn v4 già nel progetto di riferimento).
- ✅ `layout.stories.js`: spacing scale/utilities, breakpoints, containers, grid system/alignment, gutters, flex, display & visibility, position invariati (meccaniche Tailwind generiche, breakpoint non ridefiniti nel progetto); nuova story "WS Spacing Scale" al posto delle "Section Tokens"/"Section Padding Scale" del progetto di riferimento (token `--ws-section-*` inesistenti qui): legge live `--ws-spacing-xs…9xl` ed espone `p-ws-*`/`gap-ws-*`/`m-ws-*`.
- ✅ `logo.stories.js`: nessun asset immagine logo in questo sample (niente `layout.site.logo` in `main.json`, niente file in `src/assets/img`/`src/public`) — pagina costruita intorno a ciò che esiste davvero: il wordmark testuale `layout.site.name` in `font-serif` (identico a `header.twig`/`footer.twig`) e l'icona `#icon-websolute` dello sprite (fill bianco hardcoded nell'SVG sorgente, quindi illeggibile su sfondi chiari — mostrato anche come don't).
- ✅ `icons.stories.js`: elenco icone non hardcoded ma derivato da `import.meta.glob('../../assets/icons/*.svg')` (41 icone reali del sample, diverse da quelle del progetto di riferimento); ricerca live invariata.
- ✅ Sezioni del progetto di riferimento scartate perché i token non esistono in questo sample: Typography → "Heading Tokens" (`--ws-heading-*`/`--ws-display*`); Layout → "Section Tokens" e "Section Padding Scale" (`--ws-container-padding-x`, `--ws-section-padding-y`, `--ws-section-title-gap-*`, `--ws-section-py-*`); Palette → riga "Off-white" dei Neutrals (nessun token `--color-surface` qui).
- ✅ `@source inline` richiesti per `palette.stories.js` (bg-<hue>-<step> e bg-<slug>-<step> costruiti dinamicamente) già presenti in `.storybook/preview.css` (scritti dall'agent parallelo dello Step 2): palette Tailwind completa, `bg-brand-blue-*`, `bg-brand-orange-*`, `text-{black,white}`; nessun altro file della cartella necessita di safelist (le classi che usano sono letterali, già scansionate da `@source '../src/stories'`).
- ✅ Verifiche: `npx eslint src/stories --ext .js` → 0 errori dopo `--fix` (281 errori di indentazione/virgole auto-fixabili, rimangono 15 warning `storybook/no-redundant-story-name` sulle story con `name:` esplicito per un'etichetta più leggibile — stesso pattern del progetto di riferimento); `.storybook/main.ts` già includeva `../src/stories/**/*.stories.@(ts|js)` (nessuna attesa necessaria); `npx storybook build --output-dir <TEMP>/sb-step3` → "Storybook build completed successfully", tutti i chunk delle 7 story compilati senza errori; output rimosso a fine verifica.

### Fase 8 — Step 4 Base: Default + Catalog + argTypes (3 agent Sonnet)

- ✅ Tutti i 60 `base/<name>/<name>.stories.js` riscritti nella forma del progetto di riferimento: `Default`
  (playground Controls da `mocks.default`) + story `play` interattive (`initModules`, invariate
  dalla Fase 7 dove già presenti) + `Catalog` (`storyStack` di `demoCard`/`matrixCard`: varianti
  × taglie × stati, con tutti gli scenari mock ripiegati dentro le griglie invece che elencati
  piatti) + `argTypes` completi dall'header `{# params #}` di ogni `.twig` (descrizione in
  italiano, `table.category`, `defaultValue`). I componenti fullscreen (`sidebar`,
  `message-scroller`) restano senza `Catalog` in sidebar dov'era già così in Fase 7.
- ⚠️ Divergenze dal pattern del progetto di riferimento perché le API Twig di questo sample differiscono:
  nessun action-button sonner in stile toast, nessuna variante `bordered` per accordion, i menu
  usano `items` piatti con `kind` invece della struttura ad albero del progetto di riferimento,
  breadcrumb/pagination sono data-driven via `items`, select usa `options` con `kind`, kbd usa
  un array `keys`.

### Fase 8 — Step 5 Blocks, Layout, Form (agent Sonnet)

- ✅ I 4 `Blocks/*` (card-grid, cta-banner, faq, text-only) con `argTypes` completi + story di
  variante oltre a `Default`.
- ✅ Nuovi `Layout/Header` (`Default`, `WithoutHeaderCta`, `MobileMenuOpen`), `Layout/Footer`,
  `Layout/Hero` (mock inline preso da `index.twig` via `renderTwigSource`), `Layout/Main Menu`,
  `Layout/Page Dispatcher` (`src/templates/components/components.stories.js`, dispatcher
  `page.components[]`).
- ✅ Demo form spostata sotto il titolo `Base/Form` (prima `Forms/*` in Fase 7) con un `Catalog`;
  riferimenti a `Forms/*` da riallineare nella documentazione (fatto nello Step 6).
- ✅ Verifica: harness di render Node (bundling di ogni file story con esbuild, chiamata di ogni
  `render`) — tutti i file OK; `eslint` 0 errori; `tsc` 0 errori; `storybook build` verde.

### Fase 8 — Step 6 Documentazione e scaffold (agent Sonnet)

- ✅ `.claude/skills/shadcn-port/scripts/scaffold-stories.mjs` riscritto per la nuova forma:
  genera `Default` (`args: mocks['default']`), `argTypes` parsati dall'header `{# Params: #}` di
  `<name>.twig` (enum → `select` + `options`; `Boolean` → `boolean`; `Number` puro → `number`;
  `Array`/`Object`/`{…}` → `object`; `String`/tipi misti → `text`; `class`/`attrs` →
  `table: { disable: true }`; una riga `- blocks: <nomi>` documenta i `{% block %}` del
  componente e non diventa mai un argType), categoria euristica (`Content`/`Appearance`/
  `Behaviour`/`State`/`Accessibility`/`Advanced`) e `Catalog` con un `demoCard` per scenario
  mock (titolo = nome scenario "umanizzato"). Descrizioni copiate verbatim in inglese
  dall'header — la traduzione in italiano resta un passaggio manuale, come per ogni altro
  `argTypes` scritto a mano in questo sample. Nuovo flag `--stdout` (stampa il file generato per
  un solo `<name>` senza scriverlo, incompatibile con `--all`) per rivedere l'output senza
  toccare le story reali. CLI, idempotenza e `--force` invariati.
- ✅ Testato con `--stdout` su una decina di componenti con header eterogenei (button, dialog,
  accordion, select, checkbox, field, kbd, slider, pagination, sonner, cta-banner) senza
  scrivere alcun file reale; un bug di parsing corretto durante il test (la riga
  `- blocks: trigger, header, body, footer` di dialog.twig veniva letta come un param enum
  spurio "blocks" per via delle stringhe tra virgolette nella riga di continuazione
  `attrs: 'data-dialog-close'"`).
- ✅ `npx eslint .claude/skills/shadcn-port/scripts/scaffold-stories.mjs --no-ignore` → 0
  errori/warning (un errore quote singole corretto durante il lavoro); gli altri file della
  cartella (`lib/classes.mjs`, `lib/registry.mjs`, `lib/twig.mjs`, `probe-registry.mjs`)
  restano con gli errori pre-esistenti già segnalati in Fase 7, non toccati in questo step.
- ✅ `PORTING.md` § Story shape riscritta per la nuova forma (`Default` + `play` + `Catalog` +
  `argTypes`, sotto-sezioni dedicate ad `argTypes`/`play`/`Catalog`/titoli, riferimenti a
  `story-helpers.ts`, `stateProps`, `renderTwigSource`, ADR 0004); tabella "Files per
  component" invariata (il rimando a Story shape resta valido).
- ✅ `docs/adr/0004-storybook-twigjs.md`: nuova sezione "Aggiornamento (Fase 8)" — parità
  organizzativa con il progetto di riferimento (Styleguide, Catalog, pannello Parametri, simulatori di stato,
  `@source not` per tenere le utility story-only fuori dal CSS di produzione, `renderTwigSource`).
- ✅ `README.md` § Storybook: tassonomia `Styleguide/*`/`Base/*`/`Blocks/*`/`Layout/*` e il
  pannello "Parametri"; riferimento a `Forms/*` per la demo form aggiornato a `Base/Form`
  (spostata nello Step 5); `CONTEXT.md` voce glossario Storybook allineata alla stessa
  tassonomia.
- ✅ `docs/DECISIONS.md` #12 Showcase: aggiornata con Styleguide + Catalog per componente al
  posto dell'elenco piatto "una story per scenario mock" della Fase 7.
- ✅ `docs/WORKLOG.md`: aggiunte le sezioni Fase 8 Step 1/4/5/6 (questa), Step 2/3 già presenti
  invariate, ordine 1→6.
- ✅ `docs/reports/phase-8-storybook-organisation.md` nuovo (formato phase-7-storybook.md).
- ⚠️ Non risolto in questo step (segnalato, non a carico di questo batch): verifica nel browser
  a carico dell'utente (`npm run storybook`); l'icona `#icon-websolute` ha `fill="white"`
  hardcoded nell'SVG, illeggibile su sfondi chiari (Step 3); nessun sonner action-button né
  variante accordion `bordered` disponibili in questo sample (Step 4, limite delle API Twig
  esistenti, non del porting delle story).

### Fase 8 — Verifica finale (orchestratore)

- ✅ Render Node di tutti i file di story: 76/77 OK; `styleguide/icons.stories.js` non è eseguibile nel test Node (usa `import.meta.glob`, solo Vite) ed è coperto dalla build di Storybook.
- ✅ `tsc --noEmit` 0 errori; eslint su `.storybook` e `src` 0 errori.
- ✅ `storybook build` verde: 227 story; Styleguide 7 pagine, Base 61 componenti (tutti con `Catalog` tranne Sidebar, shell fullscreen), Blocks 4, Layout 5.
- ✅ `npm run build:wordpress-tailwind` verde; `globals.min.css` senza le utility dei simulatori di stato (`is-hover` assente): `@source not` efficace.
- ✅ `.storybook/twig.ts` esporta `renderTwigSource`: card, empty, scroll-area e field riempiono i block con `{% embed %}` invece di copiare il markup a mano.
- ✅ Step 9 e Definition of done di `shadcn-port/SKILL.md` aggiornati alla nuova forma delle story.
- ⚠️ Verifica nel browser (temi, pannello Parametri, `play`, a11y, tastiera) a carico dell'utente.

## 2026-09-25

### Fase 8 — Story con `play` ridotte agli stati solo-JS (agent Sonnet)

- ✅ Regola: il decorator di `preview.ts` inizializza già i moduli, quindi una `play` che chiama solo `initModules` è ridondante; una `play` interattiva resta solo se lo stato non è esprimibile con le props (overlay, pannelli flottanti, toast, filtri live). Documentata in `PORTING.md` §Story shape e in `shadcn-port/SKILL.md` step 9.
- ✅ Story eliminate: accordion `Expanded`, collapsible/toggle/toggle-group `Toggled`, tabs `KeyboardSwitch`, carousel `NextSlide`, sidebar `ToggledWithKeyboard`/`ToggledWithTrigger`, calendar/slider/message-scroller `Mounted`, sonner `Types`. Tabs: aggiunta al `Catalog` la card "Custom initial tab" (`defaultValue`).
- ✅ `play` tolte, story mantenute perché configurazioni diverse da `Default`: avatar `BrokenImage`, resizable `HorizontalWithHandle`/`Vertical`, message-scroller `DirectionStart`, sidebar `DefaultOpen`, drawer/sheet per lato, `Catalog` di calendar/combobox/command/date-picker/sonner, Form `Native`/`Catalog`.
- ✅ Story con `play` rimaste (16 file): overlay e menu, select, combobox, date-picker, command, sonner `Toast`, tooltip, header `MobileMenuOpen`, e input-otp `Typed` (il twig non ha un parametro `value`, lo stato compilato esiste solo digitando).
- ✅ Render Node 19/19 file modificati OK, eslint 0 errori; Storybook serve 212 story.

### Fase 8 — Card attorno alle story `Default` (orchestratore)

- ✅ Nuovo decorator `withPlaygroundCard` in `.storybook/preview.ts`: ogni story `Default` (70, tra Base, Blocks e Layout) viene avvolta nella stessa card dei `Catalog` (`demoCard`, titolo = nome del componente, intro "Playground: modifica i parametri dal pannello Controls."). Con layout `fullscreen` la card ha un margine `p-4`; opt-out per story con `parameters: { playgroundCard: false }`. Documentato in `PORTING.md` §Story shape.
- ✅ I pannelli flottanti non vengono tagliati dall'`overflow-hidden` della card perché `src/js/common/floating.js` usa `position: fixed`.
- ✅ `tsc` 0 errori, `storybook build` verde.
- ⚠️ Resa visiva da controllare nel browser, in particolare Blocks, Layout e Sidebar, che sono a tutta pagina.

### Fase 8 — ButtonGroup verificato su Figma (orchestratore)

- ✅ Pagina Figma ButtonGroup (`18686:23344`, circa 45 esempi) letta con il Figma MCP. Regola del kit: estremità esterne del gruppo con il radius a pillola `rounded-4xl` (26px), giunzioni ad angolo vivo, bordi fusi, in orizzontale e in verticale, anche con pulsanti di testo (`21178:6531`). Il template la rispetta già.
- ✅ Chip `kind: text` di `button-group.twig` da `rounded-md` a `rounded-4xl`: nel kit i prefissi sono pulsanti a pillola (`21178:6504`). Eccezione Figma in `scripts/upstream-exceptions.json`, `check:classes` OK.
- ✅ Lacuna trovata e corretta: select, dropdown-menu, popover e tooltip avvolgono il trigger nel root del modulo, quindi le regole di giunzione di button-group non lo raggiungevano e gli split button non si fondevano come in Figma. Aggiunte le stesse regole su `[data-module] > [data-slot$=-trigger]`, in orizzontale e in verticale; riga nella Adaptation table di `PORTING.md`. La regola upstream del select in coda resta invariata: con il nostro markup non scatta.
- ✅ Story: i pulsanti icona di button-group usano `icon-sm` accanto a `sm`, altrimenti le altezze sfalsano di 4px.
- ✅ `Catalog` esteso da 3 a 8 card sui pattern Figma: taglie, varianti, gruppi annidati e paginazione, input, select e dropdown, contatore e Field, verticali. Icone assenti nello sprite sostituite con le più vicine (archivio, allineamento testo, cuore del Like).
- ⚠️ Residuo: l'input dentro un gruppo ha 22px di radius (misura Figma del componente input), mentre gli InputGroup negli esempi ButtonGroup del kit mostrano 26px. Non modificato: è una misura del componente input, da decidere a parte.

### Fase 8 — AlertDialog: icone e colori dal Figma

- ✅ Pagina Figma AlertDialog (`17047:204630`, 5 esempi) letta con il Figma MCP: slot media con icone `smile`, `circle-fading-plus`, `bluetooth`, `trash-2`, e variante distruttiva con media `bg-destructive/10 text-destructive`.
- ✅ Icone lucide-static v1.47.0 aggiunte a `src/assets/icons/`. Nuovo parametro `mediaVariant` (`default`/`destructive`) in `alert-dialog.twig`; ricalca il `className` che upstream mette su `AlertDialogMedia` nell'esempio distruttivo. `check:classes` OK.
- ✅ Mock e `Catalog` estesi ai 5 scenari del kit.
- ⚠️ Scostamenti rimasti, non modificati: nel kit il pannello ha `rounded-4xl` e `shadow-xl` (qui `rounded-lg` e `shadow-lg`), il media è `rounded-full` (qui `rounded-md`) e il pulsante distruttivo è tenue (`bg-destructive/10 text-destructive`), mentre il `button` destructive qui è pieno.

### Fase 8 — Badge allineato al Figma

- ✅ Pagina Figma Badge (`17083:177439`) e component set `Badge` (`26:169`) e `Badge Number` (`17100:10130`) letti con il Figma MCP. La nota di B2a "badge già coerente" non era corretta.
- ✅ `badge.twig`: nuovi parametri `iconAfter` (icona dopo il label, stesso nome del button) e `size: 'number'` (contatore `h-5 min-w-5 px-1`). Destructive tenue (`bg-destructive/10 text-destructive`, `/20` in dark), Outline con `bg-background`, hover del Figma (`/80` su default e secondary, `destructive/20`, `bg-muted text-muted-foreground` su outline e ghost), focus con anello da 1px e bordo `ring/30`. Dieci eccezioni Figma in `scripts/upstream-exceptions.json`, `check:classes` OK.
- ✅ Icona `badge-check` (lucide-static v1.47.0) aggiunta a `src/assets/icons/`.
- ✅ Story: argType `size`/`iconAfter`, nuova story `Number`, `Catalog` con le card With icon (esempi del kit), Number, States (Default/Hover/Focus sulla forma `<a>`) e As link.
- ⚠️ La variante `link` resta: viene da shadcn, nel kit non esiste. Resa visiva da controllare nel browser.

### Fase 8 — Alert: esempi del Figma

- ✅ Pagina Figma Alert (`17047:26054`, 14 esempi) letta con il Figma MCP. La story ne copriva 6 (2 varianti × 3 configurazioni).
- ✅ `alert.twig`: nuovo block `action` con wrapper `data-slot="alert-action"` (`absolute top-2.5 right-4`) e `has-data-[slot=alert-action]:pr-18` sul root. È un backport di `AlertAction`, che upstream esiste negli stili radix-nova ma manca in new-york-v4. `check:classes` OK (5 EXTRA, attese).
- ✅ Icona `circle-alert` (lucide-static v1.48.0) aggiunta a `src/assets/icons/`.
- ✅ Mock e `Catalog` estesi a tutti gli scenari del kit: combinazioni di contenuto, testi lunghi, destructive con lista, azione (outline/default `xs`), icone semantiche, colori custom amber (via `class` con modificatore `!`). Verificato in light/dark con Chromium headless: 20 alert, nessun errore console legato all'alert.
- ⚠️ Scostamenti rimasti, non modificati: nel kit il root ha `rounded-2xl` e `gap-2` tra icona e testo (qui `rounded-lg` e `gap-x-3`). Alert non ha un file in `tokens/figma-components/`, quindi segue upstream.
- ✅ Card "Vertical" del `Catalog` riallineata ai nodi Figma `21178:6533` (coppia + e −, taglia `icon`) e `21178:6534` (toolbar verticale: gruppo cerca, copia, condividi; gruppo flip orizzontale, flip verticale, ruota; pulsante trash isolato; tutti `icon-lg` outline, distanza 8px). Aggiunte allo sprite le icone lucide `share`, `flip-horizontal`, `flip-vertical`, `rotate-cw`, `trash` (lucide-static, procedura di `PORTING.md`). Tolta la cella "With text" verticale dalla matrice Orientation × Content type.

### Fase 9 — Accordion: allineamento al Figma

- ✅ Nodi Figma `21119:34330` (Accordion/Border), `21119:39705` (Border dentro una Card) e item base `22:516` letti con il Figma MCP.
- ✅ `accordion.twig`: trigger `items-center p-4` (prima `items-start py-4`), chevron senza `translate-y-0.5`, contenuto `px-4`, voce aperta con sfondo `data-[state=open]:bg-muted/50`. Nuovo parametro `variant: 'border'` (root `overflow-hidden rounded-2xl border`, item `px-4`) e `data-variant` sul root. Tre eccezioni Figma in `scripts/upstream-exceptions.json`, `check:classes` OK.
- ✅ Mock `border` e story: argType `variant`, card Border e Border in a card nel `Catalog`. Verificato con Chrome headless.
- ⚠️ Nel kit la Card ha `rounded-4xl` e shadow `md`; `card.twig` segue ancora upstream (`rounded-xl`, `shadow-sm`). Le classi `w-80`/`w-96` passate dalle story non hanno effetto (le story non sono tra i sorgenti scansionati da Tailwind).
