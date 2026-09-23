# Figma Variables — JSON shape returned by `use_figma` (locked)

> Verified against a real `use_figma` read of the Figma Plugin API (a shadcn/ui-derived kit, used only to
> confirm the **shape**). The shape is **file-independent**; only the names/brand vary per file.
> This is the contract the `code-to-figma` / `figma-to-code` helpers build on.

## Read APIs (orchestrated by Claude via `use_figma`, not callable from node)
- `await figma.variables.getLocalVariableCollectionsAsync()` → `VariableCollection[]`
- `await figma.variables.getLocalVariablesAsync()` → `Variable[]`
- (write, full seat) `createVariableCollection`, `collection.addMode`, `createVariable`, `variable.setValueForMode(modeId, value)`, `figma.variables.createVariableAlias(targetVar)`

## Collection
```
{ id: "VariableCollectionId:…", name: string, defaultModeId: string,
  modes: [{ modeId: string, name: string }], variableIds: string[] }
```
- A collection has 1+ named modes (e.g. Mode → "Light"/"Dark"; Custom → "Desktop"/"Mobile"; palette → single "Mode 1"/"Default").

## Variable
```
{ id: "VariableID:…", name: "group/sub/leaf"  // "/" is the group separator
  resolvedType: "COLOR" | "FLOAT" | "STRING" | "BOOLEAN",
  scopes: string[],                            // e.g. ["GAP"], ["FONT_FAMILY"], ["ALL_SCOPES"]
  variableCollectionId: "VariableCollectionId:…",
  valuesByMode: { [modeId]: VALUE } }
```

## VALUE per type
| resolvedType | VALUE shape | Example |
|---|---|---|
| COLOR | `{ r, g, b, a }` floats **0–1** | `{r:0.702,g:0.792,b:0.867,a:1}` |
| FLOAT | `number` | `6`, `-1.5` |
| STRING | `string` | `"Noto Sans"` |
| BOOLEAN | `boolean` | `true` |
| **ALIAS** (any type) | `{ type: "VARIABLE_ALIAS", id: "VariableID:…" }` | points to another variable |

## COLOR ⇄ CSS hex (the lossless seam — implemented in `scripts/figma/figma-color.mjs`)
- Figma → hex (`figmaColorToHex`): `to8 = n => round(clamp(n,0,1)*255)` → `#RRGGBB`; if `a < 0.999` append `AA = to8(a)` → `#RRGGBBAA` (alpha contract reused from `lib/color.mjs#toCssColor`).
- hex → Figma (`hexToFigmaColor`): `{ r: RR/255, g: GG/255, b: BB/255, a: AA/255 ?? 1 }`.
- Lossless at 8-bit (round-trips exactly — covered by `tests/figma-color.test.mjs`). Figma may hold higher-precision floats; snapping to hex matches the project's **1:1-hex** contract (no OKLCH).

## Structural reality (observed; the real project file is a rebrand of this scaffold, so expect the same shape)
- **Semantics are ALIASES, not literals.** A `Mode/base/<role>` variable aliases an intermediate (`Theme/colors/<role>-light|dark`), which in turn aliases a palette literal. A 2–3 level chain. → `code-to-figma` **excludes semantics** and **never flattens an alias into a literal** (alias-guard). Validated.
- **Only the palette holds literal COLORs** (the `*Color Palette` collection, 0 aliases) — the clean push target for "change the base colors".
- Non-color scales (radius/spacing/text/font) live across Theme/Tailwind/Custom and are a **mix of literals and aliases**; aliased ones are alias-skipped on push.
- Files may carry collections with **no code equivalent** (e.g. an "Icon Library" of BOOLEAN toggles) → ignored by `code-to-figma`.

## Name mapping (FILE-SPECIFIC — resolved at runtime)
Collection/family/variable **names differ per file** (e.g. `Brand Color Palette`/`blue`/`light-grey` in code vs `Vendor Color Palette`/`vendor blue`/`light grey` in the tested scaffold). The diff must take a **name-mapping** (code token ⇄ Figma collection + variable path) as input, discovered by reading the **real target file** with `use_figma` — never hard-coded.
