// Read an Icelandic sentence and pick its translation.

import { esc, heading, optionsGroup, promptCard } from './common.js';

export function build(spec, ctx) {
  const s = ctx.data.sentence(spec.sentence);
  // Norwegian options only when every option has a Norwegian translation; mixing languages gives the answer away.
  const lang = spec.options.every((sid) => ctx.data.sentence(sid).nb?.length) ? ctx.lang : 'en';
  const tr = (sid) => ctx.data.translation(sid, lang);
  const opts = optionsGroup(spec.options, (sid) => `<span lang="${tr(sid).lang}">${esc(tr(sid).text)}</span>`, ctx.changed);
  return {
    html: heading('ex.choice') + promptCard({ text: s.is, audio: s.is }) + opts.html,
    mount: opts.mount,
    pickByNumber: opts.pickByNumber,
    ready: () => opts.selected() !== null,
    check() {
      opts.resolve((v) => v === spec.sentence);
      return { result: opts.selected() === spec.sentence ? 'correct' : 'wrong', ...this.reveal() };
    },
    reveal: () => ({ answerHTML: `<span lang="${tr(spec.sentence).lang}">${esc(tr(spec.sentence).text)}</span>`, audio: s.is, sentence: spec.sentence }),
  };
}
