// Composes a song for a mood: chords, voicings, bass, arpeggios, drums, a melody per section and
// the tvísöngur bridge. Pure and seeded (the same style and seed always give the same song), so
// the tests can check every note against the rules in js/music/theory.js.
//
// Melodies are built the way Open Music Theory describes phrases: verses are periods (a 4-bar
// antecedent ending open, on a chord tone other than the tonic, answered by a consequent that
// starts the same way and ends on the tonic, approached by step); choruses are sentences (a 2-bar
// basic idea, its repetition moved with the chords, and a 4-bar continuation with shorter notes
// that ends on the tonic). Notes on the beat are chord tones; notes off the beat may be passing or
// neighbor tones (approached and left by step). Each phrase has a single high point.
//
// The tvísöngur bridge follows the sources on Icelandic two-part singing: note against note in
// parallel perfect fifths, slow, the voices crossing once and meeting on the same note, the second
// voice ending on the note the first voice began with, and a held final note. Here the crossing is a
// voice exchange in contrary stepwise motion (fifth, third, unison, third, fifth), and both voices
// stay in the mode: the lower voice of a fifth never sits where its fifth would fall outside it.

import { hashSeed, rng } from '../engine/rng.js';
import { STYLES } from './styles.js';
import { chord, inKey, key, melodyProblems, intervalOk, mod12, scaleRange, stepScale, voiceChord } from './theory.js';

export const STEPS = 16; // sixteenth notes per 4/4 bar

const RHYTHMS = {
  synth: {
    basic: [
      [[0, 4], [4, 2], [6, 2], [8, 6], [14, 2]],
      [[0, 6], [6, 2], [8, 4], [12, 4]],
      [[0, 2], [2, 2], [4, 4], [8, 4], [12, 2], [14, 2]],
      [[0, 4], [4, 4], [8, 8]],
      [[0, 6], [6, 2], [8, 8]],
    ],
    fragment: [
      [[0, 2], [2, 2], [4, 2], [6, 2], [8, 4], [12, 4]],
      [[0, 4], [4, 2], [6, 2], [8, 2], [10, 2], [12, 4]],
      [[0, 2], [2, 2], [4, 4], [8, 2], [10, 2], [12, 4]],
    ],
    end: [[[0, 12]], [[0, 4], [4, 12]], [[0, 8], [8, 8]]],
    close: [[[0, 12]], [[0, 16]]],
  },
  slow: {
    basic: [
      [[0, 8], [8, 8]],
      [[0, 4], [4, 4], [8, 8]],
      [[0, 12], [12, 4]],
      [[0, 6], [6, 2], [8, 8]],
      [[0, 8], [8, 6], [14, 2]],
    ],
    fragment: [
      [[0, 4], [4, 4], [8, 4], [12, 4]],
      [[0, 4], [4, 2], [6, 2], [8, 8]],
      [[0, 4], [4, 4], [8, 4], [12, 2], [14, 2]],
    ],
    end: [[[0, 16]], [[0, 8], [8, 8]]],
    close: [[[0, 16]]],
  },
};

// Note-against-note rhythms of the bridge in sixteenths: phase A (lower voice below), the crossing
// (five notes), phase B (lower voice above), then the final note held for two bars.
const DUET_RHYTHMS = [
  { a: [8, 4, 4, 8, 8, 8], x: [4, 4, 4, 4, 8], b: [8, 8, 8, 8] },
  { a: [8, 8, 4, 4, 8, 8], x: [8, 4, 4, 4, 4], b: [8, 8, 8, 8] },
  { a: [8, 4, 4, 4, 4, 8, 8], x: [4, 4, 4, 4, 4], b: [8, 8, 8, 8, 4] },
];
const DUET_FINAL = 32;

const pick = (arr, rand) => arr[Math.floor(rand() * arr.length)];

/** The key a bar's melody uses: the style's key, or the mode a borrowed chord comes from. */
function barKey(style, k, token) {
  const mode = style.borrow?.[token.split('/')[0]];
  return mode ? key(k.tonic, mode) : k;
}

// --- Melody ---------------------------------------------------------------------------------------

