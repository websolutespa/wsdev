# Report — Fase 4 / B2a: componenti statici, parte 1 (2026-09-17)

Agent Sonnet; revisione e commit dell'orchestratore. Componenti: alert, aspect-ratio, avatar, badge, empty, item, kbd, marker, message, bubble, attachment (18 componenti totali in `base/` dopo il batch).

## Esiti per componente

| Componente | Gruppo docs | Figma | Note |
|---|---|---|---|
| alert | feedback | upstream-only | 2 varianti, icona opzionale, `{% block description %}` |
| aspect-ratio | data-display | upstream-only | mappa enum → classe letterale; upstream non emette classi (Radix runtime) → eccezione `from: "*"`, `source: "port"` |
| avatar | primitives | kit, **nessun override** (`h-8` già coperto da `size-8`) | `avatar.module.js`: load/error → `data-state`, fallback `hidden` |
| badge | primitives | kit, **nessun override** | radius 22 su h20 = pill identico a `rounded-full` |
| empty | data-display | kit | `rounded-lg`→`rounded-2xl` (18), `gap-6`→`gap-4` (16), media icon `rounded-lg`→`rounded-xl` (14) |
| item | data-display | kit | `rounded-md`→`rounded-2xl` (18, campione Outline; il Default misura 10: conflitto annotato), `gap-4`→`gap-2.5`, `p-4` → `px-4 py-3.5` (padding asimmetrico 16×14); `px-3.5` su sm non applicato (campione singolo) |
| kbd | primitives | kit | `h-5`→`h-5.5`, `min-w-5`→`min-w-5.5`, `px-1`→`px-1.5` (22×22, padding 6) |
| marker | primitives | upstream-only | 3 varianti, `items[]` data-driven |
| message, bubble, attachment | chat | upstream-only | classi verbatim (`shimmer`, `scroll-fade-x`, `oklch(from …)`); `message` include `bubble`; `attachment-action` reso inline perché `button.twig` fissa `data-slot="button"` |

Icone aggiunte: `inbox`, `paperclip`, `file-text`, `image`.

## Bug corretti in `diff-figma-upstream.mjs`

1. `pickDefaultVariant` sceglieva una variante senza props (es. il wrapper "Avatar Group") come default: ora richiede props non vuote.
2. `combinedDefaultClasses` mescolava le stringhe di varianti non-default nel "valore corrente": ora le filtra.
3. `pxToSpacing` conosceva solo i mezzi step legacy: ora scansiona ogni 0.5 (necessario per `h-5.5`).

## Gate

`check:classes` 18/18 exit 0 (MISSING 0 ovunque) · docs page 200 con 16 `data-slot="badge"` e 20 `data-slot="avatar"`, nessun errore Twig · `build` exit 0 (`avatar.module.min.js` come chunk separato) · eslint solo i 2 errori tolerati + warning ereditato.

## Decisioni dell'orchestratore sulle questioni aperte

- `scrollbar-none` su `attachment-group`: è una utility core di Tailwind v4.1 (presente in `tailwindcss/dist/lib.js`), resta verbatim, nessuna eccezione.
- Conflitto radius di `item` (18 vs 10): resta 18 (variante Outline, quella principale del kit); da ricontrollare se il kit cambia.
- Follow-up B8: valutare un parametro `slot?` su `button.twig`/`separator.twig` per unificare `attachment-action` e `item-actions`.
