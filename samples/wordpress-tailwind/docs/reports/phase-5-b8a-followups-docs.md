# Report — Fase 5 / B8a: follow-up tecnici e docs page per gruppo (2026-09-18)

Agent Sonnet; revisione e commit dell'orchestratore.

## 1. `slot?` sui componenti àncora

`button.twig` (+ `labelClass?`), `separator.twig`, `label.twig` accettano `slot` con default al proprio nome. Consumer riallineati all'upstream: pagination (`pagination-link` per prev/next, come `PaginationLink` upstream; etichetta `hidden sm:block` ripristinata, 2 eccezioni port rimosse), carousel (`carousel-previous/next`), trigger di dialog/alert-dialog/sheet/drawer/popover/dropdown-menu/tooltip (`*-trigger`), date-picker (`popover-trigger`), button-group (`button-group-separator` via include), field (`field-label` via `label.twig`), attachment (`attachment-action` via `button.twig`). Esclusi per ragioni strutturali: context-menu, menubar, hover-card, item.

Gate: `extractTwigDataSlots` ora riconosce anche `slot: '…'` e `slot|default('…')`. Slot mancanti totali 30 → 23, tutti fuori portata (`*-portal`, `*-sub`, `*-overlay`, `*-anchor`, `tooltip-provider`, `alert-dialog-action/cancel`, `drawer-close`, `collapsible-trigger`, `combobox-value`, `input-group-button`).

## 2. Composizioni e combobox

- Campo `composition: true` nello schema e nel gate (`○ <name>: composition`); `date-picker` migrato dal `from: "*"`.
- combobox: rimossa la whole-component exception, il gate reale dà **MISSING 0** senza eccezioni (chiave eliminata da `upstream-exceptions.json`); restano 2 slot Base UI non ospitabili, documentati in `PORTING.md`.

## 3. CSS e font

- `@utility scrollbar-thin|none|gutter-stable` spostate in un blocco project-owned in coda a `globals.css`; `message-scroller.css` eliminato e rimosso da `components.css`.
- Google Fonts: risolto il collasso di `..` in build con la workaround (a): URL in `main.json` (`fonts.googleFontsUrl`) con `%2E%2E` e `<link href="{{ fonts.googleFontsUrl|raw }}">`. Verificato in `dist/index.html`.

## 4. Docs page per gruppo

`src/docs/components.twig` è ora l'indice (card per gruppo con conteggio + link a `forms`); `src/docs/components/<group>.twig` per gli 8 gruppi, resa condivisa in `src/templates/partials/docs/component-section.twig`; il manifest `docs` è iniettato come global Twig da `vite.config.js` (senza allargare il glob `data`, per evitare collisioni della chiave `page`). Dimensioni build: da un unico file di 13,1 MB a pagine tra 4 kB e 1,77 MB.

## Gate

`check:classes` exit 0, MISSING 0 ovunque · indice + 8 pagine gruppo + forms: 200, nessun errore Twig, 0 id duplicati · build exit 0 · eslint solo i tolerati.

## Aperto (fuori scope B8a)

Tooltip della sidebar collassata (attributo `title`), `expand`/swipe di sonner, slot Radix senza host.
