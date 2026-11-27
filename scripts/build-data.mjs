#!/usr/bin/env node
// Phase 2 data pipeline: builds /data for the core vocabulary in content/vocab/core.json.
//
//   node scripts/build-data.mjs             uses cached downloads and API responses in .cache/
//   node scripts/build-data.mjs --refresh   asks the APIs again (bulk files stay cached)
//
// Sources: DMII Core API (paradigms, unmodified), Wiktionary via kaikki.org (glosses, IPA,
// etymology; English entries' translation tables for Norwegian glosses), Tatoeba (sentences; and
// content/sentences-made.json, sentences made from a Tatoeba sentence by replacing one word),
// CLARIN-IS frequency lists (order), Wikimedia Commons (recordings with author and license).
// Outputs: data/lexicon.json, data/forms/<theme>.json, data/sentences.json, data/audio.json,
// data/SOURCES.json and docs/data-report.md. API calls are sequential and spaced out.

import { createReadStream, existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { createInterface } from 'node:readline';
import { gzipSync } from 'node:zlib';
import path from 'node:path';
import { CACHE, ROOT, bunzipLines, download, openZip } from './lib/bulk.mjs';
import { blocking, lintTexts } from './lib/lint.mjs';
import { HAND_GLOSSES, HAND_NB, applyHandNb, noteTolvaSource } from './lib/translations.mjs';

const REFRESH = process.argv.includes('--refresh');
const NO_LINT = process.argv.includes('--no-lint');
const LINT_MAX_TOKENS = 15;
const UA = 'TOLVA-build/0.1 (+https://github.com/KaufmannFredrik/duo-dupe-icelandic)';
const DATA = path.join(ROOT, 'data');
const TATOEBA = 'https://downloads.tatoeba.org/exports/per_language';
const SENTENCES_PER_LEMMA = 6;
const POOL_MAX_TOKENS = 10;
const MADE = 'content/sentences-made.json';
// Sentence ids: Tatoeba's numbers, and "<Tatoeba id>-<n>" for a sentence made from that one.
const byId = (a, b) => parseInt(a, 10) - parseInt(b, 10) || a.localeCompare(b);
const log = (...xs) => console.error(...xs);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const fold = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const sha1 = (s) => createHash('sha1').update(s).digest('hex').slice(0, 16);
const writeJson = (file, value) => writeFile(file, `${JSON.stringify(value)}\n`);

const BULK = {
  kaikki: ['https://kaikki.org/dictionary/Icelandic/kaikki.org-dictionary-Icelandic.jsonl', 'kaikki/kaikki.org-dictionary-Icelandic.jsonl'],
  isl: [`${TATOEBA}/isl/isl_sentences_detailed.tsv.bz2`, 'tatoeba/isl_sentences_detailed.tsv.bz2'],
  islEng: [`${TATOEBA}/isl/isl-eng_links.tsv.bz2`, 'tatoeba/isl-eng_links.tsv.bz2'],
  islNob: [`${TATOEBA}/isl/isl-nob_links.tsv.bz2`, 'tatoeba/isl-nob_links.tsv.bz2'],
  eng: [`${TATOEBA}/eng/eng_sentences.tsv.bz2`, 'tatoeba/eng_sentences.tsv.bz2'],
  nob: [`${TATOEBA}/nob/nob_sentences.tsv.bz2`, 'tatoeba/nob_sentences.tsv.bz2'],
  freq: ['https://repository.clarin.is/repository/xmlui/bitstream/handle/20.500.12537/314/Frequency_lists.zip?sequence=1&isAllowed=y', 'clarin/Frequency_lists.zip'],
};
const cachePath = (key) => path.join(CACHE, BULK[key][1]);

// --- Cached, rate-limited HTTP --------------------------------------------------------------------

let lastRequest = 0;
const apiStats = {};
async function cachedText(url, rel, { gap = 200, source } = {}) {
  const file = path.join(CACHE, rel);
  if (!REFRESH && existsSync(file)) {
    const text = await readFile(file, 'utf8');
    return text === '\u0000404' ? null : text;
  }
  const wait = lastRequest + gap - Date.now();
  if (wait > 0) await sleep(wait);
  lastRequest = Date.now();
  let res;
  for (let attempt = 0; ; attempt++) {
    try {
      res = await fetch(url, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(30_000) });
      if (res.status < 500 && res.status !== 429) break;
    } catch (e) {
      if (attempt >= 3) throw e;
    }
    if (attempt >= 3) throw new Error(`${url}: HTTP ${res?.status}`);
    await sleep(1000 * 2 ** attempt);
  }
  if (source) apiStats[source] = (apiStats[source] ?? 0) + 1;
  await mkdir(path.dirname(file), { recursive: true });
  if (res.status === 404) {
    await writeFile(file, '\u0000404');
    return null;
  }
  if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`);
  const text = await res.text();
  await writeFile(file, text);
  return text;
}
const cachedJson = async (url, rel, opts) => {
  const text = await cachedText(url, rel, opts);
  return text ? JSON.parse(text) : null;
};

// --- Vocabulary --------------------------------------------------------------------------------------

async function loadVocab() {
  const vocab = JSON.parse(await readFile(path.join(ROOT, 'content/vocab/core.json'), 'utf8'));
  const entries = [];
  const seen = new Set();
  for (const theme of vocab.themes) {
    for (const [lemma, ofl, meaning, hint] of theme.words) {
      const id = `${lemma}_${ofl}`;
      if (seen.has(id)) continue;
      seen.add(id);
      entries.push({ id, lemma, ofl, meaning, hint: hint ?? null, theme: theme.id });
    }
  }
  return { vocab, entries };
}

// --- DMII Core paradigms ------------------------------------------------------------------------------

const binJson = (pathPart, rel) => cachedJson(`https://bin.arnastofnun.is/api/${pathPart}`, `bin/${rel}`, { gap: 150, source: 'dmii-core' });

const GENDERS = new Set(['kk', 'kvk', 'hk']);
const hasForm = (entry, form) => (entry?.bmyndir ?? []).some((f) => f.b === form);

// Indeclinable numerals are missing from the DMII Core; confirm them in the full BÍN through the
// Ylhýra wrapper (a check only: no forms are taken from it, an indeclinable word has one form).
const YLHYRA_CATEGORY = { to: 'numeral' };
async function indeclinable({ lemma, ofl }) {
  const d = await cachedJson(`https://ylhyra.is/api/inflection?search=${encodeURIComponent(lemma)}`, `ylhyra/${lemma}.json`, { gap: 300, source: 'ylhyra' });
  const hit = (d?.results ?? []).find((r) => r.base_word === lemma && r.word_categories.includes(YLHYRA_CATEGORY[ofl]));
  if (!hit) return { problems: [`not found as an indeclinable ${YLHYRA_CATEGORY[ofl] ?? ofl} in BÍN`] };
  return { entry: { ord: lemma, ofl, indeclinable: true, binId: hit.BIN_id, source: `BÍN via ylhyra.is (id ${hit.BIN_id})` }, problems: [] };
}

// "ET": only the indefinite singular of the DMII Core paradigm, for a word whose paradigm also
// serves another sense (mars, the month, has no article and no plural; marsinn, marsar are mars, a march).
const SINGULAR = /^(NF|ÞF|ÞGF|EF)ET$/;
async function paradigm({ lemma, ofl, hint }) {
  if (hint === 'indeclinable') return indeclinable({ lemma, ofl });
  if (hint === 'ET') {
    const r = await paradigm({ lemma, ofl, hint: null });
    return r.entry ? { ...r, entry: { ...r.entry, bmyndir: r.entry.bmyndir.filter((f) => SINGULAR.test(f.g)) } } : r;
  }
  const problems = [];
  // The API answers {"0": ""} when nothing matches.
  const asList = (d) => (Array.isArray(d) ? d : d?.ord ? [d] : []);
  let list = asList(await binJson(`ord/${ofl}/${encodeURIComponent(lemma)}`, `ord/${ofl}/${lemma}.json`));
  if (!list.length) {
    list = asList(await binJson(`ord/${encodeURIComponent(lemma)}`, `ord/any/${lemma}.json`));
    if (list.length) problems.push(`not found as ${ofl}; the DMII Core has it as ${[...new Set(list.map((x) => x.ofl))].join(', ')}`);
  }
  if (!list.length) return { problems: [...problems, 'not in the DMII Core'] };
  if (list.length === 1 && list[0].bmyndir) {
    if (hint && !GENDERS.has(hint) && !hasForm(list[0], hint)) problems.push(`hint form "${hint}" not in the paradigm`);
    return { entry: list[0], problems };
  }
  const full = async (x) => asList(await binJson(`ord/${x.guid}`, `guid/${x.guid}.json`))[0];
  const same = list.filter((x) => x.ord === lemma);
  let pool = same.filter((x) => x.ofl === ofl);
  if (!pool.length) pool = same.length ? same : list;
  if (hint && GENDERS.has(hint)) {
    const g = pool.filter((x) => x.kyn === hint);
    if (g.length) pool = g;
    else problems.push(`no ${hint} noun "${lemma}" in the DMII Core`);
  } else if (hint) {
    for (const x of pool) {
      const entry = await full(x);
      if (hasForm(entry, hint)) return { entry, problems };
    }
    problems.push(`no "${lemma}" paradigm contains the form "${hint}"`);
  }
  const pick = pool.find((x) => x.hluti_id === 'ALM') ?? pool[0];
  if (pool.length > 1) problems.push(`${pool.length} words match; picked ${[pick.ofl, pick.kyn, pick.hluti].filter(Boolean).join(' ')}`);
  return { entry: await full(pick), problems };
}

// --- Frequency -------------------------------------------------------------------------------------------

async function frequencies(lemmas) {
  const zip = await openZip(cachePath('freq'));
  const entry = zip.entries.find((e) => e.name.endsWith('giga_simple_freq.tsv'));
  const want = new Set(lemmas);
  const out = new Map();
  let rank = 0;
  for await (const line of createInterface({ input: zip.stream(entry), crlfDelay: Infinity })) {
    rank++;
    const [lemma, cat, freq] = line.split('\t');
    if (!want.has(lemma)) continue;
    if (!out.has(lemma)) out.set(lemma, []);
    out.get(lemma).push({ cat, freq: Number(freq), rank });
  }
  return out;
}
const FREQ_CATS = { so: ['s'], lo: ['l'], fn: ['f'], pfn: ['f'], afn: ['f'], ao: ['a'], fs: ['a'], st: ['c'], to: ['t'], rt: ['l'], uh: ['a', 'x', 'e'] };
function freqFor(list, ofl, kyn) {
  if (!list?.length) return null;
  const cats = ofl === 'no' ? [`n${{ kk: 'k', kvk: 'v', hk: 'h' }[kyn] ?? ''}`] : (FREQ_CATS[ofl] ?? []);
  const matching = list.filter((x) => cats.some((c) => x.cat.startsWith(c)));
  const best = (matching.length ? matching : list).toSorted((a, b) => b.freq - a.freq)[0];
  return { rank: best.rank, count: best.freq };
}

// --- Wiktionary -----------------------------------------------------------------------------------------

const POS = { no: ['noun', 'name'], so: ['verb'], lo: ['adj'], ao: ['adv'], fs: ['prep', 'adv'], pfn: ['pron'], afn: ['pron'], fn: ['pron', 'det', 'adj'], st: ['conj'], to: ['num'], rt: ['adj', 'num'], uh: ['intj', 'adv'] };

const OFFENSIVE = new Set(['slur', 'offensive', 'derogatory', 'vulgar']);

async function wiktionary(words) {
  const out = new Map();
  for await (const line of createInterface({ input: createReadStream(cachePath('kaikki')), crlfDelay: Infinity })) {
    if (!line.trim()) continue;
    const e = JSON.parse(line);
    if (!words.has(e.word)) continue;
    if (!out.has(e.word)) out.set(e.word, []);
    const senses = e.senses ?? [];
    const isFormOf = (s) => s.form_of || s.alt_of || (s.tags ?? []).some((t) => t === 'form-of' || t === 'alt-of');
    // Never shown: senses Wiktionary marks as slurs or offensive (hrísgrjón, "rice", has one).
    const offensive = (s) => (s.tags ?? []).some((t) => OFFENSIVE.has(t));
    const real = senses.filter((s) => !isFormOf(s) && !offensive(s));
    out.get(e.word).push({
      pos: e.pos,
      glosses: (real.length ? real : senses.filter((s) => !offensive(s))).flatMap((s) => s.glosses ?? []),
      ipa: [...new Set((e.sounds ?? []).filter((s) => s.ipa).map((s) => s.ipa))],
      audio: (e.sounds ?? []).filter((s) => s.audio).map((s) => s.audio),
      etymology: e.etymology_text ?? null,
    });
  }
  return out;
}

function wiktFor(list, { ofl, meaning }) {
  const all = list ?? [];
  const byPos = all.filter((w) => POS[ofl]?.includes(w.pos));
  const use = byPos.length ? byPos : all;
  // Meanings are written in American spelling; Wiktionary often has the British (litur: "colour",
  // æfa: "to practise", leikhús: "theatre").
  const spell = (s) => fold(s).replace(/colour/g, 'color').replace(/practis/g, 'practic').replace(/theatre/g, 'theater');
  const matches = (g) => spell(g).includes(spell(meaning));
  const exact = (g) => spell(g).replace(/^to /, '') === spell(meaning);
  // Glosses that carry the intended meaning first, so exercises show it (bjór: "beer", not "beaver"),
  // and one that is just the meaning before one that says more (hrísgrjón: "rice", not "a grain of
  // rice"; sjóða: "to boil", not "to seethe, to boil").
  const glosses = [...new Set(use.flatMap((w) => w.glosses))].sort((a, b) => Number(exact(b)) - Number(exact(a)) || Number(matches(b)) - Number(matches(a)));
  const meaningOk = glosses.some(matches);
  return {
    glosses,
    ipa: [...new Set(use.flatMap((w) => w.ipa))],
    audio: [...new Set(use.flatMap((w) => w.audio))],
    etymology: use.find((w) => w.etymology)?.etymology ?? null,
    posMatched: byPos.length > 0,
    meaningOk,
  };
}

// --- Norwegian glosses from English Wiktionary translation tables ---------------------------------------

async function englishEntries(word) {
  const seg = (s) => encodeURIComponent(s);
  const url = `https://kaikki.org/dictionary/English/meaning/${seg(word[0])}/${seg(word.slice(0, 2))}/${seg(word)}.jsonl`;
  const text = await cachedText(url, `kaikki-en/${word}.jsonl`, { gap: 250, source: 'kaikki-en' });
  if (!text) return [];
  return text
    .split('\n')
    .filter(Boolean)
    .map((l) => JSON.parse(l))
    .filter((e) => e.lang_code === 'en');
}

const isBokmal = (t) => t.code === 'nb' || t.lang === 'Norwegian Bokmål' || (t.code === 'no' && !(t.tags ?? []).includes('Nynorsk'));

function norwegianFor(lemma, entries) {
  const out = new Set();
  for (const e of entries) {
    const tr = e.translations ?? [];
    const senses = new Set(tr.filter((t) => t.code === 'is' && t.word === lemma).map((t) => t.sense ?? ''));
    if (!senses.size) continue;
    for (const t of tr) if (isBokmal(t) && senses.has(t.sense ?? '') && t.word) out.add(t.word);
  }
  return [...out];
}

// --- Tatoeba --------------------------------------------------------------------------------------------

const tokenize = (text) => [...text.matchAll(/\p{L}+/gu)].map((m) => ({ raw: m[0], low: m[0].toLocaleLowerCase('is'), index: m.index }));

function analyzeText(text, formIndex) {
  const tokens = tokenize(text);
  let unknown = 0;
  const lemmas = new Set();
  let ambiguous = 0;
  for (const tok of tokens) {
    const ids = formIndex.get(tok.low);
    // A capitalized word inside the sentence is treated as a name, not as unknown vocabulary.
    const isName = tok.index > 0 && tok.raw[0] !== tok.low[0];
    if (!ids) {
      if (!isName) unknown++;
      continue;
    }
    if (ids.size > 1) ambiguous++;
    for (const x of ids) lemmas.add(x);
  }
  return { tokens, unknown, ambiguous, lemmas };
}

/**
 * The text of a made sentence: the Tatoeba sentence with one word replaced. swap is [the word as
 * written in the original, the word put in its place]; the word must occur exactly once.
 */
function swapWord(text, [from, to]) {
  const at = tokenize(text).filter((t) => t.raw === from);
  if (at.length !== 1) throw new Error(`"${from}" occurs ${at.length} times in "${text}"`);
  if (!/^\p{L}+$/u.test(to)) throw new Error(`"${to}" is not one word`);
  return text.slice(0, at[0].index) + to + text.slice(at[0].index + from.length);
}

async function tatoeba(formIndex) {
  const isl = new Map();
  for await (const line of bunzipLines(cachePath('isl'))) {
    const [id, lang, text, author] = line.split('\t');
    if (lang === 'isl') isl.set(id, { is: text, author: author && author !== '\\N' ? author : null });
  }
  const links = async (key) => {
    const m = new Map();
    for await (const line of bunzipLines(cachePath(key))) {
      const [a, b] = line.split('\t');
      if (!isl.has(a)) continue;
      if (!m.has(a)) m.set(a, []);
      m.get(a).push(b);
    }
    return m;
  };
  const texts = async (key, want) => {
    const m = new Map();
    for await (const line of bunzipLines(cachePath(key))) {
      const [id, , text] = line.split('\t');
      if (want.has(id)) m.set(id, text);
    }
    return m;
  };
  const engLinks = await links('islEng');
  const nobLinks = await links('islNob');
  const engText = await texts('eng', new Set([...engLinks.values()].flat()));
  const nobText = await texts('nob', new Set([...nobLinks.values()].flat()));

  const analyzed = new Map();
  for (const [id, s] of isl) {
    const en = (engLinks.get(id) ?? []).map((x) => engText.get(x)).filter(Boolean);
    const nb = (nobLinks.get(id) ?? []).map((x) => nobText.get(x)).filter(Boolean);
    analyzed.set(id, { ...s, en, nb, ...analyzeText(s.is, formIndex) });
  }
  // Made sentences keep the original's author and link to it ("from"); their English is written
  // for TÖLVA from the original's, their Bokmål comes from content/translations-nb.json.
  if (existsSync(path.join(ROOT, MADE))) {
    for (const [id, m] of Object.entries(JSON.parse(await readFile(path.join(ROOT, MADE), 'utf8')).sentences)) {
      const where = `${MADE} ${id}`;
      const src = isl.get(m.from);
      if (id.split('-')[0] !== m.from || !/^\d+-\d+$/.test(id)) throw new Error(`${where}: the id must be "${m.from}-<n>"`);
      if (!src) throw new Error(`${where}: no Tatoeba sentence ${m.from}`);
      const is = swapWord(src.is, m.swap);
      if (is !== m.is) throw new Error(`${where}: "${m.is}" should be "${is}"`);
      if (!m.en) throw new Error(`${where}: no English`);
      analyzed.set(id, { is, author: src.author, from: m.from, swap: m.swap, en: [m.en], nb: [], ...analyzeText(is, formIndex) });
    }
  }
  return analyzed;
}

async function referencedSentences() {
  const read = async (rel) => JSON.parse(await readFile(path.join(ROOT, rel), 'utf8'));
  const ids = new Set();
  for (const f of (await read('content/units/index.json')).units) {
    const u = await read(`content/units/${f}`);
    if (u.host?.says) ids.add(u.host.says);
    for (const s of u.guide?.sections ?? []) for (const x of s.examples ?? []) ids.add(x);
  }
  for (const f of (await read('content/stories/index.json')).stories) {
    for (const l of (await read(`content/stories/${f}`)).lines) if (l.sentence) ids.add(l.sentence);
  }
  return ids;
}

function pickSentences(analyzed, lemmaForms) {
  const perLemma = new Map();
  for (const [lemmaId, forms] of lemmaForms) {
    const candidates = [];
    for (const [id, s] of analyzed) {
      if (!s.en.length || !s.tokens.some((tok) => forms.has(tok.low))) continue;
      candidates.push({ id, score: s.unknown * 4 + s.tokens.length + s.ambiguous, text: s.is });
    }
    candidates.sort((a, b) => a.score - b.score || a.text.length - b.text.length);
    const chosen = [];
    const texts = new Set();
    for (const c of candidates) {
      const key = c.text.toLocaleLowerCase('is').replace(/[^\p{L}]+/gu, ' ').trim();
      if (texts.has(key)) continue;
      texts.add(key);
      chosen.push(c.id);
      if (chosen.length >= SENTENCES_PER_LEMMA) break;
    }
    perLemma.set(lemmaId, chosen);
  }
  return perLemma;
}

// --- Wikimedia Commons recordings -------------------------------------------------------------------------

const COMMONS = 'https://commons.wikimedia.org/w/api.php?format=json&formatversion=2&';
const stripHtml = (s) => (s ?? '').replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/&#039;/g, "'").replace(/\s+/g, ' ').trim();

async function categoryFiles(category) {
  const titles = [];
  let cont = '';
  do {
    const url = `${COMMONS}action=query&list=categorymembers&cmtitle=${encodeURIComponent(category)}&cmtype=file&cmlimit=500${cont ? `&cmcontinue=${encodeURIComponent(cont)}` : ''}`;
    const d = await cachedJson(url, `commons/${sha1(url)}.json`, { gap: 300, source: 'commons' });
    titles.push(...(d?.query?.categorymembers ?? []).map((m) => m.title));
    cont = d?.continue?.cmcontinue ?? '';
  } while (cont);
  return titles;
}

function wordFromTitle(title) {
  const ll = /^File:LL-Q294 \(isl\)-[^-]+-(.+)\.\w+$/.exec(title);
  if (ll) return ll[1];
  const is = /^File:Is-(.+)\.\w+$/i.exec(title);
  return is ? is[1].replace(/_/g, ' ') : null;
}

async function recordings(entries, wikt) {
  const titlesByLemma = new Map();
  const add = (id, title) => {
    if (!titlesByLemma.has(id)) titlesByLemma.set(id, new Set());
    titlesByLemma.get(id).add(title);
  };
  const byWord = new Map();
  for (const e of entries) {
    const key = e.lemma.toLocaleLowerCase('is');
    if (!byWord.has(key)) byWord.set(key, []);
    byWord.get(key).push(e.id);
    for (const file of wikt.get(e.id)?.audio ?? []) add(e.id, `File:${file}`);
  }
  for (const category of ['Category:Lingua Libre pronunciation-isl', 'Category:Icelandic pronunciation']) {
    for (const title of await categoryFiles(category)) {
      const word = wordFromTitle(title)?.toLocaleLowerCase('is');
      for (const id of byWord.get(word) ?? []) add(id, title);
    }
  }
  const allTitles = [...new Set([...titlesByLemma.values()].flatMap((s) => [...s]))];
  const info = new Map();
  for (let i = 0; i < allTitles.length; i += 50) {
    const batch = allTitles.slice(i, i + 50);
    const url = `${COMMONS}action=query&prop=videoinfo&viprop=url|derivatives|extmetadata&titles=${encodeURIComponent(batch.join('|'))}`;
    const d = await cachedJson(url, `commons/${sha1(url)}.json`, { gap: 300, source: 'commons' });
    for (const page of d?.query?.pages ?? []) {
      const vi = page.videoinfo?.[0];
      if (!vi) continue;
      const meta = vi.extmetadata ?? {};
      const deriv = (type) => vi.derivatives?.find((x) => x.type.startsWith(type))?.src ?? null;
      info.set(page.title, {
        title: page.title,
        page: `https://commons.wikimedia.org/wiki/${encodeURIComponent(page.title.replace(/ /g, '_'))}`,
        mp3: deriv('audio/mpeg') ?? (vi.url?.endsWith('.mp3') ? vi.url.split('?')[0] : null),
        ogg: deriv('audio/ogg') ?? (/\.(ogg|oga)$/.test(vi.url?.split('?')[0] ?? '') ? vi.url.split('?')[0] : null),
        speaker: stripHtml(meta.Artist?.value).replace(/^Speaker:\s*/, '').replace(/\s*Recorder:.*$/, '') || null,
        license: meta.LicenseShortName?.value ?? null,
        licenseUrl: meta.LicenseUrl?.value ?? null,
      });
    }
  }
  const out = {};
  for (const [id, titles] of titlesByLemma) {
    const recs = [...titles].map((t) => info.get(t)).filter((r) => r && r.license && (r.mp3 || r.ogg));
    if (recs.length) out[id] = recs;
  }
  return out;
}

// --- Main ---------------------------------------------------------------------------------------------------

async function main() {
  const started = new Date().toISOString();
  const manifest = {};
  for (const [key, [url, rel]] of Object.entries(BULK)) manifest[key] = await download(url, rel);

  const { vocab, entries } = await loadVocab();
  log(`${entries.length} vocabulary entries in ${vocab.themes.length} themes`);

  log('fetching paradigms from the DMII Core API (cached after the first run)');
  const paradigms = new Map();
  for (const e of entries) {
    const r = await paradigm(e);
    paradigms.set(e.id, r);
    if (r.problems.length) log(`  ${e.id}: ${r.problems.join('; ')}`);
  }

  log('reading the frequency list');
  const freq = await frequencies(entries.map((e) => e.lemma));
  log('reading Wiktionary');
  const wiktRaw = await wiktionary(new Set(entries.map((e) => e.lemma)));
  const wikt = new Map(entries.map((e) => [e.id, wiktFor(wiktRaw.get(e.lemma), e)]));

  log('fetching English Wiktionary entries for Norwegian glosses (cached after the first run)');
  const enCache = new Map();
  const nb = new Map();
  for (const e of entries) {
    const word = e.meaning;
    if (!enCache.has(word)) enCache.set(word, await englishEntries(word));
    nb.set(e.id, norwegianFor(e.lemma, enCache.get(word)));
  }

  // Form index over every paradigm: lowercase form -> lemma ids.
  const formIndex = new Map();
  const lemmaForms = new Map();
  for (const e of entries) {
    const entry = paradigms.get(e.id).entry;
    // Uninflected words come back with bmyndir: [{}]; their only form is the lemma.
    const forms = new Set((entry?.bmyndir ?? []).filter((f) => f.b).map((f) => f.b.toLocaleLowerCase('is')));
    if (entry?.indeclinable) forms.add(entry.ord.toLocaleLowerCase('is'));
    forms.add(e.lemma.toLocaleLowerCase('is'));
    lemmaForms.set(e.id, forms);
    for (const f of forms) {
      if (!formIndex.has(f)) formIndex.set(f, new Set());
      formIndex.get(f).add(e.id);
    }
  }

  log('reading Tatoeba');
  const analyzed = await tatoeba(formIndex);
  const lintStats = { checked: 0, excluded: 0, codes: {} };
  if (!NO_LINT) {
    const candidates = [...analyzed.values()].filter((s) => s.en.length && s.tokens.length <= LINT_MAX_TOKENS);
    log(`checking ${candidates.length} Tatoeba sentences with GreynirCorrect (cached after the first run)`);
    const results = await lintTexts(candidates.map((s) => s.is), { onProgress: (n, total) => log(`  ${n} of ${total} new sentences checked`) });
    for (const s of candidates) {
      const bad = blocking(results.get(s.is) ?? []);
      lintStats.checked++;
      if (!bad.length) continue;
      if (s.from) throw new Error(`${MADE}: GreynirCorrect flags "${s.is}": ${bad.map((a) => `${a.code} ${a.text}`).join('; ')}`);
      s.flagged = bad;
      lintStats.excluded++;
      for (const a of bad) lintStats.codes[a.code] = (lintStats.codes[a.code] ?? 0) + 1;
    }
  }
  const usable = new Map([...analyzed].filter(([, s]) => !s.flagged && (NO_LINT || s.tokens.length <= LINT_MAX_TOKENS)));
  const perLemma = pickSentences(usable, lemmaForms);
  const pool = [...usable].filter(([, s]) => s.en.length && s.unknown === 0 && s.tokens.length <= POOL_MAX_TOKENS).map(([id]) => id);
  const sentenceIds = new Set([...perLemma.values()].flat().concat(pool));
  // Sentences the content names (guidebook examples, the hosts' greetings, stories) stay in the
  // data when better ones are found for their words.
  for (const id of await referencedSentences()) if (usable.has(id)) sentenceIds.add(id);

  log('collecting recordings from Wikimedia Commons (cached after the first run)');
  const audio = await recordings(entries, wikt);

  // --- Write data -----------------------------------------------------------------------------------------
  await mkdir(path.join(DATA, 'forms'), { recursive: true });
  const shards = {};
  const lexicon = { version: 1, generated: started, themes: [], lemmas: {} };
  const problems = [];
  for (const theme of vocab.themes) {
    const ids = entries.filter((e) => e.theme === theme.id).map((e) => e.id);
    const ranked = ids.toSorted((a, b) => (lexRank(a) ?? 1e12) - (lexRank(b) ?? 1e12));
    lexicon.themes.push({ id: theme.id, title: theme.title, lemmas: ranked });
    shards[theme.id] = {};
  }
  function lexRank(id) {
    const e = entries.find((x) => x.id === id);
    return freqFor(freq.get(e.lemma), e.ofl, paradigms.get(id).entry?.kyn)?.rank;
  }
  for (const e of entries) {
    const p = paradigms.get(e.id);
    const w = wikt.get(e.id);
    const kyn = p.entry?.kyn || null;
    const issues = [...p.problems];
    if (!w.glosses.length) issues.push('no Wiktionary entry');
    else if (!w.meaningOk) issues.push(`Wiktionary glosses do not mention "${e.meaning}": ${w.glosses.slice(0, 3).join('; ')}`);
    if (!(perLemma.get(e.id) ?? []).length) issues.push('no Tatoeba sentence');
    if (issues.length) problems.push({ id: e.id, issues });
    if (p.entry) shards[e.theme][e.id] = p.entry;
    lexicon.lemmas[e.id] = {
      lemma: e.lemma,
      ofl: e.ofl,
      kyn,
      guid: p.entry?.guid ?? null,
      theme: e.theme,
      meaning: e.meaning,
      en: w.glosses.slice(0, 4),
      nb: nb.get(e.id).slice(0, 3),
      ipa: w.ipa.slice(0, 2),
      etymology: w.etymology,
      freq: freqFor(freq.get(e.lemma), e.ofl, kyn),
      sentences: perLemma.get(e.id) ?? [],
      audio: (audio[e.id] ?? []).length,
      inCore: Boolean(p.entry?.bmyndir),
      verified: Boolean(p.entry),
      ...(p.entry?.indeclinable ? { indeclinable: true } : {}),
      ...(issues.length ? { issues } : {}),
    };
  }
  const sentences = {};
  for (const id of [...sentenceIds].sort(byId)) {
    const s = analyzed.get(id);
    sentences[id] = { is: s.is, author: s.author, ...(s.from ? { from: s.from, swap: s.swap } : {}), en: s.en.slice(0, 2), nb: s.nb.slice(0, 1), tokens: s.tokens.length, unknown: s.unknown, lemmas: [...s.lemmas] };
  }
  // Where Tatoeba or Wiktionary has no Bokmål, or Wiktionary's is wrong, the one written for TÖLVA
  // (scripts/build-translations.mjs).
  if (existsSync(path.join(ROOT, HAND_NB))) applyHandNb(sentences, JSON.parse(await readFile(path.join(ROOT, HAND_NB), 'utf8')).sentences);
  if (existsSync(path.join(ROOT, HAND_GLOSSES))) {
    const hand = JSON.parse(await readFile(path.join(ROOT, HAND_GLOSSES), 'utf8'));
    applyHandNb(lexicon.lemmas, hand.glosses, hand.fixes);
  }

  const files = {
    'data/lexicon.json': lexicon,
    'data/sentences.json': { version: 1, generated: started, license: 'CC BY 2.0 FR (Tatoeba). Each sentence lists its author; ids link to tatoeba.org/sentences/show/<id>. A sentence with "from" was made for TÖLVA from that Tatoeba sentence by replacing one word ("swap": the word replaced and the word put in; content/sentences-made.json).', pool, sentences },
    'data/audio.json': { version: 1, generated: started, note: 'Links to recordings on Wikimedia Commons; files are not copied. Credit the speaker and license shown for each.', recordings: audio },
  };
  for (const [theme, lemmas] of Object.entries(shards)) {
    files[`data/forms/${theme}.json`] = {
      version: 1,
      theme,
      source: 'DMII Core API, https://bin.arnastofnun.is/api/. Each object is the API response for the word, unchanged. Objects marked indeclinable are numerals confirmed in the full BÍN (via ylhyra.is) that have a single form.',
      lemmas,
    };
  }
  const sizes = {};
  for (const [rel, value] of Object.entries(files)) {
    const text = `${JSON.stringify(value)}\n`;
    await writeFile(path.join(ROOT, rel), text);
    sizes[rel] = { bytes: Buffer.byteLength(text), gzip: gzipSync(text).length };
  }

  const sources = sourcesJson({ started, manifest, entries, paradigms, apiStats, sizes });
  for (const rel of ['data/sentences.json', 'data/lexicon.json']) noteTolvaSource(sources, rel, `${JSON.stringify(files[rel])}\n`);
  await writeFile(path.join(DATA, 'SOURCES.json'), `${JSON.stringify(sources, null, 2)}\n`);

  const report = reportMd({ started, entries, lexicon, sentences, pool, audio, problems, sizes, vocab, lintStats });
  await writeFile(path.join(ROOT, 'docs/data-report.md'), report);
  log(report.split('\n').slice(0, 40).join('\n'));
}

function sourcesJson({ started, manifest, entries, paradigms, apiStats, sizes }) {
  const m = (key) => ({ url: manifest[key].url, file: manifest[key].file, bytes: manifest[key].bytes, sha256: manifest[key].sha256, retrieved: manifest[key].retrieved });
  return {
    generated: started,
    generator: 'scripts/build-data.mjs',
    licenseNote: 'Files that contain DMII Core or Wiktionary data are CC BY-SA 4.0; see data/LICENSE.md.',
    files: Object.fromEntries(
      Object.entries(sizes).map(([rel, s]) => [
        rel,
        {
          ...s,
          sources: rel.startsWith('data/forms/') ? ['dmii-core'] : rel === 'data/lexicon.json' ? ['dmii-core', 'wiktionary', 'wiktionary-en', 'clarin-freq'] : rel === 'data/sentences.json' ? ['tatoeba'] : ['commons'],
        },
      ]),
    ),
    sources: [
      {
        id: 'dmii-core',
        name: 'The DMII Core (BÍN-kjarninn), Database of Icelandic Morphology',
        attribution: 'Beygingarlýsing íslensks nútímamáls. Stofnun Árna Magnússonar í íslenskum fræðum. Höfundur og ritstjóri Kristín Bjarnadóttir.',
        url: 'https://bin.arnastofnun.is/api/',
        license: 'CC BY-SA 4.0; may be published on the web unmodified with credit',
        retrieved: started,
        items: [...paradigms.values()].filter((p) => p.entry).length,
        requestsThisRun: apiStats['dmii-core'] ?? 0,
        changes: 'None. Each paradigm is the API response object for the word, unchanged. Files group the objects by theme.',
      },
      { id: 'wiktionary', name: 'Wiktionary (Icelandic entries), extracted by kaikki.org (wiktextract)', ...m('kaikki'), license: 'CC BY-SA 4.0 and GFDL', changes: 'Selected fields: up to four glosses, up to two IPA transcriptions, etymology text.' },
      {
        id: 'wiktionary-en',
        name: 'Wiktionary (English entries, translation tables), via kaikki.org per-word pages',
        url: 'https://kaikki.org/dictionary/English/meaning/',
        license: 'CC BY-SA 4.0 and GFDL',
        retrieved: started,
        changes: 'Norwegian Bokmål translations taken from the same translation sense that lists the Icelandic lemma.',
      },
      { id: 'clarin-freq', name: 'Frequency lists for Icelandic 23.06 (giga_simple_freq.tsv)', handle: 'http://hdl.handle.net/20.500.12537/314', ...m('freq'), license: 'CC BY 4.0', changes: 'Only the rank and count of course lemmas are kept.' },
      { id: 'tatoeba', name: 'Tatoeba sentences and translations', files: ['isl', 'islEng', 'islNob', 'eng', 'nob'].map(m), license: 'CC BY 2.0 FR', changes: 'Sentences selected per lemma; text unchanged; author kept for each sentence. For topics Tatoeba has few sentences on, a few sentences were made from a Tatoeba sentence by replacing one word, with an English translation written for TÖLVA (content/sentences-made.json); they keep the original author, link to the original and say that a word was changed.' },
      { id: 'bin-ylhyra', name: 'Ylhýra inflection API (wrapper over the full BÍN)', url: 'https://ylhyra.is/api/inflection', license: 'Data CC BY-SA 4.0 (BÍN); software MIT', retrieved: started, changes: 'Used only to confirm that indeclinable numerals exist in BÍN; no data copied except the BÍN id.' },
      { id: 'commons', name: 'Wikimedia Commons and Lingua Libre recordings', url: 'https://commons.wikimedia.org/', license: 'Per file; see data/audio.json', retrieved: started, changes: 'Links only; no audio files are copied.' },
    ],
    vocabulary: { file: 'content/vocab/core.json', entries: entries.length },
  };
}

function reportMd({ started, entries, lexicon, sentences, pool, audio, problems, sizes, vocab, lintStats }) {
  const L = Object.values(lexicon.lemmas);
  const n = L.length;
  const pct = (x) => `${x} (${((100 * x) / n).toFixed(0)}%)`;
  const count = (f) => L.filter(f).length;
  const totalBytes = Object.values(sizes).reduce((a, s) => a + s.bytes, 0);
  const totalGzip = Object.values(sizes).reduce((a, s) => a + s.gzip, 0);
  const lines = [
    '# Data report',
    '',
    `Generated ${started} by \`node scripts/build-data.mjs\` from \`content/vocab/core.json\`. This file is generated.`,
    '',
    '## Coverage of the core vocabulary',
    '',
    `| Measure | Lemmas (of ${n}) |`,
    '|---|---|',
    `| Found in the DMII Core | ${pct(count((x) => x.inCore))} |`,
    `| Indeclinable numerals confirmed in the full BÍN (not in the DMII Core) | ${pct(count((x) => x.indeclinable && x.verified))} |`,
    `| English gloss from Wiktionary | ${pct(count((x) => x.en.length))} |`,
    `| Wiktionary gloss matches the intended meaning | ${pct(count((x) => x.en.length && !(x.issues ?? []).some((i) => i.startsWith('Wiktionary glosses do not'))))} |`,
    `| Norwegian Bokmål gloss | ${pct(count((x) => x.nb.length))} |`,
    `| IPA | ${pct(count((x) => x.ipa.length))} |`,
    `| Human recording (Commons, Lingua Libre, Wiktionary) | ${pct(count((x) => x.audio > 0))} |`,
    `| 1 or more Tatoeba sentences | ${pct(count((x) => x.sentences.length >= 1))} |`,
    `| 3 or more Tatoeba sentences | ${pct(count((x) => x.sentences.length >= 3))} |`,
    `| Frequency rank in the Icelandic Gigaword Corpus | ${pct(count((x) => x.freq))} |`,
    '',
    `Sentences kept: ${Object.keys(sentences).length} (${Object.values(sentences).filter((s) => s.from).length} made from a Tatoeba sentence by replacing one word), of which ${pool.length} use only course vocabulary (names allowed) and have at most ${POOL_MAX_TOKENS} words. Recordings linked: ${Object.values(audio).flat().length}.`,
    '',
    lintStats.checked
      ? `GreynirCorrect checked ${lintStats.checked} Tatoeba sentences (with an English translation, at most ${LINT_MAX_TOKENS} words) and excluded ${lintStats.excluded} that it flagged. Most frequent codes: ${Object.entries(lintStats.codes).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([c, k]) => `${c} ${k}`).join(', ')}. Parse failures (E001), exclamation marks (E007) and unknown words (U001) do not exclude a sentence.`
      : 'Sentences were not checked with GreynirCorrect (--no-lint).',
    '',
    '## By theme',
    '',
    '| Theme | Lemmas | In DMII Core | Norwegian gloss | Recording | 3+ sentences |',
    '|---|---|---|---|---|---|',
    ...lexicon.themes.map((t) => {
      const ls = t.lemmas.map((id) => lexicon.lemmas[id]);
      const c = (f) => ls.filter(f).length;
      return `| ${t.title.en} | ${ls.length} | ${c((x) => x.inCore)} | ${c((x) => x.nb.length)} | ${c((x) => x.audio)} | ${c((x) => x.sentences.length >= 3)} |`;
    }),
    '',
    '## Data size',
    '',
    '| File | Bytes | Gzipped |',
    '|---|---|---|',
    ...Object.entries(sizes).map(([f, s]) => `| \`${f}\` | ${s.bytes.toLocaleString('en-US')} | ${s.gzip.toLocaleString('en-US')} |`),
    `| Total | ${totalBytes.toLocaleString('en-US')} | ${totalGzip.toLocaleString('en-US')} |`,
    '',
    `## Entries to check (${problems.length})`,
    '',
    ...problems.map((p) => `- \`${p.id}\`: ${p.issues.join('; ')}`),
    '',
  ];
  return `${lines.join('\n')}\n`;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
