#!/usr/bin/env node
// Checks that every UI string key used in the HTML and JavaScript exists in js/i18n/en.json and
// js/i18n/nb.json, and that both files have the same keys.
//   node scripts/check-i18n.mjs

import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { ROOT } from './lib/bulk.mjs';

const read = (f) => readFile(path.join(ROOT, f), 'utf8');
const en = JSON.parse(await read('js/i18n/en.json'));
const nb = JSON.parse(await read('js/i18n/nb.json'));

const used = new Set();
const html = (await readdir(ROOT)).filter((f) => f.endsWith('.html'));
for (const f of html) {
  for (const m of (await read(f)).matchAll(/data-i18n(?:-html|-aria-label|-placeholder|-title)?="([^"]+)"/g)) used.add(m[1]);
}
async function* jsFiles(dir) {
  for (const e of await readdir(path.join(ROOT, dir), { withFileTypes: true })) {
    const rel = path.join(dir, e.name);
    if (e.isDirectory()) yield* jsFiles(rel);
    else if (e.name.endsWith('.js')) yield rel;
  }
}
const dynamic = [];
for await (const f of jsFiles('js')) {
  const src = await read(f);
  for (const m of src.matchAll(/\bt\('([^']+)'/g)) used.add(m[1]);
  for (const m of src.matchAll(/\bt\(`([^`]+)`/g)) dynamic.push(`${f}: ${m[1]}`);
  // Keys inside data objects, such as { key: 'nav.learn' } or { label: 'number.sg' }: dotted names only.
  for (const m of src.matchAll(/\b(?:key|label): '([a-z]+\.[^']+)'/g)) used.add(m[1]);
}

const problems = [];
for (const k of used) {
  if (!(k in en)) problems.push(`missing in en.json: ${k}`);
  if (!(k in nb)) problems.push(`missing in nb.json: ${k}`);
}
for (const k of Object.keys(en)) if (!(k in nb)) problems.push(`in en.json but not nb.json: ${k}`);
for (const k of Object.keys(nb)) if (!(k in en)) problems.push(`in nb.json but not en.json: ${k}`);
for (const [k, v] of Object.entries({ ...en, ...nb })) if (/\u2014/.test(v)) problems.push(`em-dash in ${k}`);

console.log(`${used.size} static keys used, ${Object.keys(en).length} keys defined. Dynamic keys (check by hand):\n  ${dynamic.join('\n  ')}`);
if (problems.length) {
  console.log(`\n${problems.join('\n')}`);
  process.exit(1);
}
console.log('\nAll UI strings present in English and Norwegian.');
