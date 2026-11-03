// Profile: stats, badges and progress export and import (Phase 5). Phase 1 shows demo stats.

import { ready } from '../app.js';
import { t } from '../i18n.js';
import { getProgress } from '../store.js';
import { goalRing, icon } from '../shell.js';

await ready;
const p = getProgress();

document.querySelector('[data-stats]').innerHTML = [
  ['streak', p.streak, 'profile.streak'],
  ['xp', p.xp, 'profile.xp'],
  ['check', p.lessonsDone, 'profile.lessons'],
  ['goal', `${Math.round(p.accuracy * 100)}%`, 'profile.accuracy'],
]
  .map(([ic, value, key]) => `<div class="card card--quiet"><div class="stat">${icon(ic)}<span class="big-number">${value}</span></div><p>${t(key)}</p></div>`)
  .join('');

document.querySelector('[data-goal]').innerHTML = `${goalRing(p.today, p.goal, 'goal-ring--lg')}<p>${t('side.goalText', { left: p.goal - p.today })}</p>`;

const BADGES = [
  ['star', 'badge.first', true],
  ['streak', 'badge.streak3', true],
  ['table', 'badge.tables', false],
  ['trophy', 'badge.perfect', false],
];
document.querySelector('[data-badges]').innerHTML = BADGES.map(
  ([ic, key, earned]) => `<li class="badge-tile" data-earned="${earned}">${icon(ic, 'icon icon--lg')}<span>${t(key)}</span><span class="${earned ? '' : 'muted'}">${t(earned ? 'badge.earned' : 'badge.locked')}</span></li>`,
).join('');