/** The scale steps from one chord root to another, the shorter way (-3 to +3). */
function rootShift(k, fromPc, toPc) {
  const a = k.pcs.indexOf(fromPc);
  const b = k.pcs.indexOf(toPc);
  if (a < 0 || b < 0) return 0;
  let s = (b - a + 7) % 7;
  if (s > 3) s -= 7;
  return s;
}

/**
 * Plans the notes of an 8-bar phrase: onsets, lengths, the chord and key under each, what each note
 * must be (chord tone on the beat, cadence), and which earlier note it repeats or sequences.
 */
function planPhrase(form, bars, rhythm, rand, k) {
  const R = RHYTHMS[rhythm];
  const b1 = pick(R.basic, rand);
  const b2 = pick(R.basic, rand);
  // The final tonic is one long note approached by step. Before a cadence on the same chord, the bar
  // ends on a short note off the beat, so that step can be a passing or neighbor tone.
  const weakEnd = (r) => {
    const [step, dur] = r[r.length - 1];
    return step % 4 !== 0 && dur < 4;
  };
  const pre = (bar) => {
    const options = bars[bar].chord.token === bars[bar + 1].chord.token ? [...R.basic, ...R.fragment].filter(weakEnd) : R.basic;
    return pick(options, rand);
  };
  const plan = []; // per bar: { rhythm, model: bar index it copies, cadence: 'open'|'closed'|null }
  if (form === 'sentence') {
    const f1 = pick(R.fragment, rand);
    const f2 = pick(R.fragment, rand);
    plan.push({ r: b1 }, { r: b2 }, { r: b1, model: 0 }, { r: b2, model: 1 }, { r: f1 }, { r: f2 }, { r: pre(6) }, { r: pick(R.close, rand), cadence: 'closed' });
  } else {
    plan.push({ r: b1 }, { r: b2 }, { r: pre(2) }, { r: pick(R.end, rand), cadence: 'open' }, { r: b1, model: 0 }, { r: b2, model: 1 }, { r: pre(6) }, { r: pick(R.close, rand), cadence: 'closed' });
  }
  const notes = [];
  const firstOfBar = [];
  plan.forEach((p, bar) => {
    firstOfBar[bar] = notes.length;
    p.r.forEach(([step, dur], j) => {
      const last = j === p.r.length - 1;
      notes.push({
        bar,
        step,
        dur,
        chord: bars[bar].chord,
        key: bars[bar].key,
        onBeat: step % 4 === 0 || dur >= 4,
        cadence: last && p.cadence ? p.cadence : null,
        model: p.model !== undefined ? { bar: p.model, j } : null,
      });
    });
  });
  for (const n of notes) {
    if (!n.model) continue;
    const src = firstOfBar[n.model.bar] + n.model.j;
    n.modelIndex = src;
    n.shift = rootShift(k, notes[src].chord.rootPc, n.chord.rootPc);
  }
  return notes;
}

/**
 * Chooses the pitches of planned notes with a depth-first search that tries the most melodic
 * candidates first and backs up when a rule fails. Returns the pitches or null.
 */
