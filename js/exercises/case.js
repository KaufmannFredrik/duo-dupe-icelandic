// Which case is the marked word? Asked only for forms that belong to exactly one case.

import { CASES } from '../grammar.js';
import { caseTag } from '../ui/forms.js';
import { esc, heading, optionsGroup, promptCard, sentenceHTML } from './common.js';
import { whyHTML } from './ending.js';

export function build(spec, ctx) {
  const s = ctx.data.sentence(spec.sentence);
  const tr = ctx.data.translation(spec.sentence);
  const right = new Set(spec.cases);
  const opts = optionsGroup(CASES, (c) => caseTag(c), ctx.changed);
  return {
    html: heading('ex.case') + promptCard({ html: sentenceHTML(s.is, spec.target, 'mark'), audio: s.is }) + `<p class="muted" lang="${tr.lang}">${esc(tr.text)}</p>` + opts.html,
    mount: opts.mount,
    pickByNumber: opts.pickByNumber,
    ready: () => opts.selected() !== null,
    check() {
      opts.resolve((v) => right.has(v));
      return { result: right.has(opts.selected()) ? 'correct' : 'wrong', ...this.reveal() };
    },
    reveal: () => ({
      answerHTML: `<span lang="is">${sentenceHTML(s.is, spec.target, 'mark')}</span> ${spec.cases.map((c) => caseTag(c)).join(' ')}`,
      audio: s.is,
      why: whyHTML(spec, ctx),
      sentence: spec.sentence,
    }),
  };
}
