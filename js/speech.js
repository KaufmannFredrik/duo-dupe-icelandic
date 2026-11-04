// Speech recognition for the speaking practice (Phase 6, experimental and off by default).
// Uses the browser's own Web Speech API with Icelandic (is-IS). There is no free Icelandic
// recognizer that runs in a static site, so this is the only option; where the browser can
// recognize on the device (SpeechRecognition.available with processLocally), that is preferred,
// otherwise the browser may send the audio to its maker's speech service. Settings says so.

const API = typeof window !== 'undefined' ? window.SpeechRecognition ?? window.webkitSpeechRecognition : undefined;
export const LANG = 'is-IS';

/**
 * 'local' (on-device), 'service' (the browser's online service), or 'none'. Call it only after
 * the learner turned speaking on. (Headless Chromium 156 crashes on the on-device query; headed
 * Chrome answers it, so tests replace the recognizer with tests/helpers/fake-speech.mjs.)
 */
export async function speechSupport() {
  if (!API) return 'none';
  if (typeof API.available === 'function') {
    try {
      const local = await API.available({ langs: [LANG], processLocally: true });
      if (local === 'available') return 'local';
      const remote = await API.available({ langs: [LANG], processLocally: false });
      return remote === 'unavailable' ? 'none' : 'service';
    } catch {
      return 'service';
    }
  }
  return 'service';
}

/**
 * Listens once. Resolves with up to five transcripts, best first (empty when nothing was heard).
 * Rejects with an Error whose message is the recognizer's error code ('not-allowed', 'network',
 * 'language-not-supported', ...). onInterim(text) shows partial results while the learner speaks.
 * @returns {{ result: Promise<string[]>, stop: () => void }}
 */
export function listen({ onInterim, local = false } = {}) {
  const rec = new API();
  rec.lang = LANG;
  rec.interimResults = true;
  rec.maxAlternatives = 5;
  rec.continuous = false;
  if (local && 'processLocally' in rec) rec.processLocally = true;
  let finals = [];
  const result = new Promise((resolve, reject) => {
    rec.onresult = (e) => {
      const last = e.results[e.results.length - 1];
      if (last.isFinal) finals = [...last].map((alt) => alt.transcript.trim()).filter(Boolean);
      else onInterim?.(last[0].transcript);
    };
    rec.onerror = (e) => (e.error === 'no-speech' || e.error === 'aborted' ? resolve([]) : reject(new Error(e.error)));
    rec.onend = () => resolve(finals);
  });
  rec.start();
  return { result, stop: () => rec.stop() };
}
