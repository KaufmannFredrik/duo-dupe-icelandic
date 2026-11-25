// Numbers by ear (js/engine/numbers.js): what numbers are called, the phone numbers, the options,
// that every text the exercises play has audio in every voice, and the number exercises in lessons
// and reviews.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { loadData } from './helpers/data.mjs';
import { allowedFor } from '../js/engine/course-model.js';
import { CARDINAL, ORDINAL, allPhones, allTexts, confusables, numberOf, ordinalConfusables, phoneConfusables, phoneSay, phoneShow, phoneWords, phonesWith, say } from '../js/engine/numbers.js';

const d = loadData();
const json = (rel) => JSON.parse(readFileSync(new URL(`../${rel}`, import.meta.url), 'utf8'));

test('numbers: what 1 to 99 are called when counting', () => {
  assert.equal(say(5), 'fimm');
  assert.equal(say(11), 'ellefu');
  assert.equal(say(17), 'sautján');
  assert.equal(say(20), 'tuttugu');
  assert.equal(say(21), 'tuttugu og einn');
  assert.equal(say(34), 'þrjátíu og fjórir');
  assert.equal(say(47), 'fjörutíu og sjö');
  assert.equal(say(99), 'níutíu og níu');
  assert.throws(() => say(100));
  for (let n = 1; n < 100; n++) assert.ok(say(n).split(' ').every((w) => w === 'og' || Object.values(CARDINAL).includes(w)), `${n}: ${say(n)}`);
});

test('numbers: every number word and ordinal is a course word of its class', () => {
  for (const w of Object.values(CARDINAL)) assert.equal(d.lexicon.lemmas[`${w}_to`]?.ofl, 'to', w);
  for (const [n, [id, form]] of Object.entries(ORDINAL)) {
    assert.ok(d.lexicon.lemmas[id], id);
    assert.ok(d.paradigm(id).some((f) => f.b === form) || d.lexicon.lemmas[id].lemma === form, `${form} is a form of ${id}`);
    if (n !== '2') assert.deepEqual(numberOf(id), { kind: 'ordinal', n: Number(n), form });
  }
  assert.equal(numberOf('annar_fn'), null, 'annar is drilled as "other", not as a number');
  assert.equal(numberOf('kaffi_no'), null);
});

test('numbers: options that sound or look alike, never the answer', () => {
  assert.deepEqual(confusables(17).slice(0, 3), [7, 70, 27]);
  assert.deepEqual(confusables(47).slice(0, 3), [74, 17, 57]);
  for (let n = 1; n < 100; n++) {
    const c = confusables(n);
    assert.ok(c.length >= 3, `${n} has ${c.length}`);
    assert.ok(!c.includes(n) && c.every((x) => x >= 1 && x <= 99) && new Set(c).size === c.length, `${n}: ${c}`);
  }
  for (let k = 1; k <= 10; k++) {
    const c = ordinalConfusables(k);
    assert.ok(c.length >= 3 && !c.includes(k) && c.every((x) => x >= 1 && x <= 10), `${k}: ${c}`);
  }
});

test('numbers: phone numbers keep to what every source agrees on', () => {
  const phones = allPhones();
  assert.equal(new Set(phones).size, phones.length, 'no phone number twice');
  for (const p of phones) {
    assert.match(p, /^[5-8][5-9]{2}\d{4}$/, `${p}: seven digits, starting 5 to 8, no 0 to 4 said alone`);
    for (const pair of [p.slice(3, 5), p.slice(5)]) {
      assert.notEqual(pair[0], '0', `${p}: a pair starting with 0`);
      if (Number(pair) >= 20) assert.ok(!'1234'.includes(pair[1]), `${p}: ${pair} ends in 1 to 4`);
    }
    assert.ok(phoneWords(p).every((id) => d.lexicon.lemmas[id]), p);
    const others = phoneConfusables(p);
    assert.ok(others.length >= 3 && !others.includes(p) && others.every((x) => /^\d{7}$/.test(x)), `${p}: ${others}`);
  }
  assert.equal(phoneSay('5671258'), 'fimm sex sjö, tólf, fimmtíu og átta');
  assert.equal(phoneShow('5671258'), '567 12 58');
  for (const w of ['ellefu', 'fjörutíu', 'níutíu']) {
    const n = numberOf(`${w}_to`).n;
    assert.equal(phonesWith(`${w}_to`).length, 2);
    const said = (x) => (n < 20 ? x === n : x - (x % 10) === n);
    for (const p of phonesWith(`${w}_to`)) assert.ok([p.slice(3, 5), p.slice(5)].map(Number).some(said), `${p} has ${w}`);
  }
});

test('numbers: data/numbers.json is up to date, and every text has audio in every voice', () => {
  assert.deepEqual(json('data/numbers.json').texts, allTexts(), 'run node scripts/build-numbers.mjs');
  for (const voice of ['steinn', 'salka', 'bui', 'ugla']) {
    const texts = json(`data/audio/tts-${voice}.json`).texts;
    const missing = allTexts().filter((x) => !texts[x]);
    assert.deepEqual(missing, [], `${voice}: no audio (run the audio build)`);
  }
});

test('numbers: the unit\'s lessons hear, write and build numbers, with phone numbers', () => {
  const unit = d.course.units.find((u) => u.id === 'numbers');
  const kinds = new Set();
  for (const lesson of unit.lessons) {
    for (let times = 0; times < 4; times++) {
      const allowed = allowedFor(d.course, 'numbers', lesson.index);
      for (const s of d.generator.lesson({ focus: lesson.focus, allowed, seed: 1000 * times + lesson.index, practiced: Boolean(lesson.review) })) {
        kinds.add(s.phone ? `${s.type} phone` : s.type);
      }
    }
  }
  for (const k of ['numlisten', 'numtype', 'numbuild', 'numlisten phone', 'numtype phone']) assert.ok(kinds.has(k), `no ${k} in the unit`);
});

test('numbers: a lesson plays only numbers the learner can say so far', () => {
  const unit = d.course.units.find((u) => u.id === 'numbers');
  const first = unit.lessons[0];
  const allowed = allowedFor(d.course, 'numbers', 0);
  for (let seed = 1; seed <= 20; seed++) {
    for (const s of d.generator.lesson({ focus: first.focus, allowed, seed })) {
      if (s.say) assert.ok(!/tíu og|þrjátíu|fjörutíu/.test(s.say) || s.say.includes('tuttugu'), `lesson 1 plays "${s.say}"`);
    }
  }
});

test('numbers: a numeral\'s card is mostly reviewed as a number', () => {
  const allowed = new Set(Object.keys(d.lexicon.lemmas));
  const types = new Set();
  for (let seed = 1; seed <= 30; seed++) {
    for (const s of d.generator.review({ cards: [{ key: 'fjörutíu_to|meaning' }, { key: 'þriðji_rt|meaning' }], allowed, seed })) types.add(s.type);
  }
  for (const t of ['numlisten', 'numtype', 'numbuild']) assert.ok(types.has(t), `reviews never make ${t}`);
});

test('generator: a 1st or 2nd person form without its pronoun is not asked as a verb form', () => {
  // "Dagar hennar eru taldir": taldir is the past participle (her days are numbered), not "you counted".
  const allowed = new Set(Object.keys(d.lexicon.lemmas));
  for (let seed = 1; seed <= 10; seed++) {
    for (const s of d.generator.lesson({ focus: ['telja_so'], allowed, seed })) assert.ok(!(s.type === 'conjugate' && s.sentence === '908579'), 'conjugate on "taldir"');
  }
});
