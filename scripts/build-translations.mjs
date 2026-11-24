#!/usr/bin/env node
// Puts the hand-written Bokmål translations (content/translations-nb.json) into data/sentences.json,
// for sentences that have no Bokmål translation on Tatoeba, without rebuilding the rest of /data.
// scripts/build-data.mjs does the same when it rebuilds everything.
//   node scripts/build-translations.mjs           write data/sentences.json
//   node scripts/build-translations.mjs --check   exit 1 if data/sentences.json is out of date

import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { ROOT } from './lib/bulk.mjs';
import { HAND_NB, applyHandNb } from './lib/translations.mjs';

const file = path.join(ROOT, 'data/sentences.json');
const raw = await readFile(file, 'utf8');
const data = JSON.parse(raw);
const hand = JSON.parse(await readFile(path.join(ROOT, HAND_NB), 'utf8')).sentences;
const added = applyHandNb(data.sentences, hand);
const out = `${JSON.stringify(data)}\n`;
const total = Object.keys(data.sentences).length;
const withNb = Object.values(data.sentences).filter((s) => s.nb.length).length;

if (process.argv.includes('--check')) {
  if (out !== raw) {
    console.error('data/sentences.json is out of date with content/translations-nb.json: run npm run build:translations');
    process.exit(1);
  }
  console.log(`data/sentences.json is up to date (${added} hand translations, ${withNb} of ${total} sentences in Bokmål).`);
} else {
  if (out !== raw) await writeFile(file, out);
  console.log(`${added} hand translations; ${withNb} of ${total} sentences now have a Bokmål translation.`);
}
