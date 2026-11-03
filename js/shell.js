// The app shell shared by the main screens: navigation (tab bar, icon rail or labeled nav,
// depending on width), the top HUD, the desktop sidebar and the footer. Pages provide empty
// landmarks marked data-shell="nav|hud|side|footer"; this module fills them.

import { talaSVG } from './tala.js';
import { getProgress } from './store.js';
import { t } from './i18n.js';

export const icon = (name, cls = 'icon') => `<svg class="${cls}" aria-hidden="true" focusable="false"><use href="assets/icons.svg#i-${name}"></use></svg>`;

const NAV = [
  { page: 'learn', href: 'learn.html', icon: 'learn', key: 'nav.learn' },
  { page: 'practice', href: 'practice.html', icon: 'practice', key: 'nav.practice' },
  { page: 'stories', href: 'stories.html', icon: 'stories', key: 'nav.stories' },
  { page: 'dictionary', href: 'dictionary.html', icon: 'dictionary', key: 'nav.dictionary' },
  { page: 'profile', href: 'profile.html', icon: 'profile', key: 'nav.profile' },
];
// Screens reached from a tab highlight that tab.
const PARENT = { declension: 'practice', settings: 'profile', credits: 'profile', styleguide: 'profile' };

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

function sideHTML(p) {
  const cell = (pct) => `<span class="heat" data-level="${pct >= 85 ? 'strong' : pct >= 65 ? 'ok' : 'weak'}">${pct}%</span>`;
  const rows = [
    ['nf', 'NF', 96, 88],
    ['thf', 'ÞF', 84, 70],
    ['thgf', 'ÞGF', 71, 52],
    ['ef', 'EF', 63, 45],
  ]
    .map(([cls, abbr, sg, pl]) => `<span class="tag tag--${cls}"><span class="tag__abbr">${abbr}</span></span>${cell(sg)}${cell(pl)}`)
    .join('');
  return `<div class="side-stats card card--quiet side-panel">
      <div>${stat('streak', p.streak, 'hud.streak')}<div class="stat__label">${t('side.streak')}</div></div>
      <div>${stat('xp', p.xp, 'hud.xp')}<div class="stat__label">${t('side.xp')}</div></div>
      <button class="icon-button" type="button" data-sound-toggle aria-pressed="false" aria-label="${t('sound.turnOn')}">${icon('sound-off')}</button>
    </div>
    <section class="card card--quiet side-panel" aria-labelledby="side-goal"><h2 id="side-goal">${t('side.goal')}</h2>
      <div class="goal-row">${goalRing(p.today, p.goal, 'goal-ring--lg')}<p>${t('side.goalText', { left: p.goal - p.today })}</p></div></section>
    <section class="card card--quiet side-panel" aria-labelledby="side-weak"><h2 id="side-weak">${t('side.weak')} <span class="tag tag--demo">${t('demo.tag')}</span></h2>
      <div class="mini-heat"><span></span><span class="muted">${t('number.sg')}</span><span class="muted">${t('number.pl')}</span>${rows}</div>

      <a class="button button--sm button--block side-action" href="practice.html">${t('side.train')}</a></section>
    <section class="card card--magenta side-panel tip" aria-labelledby="side-tip">${talaSVG('thinking', { className: 'tala tala--sm' })}
      <div><h2 id="side-tip">${t('side.tip')}</h2><p>${t('tip.til')}</p></div></section>`;
}

function footerHTML() {
  return `<a href="credits.html">${t('footer.credits')}</a><a href="styleguide.html">${t('footer.styleguide')}</a><a href="settings.html">${t('nav.settings')}</a>
    <a href="https://github.com/KaufmannFredrik/duo-dupe-icelandic" rel="noopener">${t('footer.source')}</a><span>${t('footer.license')}</span>`;
}

export function renderShell(page) {
  const p = getProgress();
  const fill = (name, markup) => {
    const el = document.querySelector(`[data-shell="${name}"]`);
    if (el) el.innerHTML = markup;
  };
  fill('nav', navHTML(page));
  fill('hud', hudHTML(p));
  fill('side', sideHTML(p));
  fill('footer', footerHTML());
}
