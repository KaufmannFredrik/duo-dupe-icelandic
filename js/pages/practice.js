// Practice hub: weak-spots heatmap (case x number x gender) and "train this" shortcuts.
// Phase 1 shows demo numbers; Phase 5 computes them from the form-level SRS history.

import { ready } from '../app.js';
import { t } from '../i18n.js';
import { CASES, caseTag } from '../lexicon.js';

await ready;

const GENDERS = ['kk', 'kvk', 'hk'];
const BASE = { NF: 94, ÞF: 82, ÞGF: 66, EF: 60 };
const GENDER_OFFSET = { kk: 0, kvk: -7, hk: 3 };
const demo = (c, n, g) => Math.max(30, Math.min(99, BASE[c] - (n === 'pl' ? 12 : 0) + GENDER_OFFSET[g]));
const level = (pct) => (pct >= 85 ? 'strong' : pct >= 65 ? 'ok' : 'weak');

const map = document.querySelector('[data-heatmap]');
let cells = [];
map.innerHTML = ['sg', 'pl']
  .map((n) => {
    const head = `<div class="heatmap__group">${t(`number.${n}`)}</div><span class="heatmap__corner"></span>${GENDERS.map((g) => `<span class="heatmap__col">${t(`gender.${g}.short`)}</span>`).join('')}`;
    const rows = CASES.map((c) => {
      const row = GENDERS.map((g) => {
        const pct = demo(c.id, n, g);
        cells.push({ c, n, g, pct });
        return `<span class="heat" data-level="${level(pct)}">${pct}%<small>${t(`heat.${level(pct)}`)}</small></span>`;
      }).join('');
      return `<span class="heatmap__row">${caseTag(c.id, { full: false })}</span>${row}`;
    }).join('');
    return head + rows;
  })
  .join('');

cells = cells.sort((a, b) => a.pct - b.pct).slice(0, 3);
document.querySelector('[data-train]').innerHTML = cells
  .map(
    ({ c, n, g, pct }) => `<li><span>${caseTag(c.id)} ${t(`form.${n}`)}, ${t(`gender.${g}`)}: <strong>${pct}%</strong></span>
      <a class="button button--sm" href="declension.html?lemma=${g === 'kvk' ? 'b%C3%B3k' : 'hestur'}">${t('practice.trainThis')}</a></li>`,
  )
  .join('');
