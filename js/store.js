// Settings in localStorage. Every access is wrapped: storage can be disabled, full or blocked.
// Progress, SRS and the API cache move to IndexedDB in Phase 3.

const SETTINGS_KEY = 'tolva.settings.v1';

export const DEFAULT_SETTINGS = {
  calm: 'auto', // auto | on | off
  scan: 'default', // default (page decides) | low | off
  sound: false, // sound effects; off by default
  strict: false, // strict answer checking: missing accents count as wrong
  hearts: false,
  uiLang: null, // null: detect from the browser
  glossLang: null, // null: same as uiLang
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

export function setSetting(key, value) {
  const settings = { ...getSettings(), [key]: value };
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // Not persisted, but the change still applies to this page.
  }
  window.dispatchEvent(new CustomEvent('tolva:settings', { detail: { key, value, settings } }));
  return settings;
}

// Demo progress for the Phase 1 screens. Phase 5 replaces this with real stats from IndexedDB.
export function getProgress() {
  return { demo: true, streak: 3, xp: 120, goal: 30, today: 20, lessonsDone: 7, accuracy: 0.86 };
}
