// Dictionary: search any course word by its dictionary form or any inflected form, then see
// glosses (English and Norwegian), IPA, recordings, the paradigm, example sentences and etymology.

import { ready } from '../app.js';
import { t } from '../i18n.js';
import { analyze, formIndex, gloss, lemma, loadAll, loadLexicon, recordings, sentence, translation } from '../data.js';
import { normalize, stripAcutes } from '../normalize.js';
import { play } from '../audio.js';
import { icon } from '../shell.js';
import { charRow } from '../ui/charrow.js';
import { classLabel, describe, genderLabel } from '../ui/forms.js';
import { renderTable } from '../ui/table.js';

await ready;
await loadAll();
const lexicon = await loadLexicon();
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const form = document.querySelector('[data-search]');
const input = form.querySelector('input');
const results = document.querySelector('[data-results]');
const detail = document.querySelector('[data-entry]');
form.after(charRow(input));

const fold = (s) => stripAcutes(normalize(s));
const forms = [...formIndex()];

function search(q) {
  const key = fold(q);
  if (!key) return lexicon.themes.flatMap((th) => th.lemmas).slice(0, 12);
  const hits = new Set();
  for (const a of analyze(q)) hits.add(a.id);
  for (const [f, ids] of forms) if (fold(f).startsWith(key)) for (const x of ids) hits.add(x);
  return [...hits].sort((a, b) => (lemma(a).freq?.rank ?? 1e9) - (lemma(b).freq?.rank ?? 1e9)).slice(0, 20);
}

function renderResults(list, q) {
  const match = analyze(q).filter((a) => a.tag);
  results.innerHTML = list.length
    ? list
        .map((wid) => {
          const l = lemma(wid);
          const hit = match.find((a) => a.id === wid && normalize(q) !== normalize(l.lemma));
          return `<li><button type="button" class="card card--quiet result" data-lemma="${wid}" aria-current="${wid === detail.dataset.lemma}">
            <span class="result__lemma" lang="is">${esc(l.lemma)}</span>
            <span class="result__tags">${l.kyn ? `<span class="tag tag--gender">${genderLabel(l.kyn)}</span>` : ''}<span class="tag tag--pos">${esc(classLabel(l.ofl))}</span></span>
            <span class="result__gloss">${esc(gloss(wid))}</span>
            ${hit ? `<span class="result__form"><span lang="is">${esc(q)}</span>: ${esc(describe(hit.tag, { ofl: l.ofl }))}</span>` : ''}</button></li>`;
        })
        .join('')
    : `<li class="muted">${t('dict.none', { q: esc(q) })}</li>`;
}

function renderEntry(wid) {
  const l = lemma(wid);
  const recs = recordings(wid);
  const rec = recs[0];
  detail.dataset.lemma = wid;
  const examples = l.sentences.filter((sid) => sentence(sid)).slice(0, 4);
  detail.innerHTML = `<header class="entry__head"><h2 class="entry__lemma" lang="is">${esc(l.lemma)}</h2>
      ${l.kyn ? `<span class="tag tag--gender">${genderLabel(l.kyn)}</span>` : ''}<span class="tag tag--pos">${esc(classLabel(l.ofl))}</span>
      ${l.ipa.length ? `<span class="entry__ipa">${l.ipa.map(esc).join(' ')}</span>` : ''}
      <button type="button" class="icon-button icon-button--outline" data-play="${esc(l.lemma)}" ${rec ? `data-url="${esc(rec.mp3 ?? rec.ogg)}"` : ''} aria-label="${t('audio.playWord', { word: esc(l.lemma) })}">${icon('play')}</button></header>
    ${rec ? `<p class="credit">${t('audio.recordedBy', { name: esc(rec.speaker ?? '?') })}, <a href="${esc(rec.page)}" rel="noopener">${esc(rec.license)}</a>${recs.length > 1 ? ` · ${t('dict.moreRecordings', { n: recs.length - 1 })}` : ''}</p>` : ''}
    <section aria-labelledby="dict-meaning"><h3 class="label" id="dict-meaning">${t('dict.meaning')}</h3>
      <ol lang="en">${l.en.map((g) => `<li>${esc(g)}</li>`).join('')}</ol>
      ${l.nb.length ? `<p>${t('dict.norwegian')}: <span lang="nb">${l.nb.map(esc).join(', ')}</span></p>` : ''}</section>
    <section aria-labelledby="dict-forms"><h3 class="label" id="dict-forms">${t('dict.forms')}</h3>
      ${renderTable(wid, { compact: true }) || `<p class="muted">${t('dict.noForms')}</p>`}
      <p><a class="button button--sm" href="declension.html?lemma=${encodeURIComponent(l.lemma)}">${icon('table')}<span>${t('dict.fullTable')}</span></a></p></section>
    <section aria-labelledby="dict-examples"><h3 class="label" id="dict-examples">${t('dict.examples')}</h3>
      ${
        examples.length
          ? `<ul class="examples">${examples
              .map((sid) => {
                const s = sentence(sid);
                const tr = translation(sid);
                return `<li class="example"><span lang="is">${esc(s.is)}</span><small lang="${tr.lang}">${esc(tr.text)}</small><small><a href="https://tatoeba.org/en/sentences/show/${sid}" rel="noopener">Tatoeba #${sid}</a>, ${esc(s.author ?? t('credit.unknownAuthor'))}</small></li>`;
              })
              .join('')}</ul>`
          : `<p class="muted">${t('dict.noExamples')}</p>`
      }</section>
    ${l.etymology ? `<section aria-labelledby="dict-etym"><h3 class="label" id="dict-etym">${t('dict.etymology')}</h3><p lang="en">${esc(l.etymology)}</p></section>` : ''}
    <p class="credit">${t('credit.dict', { url: `https://en.wiktionary.org/wiki/${encodeURIComponent(l.lemma)}#Icelandic` })}</p>`;
}

const params = new URLSearchParams(location.search);
input.value = params.get('q') ?? '';
const start = search(input.value);
renderEntry(params.get('lemma') && lemma(params.get('lemma')) ? params.get('lemma') : start[0]);
renderResults(start, input.value);

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const list = search(input.value);
  if (list[0]) renderEntry(list[0]);
  renderResults(list, input.value);
});
input.addEventListener('input', () => renderResults(search(input.value), input.value));
document.addEventListener('click', (e) => {
  const r = e.target.closest('[data-lemma]');
  if (r) {
    renderEntry(r.dataset.lemma);
    renderResults(search(input.value), input.value);
    const h = detail.querySelector('h2');
    h.setAttribute('tabindex', '-1');
    h.focus({ preventScroll: true });
    if (!window.matchMedia('(min-width: 900px)').matches) detail.scrollIntoView({ block: 'start' });
  }
  const b = e.target.closest('[data-play]');
  if (b) play({ text: b.dataset.play, url: b.dataset.url });
});
