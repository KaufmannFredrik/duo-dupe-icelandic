// Settings: every control writes to the settings store and applies immediately.
// The UI language reloads the page so every string switches at once.

import { ready } from '../app.js';
import { t } from '../i18n.js';
import { getSettings, setSetting } from '../store.js';
import { icelandicVoices, play } from '../audio.js';
import { audioCacheStatus, cacheAllAudio, keepStorage, offlineState } from '../offline.js';
import { speechSupport } from '../speech.js';
import { voicePicker } from '../ui/voice-picker.js';

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
radio('goal', s.goal);
form.elements.sound.checked = s.sound;
form.elements.music.checked = s.music;
form.elements.hearts.checked = s.hearts;
form.elements.speaking.checked = s.speaking;
// Speech support is only checked once speaking is on: the check asks the browser about its
// recognizers, which is nobody's business until the learner opts in.
async function showSpeechState(on) {
  const el = form.querySelector('[data-speaking-state]');
  if (!on) {
    el.textContent = '';
    return;
  }
  const support = await speechSupport();
  el.textContent = t({ local: 'settings.speakingLocal', service: 'settings.speakingService', none: 'settings.speakingNone' }[support]);
}
showSpeechState(s.speaking);
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
    case 'goal':
      setSetting('goal', Number(el.value));
      break;
    case 'sound':
    case 'music':
    case 'hearts':
      setSetting(el.name, el.checked);
      break;
    case 'speaking':
      setSetting('speaking', el.checked);
      showSpeechState(el.checked);
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
const musicOut = form.querySelector('[data-music-volume-out]');
form.elements.musicVolume.value = String(s.musicVolume);
musicOut.textContent = `${s.musicVolume}%`;
form.elements.musicVolume.addEventListener('input', (e) => {
  musicOut.textContent = `${e.target.value}%`;
  setSetting('musicVolume', Number(e.target.value));
});
// The top bar's music button changes the setting too.
window.addEventListener('tolva:settings', (e) => {
  if (e.detail?.key === 'music') form.elements.music.checked = e.detail.value;
});
form.elements.rate.addEventListener('input', (e) => {
  rateOut.textContent = `${Number(e.target.value).toFixed(1)}x`;
  setSetting('rate', Number(e.target.value));
});
form.querySelector('[data-test-voice]').addEventListener('click', () => play({ text: 'Góðan daginn!', browser: true }));
voicePicker(form.querySelector('[data-voice-picker]'), { legend: t('settings.ttsVoice'), help: t('settings.ttsVoiceHelp'), preselect: true, onChoose: () => showOffline() });

// Offline use: the service worker state, and downloading all generated audio.
const offlineEl = form.querySelector('[data-offline-state]');
const cacheBtn = form.querySelector('[data-cache-audio]');
const cacheStatus = form.querySelector('[data-cache-status]');
const mb = (n) => (n / 1e6).toFixed(1);

async function showOffline() {
  const state = await offlineState();
  offlineEl.textContent = t({ ready: 'settings.offlineReady', installing: 'settings.offlineInstalling', unsupported: 'settings.offlineUnsupported' }[state]);
  if (state === 'unsupported') return;
  const s = await audioCacheStatus();
  const total = s.manifest.bytes ?? 0;
  cacheStatus.textContent = t('settings.audioCached', { n: s.cached, total: s.total });
  cacheBtn.disabled = s.cached >= s.total;
  cacheBtn.querySelector('span').textContent = total ? t('settings.cacheAudioSize', { mb: mb(total) }) : t('settings.cacheAudio');
}

cacheBtn.addEventListener('click', async () => {
  cacheBtn.disabled = true;
  try {
    await cacheAllAudio((done, total) => {
      cacheStatus.textContent = t('settings.audioCached', { n: done, total });
    });
    cacheStatus.textContent = t('settings.audioDone');
  } catch {
    cacheStatus.textContent = t('settings.audioFailed');
    cacheBtn.disabled = false;
  }
});
showOffline();
navigator.serviceWorker?.addEventListener('controllerchange', showOffline);

// Whether the browser has agreed to keep this site's storage, where all progress lives.
keepStorage({ ask: false }).then((state) => {
  const el = form.querySelector('[data-storage-state]');
  if (state === 'unknown') return;
  el.textContent = t(state === 'kept' ? 'settings.storageKept' : 'settings.storageNotKept');
  el.hidden = false;
});
