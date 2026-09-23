# Report — Fase 4 / B5: famiglia menu + select (2026-09-17)

Agent Opus; revisione e commit dell'orchestratore. Dopo il batch: 40 componenti in `base/`.

## Architettura

`src/js/common/menuTree.js` (~270 righe, `createMenuTree(root, opts)`): livelli (un pannello aperto = posizione floating + roving nav + listener), submenu come fratelli del sub-trigger, checkbox/radio con `aria-checked`, typeahead, un dismiss layer per albero. Consumato da dropdown-menu (trigger bottone), context-menu (ancora virtuale dalle coordinate del puntatore, long-press 500 ms, Shift+F10) e menubar (barra orizzontale con `onHorizontal`). Rispetto al progetto di riferimento: menubar guadagna i submenu, Tab riporta il focus al trigger invece di lasciarlo sul body.

## Override Figma

| Componente | Da → a | Nodo | Note |
|---|---|---|---|
| dropdown-menu | `rounded-md`→`rounded-3xl`, `shadow-md`→`shadow-lg` (content) | 336:4988 | 22 px, `shadow/lg` |
| dropdown-menu | `rounded-sm`→`rounded-2xl`, `px-2`→`px-3`, `py-1.5`→`py-2` (item) | 91:278 | 18 px, 12/8 px → item 36 px |
| dropdown-menu | label `text-sm`→`text-xs` | 330:28602 | applicato nel twig, eccezione documentale |
| select | `rounded-md`→`rounded-3xl` (trigger e menu), `rounded-sm`→`rounded-2xl` (item), `shadow-md`→`shadow-lg`, `shadow-xs` rimosso, `gap-2`→`gap-1.5`, `py-1.5`→`py-2`, `pl-2`/`px-2`→`pl-3`/`px-3` | 21141:30000, 21141:29349, 118:2503, 118:2502 | solo i token bare; le forme `*:data-[slot=…]:gap-2` restano |

Non applicati: `gap-2`→`gap-2.5` (il kit si contraddice: 10 vs 8 px), `h-9` (già prodotto da `py-2`), padding verticale della label (token condiviso con gli item), radius 2 px della label (invisibile), fill `base/input` del trigger select (scelta cromatica, non geometria).

Port exception: `h-[var(--radix-select-trigger-height)]` rimosso dal viewport del select (senza il runtime Radix pinnerebbe la lista a 36 px); `max-h-(--available-height)` dimensiona il pannello.

## Decisione dell'orchestratore

context-menu e menubar non sono nel kit ma condividono con dropdown-menu la stessa superficie (stesse classi upstream di content/item): per evitare tre menu visivamente diversi ereditano gli stessi override, registrati come `source: "figma"` con nota "derived from dropdown-menu <node>". Eseguito in B6. Registrato in `DECISIONS.md` come default tecnico.

## Moduli ed eventi

- dropdown-menu / context-menu / menubar: in `menu:open` (`detail.focus`, per context-menu anche `{x,y}`), `menu:close`; out `menu:select {label, value, checked?}`, `menu:opened`, `menu:closed` (menubar aggiunge `index`).
- navigation-menu: viewport mode che sposta il pannello attivo e scrive `--viewport-width/height` misurati prima dello spostamento; `data-motion`; hover 150/300 ms; in `navigation-menu:open|close`, out `:opened|:closed {index}`.
- select: combobox select-only APG (`aria-activedescendant`, `data-highlighted`), typeahead anche da chiuso, `<select name>` nativo nascosto (`required`, reset, autofill), out `select:change {value,label}`, `select:opened|closed` + `change` nativo.

## Verifica tastiera

**Non eseguita** (nessun tool browser). Percorsi: ESC `dismiss.js:8-15` via `menuTree.js:239`, `select.module.js:88-91`, `navigation-menu.module.js:171-181`; frecce/Home/End `menuTree.js:210-233`, `select.module.js:152-172`; typeahead `keynav.js` via `menuTree.js:191`; focus return `menuTree.js:139`, `select.module.js:107`.

## Gate

`check:classes` 40/40 exit 0 (slot mancanti solo `*-portal`, `*-sub`, `*-trigger`) · docs page 200, 3.35 MB, nessun errore né id duplicati · build exit 0 con 5 chunk modulo + `menuTree.min.js` · eslint solo i tolerati.

## Note

- Un submenu aperto durante i 150 ms di zoom-in del pannello padre può essere clippato dal transform (come nel progetto di riferimento).
- Il posizionamento item-aligned di Radix per select non è riprodotto (popper `bottom-start` + `matchWidth`).
