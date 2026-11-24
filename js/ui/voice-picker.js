// The generated-voice chooser: the four Piper voices, each with a radio button and a sample to
// play (data/audio/samples.json). Used on the Learn page until the learner has chosen, and in
// Settings. Choosing writes the ttsVoice setting; audio of the other voices leaves the cache.

import { loadJSON } from '../app.js';
import { t } from '../i18n.js';
import { getSettings, setSetting } from '../store.js';
import { TTS_VOICES, play, ttsVoice } from '../audio.js';
import { dropOtherVoices } from '../offline.js';
import { icon } from '../shell.js';

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
let samples;

/** Plays a voice's first sample sentence. */
export async function playSample(voice) {
  samples ??= await loadJSON('data/audio/samples.json');
  const file = samples.voices[voice]?.files[0];
  if (!file) return;
  await play({ text: samples.sentences[0].is, url: new URL(`../../data/audio/${file}`, import.meta.url).href, quiet: true });
}

/**
 * Renders the chooser into `root`.
 * @param {HTMLElement} root
 * @param {{ legend: string, help?: string, preselect?: boolean, compact?: boolean, onChoose?: (voice: string) => void }} options
 *   preselect: mark the voice in use (Steinn) even before the learner has chosen one; compact: the
 *   legend only for screen readers (a card title says it), as on the Learn page
 */
export function voicePicker(root, { legend, help, preselect = false, compact = false, onChoose }) {
  const chosen = getSettings().ttsVoice || preselect ? ttsVoice() : null;
  const id = `voice-picker-${Math.random().toString(36).slice(2, 8)}`;
  // The list is two voices across on a phone and four where there is room (a container query).
  root.innerHTML = `<div class="voice-picker-wrap"><fieldset class="voice-picker" ${help ? `aria-describedby="${id}-help"` : ''}>
      <legend class="${compact ? 'visually-hidden' : 'setting__label'}">${esc(legend)}</legend>
      ${help ? `<p class="setting__help" id="${id}-help">${esc(help)}</p>` : ''}
      <ul class="voice-picker__list" role="list">${Object.entries(TTS_VOICES)
        .map(([v, { name, gender }]) => `<li class="voice-option">
          <label class="voice-option__choice"><input type="radio" name="${id}" value="${v}"${v === chosen ? ' checked' : ''}>
            <span class="voice-option__name">${esc(name)}</span><span class="tag tag--gender">${t(gender === 'male' ? 'voices.male' : 'voices.female')}</span></label>
          <button type="button" class="icon-button" data-sample="${v}" aria-label="${esc(t('voices.playSample', { name }))}">${icon('play')}</button>
        </li>`)
        .join('')}</ul>
    </fieldset></div>`;
  root.addEventListener('change', (e) => {
    if (e.target.name !== id) return;
    setSetting('ttsVoice', e.target.value);
    dropOtherVoices();
    onChoose?.(e.target.value);
  });
  root.addEventListener('click', (e) => {
    const b = e.target.closest('[data-sample]');
    if (b) playSample(b.dataset.sample);
  });
}
