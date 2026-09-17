#!/usr/bin/env node
// Thin wrapper so `npm run check:classes` (scripts/check-upstream-classes.mjs) resolves
// to the actual gate implementation kept with the rest of the shadcn-port skill.
await import('../.claude/skills/shadcn-port/scripts/check-upstream-classes.mjs');
