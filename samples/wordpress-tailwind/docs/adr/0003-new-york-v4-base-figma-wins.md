# ADR 0003 — Base registry `new-york-v4` e regola "Figma vince"

Data: 2026-09-17 · Stato: accettato

## Contesto

Le classi dei componenti vengono copiate dal registry shadcn/ui (`https://ui.shadcn.com/r/styles/<style>/<name>.json`). Nel 2026 il registry offre otto stili (Base UI di default; Radix con `radix-vega`/`radix-nova`; `new-york-v4` legacy). Il kit Figma aziendale è derivato dal kit shadcndesign dell'autunno 2025 e personalizzato dai designer (pill radius 26/22/14 px, DM Sans, kbd 22 px, switch 44×20, brand blu/arancio). Misurato con `use_figma`, il kit non coincide con nessuno stile attuale: i bottoni hanno il ritmo di `radix-vega` (gap-1.5, h-9/h-8/h-10) ma input e altezze seguono `new-york-v4`, e nessun modo "Style" è presente nel file.

## Decisione

- La **base** delle stringhe di classe è `new-york-v4` (costante `STYLE`, override `SHADCN_STYLE`): è la base storica del kit e risolve 61/63 componenti (mancano `toast` e `questionnaire`).
- **Figma vince** sui *kit component* (quelli con una pagina nel kit e un file in `tokens/figma-components/`): quando una misura Figma contraddice un'utility upstream si sostituisce **solo** quella utility (`rounded-md` → `rounded-4xl`, `px-4` → `px-3`, …) e la deviazione è registrata in `scripts/upstream-exceptions.json` con `source: "figma"`, node id e motivo. I componenti assenti dal kit restano byte-identical all'upstream.
- Il gate `check:classes` confronta ogni Twig con l'upstream applicando Adaptation table ed eccezioni: la fedeltà è verificabile, non dichiarata.

## Conseguenze

- `new-york-v4` è congelato upstream: nuovi componenti e fix arrivano solo negli stili nuovi. Un eventuale passaggio a `radix-vega` è un cambio di `STYLE` + rerun del gate + revisione delle eccezioni (le varianti `data-open:` degli stili nuovi sono già supportate dal `shadcn.css` vendorizzato).
- Le personalizzazioni del kit non riducibili a token diventano eccezioni per componente, non varianti nascoste: chi legge il Twig trova la motivazione nel file delle eccezioni.
- Se i designer cambiano il kit, il ciclo è: rimisurare (`use_figma`) → `diff-figma-upstream` → aggiornare le eccezioni → gate.
