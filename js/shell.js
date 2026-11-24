// The app shell shared by the main screens: navigation (tab bar, icon rail or labeled nav,
// depending on width), the top HUD, the desktop sidebar and the footer. Pages provide empty
// landmarks marked data-shell="nav|hud|side|footer"; this module fills them. Streak, XP, the
// daily goal and the mini heatmap come from the learner's own progress and update live. Tala's tip
// in the sidebar is a guidebook section of the learner's current unit, a different one each day
// (js/tips.js); the course data for it loads only when the sidebar is shown.

import { talaSVG } from './tala.js';
import { pick, t } from './i18n.js';
import { CASES, CASE_CLASS } from './grammar.js';
import { attempts, dailyGoal, loadProgress } from './progress.js';
import { MIN_ANSWERS, dayKey, heatCells, heatLevel, summarize } from './stats.js';
import { questsOf } from './quests.js';
import { questsHTML } from './ui/quests.js';
import { dailyTip, firstSentence } from './tips.js';

export const icon = (name, cls = 'icon') => `<svg class="${cls}" aria-hidden="true" focusable="false"><use href="assets/icons.svg#i-${name}"></use></svg>`;

const NAV = [
  { page: 'learn', href: 'learn.html', icon: 'learn', key: 'nav.learn' },
  { page: 'practice', href: 'practice.html', icon: 'practice', key: 'nav.practice' },
  { page: 'stories', href: 'stories.html', icon: 'stories', key: 'nav.stories' },
  { page: 'dictionary', href: 'dictionary.html', icon: 'dictionary', key: 'nav.dictionary' },
  { page: 'profile', href: 'profile.html', icon: 'profile', key: 'nav.profile' },
];
// Screens reached from a tab highlight that tab.
const PARENT = { declension: 'practice', bridge: 'practice', settings: 'profile', credits: 'profile', styleguide: 'profile' };

export function goalRing(done, goal, cls = '') {
  const r = 18;
  const c = 2 * Math.PI * r;
  const frac = Math.min(1, done / goal);
  return `<span class="goal-ring ${cls}" role="img" aria-label="${t('hud.goal', { done, goal })}">
    <svg viewBox="0 0 44 44" aria-hidden="true"><circle class="goal-ring__track" cx="22" cy="22" r="${r}" fill="none" stroke-width="5"/>
    <circle class="goal-ring__value" cx="22" cy="22" r="${r}" fill="none" stroke-width="5" stroke-dasharray="${(frac * c).toFixed(1)} ${c.toFixed(1)}"/></svg>
    <span class="goal-ring__text" aria-hidden="true">${done}</span></span>`;
}

function stat(kind, value, labelKey) {
  return `<span class="stat stat--${kind}">${icon(kind === 'streak' ? 'streak' : 'xp')}<span>${value}</span><span class="visually-hidden">${t(labelKey)}</span></span>`;
}

const goalText = (p) => (p.today >= p.goal ? t('side.goalDone') : t('side.goalText', { left: p.goal - p.today }));

function navHTML(current) {
  const active = PARENT[current] ?? current;
  const items = NAV.map(
    (n) => `<li><a class="nav-link" href="${n.href}"${n.page === active ? ' aria-current="page"' : ''}>${icon(n.icon)}<span>${t(n.key)}</span></a></li>`,
  ).join('');
  return `<a class="app-nav__brand logo" href="index.html" data-brand="wordmark">TÖLVA</a><ul class="app-nav__list" role="list">${items}</ul>`;
}

function hudHTML(p) {
  return `<a class="hud__home" href="index.html" aria-label="${t('hud.home')}">${talaSVG('happy', { crop: 'head', className: 'tala tala--mini' })}<span class="logo" data-brand="wordmark">TÖLVA</span></a>
    <div class="hud__stats">${stat('streak', p.streak, 'hud.streak')}${stat('xp', p.xp, 'hud.xp')}${goalRing(p.today, p.goal)}
    <button class="icon-button" type="button" data-sound-toggle aria-pressed="false" aria-label="${t('sound.turnOn')}">${icon('sound-off')}</button></div>`;
}

function miniHeat(cells) {
  const cell = (c, n) => {
    const x = cells.get(`${c}|${n}`);
    if (!x || x.total < MIN_ANSWERS) return `<span class="heat" data-level="none">-<span class="visually-hidden">${t('heat.none')}</span></span>`;
    const pct = Math.round((100 * x.right) / x.total);
    return `<span class="heat" data-level="${heatLevel(pct)}">${pct}%</span>`;
  };
  const rows = CASES.map((c) => `<span class="tag tag--${CASE_CLASS[c]}"><span class="tag__abbr">${c}</span></span>${cell(c, 'sg')}${cell(c, 'pl')}`).join('');
  return `<div class="mini-heat"><span></span><span class="muted">${t('number.sg')}</span><span class="muted">${t('number.pl')}</span>${rows}</div>`;
}

