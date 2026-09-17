# Report — Fase 2b: skill `shadcn-port` (2026-09-17)

## SKILL.md (orchestratore, via `/prompt-master`)

Pipeline in 9 step (upstream → verità Figma → Twig → mock → modulo → CSS locale → gate → ottimizzazione → registrazione), non-negoziabili (classi byte-identical, Figma vince, eccezioni `figma|port`, stop-and-ask su dipendenze/globals/eccezioni `*`), ruoli modello, definition of done, modalità `--audit` e `--batch`.

## Script (agent Sonnet, zero dipendenze npm, Node 22)

`.claude/skills/shadcn-port/scripts/`: `lib/{paths,registry,classes,twig}.mjs`, `probe-registry.mjs`, `fetch-upstream.mjs`, `check-upstream-classes.mjs`, `scaffold-component.mjs`, `register-docs.mjs`, `normalize-figma-measure.mjs`, `diff-figma-upstream.mjs`; `adaptation-rules.json` (7 riscritture `--radix-*`, accordion escluso di proposito); `references/keyboard-checklist.md`; `.gitignore` per `upstream/`. Al root del sample: `scripts/check-upstream-classes.mjs` (wrapper per `npm run check:classes`), `scripts/upstream-exceptions.json` + schema (seed: progress, calendar, chart, combobox con `source: "port"`).

## Test su rete reale

- `probe-registry`: 61/63 disponibili in `new-york-v4`, mancano `questionnaire` e `toast`.
- `fetch-upstream button`: slot `button`, CVA `variant` ×6 e `size` ×8, base verbatim, import Radix `slot`.
- `fetch-upstream dialog`: 10 slot, `data-[state=open|closed]`, icona `x`, import Radix `dialog`.
- Gate su un `button.twig` volutamente incompleto: `MISSING 10, EXTRA 3` → exit 1; eccezione `"from": "*"` → skip con exit 0; twig mancante → exit 1.
- `scaffold-component button`: bug corretto (chiavi CVA con trattino non quotate nell'hash Twig); nota: crea uno stub `.module.js` anche quando l'unico import Radix è `Slot` → da cancellare per i componenti non interattivi.
- `register-docs`: manifest a 8 gruppi, idempotente. `normalize`/`diff`: verificati su dati sintetici (propone `h-9→h-10`, `px-4→px-3.5`, tace se entro tolleranza).
