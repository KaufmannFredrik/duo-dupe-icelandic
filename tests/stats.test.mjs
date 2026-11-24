import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BADGES, addDays, freezesEarned, heatCells, recentDays, settleFreezes, streakOf, summarize } from '../js/stats.js';

const TODAY = '2026-03-31';
const days = (...keys) => Object.fromEntries(keys.map((k) => [k, 20]));

test('addDays: crosses months, years and daylight-saving changes', () => {
  assert.equal(addDays('2026-03-31', 1), '2026-04-01');
  assert.equal(addDays('2026-01-01', -1), '2025-12-31');
  assert.equal(addDays('2026-03-29', 1), '2026-03-30'); // DST change in Europe
  assert.equal(addDays('2028-02-28', 1), '2028-02-29');
});

test('streakOf: counts back from today, or from yesterday before today is played', () => {
  assert.equal(streakOf({}, [], TODAY), 0);
  assert.equal(streakOf(days('2026-03-29', '2026-03-30', TODAY), [], TODAY), 3);
  assert.equal(streakOf(days('2026-03-29', '2026-03-30'), [], TODAY), 2);
  assert.equal(streakOf(days('2026-03-28', '2026-03-29'), [], TODAY), 0, 'a missed day breaks it');
  assert.equal(streakOf({ [TODAY]: 0, '2026-03-30': 10 }, [], TODAY), 1, 'zero XP is not a played day');
});

test('streakOf: a frozen day bridges the gap without adding to the streak', () => {
  assert.equal(streakOf(days('2026-03-28', '2026-03-30'), ['2026-03-29'], TODAY), 2);
  assert.equal(streakOf(days('2026-03-28', TODAY), ['2026-03-29', '2026-03-30'], TODAY), 2);
});

test('settleFreezes: covers a gap only when there are enough freezes', () => {
  const p = { days: days('2026-03-28'), frozen: [], freezes: 2 };
  const r = settleFreezes(p, TODAY);
  assert.deepEqual(r, { freezes: 0, frozen: ['2026-03-29', '2026-03-30'], changed: true });
  assert.equal(streakOf(p.days, r.frozen, TODAY), 1);
  assert.equal(settleFreezes({ ...p, freezes: 1 }, TODAY).changed, false, 'two missed days, one freeze: streak is lost, freeze kept');
  assert.equal(settleFreezes({ days: days('2026-03-30'), frozen: [], freezes: 1 }, TODAY).changed, false, 'played yesterday');
  assert.equal(settleFreezes({ days: {}, frozen: [], freezes: 2 }, TODAY).changed, false, 'nothing to protect');
});

test('settleFreezes: idempotent', () => {
  const p = { days: days('2026-03-29'), frozen: [], freezes: 1 };
  const once = settleFreezes(p, TODAY);
  const twice = settleFreezes({ ...p, ...once }, TODAY);
  assert.equal(once.freezes, 0);
  assert.equal(twice.changed, false);
});

test('freezesEarned: one per seven days', () => {
  assert.equal(freezesEarned(6, 7), 1);
  assert.equal(freezesEarned(7, 8), 0);
  assert.equal(freezesEarned(13, 14), 1);
  assert.equal(freezesEarned(0, 1), 0);
});

test('recentDays: seven days ending today with their state', () => {
  const week = recentDays({ [TODAY]: 25, '2026-03-30': 5 }, ['2026-03-29'], 20, 7, TODAY);
  assert.equal(week.length, 7);
  assert.equal(week[0].key, '2026-03-25');
  assert.deepEqual(week.slice(-3).map((d) => d.state), ['frozen', 'active', 'goal']);
});

test('summarize and badges', () => {
  const p = {
    xp: 1200,
    days: days('2026-03-29', '2026-03-30', TODAY),
    frozen: [],
    best: 2,
    lessons: { 'hello/1': { done: true, best: 1 }, 'hello/review': { done: true, best: 0.8 }, 'practice/sounds': { done: true, times: 2 }, placement: { done: true } },
  };
  const attempts = [
    { key: 'kaffi_no|ÞGFET', result: 'correct' },
    { key: 'kaffi_no|meaning', result: 'correct' },
    { key: 'bjór_no|EFET', result: 'wrong' },
  ];
  const s = summarize(p, attempts, TODAY);
  assert.equal(s.streak, 3);
  assert.equal(s.best, 3);
  assert.equal(s.lessonsDone, 2, 'practice rounds and placement are not lessons');
  assert.equal(s.unitsDone, 1);
  assert.equal(s.formsRight, 1);
  assert.equal(s.accuracy, 2 / 3);
  const earned = BADGES.filter((b) => b.earned(s)).map((b) => b.id);
  assert.deepEqual(earned, ['first', 'streak3', 'perfect', 'unit', 'sounds', 'xp1000']);
});

test('heatCells: accuracy per cell and the lemmas that were missed', () => {
  const cells = heatCells(
    [
      { key: 'a|x', case: 'ÞGF', number: 'sg', result: 'correct' },
      { key: 'a|x', case: 'ÞGF', number: 'sg', result: 'wrong' },
      { key: 'b|x', case: 'ÞGF', number: 'sg', result: 'almost' },
      { key: 'c|meaning', result: 'wrong' },
    ],
    (a) => `${a.case}|${a.number}`,
  );
  assert.deepEqual([...cells.keys()], ['ÞGF|sg']);
  const c = cells.get('ÞGF|sg');
  assert.equal(c.total, 3);
  assert.equal(c.right, 2);
  assert.deepEqual([...c.lemmas], [['a', 1]]);
});

test('tally: all-time answer counts, kept beside a trimmed attempt log', async () => {
  const { addToTally, summarize, tallyOf } = await import('../js/stats.js');
  const log = [
    { key: 'kaffi_no|ÞFET', result: 'correct' },
    { key: 'kaffi_no|meaning', result: 'correct' },
    { key: 'te_no|ÞGFET', result: 'almost' },
    { key: 'te_no|EFET', result: 'wrong' },
  ];
  assert.deepEqual(tallyOf(log), { answered: 4, right: 3, formsRight: 1 });
  // Adding answers one by one gives the same counts as counting the log.
  assert.deepEqual(log.reduce(addToTally, undefined), tallyOf(log));
  // summarize takes the tally instead of the (trimmed) log.
  const s = summarize({ xp: 0, lessons: {}, days: {} }, [], '2026-11-24', { answered: 6000, right: 4500, formsRight: 120 });
  assert.equal(s.answered, 6000);
  assert.equal(s.accuracy, 0.75);
  assert.equal(s.formsRight, 120);
  assert.equal(summarize({ xp: 0, lessons: {}, days: {} }, log, '2026-11-24').formsRight, 1);
});
