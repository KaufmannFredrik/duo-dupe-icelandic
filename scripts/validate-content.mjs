#!/usr/bin/env node
// Content validation. Fails (exit 1) when:
//  - a vocabulary lemma is missing from the DMII Core data in data/,
//  - an Icelandic token in any content file is not a DMII Core word form (checked against the
//    generated paradigms, then the DMII Core API with a cache), unless it is a clitic form such
//    as "geturðu" (getur + þú) or a proper noun on the allowlist (content/allowlist.json),
//  - a referenced sentence, lemma or form does not exist,
//  - a hand-written sentence ("source": "authored") has a GreynirCorrect error,
//  - an excluded sentence (content/sentence-exclude.json) is used in a guidebook or a story,
//  - a unit's host or a story's cast names a character not in js/characters.js, or a host's
//    greeting is missing or excluded,
//  - a hand-written Bokmål translation (content/translations-nb.json) belongs to no sentence, to an
//    excluded one or to one Tatoeba already translates, ends with other punctuation than the
//    Icelandic, or has a word that is not a Bokmålsordboka form (or a compound of two, or a name
//    listed in the file),
//  - a letter or spelling in content/letters.json is incomplete, is out of alphabet order, names
//    a word that is not a course word, or has a name without audio in one of the four voices,
//  - a Bokmål word gloss the app shows (from Wiktionary, or written or corrected by hand in
//    content/glosses-nb.json) has a word that is not a Bokmålsordboka form, or more than one word
//    without being a listed phrase, or a correction no longer matches what Wiktionary gives,
//  - a Bokmål etymology (content/etymology-nb.json) has a word that is not a Bokmålsordboka form
//    (cited forms, which are also in the English, and the file's names aside), English left in it,
//    or English quotation marks; words without one, or translated from an older English text, are
//    warnings.
// Content not yet checked against sources ("reviewed": false) is counted and listed, not failed;
// content/CLAIMS.md lists every hand-written claim with its source.
//
//   node scripts/validate-content.mjs

import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { CACHE, ROOT } from './lib/bulk.mjs';
import { blocking, lintTexts, pythonPath, SETUP_HELP } from './lib/lint.mjs';
import { character } from '../js/characters.js';
import { hashSeed } from '../js/engine/rng.js';
import { HAND_GLOSSES, HAND_NB, applyHandNb, wiktionaryNb } from './lib/translations.mjs';
import { bokmalCompound, bokmalForm, bokmalGenitive, eachLimited } from './lib/bokmal.mjs';

const UA = 'TOLVA-validate/0.1 (+https://github.com/KaufmannFredrik/duo-dupe-icelandic)';
const readJson = async (rel) => JSON.parse(await readFile(path.join(ROOT, rel), 'utf8'));
const low = (s) => s.toLocaleLowerCase('is');
const errors = [];
const warnings = [];
const unreviewed = [];
const err = (where, msg) => errors.push(`${where}: ${msg}`);

// --- Word-form knowledge -------------------------------------------------------------------------------

const lexicon = await readJson('data/lexicon.json');
const sentences = (await readJson('data/sentences.json')).sentences;
const allowlist = await readJson('content/allowlist.json');
const names = new Set(allowlist.names.map(low));
const excluded = (await readJson('content/sentence-exclude.json')).sentences;
for (const sid of Object.keys(excluded)) if (!sentences[sid]) warnings.push(`content/sentence-exclude.json: sentence ${sid} is not in data/sentences.json`);

