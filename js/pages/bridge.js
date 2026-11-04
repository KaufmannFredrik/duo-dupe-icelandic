// Norwegian bridge: the spelling patterns between Icelandic and Norwegian Bokmål, with every
// course word that has a Bokmål relative. Pick a pattern to see only its pairs.

import { ready } from '../app.js';
import { t } from '../i18n.js';
import { gloss, loadLexicon } from '../data.js';
import { RULES } from '../bridge-rules.js';
import { evidenceHTML, loadBridge, ordbokeneUrl, rulesHTML } from '../bridge.js';
import { icon } from '../shell.js';

await ready;
const [lexicon, bridge] = await Promise.all([loadLexicon(), loadBridge()]);
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const pairs = Object.entries(bridge.pairs)
  .map(([id, p]) => ({ id, ...p, lemma: lexicon.lemmas[id].lemma, rank: lexicon.lemmas[id].freq?.rank ?? 1e9 }))
  .sort((a, b) => a.rank - b.rank);
const listEl = document.querySelector('[data-pairs]');
const rulesEl = document.querySelector('[data-rules]');
let active = null;

const counts = new Map(RULES.map((r) => [r.id, pairs.filter((p) => p.rules?.includes(r.id)).length]));
rulesEl.innerHTML = RULES.filter((r) => counts.get(r.id) > 0)
  .map((r) => {
    const example = pairs.find((p) => p.rules?.includes(r.id) && p.evidence === 'old-norse') ?? pairs.find((p) => p.rules?.includes(r.id));
    return `<button type="button" class="chip" data-rule="${r.id}" aria-pressed="false"><span>${t(`bridge.rule.${r.id}`)}</span>
      <span class="muted bridge-example"><span lang="is">${esc(example.lemma)}</span> → <span lang="nb">${esc(example.nb)}</span></span><span class="count">${counts.get(r.id)}</span></button>`;
  })
  .join('');

function render() {
  const shown = active ? pairs.filter((p) => p.rules?.includes(active)) : pairs;
  document.querySelector('[data-pair-count]').textContent = t('bridge.count', { n: shown.length, total: pairs.length });
  listEl.innerHTML = shown
    .map(
      (p) => `<li class="bridge-pair">
        <p class="bridge-pair__words"><span lang="is" class="learn-text">${esc(p.lemma)}</span> <span aria-hidden="true">↔</span><span class="visually-hidden">${t('bridge.and')}</span> <span lang="nb" class="learn-text">${esc(p.nb)}</span>
          <span class="muted">${esc(gloss(p.id))}</span></p>
        <p class="bridge-pair__why">${evidenceHTML(p)}</p>
        <div class="cluster bridge-rules">${rulesHTML(p)}<a class="bridge-pair__link" href="${ordbokeneUrl(p)}" rel="noopener">${t('bridge.ordbokene')}${icon('external', 'icon icon--sm')}</a></div></li>`,
    )
    .join('');
}

rulesEl.addEventListener('click', (e) => {
  const b = e.target.closest('[data-rule]');
  if (!b) return;
  active = active === b.dataset.rule ? null : b.dataset.rule;
  for (const x of rulesEl.querySelectorAll('[data-rule]')) x.setAttribute('aria-pressed', String(x.dataset.rule === active));
  render();
});
render();
