# Report — Fase 8: riorganizzazione Storybook (2026-09-23)

Sei step (orchestratore + agent Sonnet), allineano l'organizzazione delle story a quella del
progetto di riferimento — Styleguide per famiglia di token, `Catalog` per componente, pannello
"Parametri" per `argTypes` — senza copiarne i valori (token, brand, nomi). Nessun fix
bloccante. Dettaglio batch per batch in [WORKLOG.md § Fase 8](../WORKLOG.md).

## Tassonomia prima/dopo

| | Prima (Fase 7) | Dopo (Fase 8) |
|---|---|---|
| Sidebar | `Base/*`, `Blocks/*`, `Forms/*` | `Styleguide/*`, `Base/*`, `Blocks/*`, `Layout/*` (`Base/Form` per la demo form) |
| Story per componente | Una story per scenario mock (export CSF 1:1, nessun `argTypes`) | `Default` (Controls da `mocks.default`) + `play` per gli interattivi + `Catalog` (`storyStack` di `matrixCard`/`demoCard`: varianti × taglie × stati, scenari mock ripiegati dentro le griglie) + `argTypes` completi |
| Pagine token | Nessuna | `Styleguide/*`: 7 pagine (Logo, Layout, Palette, Typography, Borders, Shadows, Icons) |
| Pannello controlli | Solo Controls/Actions/Docs di default | + pannello "Parametri" (`.storybook/manager.tsx`, addon `wordpress-tailwind/params`): description/categoria/default per ogni `argType` |
| Simulatori di stato | Nessuno (stati mostrati solo dov'erano raggiungibili via `play`) | `@custom-variant hover|focus-visible|active` Storybook-only (`story-utilities.css`) + `stateProps()` per celle di matrice statiche |
| CSS story-only in produzione | Non escluso esplicitamente | `@source not '../templates/**/*.stories.js'` in `globals.css`, verificato end-to-end |
| Scaffold | Un export CSF per scenario mock, nessun `argTypes` | `Default` + `argTypes` dall'header `{# Params: #}` + `Catalog` skeleton; nuovo flag `--stdout` |

## Conteggi finali

| Titolo | File | Story |
|---|---|---|
| `Styleguide/*` | 7 (`src/stories/styleguide/`) | Logo, Layout, Palette, Typography, Borders, Shadows, Icons |
| `Base/*` | 60 (`src/templates/components/base/*/*.stories.js`) | `Default` + `play` (dove c'è `.module.js`) + `Catalog` + `argTypes` su tutti |
| `Blocks/*` | 4 (card-grid, cta-banner, faq, text-only) | `argTypes` + story di variante |
| `Layout/*` | 5 (header, footer, hero, main-menu, `components.stories.js` → Page Dispatcher) | perlopiù senza `args` (leggono `main.json` diretto) |
| `Base/Form` | 1 (`src/templates/stories/forms/forms.stories.js`, invariato di percorso) | Native, Formidable |

## Cosa è stato costruito

| Step | File principali |
|---|---|
| 1 — Analisi (orchestratore) | Nessun file toccato: confronto Fase 7 vs il progetto di riferimento, piano in 6 step |
| 2 — Infrastruttura | `.storybook/story-helpers.ts`, `story-utilities.css`, `manager.tsx`; `preview.css`/`main.ts`/`preview.ts` aggiornati; `globals.css` `@source not`; `twig.ts` + `renderTwigSource` |
| 3 — Styleguide | `src/stories/styleguide/{_helpers,logo,layout,palette,typography,borders,shadows,icons}.stories.js` |
| 4 — Base | 60 `base/<name>/<name>.stories.js` riscritti (Default + play + Catalog + argTypes) |
| 5 — Blocks, Layout, Form | 4 `blocks/*.stories.js` con argTypes; `layout/{header,footer,hero,main-menu}.stories.js` + `components.stories.js`; form demo → `Base/Form` |
| 6 — Documentazione e scaffold | `scaffold-stories.mjs` riscritto (+ `--stdout`), `PORTING.md` § Story shape, ADR 0004, README, DECISIONS #12, WORKLOG, questo report |

## Divergenze dal pattern del progetto di riferimento

| Area | Progetto di riferimento | Questo sample | Motivo |
|---|---|---|---|
| Toast (sonner) | Action-button nel toast | Non disponibile | API Twig di `sonner.twig` non espone un action slot |
| Accordion | Variante `bordered` | Non disponibile | `accordion.twig` non porta questa variante |
| Menu (dropdown/context/menubar) | Struttura ad albero | `items` piatti con campo `kind` | Contratto dati di questo sample (PORTING.md) |
| Breadcrumb / Pagination | — | Data-driven via array `items` | Regola "liste = data-driven, mai embed in loop" (PORTING.md #5) |
| Select | — | `options` con campo `kind` (option/group/separator/label) | Contratto dati di `select.twig` |
| Kbd | — | Array `keys` | Contratto dati di `kbd.twig` |
| Scaffold: descrizioni argType | — | Copiate verbatim in inglese dall'header, tradotte in italiano a mano | Uno script non traduce prosa in modo affidabile; stesso passaggio manuale di ogni altro `argTypes` scritto a mano in questo sample |

## Verifica

Verifica finale orchestratore: render Node 76/77 (icons coperto dalla build), tsc ed eslint 0 errori, `storybook build` verde con 227 story, `build:wordpress-tailwind` verde e CSS di produzione senza utility delle story. Dettagli in `WORKLOG.md` § Fase 8 — Verifica finale.

## Punti aperti

1. **Verifica browser** (temi, `play`, pannello Parametri, a11y, tastiera): non eseguibile in
   questa sessione, a carico dell'utente con `npm run storybook`.
2. **Icona websolute** (`logo.stories.js`, Step 3): l'SVG sorgente ha `fill="white"` hardcoded,
   illeggibile su sfondi chiari — mostrato anche come don't nella pagina Logo, non corretto
   (fuori scope: è un asset, non una story).
3. **Divergenze API non colmabili in questa fase**: nessun action-button per sonner, nessuna
   variante `bordered` per accordion (vedi tabella sopra) — limiti delle API Twig esistenti,
   non del porting delle story.
