// Runtime access to the generated course data in /data: the lexicon index, DMII Core paradigms
// (one file per theme), Tatoeba sentences with their word tags (data/tags.json) and Commons
// recordings. Loads lazily and builds the form index used by exercises, the dictionary and the
// stories reader.

import { loadJSON } from './app.js';
import { getSettings } from './store.js';
import { getLang, t } from './i18n.js';
import { analysesIn } from './grammar.js';
import { createGenerator, expandRules } from './engine/generate.js';

let lexicon;
let sentencesFile;
let tagsFile;
// Sentences never shown (content/sentence-exclude.json).
let excluded = new Set();
let audioFile;
let rules;
let names;
let index;
let generator;
const shards = new Map();

export async function loadLexicon() {
  lexicon ??= await loadJSON('data/lexicon.json');
  return lexicon;
}

export async function loadForms(themes) {
  const lex = await loadLexicon();
  const want = themes ?? lex.themes.map((t) => t.id);
  await Promise.all(want.filter((t) => !shards.has(t)).map(async (t) => shards.set(t, (await loadJSON(`data/forms/${t}.json`)).lemmas)));
}

/** Only the sentences, for sentence() and translation() on pages that need no word data. */
export async function loadSentences() {
  if (sentencesFile) return;
  const [s, ex] = await Promise.all([loadJSON('data/sentences.json'), loadJSON('content/sentence-exclude.json')]);
  excluded = new Set(Object.keys(ex.sentences));
  sentencesFile ??= s;
}

/** Everything exercises need: lexicon, all paradigms, sentences and their tags, recordings, rules, names. */
export async function loadAll() {
  await loadLexicon();
  const [s, tg, ex, a, r, allow] = await Promise.all([
    sentencesFile ?? loadJSON('data/sentences.json'),
    tagsFile ?? loadJSON('data/tags.json'),
    loadJSON('content/sentence-exclude.json'),
    audioFile ?? loadJSON('data/audio.json'),
    rules ?? loadJSON('content/case-rules.json').then(expandRules),
    names ?? loadJSON('content/allowlist.json').then((x) => new Set(x.names.map((n) => n.toLocaleLowerCase('is')))),
    loadForms(),
  ]);
  excluded = new Set(Object.keys(ex.sentences));
  sentencesFile = s.pool.some((sid) => excluded.has(sid)) ? { ...s, pool: s.pool.filter((sid) => !excluded.has(sid)) } : s;
  tagsFile = tg;
  audioFile = a;
  rules = r;
  names = allow;
  buildIndex();
  return { lexicon, sentences: sentencesFile.sentences, pool: sentencesFile.pool, audio: audioFile.recordings, rules };
}

export const lemma = (id) => lexicon?.lemmas[id];

// Guided writing (data/writing.json, scripts/build-writing.mjs): loaded when a lesson has a task.
let writingFile = null;
export async function loadWriting() {
  writingFile ??= await loadJSON('data/writing.json');
  return writingFile;
}
/** A writing task by id, with the gaps it uses, or null. */
export function writing(id) {
  const task = writingFile?.tasks.find((x) => x.id === id);
  return task ? { task, slots: writingFile.slots } : null;
}
/** The writing task a unit's review ends with, if any (loadWriting first). */
export const writingFor = (unitId) => writingFile?.tasks.find((x) => x.unit === unitId) ?? null;
export const entry = (id) => shards.get(lexicon.lemmas[id]?.theme)?.[id] ?? null;
export const sentence = (sid) => (excluded.has(sid) ? undefined : sentencesFile?.sentences[sid]);
/** The ids of every sentence that may be shown. */
export const sentenceIds = () => Object.keys(sentencesFile?.sentences ?? {}).filter((sid) => !excluded.has(sid));

// A sentence made for TÖLVA from a Tatoeba sentence by replacing one word has "from", the
// original's id: credits link to the original and say that a word was changed.
const TATOEBA_SHOW = 'https://tatoeba.org/en/sentences/show/';
/** A link to a sentence's page on Tatoeba (the original's, for a made sentence), labeled label + its id. */
export function tatoebaLink(sid, label = '#') {
  const id = sentencesFile?.sentences[sid]?.from ?? sid;
  return `<a href="${TATOEBA_SHOW}${id}" rel="noopener">${label}${id}</a>`;
}
/** ", one word changed for TÖLVA" after the credit of a made sentence, otherwise nothing. */
export const changedNote = (sid) => (sentencesFile?.sentences[sid]?.from ? `, ${t('credit.changed')}` : '');

