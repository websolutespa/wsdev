# 🔵 Tailwind v4 + shadcn/ui in ws-vite

How the `wordpress-tailwind` sample adds Tailwind CSS v4 and a hand-ported shadcn/ui
component library to the standard ws-vite + Twig stack, with no React and no Radix.
The full rationale and step-by-step conventions live in the sample itself
([`samples/wordpress-tailwind/PORTING.md`](../samples/wordpress-tailwind/PORTING.md),
[`CONTEXT.md`](../samples/wordpress-tailwind/CONTEXT.md),
[`docs/DECISIONS.md`](../samples/wordpress-tailwind/docs/DECISIONS.md) and
[`docs/adr/`](../samples/wordpress-tailwind/docs/adr/)); this page is the entry point.

## Enabling Tailwind

ws-vite wraps `@tailwindcss/vite` behind a single config flag:

```js
// vite.config.js
export default wsVite({
  tailwind: true,
  // ...
});
```

Tailwind v4 is CSS-first — there is no `tailwind.config.js`. The single entry point is
`src/css/globals.css`, imported once from `layouts/layout.twig` (not from `main.js`).
It imports Tailwind itself, the vendored `shadcn.css` (shadcn/ui's own base layer,
updated by re-copying the file — never hand-edited), a token quarantine file and the
per-component CSS aggregator.

## The `globals.css` zone contract

Design tokens live inside **nine paired markers**, each `figma:<block> START` /
`figma:<block> END`:

| Marker | Contains |
|---|---|
| `figma:semantic-light` / `figma:semantic-dark` | Role tokens (`--primary`, `--background`, …) — light in `:root`, dark in `.dark` |
| `figma:alpha-light` / `figma:alpha-dark` | Alpha-blended neutrals (`--ws-alpha-*`) |
| `figma:primitives` | Literal palette colors (`--color-brand-<hue>-<step>`), emitted in `@theme` so Tailwind generates utilities for them |
| `figma:shadow-blur` | Shadow/blur scale (`--shadow-*`, `--blur-*`) |
| `figma:color-map` | `@theme inline` mapping semantic tokens to Tailwind utilities (`--color-primary: var(--primary)` → `bg-primary`) |
| `figma:responsive-base` / `figma:responsive-md` | Mobile-first responsive type/spacing tokens, with a `@media (min-width: 48rem)` override |

Everything **between** a `START`/`END` pair is owned by the Figma token importer — the
marker means "provenance: last sync from Figma", not "do not touch"; it is
hand-editable in place, and a re-import simply overwrites it again. Everything
**outside** the markers (radius scale, font families, project-owned utilities like
`prose-ws` and `scrollbar-*`) is hand-authored and never touched by the importer.
All values are **hex** (optionally 8-digit with alpha) — no oklch/hsl in this file.
Full rationale: [ADR 0001](../samples/wordpress-tailwind/docs/adr/0001-tailwind-v4-css-first-figma-token-zones.md).

## Dark mode

A `.dark` class on `<html>`, toggled by `src/js/common/colorScheme.js` and
`data-toggle="color-scheme"` buttons, plus a Tailwind custom variant:

```css
@custom-variant dark (&:where(.dark, .dark *));
```

An inline `<script>` in `layout.twig`, placed before the stylesheet `<link>`, applies
`.dark` synchronously from `localStorage`/`prefers-color-scheme` to avoid a
flash-of-wrong-theme.

## The Twig port method

Every shadcn/ui component is a React + Radix primitive upstream; here it becomes a
`.twig` template with the exact same Tailwind class strings, plus a vanilla JS module
where behavior is needed — no React runtime, no Radix, native HTML APIs first
(`<dialog>` + `showModal`, native form controls). The full method — file layout, the
Figma-vs-upstream precedence rule, the adaptation table for the handful of unavoidable
class divergences, the JS module contract and the Integration API (`CustomEvent`s,
`data-*` hooks, no `window.*`) — is documented in
[`samples/wordpress-tailwind/PORTING.md`](../samples/wordpress-tailwind/PORTING.md).
Read it before porting or modifying a component. See also
[ADR 0002](../samples/wordpress-tailwind/docs/adr/0002-native-html-apis-instead-of-radix.md) (native APIs over Radix) and
[ADR 0003](../samples/wordpress-tailwind/docs/adr/0003-new-york-v4-base-figma-wins.md) (`new-york-v4` base, Figma wins).

## Design tokens from Figma

The `.claude/skills/figma-tokens` skill is the token
pipeline: **Figma → code**, **code → Figma**, or **code → portable DTCG**. The code —
the CSS custom properties in `globals.css` — is always the source of truth; everything
under `tokens/` is git-ignored scratch, and Figma is optional.

| The user wants to… | Sub-command |
|---|---|
| Bring/update tokens **from Figma** into code | `figma-to-code` |
| **Push back to Figma** the changes made in code | `code-to-figma` |
| Emit the code tokens as a portable **DTCG** snapshot | `reverse` |

From a project's root:

```sh
node .claude/skills/figma-tokens/scripts/import-tokens.mjs
```

runs report-only (no file changes, prints the diff); add `--apply` to write the
generated blocks inside the markers.

## The component pipeline

New components (or re-ports after an upstream update) go through the
[`shadcn-port`](../samples/wordpress-tailwind/.claude/skills/shadcn-port/SKILL.md)
skill's 9-step pipeline: fetch the upstream registry source, scaffold the Twig +
mocks + module, adapt classes per the PORTING.md rules, gate with
`npm run check:classes`, register in the docs manifest. Every deliberate divergence
from upstream — a Figma override, a platform port exception, a markup composition, or
an override derived from a visually-identical sibling component — is recorded in
`scripts/upstream-exceptions.json` so the gate can tell an intentional exception from a
regression.

## WordPress integration

The frontend workspace and the host WordPress/Timber theme are separate: `build:wp`
copies compiled Twig components into `../views`, and the CSS/JS bundle into
`../static`. ws-vite names the built assets after the CSS entry linked in the layout —
since `layout.twig` links `globals.css`, the build always produces
`static/css/globals.min.css` and `static/js/globals.min.js`. Keep the host theme's
resource partials (`src/templates/partials/resources/prod/*.twig`) pointing at those
exact names if the CSS entry is ever renamed.

## The sample

[`samples/wordpress-tailwind`](../samples/wordpress-tailwind) is the reference
implementation: 60 ported components, a docs showcase at `/docs/components.html`
(plus `/docs/forms.html` and `/docs/blocks.html`), and the layout/blocks tier that
demonstrates the `page.components[].schema` contract on a WordPress-like homepage.
