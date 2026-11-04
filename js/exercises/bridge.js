// Norwegian bridge: see the Bokmål relative, type the Icelandic word. The feedback names the
// spelling patterns and the shared origin, so the next pair is easier to guess.

import { t } from '../i18n.js';
import { grade, missingLetters } from '../normalize.js';
import { charRow } from '../ui/charrow.js';
import { evidenceHTML, rulesHTML } from '../bridge.js';
import { esc, heading } from './common.js';

export function build(spec, ctx) {
  const word = ctx.data.lemma(spec.lemma).lemma;
  const rec = ctx.data.recordings(spec.lemma)[0];
  let input;
  return {
    html:
      heading('ex.bridge') +
      `<div class="card prompt-card bridge-prompt"><p class="label">${t('bridge.norwegian')}</p>
        <p class="prompt-card__text" lang="nb">${esc(spec.pair.nb)}</p>
        <p class="muted" lang="${ctx.lang}">${esc(ctx.data.gloss(spec.lemma))}</p></div>
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
      const g = grade(input.value, [word], { strict: ctx.strict });
      input.readOnly = true;
      input.dataset.state = g.result;
      if (g.result === 'wrong') input.setAttribute('aria-invalid', 'true');
      const pairs = missingLetters(input.value, word).map(([c, plain]) => `<span lang="is">${c}</span> ≠ ${plain}`).join(', ');
      const reason = g.reason ? `<p>${t(`feedback.reason.${g.reason}`, { pairs })}</p>` : '';
      return { result: g.result, ...this.reveal(), why: reason + this.reveal().why };
    },
    reveal: () => ({
      answerHTML: `<span lang="is">${esc(word)}</span> ↔ <span lang="nb">${esc(spec.pair.nb)}</span>`,
      audio: word,
      audioUrl: rec?.mp3 ?? rec?.ogg,
      why: `<p>${evidenceHTML(spec.pair)}</p><div class="cluster bridge-rules">${rulesHTML(spec.pair)}</div>`,
    }),
  };
}
