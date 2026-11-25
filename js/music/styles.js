// The four moods of the menu music. Each is a song form made of 8-bar sections (Open Music Theory:
// phrases of 4, 8 or 16 bars are the norm; verses and choruses begin on the tonic), with chord
// loops taken from documented schemas:
//   Synthwave (A Aeolian): verse i–♭VI–♭III–♭VII (the singer/songwriter schema in minor) answered by
//     i–♭VI–♭VII–i (ending on the Aeolian cadence ♭VI–♭VII–i); chorus ♭VI–♭VII–i–♭III (the
//     hopscotch schema in minor) closing with the Aeolian cadence; intro on the subtonic shuttle i–♭VII.
//   Dreamwave (F Lydian): the Lydian shuttle I–II, over a tonic pedal (II/I), resolving vii7–Imaj7;
//     chorus descending to the tonic (iii7–II–Imaj7). The intro is a langspil: a drone on the tonic
//     and fifth with one melody string.
//   Cyberpunk (E Phrygian, the mode of "Krummi svaf í klettagjá"): the Phrygian ♭II–i, and the lament
//     tetrachord iv–♭III–♭II–i (Open Music Theory's lament i–♭VII–♭VI–v, heard from its last chord).
//   Glad (C major), for good moments: I–V–vi–IV and I–IV–V–I (an authentic cadence), the hopscotch
//     IV–V–vi–I, and the Aeolian cadence with a major tonic ♭VI–♭VII–I, which Open Music Theory notes
//     is "associated with success and heroism". ♭VI and ♭VII are borrowed from C minor.
// Every song has a tvísöngur bridge: two voices in parallel fifths that cross once (js/music/compose.js).
// Tempos follow genre ranges (synthwave about 80 to 150 bpm, most often 100 to 140).

