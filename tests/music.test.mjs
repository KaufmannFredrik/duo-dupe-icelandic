import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MODES, chord, diatonic, inKey, key, melodyProblems, mod12, noteName, parseNumeral, pc, voiceChord, voicingOk } from '../js/music/theory.js';
import { STYLES, STYLE_IDS } from '../js/music/styles.js';
import { compose, composeDuet, STEPS } from '../js/music/compose.js';
import { rng } from '../js/engine/rng.js';

const SEEDS = 12;
const names = (k) => k.pcs.map((p) => noteName(60 + p).replace(/\d+$/, ''));

test('music theory: modes are the seven rotations of the major scale', () => {
  const ionian = MODES.ionian;
  const order = ['ionian', 'dorian', 'phrygian', 'lydian', 'mixolydian', 'aeolian', 'locrian'];
  order.forEach((mode, r) => {
    const rotated = ionian.map((_, i) => mod12(ionian[(i + r) % 7] - ionian[r]));
    assert.deepEqual(MODES[mode], rotated, mode);
  });
  // The modes the sources name for Icelandic folk song share the white keys.
  assert.deepEqual(names(key('F', 'lydian')), ['F', 'G', 'A', 'B', 'C', 'D', 'E']);
  assert.deepEqual(names(key('D', 'dorian')), ['D', 'E', 'F', 'G', 'A', 'B', 'C']);
  assert.deepEqual(names(key('E', 'phrygian')), ['E', 'F', 'G', 'A', 'B', 'C', 'D']);
  assert.deepEqual(names(key('A', 'aeolian')), ['A', 'B', 'C', 'D', 'E', 'F', 'G']);
});

test('music theory: Roman numerals build the right chords', () => {
  const am = key('A', 'aeolian');
  assert.equal(chord(am, 'i').name, 'Am');
  assert.equal(chord(am, 'bVI').name, 'F');
  assert.equal(chord(am, 'bVII').name, 'G');
  assert.equal(chord(am, 'bIII').name, 'C');
  const f = key('F', 'lydian');
  assert.equal(chord(f, 'II').name, 'G', 'the Lydian II is major (II♯ in Open Music Theory)');
  assert.equal(chord(f, 'II/I').name, 'G/F');
  assert.equal(chord(f, 'Imaj7').name, 'Fmaj7');
  assert.equal(chord(f, 'vii7').name, 'Em7');
  const e = key('E', 'phrygian');
  assert.equal(chord(e, 'bII').name, 'F', 'the Phrygian ♭II');
  const c = key('C', 'ionian');
  assert.equal(chord(c, 'bVI').name, 'A♭');
  assert.equal(chord(c, 'V7').name, 'G7');
  assert.deepEqual(chord(c, 'V7').pcs, [pc('G'), pc('B'), pc('D'), pc('F')]);
  assert.equal(parseNumeral('vii°').quality, 'dim');
});

test('music styles: every chord fits its mode, or is declared borrowed with its mode', () => {
  for (const id of STYLE_IDS) {
    const style = STYLES[id];
    const k = key(...style.key);
    for (const [name, sec] of Object.entries(style.sections)) {
      if (sec.duet) continue;
      for (const token of sec.chords) {
        const ch = chord(k, token);
        const borrowed = style.borrow?.[token.split('/')[0]];
        const home = borrowed ? key(k.tonic, borrowed) : k;
        assert.ok(diatonic(home, ch), `${id}.${name}: ${token} (${ch.name}) is not in ${home.mode}`);
        // The numeral's case agrees with the chord the mode gives on that root.
        const n = parseNumeral(token.split('/')[0]);
        const third = home.pcs.find((p) => [3, 4].includes(mod12(p - ch.rootPc)));
        assert.equal(mod12(third - ch.rootPc) === 4 ? 'maj' : 'min', n.quality === 'dim' ? 'min' : n.quality, `${id}.${name}: ${token}`);
      }
      assert.equal(sec.chords.length % 4, 0, `${id}.${name}: phrases of 4 or 8 bars`);
    }
  }
});

test('music: verses end on the tonic chord, antecedents do not', () => {
  for (const id of STYLE_IDS) {
    const style = STYLES[id];
    const k = key(...style.key);
    for (const name of ['verse', 'chorus']) {
      const sec = style.sections[name];
      assert.equal(chord(k, sec.chords[7]).rootPc, k.tonic, `${id}.${name} ends on the tonic`);
      if (sec.melody.form === 'period') assert.notEqual(chord(k, sec.chords[3]).rootPc, k.tonic, `${id}.${name}: the antecedent ends open`);
    }
  }
});

