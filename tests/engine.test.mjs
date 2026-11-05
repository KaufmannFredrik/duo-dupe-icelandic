import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadData } from './helpers/data.mjs';
import { allowedFor, lessonStates, nextLesson } from '../js/engine/course-model.js';
import { analysesIn } from '../js/grammar.js';
import { hashSeed } from '../js/engine/rng.js';

const d = loadData();
const tokens = (text) => [...text.matchAll(/\p{L}+/gu)].map((m) => ({ raw: m[0], low: m[0].toLocaleLowerCase('is'), index: m.index }));
const lessonsOf = (unitId) => d.course.units.find((u) => u.id === unitId).lessons;

function generate(unitId, lesson) {
  const allowed = allowedFor(d.course, unitId, lesson.index);
  return { allowed, specs: d.generator.lesson({ focus: lesson.focus, allowed, seed: hashSeed(lesson.key) }) };
}

test('course: ten units in order, units 1 to 4 hand-made, the rest automatic', () => {
  assert.deepEqual(d.course.units.map((u) => u.id), ['hello', 'cafe', 'family', 'around', 'time', 'shopping', 'weather', 'study', 'grammar', 'newwords']);
  assert.equal(d.course.units[0].auto, false);
  assert.equal(d.course.units[3].auto, false);
  assert.equal(d.course.units[4].auto, true);
  for (const u of d.course.units) assert.ok(u.lessons.at(-1).review, `${u.id} ends with a review`);
});

test('course: a hand-made unit teaches every word of its theme exactly once', () => {
  for (const u of d.course.units.filter((x) => !x.auto)) {
    const taught = u.lessons.filter((l) => !l.review).flatMap((l) => l.focus);
    assert.equal(new Set(taught).size, taught.length, `${u.id}: a word is taught twice`);
    assert.deepEqual([...taught].sort(), [...u.lemmas].sort(), `${u.id}: lessons and theme words differ`);
  }
});

test('course: every focus word exists in the lexicon', () => {
  for (const u of d.course.units) for (const l of u.lessons) for (const id of l.focus) assert.ok(d.lexicon.lemmas[id], `${l.key}: ${id}`);
});

test('course: lesson states follow progress', () => {
  const fresh = lessonStates(d.course, { lessons: {}, skippedUnits: [] });
  assert.equal(fresh.get('hello/1'), 'current');
  assert.equal(fresh.get('hello/2'), 'locked');
  assert.equal(fresh.get('cafe/1'), 'locked');
  const doneHello = Object.fromEntries(lessonsOf('hello').filter((l) => !l.review).map((l) => [l.key, { done: true }]));
  const after = lessonStates(d.course, { lessons: doneHello, skippedUnits: [] });
  assert.equal(after.get('hello/review'), 'review');
  assert.equal(after.get('cafe/1'), 'current');
  const skipped = lessonStates(d.course, { lessons: {}, skippedUnits: ['hello'] });
  assert.equal(skipped.get('hello/1'), 'done');
  assert.equal(skipped.get('cafe/1'), 'current');
  assert.equal(nextLesson(d.course, { lessons: {}, skippedUnits: ['hello'] }).lesson.key, 'cafe/1');
});

test('generator: homographs are told apart by the sentence tags', () => {
  const sid = (text) => Object.keys(d.sentences).find((k) => d.sentences[k].is === text);
  const cases = [
    ['Það var afar heitur dagur.', 'afi_no', 'heitur_lo'], // afar = "very"
    ['Hann elskaði hana einu sinni.', 'sinn_fn', 'elska_so'], // einu sinni = "once"
    ['Hann elskaði hana einu sinni.', 'einn_to', 'hún_pfn'],
    ['Hann sér hundinn hennar.', 'sig_afn', 'sjá_so'], // sér = "sees"
    ['Við erum öll til.', 'til_fs', 'vera_so'], // til = "ready", a loose use: known, not taught
  ];
  for (const [text, not, yes] of cases) {
    assert.ok(sid(text), `"${text}" is in the data`);
    assert.equal(d.generator.hasLemma(sid(text), not), false, `"${text}" has no ${not}`);
    assert.equal(d.generator.hasLemma(sid(text), yes), true, `"${text}" has ${yes}`);
  }
});

test('generator: the same seed gives the same lesson', () => {
  const l = lessonsOf('hello')[1];
  assert.deepEqual(generate('hello', l).specs, generate('hello', l).specs);
});

