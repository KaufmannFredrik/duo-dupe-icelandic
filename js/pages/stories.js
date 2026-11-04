// Stories: a sample reading built from Tatoeba sentences. Tap a word for its dictionary form,
// meaning, case and number (bottom sheet on phones, side panel on desktop). Phase 4 adds stories.

import { ready } from '../app.js';
import { t } from '../i18n.js';
import { analyze, gloss, lemma, loadAll, recordings, sentence, translation } from '../data.js';
import { play } from '../audio.js';
import { icon } from '../shell.js';
import { caseTag, classLabel, describe, genderLabel } from '../ui/forms.js';

await ready;
await loadAll();

const LINES = ['4171415', '707638', '788039', '658126', '917595'].filter((sid) => sentence(sid));
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const text = document.querySelector('[data-reader-text]');
const panel = document.querySelector('[data-word-panel]');
const desktop = window.matchMedia('(min-width: 900px)');
let activeWord = null;

text.innerHTML = LINES.map((sid) => {
  const s = sentence(sid);
  const tr = translation(sid);
  const tokens = s.is.split(/(\p{L}+)/u).map((part) => (/^\p{L}+$/u.test(part) ? `<button type="button" class="word" aria-expanded="false" aria-controls="word-panel">${esc(part)}</button>` : esc(part)));
  return `<div class="reader__line"><button type="button" class="icon-button" data-play="${esc(s.is)}" aria-label="${t('audio.playSentence')}">${icon('play')}</button>
    <p><span lang="is">${tokens.join('')}</span><span class="reader__en muted" lang="${tr.lang}" hidden><br>${esc(tr.text)}</span></p></div>`;
}).join('');

document.querySelector('[data-reader-credits]').innerHTML = t('stories.credit', {
  list: LINES.map((sid) => `<a href="https://tatoeba.org/en/sentences/show/${sid}" rel="noopener">#${sid}</a> (${esc(sentence(sid).author ?? t('credit.unknownAuthor'))})`).join(', '),
});

function panelHTML(word) {
  const found = analyze(word);
  const close = `<button type="button" class="icon-button word-panel__close" data-close aria-label="${t('stories.close')}">${icon('close')}</button>`;
  if (!found.length) return `<div class="sheet__inner"><div class="sheet__head"><h2 class="sheet__title" lang="is">${esc(word)}</h2>${close}</div><p>${t('stories.noData')}</p></div>`;
  const byLemma = new Map();
  for (const a of found) {
    if (!byLemma.has(a.id)) byLemma.set(a.id, []);
    if (a.tag) byLemma.get(a.id).push(a);
  }
  const blocks = [...byLemma]
    .map(([id, an]) => {
      const l = lemma(id);
      const rec = recordings(id)[0];
      return `<div class="stack word-panel__lemma">
        <p><span class="label">${t('stories.lemma')}</span><br><span lang="is" class="learn-text">${esc(l.lemma)}</span> ${l.kyn ? `<span class="tag tag--gender">${genderLabel(l.kyn)}</span>` : ''}<span class="tag tag--pos">${esc(classLabel(l.ofl))}</span></p>
        <p><span class="label">${t('stories.meaning')}</span><br>${esc(gloss(id))}</p>
        ${an.length ? `<div><span class="label">${t('stories.form')}</span>${[...new Set(an.map((a) => a.tag))].slice(0, 4).map((tag) => { const p = an.find((a) => a.tag === tag).parsed; return `<p>${p.case ? `${caseTag(p.case)} ` : ''}${esc(describe(tag, { withCase: !p.case, ofl: l.ofl }))}</p>`; }).join('')}</div>` : ''}
        <div class="cluster"><button type="button" class="button button--sm" data-play="${esc(l.lemma)}" ${rec ? `data-url="${esc(rec.mp3 ?? rec.ogg)}"` : ''}>${icon('play')}<span>${t('audio.play')}</span></button>
          <a class="button button--sm" href="dictionary.html?lemma=${encodeURIComponent(id)}">${icon('dictionary')}<span>${t('nav.dictionary')}</span></a></div></div>`;
    })
    .join('');
  return `<div class="sheet__inner"><div class="sheet__head"><h2 class="sheet__title" lang="is">${esc(word)}</h2>${close}</div>${byLemma.size > 1 ? `<p class="muted">${t('stories.ambiguous')}</p>` : ''}${blocks}</div>`;
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
  if (b) play({ text: b.dataset.play, url: b.dataset.url });
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && panel.classList.contains('is-open')) closePanel();
});
document.querySelector('[data-show-translations]').addEventListener('change', (e) => {
  for (const el of text.querySelectorAll('.reader__en')) el.hidden = !e.target.checked;
});
closePanel();
