#!/usr/bin/env node
// Writes data/tags.json: for every word of every sentence in data/sentences.json, which course word
// it is in that sentence, according to the Greynir parser (scripts/tag-icelandic.py).
//
// Spelling alone cannot tell homographs apart: "afar" in "Það var afar heitur dagur" is the adverb
// "very", not the plural of "afi"; "einu sinni" is "once", not forms of "einn" and "sinn"; "sér" in
// "Hann sér hundinn" is the verb "sjá", not the reflexive pronoun. The exercise generator uses these
// tags so that it never teaches a form in a sentence where it belongs to another word.
//
// Each sentence gets one entry per word (the \p{L}+ tokens the app uses):
//   a number  index into "lemmas": the word is that course word here,
//   -2 - i    course word i used loosely (a preposition as a particle, "til" in "búa til"):
//             known to the learner, but its sentence is not used to teach that word,
//   -1        the word is some other word (not in the course), or a name,
//   null      undetermined: the parser could not analyze the sentence and the form is ambiguous.
//
//   node scripts/build-tags.mjs            (needs .venv with reynir, see README)
//   node scripts/build-tags.mjs --check    exit 1 if data/tags.json does not match data/sentences.json

import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { appendFile, mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { createInterface } from 'node:readline';
import path from 'node:path';
import { CACHE, ROOT } from './lib/bulk.mjs';
import { pythonPath, SETUP_HELP } from './lib/lint.mjs';
import { align, resolve, words } from './lib/tags.mjs';

const OUT = path.join(ROOT, 'data', 'tags.json');
const CACHE_FILE = path.join(CACHE, 'greynir', 'tags.jsonl');
const TAGGER = 'tag-icelandic.py v1';
const readJson = async (rel) => JSON.parse(await readFile(path.join(ROOT, rel), 'utf8'));
const low = (s) => s.toLocaleLowerCase('is');
const key = (text) => createHash('sha1').update(`${TAGGER}\n${text}`).digest('hex');

// --- Course words --------------------------------------------------------------------------------------

async function courseForms(lexicon) {
  const forms = new Map(); // lowercase form -> Set of lemma ids
  const add = (f, id) => {
    const k = low(f);
    if (!forms.has(k)) forms.set(k, new Set());
    forms.get(k).add(id);
  };
  for (const file of await readdir(path.join(ROOT, 'data/forms'))) {
    const shard = await readJson(`data/forms/${file}`);
    for (const [id, e] of Object.entries(shard.lemmas)) {
      add(e.ord, id);
      for (const f of e.bmyndir ?? []) if (f.b) add(f.b, id);
    }
  }
  for (const [id, l] of Object.entries(lexicon.lemmas)) add(l.lemma, id);
  return forms;
}

// --- Greynir, with a cache keyed by sentence text --------------------------------------------------------

async function tagTexts(texts) {
  const cache = new Map();
  if (existsSync(CACHE_FILE)) {
    for (const line of (await readFile(CACHE_FILE, 'utf8')).split('\n')) {
      if (!line) continue;
      const { k, r } = JSON.parse(line);
      cache.set(k, r);
    }
  }
  const todo = [...new Set(texts)].filter((t) => !cache.has(key(t)));
  if (todo.length) {
    const python = pythonPath();
    if (!python) throw new Error(SETUP_HELP);
    console.log(`tagging ${todo.length} sentences with Greynir (cached after the first run)`);
    await mkdir(path.dirname(CACHE_FILE), { recursive: true });
    const child = spawn(python, ['-I', path.join(ROOT, 'scripts', 'tag-icelandic.py')], { stdio: ['pipe', 'pipe', 'inherit'] });
    const done = new Promise((resolve, reject) => {
      child.on('error', reject);
      child.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`tag-icelandic.py exited with ${code}`))));
    });
    child.stdin.end(todo.map((text, i) => JSON.stringify({ id: i, text })).join('\n'));
    let n = 0;
    for await (const line of createInterface({ input: child.stdout, crlfDelay: Infinity })) {
      if (!line) continue;
      const { id, ...r } = JSON.parse(line);
      cache.set(key(todo[id]), r);
      await appendFile(CACHE_FILE, `${JSON.stringify({ k: key(todo[id]), r })}\n`);
      if (++n % 250 === 0) console.log(`  ${n} of ${todo.length}`);
    }
    await done;
  }
  return (text) => cache.get(key(text));
}