function searchMelody(notes, { low, high, tonic, rand, form, budget = 3000 }) {
  // The single high point: a chord tone on a beat in the continuation of a sentence (bars 5 to 7),
  // or where the consequent of a period leaves the antecedent's path (bars 6 and 7).
  const [z0, z1] = form === 'sentence' ? [4, 6] : [5, 6];
  const zone = notes.map((n, i) => i).filter((i) => notes[i].bar >= z0 && notes[i].bar <= z1 && notes[i].onBeat && !notes[i].cadence);
  if (!zone.length) return null;
  const c = pick(zone, rand);
  const hiOptions = scaleRange(notes[c].key, Math.max(low, high - 5), high).filter((m) => notes[c].chord.pcs.includes(mod12(m)));
  if (!hiOptions.length) return null;
  const H = pick(hiOptions, rand);
  const floor = Math.max(low, H - 15);
  const m = new Array(notes.length);
  let steps = 0;

  const isChordTone = (i, p) => notes[i].chord.pcs.includes(mod12(p));

  function candidates(i) {
    const n = notes[i];
    if (i === c) return [H];
    let pool = scaleRange(n.key, floor, H - 1);
    if (n.onBeat || n.cadence) pool = pool.filter((p) => isChordTone(i, p));
    if (n.cadence === 'closed') pool = pool.filter((p) => mod12(p) === tonic);
    if (n.cadence === 'open') pool = pool.filter((p) => mod12(p) !== tonic);
    const prev = i > 0 ? m[i - 1] : null;
    const prev2 = i > 1 ? m[i - 2] : null;
    const out = [];
    for (const p of pool) {
      if (prev !== null) {
        const d = p - prev;
        if (!intervalOk(d)) continue;
        if (prev2 !== null) {
          const pd = prev - prev2;
          if (Math.abs(pd) >= 5 && !(Math.abs(d) >= 1 && Math.abs(d) <= 2 && Math.sign(d) === -Math.sign(pd))) continue;
          if (Math.abs(pd) >= 3 && Math.abs(d) >= 3 && Math.sign(pd) === Math.sign(d)) {
            const arp = [prev2, prev, p].every((x) => n.chord.pcs.includes(mod12(x))) && Math.abs(p - prev2) <= 12;
            if (!arp) continue;
          }
          if (d === 0 && pd === 0) continue; // at most one repeat in a row
        }
        // A non-chord tone before this note must resolve by step to a chord tone.
        if (!isChordTone(i - 1, prev) && !(Math.abs(d) >= 1 && Math.abs(d) <= 2 && isChordTone(i, p))) continue;
        // A non-chord tone is approached by step.
        if (!isChordTone(i, p) && !(Math.abs(d) >= 1 && Math.abs(d) <= 2)) continue;
        if (n.cadence === 'closed' && !(Math.abs(d) >= 1 && Math.abs(d) <= 2)) continue;
        if (n.cadence === 'open' && Math.abs(d) > 4) continue;
      } else if (!isChordTone(i, p)) continue;
      out.push(p);
    }
    // The last note of the phrase is never a non-chord tone (filtered above by cadence).
    let preferred = null;
    if (n.modelIndex !== undefined && m[n.modelIndex] !== undefined && inKey(n.key, m[n.modelIndex])) {
      try {
        preferred = stepScale(n.key, m[n.modelIndex], n.shift);
      } catch {
        preferred = null;
      }
    }
    const target = i < c ? H - 3 : (notes.findLast((x) => x.cadence === 'closed') ? floor + 4 : H - 6);
    const scored = out.map((p) => {
      const d = prev === null ? 0 : p - prev;
      let s = Math.abs(d) + (d === 0 ? 3 : 0) + (prev2 !== null && p === prev2 && d !== 0 ? 1.5 : 0) + rand() * 3 + Math.abs(p - target) * 0.15;
      if (prev === null) s = Math.abs(p - (H - 5)) + rand() * 3;
      if (p === preferred) s -= 20;
      return [s, p];
    });
    scored.sort((a, b) => a[0] - b[0]);
    return scored.map((x) => x[1]);
  }

  function place(i) {
    if (i === notes.length) return true;
    if (++steps > budget) return false;
    for (const p of candidates(i)) {
      // The high point must be reachable by a legal interval.
      if (i + 1 === c && !intervalOk(H - p)) continue;
      m[i] = p;
      if (i === c && i > 0) {
        // Re-check the rules into the high point.
        const d = H - m[i - 1];
        if (!intervalOk(d)) continue;
        if (!isChordTone(i - 1, m[i - 1]) && !(Math.abs(d) >= 1 && Math.abs(d) <= 2)) continue;
        if (i > 1) {
          const pd = m[i - 1] - m[i - 2];
          if (Math.abs(pd) >= 5 && !(Math.abs(d) <= 2 && Math.abs(d) >= 1 && Math.sign(d) === -Math.sign(pd))) continue;
          if (Math.abs(pd) >= 3 && Math.abs(d) >= 3 && Math.sign(pd) === Math.sign(d)) {
            const arp = [m[i - 2], m[i - 1], H].every((x) => notes[i].chord.pcs.includes(mod12(x))) && H - m[i - 2] <= 12;
            if (!arp) continue;
          }
        }
      }
      if (place(i + 1)) return true;
    }
    m[i] = undefined;
    return false;
  }
  return place(0) ? m : null;
}