for (const unitId of ['hello', 'cafe', 'family', 'around', 'newwords']) {
  for (const lesson of lessonsOf(unitId)) {
    test(`generator: ${lesson.key} produces valid exercises`, () => {
      const { allowed, specs } = generate(unitId, lesson);
      assert.ok(specs.length >= 8, `only ${specs.length} exercises`);
      assert.ok(new Set(specs.map((s) => s.type)).size >= 3, 'at least three exercise types');
      const knownIn = (words) => (t) => [...(d.formIndex.get(t.low) ?? [])].some((id) => words.has(id)) || d.names.has(t.low) || (t.index > 0 && t.raw[0] !== t.low[0]);
      const everyWord = new Set(Object.keys(d.lexicon.lemmas));
      for (const s of specs) {
        // Sentence building uses only words met so far; reading exercises may use any course word.
        const known = knownIn(s.type === 'wordbank' || s.type === 'dictation' ? allowed : everyWord);
        for (const sid of [s.sentence, ...(s.type === 'choice' ? s.options : [])].filter(Boolean)) {
          assert.ok(d.sentences[sid], `sentence ${sid} exists`);
          assert.ok(!d.excluded.has(sid), `sentence ${sid} is excluded`);
          for (const t of tokens(d.sentences[sid].is)) assert.ok(known(t), `${lesson.key} ${s.type}: "${t.raw}" in "${d.sentences[sid].is}" is not a known word`);
        }
        if (s.type === 'choice') assert.equal(new Set(s.options.map((x) => d.sentences[x].en[0])).size, s.options.length, 'distinct translations');
        if (s.type === 'wordbank' || s.type === 'dictation') {
          const present = new Set(tokens(d.sentences[s.sentence].is).map((t) => t.low));
          for (const x of s.distractors) assert.ok(!present.has(x.toLocaleLowerCase('is')), `distractor "${x}" is in the sentence`);
        }
        if (s.sentence && s.lemma) assert.ok(d.generator.hasLemma(s.sentence, s.lemma), `${s.type}: "${d.sentences[s.sentence].is}" does not contain ${s.lemma}`);
        if (s.type === 'ending' || s.type === 'case') {
          const tags = d.tagsOf(s.sentence);
          const at = tokens(d.sentences[s.sentence].is).findIndex((t) => t.raw === s.target);
          if (tags) assert.equal(tags[at], s.lemma, `"${s.target}" in "${d.sentences[s.sentence].is}" is tagged ${tags[at]}, not ${s.lemma}`);
          const bm = d.paradigm(s.lemma);
          assert.ok(analysesIn(bm, s.target).length, `"${s.target}" is a form of ${s.lemma}`);
          assert.ok(tokens(d.sentences[s.sentence].is).some((t) => t.raw === s.target), 'target is in the sentence');
        }
        if (s.type === 'ending') {
          assert.ok(s.options.some((o) => o.toLocaleLowerCase('is') === s.target.toLocaleLowerCase('is')), 'answer among options');
          assert.ok(s.options.length >= 2 && new Set(s.options).size === s.options.length, 'distinct options');
          for (const o of s.options) assert.ok(d.paradigm(s.lemma).some((f) => f.b === o), `option "${o}" is a form of ${s.lemma}`);
        }
        if (s.type === 'case') assert.equal(s.cases.length, 1, 'case questions only for unambiguous forms');
        if (s.type === 'table') for (const tag of s.blanks) assert.ok(d.paradigm(s.lemma).some((f) => f.g === tag), `${tag} in ${s.lemma}`);
      }
    });
  }
}

test('generator: placement has a step per unit, with case questions from unit 2', () => {
  const steps = d.generator.placement({ units: d.course.units, seed: 7 });
  assert.equal(steps.length, d.course.units.length);
  assert.ok(steps[0].items.length >= 1);
  assert.ok(steps.slice(1).some((s) => s.items.some((i) => i.type === 'case')));
});

test('generator: review turns due cards into exercises', () => {
  const allowed = allowedFor(d.course, 'cafe', 7);
  const specs = d.generator.review({ cards: [{ key: 'kaffi_no|meaning' }, { key: 'bjór_no|ÞFETgr' }, { key: 'mjólk_no|table' }], allowed, seed: 1 });
  assert.equal(specs.length, 3);
});
