---
name: figma-tokens
description: "Single skill for the project's design tokens: import Figma → code, push code → Figma, and reverse (code → portable DTCG). Source of truth = src/css/globals.css (committed); everything under tokens/ is git-ignored scratch; Figma is OPTIONAL. Use when the user says: 'import figma tokens', 'sync figma tokens', 'push tokens to figma', 'update figma from code', 'code to figma', 'reverse tokens', 'export tokens as DTCG', 'token snapshot'; runs /figma-tokens; or drops a DTCG export into tokens/figma-export/. Three sub-commands: figma-to-code, code-to-figma, reverse. Do NOT use for a single arbitrary CSS tweak, generic styling, or component work."
argument-hint: "[figma-to-code | code-to-figma | reverse]"
---

# figma-tokens — the token pipeline (Figma ⇄ code)

One skill for all design tokens: bring tokens **from Figma into code**, push them **back to Figma**, or **export them as DTCG**. The **deterministic scripts** live here (`scripts/`) and do the heavy lifting; you orchestrate the flow with the **gates** and the `use_figma` steps (**only Claude** can call those). Design & porting decisions (hex format, 9 markers, `figma-tokens:overrides` zone, npm/Vite tooling): [docs/adr/0001-tailwind-v4-css-first-figma-token-zones.md](../../../docs/adr/0001-tailwind-v4-css-first-figma-token-zones.md).

**How to talk to the user**:
- Show commands and paths — skip long explanations unless something fails.
- **Adjacent Possible**: present, ask, **execute ONLY on an explicit imperative** ("run it/go ahead/do it").
- Always `npm`, never `pnpm`/`yarn` (build/dev commands run at the project root).

## Shared principles (apply to every sub-command)

- **The code is the source of truth.** The canonical tokens are the CSS custom properties in `src/css/globals.css` (committed, **hand-editable in place**, even inside the `figma:<block>` markers). The markers mean "**provenance: last sync from Figma**", **not** "do not touch". Everything under `tokens/` is **git-ignored scratch**. **Figma is optional** — a project can live without it.
- **Terminology**: a *brand color primitive* is `--color-<family>-<step>` (Figma "Brand" / "Color Palette" collection); a *semantic* is a role token `--primary`/`--background`/… (Figma "Mode/base"). Don't confuse it with a shadcn *component* Primitive.
- **Two engine gates (never disable):** **coverage** (lossless — every leaf classified) and **collision** (a generated token must not share a name with a hand-authored one outside the markers).
- **`use_figma` is called by Claude, not by a node script.** The scripts do the deterministic transforms; the skill orchestrates the Figma read/write steps, piping JSON between `use_figma` and the scripts.
- **Primary Figma read = `use_figma` (non-negotiable).** Every Figma analysis/read (in `figma-to-code` and the read step of `code-to-figma`) goes through `use_figma` — the authorial, full-structure pass, and far more precise. `get_variable_defs` is **not** an analysis channel (fragmented/inconclusive). **Never fall back silently:** if you lack Figma access for `use_figma`, **explicitly ask the user for it first**; only if they can't provide it, fall back to **JSON** — never to `get_variable_defs`.
- **Decision discipline**: an architectural / data-model fork **WAITS** for the user; an imperative greenlights the agreed action, **not** an open model choice.

## Sub-commands — routing

| The user wants to… | Sub-command | Follow |
|---|---|---|
| Bring/update tokens **from Figma** into code (or has a new export) | **figma-to-code** | [actions/figma-to-code.md](actions/figma-to-code.md) |
| **Push back to Figma** the changes made in code | **code-to-figma** | [actions/code-to-figma.md](actions/code-to-figma.md) |
| Emit the code tokens as a **portable DTCG** (manual bridge / snapshot) | **reverse** | [actions/reverse.md](actions/reverse.md) |

If the intent is ambiguous, **ask which of the three** before acting.

## Scripts & tests (in this skill)

`scripts/import-tokens.mjs` (import CLI) · `scripts/reverse.mjs` (code→DTCG) · `scripts/lib/{loader,classifier,injector,color}.mjs` (engine) · `scripts/figma/` (code-to-figma helpers) · `tests/run-tests.mjs`.
After **any** change to the scripts: `node .claude/skills/figma-tokens/tests/run-tests.mjs`.

## Safety rules (non-negotiable)

- **Never write without an explicit green light**: report/dry-run first, review the diff, then `--apply`/write **only on an imperative**.
- **Never disable the gates**; resolve a collision by renaming the custom token (or, for an intentional brand override that shadows a marker, move it into a `figma-tokens:overrides` region — see [ADR 0001](../../../docs/adr/0001-tailwind-v4-css-first-figma-token-zones.md)).
- **Always `npm`.** After changing the scripts, re-run the tests.