const forms = new Map(); // lowercase form -> Set of lemma ids
const addForm = (form, id) => {
  if (!form) return;
  const k = low(form);
  if (!forms.has(k)) forms.set(k, new Set());
  forms.get(k).add(id);
};
const paradigms = new Map(); // lemma id -> [{g, b}]
for (const file of await readdir(path.join(ROOT, 'data/forms'))) {
  const shard = await readJson(`data/forms/${file}`);
  for (const [id, entry] of Object.entries(shard.lemmas)) {
    const bmyndir = (entry.bmyndir ?? []).filter((f) => f.b);
    paradigms.set(id, entry.indeclinable ? [{ g: 'indeclinable', b: entry.ord }] : bmyndir);
    addForm(entry.ord, id);
    for (const f of bmyndir) addForm(f.b, id);
  }
}
// DMII Core lookups for tokens outside the course data, cached on disk.
let lastRequest = 0;
const apiCache = path.join(CACHE, 'bin', 'form');
async function inDmiiCore(token) {
  const file = path.join(apiCache, `${token}.json`);
  if (existsSync(file)) return JSON.parse(await readFile(file, 'utf8')).found;
  const wait = lastRequest + 150 - Date.now();
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  lastRequest = Date.now();
  const res = await fetch(`https://bin.arnastofnun.is/api/beygingarmynd/${encodeURIComponent(token)}`, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(20_000) });
  if (!res.ok && res.status !== 404) throw new Error(`DMII Core API: HTTP ${res.status} for ${token}`);
  const body = res.ok ? await res.json() : [];
  // The API answers {"0": ""} when nothing matches.
  const found = Array.isArray(body) ? body.length > 0 : Boolean(body?.ord);
  await mkdir(apiCache, { recursive: true });
  await writeFile(file, JSON.stringify({ found, words: (Array.isArray(body) ? body : [body]).filter((x) => x?.ord).map((x) => `${x.ord} ${x.ofl}`) }));
  return found;
}

async function knownWord(token) {
  if (forms.has(token)) return 'course';
  if (names.has(token)) return 'allowlist';
  if (await inDmiiCore(token)) return 'dmii';
  // Clitic second-person pronoun: geturðu = getur þú, viltu = vilt þú, ertu = ert þú.
  for (const base of [token.slice(0, -2), token.slice(0, -1)]) {
    if (/(ðu|du|tu|u)$/.test(token) && base.length > 1 && (forms.has(base) || (await inDmiiCore(base)))) return 'clitic';
  }
  return null;
}

const tokensOf = (text) => [...text.matchAll(/\p{L}+/gu)].map((m) => low(m[0]));

async function checkText(where, text) {
  for (const token of tokensOf(text)) {
    if (!(await knownWord(token))) err(where, `"${token}" is not a DMII Core word form (in: ${text})`);
  }
}

function sentenceText(id) {
  return sentences[id]?.is ?? null;
}

// --- Content files -----------------------------------------------------------------------------------------

async function checkVocab() {
  const vocab = await readJson('content/vocab/core.json');
  if (vocab.reviewed === false) unreviewed.push('content/vocab/core.json (word selection)');
  for (const theme of vocab.themes) {
    for (const [lemma, ofl] of theme.words) {
      const id = `${lemma}_${ofl}`;
      if (!lexicon.lemmas[id]?.verified) err('content/vocab/core.json', `${id} is not in the DMII Core (or, for indeclinable numerals, the full BÍN)`);
    }
  }
}

function checkFormOf(where, form, lemmaKey) {
  const p = paradigms.get(lemmaKey);
  if (!p) return err(where, `unknown lemma ${lemmaKey}`);
  if (!p.some((f) => f.b === form)) err(where, `"${form}" is not a form of ${lemmaKey}`);
}

