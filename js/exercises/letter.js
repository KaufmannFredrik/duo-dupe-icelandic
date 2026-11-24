// Hear a course word and pick the spelling missing from it: ó or o, ð or d, hv or v, kk or k.
// The word was chosen because its pronunciation has that sound there (js/engine/letters.js).

import { esc, gapHTML, heading, itemNote, listenCard, optionsGroup } from './common.js';

export function build(spec, ctx) {
  const rec = ctx.data.recordings(spec.lemma)[0];
  const url = rec?.mp3 ?? rec?.ogg ?? null;
  const opts = optionsGroup(spec.options, (v) => `<span lang="is" class="letter-option">${esc(v)}</span>`, ctx.changed);
  return {
    html: heading('ex.letter') + listenCard({ text: spec.word, url }) + `<p class="letter-word" lang="is">${gapHTML(spec.word, spec.at, spec.len)}</p>` + opts.html,
    mount: opts.mount,
    pickByNumber: opts.pickByNumber,
    ready: () => opts.selected() !== null,
    check() {
      opts.resolve((v) => v === spec.answer);
      return { result: opts.selected() === spec.answer ? 'correct' : 'wrong', ...this.reveal() };
    },
    reveal: () => ({
      answerHTML: `<span lang="is">${gapHTML(spec.word, spec.at, spec.len, 'mark')}</span>`,
      audio: spec.word,
      audioUrl: url,
      why: itemNote(ctx, spec.item),
    }),
  };
}
