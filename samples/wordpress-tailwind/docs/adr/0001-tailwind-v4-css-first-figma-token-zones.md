# ADR 0001 — Tailwind v4 CSS-first con zone token importate da Figma

Data: 2026-09-17 · Stato: accettato

## Contesto

Il sample `wordpress` di wsdev genera il tema da `theme.json` tramite il plugin theme di ws-vite (SCSS + custom properties + utility margin/padding). Il nuovo sample deve ospitare la libreria shadcn/ui, che è scritta in Tailwind e definisce i propri token semantici (`--primary`, `--background`, …), e deve restare allineato a un kit Figma che espone le stesse variabili.

## Decisione

- Tailwind **v4 CSS-first** attivato con `tailwind: true` di ws-vite: nessun `tailwind.config`, nessun `postcss.config`, nessun SCSS. Un'unica entry `src/css/globals.css` linkata nel layout.
- I token vivono in `globals.css` in **nove zone marker** (`figma:semantic-light|dark`, `alpha-light|dark`, `primitives`, `shadow-blur`, `color-map`, `responsive-base|md`) scritte dalla skill `figma-tokens` a partire da un export DTCG delle variabili Figma; tutto ciò che sta fuori dai marker è project-owned. I valori sono hex (8 cifre con alpha), mai oklch, per avere diff puliti a ogni re-import.
- `@theme inline` mappa i semantici sulle utility (`--color-primary: var(--primary)`) così `bg-primary` cambia con `.dark`; la scala `--text-*` è rimappata sui token responsive del kit.
- Il file `shadcn/tailwind.css` (npm `shadcn@4.21.0`) è vendorizzato in `src/css/shadcn.css` per non dipendere dal pacchetto.

## Conseguenze

- Il pipeline `theme.json` → SCSS non è usato: `docs/THEMING.md` del monorepo non si applica a questo sample.
- Un re-import Figma sovrascrive solo i marker; un override di brand deliberato va nella regione `figma-tokens:overrides`, altrimenti il gate di collisione lo blocca.
- Le modifiche a `@theme`/`@source` richiedono il riavvio del dev server.
