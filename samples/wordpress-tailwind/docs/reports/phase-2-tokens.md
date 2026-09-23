# Report — Fase 2: token da Figma (2026-09-17)

## Skill `figma-tokens` (agent Sonnet)

Copiata dalla skill `figma-tokens` di un progetto interno precedente in `.claude/skills/figma-tokens/` e generalizzata:

- `loader.mjs`: `findRepoRoot` = prima cartella con `package.json` e `src/css/globals.css`; `defaultPaths` senza prefisso `client/`, audit in `tokens/audits/`; routing aggiunto per `Brand` (primitives) e `Responsive` Desktop/Mobile (custom).
- `classifier.mjs`: gruppi tipografici a N livelli (`text/xs/font-size` → `--ws-text-xs-font-size`), collasso del prefisso ripetuto (`spacing/spacing-xs` → `--ws-spacing-xs`), lookup del `font-size` fratello lungo il path annidato.
- `reverse.mjs`: root discovery riallineato al loader (il precedente crashava fuori dal progetto originale); i builder DTCG di `reverse`/`code-to-figma` emettono ancora la forma 2-livelli del progetto originale (follow-up se serviranno).
- `SKILL.md` e `actions/*.md` riscritti in inglese neutro, senza Storybook/ADR del progetto originale; tabella di routing DTCG del kit documentata.
- Test: 49/49 → 51/51 dopo i fix dell'orchestratore.

## Export DTCG (agent Sonnet, `use_figma`, sola lettura)

874 variabili (esclusa `Icon Library`) in 22 chiamate, trasformate da uno script Node deterministico in `tokens/figma-export/` (git-ignored): `TailwindCSS/TailwindCSS` (499), `Brand/Brand` (22), `Theme/Theme` (235), `Responsive/{Desktop,Mobile}` (39+39), `Mode/{Light,Dark}` (79+79), `manifest.json`. Alias risolti fino al valore finale (0 irrisolti); `custom/*` mantengono l'alias con `resolvedHex`. Shadow: single-layer `shadow/2xs|xs|2xl`, multi-layer `shadow/sm|md|lg|xl/{1,2}`.

## Import (orchestratore)

- Report-only: 992/992 classificati, 22 primitive, 33 semantici, 10 alpha, 23 shadow/blur, 36 in quarantena.
- Bug trovati nell'anteprima e corretti: (1) alpha duplicato `#FFFFFFF2F2` perché l'export emette hex a 8 cifre + campo `alpha` → guardia in `toCssColor`; (2) primitive `--color-blue-*` (collisione con la palette Tailwind) → famiglia = segmenti intermedi del path e file Brand avvolto nella root `Brand` → `--color-brand-blue-*`. Doc di routing aggiornata, +2 test.
- `--apply`: solo i marker cambiano; `mode-custom-experimental.css` con 72 righe `--ws-mc-*`.
- Aggiunte project-owned in `@theme inline`: `--text-<size>`/`--text-<size>--line-height` → `--ws-text-*` (xs…9xl) e `--spacing-ws-<step>`.
- Build: `globals.min.css` contiene la scala `text-*` rimappata.

## Misure componenti (agent Sonnet, `use_figma`)

`tokens/figma-components/<name>.json` per 22 kit component + `index.json`: geometria per variante (box, padding, gap, radius, stroke, fill, effetti, testo, variabili legate, figli). Anomalie annotate: `ButtonGroup` senza spazio nel nome, pagina "Utility Components" senza famiglia di varianti, refusi "Desctructive"/"Distructive" nel kit.

Valori chiave: primary `#1E40AF` / dark `#E5E5E5`; secondary `#FB923C` / dark `#262626`; alpha `#FFFFFFF2…1A` / `#0A0A0AF2…1A`; text-2xl 20/28 mobile → 24/32 desktop.