/** A melody for a section: [{ bar, step, dur, midi }] or null when no line fits the rules. */
export function composeMelody(bars, spec, k, rand) {
  for (let attempt = 0; attempt < 40; attempt++) {
    const notes = planPhrase(spec.form, bars, spec.rhythm, rand, k);
    const m = searchMelody(notes, { low: spec.range[0], high: spec.range[1], tonic: k.tonic, rand, form: spec.form });
    if (!m) continue;
    const line = notes.map((n, i) => ({ bar: n.bar, step: n.step, dur: n.dur, midi: m[i], chordPcs: n.chord.pcs, onBeat: n.onBeat, cadence: n.cadence, key: n.key }));
    if (melodyProblems(line).length) continue;
    return line;
  }
  return null;
}

// --- Tvísöngur ------------------------------------------------------------------------------------

/**
 * The two voices of the bridge in a mode: { v1, v2: [{ abs, dur, midi }], crossing: index of the
 * unison, tonic, start } or null. v1 starts on the fifth of the mode and ends on its tonic a fifth
 * lower; v2 starts on that tonic and ends on v1's first note.
 */
export function composeDuet(dk, rand) {
  const fifthPc = (dk.tonic + 7) % 12;
  let S = 60 + fifthPc;
  while (S < 67) S += 12;
  while (S > 73) S -= 12;
  const T = S - 7;
  const lowerOk = (p) => inKey(dk, p) && inKey(dk, p - 7); // v1 above, v2 a fifth below
  const upperOk = (p) => inKey(dk, p) && inKey(dk, p + 7); // v1 below, v2 a fifth above
  for (let attempt = 0; attempt < 60; attempt++) {
    const r = pick(DUET_RHYTHMS, rand);
    const aLen = r.a.length;
    const bLen = r.b.length;
    const a = [S];
    const b = [];
    let x = null;
    let tries = 0;
    const pool = scaleRange(dk, T - 3, S + 7);
    // Candidates after prev (and the note before it), nearest first; one repeated note at most.
    const order = (prev, ok, before) =>
      pool
        .filter(ok)
        .filter((p) => intervalOk(p - prev) && Math.abs(p - prev) <= 7 && !(p === prev && prev === before))
        .map((p) => [Math.abs(p - prev) + (p === prev ? 3 : 0) + rand() * 3, p])
        .sort((u, w) => u[0] - w[0])
        .map((u) => u[1]);

    const full = () => {
      const v1 = [...a, x, stepScale(dk, x, -1), stepScale(dk, x, -2), stepScale(dk, x, -3), x - 7, ...b, T];
      const v2 = [...a.map((p) => p - 7), x - 7, stepScale(dk, x - 7, 1), stepScale(dk, x - 7, 2), stepScale(dk, x - 7, 3), x, ...b.map((p) => p + 7), S];
      return { v1, v2 };
    };
    const good = () => {
      const { v1, v2 } = full();
      return !melodyProblems(v1.map((midi) => ({ midi }))).length && !melodyProblems(v2.map((midi) => ({ midi })), { singleClimax: false }).length;
    };
    const fillB = (i) => {
      if (++tries > 4000) return false;
      const prev = i === 0 ? x - 7 : b[i - 1];
      const before = i === 0 ? stepScale(dk, x, -3) : i === 1 ? x - 7 : b[i - 2];
      if (i === bLen) return Math.abs(T - prev) >= 1 && Math.abs(T - prev) <= 2 && good();
      for (const p of order(prev, upperOk, before)) {
        b[i] = p;
        if (fillB(i + 1)) return true;
      }
      b.length = i;
      return false;
    };
    const fillA = (i) => {
      if (++tries > 4000) return false;
      const prev = a[i - 1];
      const before = a[i - 2];
      if (i === aLen) {
        // The crossing starts from x, a step or a third away, and descends a perfect fifth.
        for (const p of order(prev, lowerOk, before)) {
          if (Math.abs(p - prev) > 4 || p === prev) continue;
          if (stepScale(dk, p, -4) !== p - 7) continue;
          x = p;
          if (fillB(0)) return true;
        }
        return false;
      }
      for (const p of order(prev, lowerOk, before)) {
        a[i] = p;
        if (fillA(i + 1)) return true;
      }
      a.length = i;
      return false;
    };
    if (!fillA(1)) continue;
    const { v1, v2 } = full();
    const durs = [...r.a, ...r.x, ...r.b, DUET_FINAL];
    let abs = 0;
    const one = [];
    const two = [];
    durs.forEach((dur, i) => {
      one.push({ abs, dur, midi: v1[i] });
      two.push({ abs, dur, midi: v2[i] });
      abs += dur;
    });
    return { v1: one, v2: two, crossing: aLen + 2, tonic: T, start: S };
  }
  return null;
}

