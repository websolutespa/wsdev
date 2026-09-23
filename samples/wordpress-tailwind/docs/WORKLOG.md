# Diario di lavoro — sample `wordpress-tailwind`

Cronologia di ciò che è stato fatto, da chi (orchestratore o agent) e con quale esito. Le decisioni di progetto sono in [DECISIONS.md](DECISIONS.md) e negli [ADR](adr/); i report dettagliati per fase in [reports/](reports/). Il piano approvato vive fuori dal repo (`~/.claude/plans/questo-progetto-permette-di-prancy-lynx.md`).

Convenzione: una riga per attività, ordine cronologico, stato ✅ fatto · ⏳ in corso · ⛔ bloccato · ⚠️ nota aperta.

## 2026-09-17

### Analisi e piano

- ✅ Esplorazione di wsdev (CLI `ws create`, sample `wordpress` e `tailwind`, ws-vite) e di area-broker (Tailwind v4 CSS-first + shadcn portato in Twig) con due agent Explore in parallelo.
- ✅ Verifica del kit Figma `0vHlrWA2vzmhhZCeJQN3ZP` con `use_figma`: 6 collezioni di variabili, font DM Sans, primary `brand/blue/800`, bottoni 36/32/40 px, radius pill 26/22/14. Confronto misure vs registry `radix-vega`, `radix-nova`, `new-york-v4`: il kit è un ibrido `new-york-v4` + personalizzazioni. Dettagli in [reports/phase-0-analysis.md](reports/phase-0-analysis.md).
- ✅ Piano scritto e sottoposto a grill (`/grill-with-docs`, 20 domande): esiti in [DECISIONS.md](DECISIONS.md). Piano approvato.

### Fase 1 — Skeleton + pipeline WP + registrazione CLI (agent Sonnet)

- ✅ Cartella `samples/wordpress-tailwind/` creata dal sample `wordpress` (dotfiles, asset, media, meta, lazyLoad) con `package.json` `@wordpress-tailwind/web`, `vite.config.js` (`tailwind: true`, `twig.data` per i mock), `main.json` (+ `layout.wp`, `layout.site`), `globals.css` con le nove zone marker, `shadcn.css` vendorizzato (shadcn@4.21.0), `main.js`, `colorScheme.js` (`.dark`), layout con script no-flash, partial resources dev/prod, `fonts.twig` (Google Fonts), `404.twig`.
- ✅ Registrazione: wizard ws-cli (`wordpress-tailwind`), script root `dev/build/preview:wordpress-tailwind`, README (tabella Samples: aggiunte anche le righe mancanti `wordpress` e `drupal`), ROADMAP, CONTRIBUTING.
- ✅ Gate: `npm install` (ws-vite risolto dal workspace), build → `dist/css/globals.min.css` + `dist/js/globals.min.js`, dev server 200, eslint (solo i 2 errori `turbo/no-undeclared-env-vars` preesistenti in tutti i sample).
- ⚠️ Scoperte tecniche: il nome del bundle segue il CSS linkato nel layout solo con ≥ 2 pagine e con `<script>` prima di `<link>` (da qui `404.twig`); il prettifier HTML di ws-vite unisce le righe degli script inline (mai commenti `//` inline); in build Vite collassa i `..` dell'URL Google Fonts (`9..40` → `9.40`), il font carica ma senza range variabile — da indagare in Fase 5. Report: [reports/phase-1-skeleton.md](reports/phase-1-skeleton.md).

### Fase 2 — Token da Figma (agent Sonnet per skill ed export, orchestratore per apply)

- ✅ Skill `figma-tokens` copiata da area-broker e generalizzata (root discovery generico, routing `Brand`/`Responsive`, gruppi tipografici a 3 livelli, `reverse.mjs` riallineato), 49 test verdi. Report: [reports/phase-2-tokens.md](reports/phase-2-tokens.md).
- ✅ Export DTCG del kit con `use_figma` (874 variabili, 0 alias irrisolti) in `tokens/figma-export/` (git-ignored).
- ✅ Import: report-only 992/992 classificati → `--apply` → `globals.css` aggiornato solo dentro i marker. Due bug trovati e corretti dall'orchestratore: doppio suffisso alpha (`#FFFFFFF2F2`) → guardia sugli hex a 8 cifre in `toCssColor`; primitive nominate `--color-blue-*` (collisione con Tailwind) → famiglia = segmenti intermedi del path (`--color-brand-blue-*`) con il file Brand avvolto nella root di collezione. +2 test. Rimappatura `--text-*` sui token responsive e `--spacing-ws-*` aggiunte in `@theme inline`.
- ✅ Misure Figma dei 22 kit component esportate in `tokens/figma-components/*.json` (agent Sonnet, `use_figma`).

