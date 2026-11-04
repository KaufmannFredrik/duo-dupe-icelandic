// Stories: short readings made of real Tatoeba sentences (content/stories/). The list shows every
// reading; ?story=<id> opens the reader: play a line or the whole reading with word-by-word
// highlighting, tap any word for its dictionary form, meaning, case and number.

import { loadJSON, ready } from '../app.js';
import { loadCourse } from '../course.js';
import { loadProgress } from '../progress.js';
import { pick, t } from '../i18n.js';
import { analyze, gloss, lemma, loadAll, recordings, sentence, translation } from '../data.js';
import { play, stop, ttsCredit } from '../audio.js';
import { icon } from '../shell.js';
import { caseTag, classLabel, describe, genderLabel } from '../ui/forms.js';

await ready;
await loadAll();
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const index = await loadJSON('content/stories/index.json');
const [stories, course, progress] = await Promise.all([Promise.all(index.stories.map((f) => loadJSON(`content/stories/${f}`))), loadCourse(), loadProgress()]);
const params = new URLSearchParams(location.search);
const story = stories.find((s) => s.id === params.get('story'));
const listEl = document.querySelector('[data-story-list]');
const readerEl = document.querySelector('[data-reader]');
const panel = document.querySelector('[data-word-panel]');
const desktop = window.matchMedia('(min-width: 900px)');
let activeWord = null;

// A story is "ready" once the unit it follows is done (or skipped by the placement test).
function unitDone(id) {
  const unit = course.units.find((u) => u.id === id);
  if (!unit) return false;
  return progress.skippedUnits?.includes(id) || unit.lessons.filter((l) => !l.review).every((l) => progress.lessons[l.key]?.done);
}

if (!story) {
  readerEl.hidden = true;
  listEl.innerHTML = stories
    .map((s) => {
      const first = sentence(s.lines[0].sentence);
      const unit = course.units.find((u) => u.id === s.after);
      const ready = unitDone(s.after);
      return `<a class="card card--quiet story-card${ready ? ' story-card--ready' : ''}" href="stories.html?story=${s.id}">
        <span class="cluster"><span class="tag tag--pos">${esc(s.level)}</span><span class="tag tag--pos">${t(s.dialogue ? 'stories.dialogue' : 'stories.reading')}</span>${ready ? `<span class="tag tag--ok">${t('stories.ready')}</span>` : ''}</span>
        <h2 class="card__title">${esc(pick(s.title))}</h2>
        <p lang="is" class="learn-text">${esc(first?.is ?? '')}</p>
        <p class="muted">${t('stories.lines', { n: s.lines.length })}${unit ? ` · ${t('stories.after', { unit: esc(pick(unit.title)) })}` : ''}</p></a>`;
    })
    .join('');
  if (params.has('story')) listEl.insertAdjacentHTML('beforebegin', `<p class="card card--gold">${t('stories.notFound')}</p>`);
} else {
  listEl.hidden = true;
  document.querySelector('.page-head p').hidden = true;
  document.querySelector('[data-story-title]').textContent = pick(story.title);
  document.title = `${pick(story.title)} · TÖLVA`;
  renderReader();
}

function renderReader() {
  const text = document.querySelector('[data-reader-text]');
  text.innerHTML = story.lines
    .map((line, n) => {
      const s = sentence(line.sentence);
      const tr = translation(line.sentence);
      let w = -1;
      const tokens = s.is.split(/(\p{L}+)/u).map((part) => (/^\p{L}+$/u.test(part) ? `<button type="button" class="word" data-w="${++w}" aria-expanded="false" aria-controls="word-panel">${esc(part)}</button>` : esc(part)));
      return `<div class="reader__line" data-line="${n}"${line.speaker ? ` data-speaker="${esc(line.speaker)}"` : ''}>
        <button type="button" class="icon-button" data-play-line="${n}" aria-label="${t('audio.playSentence')}">${icon('play')}</button>
        ${line.speaker ? `<span class="speaker" aria-label="${t('stories.speaker', { s: line.speaker })}">${esc(line.speaker)}</span>` : ''}
        <p><span lang="is">${tokens.join('')}</span><span class="reader__en muted" lang="${tr.lang}" hidden><br>${esc(tr.text)}</span></p></div>`;
    })
    .join('');
  document.querySelector('[data-reader-credits]').innerHTML = t('stories.credit', {
    list: story.lines.map(({ sentence: sid }) => `<a href="https://tatoeba.org/en/sentences/show/${sid}" rel="noopener">#${sid}</a> (${esc(sentence(sid).author ?? t('credit.unknownAuthor'))})`).join(', '),
  });
  ttsCredit().then((c) => {
    if (c) document.querySelector('[data-voice-credit]').textContent = c;
  });
}

