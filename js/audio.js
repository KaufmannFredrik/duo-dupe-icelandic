// Icelandic audio, only ever on request. Order: a recorded file when one exists, then the
// browser's is-IS voice. Phase 4 adds pre-generated files between the two.

import { getSettings } from './store.js';
import { t } from './i18n.js';
import { toast } from './ui/toast.js';

let voices = [];
const synth = 'speechSynthesis' in window ? window.speechSynthesis : null;

function loadVoices() {
  voices = synth?.getVoices() ?? [];
}
if (synth) {
  loadVoices();
  synth.addEventListener?.('voiceschanged', loadVoices);
}

export function icelandicVoices() {
  return voices.filter((v) => /^is([-_]|$)/i.test(v.lang ?? ''));
}

function playFile(url, slow) {
  const audio = new Audio(url);
  audio.preservesPitch = true;
  audio.playbackRate = slow ? 0.75 : 1;
  return audio.play();
}

/**
 * @param {{ text: string, url?: string, slow?: boolean, quiet?: boolean }} item
 *   quiet: do not show the "no voice" message (for audio that only accompanies a tap)
 * @returns {Promise<'file'|'tts'|'none'>}
 */
export async function play({ text, url, slow = false, quiet = false }) {
  if (url) {
    try {
      await playFile(url, slow);
      return 'file';
    } catch {
      // Fall through to speech synthesis.
    }
  }
  const { voice, rate } = getSettings();
  const options = icelandicVoices();
  const chosen = options.find((v) => v.voiceURI === voice) ?? options[0];
  if (!synth || !chosen) {
    if (!quiet) toast(t('audio.none'));
    return 'none';
  }
  const u = new SpeechSynthesisUtterance(text);
  u.voice = chosen;
  u.lang = chosen.lang;
  u.rate = (slow ? 0.65 : 1) * (Number(rate) || 1);
  synth.cancel();
  synth.speak(u);
  return 'tts';
}
