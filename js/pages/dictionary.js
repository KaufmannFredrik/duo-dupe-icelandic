// Dictionary: search a word or any inflected form, then see glosses, IPA, audio, forms,
// example sentences and etymology. Phase 1 searches the demo lexicon; Phase 4 the full data.

import { ready } from '../app.js';
import { t } from '../i18n.js';
import { CASES, analyses, caseTag, entry, genderKey, glosses, ipa, loadLexicon, paradigm, parseNounTag, recording } from '../lexicon.js';
import { normalize, stripAcutes, words } from '../normalize.js';
import { play } from '../audio.js';
import { icon } from '../shell.js';
import { charRow } from '../ui/charrow.js';

await ready;
const lexicon = await loadLexicon();
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const form = document.querySelector('[data-search]');
const input = form.querySelector('input');
const results = document.querySelector('[data-results]');
const detail = document.querySelector('[data-entry]');
form.after(charRow(input));

function search(q) {
  const key = stripAcutes(normalize(q));
  const lemmas = Object.keys(lexicon.lemmas);
  if (!key) return lemmas;
  const byForm = new Set(analyses(q).map((a) => a.lemma));
  return lemmas.filter((l) => byForm.has(l) || stripAcutes(normalize(l)).startsWith(key) || paradigm(l).some((f) => stripAcutes(normalize(f.b)).startsWith(key)));
}

function renderResults(list, q) {
  results.innerHTML = list.length
    ? list
        .map((l) => {
          const e = entry(l).bin.entry;
          return `<li><button type="button" class="card card--quiet result" data-lemma="${esc(l)}" aria-current="${l === detail.dataset.lemma}">
            <span class="result__lemma" lang="is">${esc(l)}</span> <span class="tag tag--gender">${t(genderKey(e.kyn))}</span>
            <span class="result__gloss" lang="en">${esc(glosses(l)[0] ?? '')}</span></button></li>`;
        })
        .join('')
    : `<li class="muted">${t('dict.none', { q: esc(q) })}</li>`;
}

function examples(lemma) {
  const own = new Set(paradigm(lemma).map((f) => normalize(f.b)));
  return Object.entries(lexicon.sentences).filter(([, s]) => words(s.is).some((w) => own.has(w)));
}

function renderEntry(lemma) {
  const e = entry(lemma).bin.entry;
  const rec = recording(lemma);
  const forms = paradigm(lemma).map((f) => ({ form: f.b, ...parseNounTag(f.g) })).filter((f) => f.case && f.variant === 1 && !f.definite);
  const mini = CASES.map((c) => {
    const sg = forms.find((f) => f.case === c.id && f.number === 'sg')?.form ?? '-';
    const pl = forms.find((f) => f.case === c.id && f.number === 'pl')?.form ?? '-';
    return `<tr><th scope="row">${caseTag(c.id)}</th><td lang="is">${esc(sg)}</td><td lang="is">${esc(pl)}</td></tr>`;
  }).join('');
  const ex = examples(lemma);
  const wikt = entry(lemma).wiktionary[0];
  detail.dataset.lemma = lemma;
  detail.innerHTML = `<header class="entry__head"><h2 class="entry__lemma" lang="is">${esc(lemma)}</h2>
      <span class="tag tag--gender">${t(genderKey(e.kyn))}</span><span class="tag tag--pos">${t('pos.noun')}</span>
      ${ipa(lemma).length ? `<span class="entry__ipa">${ipa(lemma).map(esc).join(' ')}</span>` : ''}
      <button type="button" class="icon-button icon-button--outline" data-play="${esc(lemma)}" ${rec ? `data-url="${esc(rec.mp3 ?? rec.ogg)}"` : ''} aria-label="${t('audio.playWord', { word: lemma })}">${icon('play')}</button>
      ${rec ? `<span class="tag tag--pos">${t('dict.recorded')}</span>` : ''}</header>
    <section aria-labelledby="dict-meaning"><h3 class="label" id="dict-meaning">${t('dict.meaning')}</h3><ol lang="en">${glosses(lemma).map((g) => `<li>${esc(g)}</li>`).join('')}</ol></section>
    <section aria-labelledby="dict-forms"><h3 class="label" id="dict-forms">${t('dict.forms')}</h3>
      <table class="table"><thead><tr><td></td><th scope="col">${t('number.sg')}</th><th scope="col">${t('number.pl')}</th></tr></thead><tbody>${mini}</tbody></table>
      <p><a class="button button--sm" href="declension.html?lemma=${encodeURIComponent(lemma)}">${icon('table')}<span>${t('dict.fullTable')}</span></a></p></section>
    <section aria-labelledby="dict-examples"><h3 class="label" id="dict-examples">${t('dict.examples')}</h3>
      ${ex.length ? `<ul class="examples">${ex.map(([id, s]) => `<li class="example"><span lang="is">${esc(s.is)}</span><small lang="en">${esc(s.en[0].text)}</small><small><a href="${s.url}" rel="noopener">Tatoeba #${id}</a>, ${esc(s.author)}</small></li>`).join('')}</ul>` : `<p class="muted">${t('dict.noExamples')}</p>`}</section>
    ${wikt?.etymology ? `<section aria-labelledby="dict-etym"><h3 class="label" id="dict-etym">${t('dict.etymology')}</h3><p lang="en">${esc(wikt.etymology)}</p></section>` : ''}
    <section aria-labelledby="dict-cognates"><h3 class="label" id="dict-cognates">${t('dict.cognates')}</h3><p class="muted">${t('dict.cognatesSoon')}</p></section>
    <p class="credit">${t('credit.dict', { url: wikt?.url ?? 'https://en.wiktionary.org' })}</p>`;
}

const params = new URLSearchParams(location.search);
const initial = params.get('q') ?? '';
input.value = initial;
const first = search(initial)[0] ?? 'hestur';
renderEntry(first);
renderResults(search(initial), initial);

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const list = search(input.value);
  renderResults(list, input.value);
  if (list[0]) renderEntry(list[0]);
  renderResults(list, input.value);
});
input.addEventListener('input', () => renderResults(search(input.value), input.value));
document.addEventListener('click', (e) => {
  const r = e.target.closest('[data-lemma]');
  if (r) {
    renderEntry(r.dataset.lemma);
    renderResults(search(input.value), input.value);
    if (!window.matchMedia('(min-width: 900px)').matches) detail.scrollIntoView({ block: 'start' });
    detail.querySelector('h2').setAttribute('tabindex', '-1');
    detail.querySelector('h2').focus({ preventScroll: true });
  }
  const b = e.target.closest('[data-play]');
  if (b) play({ text: b.dataset.play, url: b.dataset.url });
});
