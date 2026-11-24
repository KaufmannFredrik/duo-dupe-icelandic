// Learner progress on top of db.js: SRS cards per item, mistakes to replay, an attempt log
// (for the weak-spots heatmap), lesson completion with XP, the streak with freezes, badges,
// and export, import and reset of everything.

import { clear, del, get, getAll, put, putMany } from './db.js';
import { newCard, review } from './srs.js';
import { getSettings, replaceSettings } from './store.js';
import { BADGES, MAX_FREEZES, dayKey, freezesEarned, settleFreezes, streakOf, summarize } from './stats.js';
import { QUEST_BONUS, addQuestEvents } from './quests.js';

const PROGRESS_KEY = 'progress';
const XP = { correct: 10, almost: 5, wrong: 0 };
export const EXPORT_APP = 'tolva';
export const EXPORT_VERSION = 1;

const today = (now = Date.now()) => dayKey(now);
const fresh = () => ({ xp: 0, lessons: {}, skippedUnits: [], days: {}, placement: null, freezes: 0, frozen: [], best: 0, badges: {} });

export async function loadProgress() {
  return { ...fresh(), ...((await get('kv', PROGRESS_KEY)) ?? {}) };
}

async function saveProgress(p) {
  await put('kv', p, PROGRESS_KEY);
  window.dispatchEvent(new CustomEvent('tolva:progress', { detail: p }));
  return p;
}

export const dailyGoal = () => Number(getSettings().goal) || 20;

/**
 * Records one answer for one item.
 * @param {{ key: string, result: 'correct'|'almost'|'wrong', meta?: object, spec?: object }} attempt
 *   key: SRS card key; meta: grammatical features (case, number, gender) for the heatmap;
 *   spec: the exercise spec, kept for mistakes so they can be replayed.
 */
export async function recordAttempt({ key, result, meta = {}, spec }) {
  const now = Date.now();
  const card = (await get('cards', key)) ?? newCard(key, now);
  await put('cards', review(card, result, now));
  await put('attempts', { key, result, at: now, ...meta });
  if (result === 'wrong' && spec) await put('mistakes', { key, spec, at: now });
  if (result === 'correct') await del('mistakes', key);
}

// Adds XP for today and updates the streak, best streak and freezes. Mutates p.
function gain(p, xp) {
  const d = today();
  const goal = dailyGoal();
  const before = streakOf(p.days, p.frozen, d);
  const todayBefore = p.days[d] ?? 0;
  p.xp += xp;
  p.days[d] = todayBefore + xp;
  const after = streakOf(p.days, p.frozen, d);
  const earned = Math.min(freezesEarned(before, after), MAX_FREEZES - p.freezes);
  p.freezes += Math.max(0, earned);
  p.best = Math.max(p.best, after);
  return { streak: after, streakUp: after > before, freezeEarned: earned > 0, goalReached: todayBefore < goal && p.days[d] >= goal };
}

// Marks newly earned badges in p and returns their ids.
async function awardBadges(p) {
  const s = summarize(p, await getAll('attempts'), today());
  const won = BADGES.filter((b) => !p.badges[b.id] && b.earned(s)).map((b) => b.id);
  for (const id of won) p.badges[id] = today();
  return won;
}

/**
 * Marks a lesson done and adds its XP: per answer, plus bonus (combos in the lesson). events: what
 * the round counts toward the daily quests (js/quests.js); finishing all three adds QUEST_BONUS.
 * @param {string} lessonKey
 * @param {('correct'|'almost'|'wrong')[]} results
 * @param {{ bonus?: number, events?: object }} [extra]
 */
export async function completeLesson(lessonKey, results, { bonus = 0, events } = {}) {
  const p = await loadProgress();
  const xp = results.reduce((sum, r) => sum + XP[r], 0) + bonus;
  const prev = p.lessons[lessonKey];
  const score = results.length ? results.filter((r) => r !== 'wrong').length / results.length : 0;
  p.lessons[lessonKey] = { done: true, at: Date.now(), best: Math.max(score, prev?.best ?? 0), times: (prev?.times ?? 0) + 1 };
  const quests = events ? addQuestEvents(p, events, today()) : { done: [], chest: false };
  const questXP = quests.chest ? QUEST_BONUS : 0;
  const streak = gain(p, xp + questXP);
  const badges = await awardBadges(p);
  await saveProgress(p);
  return { xp, score, ...streak, badges, quests, questXP };
}

/** Quest progress from outside a lesson (a story heard to the end). */
export async function recordQuests(events) {
  const p = await loadProgress();
  const quests = addQuestEvents(p, events, today());
  const questXP = quests.chest ? QUEST_BONUS : 0;
  const streak = questXP ? gain(p, questXP) : {};
  const badges = questXP ? await awardBadges(p) : [];
  await saveProgress(p);
  return { xp: questXP, ...streak, badges, quests, questXP };
}

/** XP outside lessons (the case trainer). */
export async function addXP(xp) {
  if (!xp) return null;
  const p = await loadProgress();
  const streak = gain(p, xp);
  const badges = await awardBadges(p);
  await saveProgress(p);
  return { xp, ...streak, badges };
}

/** Run once per page load: spends streak freezes on missed days if they cover the gap. */
export async function settle() {
  const p = await loadProgress();
  const r = settleFreezes(p, today());
  if (!r.changed) return p;
  p.freezes = r.freezes;
  p.frozen = r.frozen;
  return saveProgress(p);
}

export async function skipUnits(unitIds, placement) {
  const p = await loadProgress();
  p.skippedUnits = [...new Set([...p.skippedUnits, ...unitIds])];
  p.placement = placement;
  return saveProgress(p);
}

// --- Export, import, reset ---------------------------------------------------------------------

export async function exportAll() {
  return {
    app: EXPORT_APP,
    version: EXPORT_VERSION,
    exported: new Date().toISOString(),
    settings: getSettings(),
    progress: await loadProgress(),
    cards: await getAll('cards'),
    mistakes: await getAll('mistakes'),
    attempts: await getAll('attempts'),
  };
}

/** Checks an export file. Returns an error key for i18n, or null when it can be imported. */
export function checkImport(data) {
  if (!data || typeof data !== 'object' || data.app !== EXPORT_APP) return 'profile.importNotOurs';
  if (data.version > EXPORT_VERSION) return 'profile.importNewer';
  const lists = ['cards', 'mistakes', 'attempts'];
  if (!data.progress || typeof data.progress !== 'object' || lists.some((k) => !Array.isArray(data[k]))) return 'profile.importBroken';
  if (data.cards.some((c) => typeof c?.key !== 'string') || data.mistakes.some((m) => typeof m?.key !== 'string')) return 'profile.importBroken';
  return null;
}

/** Replaces all progress (and settings, when present) with an export. Call checkImport first. */
export async function importAll(data) {
  for (const store of ['cards', 'mistakes', 'attempts']) await clear(store);
  await putMany('cards', data.cards);
  await putMany('mistakes', data.mistakes);
  await putMany('attempts', data.attempts.map(({ id, ...a }) => a));
  if (data.settings && typeof data.settings === 'object') replaceSettings(data.settings);
  return saveProgress({ ...fresh(), ...data.progress });
}

export async function resetAll() {
  for (const store of ['cards', 'mistakes', 'attempts', 'kv']) await clear(store);
  window.dispatchEvent(new CustomEvent('tolva:progress', { detail: fresh() }));
}

export const mistakes = () => getAll('mistakes');
export const cards = () => getAll('cards');
export const attempts = () => getAll('attempts');
export { saveProgress, today };
