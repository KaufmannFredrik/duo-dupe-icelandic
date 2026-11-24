// Toasts for what a lesson or practice round just earned: the daily goal, a longer streak,
// a streak freeze, new badges and finished daily quests. Takes the result of completeLesson(),
// addXP() or recordQuests().

import { t } from '../i18n.js';
import { sfx } from '../sfx.js';
import { toast } from './toast.js';
import { QUESTS } from '../quests.js';

const questLines = (r) => [
  ...(r.quests?.done ?? []).map((id) => ['check', t('quests.doneNews', { name: t(QUESTS[id].name, { n: QUESTS[id].target }) })]),
  ...(r.quests?.chest ? [['trophy', t('quests.chestNews', { xp: r.questXP })]] : []),
];

export function celebrate(r) {
  if (!r) return;
  const notes = [];
  if (r.goalReached) notes.push(t('goal.reached'));
  if (r.streakUp && r.streak > 1) notes.push(t('streak.up', { n: r.streak }));
  if (r.freezeEarned) notes.push(t('streak.freezeEarned'));
  for (const id of r.badges ?? []) notes.push(t('badge.new', { name: t(`badge.${id}`) }));
  for (const [, text] of questLines(r)) notes.push(text);
  notes.forEach((note, i) => setTimeout(() => toast(note), i * 600));
  if (r.goalReached || r.badges?.length || r.quests?.done?.length) sfx('complete');
}

/** The same news as lines for a completion screen. */
export function celebrationLines(r) {
  const lines = [];
  if (r.goalReached) lines.push(['goal', t('goal.reached')]);
  if (r.streakUp) lines.push(['streak', t('streak.day', { n: r.streak })]);
  if (r.freezeEarned) lines.push(['freeze', t('streak.freezeEarned')]);
  for (const id of r.badges ?? []) lines.push(['trophy', t('badge.new', { name: t(`badge.${id}`) })]);
  lines.push(...questLines(r));
  return lines;
}
