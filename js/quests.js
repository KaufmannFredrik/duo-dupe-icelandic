// Daily quests: three small goals a day, the same for everyone on a given date. The first is
// always about course lessons; the other two are picked from the rest. Finishing all three gives
// QUEST_BONUS XP once. Progress is p.quests = { day, counts: { id: n }, chest: boolean }, reset on a
// new day. Pure functions: js/progress.js stores the result, js/ui/quests.js shows it.

import { hashSeed, rng, shuffle } from './engine/rng.js';

export const QUEST_BONUS = 15;

/**
 * target: how many to reach. max: the count is the best single run, not a sum (a combo).
 * name: the i18n key of the quest's text, which gets {n} = target.
 */
export const QUESTS = {
  lessons: { target: 2, icon: 'learn', name: 'quests.lessons' },
  perfect: { target: 1, icon: 'star', name: 'quests.perfect' },
  combo: { target: 10, icon: 'xp', name: 'quests.combo', max: true },
  listen: { target: 8, icon: 'sound-on', name: 'quests.listen' },
  type: { target: 6, icon: 'keyboard', name: 'quests.type' },
  story: { target: 1, icon: 'stories', name: 'quests.story' },
  sounds: { target: 1, icon: 'sound-wave', name: 'quests.sounds' },
};
const LESSON_QUESTS = ['lessons', 'perfect'];

/** The three quest ids of a day (YYYY-MM-DD). */
export function pickQuests(day) {
  const r = rng(hashSeed(`quests:${day}`));
  const first = shuffle(LESSON_QUESTS, r)[0];
  const rest = shuffle(Object.keys(QUESTS).filter((id) => !LESSON_QUESTS.includes(id)), r).slice(0, 2);
  return [first, ...rest];
}

const stateOf = (p, day) => (p.quests?.day === day ? p.quests : { day, counts: {}, chest: false });

/** The day's quests with their progress: { day, items: [{ id, target, icon, name, n, done }], chest }. */
export function questsOf(p, day) {
  const q = stateOf(p, day);
  const items = pickQuests(day).map((id) => {
    const count = q.counts[id] ?? 0;
    return { id, ...QUESTS[id], n: Math.min(count, QUESTS[id].target), done: count >= QUESTS[id].target };
  });
  return { day, items, chest: q.chest };
}

/**
 * Adds what the learner just did to the day's quests (mutates p.quests).
 * @param {object} events quest id -> amount (for a max quest, the run length)
 * @returns {{ done: string[], chest: boolean }} quests finished by these events, and whether the
 *   last of the three was, which earns QUEST_BONUS (the caller adds the XP)
 */
export function addQuestEvents(p, events, day) {
  const before = questsOf(p, day);
  const q = stateOf(p, day);
  for (const [id, n] of Object.entries(events)) {
    if (!QUESTS[id] || !n) continue;
    q.counts[id] = QUESTS[id].max ? Math.max(q.counts[id] ?? 0, n) : (q.counts[id] ?? 0) + n;
  }
  p.quests = q;
  const after = questsOf(p, day);
  const done = after.items.filter((it, i) => it.done && !before.items[i].done).map((it) => it.id);
  const chest = !q.chest && after.items.every((it) => it.done);
  if (chest) q.chest = true;
  return { done, chest };
}