async function checkUnits() {
  const dir = path.join(ROOT, 'content/units');
  if (!existsSync(dir)) return;
  for (const file of (await readdir(dir)).filter((f) => f.endsWith('.json') && f !== 'index.json')) {
    const rel = `content/units/${file}`;
    const unit = await readJson(rel);
    if (unit.reviewed === false) unreviewed.push(rel);
    if (unit.is) await checkText(`${rel} title`, unit.is);
    for (const lesson of unit.lessons ?? []) {
      for (const id of lesson.focus ?? []) if (!lexicon.lemmas[id]) err(`${rel} ${lesson.id}`, `unknown lemma ${id}`);
      for (const [i, ex] of (lesson.exercises ?? []).entries()) {
        const where = `${rel} ${lesson.id} exercise ${i + 1}`;
        for (const id of [ex.sentence, ...(ex.options ?? []), ...(ex.pairs ?? [])].filter(Boolean)) {
          const text = sentenceText(id);
          if (!text) err(where, `sentence ${id} not found`);
          else await checkText(where, text);
        }
        if (ex.target && ex.lemma) checkFormOf(where, ex.target, ex.lemma);
        for (const d of ex.distractors ?? []) await checkText(where, d);
      }
    }
    if (unit.lessons !== 'auto' && !Array.isArray(unit.lessons)) err(rel, 'lessons must be a list or "auto"');
    if (unit.host) {
      const { character: id, says } = unit.host;
      if (!character(id)) err(rel, `unknown host ${id}`);
      const text = sentenceText(says);
      if (!text) err(rel, `host sentence ${says} not found`);
      else if (excluded[says]) err(rel, `host sentence ${says} is excluded: ${excluded[says]}`);
      else await checkText(`${rel} host`, text);
    }
    for (const [i, sec] of (unit.guide?.sections ?? []).entries()) {
      const where = `${rel} guide section ${i + 1}`;
      // Icelandic inside guidebook prose is written {is:...}.
      for (const text of Object.values(sec.text ?? {})) {
        for (const m of text.matchAll(/\{is:([^}]+)\}/g)) await checkText(where, m[1]);
      }
      for (const sid of sec.examples ?? []) {
        if (!sentenceText(sid)) err(where, `sentence ${sid} not found`);
        if (excluded[sid]) err(where, `sentence ${sid} is excluded: ${excluded[sid]}`);
      }
      for (const tb of sec.tables ?? []) {
        const id = typeof tb === 'string' ? tb : tb.lemma;
        if (!lexicon.lemmas[id]) err(where, `unknown lemma ${id}`);
        if (typeof tb === 'object' && !['NT', 'ÞT'].includes(tb.tense)) err(where, `table ${id}: tense must be NT or ÞT`);
      }
    }
  }
}

async function checkStories() {
  const dir = path.join(ROOT, 'content/stories');
  if (!existsSync(dir)) return;
  const files = (await readdir(dir)).filter((f) => f.endsWith('.json') && f !== 'index.json');
  const listed = (await readJson('content/stories/index.json')).stories;
  for (const f of listed) if (!files.includes(f)) err('content/stories/index.json', `missing story file ${f}`);
  for (const f of files) if (!listed.includes(f)) err('content/stories/index.json', `${f} is not listed`);
  const unitIds = new Set();
  for (const f of (await readJson('content/units/index.json')).units) unitIds.add((await readJson(`content/units/${f}`)).id);
  const ids = new Set();
  for (const file of files) {
    const rel = `content/stories/${file}`;
    const story = await readJson(rel);
    if (story.reviewed === false) unreviewed.push(rel);
    if (!story.id || ids.has(story.id)) err(rel, `missing or duplicate id ${story.id}`);
    ids.add(story.id);
    if (!story.title?.en || !story.title?.nb) err(rel, 'title needs en and nb');
    if (story.after && !unitIds.has(story.after)) err(rel, `unknown unit ${story.after}`);
    if (!story.dialogue && story.lines?.some((l) => l.speaker)) err(rel, 'speakers are only for dialogues');
    if (story.narrator && (story.dialogue || !character(story.narrator))) err(rel, `narrator ${story.narrator}: only a reading may have one, and it must be a cast member`);
    for (const [speaker, id] of Object.entries(story.cast ?? {})) {
      if (!character(id)) err(rel, `unknown cast member ${id}`);
      if (!story.lines?.some((l) => l.speaker === speaker)) err(rel, `cast gives ${speaker} to ${id}, but ${speaker} has no lines`);
    }
    for (const [i, line] of (story.lines ?? []).entries()) {
      const text = line.sentence ? sentenceText(line.sentence) : line.is;
      if (line.sentence && excluded[line.sentence]) err(`${rel} line ${i + 1}`, `sentence ${line.sentence} is excluded`);
      if (!text) err(`${rel} line ${i + 1}`, `sentence ${line.sentence} not found`);
      else await checkText(`${rel} line ${i + 1}`, text);
    }
  }
}

