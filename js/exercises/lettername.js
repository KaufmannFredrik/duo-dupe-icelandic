// Hear the name of a letter (bé, eð, þorn, ufsilon ý) and pick the letter.

import { esc, heading, itemNote, listenCard, optionsGroup } from './common.js';

const glyphs = (c) => `${c.toLocaleUpperCase('is')} ${c}`;

export function build(spec, ctx) {
  const opts = optionsGroup(spec.options, (v) => `<span lang="is" class="letter-option">${esc(glyphs(v))}</span>`, ctx.changed);
  const name = ctx.letters?.get(spec.answer)?.name ?? spec.say;
  return {
    html: heading('ex.lettername') + listenCard({ text: spec.say }) + opts.html,
    mount: opts.mount,
    pickByNumber: opts.pickByNumber,
    ready: () => opts.selected() !== null,
    check() {
      opts.resolve((v) => v === spec.answer);
      return { result: opts.selected() === spec.answer ? 'correct' : 'wrong', ...this.reveal() };
    },
    reveal: () => ({
      answerHTML: `<span lang="is">${esc(glyphs(spec.answer))}</span>: <span lang="is">${esc(name)}</span>`,
      audio: spec.say,
      why: itemNote(ctx, spec.item),
    }),
  };
}
