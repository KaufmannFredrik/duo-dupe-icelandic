// Stories: a sample reader built from Tatoeba sentences. Tap a word to see its lemma, case and
// number (bottom sheet on phones, side panel on desktop). Full stories arrive in Phase 4.

import { ready } from '../app.js';
import { t } from '../i18n.js';
import { analyses, caseTag, describeForm, entry, genderKey, glosses, loadLexicon, sentence } from '../lexicon.js';
import { play } from '../audio.js';
import { icon } from '../shell.js';

await ready;
await loadLexicon();

const LINES = ['983662', '673125', '491492', '738963'];
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const text = document.querySelector('[data-reader-text]');
const panel = document.querySelector('[data-word-panel]');
const desktop = window.matchMedia('(min-width: 900px)');
let activeWord = null;

text.innerHTML = LINES.map((id) => {
  const s = sentence(id);
  const tokens = s.is.split(/(\p{L}+)/u).map((part) => (/^\p{L}+$/u.test(part) ? `<button type="button" class="word" aria-expanded="false" aria-controls="word-panel">${esc(part)}</button>` : esc(part)));
  return `<div class="reader__line"><button type="button" class="icon-button" data-play="${esc(s.is)}" aria-label="${t('audio.playSentence')}">${icon('play')}</button>
    <p><span lang="is">${tokens.join('')}</span><span class="reader__en muted" lang="en" hidden><br>${esc(s.en[0].text)}</span></p></div>`;
}).join('');

const credits = document.querySelector('[data-reader-credits]');
credits.innerHTML = t('stories.credit', {
  list: LINES.map((id) => `<a href="${sentence(id).url}" rel="noopener">#${id}</a> (${esc(sentence(id).author)})`).join(', '),
});

function panelHTML(word) {
  const found = analyses(word).filter((a) => a.parsed);
  const close = `<button type="button" class="icon-button word-panel__close" data-close aria-label="${t('stories.close')}">${icon('close')}</button>`;
  if (!found.length) {
    return `<div class="sheet__inner"><div class="sheet__head"><h2 class="sheet__title" lang="is">${esc(word)}</h2>${close}</div><p>${t('stories.noData')}</p></div>`;
  }
  const lemma = found[0].lemma;
  const e = entry(lemma).bin.entry;
  return `<div class="sheet__inner"><div class="sheet__head"><h2 class="sheet__title" lang="is">${esc(word)}</h2>${close}</div>
    <p><span class="label">${t('stories.lemma')}</span><br><span lang="is" class="learn-text">${esc(lemma)}</span> <span class="tag tag--gender">${t(genderKey(e.kyn))}</span></p>
    <p><span class="label">${t('stories.meaning')}</span><br><span lang="en">${esc(glosses(lemma)[0] ?? '')}</span></p>
    <div><span class="label">${t('stories.form')}</span>${found.map((a) => `<p>${caseTag(a.parsed.case)} ${esc(describeForm(a.parsed, { withCase: false }))}</p>`).join('')}</div>
    <div class="cluster"><button type="button" class="button button--sm" data-play="${esc(word)}">${icon('play')}<span>${t('audio.play')}</span></button>
      <a class="button button--sm" href="declension.html?lemma=${encodeURIComponent(lemma)}">${icon('table')}<span>${t('stories.table')}</span></a></div></div>`;
}

function openWord(btn) {
  activeWord?.setAttribute('aria-expanded', 'false');
  activeWord = btn;
  btn.setAttribute('aria-expanded', 'true');
  panel.innerHTML = panelHTML(btn.textContent);
  panel.classList.add('is-open');
  if (!desktop.matches) panel.querySelector('[data-close]').focus();
}

function closePanel() {
  panel.classList.remove('is-open');
  activeWord?.setAttribute('aria-expanded', 'false');
  activeWord?.focus();
  activeWord = null;
  panel.innerHTML = `<div class="sheet__inner"><p class="muted">${t('stories.pick')}</p></div>`;
}

document.addEventListener('click', (e) => {
  const word = e.target.closest('.word');
  if (word) return openWord(word);
  if (e.target.closest('[data-close]')) return closePanel();
  const b = e.target.closest('[data-play]');
  if (b) play({ text: b.dataset.play });
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && panel.classList.contains('is-open')) closePanel();
});
document.querySelector('[data-show-translations]').addEventListener('change', (e) => {
  for (const el of text.querySelectorAll('.reader__en')) el.hidden = !e.target.checked;
});
closePanel();