// Minimal pairs: every word must be a DMII Core form, and every pair must name a described contrast.
async function checkMinimalPairs() {
  const rel = 'content/minimal-pairs.json';
  if (!existsSync(path.join(ROOT, rel))) return;
  const mp = await readJson(rel);
  if (mp.reviewed === false) unreviewed.push(rel);
  for (const [i, pair] of mp.pairs.entries()) {
    if (pair.words?.length !== 2) err(`${rel} pair ${i + 1}`, 'a pair needs two words');
    if (!mp.contrasts[pair.contrast]?.en || !mp.contrasts[pair.contrast]?.nb) err(`${rel} pair ${i + 1}`, `contrast ${pair.contrast} needs en and nb text`);
    for (const w of pair.words ?? []) if (!(await inDmiiCore(w))) err(`${rel} pair ${i + 1}`, `${w} is not a DMII Core form`);
  }
}

// Letters and sounds (content/letters.json): the 32 letters of the alphabet in order, each with a
// name, sounds, a comparison with Norwegian and text in en and nb, and its name spoken in every
// voice; the combinations likewise; every example a course word; the drill's yes-or-no question
// ("as in Norwegian?") only where the answer is yes (same) or no (another sound).
const ALPHABET = 'a á b d ð e é f g h i í j k l m n o ó p r s t u ú v x y ý þ æ ö'.split(' ');
async function checkLetters() {
  const rel = 'content/letters.json';
  if (!existsSync(path.join(ROOT, rel))) return 0;
  const file = await readJson(rel);
  if (file.reviewed === false) unreviewed.push(rel);
  const ids = file.letters.map((l) => l.id);
  if (ids.join(' ') !== ALPHABET.join(' ')) err(rel, `letters must be the 32 of the alphabet in order (${ALPHABET.join(' ')}), not ${ids.join(' ')}`);
  if (!file.order?.en || !file.order?.nb) err(rel, 'order needs text in en and nb');
  const all = [...file.letters, ...file.combos];
  const voices = [];
  for (const v of ['steinn', 'salka', 'bui', 'ugla']) {
    const vrel = `data/audio/tts-${v}.json`;
    voices.push([v, existsSync(path.join(ROOT, vrel)) ? (await readJson(vrel)).texts : {}]);
  }
  const seen = new Set();
  for (const item of all) {
    const where = `${rel} ${item.id}`;
    if (seen.has(item.id)) err(where, 'the id is used twice');
    seen.add(item.id);
    if (!['new', 'other', 'close', 'same'].includes(item.nb)) err(where, 'nb must be new, other, close or same');
    if (!item.text?.en || !item.text?.nb) err(where, 'needs text in en and nb');
    if (!item.ipa?.length) err(where, 'needs its sounds (ipa)');
    if (!item.examples?.length) err(where, 'needs example words');
    for (const id of [...(item.examples ?? []), ...(item.askNb ? [item.askNb] : [])]) if (!lexicon.lemmas[id]) err(where, `${id} is not a course word`);
    if (item.askNb && !['same', 'other'].includes(item.nb)) err(where, 'askNb only where nb is same or other (the drill asks yes or no)');
    for (const c of item.confusable ?? []) if (!ids.includes(c)) err(where, `confusable "${c}" is not a letter`);
  }
  for (const l of file.letters) {
    if (!l.name || !l.nameIpa) err(`${rel} ${l.id}`, 'needs a name and its IPA');
    const say = l.say ?? l.name;
    for (const [v, texts] of voices) if (!texts[say]) err(`${rel} ${l.id}`, `the name "${say}" has no audio in voice ${v}; run scripts/build-audio.py --voice ${v}`);
  }
  for (const c of file.combos) if (!c.label) err(`${rel} ${c.id}`, 'needs a label');
  return all.length;
}

