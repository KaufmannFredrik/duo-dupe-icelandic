// Settings: every control writes to the settings store and applies immediately.
// The UI language reloads the page so every string switches at once.

import { ready } from '../app.js';
import { t } from '../i18n.js';
import { getSettings, setSetting } from '../store.js';
import { icelandicVoices, play } from '../audio.js';

await ready;
const form = document.querySelector('[data-settings]');
const s = getSettings();

const radio = (name, value) => {
  const el = form.querySelector(`input[name="${name}"][value="${value}"]`);
  if (el) el.checked = true;
};
radio('calm', s.calm);
radio('scan', s.scan);
radio('strict', s.strict ? 'strict' : 'easy');
form.elements.sound.checked = s.sound;
form.elements.hearts.checked = s.hearts;
form.elements.uiLang.value = s.uiLang ?? 'auto';
form.elements.glossLang.value = s.glossLang ?? 'auto';
form.elements.rate.value = String(s.rate);
const rateOut = form.querySelector('[data-rate-out]');
rateOut.textContent = `${Number(s.rate).toFixed(1)}x`;

function fillVoices() {
  const select = form.elements.voice;
  const voices = icelandicVoices();
  select.innerHTML = voices.length
    ? voices.map((v) => `<option value="${v.voiceURI}">${v.name} (${v.lang})</option>`).join('')
    : `<option value="">${t('settings.noVoice')}</option>`;
  select.disabled = !voices.length;
  if (voices.some((v) => v.voiceURI === getSettings().voice)) select.value = getSettings().voice;
}
fillVoices();
window.speechSynthesis?.addEventListener?.('voiceschanged', fillVoices);

form.addEventListener('change', (e) => {
  const el = e.target;
  switch (el.name) {
    case 'calm':
    case 'scan':
      setSetting(el.name, el.value);
      break;
    case 'strict':
      setSetting('strict', el.value === 'strict');
      break;
    case 'sound':
    case 'hearts':
      setSetting(el.name, el.checked);
      break;
    case 'uiLang':
      setSetting('uiLang', el.value === 'auto' ? null : el.value);
      location.reload();
      break;
    case 'glossLang':
      setSetting('glossLang', el.value === 'auto' ? null : el.value);
      break;
    case 'voice':
      setSetting('voice', el.value);
      break;
    default:
  }
});
form.elements.rate.addEventListener('input', (e) => {
  rateOut.textContent = `${Number(e.target.value).toFixed(1)}x`;
  setSetting('rate', Number(e.target.value));
});
form.querySelector('[data-test-voice]').addEventListener('click', () => play({ text: 'Góðan daginn!' }));
