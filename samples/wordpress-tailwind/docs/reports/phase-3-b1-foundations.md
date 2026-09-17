# Report — Fase 3 / B1: fondamenta e componenti àncora (2026-09-17)

Agent Sonnet; revisione e commit dell'orchestratore.

## Consegnato

- `src/js/common/`: `uid`, `dataState`, `scrollLock`, `focus`, `dismiss`, `keynav`, `floating` (+ `--viewport-width/height`), `toast` copiati da area-broker. Unica deviazione: in `dataState.js` le due arrow function mutuamente referenziate sono diventate `function` dichiarate (regola eslint `no-use-before-define` del sample), comportamento identico.
- `PORTING.md` (186 righe): spec forkata da area-broker senza Storybook/gates/ACF; aggiunte le sezioni Figma wins, Port exceptions, Integration API, Reference implementation, Where CSS goes.
- 34 icone lucide in `src/assets/icons/` (+ le 3 preesistenti).
- Componenti `base/{button,separator,label,input,textarea,card,skeleton}` con header params, mock `{ "mocks": … }` in italiano, registrati nel manifest docs. Stub `.module.js` dello scaffolder eliminati per button/separator/label (import Radix `Slot`/`Separator`/`Label` non è interattività).
- `src/docs/components.twig`: jump-nav per gruppo, ogni scenario renderizzato in light e in `.dark`, toggle tema.

## Override Figma applicati (`scripts/upstream-exceptions.json`, `source: "figma"`)

| Componente | Da → a | Nodo | Motivo |
|---|---|---|---|
| button | `rounded-md` → `rounded-4xl` | 17085:177642 | radius 26 px su tutte le size |
| button | `gap-2` → `gap-1.5` (base) | 17085:177642 | gap 6 px |
| button | `gap-1.5` → `gap-1` (sm) | 17380:57341 | gap 4 px |
| button | `px-4` → `px-3` (default) | 17085:177642 | padding-x 12 px |
| button | `text-xs` aggiunto alla size sm | 17380:57341 | testo 12/16 (stesso pattern della size xs upstream) |
| input | `rounded-md` → `rounded-3xl` | 21147:310021 | radius 22 px |
| input | `shadow-xs` rimosso | 21147:310021 | nessun effetto nello stato Default |
| textarea | `rounded-md` → `rounded-2xl` | 17089:46140 | radius 18 px |
| textarea | `py-2` → `py-3` | 17089:46140 | padding-y 12 px |
| textarea | `shadow-xs` rimosso | 17089:46140 | come input |
| separator | nessuno | — | le proposte automatiche sono rumore di misura su un frame hairline |

## Disaccordi Figma non applicati (motivati)

- Button size icon: un solo campione (Outline/icon) misura radius 9999 vs `rounded-4xl` ereditato; serve un secondo dato prima di una regola per size.
- Input/textarea `text-base` → `text-sm`: `text-base` è l'anti-zoom iOS di shadcn su mobile; `md:text-sm` upstream coincide già con la misura desktop.
- Input `gap-1` / textarea `gap-2.5`: `gap` non ha effetto su elementi foglia; rumore dell'auto-layout attorno al placeholder.

## Bug corretti negli strumenti

1. `diff-figma-upstream.mjs` assumeva `padding` come oggetto; i JSON in `tokens/figma-components/` usano l'array `[t,r,b,l]` → helper `paddingOf()` tollerante a entrambe le forme (prima le proposte su padding erano saltate in silenzio).
2. `vite.config.js`: i glob relativi di `twig.data` non matchavano nulla perché vituum esegue `fast-glob` con `cwd` = root del sample ma risolve i match contro `./src` → pattern resi assoluti (`import.meta.url`). Senza il fix la global `mocks` era `undefined` e la docs page crashava.

## Gate

| Gate | Esito |
|---|---|
| `npm run check:classes` (7 componenti) | exit 0; EXTRA innocui (chiavi di hash Twig quotate come `icon-lg`, `_blank`) |
| dev server | `/docs/components.html` 200 con 34 `data-slot="button"` e 6 `data-slot="card"`, nessun errore Twig; `/index.html` 200 |
| `npm run build` | exit 0; `dist/docs/components.html`; `dist/css` = `globals.min.css`; `dist/js` = `globals.min.js` (+ sourcemap `.map` di ogni entry, output standard ws-vite) |
| eslint | i 2 errori tolerati in `main.js` + 1 warning `comma-dangle` ereditato in `floating.js` |

## Follow-up

- Radius dei bottoni icon-only: rimisurare più istanze nel kit.
- Riconciliare la forma di `padding` tra `normalize-figma-measure.mjs` (oggetto) e i JSON esportati (array).
- Nomi con refuso nel kit ("Desctructive") ignorati: le varianti seguono i nomi upstream.
