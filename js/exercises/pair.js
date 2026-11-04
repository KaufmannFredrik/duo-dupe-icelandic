// Minimal pairs: hear one word of a pair that differs in a single sound, and pick which it was.

import { pick } from '../i18n.js';
import { esc, heading, listenCard, optionsGroup } from './common.js';

export function build(spec, ctx) {
  const opts = optionsGroup(spec.words, (w) => `<span lang="is">${esc(w)}</span>`, ctx.changed);
  const note = ctx.contrasts?.[spec.contrast];
  return {
    html: heading('ex.pair') + listenCard({ text: spec.answer }) + opts.html,
    mount: opts.mount,
    pickByNumber: opts.pickByNumber,
    ready: () => opts.selected() !== null,
    check() {
      opts.resolve((v) => v === spec.answer);
      return { result: opts.selected() === spec.answer ? 'correct' : 'wrong', ...this.reveal() };
    },
    reveal: () => ({
      answerHTML: spec.words.map((w) => `<span lang="is"${w === spec.answer ? ' class="is-inline"' : ''}>${esc(w)}</span>`).join(' / '),
      audio: spec.answer,
      why: note ? `<p>${esc(pick(note))}</p>` : '',
    }),
  };
}