// Audio coverage: texts the app plays without a recording should have a generated file.
async function checkAudio() {
  const rel = 'data/audio/tts-steinn.json';
  if (!existsSync(path.join(ROOT, rel))) return warnings.push(`${rel} is missing; run .venv python scripts/build-audio.py`);
  const { texts } = await readJson(rel);
  const missing = [];
  for (const l of Object.values(lexicon.lemmas)) if (!texts[l.lemma]) missing.push(l.lemma);
  const mp = existsSync(path.join(ROOT, 'content/minimal-pairs.json')) ? await readJson('content/minimal-pairs.json') : { pairs: [] };
  for (const w of mp.pairs.flatMap((p) => p.words)) if (!texts[w]) missing.push(w);
  for (const s of Object.values(sentences)) if (!texts[s.is]) missing.push(s.is);
  if (missing.length) warnings.push(`${missing.length} texts have no generated audio (first: ${missing.slice(0, 5).join(', ')}); run scripts/build-audio.py`);
  // Every voice: each file exists, and its "v" is the hash of its bytes (the player puts v in the
  // URL, so a stale v would serve an old cached file or miss the cache).
  for (const voice of ['steinn', 'salka', 'bui', 'ugla']) {
    const vrel = `data/audio/tts-${voice}.json`;
    if (!existsSync(path.join(ROOT, vrel))) {
      err(vrel, 'missing; run scripts/build-audio.py --voice ' + voice);
      continue;
    }
    for (const [text, e] of Object.entries((await readJson(vrel)).texts)) {
      const file = path.join(ROOT, 'data/audio', e.f);
      if (!existsSync(file)) err(vrel, `missing file ${e.f} for "${text}"`);
      else if (e.v !== createHash('sha1').update(await readFile(file)).digest('hex').slice(0, 8)) err(vrel, `"v" of ${e.f} does not match the file; run scripts/build-audio.py --voice ${voice}`);
    }
  }
}

async function checkSmallFiles() {
  const index = await readJson('content/units/index.json');
  for (const f of index.units) if (!existsSync(path.join(ROOT, 'content/units', f))) err('content/units/index.json', `missing unit file ${f}`);
  // The path: every unit file in exactly one section, every section's unit a file.
  const ids = (await Promise.all(index.units.filter((f) => existsSync(path.join(ROOT, 'content/units', f))).map((f) => readJson(`content/units/${f}`)))).map((u) => u.id);
  const placed = (index.sections ?? []).flatMap((s) => s.units);
  for (const id of ids) if (placed.filter((x) => x === id).length !== 1) err('content/units/index.json', `unit ${id} must be in exactly one section (is in ${placed.filter((x) => x === id).length})`);
  for (const id of placed) if (!ids.includes(id)) err('content/units/index.json', `a section names unit ${id}, which has no file in "units"`);
  for (const s of index.sections ?? []) if (!s.id || !s.title?.en || !s.title?.nb) err('content/units/index.json', `section ${s.id ?? '?'} needs an id and a title in en and nb`);
  // Goals (content/goals.json): each in a section of the path, quoted, translated, its units real.
  const goals = await readJson('content/goals.json');
  if (goals.reviewed === false) unreviewed.push('content/goals.json');
  const sectionIds = new Set((index.sections ?? []).map((s) => s.id));
  const goalIds = new Set();
  for (const g of goals.goals) {
    const where = `content/goals.json ${g.id}`;
    if (goalIds.has(g.id)) err(where, 'id used twice');
    goalIds.add(g.id);
    if (!sectionIds.has(g.section)) err(where, `unknown section ${g.section}`);
    if (!g.is || !g.en || !g.nb || !g.source) err(where, 'needs the Icelandic quote (is), en, nb and its source');
    for (const u of g.units) if (!ids.includes(u)) err(where, `unknown unit ${u}`);
  }
  for (const id of Object.keys(goals.sections)) if (!sectionIds.has(id)) err('content/goals.json', `sections names unknown section ${id}`);
  const rules = await readJson('content/case-rules.json');
  if (rules.reviewed === false) unreviewed.push('content/case-rules.json');
  for (const [id, r] of Object.entries(rules.rules)) {
    await checkText(`content/case-rules.json ${id}`, r.trigger);
    for (const g of r.nouns ?? []) if (!rules.nounGroups?.[g]) err(`content/case-rules.json ${id}`, `unknown noun group ${g}`);
    for (const v of r.verbs ?? []) if (!lexicon.lemmas[`${v}_so`]) err(`content/case-rules.json ${id}`, `unknown verb ${v}`);
  }
  for (const [g, ids] of Object.entries(rules.nounGroups ?? {})) for (const id of ids) if (!lexicon.lemmas[id]) err(`content/case-rules.json nounGroups.${g}`, `unknown lemma ${id}`);
}

