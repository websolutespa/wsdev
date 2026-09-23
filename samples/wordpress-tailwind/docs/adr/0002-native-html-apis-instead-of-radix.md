# ADR 0002 — API HTML native e vanilla JS al posto di Radix

Data: 2026-09-17 · Stato: accettato (eredita l'ADR omologo di un progetto interno precedente)

## Contesto

shadcn/ui delega stato, focus management e ARIA a Radix UI in React. Il sample è Twig servito da WordPress/Timber: non c'è runtime React. Serve riprodurre il comportamento dei componenti interattivi con codice che funzioni sul markup Twig e nel host theme.

## Decisione

- `<dialog>` + `showModal()` per l'intera famiglia overlay (dialog, alert-dialog, sheet, drawer): focus trap, ESC, inert e top layer nativi; un solo `dialog.module.js`; backdrop stilizzato con `backdrop:`.
- Elementi form nativi stilizzati (checkbox, radio, switch = checkbox `role="switch"`, slider = `input type="range"`), `<select>` nativo nascosto sotto il select custom per il submit.
- `@floating-ui/dom` (la libreria interna di Radix) per il posizionamento ancorato; le variabili `--radix-*` sono rimappate su `--transform-origin`, `--available-*`, `--anchor-*`, `--viewport-*`.
- I moduli replicano `data-state`/`data-side`/`data-align`/`data-slot` di Radix, così le classi e le animazioni tw-animate-css upstream funzionano invariate.
- Caricamento lazy via `data-module="<name>.module"` (IntersectionObserver + MutationObserver per i contenuti iniettati), contratto `default (node) => dispose`, eager-init per i contenitori fissi (sonner, sidebar). Utility condivise in `src/js/common/` (uid, dataState, dismiss, floating, keynav, focus, scrollLock, toast).
- I moduli sono **copiati e auditati** da un progetto interno precedente, non riscritti: sono comportamento, non brand.
- Contratto pubblico verso il host theme: CustomEvent `<componente>:<verbo>` in ingresso, `<componente>:<participio>` in uscita, hook `data-*`; nessun global.

## Conseguenze

- Floor browser Baseline 2023 (Chrome/Edge 111+, Safari 16.4+, Firefox 128+), nessun polyfill.
- Alcune deviazioni dal markup React sono inevitabili e documentate come `source: "port"` (nessun overlay separato, calendar su vanilla-calendar-pro, chart su chart.js, progress con transform inline, combobox con modulo proprio).
- La verifica tastiera/a11y richiede un browser: checklist APG eseguita con Playwright MCP.
