// Type the Icelandic word for a meaning. The special-character row helps with þ, ð, æ, ö and accents.
// Another course word shown with the same meaning counts too ("to know": vita, þekkja, kunna); the
// feedback names the word that was asked for, and the answer counts for the word typed.

import { t } from '../i18n.js';
import { gradeWord, missingLetters } from '../normalize.js';
import { charRow } from '../ui/charrow.js';
import { esc, heading, promptCard } from './common.js';

export function build(spec, ctx) {
  const word = ctx.data.lemma(spec.lemma).lemma;
  const rec = ctx.data.recordings(spec.lemma)[0];
  let input;
  return {
    html:
      heading('ex.typeword') +
      promptCard({ text: ctx.data.gloss(spec.lemma), lang: ctx.lang }) +
      `<div class="field"><label class="field__label" for="answer">${t('ex.yourAnswer')}</label>
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
      const alts = ctx.data.sameGloss?.(spec.lemma) ?? [];
      const g = gradeWord(input.value, word, alts.map((x) => ctx.data.lemma(x).lemma), { strict: ctx.strict });
      const other = g.other >= 0 ? alts[g.other] : null;
      const typed = other ? ctx.data.lemma(other).lemma : word;
      input.readOnly = true;
      input.dataset.state = g.result;
      if (g.result === 'wrong') input.setAttribute('aria-invalid', 'true');
      const pairs = missingLetters(input.value, typed).map(([c, plain]) => `<span lang="is">${c}</span> ≠ ${plain}`).join(', ');
      const why = [
        other ? `<p>${t('feedback.sameMeaning', { other: `<span lang="is">${esc(typed)}</span>`, word: `<span lang="is">${esc(word)}</span>` })}</p>` : '',
        g.reason ? `<p>${t(`feedback.reason.${g.reason}`, { pairs })}</p>` : '',
      ].join('');
      return { result: g.result, ...this.reveal(), why, ...(other ? { records: [{ key: `${other}|meaning`, result: g.result }] } : {}) };
    },
    reveal: () => ({ answerHTML: `<span lang="is">${esc(word)}</span>`, audio: word, audioUrl: rec?.mp3 ?? rec?.ogg }),
  };
}
