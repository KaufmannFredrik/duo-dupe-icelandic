// Icelandic audio, only ever on request. Order:
//   1. a human recording (Wikimedia Commons, Lingua Libre), when the caller has one;
//   2. a pre-generated file from the synthetic voice the learner chose (data/audio/tts-<voice>.json,
//      built by scripts/build-audio.py), looked up by the exact text;
//   3. the browser's own Icelandic voice, if the device has one.
// Slow playback is 0.75x with the pitch kept. onWord(i) reports the word being spoken
// (estimated timings for files, boundary events for the browser voice); -1 when done.
// onEnd runs once per play: when the audio ends, fails, or is stopped by stop() or the next play.

import { getSettings } from './store.js';
import { t } from './i18n.js';
import { toast } from './ui/toast.js';

/** The generated voices: four Piper voices trained on Talrómur (scripts/build-audio.py). */
export const TTS_VOICES = {
  steinn: { name: 'Steinn', gender: 'male' },
  salka: { name: 'Salka', gender: 'female' },
  bui: { name: 'Búi', gender: 'male' },
  ugla: { name: 'Ugla', gender: 'female' },
};
export const DEFAULT_TTS_VOICE = 'steinn';

/** The generated voice in use: the learner's choice (Settings, ttsVoice), Steinn until they choose. */
export function ttsVoice() {
  const v = getSettings().ttsVoice;
  return v && Object.hasOwn(TTS_VOICES, v) ? v : DEFAULT_TTS_VOICE;
}

let voices = [];
const manifests = new Map();
let current = null;
let raf = 0;
let finish = null;
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

/** The manifest of a generated voice (default: the one in use): { texts: { [text]: { f, d, w? } }, credit, bytes }. */
export function ttsManifest(voice = ttsVoice()) {
  if (!manifests.has(voice)) {
    manifests.set(voice, fetch(new URL(`../data/audio/tts-${voice}.json`, import.meta.url))
      .then((r) => (r.ok ? r.json() : { texts: {} }))
      .catch(() => ({ texts: {} })));
  }
  return manifests.get(voice);
}

/**
 * The URL of a generated file. Its "v" (a hash of the file) is part of it, so a file rendered again
 * under the same name is fetched again instead of served from the audio cache.
 */
export const ttsUrl = (entry) => `${new URL(`../data/audio/${entry.f}`, import.meta.url).href}${entry.v ? `?v=${entry.v}` : ''}`;

/** The synthetic-voice file for a text: { f, d, w?, v } or null. */
export async function ttsEntry(text) {
  return (await ttsManifest()).texts[text] ?? null;
}

/** The credit line of the generated voice in use, in the interface language. */
export async function ttsCredit() {
  const v = TTS_VOICES[ttsVoice()];
  return t('audio.credit', { name: v.name, gender: t(`voices.${v.gender}`) });
}

export function stop() {
  cancelAnimationFrame(raf);
  if (current) {
    current.pause();
    current = null;
  }
  synth?.cancel();
  finish?.();
}

// Tells the menu music (js/music/background.js) to make room while Icelandic is spoken.
const speaking = (on) => window.dispatchEvent(new CustomEvent('tolva:speaking', { detail: on }));

// Wraps onWord/onEnd so the end callbacks run exactly once.
function ender(onWord, onEnd) {
  let done = false;
  const end = () => {
    if (done) return;
    done = true;
    if (finish === end) finish = null;
    speaking(false);
    onWord?.(-1);
    onEnd?.();
  };
  finish = end;
  speaking(true);
  return end;
}

function playFile(src, { rate, timings, onWord }) {
  const audio = new Audio(src);
  audio.preservesPitch = true;
  audio.playbackRate = rate;
  current = audio;
  let last = -2;
  const tick = () => {
    if (current !== audio) return;
    const i = timings ? timings.findIndex(([s, e]) => audio.currentTime >= s && audio.currentTime < e) : -1;
    if (i !== last) {
      last = i;
      onWord?.(i);
    }
    raf = requestAnimationFrame(tick);
  };
  const end = finish;
  audio.addEventListener('ended', () => {
    cancelAnimationFrame(raf);
    if (current === audio) current = null;
    end?.();
  }, { once: true });
  return audio.play().then(() => {
    if (onWord && timings) raf = requestAnimationFrame(tick);
  });
}

// Index of the word that starts at or contains a character offset.
function wordAt(text, charIndex) {
  let i = -1;
  for (const m of text.matchAll(/\p{L}+/gu)) {
    if (m.index > charIndex) break;
    i++;
  }
  return Math.max(i, 0);
}

/**
 * @param {{ text: string, url?: string, slow?: boolean, quiet?: boolean,
 *   onWord?: (i: number) => void, onEnd?: () => void }} item
 *   url: a human recording; quiet: no "no voice" message (for audio that only accompanies a tap);
 *   browser: skip the files and use the device voice (the voice test in Settings)
 * @returns {Promise<'recording'|'tts'|'browser'|'none'>}
 */
export async function play({ text, url, slow = false, quiet = false, browser = false, onWord, onEnd }) {
  stop();
  const end = ender(onWord, onEnd);
  const rate = (slow ? 0.75 : 1) * (Number(getSettings().rate) || 1);
  if (url && !browser) {
    try {
      await playFile(url, { rate, onWord });
      return 'recording';
    } catch {
      // Fall through to the synthetic voice.
    }
  }
  const entry = text && !browser ? await ttsEntry(text) : null;
  if (finish !== end) return 'none'; // stopped or replaced while the manifest loaded
  if (entry) {
    try {
      await playFile(ttsUrl(entry), { rate, timings: entry.w, onWord });
      return 'tts';
    } catch {
      // Fall through to the browser voice.
    }
  }
  const { voice } = getSettings();
  const options = icelandicVoices();
  const chosen = options.find((v) => v.voiceURI === voice) ?? options[0];
  if (!synth || !chosen || !text) {
    if (!quiet) toast(t('audio.none'));
    end();
    return 'none';
  }
  const u = new SpeechSynthesisUtterance(text);
  u.voice = chosen;
  u.lang = chosen.lang;
  u.rate = (slow ? 0.65 : 1) * (Number(getSettings().rate) || 1);
  u.onboundary = (e) => {
    if (e.name === 'word') onWord?.(wordAt(text, e.charIndex));
  };
  u.onend = end;
  u.onerror = end;
  synth.speak(u);
  return 'browser';
}
