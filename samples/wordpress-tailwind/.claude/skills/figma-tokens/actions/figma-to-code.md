# figma-to-code — Figma → code (import)

Bring Figma tokens into `globals.css` (marker regions), **reusing the existing engine** + its two gates. Two transports: **MCP (primary)** and **JSON (fallback)**.

## 1. Transport (always state which one you're using)

- **Primary analysis tool is `use_figma` — non-negotiable.** The token analysis is done **only** with `use_figma`: it reads the **full, structured** collections / variables / modes in one authoritative pass, and the result is **markedly more precise**. **NEVER silently fall back.** If you don't have a Figma link / desktop access / permission for `use_figma`, **STOP and explicitly ask the user** for it first (state plainly that `use_figma` gives a far more precise result). Only if the user confirms they truly can't provide it do you proceed with the **JSON transport** below. **NEVER use `get_variable_defs` as the analysis channel** — it returns fragmented, partial, often inconclusive data; at most a marginal diagnostic spot-check, never the source of the import.
- **MCP — primary.** If Figma desktop is open on the file and you have permission:
  1. Claude calls `use_figma` (read) → reads **all** collections / variables / modes.
  2. Normalize the result into the **DTCG shape** the engine expects (reference: `scripts/lib/loader.mjs`, and the routing table below).
  3. Write the DTCG into the scratch `tokens/figma-export/` (same folder names as the collections).
- **JSON — fallback.** No MCP/seat: the user drops a DTCG export under `tokens/figma-export/` by hand.

Auto-detect: try MCP (`use_figma`); if you can't run it (no link / access / permission), **explicitly ask the user for Figma access before falling back** — don't silently switch, and **never** switch to `get_variable_defs`. Only once the user confirms they can't provide access, use the JSON present; if that's missing too, **ask the user**.

## 2. DTCG file routing (this Figma kit)

`scripts/lib/loader.mjs`'s `collectionOf()` routes each `*.tokens.json` file to a collection by the distinctive word(s) in its path (folder names may carry a numeric prefix, e.g. `"3. Mode"` — routing matches on words, not exact segments). For this kit:

| File | Routes to | Notes |
|---|---|---|
| `TailwindCSS/TailwindCSS.tokens.json` | `tailwind` | verify-only — the default Tailwind scales already cover it |
| `Brand/Brand.tokens.json` | `primitives` | wrapped under the collection root: `Brand/brand/<family>/<step>` → `--color-brand-<family>-<step>` (the root segment is dropped, every middle segment joins the family name, so kit hues never shadow Tailwind's built-in palette) |
| `Theme/Theme.tokens.json` | `theme` | shadow/inset-shadow/drop-shadow/blur emitted; colors skipped (dup of Mode); scales verify-only |
| `Mode/Light.tokens.json` | `mode-light` | groups `base` (semantics), `alpha` (overlays), `custom` (quarantine) |
| `Mode/Dark.tokens.json` | `mode-dark` | same 3 groups, dark mode |
| `Responsive/Desktop.tokens.json` | `custom-desktop` | mobile-first `md` override |
| `Responsive/Mobile.tokens.json` | `custom-mobile` | mobile-first base |

Leaf value shapes the loader (`scripts/lib/loader.mjs#leaves`) expects:
- **Color** — `{ "$value": { "hex": "#RRGGBB", "alpha": 1 } }` (`alpha` optional, defaults to `1`).
- **Number** — `{ "$value": 16 }` (a bare JS number).
- **String** — `{ "$value": "some string" }` (anything not a number, not an alias, not a color object).
- **Alias** — `{ "$value": "{group.name}" }` (a string starting with `{`, resolved by the classifier where supported, otherwise import as its resolved hex/number instead).

## 3. Flow

1. **Report-only** (safe, writes no CSS):
   ```
   node .claude/skills/figma-tokens/scripts/import-tokens.mjs
   ```
   Regenerates `tokens/audits/token-coverage-report.md`. Exits non-zero if even one leaf stays unclassified.
2. **GATE — coverage**: open the report, confirm `N/N … ✅ none lost` and 0 unaccepted warnings. If not 100%, **STOP**.
3. **GUARD — diff + confirm** (human, before writing):
   - Show the user the **diff** between the *incoming Figma value* and the *current code value*, highlighting tokens where they differ (= where a hand-edit would be overwritten).
   - The user **confirms** (Figma wins → proceed) or **aborts** (keep the code; optionally `reverse` + `code-to-figma` to push code up to Figma instead).
   - ⚠️ **Do NOT** run `reverse` before this import: in the MCP-fresh flow it would overwrite the scratch just read from Figma, cancelling the import.
4. **Apply** (irreversible write — **only on the user's imperative**):
   ```
   node .claude/skills/figma-tokens/scripts/import-tokens.mjs --apply
   ```
   Injects the blocks between the `globals.css` markers + rewrites `mode-custom-experimental.css`. The engine **aborts (exit 1) on a collision** with a hand-authored token outside the markers → rename your token, or — for an intentional brand override that shadows a marker (e.g. `--primary: var(--color-brand-blue-800)`) — wrap it in a `/* figma-tokens:overrides START … END */` region so the gate treats it as deliberate; **never** bypass.
5. **Rebuild**: `npm run build` (or restart `npm run dev`). ⚠️ Edits to `@theme`/`@source` do NOT hot-reload — restart the dev server. Rationale: [ADR 0001](../../../../docs/adr/0001-tailwind-v4-css-first-figma-token-zones.md).

## 4. Color rules
- **1:1 verbatim hex** (no OKLCH); transparency as **8-digit** hex `#RRGGBBAA`.
- The markers are hand-editable (provenance), but an edit inside the markers **survives an import only by going through the diff+confirm GUARD** — otherwise Figma overwrites it.

> Optional CLI flags (default = project paths): `--src DIR`, `--globals FILE`, `--quarantine FILE`, `--coverage FILE`, `--blocks FILE`. Mention them only if needed.
