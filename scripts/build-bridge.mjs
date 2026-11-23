#!/usr/bin/env node
// Builds data/bridge.json: Norwegian Bokmål relatives of the course words, for the Norwegian
// bridge. For each word, candidates are its Bokmål glosses (from Wiktionary) and two spellings
// made with the correspondence rules in js/bridge-rules.js. Each candidate is looked up in
// Bokmålsordboka (ord.uib.no, CC BY 4.0). Evidence:
//   old-norse  Bokmålsordboka's etymology names the same Old Norse word as Wiktionary does for
//              the Icelandic word: a sourced cognate.
//   loan       both languages borrowed the word (Wiktionary: "Borrowed from ..."), and the
//              Bokmål gloss has a spelling the rules explain.
//   form       a Bokmål gloss with the same meaning whose spelling the rules explain, but no
//              shared Old Norse etymon in the sources. Shown as "looks alike".
// Only old-norse pairs link to a specific article; the others link to a dictionary search,
// because a look-alike can have several homographs.
// Requests are cached in .cache/ordbokene/ and spaced.
//   node scripts/build-bridge.mjs

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { CACHE, ROOT } from './lib/bulk.mjs';
import { RULES, explain } from '../js/bridge-rules.js';

const API = 'https://ord.uib.no';
const DIR = path.join(CACHE, 'ordbokene');
const lexicon = JSON.parse(await readFile(path.join(ROOT, 'data/lexicon.json'), 'utf8'));
let requests = 0;

async function cached(name, url) {
  const file = path.join(DIR, `${encodeURIComponent(name)}.json`);
  if (existsSync(file)) return JSON.parse(await readFile(file, 'utf8'));
  await new Promise((r) => setTimeout(r, 150));
  requests++;
  const res = await fetch(url, { headers: { 'User-Agent': 'TOLVA build script (https://github.com/KaufmannFredrik/duo-dupe-icelandic)' } });
  const body = res.ok ? await res.json() : null;
  await writeFile(file, JSON.stringify(body));
  return body;
}

const search = async (word) => (await cached(`search-${word}`, `${API}/api/articles?w=${encodeURIComponent(word)}&dict=bm&scope=e`))?.articles?.bm ?? [];
const article = (id) => cached(`bm-${id}`, `${API}/bm/article/${id}.json`);

// Old Norse words named in an article's etymology ("norr." followed by a form).
function oldNorseOf(art) {
  const out = [];
  const walk = (items) => {
    for (let i = 0; i < (items ?? []).length; i++) {
      const it = items[i];
      if ((it.type_ === 'language' || it.type_ === 'entity') && it.id === 'norr.') {
        const next = items.slice(i + 1).find((x) => x.type_ === 'usage');
        if (next?.text) out.push(next.text);
      }
      if (it.items) walk(it.items);
    }
  };
  for (const e of art?.body?.etymology ?? []) walk(e.items);
  return out;
}

const norm = (s) => s.normalize('NFC').toLocaleLowerCase('is').replace(/ǫ|ø/g, 'ö').replace(/œ/g, 'æ').replace(/[-*]/g, '').trim();
// Old Norse spelling conventions differ (hón, hon); compare without length marks as a fallback.
const fold = (s) => norm(s).normalize('NFD').replace(/\p{M}/gu, '');

// The Old Norse etymon from the Wiktionary etymology of the Icelandic word.
function loanSource(text) {
  const m = /^Borrowed from ([A-Z][a-z]+(?: [A-Z][a-z]+)?) ([^\s,.;()]+)/.exec(text ?? '');
  return m ? { language: m[1], word: m[2] } : null;
}

function etymon(text) {
  const m = /(?:^|\. )(?:Inherited from|From) Old Norse ([^\s,.;()]+)/.exec(text ?? '');
  return m ? m[1] : null;
}

