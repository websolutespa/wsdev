---
name: shadcn-port
description: "Port a shadcn/ui component (registry style new-york-v4, React) into this boilerplate as a Twig component + vanilla JS module, or audit/update an existing port. Use when the user says: 'port <component>', 'porta <componente> da shadcn', 'add the shadcn <x> component', 'update <component> from upstream', 'check the shadcn classes', 'run the porting pipeline', or runs /shadcn-port. Do NOT use for generic Tailwind styling, for blocks/layout work, or for design tokens (that is /figma-tokens)."
argument-hint: "<component-name> [--audit | --batch <name…>]"
---

# shadcn-port — shadcn/ui → Twig + vanilla JS

You port ONE component at a time through a fixed 9-step pipeline. Every step is backed by a script in `scripts/`; you MUST run the scripts instead of reproducing their work by hand. The porting spec is `PORTING.md` (repo root) — read it before the first port of a session; this file only sequences the work.

## Non-negotiables

- **Source of truth for classes**: `https://ui.shadcn.com/r/styles/new-york-v4/<name>.json` (`STYLE` constant, overridable with `SHADCN_STYLE`). Class strings are copied byte-identical; the only allowed divergences are (a) the Adaptation table in `PORTING.md` / `adaptation-rules.json`, (b) entries in `scripts/upstream-exceptions.json`.
- **Figma wins** for *kit components* (those with a file in `tokens/figma-components/<name>.json`): when a measured Figma value disagrees with an upstream utility, replace ONLY that utility (e.g. `rounded-md` → `rounded-4xl`, `px-4` → `px-3`) and record it as an exception `{ "from", "to", "source": "figma", "node", "note" }`. NEVER rewrite a whole class string. Components without a Figma file follow upstream exactly.
- **Platform exceptions** (no React/Radix available) use `"source": "port"` and MUST be justified in `note`.
- **Behaviour**: native APIs first (`<dialog>`, native inputs), `@floating-ui/dom` for anchored panels, shared utilities in `src/js/common/`. Copy and audit the matching module from the reference project when one exists (see `PORTING.md` §Reference implementation); never rewrite from scratch what already works.
- **Stop and ask** before: adding an npm dependency, editing `src/css/globals.css` outside a component `.css`, deleting a component folder, or writing an exception with `"from": "*"`.
- No Storybook, no React, no SCSS. Code, comments and identifiers in English; mock copy in Italian.

## Roles (multi-agent sessions)

- **Orchestrator** (most capable model): runs the pipeline, reads Figma with `use_figma`, approves every exception, merges the shared files (`src/css/components.css`, `src/docs/components.twig.json`, `scripts/upstream-exceptions.json`, `src/assets/icons/`).
- **Implementer** (Sonnet for static components and simple modules; Opus for multi-level menus, select, combobox, command, sidebar, resizable, calendar, chart): steps 3–6 and 8.
- **Verifier** (Haiku): step 7 — runs the gate, renders the docs page, executes `references/keyboard-checklist.md` in the browser tool, re-reads the diff against the upstream summary. Reports pass/fail per line; never fixes code.

## Pipeline (per component)

Run from the sample root. After each step output `✅ <step> — <one-line result>`.

1. **Upstream** — `node .claude/skills/shadcn-port/scripts/fetch-upstream.mjs <name>` → `upstream/<name>.summary.json` (slots, CVA maps, data-* attributes, `--radix-*` vars, lucide icons, registry deps). If a registry dependency is not yet ported, port it first. If the item is missing from `registry-index.json` (`probe-registry.mjs`), stop: the component is not portable in this style.
2. **Figma truth** (kit components only) — `node .claude/skills/shadcn-port/scripts/diff-figma-upstream.mjs <name>` → proposed overrides. The orchestrator approves them and appends the approved entries to `scripts/upstream-exceptions.json`. Missing Figma file → skip this step and say so.
3. **Twig** — `node .claude/skills/shadcn-port/scripts/scaffold-component.mjs <name>` then complete `src/templates/components/base/<name>/<name>.twig`: typed `{# params #}` header; `base` string + variant/size hashes copied verbatim; `data-slot` on every part exactly as upstream, `data-variant`/`data-size` where upstream has them; `class` appended LAST; `{{ attrs|default('')|raw }}`; slots as `{% block %}`, list children data-driven; icons as `<svg aria-hidden="true"><use href="#icon-<n>"></use></svg>` (download missing icons per `PORTING.md`); literal class names only; only the Twig features listed in `PORTING.md` (twig.js ∩ Twig PHP).
4. **Mocks** — `<name>.twig.json` as `{ "mocks": { "<name>": { "default": {…}, "<variant>": {…}, "<state>": {…} } } }`: one scenario per variant and per state (disabled, invalid, open, checked…). Realistic Italian copy.
5. **Module** (only if upstream is stateful/interactive) — `<name>.module.js`: `export default function <Name>Module(node) { …; return dispose }`, loaded via `data-module="<name>.module"` on the root. Write `data-state` only through `dataState.js`; ARIA per WAI-ARIA APG; complete keyboard support; `dispose()` removes every listener. Emit/consume events per `PORTING.md` §Integration API (`<component>:<verb>` in, `<component>:<past-participle>` out, `bubbles: true`).
6. **Local CSS** (only if needed) — `<name>.css` for keyframes/scoped rules, registered by the orchestrator in `src/css/components.css`. Tokens and reusable utilities stay in `globals.css`.
7. **Gate** — `npm run check:classes -- <name>` MUST exit 0 (MISSING = 0; review EXTRA). Render `/docs/components.html` in light and dark with zero Twig errors and zero console errors; interactive components pass their `references/keyboard-checklist.md` section; axe reports 0 violations for the component section.
8. **Optimise** — compare with the reference project's implementation of the same component (exit animations, focus return, scroll lock, typeahead, edge cases) and with the upstream React behaviour; close gaps; re-run step 7.
9. **Register** — `node .claude/skills/shadcn-port/scripts/register-docs.mjs <name> --group <id>`; add any new Adaptation rows or exceptions to `PORTING.md`. Report the final exception list for the component.

`--audit <name>`: run steps 1, 2 (dry), 7 only and report drift against upstream. `--batch`: run the pipeline per component, sequentially, sharing nothing but the reports; the orchestrator merges shared files once at the end.

## Definition of done

- `check:classes` exit 0 for the component; every exception has `source` and `note`.
- Params header complete; every documented `default:` has the matching `|default(...)` in the body.
- All upstream `data-slot` parts present; `class` last; `attrs` raw; no class concatenation.
- Mock per variant/state; renders in light and dark without Twig/console errors.
- Module (if any): returns a working `dispose`, APG-compliant, keyboard checklist passed.
- Entry present in `src/docs/components.twig.json`.

## Files

`scripts/probe-registry.mjs` · `scripts/fetch-upstream.mjs` · `scripts/check-upstream-classes.mjs` · `scripts/scaffold-component.mjs` · `scripts/register-docs.mjs` · `scripts/normalize-figma-measure.mjs` · `scripts/diff-figma-upstream.mjs` · `adaptation-rules.json` · `registry-index.json` · `upstream/*.summary.json` (cache, git-ignored) · `references/keyboard-checklist.md`. Decisions: `docs/adr/0003-new-york-v4-base-figma-wins.md`, `docs/adr/0002-native-html-apis-instead-of-radix.md`.
