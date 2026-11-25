// Numbers in words: see a number in digits (47, or 3. for an ordinal) and build what it is called
// from word chips (fjörutíu og sjö; þriðji), among number words that sound or look alike.

import { normalize } from '../normalize.js';
import { chipBank, esc, heading, promptCard } from './common.js';
import { rng, shuffle } from '../engine/rng.js';

export function build(spec, ctx) {
  const chips = chipBank(shuffle([...spec.words, ...spec.distractors], rng(ctx.seed)), ctx.changed);
  const answer = spec.words.join(' ');
  return {
    html:
      heading(spec.show.endsWith('.') ? 'ex.numbuildOrdinal' : 'ex.numbuild') +
      promptCard({ html: `<span class="number-prompt">${esc(spec.show)}</span>`, lang: ctx.lang }) +
      chips.html,
    mount: chips.mount,
    ready: () => chips.built().length > 0,
    check() {
      chips.lock();
      return { result: normalize(chips.built().join(' ')) === normalize(answer) ? 'correct' : 'wrong', ...this.reveal() };
    },
    reveal: () => ({ answerHTML: `${esc(spec.show)} = <span lang="is">${esc(answer)}</span>`, audio: answer }),
  };
}
