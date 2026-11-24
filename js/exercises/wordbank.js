// Build the Icelandic sentence from word chips. Drag-free: tap a chip to place it, tap again to remove.
// As "dictation" the prompt is audio only: build the sentence you hear.

import { t } from '../i18n.js';
import { normalize } from '../normalize.js';
import { sfx } from '../sfx.js';
import { esc, heading, listenCard, promptCard, wordsOf } from './common.js';
import { rng, shuffle } from '../engine/rng.js';

export function build(spec, ctx) {
  const s = ctx.data.sentence(spec.sentence);
  const tr = ctx.data.translation(spec.sentence);
  // The sentence's first word in small letters (unless it is a name), so its capital does not tell
  // which chip comes first; the distractors are small already.
  const own = wordsOf(s.is).map((w, i) => (i === 0 && !ctx.data.isName?.(w) ? w.toLocaleLowerCase('is') : w));
  const bank = shuffle([...own, ...spec.distractors].map((w, k) => ({ w, k: String(k) })), rng(ctx.seed));
  const placed = [];
  const word = (k) => bank.find((b) => b.k === k).w;
  let root;
  return {
    html:
      heading(spec.type === 'dictation' ? 'ex.dictation' : 'ex.wordbank') +
      (spec.type === 'dictation' ? listenCard({ text: s.is }) : promptCard({ text: tr.text, lang: tr.lang })) +
      `<div class="answer-line" data-answer role="group" aria-label="${t('ex.yourAnswer')}"></div>
       <div class="bank" data-bank role="group" aria-label="${t('ex.wordBank')}">${bank.map((b) => `<button type="button" class="chip" lang="is" data-k="${b.k}">${esc(b.w)}</button>`).join('')}</div>`,
    mount(r) {
      root = r;
      const line = root.querySelector('[data-answer]');
      const bankEl = root.querySelector('[data-bank]');
      bankEl.addEventListener('click', (e) => {
        const chip = e.target.closest('.chip');
        if (!chip || chip.disabled) return;
        placed.push(chip.dataset.k);
        chip.disabled = true;
        chip.classList.add('is-used');
        line.insertAdjacentHTML('beforeend', `<button type="button" class="chip" lang="is" data-k="${chip.dataset.k}">${esc(word(chip.dataset.k))}</button>`);
        sfx('tap');
        const next = [...bankEl.querySelectorAll('.chip:not(:disabled)')].find((c) => c.compareDocumentPosition(chip) & Node.DOCUMENT_POSITION_PRECEDING) ?? bankEl.querySelector('.chip:not(:disabled)');
        (next ?? document.querySelector('[data-action="check"]'))?.focus();
        ctx.changed();
      });
      line.addEventListener('click', (e) => {
        const chip = e.target.closest('.chip');
        if (!chip || chip.disabled) return;
        placed.splice(placed.indexOf(chip.dataset.k), 1);
        chip.remove();
        const original = bankEl.querySelector(`[data-k="${chip.dataset.k}"]`);
        original.disabled = false;
        original.classList.remove('is-used');
        original.focus();
        ctx.changed();
      });
    },
    ready: () => placed.length > 0,
    check() {
      for (const c of root.querySelectorAll('.chip')) c.disabled = true;
      const built = placed.map(word).join(' ');
      return { result: normalize(built) === normalize(s.is) ? 'correct' : 'wrong', ...this.reveal() };
    },
    reveal: () => ({
      answerHTML: `<span lang="is">${esc(s.is)}</span>${spec.type === 'dictation' ? `<br><span lang="${tr.lang}" class="muted">${esc(tr.text)}</span>` : ''}`,
      audio: s.is,
      sentence: spec.sentence,
    }),
  };
}