// Plays one line, highlighting each word as it is spoken. Resolves when the line ends.
function playLine(n, { slow = false } = {}) {
  return new Promise((resolve) => {
    const lineEl = document.querySelector(`[data-line="${n}"]`);
    const words = [...lineEl.querySelectorAll('.word')];
    document.querySelectorAll('.reader__line.is-current').forEach((el) => el.classList.remove('is-current'));
    lineEl.classList.add('is-current');
    lineEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    const s = sentence(story.lines[n].sentence);
    play({
      text: s.is,
      slow,
      quiet: playingAll && n > 0,
      onWord: (i) => words.forEach((w, k) => w.classList.toggle('is-speaking', k === i)),
      onEnd: () => {
        lineEl.classList.remove('is-current');
        resolve();
      },
    });
  });
}

let playingAll = false;
const allButton = document.querySelector('[data-play-all]');

function stopAll() {
  playingAll = false;
  allButton.setAttribute('aria-pressed', 'false');
  stop();
}

async function playAll() {
  if (playingAll) return stopAll();
  playingAll = true;
  allButton.setAttribute('aria-pressed', 'true');
  for (let n = 0; n < story.lines.length && playingAll; n++) {
    await playLine(n);
    if (playingAll) await new Promise((r) => setTimeout(r, 450));
  }
  playingAll = false;
  allButton.setAttribute('aria-pressed', 'false');
}

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
      const tags = [...new Set(an.map((a) => a.tag))].slice(0, 4);
      return `<div class="stack word-panel__lemma">
        <p><span class="label">${t('stories.lemma')}</span><br><span lang="is" class="learn-text">${esc(l.lemma)}</span> ${l.kyn ? `<span class="tag tag--gender">${genderLabel(l.kyn)}</span>` : ''}<span class="tag tag--pos">${esc(classLabel(l.ofl))}</span></p>
        <p><span class="label">${t('stories.meaning')}</span><br>${esc(gloss(id))}</p>
        ${tags.length ? `<div><span class="label">${t('stories.form')}</span>${tags.map((tag) => { const p = an.find((a) => a.tag === tag).parsed; return `<p>${p.case ? `${caseTag(p.case)} ` : ''}${esc(describe(tag, { withCase: !p.case, ofl: l.ofl }))}</p>`; }).join('')}</div>` : ''}
        <div class="cluster"><button type="button" class="button button--sm" data-play="${esc(l.lemma)}" ${rec ? `data-url="${esc(rec.mp3 ?? rec.ogg)}"` : ''}>${icon('play')}<span>${t('audio.play')}</span></button>
          <a class="button button--sm" href="dictionary.html?lemma=${encodeURIComponent(id)}">${icon('dictionary')}<span>${t('nav.dictionary')}</span></a>
          <a class="button button--sm" href="declension.html?lemma=${encodeURIComponent(l.lemma)}">${icon('table')}<span>${t('stories.table')}</span></a></div></div>`;
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
  const line = e.target.closest('[data-play-line]');
  if (line) {
    if (playingAll) stopAll();
    return playLine(Number(line.dataset.playLine));
  }
  const all = e.target.closest('[data-play-all]');
  if (all) return playAll();
  const b = e.target.closest('[data-play]');
  if (b) play({ text: b.dataset.play, url: b.dataset.url });
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && panel.classList.contains('is-open')) closePanel();
});
document.querySelector('[data-show-translations]')?.addEventListener('change', (e) => {
  for (const el of document.querySelectorAll('.reader__en')) el.hidden = !e.target.checked;
});
if (story) closePanel();
