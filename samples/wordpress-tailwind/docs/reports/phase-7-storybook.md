# Report — Fase 7: integrazione Storybook (2026-09-18)

Quattro batch (agent Sonnet/Opus), sostituiscono la docs page generata (`src/docs/**`) con
Storybook 10 (`@storybook/html-vite`, compilazione Twig runtime via twig.js). Nessun fix
bloccante. Dettaglio batch per batch in [WORKLOG.md § Fase 7](../WORKLOG.md).

## Cosa è stato costruito

| Batch | File principali |
|---|---|
| B1 — engine | `.storybook/{main,preview,twig,twig-functions,modules,spritemap,fonts}.ts`, `preview.css`, `tsconfig.json` standalone |
| B2a — scaffold | `.claude/skills/shadcn-port/scripts/scaffold-stories.mjs` + wrapper `scripts/scaffold-stories.mjs`, `lib/paths.mjs` esteso; 60 `base/*.stories.js` + 4 `blocks/*.stories.js`; mock dei 4 blocks migrati a `<name>/<name>.twig.json`; `src/templates/stories/forms/{form-demo,formidable-demo}.twig` + `forms.stories.js` |
| B2b — interattività | 30 story `play` aggiunte (import `initModules` da `~sb/modules`, trigger reali letti da `.twig`+`.module.js`); smoke render Node temporaneo (mai commesso) |
| B3 — rimozione | eliminati `src/docs/**` (22 file), `component-section.twig`, `register-docs.mjs`, `docsManifestFile`, global `docs`; link riallineati a `/storybook/` |
| B4 — documentazione | questo report, `docs/adr/0004`, `DECISIONS.md` #11/#12, `PORTING.md`, `README.md`, `CONTEXT.md`, `WORKLOG.md`; rimosso `docs/HANDOFF-storybook.md` |

## Verifica

| # | Verifica | Esito |
|---|---|---|
| 1 | `npx tsc --noEmit -p tsconfig.json` (`.storybook/**/*.ts`) | PASS |
| 2 | `npx eslint .storybook --ext .ts` | PASS (0 errori, 3 warning `no-explicit-any` sui cast Twig, stesso pattern di area-broker) |
| 3 | `npx eslint src/templates --ext .js,.mjs` (story generate/rifinite) | PASS (0 problemi) |
| 4 | `npx storybook dev -p 6006 --no-open --ci` | PASS ("Storybook ready!", nessun errore twig/indexer) |
| 5 | `npx storybook build --output-dir dist/storybook` | PASS ("Storybook build completed successfully") |
| 6 | Smoke render Node (script temporaneo, mai commesso) | PASS — 307/307 combinazioni `template.twig × scenario mock` |
| 7 | `npm run build:wordpress-tailwind` dopo la rimozione della docs page | PASS |
| 8 | `check:classes` dopo la rimozione della docs page | PASS |
| 9 | Dev server boot dopo la rimozione della docs page | PASS |

## Punti aperti

1. **Verifica browser** (focus trap, animazioni, floating-ui, delay `pointerenter` di hover-card/tooltip): non eseguibile in questa sessione, nessun tool browser disponibile. Il render Node (voce 6) conferma solo l'assenza di errori Twig, non l'esito visivo/interattivo. A carico dell'utente.
2. **Smoke test `ws create`**: PASS (B4b). Progetto scaffoldato fuori dal monorepo con `@websolutespa/ws-vite@0.0.12` da npm: `check:types`, `build`, `build:storybook`, `build:vercel`, eslint verdi; Storybook dev serve 337 story (Base 331, Blocks 4, Forms 2); nessun path del monorepo residuo. Dettagli in `WORKLOG.md` § Fase 7 B4.
3. **`docs/SHADCN.md`**: referenziato da README/WORKLOG ma assente nel sample (gap pre-esistente, non introdotto da questa fase; non creato in questo batch, solo segnalato).
4. **Follow-up non fatti**: `story-helpers.ts`/catalog grid/`manager.tsx` di area-broker non portati; `components/layout/*` senza story; `addon-vitest` non aggiunto.