test('music: pad voicings hold every chord tone, clearly spaced, and move little', () => {
  for (const id of STYLE_IDS) {
    for (let seed = 0; seed < 3; seed++) {
      const song = compose(id, seed);
      for (const sec of Object.values(song.sections)) {
        if (!sec.voicings) continue;
        sec.voicings.forEach((v, i) => {
          const ch = sec.bars[i].chord;
          assert.deepEqual(new Set(v.map(mod12)), new Set(ch.pcs), `${id} ${ch.name}`);
          assert.ok(voicingOk(v), `${id} ${ch.name}: ${v.map(noteName)}`);
          if (ch.pcs.length === 3) assert.equal(v.filter((m) => mod12(m) === ch.pcs[1]).length, 1, `${id} ${ch.name}: third not doubled`);
          if (i > 0) {
            const prev = [...sec.voicings[i - 1]].sort((a, b) => a - b);
            const moved = [...v].sort((a, b) => a - b).reduce((s, m, j) => s + Math.abs(m - prev[j]), 0);
            assert.ok(moved <= 12, `${id}: ${sec.bars[i - 1].chord.name} to ${ch.name} moves ${moved} semitones`);
          }
        });
      }
    }
  }
  assert.equal(voicingOk([52, 53, 57]), false, 'a minor second');
  assert.equal(voicingOk([40, 43, 47]), false, 'a third below C3');
  const am = voiceChord([pc('A'), pc('C'), pc('E')], { prev: [53, 57, 60, 65] });
  assert.equal(am.filter((m) => mod12(m) === pc('C')).length, 1, 'the third of a triad is not doubled');
});

test('music: melodies follow the rules of melody and harmony', () => {
  for (const id of STYLE_IDS) {
    const k = key(...STYLES[id].key);
    for (let seed = 0; seed < SEEDS; seed++) {
      const song = compose(id, seed);
      for (const [name, sec] of Object.entries(song.sections)) {
        if (!STYLES[id].sections[name].melody) continue;
        const line = sec.melody;
        assert.ok(line, `${id}.${name} seed ${seed}: a melody was found`);
        const where = `${id}.${name} seed ${seed}`;
        assert.deepEqual(melodyProblems(line), [], where);
        const spec = STYLES[id].sections[name].melody;
        line.forEach((n, i) => {
          assert.ok(n.midi >= spec.range[0] && n.midi <= spec.range[1], `${where}: ${noteName(n.midi)} in range`);
          assert.ok(inKey(n.key, n.midi), `${where}: ${noteName(n.midi)} in ${n.key.mode}`);
          const ct = n.chordPcs.includes(mod12(n.midi));
          if (n.onBeat) assert.ok(ct, `${where}: note ${i} (${noteName(n.midi)}) on the beat is a chord tone`);
          if (!ct) {
            // Passing or neighbor tone: approached and left by step, resolving to a chord tone.
            const a = n.midi - line[i - 1].midi;
            const b = line[i + 1].midi - n.midi;
            assert.ok(Math.abs(a) >= 1 && Math.abs(a) <= 2 && Math.abs(b) >= 1 && Math.abs(b) <= 2, `${where}: note ${i} is a passing or neighbor tone`);
            assert.ok(line[i + 1].chordPcs.includes(mod12(line[i + 1].midi)), `${where}: note ${i} resolves to a chord tone`);
          }
        });
        const last = line[line.length - 1];
        assert.equal(mod12(last.midi), k.tonic, `${where}: ends on the tonic`);
        const approach = Math.abs(last.midi - line[line.length - 2].midi);
        assert.ok(approach >= 1 && approach <= 2, `${where}: the tonic is approached by step`);
        if (spec.form === 'period') {
          const open = line.filter((n) => n.cadence === 'open');
          assert.equal(open.length, 1, `${where}: one half-way cadence`);
          assert.notEqual(mod12(open[0].midi), k.tonic, `${where}: the antecedent ends open`);
        }
        // Each bar's notes fill the bar without overlapping.
        for (let bar = 0; bar < 8; bar++) {
          const notes = line.filter((n) => n.bar === bar);
          for (let j = 1; j < notes.length; j++) assert.equal(notes[j].step, notes[j - 1].step + notes[j - 1].dur, `${where}: bar ${bar}`);
          assert.ok(notes.at(-1).step + notes.at(-1).dur <= STEPS);
        }
      }
    }
  }
});

