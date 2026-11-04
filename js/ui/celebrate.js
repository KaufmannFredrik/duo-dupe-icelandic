// Toasts for what a lesson or practice round just earned: the daily goal, a longer streak,
// a streak freeze and new badges. Takes the result of completeLesson() or addXP().

import { t } from '../i18n.js';
import { sfx } from '../sfx.js';
import { toast } from './toast.js';

export function celebrate(r) {
  if (!r) return;
  const notes = [];
  if (r.goalReached) notes.push(t('goal.reached'));
  if (r.streakUp && r.streak > 1) notes.push(t('streak.up', { n: r.streak }));
  if (r.freezeEarned) notes.push(t('streak.freezeEarned'));
  for (const id of r.badges ?? []) notes.push(t('badge.new', { name: t(`badge.${id}`) }));
  notes.forEach((note, i) => setTimeout(() => toast(note), i * 600));
  if (r.goalReached || r.badges?.length) sfx('complete');
}

/** The same news as lines for a completion screen. */
export function celebrationLines(r) {
  const lines = [];
  if (r.goalReached) lines.push(['goal', t('goal.reached')]);
  if (r.streakUp) lines.push(['streak', t('streak.day', { n: r.streak })]);
  if (r.freezeEarned) lines.push(['freeze', t('streak.freezeEarned')]);
  for (const id of r.badges ?? []) lines.push(['trophy', t('badge.new', { name: t(`badge.${id}`) })]);
  return lines;
}