// Word classes that may correspond (BÍN class to Bokmålsordboka part-of-speech tags), so that a
// homograph with the same Old Norse source (sá "that" and så "to sow") is not taken.
const CLASSES = {
  no: ['NOUN'], so: ['VERB'], lo: ['ADJ'], ao: ['ADV', 'ADP'], fs: ['ADP', 'ADV'],
  fn: ['DET', 'PRON'], pfn: ['PRON'], afn: ['PRON'], to: ['DET', 'NUM', 'NOUN'], st: ['CCONJ', 'SCONJ'], uh: ['INTJ'],
};
function sameClass(ofl, art) {
  const tags = new Set((art.lemmas ?? []).flatMap((l) => (l.paradigm_info ?? []).flatMap((p) => p.tags ?? [])));
  const wanted = CLASSES[ofl];
  return !wanted || ![...tags].some((t) => /^[A-Z]{3,}$/.test(t)) || wanted.some((t) => tags.has(t));
}

// Two rule-made spellings to look up besides the glosses.
function spellings(word) {
  const base = word.toLocaleLowerCase('is');
  const apply = (skip) => RULES.filter((r) => !skip.includes(r.id)).reduce((w, r) => w.replace(r.from, r.to), base);
  return [apply(['eth-drop', 'a-acute-a', 'o-umlaut-o', 'ending-r', 'double']), apply(['eth', 'a-acute', 'o-umlaut', 'ending-r', 'double'])];
}

await mkdir(DIR, { recursive: true });
const pairs = {};
let checked = 0;
for (const [id, l] of Object.entries(lexicon.lemmas)) {
  checked++;
  const on = etymon(l.etymology);
  const glosses = (l.nb ?? []).map((g) => g.replace(/^å /, '').trim()).filter((g) => /^\p{L}+$/u.test(g));
  const candidates = [...new Set([...glosses, ...spellings(l.lemma)])];
  let best = null;
  for (const cand of candidates) {
    for (const aid of (await search(cand)).slice(0, 3)) {
      const art = await article(aid);
      const nb = art?.lemmas?.[0]?.lemma;
      if (!nb || !sameClass(l.ofl, art)) continue;
      const ons = oldNorseOf(art);
      const rules = explain(l.lemma, nb);
      const exact = on && ons.some((x) => norm(x) === norm(on));
      if (on && (exact || ons.some((x) => fold(x) === fold(on)))) {
        const pick = { nb, article: aid, oldNorse: on, evidence: 'old-norse', rules, gloss: glosses.includes(nb), exact };
        const better = !best || best.evidence !== 'old-norse' || (pick.gloss && !best.gloss) || (pick.gloss === best.gloss && exact && !best.exact);
        if (better) best = pick;
      } else if (!best && glosses.includes(nb) && rules && rules.length <= 3) {
        const loan = loanSource(l.etymology);
        best = loan ? { nb, evidence: 'loan', loan, rules, gloss: true } : { nb, evidence: 'form', rules, gloss: true };
      }
    }
  }
  if (best) {
    delete best.gloss;
    delete best.exact;
    pairs[id] = best;
  }
  if (checked % 50 === 0) console.error(`${checked} words, ${Object.keys(pairs).length} relatives, ${requests} requests`);
}

const counts = Object.values(pairs).reduce((c, p) => ({ ...c, [p.evidence]: (c[p.evidence] ?? 0) + 1 }), {});
const out = {
  version: 1,
  generated: new Date().toISOString(),
  reviewed: false,
  note: 'Bokmål relatives of the course words. old-norse: Bokmålsordboka and Wiktionary name the same Old Norse word. loan: both borrowed the word (Wiktionary names the source). form: a Bokmål gloss whose spelling the rules in js/bridge-rules.js explain, without a shared etymon in the sources. Needs native review.',
  sources: [
    { name: 'Bokmålsordboka, Universitetet i Bergen og Språkrådet, ordbøkene.no', license: 'CC BY 4.0', url: 'https://ordbokene.no', api: API, used: 'Bokmål lemma, article id, Old Norse etymon' },
    { name: 'Wiktionary (Icelandic etymologies and Bokmål translations), via kaikki.org', license: 'CC BY-SA 4.0', used: 'Old Norse etymon of the Icelandic word, Bokmål glosses' },
  ],
  counts,
  pairs,
};
await writeFile(path.join(ROOT, 'data/bridge.json'), `${JSON.stringify(out, null, 1)}\n`);
console.log(`data/bridge.json: ${Object.keys(pairs).length} of ${checked} words have a Bokmål relative (${Object.entries(counts).map(([k, v]) => `${k} ${v}`).join(', ')}); ${requests} API requests`);