function sideHTML(p, cells, quests) {
  const any = [...cells.values()].some((x) => x.total >= MIN_ANSWERS);
  return `<div class="side-stats card card--quiet side-panel">
      <div>${stat('streak', p.streak, 'hud.streak')}<div class="stat__label">${t('side.streak')}</div></div>
      <div>${stat('xp', p.xp, 'hud.xp')}<div class="stat__label">${t('side.xp')}</div></div>
      <button class="icon-button" type="button" data-sound-toggle aria-pressed="false" aria-label="${t('sound.turnOn')}">${icon('sound-off')}</button>
    </div>
    <section class="card card--quiet side-panel" aria-labelledby="side-goal"><h2 id="side-goal">${t('side.goal')}</h2>
      <div class="goal-row">${goalRing(p.today, p.goal, 'goal-ring--lg')}<p>${goalText(p)}</p></div>
      ${p.freezes ? `<p class="muted side-freeze">${t('side.freezes', { n: p.freezes })}</p>` : ''}</section>
    <section class="card card--quiet side-panel" aria-labelledby="side-quests"><h2 id="side-quests">${t('quests.title')}</h2>${questsHTML(quests)}</section>
    <section class="card card--quiet side-panel" aria-labelledby="side-weak"><h2 id="side-weak">${t('side.weak')}</h2>
      ${any ? miniHeat(cells) : `<p class="muted">${t('side.weakEmpty')}</p>`}

      <a class="button button--sm button--block side-action" href="practice.html">${t('side.train')}</a></section>
    <section class="card card--magenta side-panel tip" aria-labelledby="side-tip">${talaSVG('thinking', { className: 'tala tala--sm' })}
      <div><h2 id="side-tip">${t('side.tip')}</h2><div data-side-tip><p>${t('tip.til')}</p></div></div></section>`;
}

function footerHTML() {
  return `<a href="credits.html">${t('footer.credits')}</a><a href="styleguide.html">${t('footer.styleguide')}</a><a href="settings.html">${t('nav.settings')}</a>
    <a href="https://github.com/KaufmannFredrik/duo-dupe-icelandic" rel="noopener">${t('footer.source')}</a><span>${t('footer.license')}</span>`;
}

function fill(name, markup) {
  const el = document.querySelector(`[data-shell="${name}"]`);
  if (el) el.innerHTML = markup;
}

async function stats() {
  const [progress, log] = await Promise.all([loadProgress(), attempts()]);
  const p = { ...summarize(progress, []), goal: dailyGoal() };
  return { p, cells: heatCells(log, (a) => `${a.case}|${a.number}`), quests: questsOf(progress, dayKey()) };
}

// A sidebar taller than the window scrolls with the page until its bottom reaches the window's
// bottom, then sticks there (top: window height minus its height), so nothing in it is out of reach.
function fitSide() {
  const side = document.querySelector('[data-shell="side"]');
  if (!side || getComputedStyle(side).display === 'none') return;
  side.classList.remove('app-side--long');
  const over = side.scrollHeight - window.innerHeight;
  side.classList.toggle('app-side--long', over > 0);
  side.style.setProperty('--side-top', `${Math.min(0, -over)}px`);
}
window.addEventListener('resize', fitSide);

// Guidebook prose: Icelandic is written {is:...}.
const escHTML = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const prose = (text) => escHTML(text).replace(/\{is:([^}]+)\}/g, (_, x) => `<span lang="is">${x}</span>`);

// The day's tip from the guidebook of the learner's current unit; the default tip stays otherwise.
async function fillTip() {
  const side = document.querySelector('[data-shell="side"]');
  const el = side?.querySelector('[data-side-tip]');
  if (!el || getComputedStyle(side).display === 'none') return;
  const [{ loadCourse, nextLesson }, progress] = await Promise.all([import('./course.js'), loadProgress()]);
  const course = await loadCourse();
  const tip = dailyTip(course, nextLesson(course, progress).unit.id, dayKey());
  if (!tip || !el.isConnected) return;
  el.innerHTML = `<p><strong>${escHTML(pick(tip.section.title))}</strong></p><p>${prose(firstSentence(pick(tip.section.text)))}</p>
    <p><a href="guide.html?unit=${tip.unit.id}#g-${tip.index}">${t('side.tipMore')}</a></p>`;
  fitSide();
}

async function renderStats() {
  const { p, cells, quests } = await stats();
  fill('hud', hudHTML(p));
  if (document.querySelector('[data-shell="side"]')) {
    fill('side', sideHTML(p, cells, quests));
    fitSide();
    fillTip();
  }
  window.dispatchEvent(new CustomEvent('tolva:shell'));
}

export async function renderShell(page) {
  fill('nav', navHTML(page));
  fill('footer', footerHTML());
  await renderStats();
  window.addEventListener('tolva:progress', renderStats);
  window.addEventListener('tolva:settings', (e) => {
    if (e.detail?.key === 'goal' || !e.detail?.key) renderStats();
  });
}
