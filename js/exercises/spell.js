// Hear a short course word and write it. Its meaning is shown, since some sounds have two
// spellings (i and y, f and v between vowels). Graded like other typing, without the ASCII
// stand-ins (th for þ): the letters are the point here.

import { t } from '../i18n.js';
import { grade, missingLetters } from '../normalize.js';
import { charRow } from '../ui/charrow.js';
import { esc, heading, itemNote, listenCard } from './common.js';

export function build(spec, ctx) {
  const rec = ctx.data.recordings(spec.lemma)[0];
  const url = rec?.mp3 ?? rec?.ogg ?? null;
  const meaning = ctx.data.gloss(spec.lemma);
  let input;
  return {
    html:
      heading('ex.spell') +
      listenCard({ text: spec.word, url }) +
      (meaning ? `<p class="muted spell-hint">${t('ex.spellHint', { meaning: `<span lang="${ctx.lang}">${esc(meaning)}</span>` })}</p>` : '') +
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
      const g = grade(input.value, [spec.word], { strict: ctx.strict, early: false });
      input.readOnly = true;
      input.dataset.state = g.result;
      if (g.result === 'wrong') input.setAttribute('aria-invalid', 'true');
      const pairs = missingLetters(input.value, spec.word).map(([c, plain]) => `<span lang="is">${c}</span> ≠ ${plain}`).join(', ');
      const reason = g.reason && pairs ? `<p>${t(`feedback.reason.${g.reason}`, { pairs })}</p>` : '';
      return { result: g.result, ...this.reveal(), why: reason + itemNote(ctx, spec.item) };
    },
    reveal: () => ({ answerHTML: `<span lang="is">${esc(spec.word)}</span>`, audio: spec.word, audioUrl: url, why: itemNote(ctx, spec.item) }),
  };
}
