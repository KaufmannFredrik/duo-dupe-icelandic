// Learn path: units as a winding road of lesson nodes (done, current, review, locked).
// Phase 1 reads content/demo/path.json; Phase 3 builds the path from content/units/.

import { loadJSON, ready } from '../app.js';
import { pick, t } from '../i18n.js';
import { icon } from '../shell.js';
import { toast } from '../ui/toast.js';

await ready;
const path = await loadJSON('content/demo/path.json');
const root = document.querySelector('[data-path]');

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const OFFSETS = [0, 0.9, 1.3, 0.9, 0, -0.9, -1.3, -0.9];
const ICONS = { done: 'check', current: 'star', review: 'review', locked: 'lock' };

function node(lesson, i) {
  const { state } = lesson;
  const title = pick(lesson.title);
  const label = t('learn.node', { n: i + 1, title, state: t(`learn.state.${state}`) });
  const inner = icon(ICONS[state]);
  const el =
    state === 'locked'
      ? `<span class="node node--locked" role="img" aria-label="${esc(label)}">${inner}</span>`
      : `<a class="node node--${state}" href="lesson.html" aria-label="${esc(label)}">${state === 'current' ? `<span class="node__start" aria-hidden="true">${t('learn.start')}</span>` : ''}${inner}</a>`;
  return `<li class="path__item" style="--x: ${OFFSETS[i % OFFSETS.length]}">${el}<span class="path__label" aria-hidden="true">${esc(title)}</span></li>`;
}

root.innerHTML = path.units
  .map(
    (u) => `<section class="unit" aria-labelledby="unit-${u.id}">
      <div class="unit-banner">
        <div><span class="unit-banner__eyebrow">${t('learn.unit', { n: u.id })}</span>
          <h2 class="unit-banner__title" id="unit-${u.id}">${esc(pick(u.title))} <span class="unit-banner__is" lang="is">${esc(u.is)}</span></h2>
          <p class="muted">${esc(pick(u.goal))}</p></div>
        <button type="button" class="button button--sm" data-guide>${icon('guide')}<span>${t('learn.guidebook')}</span></button>
      </div>
      <div class="path-wrap"><svg class="path__road" aria-hidden="true" focusable="false"></svg>
        <ol class="path" role="list">${u.lessons.map(node).join('')}</ol></div>
    </section>`,
  )
  .join('');

// The road: a smooth neon curve through the node centers, redrawn when the layout changes.
function drawRoads() {
  for (const wrap of root.querySelectorAll('.path-wrap')) {
    const box = wrap.getBoundingClientRect();
    const pts = [...wrap.querySelectorAll('.node')].map((n) => {
      const r = n.getBoundingClientRect();
      return [r.left + r.width / 2 - box.left, r.top + r.height / 2 - box.top];
    });
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

root.addEventListener('click', (e) => {
  if (e.target.closest('[data-guide]')) toast(t('learn.guideSoon'));
});
