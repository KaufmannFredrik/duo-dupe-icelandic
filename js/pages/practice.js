// Practice hub: replay mistakes, review due cards, the case trainer, the letters drill, and the
// weak-spots heatmap of accuracy by case, number and gender, computed from your own answers.

import { ready } from '../app.js';
import { t } from '../i18n.js';
import { CASES } from '../grammar.js';
import { attempts, cards, mistakes } from '../progress.js';
import { dueCards } from '../srs.js';
import { loadLexicon } from '../data.js';
import { caseTag } from '../ui/forms.js';

await ready;
const [lexicon, all, list, mistakeList] = await Promise.all([loadLexicon(), attempts(), cards(), mistakes()]);

const count = (sel, n) => {
  const el = document.querySelector(sel);
  if (el) el.textContent = String(n);
};
count('[data-count="mistakes"]', mistakeList.length);
count('[data-count="review"]', dueCards(list).length);

const GENDERS = ['kk', 'kvk', 'hk'];
const MIN = 3;
const level = (pct) => (pct >= 85 ? 'strong' : pct >= 65 ? 'ok' : 'weak');
const cells = new Map();
for (const a of all) {
  if (!a.case || !a.number) continue;
  const g = (a.gender ?? '').toLowerCase();
  if (!GENDERS.includes(g)) continue;
  const key = `${a.case}|${a.number}|${g}`;
  const c = cells.get(key) ?? { right: 0, total: 0, lemmas: new Map() };
  c.total++;
  if (a.result !== 'wrong') c.right++;
  else {
    const id = a.key.split('|')[0];
    c.lemmas.set(id, (c.lemmas.get(id) ?? 0) + 1);
  }
  cells.set(key, c);
}

const map = document.querySelector('[data-heatmap]');
const ranked = [];
map.innerHTML = ['sg', 'pl']
  .map((n) => {
    const head = `<div class="heatmap__group">${t(`number.${n}`)}</div><span class="heatmap__corner"></span>${GENDERS.map((g) => `<span class="heatmap__col">${t(`gender.${g}.short`)}</span>`).join('')}`;
    const rows = CASES.map((c) => {
      const row = GENDERS.map((g) => {
        const cell = cells.get(`${c}|${n}|${g}`);
        if (!cell || cell.total < MIN) return `<span class="heat" data-level="none">-<small>${t('heat.none')}</small></span>`;
        const pct = Math.round((100 * cell.right) / cell.total);
        ranked.push({ c, n, g, pct, lemmas: cell.lemmas });
        return `<span class="heat" data-level="${level(pct)}">${pct}%<small>${t(`heat.${level(pct)}`)}</small></span>`;
      }).join('');
      return `<span class="heatmap__row">${caseTag(c, { full: false })}</span>${row}`;
    }).join('');
    return head + rows;
  })
  .join('');

const worst = ranked.filter((x) => x.pct < 85).sort((a, b) => a.pct - b.pct).slice(0, 3);
const train = document.querySelector('[data-train]');
document.querySelector('[data-heat-empty]').hidden = ranked.length > 0;
train.innerHTML = worst
  .map(({ c, n, g, pct, lemmas }) => {
    const missed = [...lemmas].sort((a, b) => b[1] - a[1])[0]?.[0];
    const href = missed ? `declension.html?lemma=${encodeURIComponent(lexicon.lemmas[missed].lemma)}` : 'declension.html';
    return `<li><span>${caseTag(c)} ${t(`form.${n}`)}, ${t(`gender.${g}`)}: <strong>${pct}%</strong></span>
      <a class="button button--sm" href="${href}">${t('practice.trainThis')}</a></li>`;
  })
  .join('');
