// Declension table for one noun: four cases (rows) by singular and plural, without and with
// the definite article (columns). Cells play audio. Practice mode blanks some cells for typing.
// Every form is read from the DMII Core paradigm; nothing is generated in code.

import { ready } from '../app.js';
import { t } from '../i18n.js';
import { CASES, caseTag, entry, genderKey, glosses, ipa, loadLexicon, paradigm, parseNounTag, recording } from '../lexicon.js';
import { grade } from '../normalize.js';
import { getSettings } from '../store.js';
import { play } from '../audio.js';
import { icon } from '../shell.js';
import { charRow } from '../ui/charrow.js';
import { sfx } from '../sfx.js';

await ready;
const lexicon = await loadLexicon();
const requested = new URLSearchParams(location.search).get('lemma');
const lemma = requested && lexicon.lemmas[requested] ? requested : 'hestur';
const root = document.querySelector('[data-decl]');
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

const COLUMNS = [
  { number: 'sg', definite: false, key: 'form.indefinite' },
  { number: 'sg', definite: true, key: 'form.definite' },
  { number: 'pl', definite: false, key: 'form.indefinite' },
  { number: 'pl', definite: true, key: 'form.definite' },
];

const forms = paradigm(lemma)
  .map((f) => ({ form: f.b, ...parseNounTag(f.g) }))
  .filter((f) => f.case && f.variant === 1);
const cellForm = (c, col) => forms.find((f) => f.case === c && f.number === col.number && f.definite === col.definite)?.form;
const columns = COLUMNS.filter((col) => CASES.some((c) => cellForm(c.id, col)));
const numbers = [...new Set(columns.map((c) => c.number))];
const e = entry(lemma).bin.entry;
const rec = recording(lemma);
// Practice mode blanks every third cell, deterministically.
const blanked = (r, c) => (r * columns.length + c) % 3 === 1;

function table(practice) {
  const groups = numbers
    .map((n) => `<th scope="colgroup" colspan="${columns.filter((c) => c.number === n).length}" class="decl__group decl__${n}">${t(`number.${n}`)}</th>`)
    .join('');
  const heads = columns.map((c) => `<th scope="col" class="decl__${c.number}">${t(c.key)}</th>`).join('');
  const rows = CASES.map((c, r) => {
    const cells = columns
      .map((col, k) => {
        const form = cellForm(c.id, col);
        if (!form) return `<td class="decl__${col.number}"><span class="decl__cell muted">-</span></td>`;
        if (practice && blanked(r, k)) {
          const label = t('decl.inputLabel', { case: t(c.key), number: t(`form.${col.number}`), def: t(col.key) });
          return `<td class="decl__${col.number}"><input class="decl__input" lang="is" data-answer="${esc(form)}" aria-label="${esc(label)}" autocomplete="off" autocapitalize="off" spellcheck="false"></td>`;
        }
        return `<td class="decl__${col.number}"><button type="button" class="decl__cell" data-play="${esc(form)}"><span lang="is">${esc(form)}</span>${icon('sound-wave')}</button></td>`;
      })
      .join('');
    return `<tr><th scope="row">${caseTag(c.id)}</th>${cells}</tr>`;
  }).join('');
  return `<table class="decl" data-number="sg"><caption class="visually-hidden">${t('decl.caption', { lemma })}</caption>
    <thead><tr><td class="decl__corner"></td>${groups}</tr><tr><td></td>${heads}</tr></thead><tbody>${rows}</tbody></table>`;
}