// --- Main ----------------------------------------------------------------------------------------------------

async function main() {
  const lexicon = await readJson('data/lexicon.json');
  const { sentences } = await readJson('data/sentences.json');
  const ids = Object.keys(sentences);

  if (process.argv.includes('--check')) {
    const tags = existsSync(OUT) ? await readJson('data/tags.json') : null;
    const stale = !tags ? ids : ids.filter((sid) => tags.sentences[sid]?.length !== words(sentences[sid].is).length);
    if (stale.length) {
      console.log(`data/tags.json is out of date for ${stale.length} sentences (first: ${stale.slice(0, 3).join(', ')}). Run npm run build:tags.`);
      process.exit(1);
    }
    console.log('data/tags.json matches data/sentences.json.');
    return;
  }

  const forms = await courseForms(lexicon);
  const tagged = await tagTexts(ids.map((sid) => sentences[sid].is));
  const lemmaIds = Object.keys(lexicon.lemmas);
  const index = new Map(lemmaIds.map((id, i) => [id, i]));
  const stats = { sentences: ids.length, parsed: 0, words: 0, course: 0, loose: 0, other: 0, undetermined: 0 };
  const changed = new Map(); // "form: spelling says X, parser says Y" -> count
  const out = {};
  for (const sid of ids) {
    const text = sentences[sid].is;
    const r = tagged(text);
    if (r.parsed) stats.parsed++;
    const appWords = words(text);
    const aligned = align(appWords, r.tokens);
    out[sid] = appWords.map((w, i) => {
      const res = resolve(w, aligned[i], forms, lexicon);
      stats.words++;
      const spelling = [...(forms.get(low(w)) ?? [])];
      if (res === null) stats.undetermined++;
      else if (res === -1) {
        stats.other++;
        if (spelling.length) {
          const tok = aligned[i];
          const k = `${low(w)}: ${spelling.join('/')} -> ${tok?.l ? `${tok.l} ${tok.c}` : 'other'}`;
          changed.set(k, (changed.get(k) ?? 0) + 1);
        }
      } else if (res.startsWith('~')) stats.loose++;
      else stats.course++;
      if (res === null || res === -1) return res;
      return res.startsWith('~') ? -2 - index.get(res.slice(1)) : index.get(res);
    });
  }

  const reynir = existsSync(CACHE_FILE) ? 'reynir (Greynir), see .venv' : 'reynir (Greynir)';
  const file = {
    version: 1,
    generated: new Date().toISOString(),
    generator: 'scripts/build-tags.mjs',
    tool: `${reynir}; ${TAGGER}`,
    license: 'Derived from the Tatoeba sentences in data/sentences.json (CC BY 2.0 FR).',
    note: 'Per sentence, one entry per word (\\p{L}+ token): index into lemmas when the word is that course word in this sentence; -2 - index when it is that word used loosely (a preposition as a particle); -1 for another word or a name; null when undetermined.',
    lemmas: lemmaIds,
    sentences: out,
  };
  await writeFile(OUT, `${JSON.stringify(file)}\n`);
  const pct = (n, d) => `${((100 * n) / d).toFixed(1)}%`;
  console.log(`Wrote data/tags.json: ${stats.sentences} sentences, ${pct(stats.parsed, stats.sentences)} parsed; ${stats.words} words: ${stats.course} course words, ${stats.loose} used loosely, ${stats.other} other words or names, ${stats.undetermined} undetermined.`);
  const list = [...changed].sort((a, b) => b[1] - a[1]);
  console.log(`Forms that spelling would give to a course word but the parser gives to another word (${list.reduce((s, [, n]) => s + n, 0)} words, ${list.length} kinds):`);
  for (const [k, n] of list.slice(0, Number(process.env.TAGS_SHOW ?? 40))) console.log(`  ${n}x ${k}`);
}

await main();
