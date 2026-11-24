#!/usr/bin/env node
// Puts the Bokmål written for TÖLVA into /data without rebuilding the rest: sentence translations
// (content/translations-nb.json) into data/sentences.json and word glosses
// (content/glosses-nb.json) into data/lexicon.json, where the sources have none, and records the
// new sizes and the source in data/SOURCES.json. scripts/build-data.mjs does the same when it
// rebuilds everything.
//   node scripts/build-translations.mjs           write the files
//   node scripts/build-translations.mjs --check   exit 1 if any of them is out of date

import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { ROOT } from './lib/bulk.mjs';
import { HAND_GLOSSES, HAND_NB, applyHandNb, noteTolvaSource } from './lib/translations.mjs';

const read = async (rel) => readFile(path.join(ROOT, rel), 'utf8');
const check = process.argv.includes('--check');

const sentencesRaw = await read('data/sentences.json');
const sentencesData = JSON.parse(sentencesRaw);
const sentences = applyHandNb(sentencesData.sentences, JSON.parse(await read(HAND_NB)).sentences);
const sentencesOut = `${JSON.stringify(sentencesData)}\n`;

const lexiconRaw = await read('data/lexicon.json');
const lexiconData = JSON.parse(lexiconRaw);
const glosses = applyHandNb(lexiconData.lemmas, JSON.parse(await read(HAND_GLOSSES)).glosses);
const lexiconOut = `${JSON.stringify(lexiconData)}\n`;

const sourcesRaw = await read('data/SOURCES.json');
const sourcesData = JSON.parse(sourcesRaw);
noteTolvaSource(sourcesData, 'data/sentences.json', sentencesOut);
noteTolvaSource(sourcesData, 'data/lexicon.json', lexiconOut);
const sourcesOut = `${JSON.stringify(sourcesData, null, 2)}\n`;

const files = [
  ['data/sentences.json', sentencesRaw, sentencesOut],
  ['data/lexicon.json', lexiconRaw, lexiconOut],
  ['data/SOURCES.json', sourcesRaw, sourcesOut],
];
const inBokmal = (records) => Object.values(records).filter((r) => r.nb.length).length;
const summary = `${sentences} hand translations (${inBokmal(sentencesData.sentences)} of ${Object.keys(sentencesData.sentences).length} sentences in Bokmål), ${glosses} hand glosses (${inBokmal(lexiconData.lemmas)} of ${Object.keys(lexiconData.lemmas).length} words)`;

if (check) {
  const stale = files.filter(([, raw, out]) => raw !== out).map(([rel]) => rel);
  if (stale.length) {
    console.error(`${stale.join(', ')} out of date with the Bokmål in content/: run npm run build:translations`);
    process.exit(1);
  }
  console.log(`Bokmål data is up to date: ${summary}.`);
} else {
  for (const [rel, raw, out] of files) if (raw !== out) await writeFile(path.join(ROOT, rel), out);
  console.log(`${summary}.`);
}