export const STYLES = {
  synthwave: {
    tempo: 108,
    key: ['A', 'aeolian'],
    sections: {
      intro: { chords: ['i', 'i', 'bVII', 'bVII', 'i', 'i', 'bVII', 'bVII'], layers: ['pad', 'arp', 'bass'], groove: 'none' },
      verse: {
        chords: ['i', 'bVI', 'bIII', 'bVII', 'i', 'bVI', 'bVII', 'i'],
        layers: ['pad', 'arp', 'bass', 'melody'],
        groove: 'full',
        melody: { form: 'period', inst: 'bell', range: [64, 80], rhythm: 'synth' },
      },
      chorus: {
        chords: ['bVI', 'bVII', 'i', 'bIII', 'bVI', 'bVII', 'i', 'i'],
        layers: ['pad', 'arp', 'bass', 'melody', 'ohat', 'crash', 'fill'],
        groove: 'full',
        melody: { form: 'sentence', inst: 'lead', range: [66, 82], rhythm: 'synth' },
      },
      bridge: { duet: ['F', 'lydian'], layers: ['duet', 'drone', 'wind'], groove: 'half', inst: 'vox' },
    },
    form: ['intro', 'verse', 'verse', 'chorus', 'chorus', 'bridge', 'chorus', 'chorus'],
    sound: {
      bassRange: [33, 45],
      bass: 'octaves',
      arp: 'up16',
      drums: 'four',
      reverb: 2.6,
      delayBeats: 0.75,
      pump: 0.55,
      wobble: 0,
      drive: 0,
    },
  },
  dreamwave: {
    tempo: 84,
    key: ['F', 'lydian'],
    sections: {
      intro: {
        chords: ['I', 'I', 'I', 'I', 'I', 'I', 'I', 'I'],
        layers: ['drone', 'melody'],
        groove: 'none',
        melody: { form: 'period', inst: 'string', range: [60, 76], rhythm: 'slow' },
      },
      verse: {
        chords: ['Imaj7', 'II/I', 'Imaj7', 'II/I', 'Imaj7', 'II/I', 'vii7', 'Imaj7'],
        layers: ['pad', 'arp', 'bass', 'melody'],
        groove: 'full',
        melody: { form: 'period', inst: 'bell', range: [65, 81], rhythm: 'slow' },
      },
      chorus: {
        chords: ['vi7', 'V', 'vi7', 'V', 'iii7', 'II', 'Imaj7', 'Imaj7'],
        layers: ['pad', 'arp', 'bass', 'melody', 'ohat'],
        groove: 'full',
        melody: { form: 'sentence', inst: 'lead', range: [65, 81], rhythm: 'slow' },
      },
      bridge: { duet: ['F', 'lydian'], layers: ['duet', 'drone', 'wind'], groove: 'none', inst: 'vox' },
    },
    form: ['intro', 'verse', 'verse', 'chorus', 'bridge', 'chorus', 'chorus'],
    sound: {
      bassRange: [29, 41],
      bass: 'long',
      arp: 'dream8',
      drums: 'half',
      reverb: 4.2,
      delayBeats: 0.75,
      pump: 0.2,
      wobble: 1,
      drive: 0,
    },
  },
  cyberpunk: {
    tempo: 118,
    key: ['E', 'phrygian'],
    sections: {
      intro: { chords: ['i', 'i', 'bII', 'i', 'i', 'i', 'bII', 'bII'], layers: ['pad', 'bass', 'arp'], groove: 'kick' },
      verse: {
        chords: ['i', 'bVI', 'i', 'bVI', 'iv', 'bVI', 'bII', 'i'],
        layers: ['pad', 'arp', 'bass', 'melody'],
        groove: 'full',
        melody: { form: 'period', inst: 'pluck', range: [59, 75], rhythm: 'synth' },
      },
      chorus: {
        chords: ['i', 'bII', 'i', 'bII', 'iv', 'bIII', 'bII', 'i'],
        layers: ['pad', 'arp', 'bass', 'melody', 'ohat', 'crash', 'fill'],
        groove: 'full',
        melody: { form: 'sentence', inst: 'lead', range: [62, 78], rhythm: 'synth' },
      },
      bridge: { duet: ['E', 'phrygian'], layers: ['duet', 'drone', 'wind'], groove: 'half', inst: 'power' },
    },
    form: ['intro', 'verse', 'chorus', 'verse', 'chorus', 'bridge', 'chorus', 'chorus'],
    sound: {
      bassRange: [28, 40],
      bass: 'gallop',
      arp: 'up16',
      drums: 'four',
      reverb: 1.8,
      delayBeats: 0.75,
      pump: 0.6,
      wobble: 0,
      drive: 1,
    },
  },
  glad: {
    tempo: 112,
    key: ['C', 'ionian'],
    borrow: { bVI: 'aeolian', bVII: 'aeolian' },
    sections: {
      intro: { chords: ['I', 'I', 'IV', 'V', 'I', 'I', 'IV', 'V'], layers: ['pad', 'arp', 'bass'], groove: 'kick' },
      verse: {
        chords: ['I', 'V', 'vi', 'IV', 'I', 'IV', 'V', 'I'],
        layers: ['pad', 'arp', 'bass', 'melody'],
        groove: 'full',
        melody: { form: 'period', inst: 'bell', range: [64, 81], rhythm: 'synth' },
      },
      chorus: {
        chords: ['IV', 'V', 'vi', 'I', 'bVI', 'bVII', 'I', 'I'],
        layers: ['pad', 'arp', 'bass', 'melody', 'ohat', 'crash', 'fill'],
        groove: 'full',
        melody: { form: 'sentence', inst: 'lead', range: [67, 84], rhythm: 'synth' },
      },
      bridge: { duet: ['D', 'dorian'], layers: ['duet', 'drone', 'wind'], groove: 'half', inst: 'vox' },
    },
    form: ['intro', 'verse', 'verse', 'chorus', 'chorus', 'bridge', 'chorus', 'chorus'],
    sound: {
      bassRange: [31, 43],
      bass: 'octaves',
      arp: 'updown16',
      drums: 'four',
      reverb: 2.4,
      delayBeats: 0.75,
      pump: 0.5,
      wobble: 0,
      drive: 0,
    },
  },
};

export const STYLE_IDS = Object.keys(STYLES);
