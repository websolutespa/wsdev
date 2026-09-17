# reverse — code → portable DTCG

Reconstructs the 7-collection DTCG **from the code** (`globals.css`), **losslessly**. It is **not** the import anti-clobber valve: it's the **manual bridge to Figma** and the **snapshot**.

## Command
```
node .claude/skills/figma-tokens/scripts/reverse.mjs                 # identity (no deltas)
node .claude/skills/figma-tokens/scripts/reverse.mjs --with-deltas   # apply the re-skin DELTAS
node .claude/skills/figma-tokens/scripts/reverse.mjs --out <dir>     # output elsewhere (default: tokens/figma-export)
```
**Non-destructive**: writes **only** under `tokens/figma-export/` (or `--out`). **Never** touches `globals.css`.

## What it's for
1. **Manual code→Figma bridge without a full seat**: emit the DTCG, then import it into Figma by hand via **Tokens Studio**. It is the documented fallback for `code-to-figma` (which requires MCP + a full seat).
2. **Snapshot / inspection** of the current code tokens as a portable DTCG (debug, hand-off, other tools).
3. **Internal engine** reused by `code-to-figma` (to read the code tokens).

## When NOT to use it
- As "safety" before a `figma-to-code` via MCP: there the guard is the **diff + confirm** (see [figma-to-code.md](figma-to-code.md)). Running `reverse` before that import would overwrite the scratch just read from Figma.
