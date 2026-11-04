// Profile: streak, XP and accuracy, the daily goal with the last seven days, badges, and
// export, import and reset of all progress. Everything stays on this device.

import { ready } from '../app.js';
import { t } from '../i18n.js';
import { attempts, checkImport, dailyGoal, exportAll, importAll, loadProgress, resetAll } from '../progress.js';
import { BADGES, dayKey, recentDays, summarize } from '../stats.js';
import { goalRing, icon } from '../shell.js';

await ready;
const $ = (sel) => document.querySelector(sel);
const status = $('[data-data-status]');
const dialog = $('[data-confirm]');
const lang = () => document.documentElement.lang;
const weekday = (key) => new Date(`${key}T12:00:00`).toLocaleDateString(lang(), { weekday: 'short' });

async function render() {
  const [p, log] = await Promise.all([loadProgress(), attempts()]);
  const s = summarize(p, log);
  const goal = dailyGoal();
  $('[data-stats]').innerHTML = [
    ['streak', s.streak, 'profile.streak'],
    ['star', s.best, 'profile.best'],
    ['xp', s.xp, 'profile.xp'],
    ['check', s.lessonsDone, 'profile.lessons'],
    ['goal', s.accuracy === null ? '-' : `${Math.round(s.accuracy * 100)}%`, 'profile.accuracy'],
  ]
    .map(([ic, value, key]) => `<div class="card card--quiet"><div class="stat">${icon(ic)}<span class="big-number">${value}</span></div><p>${t(key)}</p></div>`)
    .join('');
  $('[data-goal]').innerHTML = `${goalRing(s.today, goal, 'goal-ring--lg')}<p>${s.today >= goal ? t('side.goalDone') : t('side.goalText', { left: goal - s.today })}</p>`;
  const marks = { goal: 'check', active: 'streak', frozen: 'freeze' };
  $('[data-week]').innerHTML = recentDays(p.days, p.frozen, goal)
    .map(
      (d) => `<li class="week__day" data-state="${d.state}"><span class="week__mark">${marks[d.state] ? icon(marks[d.state], 'icon icon--sm') : ''}</span>
      <span class="week__name" aria-hidden="true">${weekday(d.key)}</span><span class="visually-hidden">${weekday(d.key)}: ${t(`profile.day.${d.state}`, { xp: d.xp })}</span></li>`,
    )
    .join('');
  $('[data-freezes]').textContent = t('profile.freezes', { n: s.freezes });
  $('[data-badges]').innerHTML = BADGES.map((b) => {
    const when = p.badges?.[b.id];
    const date = when ? new Date(`${when}T12:00:00`).toLocaleDateString(lang()) : '';
    return `<li class="badge-tile" data-earned="${Boolean(when)}">${icon(b.icon, 'icon icon--lg')}<span class="badge-tile__name">${t(`badge.${b.id}`)}</span>
      <span class="badge-tile__text">${t(`badge.${b.id}Text`)}</span><span class="${when ? '' : 'muted'}">${when ? t('badge.earnedOn', { date }) : t('badge.locked')}</span></li>`;
  }).join('');
}

function confirmDialog({ title, text, ok }) {
  $('[data-confirm-title]').textContent = title;
  $('[data-confirm-text]').textContent = text;
  $('[data-ok]').textContent = ok;
  dialog.showModal();
  return new Promise((resolve) => {
    const done = (value) => {
      if (dialog.open) dialog.close();
      resolve(value);
    };
    $('[data-ok]').onclick = () => done(true);
    $('[data-cancel]').onclick = () => done(false);
    dialog.oncancel = () => resolve(false);
  });
}

$('[data-export]').addEventListener('click', async () => {
  const data = await exportAll();
  const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 1)], { type: 'application/json' }));
  const a = Object.assign(document.createElement('a'), { href: url, download: `tolva-progress-${dayKey()}.json` });
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  status.textContent = t('profile.exportDone');
});

$('[data-import]').addEventListener('change', async (e) => {
  const file = e.target.files?.[0];
  e.target.value = '';
  if (!file) return;
  let data;
  try {
    data = JSON.parse(await file.text());
  } catch {
    status.textContent = t('profile.importBroken');
    return;
  }
  const problem = checkImport(data);
  if (problem) {
    status.textContent = t(problem);
    return;
  }
  const when = new Date(data.exported).toLocaleString(lang());
  if (!(await confirmDialog({ title: t('profile.import'), text: t('profile.importConfirm', { date: when }), ok: t('profile.import') }))) return;
  await importAll(data);
  status.textContent = t('profile.importDone');
  render();
});

$('[data-reset]').addEventListener('click', async () => {
  if (!(await confirmDialog({ title: t('profile.reset'), text: t('profile.resetConfirm'), ok: t('profile.reset') }))) return;
  await resetAll();
  status.textContent = t('profile.resetDone');
  render();
});

await render();
