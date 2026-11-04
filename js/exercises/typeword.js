// Type the Icelandic word for a meaning. The special-character row helps with þ, ð, æ, ö and accents.

import { t } from '../i18n.js';
import { grade, missingLetters } from '../normalize.js';
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
      const g = grade(input.value, [word], { strict: ctx.strict });
      input.readOnly = true;
      input.dataset.state = g.result;
      if (g.result === 'wrong') input.setAttribute('aria-invalid', 'true');
      const pairs = missingLetters(input.value, word).map(([c, plain]) => `<span lang="is">${c}</span> ≠ ${plain}`).join(', ');
      return { result: g.result, ...this.reveal(), why: g.reason ? `<p>${t(`feedback.reason.${g.reason}`, { pairs })}</p>` : '' };
    },
    reveal: () => ({ answerHTML: `<span lang="is">${esc(word)}</span>`, audio: word, audioUrl: rec?.mp3 ?? rec?.ogg }),
  };
}
