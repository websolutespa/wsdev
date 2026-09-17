# Registro delle decisioni — sample `wordpress-tailwind`

Decisioni prese con l'utente (sessione di grill del 2026-09-17) che governano il sample. Le tre decisioni architetturali difficili da invertire hanno un ADR dedicato in [adr/](adr/). Una riga per decisione: cosa, scelta, motivo, alternative scartate.

| # | Tema | Scelta | Motivo | Scartate |
|---|---|---|---|---|
| 1 | Identità del sample | **Frontend workspace** senza PHP, stesso contratto `build:wp`/`watch:wp` del sample `wordpress` (copia in `../views`, `../static` del host theme Timber) | Continuità con i progetti WP Websolute; testabile senza WordPress | Scheletro PHP/Timber nel sample; manifest.json per enqueue PHP |
| 2 | Nome e registrazione | Nuovo sample `wordpress-tailwind`, il `wordpress` SCSS resta | Nessuna rottura per chi usa il sample attuale | Sostituire `wordpress`; rinominare il vecchio |
| 3 | Token | Import **fedele** dal kit Figma (primary blu `#1e40af`, secondary arancio, scale `brand-blue`/`brand-orange`) | Coerenza totale con Figma; chi scaffolda cambia i token in Figma e re-importa | Neutralizzare primary/secondary; solo default shadcn |
| 4 | Base registry shadcn | **`new-york-v4`**; il kit è un ibrido new-york-v4 + personalizzazioni | Il kit non corrisponde a nessuno degli 8 stili attuali; new-york-v4 è la sua base storica ([ADR 0003](adr/0003-new-york-v4-base-figma-wins.md)) | `radix-vega` (ritmo bottoni simile ma non è la base del kit), `radix-nova`, `base-vega` |
| 5 | Figma vs upstream | **Figma vince sempre** sui kit component: si sostituisce solo l'utility in disaccordo, ogni override registrato in `scripts/upstream-exceptions.json` (`source: "figma"`, node id) | Fedeltà al design system aziendale mantenendo verificabilità con `check:classes` | Upstream vince; varianti "pill" project-owned |
| 6 | Riconciliazione componenti | Misure via `use_figma` → `tokens/figma-components/*.json` → `diff-figma-upstream` → override mirati; `get_design_context` solo se la struttura differisce | Deterministico ed economico | `get_design_context` per ogni variante; solo token |
| 7 | Token: sorgente e pipeline | Skill `figma-tokens` di area-broker (generalizzata) con `use_figma` per leggere tutte le variabili in una volta; export DTCG **git-ignored** | Il codice è la source of truth; export rigenerabile | Export committato |
| 8 | Tipografia responsive | `--text-*` di Tailwind rimappati sui token `Responsive` del kit (font-size + line-height, mobile-first, override a 48rem); spacing kit come `--spacing-ws-*` | Le classi upstream `text-2xl` rendono come in Figma senza toccarle | Lasciare i default Tailwind; solo font-size |
| 9 | Processo per componente | Pipeline in 9 step codificata nella skill `shadcn-port` con script dedicati, inclusa nel sample | Ripetibile nei progetti scaffoldati; verificabile | Solo PORTING.md + script; skill globale in ~/.claude |
| 10 | Ruoli modello | Fable orchestra (Figma, approvazioni, skill), Sonnet/Opus implementano (Opus per i moduli complessi), Haiku verifica; mai Fable per lavoro operativo | Costo token | — |
| 11 | Storybook | **Escluso** | Allineamento agli altri sample; docs page al suo posto | Storybook html-vite + twig.js come area-broker |
| 12 | Showcase | **Una docs page unica** `src/docs/components.twig` (manifest JSON, ogni scenario in light e `.dark`) | QA visiva e stress test di dismiss/focus; mai copiata nel host theme | Una pagina per componente; nessuna docs page |
| 13 | Form | Niente `form.twig`; `field` + `form.module.js` agnostico (Constraint Validation API) + adapter CSS opzionale per **Formidable** | Nei progetti WP i form arrivano spesso da Formidable con markup proprio | Portare `form` (glue react-hook-form); solo field |
| 14 | Componenti esclusi | `direction` (→ `dir="rtl"`), `form` (→ #13), `toast` e `questionnaire` (404 in new-york-v4) | Non portabili o senza senso in Twig | Escludere anche AI/chat, chart, calendar |
| 15 | Font | Google Fonts via `<link>` come il sample `wordpress`, tutte e tre le famiglie del kit (DM Sans, Tenor Sans, Geist Mono), in `layout/fonts/fonts.twig` così arriva nel host theme | Coerenza con il sample esistente | Self-host woff2 |
| 16 | Layout e blocks | 5 layout (meta, fonts, header, main-menu, footer, hero) + 4 blocks (text-only, card-grid, faq, cta-banner) | Dimostra il contratto `page.components[]` senza diventare lavoro di progetto | Solo layout; set esteso |
| 17 | Moduli JS | **Copiare e auditare** i moduli area-broker (comportamento, non brand); modello scelto per componente | Comportamento collaudato in produzione | Riscrivere da zero |
| 18 | Integration API | CustomEvent `<componente>:<verbo>` in ingresso, `<componente>:<participio>` in uscita, hook `data-*`; niente `window.*` | Contratto stabile per il host theme | Global `window.ws` |
| 19 | Floor browser | Baseline 2023 (Chrome/Edge 111+, Safari 16.4+, Firefox 128+) | Stesso floor di Tailwind v4 | Baseline 2024; polyfill |
| 20 | Verifica a11y/tastiera | Checklist APG per componente eseguita da Haiku con **Playwright MCP** (da configurare dall'utente prima dei batch interattivi) + axe | Ripetibile senza dipendenze nel sample | Test Playwright committati; verifica manuale |
| 21 | Git | Branch `feat/wordpress-tailwind`, un commit per fase/batch, PR finale, nessun push senza ok | Revisionabilità | Lavoro su main; un branch per batch |
| 22 | Documentazione | `CONTEXT.md` (glossario) + `docs/adr/0001–0003` nel sample; diario e report in `docs/` | Chi eredita il boilerplate capisce il perché | Solo README |

## Default tecnici decisi dall'orchestratore

- Dark mode con classe `.dark` su `<html>` e script inline no-flash prima dello stylesheet.
- Entry CSS unica `src/css/globals.css` linkata nel layout (`main.js` non la importa): il bundle si chiama `globals.min.*` e i partial prod del host theme lo referenziano.
- `@websolutespa/ws-vite: "*"` nel sample (la CLI lo riscrive in `latest` allo scaffold).
- `shadcn/tailwind.css` vendorizzato in `src/css/shadcn.css` invece di dipendere dal pacchetto npm `shadcn`.
- Scala radius moltiplicativa xs…4xl allineata ai token del kit (2/6/8/10/14/18/22/26 px con `--radius: 10px`).
- Primitive brand nominate `--color-brand-<hue>-<step>` per non ombreggiare la palette Tailwind (correzione fatta durante l'import).
