// Fill in the right form: the options are other forms of the same word, so the choice is about case
// ("ending") or, for a verb, about person and number ("conjugate": the forms of the same tense), or
// in section A2 about the supine after hafa (its options: the supine, infinitive, past and present).

import { pick, t } from '../i18n.js';
import { describe } from '../ui/forms.js';
import { esc, heading, optionsGroup, promptCard, sentenceHTML } from './common.js';

export const sameForm = (a, b) => a.toLocaleLowerCase('is') === b.toLocaleLowerCase('is');

export function whyHTML(spec, ctx) {
  const rule = spec.rule ? ctx.data.caseRules()[spec.rule] : null;
  const l = ctx.data.lemma(spec.lemma);
  const same = l.lemma.toLocaleLowerCase('is') === spec.target.toLocaleLowerCase('is');
  const form = `<p><span lang="is">${esc(spec.target)}</span>: ${esc(describe(spec.tag, { ofl: l.ofl }))}${same ? '' : ` (<span lang="is">${esc(l.lemma)}</span>)`}.</p>`;
  // The supine after hafa (section A2): the perfect.
  const perfect = spec.tag === 'GM-SAGNB' ? `<p>${esc(t('ex.supineWhy'))}</p>` : '';
  return `${rule ? `<p>${esc(pick(rule))}</p>` : ''}${perfect}${form}`;
}

export function build(spec, ctx) {
  const s = ctx.data.sentence(spec.sentence);
  const tr = ctx.data.translation(spec.sentence);
  const opts = optionsGroup(spec.options, (f) => `<span lang="is">${esc(f)}</span>`, ctx.changed);
  return {
    html: heading('ex.ending') + promptCard({ html: sentenceHTML(s.is, spec.target, 'blank') }) + `<p class="muted" lang="${tr.lang}">${esc(tr.text)}</p>` + opts.html,
    mount: opts.mount,
    pickByNumber: opts.pickByNumber,
    ready: () => opts.selected() !== null,
    check() {
      opts.resolve((v) => sameForm(v, spec.target));
      return { result: sameForm(opts.selected(), spec.target) ? 'correct' : 'wrong', ...this.reveal() };
    },
    reveal: () => ({ answerHTML: `<span lang="is">${sentenceHTML(s.is, spec.target, 'mark')}</span>`, audio: s.is, why: whyHTML(spec, ctx), sentence: spec.sentence }),
  };
}