test('music: tvísöngur moves in parallel fifths, crosses once on a unison, and swaps the end notes', () => {
  for (const [tonic, mode] of [['F', 'lydian'], ['D', 'dorian'], ['E', 'phrygian']]) {
    const dk = key(tonic, mode);
    for (let seed = 0; seed < 30; seed++) {
      const d = composeDuet(dk, rng(seed));
      const where = `${tonic} ${mode} seed ${seed}`;
      assert.ok(d, where);
      const gaps = d.v1.map((n, i) => d.v2[i].midi - n.midi);
      // Note against note.
      d.v1.forEach((n, i) => {
        assert.equal(n.abs, d.v2[i].abs);
        assert.equal(n.dur, d.v2[i].dur);
      });
      // Fifths below, the crossing (third, unison, third), fifths above.
      const x = d.crossing;
      assert.deepEqual(gaps.slice(0, x - 1), Array(x - 1).fill(-7), `${where}: ${gaps}`);
      assert.deepEqual(gaps.slice(x - 1, x + 2).map(Math.sign), [-1, 0, 1], `${where}: ${gaps}`);
      assert.ok([3, 4].includes(-gaps[x - 1]) && [3, 4].includes(gaps[x + 1]), `${where}: thirds around the unison`);
      assert.deepEqual(gaps.slice(x + 2), Array(gaps.length - x - 2).fill(7), `${where}: ${gaps}`);
      assert.equal(gaps.filter((g) => g === 0).length, 1, `${where}: one meeting`);
      // Both voices stay in the mode.
      for (const n of [...d.v1, ...d.v2]) assert.ok(inKey(dk, n.midi), `${where}: ${noteName(n.midi)}`);
      // v1 begins on the fifth and ends on the tonic; v2 ends on v1's first note.
      assert.equal(mod12(d.v1[0].midi), (dk.tonic + 7) % 12);
      assert.equal(mod12(d.v1.at(-1).midi), dk.tonic);
      assert.equal(d.v2.at(-1).midi, d.v1[0].midi, `${where}: the second voice ends where the first began`);
      assert.equal(d.v1.at(-1).dur, 32, `${where}: the last note is held`);
      assert.equal(d.v1.at(-1).abs + 32, 8 * STEPS, `${where}: eight bars`);
      assert.deepEqual(melodyProblems(d.v1.map((n) => ({ midi: n.midi }))), [], `${where}: first voice`);
      assert.deepEqual(melodyProblems(d.v2.map((n) => ({ midi: n.midi })), { singleClimax: false }), [], `${where}: second voice`);
    }
  }
});

test('music: songs are seeded, start each section where the form says, and keep drums on the grid', () => {
  for (const id of STYLE_IDS) {
    const a = compose(id, 7);
    const b = compose(id, 7);
    assert.deepEqual(JSON.stringify(a.bars), JSON.stringify(b.bars), `${id} is deterministic`);
    assert.notEqual(JSON.stringify(compose(id, 8).bars), JSON.stringify(a.bars), `${id}: another seed, another song`);
    assert.equal(a.bars.length, STYLES[id].form.length * 8);
    for (const [name, start] of Object.entries(a.starts)) assert.equal(a.bars[start].section, name);
    for (const bar of a.bars) {
      for (const ev of bar.events) {
        assert.ok(Number.isInteger(ev.step) && ev.step >= 0 && ev.step < STEPS, `${id}: ${ev.part} step ${ev.step}`);
        assert.ok(ev.dur > 0);
      }
    }
    // Synthwave and Cyberpunk keep a four-on-the-floor kick in full sections.
    if (['synthwave', 'cyberpunk', 'glad'].includes(id)) {
      const verse = a.bars[a.starts.verse];
      assert.deepEqual(verse.events.filter((e) => e.part === 'kick').map((e) => e.step), [0, 4, 8, 12]);
      assert.deepEqual(verse.events.filter((e) => e.part === 'snare').map((e) => e.step), [4, 12]);
    }
  }
});

test('music: the bass plays the chord bass on every downbeat, inside its range', () => {
  for (const id of STYLE_IDS) {
    const song = compose(id, 3);
    const [lo, hi] = STYLES[id].sound.bassRange;
    for (const sec of Object.values(song.sections)) {
      sec.bars.forEach((bar) => {
        const bass = bar.events.filter((e) => e.part === 'bass');
        if (!bass.length) return;
        const down = bass.find((e) => e.step === 0);
        assert.equal(mod12(down.midi), bar.chord.bassPc, `${id}: ${bar.chord.name}`);
        for (const e of bass) assert.ok(e.midi >= lo && e.midi <= hi + 12, `${id}: bass ${noteName(e.midi)}`);
        for (const e of bar.events.filter((x) => x.part === 'arp')) assert.ok(bar.chord.pcs.includes(mod12(e.midi)), `${id}: arpeggio ${noteName(e.midi)} over ${bar.chord.name}`);
      });
    }
  }
});
