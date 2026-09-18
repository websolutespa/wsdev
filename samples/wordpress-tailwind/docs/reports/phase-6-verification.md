# Report — Fase 6: verifica end-to-end (2026-09-18)

Agent Sonnet (verificatore), HEAD `099c965`. Nessun fix necessario, nessun blocker.

| # | Verifica | Esito |
|---|---|---|
| 1 | `npm install` al root; nessun `@websolutespa` locale nel sample; `node_modules/@websolutespa/ws-vite` → symlink a `packages/ws-vite` | PASS |
| 2 | `npm run build:wordpress-tailwind`: `dist/css` = `globals.min.css` (183 kB) + `slider.min.css`; `dist/js/globals.min.js` senza suffisso; `index.html` referenzia `/js/globals.min.js` e `/css/globals.min.css`; URL Google Fonts con `%2E%2E`; 8 pagine gruppo + indice + forms + blocks + 404 | PASS |
| 3 | `check:classes` 56 ✓ + 4 ○, exit 0; test figma-tokens 51/51; import report-only 992/992 senza scrivere `globals.css` | PASS |
| 4 | Dev server: 6 route 200 senza marker di errore Twig; porte 8000–8004 libere dopo il kill | PASS |
| 5 | Scaffold CLI (test mode, pipeline `download.ts` replicata in `.mjs`: `ts-node --esm` è rotto su Node 22.19): `@my-wpt/web`, ws-vite `latest` (= 0.0.12 pubblicato, supporta `tailwind: true`), `$schema` riscritti, skill presenti e `loader.mjs`/`globals.css` byte-identici; `npm install && npm run build` nel progetto generato ok | PASS |
| 6 | eslint: solo i 2 errori `turbo/no-undeclared-env-vars` e il warning `comma-dangle` ereditati | PASS |
| 7 | `git status` pulito; file > 500 kB solo i media demo; `.gitignore` corretti (`dist`, `node_modules`, `/tokens`, `/.cache`, `upstream/`) | PASS |
| 8 | README (60/64 componenti, 4 sostituzioni, gate, comandi token, regola `globals.min.*`), `docs/SHADCN.md` linkato, ROADMAP, wizard CLI | PASS |

## Follow-up (non bloccanti)

1. `packages/ws-cli` script `dev`/`watch` con `ts-node --esm` non funzionano su Node 22.19 (solo per chi sviluppa la CLI; il `bin/index.js` compilato non è coinvolto): valutare `tsx`.
2. `copyDirectory` della CLI esclude solo `node_modules`: le cartelle git-ignored presenti su disco (`tokens/`, `.cache/`) finiscono nei progetti scaffoldati. Valutare l'esclusione esplicita di `tokens/` e `.cache/` (o il rispetto del `.gitignore` del sample).
3. ROADMAP: riga `wordpress-tailwind` portata a ✅ dall'orchestratore.

## Sospeso: verifica tastiera/a11y

La checklist APG (`.claude/skills/shadcn-port/references/keyboard-checklist.md`) e axe sulla docs page non sono state eseguite: nella sessione non è disponibile un tool browser (Playwright MCP). I percorsi di codice sono citati nei report di B3–B7b. Da eseguire con Haiku appena il tool è configurato.
