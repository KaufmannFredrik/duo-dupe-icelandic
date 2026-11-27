// Builds data/writing.json, the guided-writing tasks (content/writing.json) with the forms each gap
// accepts, taken from the DMII Core: a course word's forms from data/forms, any other word's from
// the DMII Core API (cached in .cache/bin, as scripts/build-data.mjs caches it). For each word the
// accepted form (the frame's case, or the given tags) and its other forms, so that a word in the
// wrong case can be named. Then every model, filled in with each word of its gaps in turn, is checked
// with GreynirCorrect; a flagged text stops the build.
//
//   node scripts/build-writing.mjs           # write data/writing.json
//   node scripts/build-writing.mjs --check   # exit 1 if data/writing.json is out of date

import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { CACHE, ROOT } from './lib/bulk.mjs';
import { blocking, lintTexts } from './lib/lint.mjs';
import { lineParts, taskSlots } from '../js/engine/writing.js';

const read = async (rel) => JSON.parse(await readFile(path.join(ROOT, rel), 'utf8'));
const content = await read('content/writing.json');
const lexicon = await read('data/lexicon.json');
const shards = new Map();
async function courseForms(id) {
  const theme = lexicon.lemmas[id]?.theme;
  if (!theme) throw new Error(`content/writing.json: ${id} is not a course word`);
  if (!shards.has(theme)) shards.set(theme, (await read(`data/forms/${theme}.json`)).lemmas);
  return { lemma: lexicon.lemmas[id].lemma, forms: shards.get(theme)[id].bmyndir };
}

// The DMII Core API, one request at a time with a pause, answers cached as files.
let last = 0;
async function binJson(part, rel) {
  const file = path.join(CACHE, 'bin', rel);
  if (existsSync(file)) return JSON.parse(await readFile(file, 'utf8'));
  await new Promise((r) => setTimeout(r, Math.max(0, last + 150 - Date.now())));
  last = Date.now();
  const res = await fetch(`https://bin.arnastofnun.is/api/${part}`, { signal: AbortSignal.timeout(20_000) });
  if (!res.ok) throw new Error(`DMII Core: HTTP ${res.status} for ${part}`);
  const text = await res.text();
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, text);
  return JSON.parse(text);
}
const asList = (d) => (Array.isArray(d) ? d : d?.ord ? [d] : []);
async function dmiiForms(word) {
  const list = asList(await binJson(`ord/no/${encodeURIComponent(word)}`, `ord/no/${word}.json`)).filter((x) => x.ord === word);
  if (!list.length) throw new Error(`content/writing.json: ${word} is not a noun in the DMII Core`);
  const entry = list[0].bmyndir ? list[0] : asList(await binJson(`ord/${list[0].guid}`, `guid/${list[0].guid}.json`))[0];
  return { lemma: word, forms: entry.bmyndir, source: entry.hluti };
}

// The accepted form for a case: the indefinite singular, else the plural, else with the article
// (Bandaríkin and Filippseyjar are plural, Bandaríkin has the article in its name).
const ORDER = ['ET', 'FT', 'ETgr', 'FTgr'];
function accepted(slot, forms) {
  if (slot.tags) return forms.filter((f) => slot.tags.includes(f.g)).map((f) => f.b);
  for (const n of ORDER) {
    const f = forms.find((x) => x.g === `${slot.case}${n}`);
    if (f) return [f.b];
  }
  return [];
}

const slots = {};
for (const [id, slot] of Object.entries(content.slots)) {
  if (slot.kind === 'name') {
    slots[id] = { kind: 'name', label: slot.label };
    continue;
  }
  const words = [];
  for (const entry of slot.words) {
    // A word with its preposition (["á", "Akureyri"]): the gap takes both, since towns differ.
    const [prep, w] = Array.isArray(entry) ? entry : [null, entry];
    const { lemma, forms } = /_[a-z]+$/.test(w) ? await courseForms(w) : await dmiiForms(w);
    const ok = accepted(slot, forms);
    if (!ok.length) throw new Error(`content/writing.json: no ${slot.case ?? slot.tags.join('/')} form of ${lemma}`);
    const withPrep = (b) => (prep ? `${prep} ${b}` : b);
    const others = [...new Set(forms.map((f) => f.b).filter((b) => !ok.includes(b)))].map(withPrep);
    for (const form of ok) words.push({ lemma, ...(w.includes('_') ? { id: w } : {}), form: withPrep(form), others, ...(prep ? { prep, bare: form } : {}) });
  }
  slots[id] = { kind: 'forms', label: slot.label, ...(slot.case ? { case: slot.case } : { tags: slot.tags }), ...(slot.proper ? { proper: true } : {}), words };
}

for (const task of content.tasks) {
  for (const id of taskSlots({ lines: task.lines.map((l) => l.is) })) if (!slots[id]) throw new Error(`content/writing.json: task ${task.id} has an unknown gap {${id}}`);
}
const tasks = content.tasks.map((t) => ({ ...t, lines: t.lines }));
const out = { version: 1, source: 'content/writing.json; forms from the DMII Core (data/forms and the DMII Core API)', slots, tasks };
const text = JSON.stringify(out) + '\n';
const target = path.join(ROOT, 'data/writing.json');

if (process.argv.includes('--check')) {
  const now = existsSync(target) ? await readFile(target, 'utf8') : '';
  if (now.replace(/\r\n/g, '\n') !== text) {
    console.error('data/writing.json is out of date. Run: node scripts/build-writing.mjs');
    process.exit(1);
  }
  console.log('data/writing.json is up to date.');
  process.exit(0);
}

// Every model, filled in with every word of each gap (the other gaps with their first word).
const texts = new Set();
for (const task of tasks) {
  const ids = taskSlots({ lines: task.lines.map((l) => l.is) });
  const sample = (id) => (slots[id].kind === 'name' ? 'Anna' : slots[id].words[0].form);
  ids.forEach((id, k) => {
    const choices = slots[id].kind === 'name' ? ['Anna', 'Jón'] : slots[id].words.map((w) => w.form);
    for (const c of choices) {
      let i = 0;
      texts.add(task.lines.map((l) => lineParts(l.is).map((p) => p.text ?? (i++ === k ? c : sample(ids[i - 1]))).join('')).join(' '));
    }
  });
}
const results = await lintTexts([...texts]);
const flagged = [...texts].map((t) => [t, blocking(results.get(t) ?? [])]).filter(([, a]) => a.length);
for (const [t, a] of flagged) console.error(`GreynirCorrect: ${t}\n  ${a.map((x) => `${x.code} ${x.text}`).join('; ')}`);
if (flagged.length) process.exit(1);

await writeFile(target, text);
const count = Object.values(slots).reduce((n, s) => n + (s.words?.length ?? 0), 0);
console.log(`wrote data/writing.json: ${tasks.length} tasks, ${Object.keys(slots).length} kinds of gap, ${count} accepted forms; GreynirCorrect passed ${texts.size} filled-in models`);
