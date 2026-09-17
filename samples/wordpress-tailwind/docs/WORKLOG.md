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

### Documentazione di processo

- ✅ Creati `docs/WORKLOG.md`, `docs/DECISIONS.md`, `docs/adr/0001–0003`, `docs/reports/*`, `CONTEXT.md` (commit `7bd18f0`). Regola: aggiornati a ogni batch prima del commit.