// Hand-written Icelandic sentences anywhere in content/ must pass GreynirCorrect.
async function checkAuthored() {
  const authored = [];
  const walk = (value, where) => {
    if (Array.isArray(value)) value.forEach((v, i) => walk(v, `${where}[${i}]`));
    else if (value && typeof value === 'object') {
      if (value.source === 'authored' && typeof value.is === 'string') authored.push({ where, text: value.is });
      for (const [k, v] of Object.entries(value)) walk(v, `${where}.${k}`);
    }
  };
  const files = [];
  const collect = async (dir) => {
    for (const e of await readdir(path.join(ROOT, dir), { withFileTypes: true })) {
      const rel = `${dir}/${e.name}`;
      if (e.isDirectory()) await collect(rel);
      else if (e.name.endsWith('.json')) files.push(rel);
    }
  };
  await collect('content');
  for (const f of files) walk(await readJson(f), f);
  if (!authored.length) return 0;
  if (!pythonPath()) {
    err('content', `${authored.length} hand-written sentences need GreynirCorrect. ${SETUP_HELP}`);
    return authored.length;
  }
  const results = await lintTexts(authored.map((a) => a.text));
  for (const a of authored) {
    for (const issue of blocking(results.get(a.text) ?? [])) err(a.where, `GreynirCorrect ${issue.code}: ${issue.text} (in: ${a.text})`);
  }
  return authored.length;
}

// Every word of hand-written Bokmål must be in Bokmålsordboka: a form, a word of a headword
// expression, a genitive, a compound of two forms, or (capitalized) a name in skip or names.
// words: lowercase word -> { where, text, capital }, filled by addWords.
function addWords(words, where, text, skip = new Set()) {
  for (const m of text.matchAll(/\p{L}+(?:-\p{L}+)*/gu)) {
    if (skip.has(m[0])) continue;
    const w = m[0].toLocaleLowerCase('nb');
    if (!words.has(w)) words.set(w, { where, text, capital: m[0] !== w });
  }
}
async function checkBokmalWords(words) {
  await eachLimited([...words.keys()].flatMap((w) => w.split('-')), bokmalForm);
  for (const [w, at] of words) {
    if (await bokmalForm(w)) continue;
    const parts = w.split('-');
    if (parts.length > 1 && (await Promise.all(parts.map(bokmalForm))).every(Boolean)) continue;
    if ((await bokmalGenitive(w)) || (await bokmalCompound(w))) continue;
    err(at.where, `"${w}" is not a Bokmål word form in Bokmålsordboka${at.capital ? ' (if it is a name, list it in "names")' : ''} (in: ${at.text})`);
  }
}

