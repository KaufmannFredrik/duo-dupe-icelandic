// Is a word a Bokmål word form? Asks Bokmålsordboka (ord.uib.no, Universitetet i Bergen og
// Språkrådet, CC BY 4.0) for articles of which it is the headword or an inflected form. The form
// search misses some headwords (morges, as in "i morges"), so for a word it does not find, the
// articles a full-text search finds are read, and the word counts if it is one of their headwords
// or inflected forms, or a word of a headword expression (tide, in "på tide"). Answers are cached in .cache/ordbokene/ (form-<word>.json, and bm-<id>.json
// for articles, shared with scripts/build-bridge.mjs), so only new words go to the network.

import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { CACHE } from './bulk.mjs';

const API = 'https://ord.uib.no/api/articles';
const UA = 'TOLVA build script (https://github.com/KaufmannFredrik/duo-dupe-icelandic)';
const dir = path.join(CACHE, 'ordbokene');
const memo = new Map();

/** True when Bokmålsordboka has the word (lowercase) as a headword or an inflected form. */
export function bokmalForm(word) {
  if (!memo.has(word)) memo.set(word, lookup(word));
  return memo.get(word);
}

async function getJson(url) {
  for (let attempt = 0; ; attempt++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(20_000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (e) {
      if (attempt >= 2) throw new Error(`Bokmålsordboka: ${e.message} for ${url}`);
      await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
    }
  }
}

async function article(id) {
  const file = path.join(dir, `bm-${id}.json`);
  if (existsSync(file)) return JSON.parse(await readFile(file, 'utf8'));
  const body = await getJson(`https://ord.uib.no/bm/article/${id}.json`);
  await writeFile(file, JSON.stringify(body));
  return body;
}

const formsOf = (art) => (art?.lemmas ?? []).flatMap((l) => [l.lemma, ...(l.paradigm_info ?? []).flatMap((p) => (p.inflection ?? []).map((i) => i.word_form))]).filter(Boolean);

async function lookup(word) {
  const file = path.join(dir, `form-${word}.json`);
  if (existsSync(file)) {
    const cached = JSON.parse(await readFile(file, 'utf8'));
    if (cached.found || cached.fulltext) return cached.found;
  }
  await mkdir(dir, { recursive: true });
  let articles = (await getJson(`${API}?w=${encodeURIComponent(word)}&dict=bm&scope=ei`))?.articles?.bm ?? [];
  let fulltext = false;
  if (!articles.length) {
    fulltext = true;
    const hits = ((await getJson(`${API}?w=${encodeURIComponent(word)}&dict=bm&scope=eif`))?.articles?.bm ?? []).slice(0, 12);
    for (const id of hits) {
      const forms = formsOf(await article(id)).map((f) => f.toLocaleLowerCase('nb'));
      if (forms.some((f) => f === word || (f.includes(' ') && f.split(' ').includes(word)))) articles.push(id);
    }
  }
  await writeFile(file, JSON.stringify({ found: articles.length > 0, articles, fulltext }));
  return articles.length > 0;
}

/**
 * A word Bokmålsordboka does not list may be a compound of two that it does, as Norwegian writes
 * compounds as one word: kaffe + kopp, or with a linking s or e (arbeid-s-dag). Returns the parts.
 */
export async function bokmalCompound(word) {
  for (let i = 3; i <= word.length - 3; i++) {
    const head = word.slice(0, i);
    const tail = word.slice(i);
    if (!(await bokmalForm(tail))) continue;
    for (const h of [head, ...(/[se]$/.test(head) && head.length > 3 ? [head.slice(0, -1)] : [])]) {
      if (await bokmalForm(h)) return [h, tail];
    }
  }
  return null;
}

/** A genitive: a form with -s added (menneskets, Norges), which the dictionary does not list. */
export async function bokmalGenitive(word) {
  return word.length > 3 && word.endsWith('s') && bokmalForm(word.slice(0, -1));
}

/** Runs fn over items with a few requests at a time. */
export async function eachLimited(items, fn, limit = 4) {
  const queue = [...items];
  await Promise.all(Array.from({ length: limit }, async () => {
    while (queue.length) await fn(queue.shift());
  }));
}
