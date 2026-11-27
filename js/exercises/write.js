// Guided writing: a short model text with gaps the learner fills about themselves (js/engine/
// writing.js grades them). Each line shows its meaning in the interface language; under the text,
// the words the course knows for each gap in their dictionary form, so the learner still writes the
// form the frame needs (frá Noregi, tala íslensku). No spaced-repetition card: the gaps hold the
// learner's own answers, not one word to learn. No audio: a learner's own text has no recording.

import { pick, t } from '../i18n.js';
import { missingLetters } from '../normalize.js';
import { charRow } from '../ui/charrow.js';
import { gradeTask, lineParts, sampleAnswers, filledText } from '../engine/writing.js';
import { esc, heading } from './common.js';

const CASE_KEY = { NF: 'case.nf', ÞF: 'case.thf', ÞGF: 'case.thgf', EF: 'case.ef' };

// The word right before a gap in its line (frá, í, tala, er): the feedback names it.
function wordBefore(text) {
  const m = text.trim().match(/(\p{L}+)$/u);
  return m ? m[1] : '';
}

export function build(spec, ctx) {
  const { task, slots } = ctx.data.writing(spec.task);
  const gaps = [];
  let n = 0;
  const lineHTML = (line) => {
    const parts = lineParts(line.is);
    const html = parts.map((p, k) => {
      if (p.text) return esc(p.text);
      const slot = slots[p.slot];
      const i = n++;
      gaps.push({ id: p.slot, before: wordBefore(parts[k - 1]?.text ?? '') });
      return `<input class="input write__input" type="text" lang="is" data-gap="${i}" aria-label="${esc(pick(slot.label))}" autocomplete="off" autocapitalize="${slot.kind === 'name' ? 'words' : 'off'}" autocorrect="off" spellcheck="false" enterkeyhint="next" size="${slot.kind === 'name' ? 10 : 12}">`;
    }).join('');
    return `<li class="write__line"><p class="write__is" lang="is">${html}</p><p class="write__meaning muted">${esc(pick(line))}</p></li>`;
  };
  const lines = task.lines.map(lineHTML).join('');
  // The words each kind of gap knows, once per kind, in their dictionary form.
  const kinds = [...new Set(gaps.map((g) => g.id))].filter((id) => slots[id].kind === 'forms');
  const wordList = (id) => [...new Set(slots[id].words.map((w) => w.lemma))].join(', ');
  const help = kinds.length
    ? `<details class="write__help"><summary>${t('ex.write.words')}</summary><dl>${kinds.map((id) => `<dt>${esc(pick(slots[id].label))}</dt><dd lang="is">${esc(wordList(id))}</dd>`).join('')}</dl></details>`
    : '';
  let inputs = [];
  let lastFocused = null;
  return {
    html:
      heading('ex.write', { title: esc(pick(task.title)) }) +
      `<p>${esc(pick(task.intro))}</p>
       <div class="card write__card"><ol class="write__lines" role="list">${lines}</ol></div>
       ${help}<div data-charrow></div>`,
    mount(root) {
      inputs = [...root.querySelectorAll('[data-gap]')];
      lastFocused = inputs[0];
      root.querySelector('[data-charrow]').replaceWith(charRow(() => lastFocused));
      for (const input of inputs) {
        input.addEventListener('input', ctx.changed);
        input.addEventListener('focus', () => (lastFocused = input));
        input.addEventListener('keydown', (e) => {
          if (e.key !== 'Enter') return;
          const next = inputs[inputs.indexOf(input) + 1];
          if (next) {
            e.preventDefault();
            next.focus();
          }
        });
      }
      if (ctx.finePointer) inputs[0].focus();
    },
    ready: () => inputs.length > 0 && inputs.every((i) => i.value.trim().length > 0),
    check() {
      const g = gradeTask({ lines: task.lines.map((l) => l.is) }, slots, inputs.map((i) => i.value), { strict: ctx.strict });
      g.slots.forEach((s, i) => {
        inputs[i].readOnly = true;
        inputs[i].dataset.state = s.result;
        if (s.result === 'wrong') inputs[i].setAttribute('aria-invalid', 'true');
      });
      const notes = g.slots.map((s, i) => {
        if (s.result === 'correct') return '';
        const slot = slots[s.id];
        const answer = `<span lang="is">${esc(s.answer)}</span>`;
        const before = `<span lang="is">${esc(gaps[i].before)}</span>`;
        if (s.reason === 'name') return t('ex.write.name');
        if (s.reason === 'capital') return t('ex.write.capital', { answer });
        if (s.reason === 'case') return t('ex.write.case', { before, case: t(CASE_KEY[slot.case]), answer });
        if (s.reason === 'form' || s.reason === 'prep') return t(`ex.write.${s.reason}`, { answer });
        if (s.reason === 'unknown') return t('ex.write.unknown', { label: esc(pick(slot.label)), answer });
        const pairs = missingLetters(inputs[i].value, s.answer).map(([c, plain]) => `<span lang="is">${c}</span> ≠ ${plain}`).join(', ');
        return t(`feedback.reason.${s.reason}`, { pairs });
      }).filter(Boolean);
      const text = filledText({ lines: task.lines.map((l) => l.is) }, g.slots.map((s, i) => ({ answer: s.result === 'wrong' && s.reason === 'name' ? inputs[i].value.trim() || '…' : s.answer })));
      return {
        result: g.result,
        answerHTML: `<span lang="is">${esc(text)}</span>`,
        why: notes.map((x) => `<p>${x}</p>`).join(''),
        records: [],
      };
    },
    reveal() {
      const text = filledText({ lines: task.lines.map((l) => l.is) }, sampleAnswers({ lines: task.lines.map((l) => l.is) }, slots).map((answer) => ({ answer })));
      return { answerHTML: `<span lang="is">${esc(text)}</span>` };
    },
  };
}
