// Learn path: every unit as a winding road of lesson nodes. States come from progress:
// done, current (pulsing, "Start"), review (gold, after the unit's lessons) and locked.
// Until the learner has chosen a generated voice, a card at the top asks them to, with buttons to
// start (and on a first visit, to take the placement test). Each unit's host
// (js/characters.js) greets the learner under its banner with a Tatoeba sentence; the host of a
// unit that is still locked shows as a silhouette.

import { ready } from '../app.js';
import { pick, t } from '../i18n.js';
import { loadCourse, lessonStates, unitDone, unitLabel } from '../course.js';
import { loadProgress, recordUnits } from '../progress.js';
import { icon } from '../shell.js';
import { getSettings } from '../store.js';
import { TTS_VOICES, play, ttsCredit } from '../audio.js';
import { voicePicker } from '../ui/voice-picker.js';
import { changedNote, loadSentences, sentence, tatoebaLink, translation } from '../data.js';
import { hostOf } from '../characters.js';
import { characterImg } from '../ui/character.js';

await ready;
const course = await loadCourse();
// Progress from before units were recorded as finished: record them now, before the path changes.
await recordUnits(course);
const [progress] = await Promise.all([loadProgress(), loadSentences()]);
const states = lessonStates(course, progress);
const root = document.querySelector('[data-path]');

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const OFFSETS = [0, 0.9, 1.3, 0.9, 0, -0.9, -1.3, -0.9];
const ICONS = { done: 'check', current: 'star', review: 'review', new: 'star', locked: 'lock' };
const lessonTitle = (l) => (l.title ? pick(l.title) : l.review ? t('learn.review') : t('learn.lessonN', { n: l.index + 1 }));

function node(unit, lesson, i) {
  const state = states.get(lesson.key);
  const title = lessonTitle(lesson);
  const label = t('learn.node', { n: i + 1, title, state: t(`learn.state.${state}`) });
  const inner = icon(ICONS[state]);
  const href = `lesson.html?unit=${unit.id}&lesson=${lesson.id}`;
  const el =
    state === 'locked'
      ? `<span class="node node--locked" role="img" aria-label="${esc(label)}">${inner}</span>`
      : `<a class="node node--${state}" href="${href}" aria-label="${esc(label)}">${state === 'current' ? `<span class="node__start" aria-hidden="true">${t('learn.start')}</span>` : ''}${inner}</a>`;
  const x = OFFSETS[i % OFFSETS.length];
  return `<li class="path__item" style="--x: ${x}; --ax: ${Math.abs(x)}">${el}<span class="path__label" aria-hidden="true">${esc(title)}</span></li>`;
}

// The host under a unit's banner. Only the host of the unit in progress moves; the others are still.
const unitOpen = (u) => u.lessons.some((l) => states.get(l.key) !== 'locked');
function hostHTML(u) {
  const host = hostOf(u);
  if (!host) return '';
  if (!unitOpen(u)) {
    return `<div class="host host--unmet">${characterImg(host.id, { size: 64, still: true, label: '', className: 'host__pic' })}<p class="host__bubble">${t('learn.hostUnmet')}</p></div>`;
  }
  const s = sentence(u.host.says);
  const tr = translation(u.host.says);
  const moving = u.lessons.some((l) => states.get(l.key) === 'current');
  return `<div class="host">${characterImg(host.id, { size: 72, still: !moving, label: '', className: 'host__pic' })}
      <div class="host__bubble"><p class="host__name">${esc(host.name)} <span class="host__kind">${esc(pick(host.kind))}</span></p>
        ${s ? `<p class="host__says"><button type="button" class="icon-button" data-play="${esc(s.is)}" aria-label="${t('audio.playSentence')}">${icon('play')}</button><span lang="is" class="learn-text">${esc(s.is)}</span></p>
        <p class="muted" lang="${tr.lang}">${esc(tr.text)}</p>` : ''}</div></div>`;
}
const greetings = course.units.filter((u) => hostOf(u) && unitOpen(u) && sentence(u.host.says)).map((u) => u.host.says);
const greetingCredit = greetings.length
  ? `<p class="credit learn-credit">${t('learn.hostCredit', { list: greetings.map((sid) => `${tatoebaLink(sid)} (${esc(sentence(sid).author ?? t('credit.unknownAuthor'))}${changedNote(sid)})`).join(', ') })} <span data-voice-credit></span></p>`
  : '';

// A first visit: no course lesson done and no units skipped (practice rounds, such as the letters,
// do not count).
const fresh = !Object.keys(progress.lessons).some((k) => !k.startsWith('practice/')) && !progress.skippedUnits.length;
const choosing = !getSettings().ttsVoice;
// Letters and sounds, offered at the start until the learner has done a round of them or a lesson;
// never required.
const lettersOffer = fresh && !progress.lessons['practice/alphabet']
  ? `<p class="letters-offer">${icon('letters')}<span>${t('learn.lettersOffer')} <a href="letters.html">${t('learn.lettersLink')}</a></span></p>`
  : '';
const placementLink = fresh && !choosing
  ? `<p class="card card--gold placement-hint"><span>${t('learn.placementHint')}</span> <a class="button button--sm" href="lesson.html?mode=placement">${t('landing.placement')}</a></p>${lettersOffer}`
  : '';

