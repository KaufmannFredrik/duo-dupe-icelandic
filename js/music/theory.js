// Music theory for the generated menu music: modes, chords from Roman numerals, voicings and
// melodic rules. Pure functions with no Web Audio, so node --test can check every rule
// (tests/music.test.mjs). Pitches are MIDI numbers (60 = middle C, 69 = A 440 Hz), pitch classes
// are 0 to 11 (0 = C). Sources for the rules are listed in docs/DECISIONS.md ("Menu music").

export const NOTE_NAMES = ['C', 'C♯', 'D', 'E♭', 'E', 'F', 'F♯', 'G', 'A♭', 'A', 'B♭', 'B'];
const LETTER = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

/** Pitch class of a note name such as 'A', 'Bb', 'F#'. */
export function pc(name) {
  const base = LETTER[name[0]];
  if (base === undefined) throw new Error(`Unknown note ${name}`);
  const acc = name.slice(1).replace(/♭/g, 'b').replace(/♯/g, '#');
  return (base + (acc === '#' ? 1 : acc === 'b' ? -1 : 0) + 12) % 12;
}

export const mod12 = (n) => ((n % 12) + 12) % 12;
export const freq = (midi) => 440 * 2 ** ((midi - 69) / 12);
export const noteName = (midi) => `${NOTE_NAMES[mod12(midi)]}${Math.floor(midi / 12) - 1}`;

/** The seven diatonic modes as semitones above the final. */
export const MODES = {
  ionian: [0, 2, 4, 5, 7, 9, 11],
  dorian: [0, 2, 3, 5, 7, 9, 10],
  phrygian: [0, 1, 3, 5, 7, 8, 10],
  lydian: [0, 2, 4, 6, 7, 9, 11],
  mixolydian: [0, 2, 4, 5, 7, 9, 10],
  aeolian: [0, 2, 3, 5, 7, 8, 10],
  locrian: [0, 1, 3, 5, 6, 8, 10],
};

/** A key: { tonic: pitch class, mode, pcs: the seven pitch classes, in scale order from the tonic }. */
export function key(tonic, mode) {
  const t = typeof tonic === 'number' ? tonic : pc(tonic);
  if (!MODES[mode]) throw new Error(`Unknown mode ${mode}`);
  return { tonic: t, mode, pcs: MODES[mode].map((s) => (t + s) % 12) };
}

export const inKey = (k, midiOrPc) => k.pcs.includes(mod12(midiOrPc));

/** Scale degree index (0 to 6) of a pitch in a key, or -1. */
export const degreeOf = (k, midiOrPc) => k.pcs.indexOf(mod12(midiOrPc));

/** The pitch n scale steps away from a pitch of the key (n may be negative). */
export function stepScale(k, midi, n) {
  const d = degreeOf(k, midi);
  if (d < 0) throw new Error(`${noteName(midi)} is not in the key`);
  let out = midi;
  let deg = d;
  const dir = Math.sign(n);
  for (let i = 0; i < Math.abs(n); i++) {
    const next = (deg + dir + 7) % 7;
    out += dir > 0 ? mod12(k.pcs[next] - k.pcs[deg]) || 12 : -(mod12(k.pcs[deg] - k.pcs[next]) || 12);
    deg = next;
  }
  return out;
}

/** All pitches of the key in [low, high]. */
export function scaleRange(k, low, high) {
  const out = [];
  for (let m = low; m <= high; m++) if (inKey(k, m)) out.push(m);
  return out;
}

// --- Chords ----------------------------------------------------------------------------------
// Chords are written as Roman numerals measured from the major scale on the tonic, the way
// Open Music Theory writes modal schemas (Aeolian ♭VI–♭VII–i): upper case is a major triad,
// lower case minor, ° diminished. Suffixes: maj7, 7 (dominant on upper case, minor seventh on
// lower case), ø7, add9, sus2, sus4. A slash names the bass by another numeral: II/I is G over F
// in F Lydian. The numeral's case is checked against the mode in the tests, so a chord that is
// not in the mode has to be declared as borrowed by the style.

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];
const MAJOR = [0, 2, 4, 5, 7, 9, 11];
const QUALITY = { maj: [0, 4, 7], min: [0, 3, 7], dim: [0, 3, 6] };