// Bokmål glosses. Hand-written ones ("glosses") are for course words Wiktionary gives none for;
// corrections ("fixes") replace a Wiktionary list and repeat it ("wiktionary"), so a change on
// Wiktionary's side is noticed. Every gloss the app shows, from Wiktionary or by hand, must be
// Bokmålsordboka words, and a gloss of more than one word must be in the file's "phrases" (a
// Bokmål expression, not two words run together such as "bo bu").
async function checkGlosses() {
  if (!existsSync(path.join(ROOT, HAND_GLOSSES))) return 0;
  const file = await readJson(HAND_GLOSSES);
  if (file.reviewed === false) unreviewed.push(HAND_GLOSSES);
  const glosses = file.glosses ?? {};
  const fixes = file.fixes ?? {};
  const phrases = new Set(file.phrases ?? []);
  const isList = (list) => Array.isArray(list) && list.length > 0 && list.every((g) => typeof g === 'string' && g && g === g.trim());
  for (const [id, list] of Object.entries(glosses)) {
    const where = `${HAND_GLOSSES} glosses ${id}`;
    const l = lexicon.lemmas[id];
    if (!l) err(where, 'unknown lemma');
    else if (wiktionaryNb(l).length) err(where, 'Wiktionary gives a Bokmål gloss for this word; correct it in "fixes" instead');
    if (fixes[id]) err(where, 'also in "fixes"');
    if (!isList(list)) err(where, 'glosses must be a list of non-empty strings');
  }
  for (const [id, fix] of Object.entries(fixes)) {
    const where = `${HAND_GLOSSES} fixes ${id}`;
    const l = lexicon.lemmas[id];
    if (!l) {
      err(where, 'unknown lemma');
      continue;
    }
    if (!isList(fix.nb)) err(where, '"nb" must be a list of non-empty strings');
    const wk = wiktionaryNb(l);
    if (!wk.length) err(where, 'Wiktionary gives no Bokmål gloss for this word; list it in "glosses" instead');
    else if (JSON.stringify(wk) !== JSON.stringify(fix.wiktionary)) err(where, `Wiktionary now gives ${JSON.stringify(wk)}, not ${JSON.stringify(fix.wiktionary)}: check the correction again and update "wiktionary"`);
    else if (JSON.stringify(wk) === JSON.stringify(fix.nb)) err(where, 'the same as Wiktionary; remove it');
  }
  // What the app will show once the file is applied (as npm run build:translations does).
  const shown = structuredClone(lexicon.lemmas);
  applyHandNb(shown, glosses, fixes);
  const words = new Map();
  const used = new Set();
  for (const [id, l] of Object.entries(shown)) {
    const where = l.nbBy === 'tolva' ? `${HAND_GLOSSES} ${id}` : `data/lexicon.json ${id} (Wiktionary; correct it in ${HAND_GLOSSES} "fixes")`;
    for (const g of l.nb ?? []) {
      if (/\s/.test(g)) {
        if (phrases.has(g)) used.add(g);
        else err(where, `"${g}" has more than one word: list it in "phrases" if it is a Bokmål expression`);
      }
      addWords(words, where, g);
    }
  }
  await checkBokmalWords(words);
  const unused = [...phrases].filter((p) => !used.has(p));
  if (unused.length) warnings.push(`${HAND_GLOSSES}: phrases no gloss uses: ${unused.join(', ')}`);
  const missing = Object.entries(shown).filter(([, l]) => !l.nb?.length);
  if (missing.length) warnings.push(`${missing.length} course words have no Bokmål gloss (first: ${missing.slice(0, 3).map(([id]) => id).join(', ')})`);
  return Object.keys(glosses).length + Object.keys(fixes).length;
}

