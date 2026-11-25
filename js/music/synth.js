// The synthesizer of the menu music: every sound is made with the Web Audio API (no samples, no
// files). A "rig" holds the effects and the master chain for one mood; play() turns a composed event
// into sound at an exact time.
//
// Sounds: an analog-style drum machine (sine kick with a pitch drop, noise snare through a gated
// reverb, noise hats), a sawtooth bass with a sub square, detuned sawtooth pads with chorus, a pulse
// arpeggio through a dotted-eighth delay, an FM bell, a sawtooth lead with delayed vibrato, a bowed
// string and drone for the langspil, and for tvísöngur two "voices" made from a sawtooth through
// vowel formant filters (or distorted power fifths in Cyberpunk). Bass, pads and arpeggio duck on
// every kick (sidechain "pumping"); Dreamwave runs through a slow tape wobble.

import { freq } from './theory.js';

const VOWEL_A = [[730, 1, 9], [1090, 0.5, 11], [2440, 0.22, 14]]; // formant Hz, gain, Q: an open "a"

function noiseBuffer(ctx, seconds = 2) {
  const b = ctx.createBuffer(1, Math.floor(ctx.sampleRate * seconds), ctx.sampleRate);
  const d = b.getChannelData(0);
  let seed = 12345;
  for (let i = 0; i < d.length; i++) {
    seed = (seed * 1103515245 + 12345) >>> 0;
    d[i] = (seed / 4294967296) * 2 - 1;
  }
  return b;
}

/** A stereo impulse response: decaying noise (a hall), or flat then cut off (a gated reverb). */
function impulse(ctx, seconds, { gated = false, decay = 3 } = {}) {
  const len = Math.max(1, Math.floor(ctx.sampleRate * seconds));
  const b = ctx.createBuffer(2, len, ctx.sampleRate);
  let seed = 987;
  for (let ch = 0; ch < 2; ch++) {
    const d = b.getChannelData(ch);
    for (let i = 0; i < len; i++) {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      const n = (seed / 4294967296) * 2 - 1;
      const x = i / len;
      d[i] = n * (gated ? (x < 0.85 ? 0.9 : (1 - x) / 0.15) : (1 - x) ** decay);
    }
  }
  return b;
}

function shaper(ctx, amount) {
  const ws = ctx.createWaveShaper();
  const n = 1024;
  const curve = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const x = (i / (n - 1)) * 2 - 1;
    curve[i] = Math.tanh(amount * x) / Math.tanh(amount);
  }
  ws.curve = curve;
  ws.oversample = '2x';
  return ws;
}

function pulseWave(ctx, duty = 0.25) {
  const n = 32;
  const re = new Float32Array(n);
  const im = new Float32Array(n);
  for (let k = 1; k < n; k++) re[k] = (2 / (k * Math.PI)) * Math.sin(k * Math.PI * duty);
  return ctx.createPeriodicWave(re, im);
}

/**
 * Builds the effects and master chain for a mood. sound: the style's sound settings; tempo in bpm.
 * Returns { play(ev, t, stepSeconds), out (the master gain the player fades), setVolume, duck, stopAll }.
 */
