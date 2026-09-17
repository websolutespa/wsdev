# Report — Fase 0: analisi (2026-09-17)

## Cosa è stato analizzato

- **wsdev**: la CLI registra i sample in un `select()` hardcoded (`packages/ws-cli/src/create/create.wizard.ts`); il nome package deve essere `@<sample>/web` perché `download.ts` sostituisce `@<sample>` → `@<progetto>` in package.json e nei sorgenti `.js/.ts/.mdx`; `.mjs` e `.css` non vengono toccati; `copyDirectory` copia anche `.claude/`. Il sample `wordpress` è un workspace frontend (Twig + SCSS + `theme.json`) senza PHP con pipeline `build:wp`/`watch:wp` verso `../views`/`../static`. Il sample `tailwind` usa Tailwind v4 via `tailwind: true` di ws-vite (che pinna `tailwindcss ^4.1.17`) e `src/theme/theme.css`; il basename `theme` collide con `virtual:theme.css` (`theme.min2.js`).
- **area-broker** (`client/`): boilerplate wordpress rifatto con Tailwind v4 CSS-first, `globals.css` con nove zone marker per la skill `figma-tokens`, ~55 componenti shadcn portati a mano in Twig (spec `PORTING.md`), moduli JS nativi (dialog, dropdown multi-livello, select con mirror nativo…), Storybook con twig.js. Le classi sono personalizzate per il brand: riutilizzabili solo il metodo e i moduli.
- **shadcn upstream (sett. 2026)**: 63 item `registry:ui`; otto stili (Base UI default da luglio 2026, `radix-vega`/`radix-nova`, `new-york-v4` legacy); `shadcn/tailwind.css` (npm `shadcn@4.21.0`) fornisce le varianti `data-open:` ecc. che matchano anche `[data-state=…]`, i keyframes accordion e le utility `shimmer`/`scroll-fade`/`no-scrollbar`; gli item dichiarano `dependencies: ["cn", "radix-ui"]`.
- **Kit Figma** `0vHlrWA2vzmhhZCeJQN3ZP`: collezioni `0. TailwindCSS` (499), `1. Brand` (22), `2. Theme` (235), `3. Mode` Light/Dark (79), `4. Responsive` Desktop/Mobile (39), `5. Icon Library` (5). Font DM Sans / Tenor Sans / Geist Mono. `base/primary` → `brand/blue/800 #1e40af`, `base/secondary` → `brand/orange/400`. Radius xs 2 … 4xl 26.

## Confronto misure kit vs registry

| Componente | Kit | radix-vega | new-york-v4 |
|---|---|---|---|
| Button default | h36 px12 py8 gap6 r26 | h-9 px-2.5 gap-1.5 rounded-md | h-9 px-4 gap-2 rounded-md |
| Button sm | h32 px12 gap4 text12 | h-8 px-2.5 gap-1 | h-8 px-3 gap-1.5 |
| Input | h36 px12 py4 r22, no shadow | h-9 px-2.5 shadow-xs | h-9 px-3 shadow-xs |
| Badge | h20 px8 py2 gap4 r22 | h-5 px-2 gap-1 rounded-4xl | px-2 py-0.5 gap-1 rounded-full |
| Kbd | 22×22 px6 r6 | h-5 min-w-5 px-1 | idem |
| Switch | 44×20 (sm 28×16) | 32×18.4 | idem |
| Tooltip | px12 py6 r14 text12 | px-3 py-1.5 rounded-md | idem |
| Checkbox | 16×16 r5 | size-4 rounded-[4px] | idem |

Conclusione: il kit è un ibrido `new-york-v4` (autunno 2025) + personalizzazioni dei designer. Decisione dell'utente: base `new-york-v4`, Figma vince.

## Documenti prodotti

Piano approvato (`~/.claude/plans/questo-progetto-permette-di-prancy-lynx.md`), registro decisioni ([DECISIONS.md](../DECISIONS.md)), ADR 0001–0003, glossario (`CONTEXT.md`).
