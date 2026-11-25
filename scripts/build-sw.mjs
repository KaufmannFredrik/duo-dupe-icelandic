#!/usr/bin/env node
// Writes sw.js: the service worker with the list of files to precache and a version that is a
// hash of their contents, so every change to the site installs a fresh cache. Generated audio is
// not precached; it is cached when played, or all at once from Settings. The cast's pictures and
// the other voices' manifests are cached when first used (ON_USE).
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
  { dir: 'data', ext: ['.json'], skip: ['data/audio/samples.json', 'data/numbers.json'] }, // numbers.json: for the audio build only
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

// Not precached but cached when first used (RUNTIME in scripts/sw-template.js), to keep the first
// visit small: the cast's pictures (56 files, 0.8 MB; a learner meets them one unit at a time) and
// the manifests of the voices other than the default Steinn (0.3 MB each; one is used, if chosen).
// They still count for the version, so a change to them installs a fresh cache.
const ON_USE = /^(assets\/characters\/|data\/audio\/tts-(salka|bui|ugla)\.json$)/;

const files = (await Promise.all(INCLUDE.map(list))).flat().sort();
const hash = createHash('sha256');
for (const f of files) hash.update(f).update(await read(f));
const version = hash.digest('hex').slice(0, 12);
const precache = files.filter((f) => !ON_USE.test(f));
const template = lf(await readFile(path.join(ROOT, 'scripts', 'sw-template.js'), 'utf8'));
const sw = template
  .replace('__VERSION__', version)
  .replace('__PRECACHE__', JSON.stringify(['./', ...precache], null, 2));

const target = path.join(ROOT, 'sw.js');
if (process.argv.includes('--check')) {
  const current = lf(await readFile(target, 'utf8').catch(() => ''));
  if (current !== sw) {
    console.error('sw.js is out of date. Run: node scripts/build-sw.mjs');
    process.exit(1);
  }
  console.log(`sw.js is up to date (version ${version}, ${precache.length} files precached).`);
} else {
  await writeFile(target, sw);
  const size = async (list) => (await Promise.all(list.map((f) => readFile(path.join(ROOT, f))))).reduce((n, b) => n + b.length, 0) / 1e6;
  console.log(`wrote sw.js: version ${version}, ${precache.length} files, ${(await size(precache)).toFixed(1)} MB precached; ${files.length - precache.length} files, ${(await size(files.filter((f) => ON_USE.test(f)))).toFixed(1)} MB cached when used`);
}
