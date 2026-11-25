// Build the Icelandic sentence from word chips. Drag-free: tap a chip to place it, tap again to remove.
// As "dictation" the prompt is audio only: build the sentence you hear.

import { normalize } from '../normalize.js';
import { chipBank, esc, heading, listenCard, promptCard, wordsOf } from './common.js';
import { rng, shuffle } from '../engine/rng.js';

export function build(spec, ctx) {
  const s = ctx.data.sentence(spec.sentence);
  const tr = ctx.data.translation(spec.sentence);
  // The sentence's first word in small letters (unless it is a name), so its capital does not tell
  // which chip comes first; the distractors are small already.
  const own = wordsOf(s.is).map((w, i) => (i === 0 && !ctx.data.isName?.(w) ? w.toLocaleLowerCase('is') : w));
  const chips = chipBank(shuffle([...own, ...spec.distractors], rng(ctx.seed)), ctx.changed);
  return {
    html:
      heading(spec.type === 'dictation' ? 'ex.dictation' : 'ex.wordbank') +
      (spec.type === 'dictation' ? listenCard({ text: s.is }) : promptCard({ text: tr.text, lang: tr.lang })) +
      chips.html,
    mount: chips.mount,
    ready: () => chips.built().length > 0,
    check() {
      chips.lock();
      return { result: normalize(chips.built().join(' ')) === normalize(s.is) ? 'correct' : 'wrong', ...this.reveal() };
    },
    reveal: () => ({
      answerHTML: `<span lang="is">${esc(s.is)}</span>${spec.type === 'dictation' ? `<br><span lang="${tr.lang}" class="muted">${esc(tr.text)}</span>` : ''}`,
      audio: s.is,
      sentence: spec.sentence,
    }),
  };
}