/** Parses a numeral: { root (semitones above the tonic), quality, seventh, add, sus, bass, label }. */
export function parseNumeral(token) {
  const [main, bassToken] = token.split('/');
  const m = /^([b#♭♯]?)([ivIV]+)(°|ø)?(maj7|7|add9|sus2|sus4)?$/.exec(main.replace('ø7', 'ø'));
  if (!m) throw new Error(`Bad numeral ${token}`);
  const [, acc, roman, dimMark, ext] = m;
  const idx = ROMAN.indexOf(roman.toUpperCase());
  if (idx < 0) throw new Error(`Bad numeral ${token}`);
  const upper = roman === roman.toUpperCase();
  const root = mod12(MAJOR[idx] + (acc === 'b' || acc === '♭' ? -1 : acc === '#' || acc === '♯' ? 1 : 0));
  const quality = dimMark ? 'dim' : upper ? 'maj' : 'min';
  let seventh = null;
  if (dimMark === 'ø') seventh = 10;
  else if (ext === 'maj7') seventh = 11;
  else if (ext === '7') seventh = 10;
  return {
    token,
    root,
    quality,
    seventh,
    add: ext === 'add9' ? 2 : null,
    sus: ext === 'sus2' ? 2 : ext === 'sus4' ? 5 : null,
    bass: bassToken ? parseNumeral(bassToken).root : null,
  };
}

/** A chord in a key: { token, rootPc, pcs (root first), bassPc, name }. */
export function chord(k, token) {
  const n = parseNumeral(token);
  const rootPc = (k.tonic + n.root) % 12;
  let ints = [...QUALITY[n.quality]];
  if (n.sus) ints = [0, n.sus, 7];
  if (n.seventh !== null) ints.push(n.seventh);
  if (n.add !== null) ints.push(n.add);
  const pcs = ints.map((i) => (rootPc + i) % 12);
  const bassPc = n.bass === null ? rootPc : (k.tonic + n.bass) % 12;
  return { token, rootPc, pcs, bassPc, name: chordName(rootPc, n, bassPc) };
}

function chordName(rootPc, n, bassPc) {
  const r = NOTE_NAMES[rootPc];
  let s = r;
  if (n.sus) s += n.sus === 2 ? 'sus2' : 'sus4';
  else if (n.quality === 'min') s += 'm';
  else if (n.quality === 'dim') s += n.seventh === 10 ? 'm7♭5' : '°';
  if (n.seventh === 11) s += 'maj7';
  else if (n.seventh === 10 && n.quality !== 'dim') s += '7';
  if (n.add !== null) s += 'add9';
  if (bassPc !== rootPc) s += `/${NOTE_NAMES[bassPc]}`;
  return s;
}

/** True when every pitch class of the chord belongs to the key (the chord is diatonic). */
export const diatonic = (k, c) => c.pcs.every((p) => k.pcs.includes(p)) && k.pcs.includes(c.bassPc);

// --- Voicing -----------------------------------------------------------------------------------
// Pads use the nearest voicing to the previous chord (common tones stay, other voices move the
// shortest way). Classical rules against parallel fifths do not apply to this style (and tvísöngur
// is built on them), but two rules for clear chords do: no third or second below the low-interval
// limit, and no minor second or minor ninth between any two voices.

const LOW_THIRD_LIMIT = 48; // C3: below it, intervals smaller than a fifth sound muddy

export function voicingOk(notes) {
  const s = [...notes].sort((a, b) => a - b);
  for (let i = 0; i < s.length; i++) {
    for (let j = i + 1; j < s.length; j++) {
      const d = s[j] - s[i];
      if (d === 0) return false;
      if (d === 1 || d === 13) return false;
      if (s[i] < LOW_THIRD_LIMIT && d < 7) return false;
    }
  }
  for (let i = 1; i < s.length; i++) if (s[i] - s[i - 1] > 12) return false;
  return true;
}

function* combos(options, size, start = 0, acc = []) {
  if (acc.length === size) {
    yield acc;
    return;
  }
  for (let i = start; i < options.length; i++) yield* combos(options, size, i + 1, [...acc, options[i]]);
}

/**
 * Voices a chord's pitch classes with `voices` notes inside [low, high]: every pitch class present
 * (a triad in four voices doubles its root or fifth, never its third), nearest to `prev` when given,
 * otherwise nearest to the middle of the range.
 */
export function voiceChord(pcs, { low = 52, high = 79, voices = 4, prev = null } = {}) {
  const options = [];
  for (let m = low; m <= high; m++) if (pcs.includes(mod12(m))) options.push(m);
  const center = (low + high) / 2;
  let best = null;
  let bestCost = Infinity;
  const n = Math.max(voices, pcs.length);
  for (const c of combos(options, n)) {
    const have = new Set(c.map(mod12));
    if (have.size !== new Set(pcs).size) continue;
    if (!voicingOk(c)) continue;
    // Doubling: the root, or else the fifth; never the third (pcs[1] of a triad).
    const doubled = c.map(mod12).filter((p, i, all) => all.indexOf(p) !== i);
    if (pcs.length === 3 && doubled.includes(pcs[1])) continue;
    let cost;
    if (prev) {
      const p = [...prev].sort((a, b) => a - b);
      cost = c.reduce((sum, m, i) => sum + Math.abs(m - (p[i] ?? p[p.length - 1])), 0);
    } else {
      cost = c.reduce((sum, m) => sum + Math.abs(m - center), 0);
    }
    // Prefer the root in the lowest voice and as the doubled note, as tie-breaks.
    if (mod12(c[0]) !== pcs[0]) cost += 0.5;
    if (doubled.length && !doubled.includes(pcs[0])) cost += 1;
    if (cost < bestCost) {
      bestCost = cost;
      best = c;
    }
  }
  return best;
}

// --- Melodic rules -------------------------------------------------------------------------------
// From species counterpoint (Open Music Theory 2e, 2.1): mostly steps, few leaps; a leap of a
// fourth or more is followed by a step the other way; no augmented or diminished leaps (the
// tritone), no sevenths, no sixths except the ascending minor sixth, nothing above an octave; range
// at most a tenth; a single high point. Pop melodies outline chords, so two leaps in a row in the
// same direction are allowed when all three notes belong to the chord (an arpeggio).

export const STEP = (d) => Math.abs(d) >= 1 && Math.abs(d) <= 2;
export const LEAP = (d) => Math.abs(d) >= 3;

export function intervalOk(d) {
  const a = Math.abs(d);
  if (a === 8) return d > 0; // ascending minor sixth only
  return [0, 1, 2, 3, 4, 5, 7, 12].includes(a);
}

/**
 * Checks a melodic line against the rules above. notes: [{ midi, chordPcs? }]. Returns a list of
 * problems (empty when the line is good).
 */
export function melodyProblems(notes, { maxRange = 15, singleClimax = true } = {}) {
  const problems = [];
  const m = notes.map((n) => n.midi);
  for (let i = 1; i < m.length; i++) {
    const d = m[i] - m[i - 1];
    if (!intervalOk(d)) problems.push(`interval ${d} at ${i}`);
    if (i >= 2) {
      const prev = m[i - 1] - m[i - 2];
      if (Math.abs(prev) >= 5 && !(STEP(d) && Math.sign(d) === -Math.sign(prev))) problems.push(`leap ${prev} not recovered at ${i}`);
      if (LEAP(prev) && LEAP(d) && Math.sign(prev) === Math.sign(d)) {
        const pcs = notes[i].chordPcs;
        const arpeggio = pcs && [m[i - 2], m[i - 1], m[i]].every((x) => pcs.includes(mod12(x))) && Math.abs(m[i] - m[i - 2]) <= 12;
        if (!arpeggio) problems.push(`two leaps one way at ${i}`);
      }
      if (i >= 3 && d === 0 && prev === 0 && m[i - 2] === m[i - 3]) problems.push(`note repeated four times at ${i}`);
    }
  }
  const hi = Math.max(...m);
  const lo = Math.min(...m);
  if (hi - lo > maxRange) problems.push(`range ${hi - lo}`);
  if (singleClimax && m.filter((x) => x === hi).length > 1 && m.length > 4) {
    // Repeated notes in a row count as one sounding of the high point.
    const runs = m.filter((x, i) => x === hi && m[i - 1] !== hi).length;
    if (runs > 1) problems.push('high point more than once');
  }
  if (m.length > 2 && m[m.length - 1] === hi && m.filter((x) => x === hi).length === 1) problems.push('ends on the high point');
  return problems;
}
