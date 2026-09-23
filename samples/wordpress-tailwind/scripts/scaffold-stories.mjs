#!/usr/bin/env node
// Thin wrapper so `node scripts/scaffold-stories.mjs` resolves to the actual
// generator kept with the rest of the shadcn-port skill.
await import('../.claude/skills/shadcn-port/scripts/scaffold-stories.mjs');