// --- Accompaniment --------------------------------------------------------------------------------

const BASS = {
  octaves: [[0, 0, 2], [2, 0, 2], [4, 12, 2], [6, 0, 2], [8, 0, 2], [10, 0, 2], [12, 12, 2], [14, 0, 2]],
  gallop: Array.from({ length: 16 }, (_, s) => [s, s === 7 || s === 15 ? 12 : 0, 1]),
  long: [[0, 0, 10], [10, 0, 6]],
};

const ARP = {
  up16: { every: 1, order: [0, 1, 2, 3] },
  updown16: { every: 1, order: [0, 1, 2, 3, 2, 1] },
  dream8: { every: 2, order: [0, 2, 1, 3] },
};

const DRUMS = {
  four: {
    full: { kick: [0, 4, 8, 12], snare: [4, 12], hat: [2, 6, 10, 14], ohat: [14] },
    half: { kick: [0, 8], hat: [4, 12] },
    kick: { kick: [0, 4, 8, 12] },
    none: {},
  },
  half: {
    full: { kick: [0, 10], snare: [8], hat: [0, 4, 8, 12], ohat: [14] },
    half: { kick: [0], hat: [8] },
    kick: { kick: [0, 10] },
    none: {},
  },
};

function bassNote(pcBass, [lo, hi], prev) {
  const options = [];
  for (let m = lo; m <= hi; m++) if (mod12(m) === pcBass) options.push(m);
  if (prev === null) return options[0];
  return options.reduce((best, m) => (Math.abs(m - prev) < Math.abs(best - prev) ? m : best), options[0]);
}

// --- Songs ----------------------------------------------------------------------------------------

/** The chords and keys of a section: [{ chord, key }]. */
function sectionBars(style, k, sec) {
  return sec.chords.map((token) => {
    const bk = barKey(style, k, token);
    return { chord: chord(k, token), key: bk };
  });
}

