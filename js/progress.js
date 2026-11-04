// Learner progress on top of db.js: SRS cards per item, mistakes to replay, an attempt log
// (for the weak-spots heatmap) and lesson completion with XP.

import { del, get, getAll, put } from './db.js';
import { newCard, review } from './srs.js';

const PROGRESS_KEY = 'progress';
const XP = { correct: 10, almost: 5, wrong: 0 };

const today = (now = Date.now()) => new Date(now).toISOString().slice(0, 10);

export async function loadProgress() {
  return (await get('kv', PROGRESS_KEY)) ?? { xp: 0, lessons: {}, skippedUnits: [], days: {}, placement: null };
}

async function saveProgress(p) {
  await put('kv', p, PROGRESS_KEY);
  window.dispatchEvent(new CustomEvent('tolva:progress', { detail: p }));
  return p;
}

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

export async function completeLesson(lessonKey, results) {
  const p = await loadProgress();
  const xp = results.reduce((sum, r) => sum + XP[r], 0);
  const prev = p.lessons[lessonKey];
  const score = results.length ? results.filter((r) => r !== 'wrong').length / results.length : 0;
  p.lessons[lessonKey] = { done: true, at: Date.now(), best: Math.max(score, prev?.best ?? 0), times: (prev?.times ?? 0) + 1 };
  p.xp += xp;
  const d = today();
  p.days[d] = (p.days[d] ?? 0) + xp;
  await saveProgress(p);
  return { xp, score };
}

export async function skipUnits(unitIds, placement) {
  const p = await loadProgress();
  p.skippedUnits = [...new Set([...p.skippedUnits, ...unitIds])];
  p.placement = placement;
  return saveProgress(p);
}

export const mistakes = () => getAll('mistakes');
export const cards = () => getAll('cards');
export const attempts = () => getAll('attempts');
export { saveProgress, today };