export function createRig(ctx, sound, tempo, destination = ctx.destination) {
  const spb = 60 / tempo;
  const noise = noiseBuffer(ctx);
  const pulse = pulseWave(ctx, 0.25);
  const live = new Set();

  // Master: mix -> (wobble) -> high-pass -> glue compressor -> limiter -> volume -> duck -> fade.
  const mix = ctx.createGain();
  const hp = ctx.createBiquadFilter();
  hp.type = 'highpass';
  hp.frequency.value = 28;
  const glue = ctx.createDynamicsCompressor();
  glue.threshold.value = -16;
  glue.knee.value = 8;
  glue.ratio.value = 3;
  glue.attack.value = 0.01;
  glue.release.value = 0.25;
  const limiter = ctx.createDynamicsCompressor();
  limiter.threshold.value = -3;
  limiter.knee.value = 0;
  limiter.ratio.value = 20;
  limiter.attack.value = 0.002;
  limiter.release.value = 0.1;
  const volume = ctx.createGain();
  const duck = ctx.createGain();
  const out = ctx.createGain();
  out.gain.value = 0;
  if (sound.wobble) {
    // Tape wow: a short delay whose time drifts slowly bends the pitch a few cents up and down.
    const wow = ctx.createDelay(0.05);
    wow.delayTime.value = 0.008;
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.45;
    const depth = ctx.createGain();
    depth.gain.value = 0.0012 * sound.wobble;
    lfo.connect(depth).connect(wow.delayTime);
    lfo.start();
    live.add(lfo);
    mix.connect(wow).connect(hp);
  } else {
    mix.connect(hp);
  }
  hp.connect(glue).connect(limiter).connect(volume).connect(duck).connect(out).connect(destination);

  // Sidechain pump: bass, pads and arpeggio duck on every kick.
  const pumpBus = ctx.createGain();
  pumpBus.connect(mix);

  // Reverbs.
  const hall = ctx.createConvolver();
  hall.buffer = impulse(ctx, sound.reverb, { decay: 3.2 });
  const hallReturn = ctx.createGain();
  hallReturn.gain.value = 0.5;
  hall.connect(hallReturn).connect(mix);
  const gate = ctx.createConvolver();
  gate.buffer = impulse(ctx, 0.3, { gated: true });
  const gateReturn = ctx.createGain();
  gateReturn.gain.value = 0.6;
  gate.connect(gateReturn).connect(mix);

  // Ping-pong delay, dotted eighth by default, darkened on every repeat.
  const delayL = ctx.createDelay(2);
  const delayR = ctx.createDelay(2);
  delayL.delayTime.value = spb * sound.delayBeats;
  delayR.delayTime.value = spb * sound.delayBeats;
  const fb = ctx.createGain();
  fb.gain.value = 0.32;
  const tone = ctx.createBiquadFilter();
  tone.type = 'lowpass';
  tone.frequency.value = 3200;
  const merger = ctx.createChannelMerger(2);
  const delayIn = ctx.createGain();
  delayIn.connect(delayL);
  delayL.connect(merger, 0, 0);
  delayL.connect(delayR);
  delayR.connect(merger, 0, 1);
  delayR.connect(tone).connect(fb).connect(delayL);
  const delayReturn = ctx.createGain();
  delayReturn.gain.value = 0.3;
  merger.connect(delayReturn).connect(mix);

  // Chorus for pads: two modulated delays, one per side.
  const chorusIn = ctx.createGain();
  const chorusMerge = ctx.createChannelMerger(2);
  for (let side = 0; side < 2; side++) {
    const d = ctx.createDelay(0.05);
    d.delayTime.value = 0.016 + side * 0.005;
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.27 + side * 0.08;
    const g = ctx.createGain();
    g.gain.value = 0.0035;
    lfo.connect(g).connect(d.delayTime);
    lfo.start();
    live.add(lfo);
    chorusIn.connect(d).connect(chorusMerge, 0, side);
  }
  const chorusOut = ctx.createGain();
  chorusOut.gain.value = 0.8;
  chorusMerge.connect(chorusOut).connect(pumpBus);
  chorusIn.connect(pumpBus);

  // Distortion for Cyberpunk's bass; the shaper's output is loud, so it is turned down after.
  const drive = sound.drive ? shaper(ctx, 2.5 + 2 * sound.drive) : null;
  if (drive) {
    const trim = ctx.createGain();
    trim.gain.value = 0.32;
    drive.connect(trim).connect(pumpBus);
  }

  const send = (node, { hallAmt = 0, delayAmt = 0, gateAmt = 0 } = {}) => {
    if (hallAmt) {
      const g = ctx.createGain();
      g.gain.value = hallAmt;
      node.connect(g).connect(hall);
    }
    if (delayAmt) {
      const g = ctx.createGain();
      g.gain.value = delayAmt;
      node.connect(g).connect(delayIn);
    }
    if (gateAmt) {
      const g = ctx.createGain();
      g.gain.value = gateAmt;
      node.connect(g).connect(gate);
    }
  };

  const track = (src, end) => {
    live.add(src);
    src.onended = () => live.delete(src);
    src.stop(end);
  };

  const noiseSrc = (t, end) => {
    const s = ctx.createBufferSource();
    s.buffer = noise;
    s.loop = true;
    s.start(t, Math.random() * 1.5);
    track(s, end);
    return s;
  };

  const panNode = (value) => {
    const p = ctx.createStereoPanner();
    p.pan.value = value;
    return p;
  };

  // Attack, decay to sustain, release at `end`.
  const adsr = (param, t, end, { a = 0.005, d = 0.1, s = 0.6, r = 0.1, peak = 1 }) => {
    param.setValueAtTime(0, t);
    param.linearRampToValueAtTime(peak, t + a);
    param.setTargetAtTime(peak * s, t + a, Math.max(0.001, d / 3));
    param.setTargetAtTime(0, Math.max(end, t + a + 0.001), Math.max(0.001, r / 3));
  };

  const vibrato = (osc, t, end, { rate = 5.5, cents = 12, delay = 0.25 } = {}) => {
    const lfo = ctx.createOscillator();
    lfo.frequency.value = rate;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(cents, t + delay + 0.2);
    lfo.connect(g);
    for (const o of [osc].flat()) g.connect(o.detune);
    lfo.start(t);
    track(lfo, end);
  };

  const INSTRUMENTS = {
    kick(t, v) {
      const o = ctx.createOscillator();
      o.frequency.setValueAtTime(150, t);
      o.frequency.exponentialRampToValueAtTime(45, t + 0.11);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.95 * v, t);
      g.gain.exponentialRampToValueAtTime(0.0005, t + 0.42);
      o.connect(g).connect(mix);
      o.start(t);
      track(o, t + 0.45);
      // Sidechain: the pump bus dips and recovers within a beat.
      const depth = 1 - sound.pump;
      pumpBus.gain.cancelScheduledValues(t);
      pumpBus.gain.setValueAtTime(1, t);
      pumpBus.gain.linearRampToValueAtTime(depth, t + 0.012);
      pumpBus.gain.setTargetAtTime(1, t + 0.03, spb * 0.22);
    },
    snare(t, v) {
      const n = noiseSrc(t, t + 0.3);
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.value = 1900;
      bp.Q.value = 0.7;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.7 * v, t);
      g.gain.exponentialRampToValueAtTime(0.0005, t + 0.2);
      n.connect(bp).connect(g).connect(mix);
      const o = ctx.createOscillator();
      o.type = 'triangle';
      o.frequency.setValueAtTime(200, t);
      o.frequency.exponentialRampToValueAtTime(160, t + 0.08);
      const og = ctx.createGain();
      og.gain.setValueAtTime(0.4 * v, t);
      og.gain.exponentialRampToValueAtTime(0.0005, t + 0.12);
      o.connect(og).connect(mix);
      o.start(t);
      track(o, t + 0.15);
      send(g, { gateAmt: 0.9, hallAmt: 0.12 });
    },
    hat(t, v, open = false) {
      const len = open ? 0.28 : 0.045;
      const n = noiseSrc(t, t + len + 0.02);
      const f = ctx.createBiquadFilter();
      f.type = 'highpass';
      f.frequency.value = 6500;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.28 * v, t);
      g.gain.exponentialRampToValueAtTime(0.0005, t + len);
      n.connect(f).connect(g).connect(mix);
      if (open) send(g, { hallAmt: 0.1 });
    },
    ohat(t, v) {
      INSTRUMENTS.hat(t, v, true);
    },
    crash(t, v) {
      const n = noiseSrc(t, t + 2);
      const f = ctx.createBiquadFilter();
      f.type = 'highpass';
      f.frequency.value = 4500;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.06 * v, t);
      g.gain.exponentialRampToValueAtTime(0.0005, t + 1.8);
      n.connect(f).connect(g).connect(mix);
      send(g, { hallAmt: 0.4 });
    },
    bass(t, v, midi, dur) {
      const end = t + dur * 0.92;
      const f = freq(midi);
      const saw = ctx.createOscillator();
      saw.type = 'sawtooth';
      saw.frequency.value = f;
      const sub = ctx.createOscillator();
      sub.type = 'square';
      sub.frequency.value = f / 2 >= 35 ? f / 2 : f; // no sub below hearing
      const subG = ctx.createGain();
      subG.gain.value = 0.35;
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.Q.value = 4;
      lp.frequency.setValueAtTime(1500 + 900 * (sound.drive || 0), t);
      lp.frequency.setTargetAtTime(320, t + 0.005, 0.06);
      const g = ctx.createGain();
      adsr(g.gain, t, end, { a: 0.004, d: 0.15, s: 0.7, r: 0.04, peak: 0.15 * v });
      saw.connect(lp);
      sub.connect(subG).connect(lp);
      lp.connect(g).connect(drive ?? pumpBus);
      for (const o of [saw, sub]) {
        o.start(t);
        track(o, end + 0.1);
      }
    },
    pad(t, v, midi, dur) {
      const end = t + dur;
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = sound.wobble ? 1300 : 1700;
      lp.Q.value = 0.6;
      const g = ctx.createGain();
      adsr(g.gain, t, end, { a: 0.6, d: 1, s: 0.85, r: 1.1, peak: 0.032 * v });
      const oscs = [-9, 0, 9].map((cents) => {
        const o = ctx.createOscillator();
        o.type = 'sawtooth';
        o.frequency.value = freq(midi);
        o.detune.value = cents;
        o.connect(lp);
        o.start(t);
        track(o, end + 1.5);
        return o;
      });
      lp.connect(g).connect(chorusIn);
      send(g, { hallAmt: 0.5 });
      return oscs;
    },
    arp(t, v, midi, dur) {
      const end = t + Math.min(dur * 0.9, 0.3);
      const o = ctx.createOscillator();
      o.setPeriodicWave(pulse);
      o.frequency.value = freq(midi);
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.Q.value = 3;
      lp.frequency.setValueAtTime(3600, t);
      lp.frequency.setTargetAtTime(900, t, 0.05);
      const hp2 = ctx.createBiquadFilter();
      hp2.type = 'highpass';
      hp2.frequency.value = 300;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.11 * v, t);
      g.gain.exponentialRampToValueAtTime(0.0005, end + 0.1);
      o.connect(lp).connect(hp2).connect(g).connect(pumpBus);
      send(g, { delayAmt: 0.5, hallAmt: 0.25 });
      o.start(t);
      track(o, end + 0.15);
    },
    bell(t, v, midi, dur) {
      // Two-operator FM: a modulator at twice the pitch whose depth fades, an electric-piano bell.
      const end = t + dur;
      const f = freq(midi);
      const car = ctx.createOscillator();
      car.frequency.value = f;
      const mod = ctx.createOscillator();
      mod.frequency.value = f * 2;
      const idx = ctx.createGain();
      idx.gain.setValueAtTime(f * 2.2, t);
      idx.gain.setTargetAtTime(f * 0.25, t, 0.25);
      mod.connect(idx).connect(car.frequency);
      const g = ctx.createGain();
      adsr(g.gain, t, end, { a: 0.004, d: 1.2, s: 0.25, r: 0.5, peak: 0.19 * v });
      car.connect(g).connect(mix);
      send(g, { hallAmt: 0.45, delayAmt: 0.25 });
      for (const o of [car, mod]) {
        o.start(t);
        track(o, end + 0.8);
      }
    },
    lead(t, v, midi, dur) {
      const end = t + dur * 0.95;
      const f = freq(midi);
      const oscs = [-6, 6].map((c) => {
        const o = ctx.createOscillator();
        o.type = 'sawtooth';
        o.frequency.value = f;
        o.detune.value = c;
        return o;
      });
      const sq = ctx.createOscillator();
      sq.type = 'square';
      sq.frequency.value = f / 2;
      const sqG = ctx.createGain();
      sqG.gain.value = 0.3;
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.Q.value = 2;
      lp.frequency.setValueAtTime(sound.wobble ? 2000 : 3200, t);
      lp.frequency.setTargetAtTime(sound.wobble ? 1400 : 2200, t + 0.02, 0.2);
      const g = ctx.createGain();
      adsr(g.gain, t, end, { a: 0.012, d: 0.3, s: 0.8, r: 0.18, peak: 0.1 * v });
      for (const o of oscs) o.connect(lp);
      sq.connect(sqG).connect(lp);
      if (sound.drive) lp.connect(shaper(ctx, 3)).connect(g);
      else lp.connect(g);
      g.connect(mix);
      send(g, { hallAmt: 0.35, delayAmt: 0.3 });
      vibrato([...oscs, sq], t, end + 0.3, { cents: 14 });
      for (const o of [...oscs, sq]) {
        o.start(t);
        track(o, end + 0.3);
      }
    },
    pluck(t, v, midi, dur) {
      const end = t + Math.min(dur * 0.9, 0.6);
      const o = ctx.createOscillator();
      o.type = 'sawtooth';
      o.frequency.value = freq(midi);
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.Q.value = 6;
      lp.frequency.setValueAtTime(4200, t);
      lp.frequency.setTargetAtTime(700, t, 0.08);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.09 * v, t);
      g.gain.exponentialRampToValueAtTime(0.0005, end + 0.2);
      o.connect(lp).connect(g).connect(mix);
      send(g, { delayAmt: 0.35, hallAmt: 0.3 });
      o.start(t);
      track(o, end + 0.25);
    },
    string(t, v, midi, dur) {
      // The langspil's melody string, bowed.
      const end = t + dur;
      const o = ctx.createOscillator();
      o.type = 'sawtooth';
      o.frequency.value = freq(midi);
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 2200;
      lp.Q.value = 1.5;
      const body = ctx.createBiquadFilter();
      body.type = 'peaking';
      body.frequency.value = 450;
      body.gain.value = 6;
      const g = ctx.createGain();
      adsr(g.gain, t, end, { a: 0.14, d: 0.4, s: 0.85, r: 0.35, peak: 0.07 * v });
      o.connect(lp).connect(body).connect(g).connect(mix);
      send(g, { hallAmt: 0.6 });
      vibrato(o, t, end + 0.4, { rate: 5, cents: 9, delay: 0.3 });
      o.start(t);
      track(o, end + 0.5);
    },
    drone(t, v, midi, dur) {
      // The langspil's drone strings.
      const end = t + dur;
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 900;
      const g = ctx.createGain();
      adsr(g.gain, t, end, { a: 1.2, d: 1, s: 0.9, r: 2, peak: 0.05 * v });
      for (const [type, c] of [['sawtooth', -4], ['triangle', 4]]) {
        const o = ctx.createOscillator();
        o.type = type;
        o.frequency.value = freq(midi);
        o.detune.value = c;
        o.connect(lp);
        o.start(t);
        track(o, end + 2.5);
      }
      lp.connect(g).connect(mix);
      send(g, { hallAmt: 0.5 });
    },
    voice(t, v, midi, dur, pan, inst) {
      const end = t + dur * 0.97;
      const o = ctx.createOscillator();
      o.type = 'sawtooth';
      o.frequency.value = freq(midi);
      const g = ctx.createGain();
      const p = panNode(pan);
      if (inst === 'power') {
        const sq = ctx.createOscillator();
        sq.type = 'square';
        sq.frequency.value = freq(midi);
        sq.detune.value = 7;
        const ws = shaper(ctx, 5);
        const lp = ctx.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.value = 2600;
        o.connect(ws);
        sq.connect(ws);
        ws.connect(lp).connect(g);
        adsr(g.gain, t, end, { a: 0.02, d: 0.3, s: 0.8, r: 0.25, peak: 0.07 * v });
        sq.start(t);
        track(sq, end + 0.4);
        vibrato([o, sq], t, end + 0.4, { cents: 10, delay: 0.35 });
      } else {
        // Formant filters shape the sawtooth into a sung "a".
        for (const [fq, gain, q] of VOWEL_A) {
          const bp = ctx.createBiquadFilter();
          bp.type = 'bandpass';
          bp.frequency.value = fq;
          bp.Q.value = q;
          const fg = ctx.createGain();
          fg.gain.value = gain * 3.2;
          o.connect(bp).connect(fg).connect(g);
        }
        adsr(g.gain, t, end, { a: 0.12, d: 0.4, s: 0.9, r: 0.35, peak: 0.16 * v });
        vibrato(o, t, end + 0.4, { rate: 5.2, cents: 18, delay: 0.3 });
      }
      g.connect(p).connect(mix);
      send(g, { hallAmt: 0.55, delayAmt: 0.12 });
      o.start(t);
      track(o, end + 0.4);
    },
    wind(t, v, _midi, dur) {
      // Wind across the bridge: band-passed noise whose center drifts.
      const end = t + dur;
      const n = noiseSrc(t, end + 2);
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.Q.value = 1.2;
      bp.frequency.value = 700;
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.09;
      const depth = ctx.createGain();
      depth.gain.value = 380;
      lfo.connect(depth).connect(bp.frequency);
      lfo.start(t);
      track(lfo, end + 2);
      const g = ctx.createGain();
      adsr(g.gain, t, end, { a: 2.5, d: 1, s: 1, r: 2, peak: 0.07 * v });
      n.connect(bp).connect(g).connect(mix);
      send(g, { hallAmt: 0.3 });
    },
  };

  const MELODY = { bell: 'bell', lead: 'lead', pluck: 'pluck', string: 'string' };

  return {
    out,
    /** Plays one composed event at time t; stepSeconds converts its length. */
    play(ev, t, stepSeconds, remaining = null) {
      const dur = (remaining ?? ev.dur) * stepSeconds;
      const v = ev.vel ?? 1;
      switch (ev.part) {
        case 'melody':
          return INSTRUMENTS[MELODY[ev.inst] ?? 'lead'](t, v, ev.midi, dur);
        case 'duet1':
          return INSTRUMENTS.voice(t, v, ev.inst === 'power' ? ev.midi - 12 : ev.midi, dur, -0.35, ev.inst);
        case 'duet2':
          return INSTRUMENTS.voice(t, v, ev.inst === 'power' ? ev.midi - 12 : ev.midi, dur, 0.35, ev.inst);
        default:
          return INSTRUMENTS[ev.part]?.(t, v, ev.midi, dur);
      }
    },
    setVolume(v, at = ctx.currentTime) {
      volume.gain.setTargetAtTime(v, at, 0.05);
    },
    duck(on, at = ctx.currentTime) {
      duck.gain.cancelScheduledValues(at);
      duck.gain.setTargetAtTime(on ? 0.15 : 1, at, on ? 0.05 : 0.25);
    },
    /** Silences everything now (the master fade is the player's). */
    stopAll() {
      for (const s of live) {
        try {
          s.stop();
        } catch {
          // already stopped
        }
      }
      live.clear();
    },
    disconnect() {
      out.disconnect();
    },
  };
}