function composeSection(style, k, name, sec, seed) {
  const rand = rng(seed);
  const s = style.sound;
  if (sec.duet) {
    const dk = key(...sec.duet);
    const duet = composeDuet(dk, rand);
    const bars = Array.from({ length: 8 }, () => ({ chord: null, key: dk, events: [] }));
    const put = (abs, ev) => bars[Math.floor(abs / STEPS)].events.push({ ...ev, step: abs % STEPS });
    duet.v1.forEach((n, i) => put(n.abs, { part: 'duet1', dur: n.dur, midi: n.midi, vel: i === duet.crossing ? 0.95 : 0.85, inst: sec.inst }));
    duet.v2.forEach((n) => put(n.abs, { part: 'duet2', dur: n.dur, midi: n.midi, vel: 0.85, inst: sec.inst }));
    // The langspil drone (tonic and fifth) under the first and the last notes, the only places where
    // both voices are consonant with it.
    const first = duet.v1[0];
    const last = duet.v1[duet.v1.length - 1];
    for (const n of [first, last]) for (const midi of [duet.tonic - 12, duet.tonic - 5]) put(n.abs, { part: 'drone', dur: n.dur, midi, vel: 0.7 });
    put(0, { part: 'wind', dur: 8 * STEPS, vel: 0.6 });
    addDrums(bars, style, sec, 'bridge');
    return { name, bars, duet, key: dk };
  }

  const bars = sectionBars(style, k, sec).map((b) => ({ ...b, events: [] }));
  // Pads: nearest voicing, held across repeated chords.
  let prev = null;
  const voicings = bars.map((b) => {
    const v = voiceChord(b.chord.pcs, { prev });
    prev = v;
    return v;
  });
  if (sec.layers.includes('pad')) {
    for (let i = 0; i < bars.length; ) {
      let j = i + 1;
      while (j < bars.length && bars[j].chord.token === bars[i].chord.token) j++;
      for (const midi of voicings[i]) bars[i].events.push({ part: 'pad', step: 0, dur: (j - i) * STEPS, midi, vel: 0.8 });
      i = j;
    }
  }
  // Bass: the chord's bass note (the root, or the pedal of a slash chord), led to the nearest octave.
  let pb = null;
  if (sec.layers.includes('bass')) {
    for (const b of bars) {
      const n = bassNote(b.chord.bassPc, s.bassRange, pb);
      pb = n;
      for (const [step, oct, dur] of BASS[s.bass]) b.events.push({ part: 'bass', step, dur, midi: n + oct, vel: step % 4 === 0 ? 1 : 0.8 });
    }
  }
  // Arpeggio: the pad's chord tones, an octave up, plus the octave of the lowest.
  if (sec.layers.includes('arp')) {
    const a = ARP[s.arp];
    bars.forEach((b, i) => {
      let tones = [...voicings[i]].sort((x, y) => x - y);
      while (tones[0] < 62) tones = tones.map((t) => t + 12);
      while (tones[0] > 74) tones = tones.map((t) => t - 12);
      let n = 0;
      for (let step = 0; step < STEPS; step += a.every) {
        b.events.push({ part: 'arp', step, dur: a.every, midi: tones[a.order[n % a.order.length]], vel: step % 4 === 0 ? 0.9 : 0.65 });
        n++;
      }
    });
  }
  // The langspil drone of the dreamwave intro: tonic and fifth, bar by bar.
  if (sec.layers.includes('drone')) {
    const t = 36 + k.tonic + (k.tonic < 5 ? 12 : 0);
    bars.forEach((b, i) => {
      if (i % 4 === 0) for (const midi of [t, t + 7, t + 12]) b.events.push({ part: 'drone', step: 0, dur: 4 * STEPS, midi, vel: 0.7 });
    });
  }
  let melody = null;
  if (sec.melody) {
    melody = composeMelody(bars, sec.melody, k, rand);
    if (melody) for (const n of melody) bars[n.bar].events.push({ part: 'melody', inst: sec.melody.inst, step: n.step, dur: n.dur, midi: n.midi, vel: n.onBeat ? 0.95 : 0.75 });
  }
  addDrums(bars, style, sec, name);
  return { name, bars, melody, voicings, key: k };
}

function addDrums(bars, style, sec) {
  const kit = DRUMS[style.sound.drums][sec.groove] ?? {};
  for (const b of bars) {
    for (const [part, steps] of Object.entries(kit)) {
      if (part === 'ohat' && !sec.layers.includes('ohat')) continue;
      for (const step of steps) b.events.push({ part, step, dur: part === 'ohat' ? 2 : 1, vel: part === 'hat' ? (step % 4 === 2 ? 0.8 : 0.55) : 1 });
    }
  }
}

/**
 * A whole song: { style, seed, tempo, bars: [{ section, at (bar within the section), label, events }],
 * sections: the composed sections, starts: { section name: first bar } }.
 */
export function compose(styleId, seed) {
  const style = STYLES[styleId];
  if (!style) throw new Error(`Unknown style ${styleId}`);
  const k = key(...style.key);
  const sections = {};
  for (const [name, sec] of Object.entries(style.sections)) sections[name] = composeSection(style, k, name, sec, hashSeed(`${seed}:${styleId}:${name}`));
  const bars = [];
  const starts = {};
  style.form.forEach((name, f) => {
    const sec = style.sections[name];
    starts[name] ??= bars.length;
    const prevName = style.form[f - 1];
    sections[name].bars.forEach((b, at) => {
      const events = [...b.events];
      if (sec.layers.includes('crash') && at === 0 && prevName !== name) events.push({ part: 'crash', step: 0, dur: 16, vel: 0.9 });
      if (sec.layers.includes('fill') && at === 7 && style.form[f + 1] !== name) {
        for (const [step, vel] of [[8, 0.5], [10, 0.6], [11, 0.65], [13, 0.75], [14, 0.85], [15, 1]]) events.push({ part: 'snare', step, dur: 1, vel });
      }
      bars.push({ section: name, at, label: b.chord ? b.chord.name : 'tvísöngur', events });
    });
  });
  return { style: styleId, seed, tempo: style.tempo, bars, sections, starts };
}
