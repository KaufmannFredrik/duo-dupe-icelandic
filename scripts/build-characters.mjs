#!/usr/bin/env node
// Writes the character files in assets/characters/ from scripts/characters/*.mjs: one SVG per
// character and expression, with its animations, and a still copy of each (-still.svg) for Calm
// mode. The cast and what each character does in the app are in js/characters.js.
//   node scripts/build-characters.mjs

import { mkdir, readdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { ROOT } from './lib/bulk.mjs';
import { EXPRESSIONS } from './characters/lib.mjs';
import { CAST } from '../js/characters.js';

const dir = path.join(ROOT, 'assets', 'characters');
await mkdir(dir, { recursive: true });
for (const f of await readdir(dir)) if (f.endsWith('.svg')) await rm(path.join(dir, f));
let n = 0;
for (const { id } of CAST) {
  const mod = await import(pathToFileURL(path.join(ROOT, 'scripts', 'characters', `${id}.mjs`)).href);
  for (const expr of EXPRESSIONS) {
    await writeFile(path.join(dir, `${id}-${expr}.svg`), `${mod[id](expr)}\n`);
    await writeFile(path.join(dir, `${id}-${expr}-still.svg`), `${mod[id](expr, { still: true })}\n`);
    n += 2;
  }
}
console.error(`wrote ${n} files to ${path.relative(ROOT, dir)}`);
