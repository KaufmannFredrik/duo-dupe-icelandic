// See an Icelandic word and pick its meaning.

import { esc, heading, optionsGroup, promptCard } from './common.js';

export function build(spec, ctx) {
  const word = ctx.data.lemma(spec.lemma).lemma;
  const rec = ctx.data.recordings(spec.lemma)[0];
  const opts = optionsGroup(spec.options, (id) => `<span lang="${ctx.lang}">${esc(ctx.data.gloss(id))}</span>`, ctx.changed);
  return {
    html: heading('ex.meaning') + promptCard({ text: word, audio: { text: word, url: rec?.mp3 ?? rec?.ogg } }) + opts.html,
    mount: opts.mount,
    pickByNumber: opts.pickByNumber,
    ready: () => opts.selected() !== null,
    check() {
      opts.resolve((v) => v === spec.lemma);
      return { result: opts.selected() === spec.lemma ? 'correct' : 'wrong', ...this.reveal() };
    },
    reveal: () => ({ answerHTML: `<span lang="is">${esc(word)}</span> = <span lang="${ctx.lang}">${esc(ctx.data.gloss(spec.lemma))}</span>`, audio: word, audioUrl: rec?.mp3 ?? rec?.ogg }),
  };
}
