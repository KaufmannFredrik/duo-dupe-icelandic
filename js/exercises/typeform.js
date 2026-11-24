// Write the right form: a sentence with one word left out and its dictionary form given. The
// learner types the form (its case, or for a verb its person and number), where "ending" and
// "conjugate" let them pick it. Used where the word is known: unit reviews and well-learned cards.

import { t } from '../i18n.js';
import { grade, missingLetters } from '../normalize.js';
import { charRow } from '../ui/charrow.js';
import { esc, heading, promptCard, sentenceHTML } from './common.js';
import { whyHTML } from './ending.js';

export function build(spec, ctx) {
  const s = ctx.data.sentence(spec.sentence);
  const tr = ctx.data.translation(spec.sentence);
  const l = ctx.data.lemma(spec.lemma);
  // The form in the sentence, and any other spelling the DMII Core lists for the same slot.
  const low = (x) => x.toLocaleLowerCase('is');
  const variants = ctx.data.paradigm(spec.lemma).filter((f) => f.g.replace(/\d$/, '') === spec.tag && low(f.b) !== low(spec.target)).map((f) => f.b);
  const answers = [spec.target, ...variants];
  let input;
  return {
    html:
      heading('ex.typeform') +
      promptCard({ html: sentenceHTML(s.is, spec.target, 'blank') }) +
      `<p>${t('ex.typeformWord', { word: `<strong lang="is">${esc(l.lemma)}</strong>` })}</p>
       <p class="muted" lang="${tr.lang}">${esc(tr.text)}</p>
       <div class="field"><label class="field__label" for="answer">${t('ex.yourAnswer')}</label>
       <input id="answer" class="input" type="text" lang="is" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" enterkeyhint="done"></div>
       <div data-charrow></div>`,
    mount(root) {
      input = root.querySelector('#answer');
      root.querySelector('[data-charrow]').replaceWith(charRow(input));
      input.addEventListener('input', ctx.changed);
      if (ctx.finePointer) input.focus();
    },
    ready: () => input.value.trim().length > 0,
    check() {
      const g = grade(input.value, answers, { strict: ctx.strict });
      input.readOnly = true;
      input.dataset.state = g.result;
      if (g.result === 'wrong') input.setAttribute('aria-invalid', 'true');
      const pairs = missingLetters(input.value, g.answer).map(([c, plain]) => `<span lang="is">${c}</span> ≠ ${plain}`).join(', ');
      const reason = g.reason ? `<p>${t(`feedback.reason.${g.reason}`, { pairs })}</p>` : '';
      return { result: g.result, ...this.reveal(), why: reason + whyHTML(spec, ctx) };
    },
    reveal: () => ({ answerHTML: `<span lang="is">${sentenceHTML(s.is, spec.target, 'mark')}</span>`, audio: s.is, why: whyHTML(spec, ctx), sentence: spec.sentence }),
  };
}