/**
 * Which course word each word (p{L}+ token) of a sentence is there, from the Greynir parse:
 * a lemma id, "~" + id for that word used loosely (a preposition as a particle), -1 for another
 * word or a name, null when undetermined; undefined without tags.
 */
export function tagsOf(sid) {
  const t = tagsFile?.sentences[sid];
  return t?.map((x) => (x === null || x === -1 ? x : x <= -2 ? `~${tagsFile.lemmas[-2 - x]}` : tagsFile.lemmas[x]));
}

const CASE_LETTER = { n: 'NF', a: 'ÞF', d: 'ÞGF', g: 'EF' };
/**
 * The case of each word (p{L}+ token) of a sentence as the parser gives it there: NF, ÞF, ÞGF,
 * EF, or null for a word without one; undefined when the sentence was not parsed.
 */
export function casesOf(sid) {
  const c = tagsFile?.cases?.[sid];
  return c ? [...c].map((x) => CASE_LETTER[x] ?? null) : undefined;
}
export const recordings = (id) => audioFile?.recordings[id] ?? [];

/** Only the Commons recordings, for recordings() on pages that need no other word data. */
export async function loadRecordings() {
  audioFile ??= await loadJSON('data/audio.json');
}
/** A name allowed in sentences (content/allowlist.json), which keeps its capital in a word bank. */
export const isName = (word) => Boolean(names?.has(word.toLocaleLowerCase('is')));
export const caseRules = () => rules;

/** Forms of a lemma as [{ g, b }]; an indeclinable word has its single form. */
export function paradigm(id) {
  const e = entry(id);
  if (!e) return [];
  if (e.indeclinable) return [{ g: '-', b: e.ord }];
  return (e.bmyndir ?? []).filter((f) => f.b);
}

function buildIndex() {
  if (index) return;
  index = new Map();
  for (const id of Object.keys(lexicon.lemmas)) {
    for (const f of [{ b: lexicon.lemmas[id].lemma }, ...paradigm(id)]) {
      const k = f.b.toLocaleLowerCase('is');
      if (!index.has(k)) index.set(k, new Set());
      index.get(k).add(id);
    }
  }
}

export const formIndex = () => index;

/** All analyses of a word form across the course: [{ id, tag, parsed }]. */
export function analyze(form) {
  const ids = index?.get(form.toLocaleLowerCase('is')) ?? new Set();
  return [...ids].flatMap((id) => {
    const an = analysesIn(paradigm(id), form);
    return an.length ? an.map((a) => ({ id, ...a })) : [{ id, tag: null, parsed: {} }];
  });
}

export function getGenerator() {
  generator ??= createGenerator({ lexicon, paradigm, formIndex: index, sentences: sentencesFile.sentences, pool: sentencesFile.pool, tagsOf, casesOf, audio: audioFile.recordings, rules, names });
  return generator;
}

export const glossLang = () => getSettings().glossLang ?? getLang();

/** A short gloss for exercises: Norwegian when chosen and available, else the first English sense. */
export function gloss(id, lang = glossLang()) {
  const l = lexicon.lemmas[id];
  if (!l) return '';
  if (lang === 'nb' && l.nb.length) return (l.ofl === 'so' ? 'å ' : '') + l.nb[0];
  const first = (l.en[0] ?? '').replace(/\s*[[(][^\])]*[\])]/g, '').split(/[;,]/)[0].trim();
  if (first && first.length <= 28) return first;
  return (l.ofl === 'so' ? 'to ' : '') + l.meaning;
}

const byGloss = new Map();
/**
 * Other course words shown with the same gloss as this one ("to know": vita, þekkja, kunna;
 * "når": hvenær, þegar), so a typed answer of one of them is right too.
 */
export function sameGloss(id, lang = glossLang()) {
  if (!byGloss.has(lang)) {
    const map = new Map();
    for (const x of Object.keys(lexicon.lemmas)) {
      const g = gloss(x, lang).toLocaleLowerCase(lang);
      if (!map.has(g)) map.set(g, []);
      map.get(g).push(x);
    }
    byGloss.set(lang, map);
  }
  const word = lexicon.lemmas[id]?.lemma;
  return (byGloss.get(lang).get(gloss(id, lang).toLocaleLowerCase(lang)) ?? []).filter((x) => x !== id && lexicon.lemmas[x].lemma !== word);
}

/** Sentence translation in the gloss language when Tatoeba has one. */
export function translation(sid, lang = glossLang()) {
  const s = sentence(sid);
  if (!s) return { text: '', lang: 'en' };
  if (lang === 'nb' && s.nb?.length) return { text: s.nb[0], lang: 'nb' };
  return { text: s.en[0] ?? '', lang: 'en' };
}
