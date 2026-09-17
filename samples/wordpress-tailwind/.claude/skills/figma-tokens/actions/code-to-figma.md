# code-to-figma — code → Figma (realign)

Writes the **non-semantic** code tokens into Figma variables. **Requires Figma desktop open on the file + a full seat** (it reads Figma's state *and* writes). **No file fallback**: without MCP/seat → use `reverse` and import by hand via Tokens Studio.

## What it pushes (and what it doesn't)
- **Pushes: all NON-semantic tokens** — brand color primitives (`--color-*`), shadow/blur, radius, spacing, responsive/typographic (`--ws-*`), alpha. Any type (`COLOR`/`FLOAT`/`STRING`/`BOOLEAN`).
- **Excludes: the semantics** (`--primary`/`--background`/… = Mode/base, alias-prone). If they are aliases of the primitives in Figma, they update **by cascade** when you push the primitives.
- **Alias guard**: **never** overwrite with a literal a Figma variable that is an **alias** → flag it in the report, don't write it.
- **create + update within existing collections only**: update existing variables and **create** missing ones in their collection; **never** create new collections/modes → anything with no home goes into the report.

## Flow (dry-run → confirm → write)
1. **Read the code**: the current tokens from `globals.css` (the `reverse` / `scripts/lib` engine).
2. **Read Figma**: Claude calls `use_figma` (read) → collections / variables / modes / values (and discovers the real structure: which modes, which aliases). **The read is `use_figma`-only** — it's the authorial, full-structure pass and far more precise; **never** substitute `get_variable_defs` (fragmented/inconclusive). No access → **STOP** (see Preconditions), don't downgrade the read tool.
3. **2-way diff** (code is canonical): where code differs from Figma, **limited to the non-semantics** and respecting the alias guard.
4. **Divergence report** → `tokens/audits/code-to-figma-report.md`: every **un-pushed** token (excluded semantics + alias-skips) with **both sides** (code file+selector+value / Figma collection+mode+path+value), in 3 groups: ⚠️ DIVERGING · ✓ aligned · 🔒 alias-skip.
5. **User confirmation** (only on an imperative) → **write**: Claude calls `use_figma` (write) in **batches** (under ~50k chars of code per call), **idempotent** (upsert by name/path: find or create), on the **existing modes** of the file.
6. **Re-read to verify**: re-read the written variables to confirm the values and that **no alias was flattened**.

## Preconditions
- Figma desktop open on the right file (`fileKey` from the `/design/` URL).
- **Full seat** (edit rights). Without it → **STOP** with a clear message; propose `reverse` + Tokens Studio.

## Note
The exact collection/mode structure is **not assumed**: it's discovered on the fly via the `use_figma` read. The deterministic helpers live in `scripts/figma/` and the Figma steps are orchestrated by Claude via `use_figma`:
- **`figma/figma-color.mjs`** — the lossless `{r,g,b,a}` ⇄ hex seam (`figmaColorToHex` / `hexToFigmaColor`). Use it for **both** sides: hex → `{r,g,b,a}` when writing, `{r,g,b,a}` → hex when reading Figma back to verify.
- **`figma/report.mjs`** — `renderDivergenceReport(groups, meta)` builds the 3-group markdown for step 4 (caller writes the file + stamps the date).
- **Still to build** (needs a `use_figma` read of the real target file): the **diff** (code ↔ Figma) and the **name-mapping** (code token ⇄ Figma collection + variable path), which the diff takes as input — see `figma/figma-variable-shape.md` § Name mapping.
