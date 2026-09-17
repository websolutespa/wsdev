# Report — Fase 4 / B3 + B4: famiglia overlay e famiglia floating (2026-09-17)

Agent Sonnet; revisione e commit dell'orchestratore. Dopo il batch: 35 componenti in `base/`, primi 7 interattivi.

## B3 — overlay (dialog, alert-dialog, sheet, drawer), tutti upstream-only

- Un solo `base/dialog/dialog.module.js` (da area-broker, auditato): `<dialog>` + `showModal()`, `saveFocus`/`restoreFocus`, `lockScroll`, `data-state` via `dataState.js` con `closeWithAnimation` prima di `dialog.close()`, `[data-static]` = nessun light dismiss, hook `[data-dialog-trigger]`/`[data-dialog-close]`/`[data-dialog-open="<id>"]`, eventi `dialog:open|close` in, `dialog:opened|closed` out. Riusato da alert-dialog/sheet/drawer via `data-module="dialog.module"`.
- Drift upstream recepito: `DialogClose` ha ora `data-[state=open]:bg-accent …` → il modulo replica `data-state` sul bottone di chiusura; `AlertDialogMedia` è un nuovo slot → aggiunti `icon` + `{% block media %}` (approvato dall'orchestratore: meglio della drop exception).
- Port exceptions (`source: "port"`): l'overlay Radix non ha un host → `bg-black/50` diventa `backdrop:bg-black/50` sul `<dialog>`, `inset-0` cade (il `::backdrop` è già a tutto viewport), fade dell'overlay tolto su sheet/drawer per non raddoppiare l'animazione slide; `data-vaul-drawer-direction` → `data-direction` come regola globale in `adaptation-rules.json` + riga in Adaptation table. Reset UA del `<dialog>` (`m-0 max-w-none max-h-none text-foreground …`) additivi, documentati negli header.
- Drawer senza drag-to-dismiss (documentato): una libreria gesture sarebbe una dipendenza nuova da approvare.

## B4 — floating (popover, tooltip, hover-card)

- `popover.module.js`: `createFloating` + `pushDismissLayer`, focus dentro il pannello e ritorno al trigger, `aria-expanded`/`aria-controls`; eventi `popover:open|close` in, `popover:opened|closed` out (assenti in area-broker, aggiunti). Slot `popover-header` nuovo upstream.
- `tooltip.module.js`: hover + focus con 700 ms, chiusura su leave/blur/ESC, `role="tooltip"`, freccia via middleware `arrow`, non ruba il focus. **Override Figma**: `rounded-md` → `rounded-xl` (nodo 17089:47311, 14 px, variabile legata `border-radius/rounded-xl`); padding e testo già coincidenti; proposte `h-11`/`gap-2` scartate come rumore.
- `hover-card.module.js`: solo pointer, delay 700/300 ms, nessun focus trap, ESC via dismiss layer.
- Deviazione tecnica comune: coppie di funzioni mutuamente referenziate convertite in `function` dichiarate (eslint `no-use-before-define` del sample).

## Verifica tastiera/a11y

**Non eseguita**: nessun tool browser nella sessione. I percorsi di codice esistono: ESC (`dialog.module.js:96` evento `cancel`; tooltip/hover-card via `dismiss.js`), outside click (`dialog.module.js:77-86` hit-test sul backdrop; popover/hover-card via `pushDismissLayer`, disattivato per tooltip come da APG), focus return (`dialog.module.js:50/68`, `popover.module.js:65/98`). Da eseguire con Playwright MCP appena disponibile: sezioni dialog/sheet/drawer, popover, tooltip/hover-card di `references/keyboard-checklist.md`.

## Gate

`check:classes` 35/35 exit 0 (EXTRA/slot mancanti solo per wrapper Radix senza host: `*-overlay`, `*-portal`, `tooltip-provider`, `popover-anchor`) · docs page 200 con 30 `dialog.module`, 8 `popover.module`, 8 `tooltip.module`, 6 `hover-card.module`, nessun errore Twig né id duplicati · build exit 0 con i 4 chunk modulo · eslint solo i tolerati.

## Follow-up

- B8: `slot?` su `button.twig` (i trigger dei 7 componenti non emettono `data-slot="*-trigger"`), già tracciato.
- Tooltip: upstream ha `delayDuration = 0` a livello provider; tenuto 700 ms (nessun provider condiviso qui).
