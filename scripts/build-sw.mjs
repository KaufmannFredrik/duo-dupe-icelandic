#!/usr/bin/env node
// Writes sw.js: the service worker with the list of files to precache and a version that is a
// hash of their contents, so every change to the site installs a fresh cache. Generated audio is
// not precached; it is cached when played, or all at once from Settings.
//   node scripts/build-sw.mjs           write sw.js
//   node scripts/build-sw.mjs --check   exit 1 if sw.js is out of date (part of npm run check)

import { createHash } from 'node:crypto';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { ROOT } from './lib/bulk.mjs';

const INCLUDE = [
  { dir: '.', ext: ['.html', '.webmanifest'], deep: false },
  { dir: 'css', ext: ['.css'] },
  { dir: 'js', ext: ['.js', '.json'] },
  { dir: 'assets', ext: ['.svg', '.png'] },
  { dir: 'content', ext: ['.json'] },
  { dir: 'data', ext: ['.json'], skip: ['data/audio/samples.json'] },
];

async function list({ dir, ext, deep = true, skip = [] }) {
  const out = [];
  for (const e of await readdir(path.join(ROOT, dir), { withFileTypes: true })) {
    const rel = dir === '.' ? e.name : `${dir}/${e.name}`;
    if (e.isDirectory()) {
      if (deep) out.push(...(await list({ dir: rel, ext, deep, skip })));
    } else if (ext.includes(path.extname(e.name)) && !skip.includes(rel)) out.push(rel);
  }
  return out;
}

// Text is hashed with LF line endings, so a Windows checkout (CRLF) gets the same version as the
// repository and GitHub Pages.
const lf = (text) => text.replace(/\r\n/g, '\n');
const read = async (f) => (f.endsWith('.png') ? readFile(path.join(ROOT, f)) : lf(await readFile(path.join(ROOT, f), 'utf8')));

const files = (await Promise.all(INCLUDE.map(list))).flat().sort();
const hash = createHash('sha256');
for (const f of files) hash.update(f).update(await read(f));
const version = hash.digest('hex').slice(0, 12);
const template = lf(await readFile(path.join(ROOT, 'scripts', 'sw-template.js'), 'utf8'));
const sw = template
  .replace('__VERSION__', version)
  .replace('__PRECACHE__', JSON.stringify(['./', ...files], null, 2));

const target = path.join(ROOT, 'sw.js');
if (process.argv.includes('--check')) {
  const current = lf(await readFile(target, 'utf8').catch(() => ''));
  if (current !== sw) {
    console.error('sw.js is out of date. Run: node scripts/build-sw.mjs');
    process.exit(1);
  }
  console.log(`sw.js is up to date (version ${version}, ${files.length} files).`);
} else {
  await writeFile(target, sw);
  const bytes = (await Promise.all(files.map((f) => readFile(path.join(ROOT, f))))).reduce((n, b) => n + b.length, 0);
  console.log(`wrote sw.js: version ${version}, ${files.length} files, ${(bytes / 1e6).toFixed(1)} MB precached`);
}
