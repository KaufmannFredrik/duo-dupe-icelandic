// Plays composed songs on time: a lookahead scheduler (a timer every 40 ms schedules the next
// 0.2 s of notes on the audio clock, so timer jitter never reaches the sound). When a song ends the
// next one starts, composed with the next seed, so the music never loops note for note.

import { hashSeed } from '../engine/rng.js';
import { STEPS, compose } from './compose.js';
import { STYLES } from './styles.js';
import { createRig } from './synth.js';

const LOOKAHEAD = 0.2;
const TICK_MS = 40;
// Parts whose notes are long enough to be worth starting late when playback joins mid-note.
const SUSTAINED = new Set(['pad', 'drone', 'wind', 'duet1', 'duet2', 'melody', 'bass']);
const DRUMS = new Set(['kick', 'snare', 'hat', 'ohat', 'crash']);

/**
 * A player for one mood. options: { seed, volume (0 to 1), calm (no drums), onBar({ bar, cycle,
 * section, at, label, song }) }. start(bar) starts at an absolute bar (0 is the intro of the first
 * song), fading in.
 */
export function createPlayer(ctx, styleId, { seed = 1, volume = 0.5, calm = false, onBar = null, destination } = {}) {
  const style = STYLES[styleId];
  const stepSec = 60 / style.tempo / 4;
  const rig = createRig(ctx, style.sound, style.tempo, destination);
  rig.setVolume(volume);
  const songs = new Map();
  const songFor = (cycle) => {
    if (!songs.has(cycle)) {
      songs.set(cycle, compose(styleId, hashSeed(`${seed}:${cycle}`)));
      for (const c of songs.keys()) if (c < cycle - 1) songs.delete(c);
    }
    return songs.get(cycle);
  };
  const length = style.form.length * 8;
  let t0 = 0; // audio time of absolute step 0
  let next = 0; // next absolute step to schedule
  let timer = 0;
  let running = false;
  const pendingUi = new Set();

  const barAt = (barAbs) => {
    const cycle = Math.floor(barAbs / length);
    const song = songFor(cycle);
    return { cycle, song, bar: song.bars[barAbs % length] };
  };

  function notify(barAbs, t) {
    if (!onBar) return;
    const { cycle, song, bar } = barAt(barAbs);
    const id = setTimeout(() => {
      pendingUi.delete(id);
      if (running) onBar({ bar: barAbs, cycle, section: bar.section, at: bar.at, label: bar.label, song, events: bar.events });
    }, Math.max(0, (t - ctx.currentTime) * 1000));
    pendingUi.add(id);
  }

  function tick() {
    const horizon = ctx.currentTime + LOOKAHEAD;
    while (t0 + next * stepSec < horizon) {
      const t = t0 + next * stepSec;
      const barAbs = Math.floor(next / STEPS);
      const step = next % STEPS;
      const { bar } = barAt(barAbs);
      for (const ev of bar.events) if (ev.step === step && !(calm && DRUMS.has(ev.part))) rig.play(ev, Math.max(t, ctx.currentTime), stepSec);
      if (step === 0) notify(barAbs, t);
      next++;
    }
  }

  // Notes that began before the starting point and still sound there start now, shortened.
  function joinSustained(fromStep, at) {
    const firstBar = Math.max(0, Math.floor(fromStep / STEPS) - 8);
    for (let b = firstBar; b <= Math.floor(fromStep / STEPS); b++) {
      const { bar } = barAt(b);
      for (const ev of bar.events) {
        const start = b * STEPS + ev.step;
        const left = start + ev.dur - fromStep;
        if (start < fromStep && left > 2 && SUSTAINED.has(ev.part)) rig.play(ev, at, stepSec, left);
      }
    }
  }

  return {
    style: styleId,
    stepSec,
    barSeconds: stepSec * STEPS,
    length,
    /** Starts at an absolute bar, or at a position in bars (fractions join mid-bar). */
    start(position = 0, { fade = 1.2 } = {}) {
      const now = ctx.currentTime + 0.06;
      const fromStep = Math.ceil(position * STEPS);
      t0 = now - fromStep * stepSec;
      next = fromStep;
      running = true;
      joinSustained(fromStep, now);
      if (fromStep % STEPS !== 0) notify(Math.floor(fromStep / STEPS), now);
      rig.out.gain.cancelScheduledValues(now);
      rig.out.gain.setValueAtTime(0, now);
      rig.out.gain.linearRampToValueAtTime(1, now + fade);
      tick();
      timer = setInterval(tick, TICK_MS);
    },
    /** Fades out and releases everything; resolves when silent. */
    stop({ fade = 0.6 } = {}) {
      running = false;
      clearInterval(timer);
      for (const id of pendingUi) clearTimeout(id);
      pendingUi.clear();
      const now = ctx.currentTime;
      rig.out.gain.cancelScheduledValues(now);
      rig.out.gain.setValueAtTime(rig.out.gain.value, now);
      rig.out.gain.linearRampToValueAtTime(0, now + fade);
      return new Promise((resolve) =>
        setTimeout(() => {
          rig.stopAll();
          rig.disconnect();
          resolve();
        }, fade * 1000 + 50),
      );
    },
    /** The current position in bars (fractional). */
    position() {
      return Math.max(0, (ctx.currentTime - t0) / (stepSec * STEPS));
    },
    /** The first bar of a section in the current song. */
    sectionBar(name) {
      const cycle = Math.floor(this.position() / length);
      return cycle * length + (songFor(cycle).starts[name] ?? 0);
    },
    setVolume: (v) => rig.setVolume(v),
    duck: (on) => rig.duck(on),
    get running() {
      return running;
    },
  };
}

/** Maps the 0 to 100 volume setting to gain: a square law, so the slider feels even to the ear. */
export const volumeGain = (setting) => (Math.max(0, Math.min(100, setting)) / 100) ** 2;
