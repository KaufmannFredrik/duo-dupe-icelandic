#!/usr/bin/env node
// Writes the static mascot files in assets/tala/ from js/tala.js, one per expression.
//   node scripts/build-tala.mjs

import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { ROOT } from './lib/bulk.mjs';
import { EXPRESSIONS, talaSVG } from '../js/tala.js';

const dir = path.join(ROOT, 'assets', 'tala');
await mkdir(dir, { recursive: true });
for (const expression of EXPRESSIONS) {
  const label = `Tala, the TÖLVA mascot (${expression})`;
  await writeFile(path.join(dir, `tala-${expression}.svg`), `${talaSVG(expression, { label })}\n`);
  await writeFile(path.join(dir, `tala-${expression}-head.svg`), `${talaSVG(expression, { label, crop: 'head' })}\n`);
}
console.error(`wrote ${EXPRESSIONS.length * 2} files to ${path.relative(ROOT, dir)}`);
