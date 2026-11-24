import { test } from 'node:test';
import assert from 'node:assert/strict';
import { QUESTS, QUEST_BONUS, addQuestEvents, pickQuests, questsOf } from '../js/quests.js';

const DAY = '2026-11-24';

test('quests: three different quests a day, the first about lessons, the same all day', () => {
  for (let d = 1; d <= 28; d++) {
    const day = `2026-02-${String(d).padStart(2, '0')}`;
    const ids = pickQuests(day);
    assert.equal(ids.length, 3);
    assert.equal(new Set(ids).size, 3);
    assert.ok(['lessons', 'perfect'].includes(ids[0]), `${day} starts with a lesson quest`);
    for (const id of ids) assert.ok(QUESTS[id], id);
    assert.deepEqual(pickQuests(day), ids);
  }
  const seen = new Set(Array.from({ length: 60 }, (_, i) => pickQuests(`2026-03-${i}`)).flat());
  assert.equal(seen.size, Object.keys(QUESTS).length, 'every quest comes up');
});

test('quests: counts add up, a combo keeps the best run, and each quest is done once', () => {
  const p = {};
  const [first, second, third] = pickQuests(DAY);
  const r1 = addQuestEvents(p, { [second]: 1 }, DAY);
  assert.equal(questsOf(p, DAY).items[1].n, Math.min(1, QUESTS[second].target));
  const full = (id) => ({ [id]: QUESTS[id].target });
  const r2 = addQuestEvents(p, full(second), DAY);
  assert.deepEqual(r2.done, QUESTS[second].target === 1 ? [] : [second]);
  if (QUESTS[second].target === 1) assert.deepEqual(r1.done, [second]);
  assert.equal(r2.chest, false);
  const runs = {};
  addQuestEvents(runs, { combo: 4 }, DAY);
  addQuestEvents(runs, { combo: 3 }, DAY);
  assert.equal(runs.quests.counts.combo, 4, 'the best run, not the sum');
  const r3 = addQuestEvents(p, { ...full(first), ...full(third) }, DAY);
  assert.deepEqual(r3.done.sort(), [first, third].sort());
  assert.equal(r3.chest, true, 'all three done: the bonus');
  assert.equal(addQuestEvents(p, full(first), DAY).chest, false, 'the bonus comes once');
  assert.ok(QUEST_BONUS > 0);
});

test('quests: a new day starts from nothing', () => {
  const p = {};
  const [first] = pickQuests(DAY);
  addQuestEvents(p, { [first]: 5 }, DAY);
  const next = '2026-11-25';
  assert.ok(questsOf(p, next).items.every((it) => it.n === 0 && !it.done));
  addQuestEvents(p, { story: 1 }, next);
  assert.equal(p.quests.day, next);
  assert.equal(p.quests.counts[first] ?? 0, first === 'story' ? 1 : 0);
});