// Until a voice is chosen, one card at the top: the voices, and buttons to start the current
// lesson and (on a first visit) the placement test, so a phone shows a way to start without
// scrolling past the first unit's banner and host.
const current = course.units.flatMap((u) => u.lessons.map((l) => [u, l])).find(([, l]) => states.get(l.key) === 'current');
const voiceCard = choosing
  ? `<section class="card card--gold stack voice-intro" aria-labelledby="voice-intro-title">
      <h2 class="card__title" id="voice-intro-title">${t('learn.voiceTitle')}</h2>
      <p>${t('learn.voiceText')}</p>
      <div data-voice-picker></div>
      <p class="muted" role="status" data-voice-saved></p>
      ${current ? `<div class="cluster voice-intro__actions"><a class="button button-primary" href="lesson.html?unit=${current[0].id}&lesson=${current[1].id}">${t(fresh ? 'learn.startFirst' : 'lesson.continue')}</a>
        ${fresh ? `<a class="button" href="lesson.html?mode=placement">${t('landing.placement')}</a>` : ''}</div>` : ''}
      ${lettersOffer}
    </section>`
  : '';

const unitHTML = (u) => `<section class="unit" aria-labelledby="unit-${u.id}">
      <div class="unit-banner">
        <div><span class="unit-banner__eyebrow">${unitLabel(u, t)}${u.auto ? ` · ${t('learn.preview')}` : ''}</span>
          <h3 class="unit-banner__title" id="unit-${u.id}">${esc(pick(u.title))} <span class="unit-banner__is" lang="is">${esc(u.is)}</span></h3>
          ${u.goal ? `<p class="muted">${esc(pick(u.goal))}</p>` : ''}</div>
        ${u.guide ? `<a class="button button--sm" href="guide.html?unit=${u.id}">${icon('guide')}<span>${t('learn.guidebook')}</span></a>` : ''}
      </div>
      ${hostHTML(u)}
      <div class="path-wrap"><svg class="path__road" aria-hidden="true" focusable="false"></svg>
        <ol class="path" role="list">${u.lessons.map((l, i) => node(u, l, i)).join('')}</ol></div>
    </section>`;

// The path in sections (A1, A2, a bonus), each with its level, goal and progress; a section with
// no units yet is not shown.
const shown = course.sections.filter((s) => s.units.length);
const sectionHTML = (s, n) => {
  const done = s.units.filter((u) => unitDone(u, progress)).length;
  const title = s.bonus ? pick(s.title) : t('learn.section', { n, title: pick(s.title) });
  return `<section class="path-section" aria-labelledby="section-${s.id}">
      <header class="section-banner">
        <span class="section-banner__level" aria-hidden="true">${esc(s.level ?? '+')}</span>
        <div><h2 class="section-banner__title" id="section-${s.id}">${esc(title)}${s.level ? ` <span class="visually-hidden">(${esc(s.level)})</span>` : ''}</h2>
          ${s.goal ? `<p class="muted">${esc(pick(s.goal))}</p>` : ''}
          <p class="section-banner__progress">${t('learn.sectionProgress', { done, total: s.units.length })}</p></div>
      </header>
      ${s.units.map(unitHTML).join('')}
    </section>`;
};

root.innerHTML = voiceCard + placementLink + shown.map((s, i) => sectionHTML(s, i + 1)).join('') + greetingCredit;

root.addEventListener('click', (e) => {
  const b = e.target.closest('[data-play]');
  if (b) play({ text: b.dataset.play });
});
if (greetingCredit) ttsCredit().then((c) => (root.querySelector('[data-voice-credit]').textContent = c));

const pickerEl = root.querySelector('[data-voice-picker]');
if (pickerEl) {
  voicePicker(pickerEl, {
    legend: t('learn.voiceLegend'),
    compact: true,
    onChoose: (v) => {
      root.querySelector('[data-voice-saved]').textContent = t('learn.voiceSaved', { name: TTS_VOICES[v].name });
    },
  });
}

// The road: a smooth neon curve through the node centers, redrawn when the layout changes.
function drawRoads() {
  for (const wrap of root.querySelectorAll('.path-wrap')) {
    const box = wrap.getBoundingClientRect();
    const pts = [...wrap.querySelectorAll('.node')].map((n) => {
      const r = n.getBoundingClientRect();
      return [r.left + r.width / 2 - box.left, r.top + r.height / 2 - box.top];
    });
    if (!pts.length) continue;
    let d = `M${pts[0][0]} ${pts[0][1]}`;
    for (let k = 1; k < pts.length; k++) {
      const [x0, y0] = pts[k - 1];
      const [x1, y1] = pts[k];
      const my = (y0 + y1) / 2;
      d += ` C${x0} ${my} ${x1} ${my} ${x1} ${y1}`;
    }
    const svg = wrap.querySelector('.path__road');
    svg.setAttribute('viewBox', `0 0 ${box.width} ${box.height}`);
    svg.innerHTML = `<path d="${d}" fill="none" stroke="#FF10F0" stroke-opacity="0.25" stroke-width="14"/><path d="${d}" fill="none" stroke="#FF10F0" stroke-width="3" stroke-dasharray="10 8"/>`;
  }
}
new ResizeObserver(drawRoads).observe(root);
drawRoads();

// Bring the current lesson into view, unless the voice card at the top still waits for a choice.
if (!pickerEl) document.querySelector('.node--current')?.closest('.unit')?.scrollIntoView({ block: 'start' });
