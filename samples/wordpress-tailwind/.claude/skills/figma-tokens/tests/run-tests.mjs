#!/usr/bin/env node
/**
 * run-tests.mjs — run every *.test.mjs in this folder via Node's built-in runner.
 * (Node 22's `--test <dir>` tries to *require* the directory; passing explicit
 * files is the portable form, which this wrapper assembles.)
 *
 *   node .claude/skills/figma-tokens/tests/run-tests.mjs
 */
import { spawnSync } from 'node:child_process';
import { readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const files = readdirSync(HERE)
  .filter((f) => f.endsWith('.test.mjs'))
  .map((f) => join(HERE, f));

const res = spawnSync(process.execPath, ['--test', ...files], { stdio: 'inherit' });
process.exit(res.status ?? 1);
