// Numbers by ear (js/engine/numbers.js): hear a number, a phone number or an ordinal and pick it
// from numbers that sound alike (17, 70, 7; 47, 74).

import { phoneShow } from '../engine/numbers.js';
import { esc, heading, listenCard, optionsGroup } from './common.js';

/** A number as shown: a phone number in the groups it is said in ("567 12 58"). */
export const shownNumber = (spec, v) => (spec.phone ? phoneShow(v) : v);

/** The answer in the feedback: "47 = fjörutíu og sjö", with the meaning for an ordinal. */
export function numberAnswer(spec, ctx) {
  const ordinal = spec.answer.endsWith('.');
  const meaning = ordinal ? ctx.data.gloss(spec.lemma) : '';
  return `${esc(shownNumber(spec, spec.answer))} = <span lang="is">${esc(spec.say)}</span>${meaning ? ` <span class="muted">(<span lang="${ctx.lang}">${esc(meaning)}</span>)</span>` : ''}`;
}

export function build(spec, ctx) {
  const opts = optionsGroup(spec.options, (v) => `<span class="number-option">${esc(shownNumber(spec, v))}</span>`, ctx.changed);
  return {
    html: heading(spec.phone ? 'ex.numlistenPhone' : 'ex.numlisten') + listenCard({ text: spec.say }) + opts.html,
    mount: opts.mount,
    pickByNumber: opts.pickByNumber,
    ready: () => opts.selected() !== null,
    check() {
      opts.resolve((v) => v === spec.answer);
      return { result: opts.selected() === spec.answer ? 'correct' : 'wrong', ...this.reveal() };
    },
    reveal: () => ({ answerHTML: numberAnswer(spec, ctx), audio: spec.say }),
  };
}
