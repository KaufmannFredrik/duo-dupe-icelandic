// 8-bit chimes made with the Web Audio API: no sound files, nothing to license.
// Off by default; they only play after the user turns sound on.

import { getSettings } from './store.js';

const SOUNDS = {
  tap: [[1200, 0.03]],
  correct: [[660, 0.08], [988, 0.14]],
  almost: [[660, 0.09], [740, 0.14]],
  wrong: [[247, 0.12], [185, 0.2]],
  complete: [[523, 0.08], [659, 0.08], [784, 0.08], [1047, 0.22]],
};

let ctx;

export function sfx(name) {
  if (!getSettings().sound || !SOUNDS[name]) return;
  try {
    ctx ??= new AudioContext();
    let t = ctx.currentTime + 0.01;
    for (const [freq, dur] of SOUNDS[name]) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.05, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + dur);
      t += dur;
    }
  } catch {
    // Audio can be unavailable (autoplay policy, no device); sound effects are optional.
  }
}
