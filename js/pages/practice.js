// Practice hub: replay mistakes, review due cards, the case trainer, the letters drill, and the
// weak-spots heatmap of accuracy by case, number and gender, computed from your own answers.

import { ready } from '../app.js';
import { t } from '../i18n.js';
import { CASES } from '../grammar.js';
import { attempts, cards, loadProgress, mistakes } from '../progress.js';
import { questsOf } from '../quests.js';
import { questsHTML } from '../ui/quests.js';
import { dayKey } from '../stats.js';
import { dueCards } from '../srs.js';
import { loadLexicon } from '../data.js';
import { caseTag } from '../ui/forms.js';
import { getSettings } from '../store.js';
import { speechSupport } from '../speech.js';
import { MIN_ANSWERS, heatCells, heatLevel as level } from '../stats.js';

await ready;
// The speaking card appears only when it is turned on in Settings and the browser can recognize speech.
if (getSettings().speaking) speechSupport().then((support) => (document.querySelector('[data-speak-card]').hidden = support === 'none'));
const [lexicon, all, list, mistakeList] = await Promise.all([loadLexicon(), attempts(), cards(), mistakes()]);

const count = (sel, n) => {
  const el = document.querySelector(sel);
  if (el) el.textContent = String(n);
};
count('[data-count="mistakes"]', mistakeList.length);
count('[data-count="review"]', dueCards(list).length);

// Today's quests, redrawn when progress changes.
const renderQuests = async () => {
  document.querySelector('[data-quests]').innerHTML = questsHTML(questsOf(await loadProgress(), dayKey()));
};
await renderQuests();
window.addEventListener('tolva:progress', renderQuests);

const GENDERS = ['kk', 'kvk', 'hk'];
const cells = heatCells(all, (a) => {
  const g = (a.gender ?? '').toLowerCase();
  return GENDERS.includes(g) ? `${a.case}|${a.number}|${g}` : null;
});

const map = document.querySelector('[data-heatmap]');
const ranked = [];
map.innerHTML = ['sg', 'pl']
  .map((n) => {
    const head = `<div class="heatmap__group">${t(`number.${n}`)}</div><span class="heatmap__corner"></span>${GENDERS.map((g) => `<span class="heatmap__col">${t(`gender.${g}.short`)}</span>`).join('')}`;
    const rows = CASES.map((c) => {
      const row = GENDERS.map((g) => {
        const cell = cells.get(`${c}|${n}|${g}`);
        if (!cell || cell.total < MIN_ANSWERS) return `<span class="heat" data-level="none">-<small>${t('heat.none')}</small></span>`;
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
