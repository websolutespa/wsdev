# Report — Fase 5 / B8b: layout, blocks, index, documentazione (2026-09-18)

Agent Sonnet; revisione e commit dell'orchestratore.

## Layout (`components/layout/`)

- `header`: sticky, nome sito da `layout.site.name`, `main-menu` desktop, hamburger che apre uno `sheet` (side left, id `mobile-menu`) via `data-dialog-open` riusando `dialog.module`, toggle tema con icone `sun`/`moon`, CTA primaria da `layout.header.cta`.
- `main-menu`: `navigation-menu` desktop + lista verticale mobile, dati da `layout.menu[]` (5 voci, una con sottomenu ricco).
- `footer`: `separator` + `layout.footer.columns[]` (3 colonne), copyright e payoff.
- `hero`: badge eyebrow, `heading` h1|h2, abstract, gruppo `cta` + `navs[]`, media opzionale come `<img>` (nessun componente media nel sample).

## Blocks (`components/blocks/`, dispatch via `page.components[].schema`)

`text-only` (utility `prose-ws` project-owned in `globals.css`, senza plugin typography), `card-grid` (macro per card, struttura `data-slot` di `card`, griglia 1/2/3), `faq` (`accordion` single collapsible), `cta-banner` (band `bg-primary`/muted con markup card). Pagina `src/docs/blocks.twig` con un mock per block, linkata dall'indice docs.

## Index

`src/index.twig(.json)`: hero + text-only, card-grid (3 immagini demo), faq (4 voci), cta-banner + sezione "Component library" con link a components/forms/blocks. `404.twig` invariata.

## Documentazione

- `README.md` del sample riscritto allo stato finale (stack, albero, script, token, 60 componenti + 4 sostituzioni, workflow di porting, form, Integration API, docs pages, integrazione WP, browser support, tracking).
- Nuovo `docs/SHADCN.md` nel monorepo (Tailwind v4 in ws-vite, contratto delle nove zone, dark mode, metodo di porting, token Figma, pipeline `shadcn-port`, regola `globals.min.*`), linkato da `README.md` root e `docs/INTRODUCTION.md`.
- `PORTING.md`: sezione "Blocks and layout".

## Gate

`check:classes` exit 0 · `/index.html`, `/404.html`, `/docs/components.html`, `/docs/blocks.html`, `/docs/forms.html` 200 senza errori Twig, 0 id duplicati · build exit 0 con `js/globals.min.js` e `css/globals.min.css` referenziati · eslint solo i tolerati.

**Dry run WordPress** (`npm run build:wp`): copiati `views/components/layout/*` e `blocks/*` (`.twig`), `views/partials/resources/{css,js}.twig` (prod), `static/css/{globals.min.css,slider.min.css}`, `static/js/` (36 file incl. `globals.min.js`), `static/assets/*`; `static/img/` vuota (nessuna immagine passata dalla pipeline Sharp). Cartelle scratch eliminate, monorepo pulito.

## Note

- `card-grid` e `cta-banner` replicano la struttura di `card` (macro/markup) invece di includerla: evita l'embed dentro il loop e il conflitto `bg-primary`/`bg-card` a pari specificità. Commentato inline.
- `layout.menu[]` segue il contratto di `navigation-menu`, non l'`IMenu` generico dello schema ws-vite (già divergente per `layout.site`/`layout.wp`; schema solo editor-hint).
- Nota per il host theme: `build:copy:twig` copia solo `components/**`; i `base/*` inclusi dai layout viaggiano con la stessa copia. Le pagine `src/docs/*` e `index.twig` restano nel frontend workspace.
