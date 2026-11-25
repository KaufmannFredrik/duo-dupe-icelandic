// Menu music in the app, when the learner has turned it on (Settings, or the note button in the
// top bar). Each screen has a mood; lessons, Letters and sounds, Voices, the story reader and the
// Music lab are silent. Icelandic audio always wins: the music drops to 15% while a word or sentence
// plays (the 'tolva:speaking' event from js/audio.js) and stops while the microphone listens
// ('tolva:listening' from js/speech.js). It pauses in a hidden tab. In Calm mode every screen plays
// Dreamwave, without drums and quieter. After a good moment the Happy mood takes over the driving
// screens for a few minutes (js/music/mood.js).
//
// Across pages: the song's position is kept in sessionStorage, so the next page of the same mood
// picks it up where it was (a page change takes a moment); after a longer break, or on a new day,
// a new song starts from its intro. Chrome lets audio start on a page reached from a page of the
// same origin; other browsers wait for the first tap or key press.

import { getSettings } from '../store.js';
import { audioContext, unlock } from '../audio-context.js';
import { dayKey } from '../stats.js';
import { hashSeed } from '../engine/rng.js';
import { createPlayer, volumeGain } from './player.js';
import { STYLES } from './styles.js';
import { happyMood, isHappy } from './mood.js';

/** The mood of each screen, by file name. Screens not listed have no music. */
export const PAGE_MOODS = {
  '': 'synthwave',
  'index.html': 'synthwave',
  'learn.html': 'synthwave',
  'profile.html': 'synthwave',
  'practice.html': 'cyberpunk',
  'guide.html': 'dreamwave',
  'dictionary.html': 'dreamwave',
  'declension.html': 'dreamwave',
  'stories.html': 'dreamwave',
  'bridge.html': 'dreamwave',
  'settings.html': 'dreamwave',
  'credits.html': 'dreamwave',
};

const CALM_GAIN = 0.6;
const CONTINUE_WITHIN = 20; // seconds: a page change shorter than this continues the song
const STATE_KEY = 'tolva.music.v1';

/** The mood for a URL, or null for a silent screen. Calm mode outranks a happy spell. */
export function pageMood(href, calm = false, happy = false) {
  const url = new URL(href);
  const file = url.pathname.split('/').pop();
  if (file === 'stories.html' && url.searchParams.has('story')) return null; // the reader is narrated
  const mood = PAGE_MOODS[file] ?? null;
  if (!mood) return null;
  return calm ? 'dreamwave' : happyMood(mood, happy);
}

/**
 * Where a mood's song should start, in bars, from the saved state ({ pos, at, day } or undefined):
 * where it was, if the page change was quick; otherwise a new song, at `entry` (its intro, or
 * Happy's chorus).
 */
export function resumePosition(saved, { now, day, barSeconds, length, entry = 0 }) {
  if (!saved || saved.day !== day) return entry;
  const elapsed = (now - saved.at) / 1000;
  if (elapsed >= 0 && elapsed < CONTINUE_WITHIN) return saved.pos + elapsed / barSeconds;
  return (Math.floor(saved.pos / length) + 1) * length + entry;
}

const readState = () => {
  try {
    return JSON.parse(sessionStorage.getItem(STATE_KEY) ?? '{}');
  } catch {
    return {};
  }
};
const writeState = (state) => {
  try {
    sessionStorage.setItem(STATE_KEY, JSON.stringify(state));
  } catch {
    // Without storage the next page starts its song from the intro.
  }
};

let player = null;
let mood = null;
let playingCalm = false;
let started = false;
let listening = false;
let speaking = false;
let waiting = null; // removes the listeners that wait for the browser to allow audio

const calm = () => document.documentElement.dataset.calm === 'on';
const gain = () => volumeGain(getSettings().musicVolume) * (calm() ? CALM_GAIN : 1);

function save() {
  if (!player?.running) return;
  const state = readState();
  state[player.style] = { pos: player.position(), at: Date.now(), day: dayKey() };
  writeState(state);
}

function stop(fade = 0.6) {
  save();
  player?.stop({ fade });
  player = null;
}

function wanted() {
  if (!getSettings().music || listening || document.hidden) return null;
  return pageMood(location.href, calm(), isHappy());
}

// Waits until the browser lets audio play: the first tap, click or key press, or the context
// starting by itself.
function waitForAudio(ctx) {
  if (waiting) return;
  const events = ['pointerup', 'click', 'keydown'];
  const gesture = () => unlock().then((ok) => ok && sync());
  const state = () => ctx.state === 'running' && sync();
  for (const ev of events) document.addEventListener(ev, gesture, true);
  ctx.addEventListener('statechange', state);
  waiting = () => {
    for (const ev of events) document.removeEventListener(ev, gesture, true);
    ctx.removeEventListener('statechange', state);
    waiting = null;
  };
}

function sync() {
  const next = wanted();
  const c = calm();
  if (player && next === mood && c === playingCalm) {
    player.setVolume(gain());
    return;
  }
  if (player) stop(next ? 0.8 : 0.6);
  mood = null;
  if (!next) return;
  const ctx = audioContext();
  if (ctx.state !== 'running') {
    waitForAudio(ctx);
    return;
  }
  waiting?.();
  mood = next;
  playingCalm = c;
  const style = STYLES[next];
  const p = createPlayer(ctx, next, { seed: hashSeed(`${dayKey()}:${next}`), volume: gain(), calm: c });
  const entry = next === 'glad' ? style.form.indexOf('chorus') * 8 : 0; // a happy spell starts at the chorus
  const pos = resumePosition(readState()[next], { now: Date.now(), day: dayKey(), barSeconds: p.barSeconds, length: style.form.length * 8, entry });
  player = p;
  p.start(pos, { fade: pos > 0 ? 1.5 : 2.5 });
  if (speaking) p.duck(true);
}

/** Starts the music service on this page (idempotent). */
export function initMusic() {
  if (started) return;
  started = true;
  window.addEventListener('tolva:settings', (e) => {
    const key = e.detail?.key;
    if (!key || key === 'music' || key === 'musicVolume' || key === 'calm') sync();
  });
  window.addEventListener('tolva:happy', sync);
  window.addEventListener('tolva:speaking', (e) => {
    speaking = Boolean(e.detail);
    player?.duck(speaking);
  });
  window.addEventListener('tolva:listening', (e) => {
    listening = Boolean(e.detail);
    sync();
  });
  document.addEventListener('visibilitychange', sync);
  window.addEventListener('pagehide', save);
  // Calm mode can also follow the device (reduced motion and contrast), applied by js/app.js.
  new MutationObserver(sync).observe(document.documentElement, { attributes: true, attributeFilter: ['data-calm'] });
  sync();
}
