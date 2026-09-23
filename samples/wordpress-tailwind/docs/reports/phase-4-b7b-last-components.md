# Report — Fase 4 / B7b: ultimi componenti (2026-09-18)

Agent Opus; revisione e commit dell'orchestratore. Dopo il batch: **60 componenti** in `base/` (55 verificati dal gate, 5 skip dichiarati: aspect-ratio, calendar, chart, combobox, date-picker).

## Componenti

| Componente | Eccezioni | Comportamento |
|---|---|---|
| combobox | whole-component preesistente (da rivedere: le classi upstream sono tutte presenti) | input-group + listbox floating (`matchWidth`), filtro substring, `aria-activedescendant`, ESC svuota poi chiude (dentro il dismiss layer), modalità chips con `<template>`, `<select>` nativo (multiplo) come fonte del valore; in `combobox:open|close`, out `combobox:change`, `combobox:opened|closed` |
| command | nessuna | score 3/2/1/0.5, riordino intra-gruppo, attributi `cmdk-*` verbatim per i selettori upstream, `data-selected="true"`; variante dialog via `{% embed %}` di `dialog.twig` + macro importato; Ctrl/⌘K → `dialog:open`; out `command:select` |
| sonner | nessuna | toast e icone come `<template>` nel twig, vars upstream `--normal-*`, timer con pausa su hover/focus, `aria-live`, `role="alert"` per error; in `toast:show` su `document` + hook `[data-sonner-show]`; out `sonner:shown|dismissed`; un renderer per `position` |
| sidebar | nessuna | cookie `sidebar_state` 7 giorni, Ctrl/⌘B, trigger e rail, `data-state`/`data-collapsible`; mobile: `sidebar-inner` clonato dentro `sheet.twig` e aperto con `dialog:open`; cva variant/size sul menu-button; in `sidebar:toggle|open|close`, out `sidebar:changed {open, mobile}` |
| message-scroller | 1 port: `inset-s-1/2` → `start-1/2` (Tailwind 4.1 non ha `inset-s-*`) | stick-to-bottom, `data-autoscrolling`, `data-pending-scroll` fino al primo atterraggio, bottone `data-active`; utility `scrollbar-thin|none|gutter-stable` mancanti in shadcn@4.21.0 definite in `message-scroller.css` |

## `main.js` / `lazyLoad.js`

`eagerInit` era un no-op (path dinamico non risolvibile da Rollup): ora riceve un loader con `import()` statico, inizializza tutti i nodi e marca `init` subito; `lazyLoad.load()` salta i nodi già `init` e restituisce un dispose no-op quando nessun modulo combacia (bug latente). Registrati: `sonner.module`, `sidebar.module`, `command.module` (il root della variante dialog vive in un `<dialog>` chiuso, invisibile all'IntersectionObserver).

## Deviazioni dal progetto di riferimento

combobox con chips e mirror `<select>`; command con `cmdk-*` e riordino; sonner senza `window.toast` (evento `toast:show`); sidebar senza duplicazione del markup mobile (clone runtime nello sheet); message-scroller nuovo.

## Verifica tastiera

**Non eseguita** (nessun tool browser). Citazioni: combobox `combobox.module.js:228-256, 181-195, 257-265`; command `command.module.js:145-163, 181-187`; sidebar `sidebar.module.js:46-57, 133-138, 73-82`; sonner `sonner.module.js:83-131`; message-scroller `message-scroller.module.js:66-102`.

## Gate

`check:classes` 55 ✓ + 5 ○, exit 0 · docs page 200 (13,1 MB), 638 id senza duplicati · build exit 0 (`combobox.module` 5,4 kB, `sonner` 3,4 kB, `command` 3,4 kB, `sidebar` 2,0 kB, `message-scroller` 1,6 kB; `globals.min.css` 180 kB) · eslint solo i tolerati.

## Questioni aperte → B8

1. combobox: sostituire il `from: "*"` con due eccezioni documentali (`combobox-value`, `input-group-button` non raggiungibili) e far girare il gate reale.
2. sidebar: tooltip sui menu-button da collassata affidato a `title` (un embed nel `for` viola la regola 5 di PORTING.md); eventuale tooltip delegato a livello sidebar.
3. `scrollbar-*` da promuovere in `globals.css` (utility generiche in un css component-local).
4. Docs page a 13 MB: paginare per gruppo.
5. sonner `expand` come stack in hover (non lo stack 3D); swipe-to-dismiss assente.