// Hand-written Bokmål translations: where they belong, their punctuation and every word.
async function checkTranslations() {
  if (!existsSync(path.join(ROOT, HAND_NB))) return 0;
  const file = await readJson(HAND_NB);
  if (file.reviewed === false) unreviewed.push(HAND_NB);
  const names = new Set(file.names ?? []);
  const end = (t) => t.match(/[.?!…]["»“”]*$/)?.[0][0] ?? '';
  const words = new Map(); // lowercase word -> where it first appears
  for (const [id, text] of Object.entries(file.sentences)) {
    const where = `${HAND_NB} ${id}`;
    const s = sentences[id];
    if (!s) {
      err(where, 'sentence not found');
      continue;
    }
    if (excluded[id]) err(where, `sentence is excluded: ${excluded[id]}`);
    if (s.nb?.length && s.nbBy !== 'tolva') err(where, 'Tatoeba has a Bokmål translation of this sentence; remove this one');
    if (!text || text !== text.trim()) err(where, 'empty, or spaces at the ends');
    // Like the Icelandic, or like an English translation where Tatoeba's Icelandic has a typo.
    if (![s.is, ...(s.en ?? [])].some((x) => end(x) === end(text))) err(where, `ends with "${end(text)}", the Icelandic with "${end(s.is)}" (in: ${text})`);
    // A capitalized word also in the Icelandic sentence is a name (Tom, María).
    const isWords = new Set([...s.is.matchAll(/\p{Lu}\p{L}*/gu)].map((m) => m[0]));
    addWords(words, where, text, new Set([...isWords, ...names]));
  }
  await checkBokmalWords(words);
  const missing = Object.entries(sentences).filter(([id, s]) => !excluded[id] && !s.nb?.length && !file.sentences[id]);
  if (missing.length) warnings.push(`${missing.length} sentences have no Bokmål translation (first: ${missing.slice(0, 3).map(([id]) => id).join(', ')})`);
  return Object.keys(file.sentences).length;
}

// Bokmål etymologies (content/etymology-nb.json): translations of the Wiktionary etymologies,
// each made from the English text whose hash it names ("of"); the dictionary shows only current ones.
const ETYM_NB = 'content/etymology-nb.json';
// Words of the English that must not be left in a translation (cited forms are checked apart).
const ENGLISH_LEFT = new Set(['the', 'from', 'and', 'with', 'cognate', 'cognates', 'compare', 'borrowed', 'inherited', 'whence', 'ultimately', 'earlier', 'which', 'uncertain', 'origin', 'derived', 'related', 'literally', 'possibly', 'probably', 'perhaps', 'attested', 'since', 'century', 'coined', 'calque', 'equivalent', 'see']);
async function checkEtymologies() {
  if (!existsSync(path.join(ROOT, ETYM_NB))) return 0;
  const file = await readJson(ETYM_NB);
  if (file.reviewed === false) unreviewed.push(ETYM_NB);
  const hand = file.etymology ?? {};
  const names = new Set((file.names ?? []).map((n) => n.toLocaleLowerCase('nb')));
  const hashOf = (text) => hashSeed(text).toString(16).padStart(8, '0');
  const words = new Map();
  const stale = [];
  const missing = Object.entries(lexicon.lemmas).filter(([id, l]) => l.etymology && !hand[id]).map(([id]) => id);
  for (const [id, e] of Object.entries(hand)) {
    const where = `${ETYM_NB} ${id}`;
    const l = lexicon.lemmas[id];
    if (!l?.etymology) {
      warnings.push(`${where}: not a course word with an etymology`);
      continue;
    }
    if (e.of !== hashOf(l.etymology)) stale.push(id);
    if (e.nb === null) {
      if (!e.why) err(where, '"nb" is null without a "why"');
      continue;
    }
    if (typeof e.nb !== 'string' || !e.nb.trim() || e.nb !== e.nb.trim()) {
      err(where, '"nb" must be a text without spaces at the ends, or null with a "why"');
      continue;
    }
    if (/[“”"]/.test(e.nb)) err(where, `quote glosses with «», not English quotation marks (in: ${e.nb})`);
    // A word also in the English is a cited form (vera, *wesaną, Danish tak) and is not checked.
    const cited = new Set([...l.etymology.matchAll(/\p{L}+/gu)].map((m) => m[0].toLocaleLowerCase('nb')));
    for (const m of e.nb.matchAll(/\p{L}+/gu)) {
      const w = m[0].toLocaleLowerCase('nb');
      if (ENGLISH_LEFT.has(w)) err(where, `"${m[0]}" is English left in the translation (in: ${e.nb})`);
      else if (!cited.has(w) && !names.has(w)) addWords(words, where, w);
    }
  }
  await checkBokmalWords(words);
  if (missing.length) warnings.push(`${missing.length} course words have no Bokmål etymology in ${ETYM_NB}, so the English shows (first: ${missing.slice(0, 5).join(', ')})`);
  if (stale.length) warnings.push(`${stale.length} Bokmål etymologies in ${ETYM_NB} were translated from an older English text and are not shown; translate again and update "of" (first: ${stale.slice(0, 5).join(', ')})`);
  return Object.keys(hand).length;
}

await checkVocab();
await checkUnits();
await checkStories();
await checkMinimalPairs();
const letterCount = await checkLetters();
await checkAudio();
await checkSmallFiles();
const authoredCount = await checkAuthored();
const nbCount = await checkTranslations();
const glossCount = await checkGlosses();
const etymCount = await checkEtymologies();

console.log(`Checked the vocabulary (${Object.keys(lexicon.lemmas).length} lemmas), lessons, units, stories, rules, ${letterCount} letters and spellings, ${authoredCount} hand-written sentences, ${nbCount} Bokmål translations, ${glossCount} Bokmål glosses and ${etymCount} Bokmål etymologies.`);
if (unreviewed.length) console.log(`Not yet checked against sources (${unreviewed.length}): ${unreviewed.join(', ')}. See content/CLAIMS.md.`);
for (const w of warnings) console.log(`warning: ${w}`);
if (errors.length) {
  console.log(`\n${errors.length} problem(s):`);
  for (const e of errors) console.log(`  ${e}`);
  process.exit(1);
}
console.log('Content is valid.');
