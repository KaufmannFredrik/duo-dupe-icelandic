// Settings in localStorage. Every access is wrapped: storage can be disabled, full or blocked.
// Progress and spaced repetition live in IndexedDB (js/db.js, js/progress.js).

const SETTINGS_KEY = 'tolva.settings.v1';

export const DEFAULT_SETTINGS = {
  calm: 'auto', // auto | on | off
  scan: 'default', // default (page decides) | low | off
  sound: false, // sound effects; off by default
  strict: false, // strict answer checking: missing accents count as wrong
  hearts: false, // lose a heart per mistake; out of hearts ends the lesson
  goal: 20, // daily goal in XP
  speaking: false, // experimental speaking practice with the browser's speech recognition
  uiLang: null, // null: detect from the browser
  glossLang: null, // null: same as uiLang
  ttsVoice: null, // generated voice (js/audio.js TTS_VOICES); null until the learner chooses
  voice: '', // voiceURI of a browser is-IS voice
  rate: 1, // speech rate multiplier
};

export function getSettings() {
  try {
    return { ...DEFAULT_SETTINGS, ...JSON.parse(localStorage.getItem(SETTINGS_KEY) ?? '{}') };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

function save(settings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // Not persisted, but the change still applies to this page.
  }
}

export function setSetting(key, value) {
  const settings = { ...getSettings(), [key]: value };
  save(settings);
  window.dispatchEvent(new CustomEvent('tolva:settings', { detail: { key, value, settings } }));
  return settings;
}

/** Replaces all settings (progress import). Unknown keys are dropped. */
export function replaceSettings(values) {
  const settings = { ...DEFAULT_SETTINGS };
  for (const key of Object.keys(DEFAULT_SETTINGS)) if (key in values) settings[key] = values[key];
  save(settings);
  window.dispatchEvent(new CustomEvent('tolva:settings', { detail: { settings } }));
  return settings;
}
