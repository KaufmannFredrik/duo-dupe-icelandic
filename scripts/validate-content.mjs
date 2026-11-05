#!/usr/bin/env node
// Content validation. Fails (exit 1) when:
//  - a vocabulary lemma is missing from the DMII Core data in data/,
//  - an Icelandic token in any content file is not a DMII Core word form (checked against the
//    generated paradigms, then the DMII Core API with a cache), unless it is a clitic form such
//    as "geturðu" (getur + þú) or a proper noun on the allowlist (content/allowlist.json),
//  - a referenced sentence, lemma or form does not exist,
//  - a hand-written sentence ("source": "authored") has a GreynirCorrect error,
//  - an excluded sentence (content/sentence-exclude.json) is used in a guidebook or a story.
// Unreviewed content ("reviewed": false) is counted and listed, not failed.
//
//   node scripts/validate-content.mjs

import { existsSync } from 'node:fs';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { CACHE, ROOT } from './lib/bulk.mjs';
import { blocking, lintTexts, pythonPath, SETUP_HELP } from './lib/lint.mjs';

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
      for (const id of sec.tables ?? []) if (!lexicon.lemmas[id]) err(where, `unknown lemma ${id}`);
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
  for (const [text, e] of Object.entries(texts)) if (!existsSync(path.join(ROOT, 'data/audio', e.f))) err(rel, `missing file ${e.f} for "${text}"`);
  if (missing.length) warnings.push(`${missing.length} texts have no generated audio (first: ${missing.slice(0, 5).join(', ')}); run scripts/build-audio.py`);
}

async function checkSmallFiles() {
  const index = await readJson('content/units/index.json');
  for (const f of index.units) if (!existsSync(path.join(ROOT, 'content/units', f))) err('content/units/index.json', `missing unit file ${f}`);
  const rules = await readJson('content/case-rules.json');
  if (rules.reviewed === false) unreviewed.push('content/case-rules.json');
  for (const [id, r] of Object.entries(rules.rules)) await checkText(`content/case-rules.json ${id}`, r.trigger);
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

await checkVocab();
await checkUnits();
await checkStories();
await checkMinimalPairs();
await checkAudio();
await checkSmallFiles();
const authoredCount = await checkAuthored();

console.log(`Checked the vocabulary (${Object.keys(lexicon.lemmas).length} lemmas), lessons, units, stories, rules and ${authoredCount} hand-written sentences.`);
if (unreviewed.length) console.log(`Not yet reviewed by a native speaker (${unreviewed.length}): ${unreviewed.join(', ')}. See content/NEEDS-NATIVE-REVIEW.md.`);
for (const w of warnings) console.log(`warning: ${w}`);
if (errors.length) {
  console.log(`\n${errors.length} problem(s):`);
  for (const e of errors) console.log(`  ${e}`);
  process.exit(1);
}
console.log('Content is valid.');
