// The A1 check (js/engine/check.js, the generator's check(), content/units/a1check.json).
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { loadData } from './helpers/data.mjs';
import { PASS_SHARE, checkGoals, checkScore } from '../js/engine/check.js';
import { lessonStates, nextLesson, unitDone } from '../js/engine/course-model.js';

const d = loadData();
const { goals } = JSON.parse(readFileSync(new URL('../content/goals.json', import.meta.url), 'utf8'));
const tested = checkGoals(d.course, goals, 'a1');
const a1 = d.course.sections.find((s) => s.id === 'a1');
const check = a1.units.find((u) => u.check);

test('check: every A1 goal is tested, with the words of the units that train it', () => {
  assert.deepEqual(tested.map((g) => g.id), goals.filter((g) => g.section === 'a1').map((g) => g.id));
  for (const g of tested) {
    assert.ok(g.units.length && g.words.length, `${g.id} has units and words`);
    assert.ok(g.units.every((u) => u.section === 'a1' && !u.check), `${g.id}: units of section A1 before the check`);
  }
  assert.equal(a1.units.at(-1), check, 'the check ends section A1');
});

test('check: two tasks per goal, on different words, each a valid exercise', () => {
  const allowed = new Set([...d.course.always, ...tested.flatMap((g) => g.words)]);
  for (const seed of [1, 2, 3, 4, 5]) {
    const specs = d.generator.check({ goals: tested, allowed, seed });
    for (const g of tested) assert.equal(specs.filter((s) => s.goal === g.id).length, 2, `seed ${seed}: two tasks for ${g.id}`);
    const words = specs.map((s) => s.lemma);
    assert.equal(new Set(words).size, words.length, `seed ${seed}: no word twice`);
    for (const s of specs) {
      for (const sid of [s.sentence, ...(s.type === 'choice' ? s.options : [])].filter(Boolean)) {
        assert.ok(d.sentences[sid] && !d.excluded.has(sid), `seed ${seed}: sentence ${sid} can be shown`);
      }
      if (s.type === 'wordbank' || s.type === 'dictation') assert.ok(!/\d/.test(d.sentences[s.sentence].is), 'chips have no digits');
    }
    // A word task and a sentence task for each goal.
    for (const g of tested) {
      const kinds = specs.filter((s) => s.goal === g.id).map((s) => (['meaning', 'listen'].includes(s.type) ? 'word' : 'sentence'));
      assert.ok(kinds.includes('word'), `seed ${seed}: ${g.id} has a word task`);
    }
  }
});

test('check: scored per goal; passing takes most tasks and half of every goal', () => {
  const specs = [{ goal: 'a' }, { goal: 'a' }, { goal: 'b' }, { goal: 'b' }];
  const pass = checkScore(specs, ['correct', 'almost', 'correct', 'wrong']);
  assert.deepEqual(pass.goals.map((g) => [g.id, g.right, g.total, g.passed]), [['a', 2, 2, true], ['b', 1, 2, true]]);
  assert.equal(pass.passed, PASS_SHARE <= 0.75);
  const missedGoal = checkScore([...specs, { goal: 'c' }, { goal: 'c' }], ['correct', 'correct', 'correct', 'correct', 'wrong', 'wrong']);
  assert.equal(missedGoal.passed, false, 'a goal with nothing right fails the check');
  assert.equal(missedGoal.goals.find((g) => g.id === 'c').passed, false);
  assert.equal(checkScore(specs, ['wrong', 'correct', 'wrong', 'correct']).passed, false, 'half right is not enough');
});

test('check: it is the next lesson after unit 19, and a unit finished before it stays open', () => {
  const done = {};
  for (const u of d.course.units) {
    if (u.check) break;
    for (const l of u.lessons) if (!l.review) done[l.key] = { done: true };
  }
  const p = { lessons: done, skippedUnits: [] };
  assert.equal(nextLesson(d.course, p).lesson.key, 'a1check/check');
  assert.equal(lessonStates(d.course, p).get('newwords/1'), 'locked', 'the bonus opens after the check');
  // A learner who finished the bonus before the check was added keeps it.
  const recorded = { ...p, units: { newwords: 1 } };
  assert.notEqual(lessonStates(d.course, recorded).get('newwords/1'), 'locked');
  // Passing the check finishes the unit and opens what comes after.
  const passed = { ...p, lessons: { ...done, 'a1check/check': { done: true } } };
  assert.ok(unitDone(check, passed));
  assert.equal(lessonStates(d.course, passed).get('newwords/1'), 'current');
});

test('check: the placement test has no step for the check', () => {
  const steps = d.generator.placement({ units: d.course.units, seed: 7 });
  assert.ok(!steps.some((s) => s.unit === 'a1check'));
  assert.equal(steps.length, d.course.units.filter((u) => u.lemmas.length).length);
});