root.innerHTML = `<div class="decl-head">
    <div class="decl-word"><span class="decl-word__lemma" lang="is">${esc(lemma)}</span>
      ${e.kyn ? `<span class="tag tag--gender">${t(genderKey(e.kyn))}</span>` : ''}<span class="tag tag--pos">${t('pos.noun')}</span>
      ${ipa(lemma)[0] ? `<span class="muted">${esc(ipa(lemma)[0])}</span>` : ''}
      <button type="button" class="icon-button icon-button--outline" data-play="${esc(lemma)}" ${rec ? `data-url="${esc(rec.mp3 ?? rec.ogg)}"` : ''} aria-label="${t('audio.playWord', { word: lemma })}">${icon('play')}</button></div>
    <p class="muted">${esc(glosses(lemma)[0] ?? '')}</p>
  </div>
  <div class="cluster">
    ${
      numbers.length > 1
        ? `<fieldset class="segmented decl-number"><legend class="visually-hidden">${t('decl.number')}</legend>
      <label><input type="radio" name="number" value="sg" checked><span>${t('number.sg')}</span></label>
      <label><input type="radio" name="number" value="pl"><span>${t('number.pl')}</span></label></fieldset>`
        : ''
    }
    <label class="switch"><span>${t('decl.practice')}</span><input type="checkbox" data-practice><span class="switch__track" aria-hidden="true"></span></label>
  </div>
  <div data-table></div>
  <p class="decl-legend">${CASES.map((c) => caseTag(c.id)).join(' ')}</p>
  <div class="stack" data-practice-tools hidden></div>
  <p class="credit">${t('credit.bin')}</p>
  <p class="cluster"><span class="muted">${t('decl.other')}</span>${Object.keys(lexicon.lemmas)
    .filter((l) => l !== lemma)
    .map((l) => `<a class="chip" href="declension.html?lemma=${encodeURIComponent(l)}" lang="is">${esc(l)}</a>`)
    .join('')}</p>`;

const tableHost = root.querySelector('[data-table]');
const tools = root.querySelector('[data-practice-tools]');
let lastInput = null;

function render(practice) {
  const number = root.querySelector('input[name="number"]:checked')?.value ?? numbers[0];
  tableHost.innerHTML = table(practice);
  tableHost.querySelector('.decl').dataset.number = number;
  tools.hidden = !practice;
  tools.innerHTML = '';
  if (practice) {
    tools.append(charRow(() => lastInput ?? tableHost.querySelector('.decl__input')));
    tools.insertAdjacentHTML('beforeend', `<div class="cluster"><button type="button" class="button button-primary" data-check-table>${t('decl.check')}</button><p class="muted" data-score role="status"></p></div>`);
  }
}

render(false);

root.addEventListener('change', (ev) => {
  if (ev.target.name === 'number') tableHost.querySelector('.decl').dataset.number = ev.target.value;
  if (ev.target.matches('[data-practice]')) render(ev.target.checked);
});
root.addEventListener('focusin', (ev) => {
  if (ev.target.matches('.decl__input')) lastInput = ev.target;
});
root.addEventListener('click', (ev) => {
  const b = ev.target.closest('[data-play]');
  if (b) play({ text: b.dataset.play, url: b.dataset.url });
  if (!ev.target.closest('[data-check-table]')) return;
  const inputs = [...tableHost.querySelectorAll('.decl__input')];
  let right = 0;
  for (const input of inputs) {
    const g = grade(input.value, [input.dataset.answer], { strict: getSettings().strict });
    input.dataset.state = g.result;
    input.setAttribute('aria-invalid', String(g.result === 'wrong'));
    input.closest('td').querySelector('.decl__mark')?.remove();
    const mark = g.result === 'correct' ? 'check' : g.result === 'almost' ? 'almost' : 'wrong';
    input.insertAdjacentHTML('afterend', `<span class="decl__mark decl__mark--${g.result}">${icon(mark, 'icon icon--sm')}<span>${g.result === 'correct' ? t('feedback.correct') : `<span lang="is">${esc(input.dataset.answer)}</span>`}</span></span>`);
    if (g.result !== 'wrong') right++;
  }
  root.querySelector('[data-score]').textContent = t('decl.score', { right, total: inputs.length });
  sfx(right === inputs.length ? 'correct' : 'almost');
});
