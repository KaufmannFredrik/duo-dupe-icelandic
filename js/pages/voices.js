// Voices: the four Piper voices side by side on the same sentences (data/audio/samples.json,
// built by scripts/build-audio.py --samples). The app itself ships only TTS_VOICE.

import { loadJSON, ready } from '../app.js';
import { t } from '../i18n.js';
import { TTS_VOICE, stop } from '../audio.js';
import { icon } from '../shell.js';

await ready;
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const samples = await loadJSON('data/audio/samples.json');
const root = document.querySelector('[data-voices]');
let current = null;

root.innerHTML = Object.entries(samples.voices)
  .map(([id, v]) => `<section class="card card--quiet stack voice-card${id === TTS_VOICE ? ' card--gold' : ''}" aria-labelledby="voice-${id}">
      <h2 class="card__title cluster" id="voice-${id}"><span>${esc(v.name)}</span>${id === TTS_VOICE ? `<span class="tag tag--ok">${t('voices.used')}</span>` : ''}</h2>
      <ul class="voice-samples" role="list">${v.files
        .map((f, n) => {
          const s = samples.sentences[n];
          return `<li class="voice-sample"><span lang="is" class="learn-text">${esc(s.is)}</span>
            <button type="button" class="icon-button" data-src="${esc(f)}" aria-label="${esc(`${t('audio.play')}: ${v.name}, ${t('voices.sample', { n: n + 1 })}`)}">${icon('play')}</button></li>`;
        })
        .join('')}</ul></section>`)
  .join('');

root.addEventListener('click', (e) => {
  const b = e.target.closest('[data-src]');
  if (!b) return;
  stop();
  current?.pause();
  current = new Audio(new URL(`../../data/audio/${b.dataset.src}`, import.meta.url).href);
  current.play();
});
