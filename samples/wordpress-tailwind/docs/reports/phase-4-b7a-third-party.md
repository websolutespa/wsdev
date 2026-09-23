# Report — Fase 4 / B7a: componenti su librerie terze (2026-09-17)

Agent Opus; revisione e commit dell'orchestratore. Dopo il batch: 55 componenti in `base/`. Nessuna dipendenza aggiunta (embla-carousel 8.6.0, vanilla-calendar-pro 3.3.2, chart.js 4.5.1 già presenti).

## Cleanup

`scripts/upstream-exceptions.json`: l'oggetto `select` con chiavi duplicate (fusione accidentale di `pl-2→pl-3` e della port exception `h-[var(--radix-select-trigger-height)]`) è stato separato in due entry valide; scanner chiavi duplicate → 0.

## Componenti

| Componente | Eccezioni | Note |
|---|---|---|
| carousel | nessuna (MISSING 0) | embla su `carousel-content` (wrapper overflow-hidden, track = primo figlio, come upstream); prev/next via `button.twig` (slot `carousel-previous/next` mancanti → B8); dots project-owned; ←/→ in capture; in `carousel:prev|next|goto`, out `carousel:change {index,count}` |
| calendar | whole-component (port) | vanilla-calendar-pro v3: mappa classi upstream trasferita sull'opzione `styles`; mirror cella→bottone degli stati (`data-range-start`, `data-selected-single`…) via MutationObserver; `calendar.css` importa `layout.css` in `@layer base` (verificato: le utility vincono); locale default `it-IT`; input nascosto ISO; in `calendar:set`, out `calendar:change {selected}` |
| date-picker | `from: "*"` come **composizione** (ratificata) | `@composition`: popover + calendar riusati via `{% embed %}`; modulo da 1,2 kB che formatta con `Intl.DateTimeFormat`, aggiorna trigger/input e chiude il popover (single) o attende entrambi gli estremi (range); `date-picker:change {value}`. Nesting `data-module` verificato in `lazyLoad.js` |
| chart | whole-component (port) | chart.js/auto; `config` → `--color-<key>` sul container (light + `.dark`) come `ChartStyle` upstream; colori letti con `getComputedStyle` (funziona anche nel wrapper `.dark` della docs page); tooltip esterno con markup/classi upstream; legenda HTML; recolor su `matchMedia` + MutationObserver; tipi line/bar/area/pie/donut; in `chart:update`, out `chart:rendered` |
| resizable | nessuna (MISSING 0) | N pannelli, un handle per coppia; size come quota `flex` via `--panel-size` (le basis percentuali facevano overflow con gli handle da 1 px); upstream oggi usa `aria-[orientation=…]` (non più `data-[panel-group-direction]`): il gruppo emette entrambi; drag con pointer capture, ←/→ ↑/↓, Shift = passo 10, Home/End, doppio click 50/50; out `resizable:change {sizes}` |

Divergenze dentro le eccezioni whole-component: calendar senza le utility `rtl:**:[.rdp-button_next>svg]`; chart senza i 13 selettori `[&_.recharts-*]` (CSS morto) e con wrapper dimensionato per il canvas.

## Deviazioni dal progetto di riferimento

carousel segue lo slot upstream (`carousel-content` = wrapper, non track) con opzioni tipizzate; calendar senza i ~200 righe di CSS `[data-vc-*]` (tema via `styles`); date-picker riusa popover invece di duplicarne la macchina; chart segue il contratto `config` upstream invece dello schema `series[]`; resizable N pannelli (progetto di riferimento: 2).

## Verifica tastiera/drag

**Non eseguita** (nessun tool browser). Citazioni: carousel `carousel.module.js:74-82`; resizable drag `106-124`, tastiera `136-150`; calendar navigazione nativa della libreria, ring focus `calendar.module.js:168-177`; date-picker ESC/outside via `popover.module.js`.

## Gate

`check:classes` 55/55 exit 0 (51 ✓, 4 skip dichiarati) · docs page 200 (7 MB), 0 id duplicati su 584 · build exit 0: `globals.min.css` 150 kB (13 kB di `layout.css`), `carousel.module` 19 kB, `calendar.module` 79 kB, `chart.module` 210 kB (librerie inlinate nel chunk del modulo, caricate lazy) · eslint solo i tolerati.

## Questioni aperte

1. `aria-orientation` su `<div>` senza role nel panel group (richiesto dal selettore upstream): possibile finding axe.
2. Pannello del date-picker eredita `w-72 p-4` dal popover (upstream demo `w-auto p-0`); mitigato con `min-w-max`; `numberOfMonths: 2` resterebbe stretto.
3. Chunk vendor non separati (un consumatore per libreria): valutare `manualChunks` in ws-vite se servirà.
4. B8: campo `composition: true` nelle eccezioni al posto di `from: "*"` per date-picker; `slot?` su `button.twig`.
