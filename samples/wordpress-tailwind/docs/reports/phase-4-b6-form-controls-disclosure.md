# Report — Fase 4 / B6: controlli form e disclosure (2026-09-17)

Agent Sonnet; revisione e commit dell'orchestratore. Dopo il batch: 50 componenti in `base/`.

## Task 0 — override derivati su context-menu e menubar

Applicati i cinque override di dropdown-menu (radius content/item, shadow, padding, label `text-xs`) a content/sub-content e item/checkbox/radio/sub-trigger di context-menu e menubar, registrati come `source: "figma"` con nota `derived from dropdown-menu <node> (same menu surface)`. Estensione dichiarata: gli item checkbox/radio di menubar usano upstream `rounded-xs` → mappati anch'essi a `rounded-2xl`. Toolbar e trigger di menubar (slot diversi) non toccati. `check:classes` 0 MISSING.

## Componenti

| Componente | Figma | Note |
|---|---|---|
| checkbox | `rounded-[4px]`→`rounded-[5px]` (17085:197594) | input nativo `appearance-none` + indicatore `peer-checked:grid`; `data-[state=checked]:`→`checked:` (4 port); nessun modulo, `indeterminate` fuori scope |
| radio-group | nessun override (16×16, gap 12 già upstream) | `<fieldset role="radiogroup">`, `options[]`; bug id duplicati risolto con prefisso `<id>-<name>-<value>` |
| switch | track `h-[1.15rem] w-8`→`h-5 w-11` (44×20), sm `h-3.5 w-6`→`h-4 w-7` (28×16) | thumb 16/12 px; `translate-x-[calc(100%-2px)]` sostituito da `translate-x-6.5`/`translate-x-3.5` (la formula upstream valeva solo con track = 2× thumb); radice `<label>` → `focus-visible:`→`focus-within:`, `disabled:`→`has-disabled:`, stati via `has-checked:`/`peer-checked:` (15 eccezioni documentate); nessun modulo |
| slider | track `h-1.5`→`h-2` (17089:43880) | markup upstream `slider-track`/`slider-range` + un `<input type=range>` per valore; thumb dipinto in `slider.css` (13 eccezioni port); `slider.module.js` scrive `--slider-from/--slider-to`, clamp dei due thumb, `slider:change {values}`; css registrato in `components.css` |
| toggle, toggle-group | upstream-only | `toggle.module.js` (`aria-pressed`, `toggle:change {pressed}`), `toggle-group.module.js` (roving ←/→, `toggle-group:change`) |
| input-otp | upstream-only | input nascosto + un `<input maxlength=1>` per slot (input reali, non span: focus/selezione/WebOTP), separatore `minus`, `input-otp.module.js` (avanzamento, Backspace, paste, ←/→, pattern), `input-otp:complete {value}`; fake caret upstream omesso (8 eccezioni) |
| accordion | upstream-only | button+region APG, `type`, `collapsible`; il modulo scrive `--radix-accordion-content-height` (keyframes di `shadcn.css`), roving ↑↓/Home/End, `accordion:change {value, open}` |
| collapsible | upstream senza classi | toggle `hidden` con `closeWithAnimation`, `collapsible:change` |
| tabs | upstream-only | `tabsListVariants` default/line, `activationMode automatic|manual` (nomi Radix), roving orientation-aware, `tabs:change {value}` |

## Adapter Formidable

`.frm_checkbox`/`.frm_radio` reali: input con le classi del controllo (`peer` escluso: non applicabile con `@apply`), icona check/dot come `background-image` SVG data-URI su `:checked` (Formidable non offre un host per l'indicatore). Verificato in build con l'import abilitato, poi ricommentato.

## Verifica tastiera

**Non eseguita** (nessun tool browser). Percorsi: accordion e toggle-group via `createRovingNav`; tabs orientation-aware con `onFocusChange`; input-otp nel keydown handler; slider e collapsible affidati ai controlli nativi.

## Gate

`check:classes` 50/50 exit 0 · docs page 200 con 10 `tabs.module` e 14 `data-slot="checkbox"`, 0 id duplicati · build exit 0 (chunk toggle, toggle-group, slider + `slider.min.css`, input-otp, accordion, tabs, collapsible) · eslint solo i tolerati.

## Note

- `diff-figma-upstream.mjs` sui controlli form sceglie la riga label+controllo, non il controllo isolato: gli override sono stati derivati a mano dai frame annidati nel JSON (annotato nelle eccezioni). Miglioramento possibile dello script: preferire il figlio con nome uguale al componente.
- `scripts/upstream-exceptions.json`: un oggetto di `select` ha chiavi duplicate (residuo di B5), funzionante ma da ripulire in B7.
