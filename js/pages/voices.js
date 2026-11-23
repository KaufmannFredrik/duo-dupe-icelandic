// Voices: the four Piper voices side by side on the same sentences (data/audio/samples.json,
// built by scripts/build-audio.py --samples), each with a button to make it the learner's voice.

import { loadJSON, ready } from '../app.js';
import { t } from '../i18n.js';
import { setSetting } from '../store.js';
import { TTS_VOICES, stop, ttsVoice } from '../audio.js';
import { dropOtherVoices } from '../offline.js';
import { icon } from '../shell.js';

await ready;
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const samples = await loadJSON('data/audio/samples.json');
const root = document.querySelector('[data-voices]');
let current = null;

function render() {
  const mine = ttsVoice();
  root.innerHTML = Object.entries(samples.voices)
    .filter(([id]) => TTS_VOICES[id])
    .map(([id, v]) => {
      const { name, gender } = TTS_VOICES[id];
      const used = id === mine;
      return `<section class="card card--quiet stack voice-card${used ? ' card--gold' : ''}" aria-labelledby="voice-${id}">
      <h2 class="card__title cluster" id="voice-${id}"><span>${esc(name)}</span><span class="tag tag--gender">${t(gender === 'male' ? 'voices.male' : 'voices.female')}</span>${used ? `<span class="tag tag--ok">${t('voices.used')}</span>` : ''}</h2>
      <ul class="voice-samples" role="list">${v.files
        .map((f, n) => {
          const s = samples.sentences[n];
          return `<li class="voice-sample"><span lang="is" class="learn-text">${esc(s.is)}</span>
            <button type="button" class="icon-button" data-src="${esc(f)}" aria-label="${esc(`${t('audio.play')}: ${name}, ${t('voices.sample', { n: n + 1 })}`)}">${icon('play')}</button></li>`;
        })
        .join('')}</ul>
      <div><button type="button" class="button button--sm${used ? '' : ' button-primary'}" data-choose="${id}" aria-pressed="${used}">${t(used ? 'voices.used' : 'voices.choose')}</button></div></section>`;
    })
    .join('');
}
render();

root.addEventListener('click', (e) => {
  const choose = e.target.closest('[data-choose]');
  if (choose) {
    setSetting('ttsVoice', choose.dataset.choose);
    dropOtherVoices();
    render();
    root.querySelector(`[data-choose="${choose.dataset.choose}"]`)?.focus();
    return;
  }
  const b = e.target.closest('[data-src]');
  if (!b) return;
  stop();
  current?.pause();
  current = new Audio(new URL(`../../data/audio/${b.dataset.src}`, import.meta.url).href);
  current.play();
});
