// Learn path: every unit as a winding road of lesson nodes. States come from progress:
// done, current (pulsing, "Start"), review (gold, after the unit's lessons) and locked.
// Until the learner has chosen a generated voice, a card at the top asks them to.

import { ready } from '../app.js';
import { pick, t } from '../i18n.js';
import { loadCourse, lessonStates } from '../course.js';
import { loadProgress } from '../progress.js';
import { icon } from '../shell.js';
import { getSettings } from '../store.js';
import { TTS_VOICES } from '../audio.js';
import { voicePicker } from '../ui/voice-picker.js';

await ready;
const [course, progress] = await Promise.all([loadCourse(), loadProgress()]);
const states = lessonStates(course, progress);
const root = document.querySelector('[data-path]');

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const OFFSETS = [0, 0.9, 1.3, 0.9, 0, -0.9, -1.3, -0.9];
const ICONS = { done: 'check', current: 'star', review: 'review', locked: 'lock' };
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

const placementLink = Object.keys(progress.lessons).length === 0 && !progress.skippedUnits.length
  ? `<p class="card card--gold placement-hint"><span>${t('learn.placementHint')}</span> <a class="button button--sm" href="lesson.html?mode=placement">${t('landing.placement')}</a></p>`
  : '';

const voiceCard = getSettings().ttsVoice
  ? ''
  : `<section class="card card--gold stack voice-intro" aria-labelledby="voice-intro-title">
      <h2 class="card__title" id="voice-intro-title">${t('learn.voiceTitle')}</h2>
      <p>${t('learn.voiceText')}</p>
      <div data-voice-picker></div>
      <p class="muted" role="status" data-voice-saved></p>
    </section>`;

root.innerHTML =
  voiceCard +
  placementLink +
  course.units
    .map(
      (u) => `<section class="unit" aria-labelledby="unit-${u.id}">
      <div class="unit-banner">
        <div><span class="unit-banner__eyebrow">${t('learn.unit', { n: u.order })}${u.auto ? ` · ${t('learn.preview')}` : ''}</span>
          <h2 class="unit-banner__title" id="unit-${u.id}">${esc(pick(u.title))} <span class="unit-banner__is" lang="is">${esc(u.is)}</span></h2>
          ${u.goal ? `<p class="muted">${esc(pick(u.goal))}</p>` : ''}</div>
        ${u.guide ? `<a class="button button--sm" href="guide.html?unit=${u.id}">${icon('guide')}<span>${t('learn.guidebook')}</span></a>` : ''}
      </div>
      <div class="path-wrap"><svg class="path__road" aria-hidden="true" focusable="false"></svg>
        <ol class="path" role="list">${u.lessons.map((l, i) => node(u, l, i)).join('')}</ol></div>
    </section>`,
    )
    .join('');

const pickerEl = root.querySelector('[data-voice-picker]');
if (pickerEl) {
  voicePicker(pickerEl, {
    legend: t('learn.voiceLegend'),
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