### Fase 2b — Skill `shadcn-port`

- ✅ `SKILL.md` scritto dall'orchestratore via `/prompt-master`; script (probe, fetch, check-classes, scaffold, register-docs, normalize/diff Figma) implementati da un agent Sonnet e testati su rete reale (registry: 61/63 disponibili, mancano `toast` e `questionnaire`). Report: [reports/phase-2b-shadcn-port.md](reports/phase-2b-shadcn-port.md).

### Commit

- ✅ `c5e599a` — fasi 1, 2, 2b (97 file nuovi, 6 modificati) su `feat/wordpress-tailwind`.

### Fase 3 — B1 fondamenta (agent Sonnet)

- ✅ Utility JS comuni (8 file da area-broker, `floating.js` + `--viewport-*`), `PORTING.md`, 34 icone lucide, docs page `src/docs/components.twig` (light + dark per scenario), componenti àncora button/separator/label/input/textarea/card/skeleton. 10 override Figma registrati (button pill + gap/padding, input/textarea radius e niente shadow), 3 disaccordi non applicati con motivo. Due bug di tooling corretti (`diff-figma-upstream` padding array; glob `twig.data` assoluti). Gate tutti verdi. Report: [reports/phase-3-b1-foundations.md](reports/phase-3-b1-foundations.md).
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

- ✅ Motore Storybook portato 1:1 da `area-broker/client/.storybook/`: `.storybook/main.ts` (framework `@storybook/html-vite`, addon a11y/docs/themes, `staticDirs: ['../src/public']`, `viteFinal` con `@tailwindcss/vite` e alias `~sb`), `twig.ts` (registry twig.js con reset a ogni esecuzione, id `rel` + `@components/...`, strip placeholder `%...%`), `twig-functions.ts` (mirror delle funzioni del plugin twig di ws-vite, puntatore a `docs/adr/0004-storybook-twigjs.md`), `modules.ts` (init `[data-module]:not(.init)` con dispose), `spritemap.ts` (sprite da `src/assets/icons/*.svg`), `fonts.ts` (nuovo: inietta i preconnect + lo stylesheet Google Fonts da `main.json`, stesso URL percent-encoded di `fonts.twig`), `preview.ts` (decorator `withThemeByClassName` + decorator moduli con dispose della story precedente prima del render), `preview.css` (import di `globals.css` + `adapters/formidable.css`, quest'ultimo Storybook-only perché resta commentato in `globals.css`).
- ✅ Adattamenti rispetto alla reference: `labels` derivate da `main.layout.labels` come in `vite.config.js`; global `mocks` aggregato da tutti i `components/**/*.twig.json` (`import.meta.glob` eager) e passato a `renderTwig` insieme a `main`/`labels`; nessun global `docs` (non pertinente in questo sample); `stories` puntato su `../src/templates/**/*.stories.@(ts|js)` (pattern unico, non i due path di area-broker); non portati `story-helpers.ts`, `story-utilities.css`, `manager.tsx`.
- ✅ `tsconfig.json` nuovo standalone (`target ES2022`, `module ESNext`, `moduleResolution bundler`, `strict true`, `types: ["vite/client"]`, `include: [".storybook/**/*.ts"]`); package.json sample con devDependencies Storybook 10.4.3/`@tailwindcss/vite`/`tailwindcss`/`twig`/`typescript`/`vite`/React 19 (versioni caret compatibili con quanto già installato nel monorepo: vite 6.4.1, tailwindcss 4.1.17, twig 1.17.1) e script `storybook`, `build:storybook`, `build:vercel`, `scaffold:stories`, `check:types`; root `package.json` con `storybook:wordpress-tailwind`, `turbo.json` con task `storybook` (`cache: false`, `persistent: true`); `.gitignore` del sample con `storybook-static`.
- ✅ Due bug di tipizzazione pre-esistenti nella reference area-broker (verificati con `npx tsc` anche lì) corretti nel porting: `image()` in `twig-functions.ts` tipizza `options` come `Record<string, unknown>` per l'indexing dinamico; il cast dei `twigFunctions` in `twig.ts` usa `as any` con commento puntuale (le typings di `@types/twig` per `extendFunction` accettano solo funzioni che ritornano `string`, ma `entries()` ritorna un array).
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
