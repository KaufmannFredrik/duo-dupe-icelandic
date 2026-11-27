// Principal parts (section A2): a strong verb's past singular and plural and its supine, written
// from the infinitive (drekka: drakk, drukku, drukkið). From these the learner can find every other
// form, so they are learned with the verb. Graded cell by cell, like the table.

import { t } from '../i18n.js';
import { formsFor } from '../grammar.js';
import { grade } from '../normalize.js';
import { charRow } from '../ui/charrow.js';
import { describe } from '../ui/forms.js';
import { esc, heading, markIcon, promptCard } from './common.js';

// Each part with the words it goes with in a sentence: hann bar, þeir báru, ég hef borið.
const HINT = { 'GM-FH-ÞT-3P-ET': 'hann', 'GM-FH-ÞT-3P-FT': 'þeir', 'GM-SAGNB': 'ég hef' };

export function build(spec, ctx) {
  const l = ctx.data.lemma(spec.lemma);
  const bm = ctx.data.paradigm(spec.lemma);
  let inputs = [];
  let last = null;
  const row = (tag) =>
    `<tr><th scope="row">${esc(describe(tag, { ofl: 'so' }))}</th>
      <td><span class="parts__cell"><span class="muted" lang="is">${esc(HINT[tag])}</span><input class="decl__input" lang="is" data-tag="${tag}" aria-label="${esc(describe(tag, { ofl: 'so' }))}" autocomplete="off" autocapitalize="off" spellcheck="false"></span></td></tr>`;
  return {
    html: `${heading('ex.parts')}${promptCard({ text: l.lemma, audio: l.lemma })}
      <div class="decl-wrap"><table class="decl" data-kind="parts"><caption class="visually-hidden">${t('ex.partsCaption', { lemma: esc(l.lemma) })}</caption>
      <tbody><tr><th scope="row">${esc(t('mood.infinitive'))}</th><td><span class="decl__cell" lang="is">${esc(l.lemma)}</span></td></tr>${spec.blanks.map(row).join('')}</tbody></table></div>
      <div data-charrow></div>`,
    mount(root) {
      inputs = [...root.querySelectorAll('.decl__input')];
      for (const i of inputs) {
        i.addEventListener('input', ctx.changed);
        i.addEventListener('focus', () => { last = i; });
      }
      root.querySelector('[data-charrow]').replaceWith(charRow(() => last ?? inputs[0]));
      if (ctx.finePointer) inputs[0]?.focus();
    },
    ready: () => inputs.every((i) => i.value.trim()),
    check() {
      let worst = 'correct';
      for (const i of inputs) {
        const answers = formsFor(bm, i.dataset.tag);
        const g = grade(i.value, answers, { strict: ctx.strict });
        i.readOnly = true;
        i.dataset.state = g.result;
        i.insertAdjacentHTML('afterend', `<span class="decl__mark decl__mark--${g.result}">${markIcon(g.result).replace('option__mark', 'icon--sm')}<span lang="is">${esc(answers[0])}</span></span>`);
        if (g.result === 'wrong') worst = 'wrong';
        else if (g.result === 'almost' && worst === 'correct') worst = 'almost';
      }
      // One card for the four forms together: reviews bring the exercise back (generate.js parts).
      return { result: worst, ...this.reveal(), records: [{ key: spec.key, result: worst, meta: { mood: 'parts' } }] };
    },
    reveal: () => ({
      answerHTML: `<span lang="is">${[l.lemma, ...spec.blanks.map((tag) => formsFor(bm, tag)[0])].map(esc).join(', ')}</span>`,
      audio: l.lemma,
      why: `<p>${t('ex.partsWhy')}</p>`,
    }),
  };
}
