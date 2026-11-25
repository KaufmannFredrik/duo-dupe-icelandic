// Numbers by ear: hear a number, a phone number or an ordinal and write it in digits. Only the
// digits count, so "567 1258", "5671258" and "3" for "3." are all right.

import { t } from '../i18n.js';
import { heading, listenCard } from './common.js';
import { numberAnswer } from './numlisten.js';

const digits = (s) => String(s).replace(/\D/g, '');

export function build(spec, ctx) {
  let input;
  return {
    html:
      heading(spec.phone ? 'ex.numtypePhone' : 'ex.numtype') +
      listenCard({ text: spec.say }) +
      `<div class="field"><label class="field__label" for="answer">${t('ex.digits')}</label>
       <input id="answer" class="input input--number" type="text" inputmode="numeric" autocomplete="off" spellcheck="false" enterkeyhint="done"></div>`,
    mount(root) {
      input = root.querySelector('#answer');
      input.addEventListener('input', ctx.changed);
      if (ctx.finePointer) input.focus();
    },
    ready: () => /\d/.test(input.value),
    check() {
      const right = digits(input.value) === digits(spec.answer);
      input.readOnly = true;
      input.dataset.state = right ? 'correct' : 'wrong';
      if (!right) input.setAttribute('aria-invalid', 'true');
      return { result: right ? 'correct' : 'wrong', ...this.reveal() };
    },
    reveal: () => ({ answerHTML: numberAnswer(spec, ctx), audio: spec.say }),
  };
}
