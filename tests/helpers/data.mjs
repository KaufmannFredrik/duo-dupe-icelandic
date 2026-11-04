// Loads the generated data from disk the way js/data.js does in the browser.

import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createGenerator } from '../../js/engine/generate.js';
import { courseModel } from '../../js/engine/course-model.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const json = (rel) => JSON.parse(readFileSync(path.join(ROOT, rel), 'utf8'));

export function loadData() {
  const lexicon = json('data/lexicon.json');
  const shards = Object.fromEntries(readdirSync(path.join(ROOT, 'data/forms')).map((f) => [f.replace('.json', ''), json(`data/forms/${f}`).lemmas]));
  const paradigm = (id) => {
    const e = shards[lexicon.lemmas[id]?.theme]?.[id];
    if (!e) return [];
    return e.indeclinable ? [{ g: '-', b: e.ord }] : (e.bmyndir ?? []).filter((f) => f.b);
  };
  const formIndex = new Map();
  for (const id of Object.keys(lexicon.lemmas)) {
    for (const f of [{ b: lexicon.lemmas[id].lemma }, ...paradigm(id)]) {
      const k = f.b.toLocaleLowerCase('is');
      if (!formIndex.has(k)) formIndex.set(k, new Set());
      formIndex.get(k).add(id);
    }
  }
  const s = json('data/sentences.json');
  const tags = json('data/tags.json');
  const tagsOf = (sid) => tags.sentences[sid]?.map((x) => (x === null || x === -1 ? x : tags.lemmas[x]));
  const audio = json('data/audio.json').recordings;
  const rules = json('content/case-rules.json').rules;
  const names = new Set(json('content/allowlist.json').names.map((n) => n.toLocaleLowerCase('is')));
  const index = json('content/units/index.json');
  const units = index.units.map((f) => json(`content/units/${f}`));
  const course = courseModel({ index, units, lexicon });
  const generator = createGenerator({ lexicon, paradigm, formIndex, sentences: s.sentences, pool: s.pool, tagsOf, audio, rules, names });
  return { lexicon, paradigm, formIndex, sentences: s.sentences, pool: s.pool, tagsOf, audio, rules, names, course, generator };
}
