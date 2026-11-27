// Reading and listening questions (section A2): a story of content/stories/ and questions about it
// in the interface language (js/engine/reading.js makes the spec). Reading: the text is shown, a
// line can be played. Listening: the story is heard, all of it or a line at a time, and its text is
// shown once the answers are checked. Every question must be right for the exercise to be right;
// the feedback quotes the line that answers each one missed. No spaced-repetition card: the
// questions are about a text, not one word to learn.

import { pick, t } from '../i18n.js';
import { play, stop } from '../audio.js';
import { icon } from '../shell.js';
import { characterImg } from '../ui/character.js';
import { character } from '../characters.js';
import { esc, heading, markIcon } from './common.js';

export function build(spec, ctx) {
  const lines = spec.lines.map((sid) => ctx.data.sentence(sid));
  if (lines.some((s) => !s)) throw new Error('a line of the story is gone');
  const narrator = character(spec.narrator);
  const chosen = spec.questions.map(() => null);
  let root;
  // Playing the whole story: each line in turn, until it ends or anything else is played.
  let run = 0;
  const playAll = async (slow) => {
    const me = ++run;
    for (const s of lines) {
      if (me !== run || !root?.isConnected) return;
      await new Promise((resolve) => play({ text: s.is, slow, quiet: true, onEnd: resolve }));
      if (me !== run) return;
      await new Promise((resolve) => setTimeout(resolve, 450));
    }
  };
  const halt = () => {
    run++;
    stop();
  };

  // The text, each line with a play button; heard first, it is shown without them (the numbered
  // buttons play its lines), so the P key plays the story, not a line of the hidden text.
  const textHTML = (buttons) => `<ol class="reading__text" role="list">${lines
    .map((s, n) => `<li class="reading__line" data-line="${n}">${buttons ? `<button type="button" class="icon-button" data-play="${esc(s.is)}" aria-label="${t('audio.playSentence')}">${icon('play')}</button>` : ''}<p lang="is">${esc(s.is)}</p></li>`)
    .join('')}</ol>`;
  const listenHTML = `<div class="prompt-card__audio">
      <button type="button" class="button button-primary" data-story-play>${icon('sound-on')}<span>${t('reading.playAll')}</span></button>
      <button type="button" class="button button--sm" data-story-play data-slow>${icon('slow')}<span>${t('audio.slow')}</span></button></div>
    <p class="muted">${t('reading.lines')}</p>
    <div class="cluster reading__lines">${lines.map((s, n) => `<button type="button" class="button button--sm" data-line-play="${n}" aria-label="${t('reading.playLine', { n: n + 1 })}">${n + 1}</button>`).join('')}</div>`;
  const questionHTML = (q, i) => `<li class="reading__question"><p class="reading__q" id="q-${i}">${esc(pick(q.q))}</p>
      <div class="options" role="group" aria-labelledby="q-${i}">${q.options
        .map((o, k) => `<button type="button" class="option" data-q="${i}" data-value="${k}" aria-pressed="false"><span class="option__key kbd" aria-hidden="true">${k + 1}</span><span>${esc(pick(o))}</span></button>`)
        .join('')}</div></li>`;

  const buttonsOf = (i) => [...root.querySelectorAll(`.option[data-q="${i}"]`)];
  const choose = (btn) => {
    if (!btn || btn.disabled) return;
    const i = Number(btn.dataset.q);
    chosen[i] = Number(btn.dataset.value);
    for (const b of buttonsOf(i)) b.setAttribute('aria-pressed', String(b === btn));
    ctx.changed();
  };
  const right = (i) => chosen[i] === spec.questions[i].answer;
  // A missed question: the question, the line that answers it and what that line means.
  const lineNote = (q) => {
    const sid = spec.lines[q.line];
    const tr = ctx.data.translation(sid);
    return `<p class="reading__note"><strong>${esc(pick(q.q))}</strong> ${t('reading.answeredBy')} <span lang="is">${esc(lines[q.line].is)}</span> <span class="muted" lang="${tr.lang}">(${esc(tr.text)})</span></p>`;
  };
  // One answer a line; the space keeps them apart when the sheet is read out.
  const answersHTML = () => spec.questions.map((q, i) => `${i + 1}. ${esc(pick(q.options[q.answer]))}`).join('<br> ');

  return {
    html:
      heading(spec.listen ? 'ex.listening' : 'ex.reading', { title: esc(pick(spec.title)) }) +
      `<div class="card reading__card">${narrator ? `<p class="reading__by">${characterImg(narrator.id, { size: 40, still: true, label: '' })}<span>${t('stories.narrator')} ${esc(narrator.name)}</span></p>` : ''}
        ${spec.listen ? `${listenHTML}<div data-reading-text hidden>${textHTML(false)}</div>` : textHTML(true)}
        <p class="credit">${t('stories.credit', { list: spec.lines.map((sid) => `${ctx.data.tatoebaLink(sid)} (${esc(ctx.data.sentence(sid).author ?? t('credit.unknownAuthor'))}${ctx.data.changedNote(sid)})`).join(', ') })}</p></div>
      <ol class="reading__questions" role="list">${spec.questions.map(questionHTML).join('')}</ol>`,
    mount(r) {
      root = r;
      // On the exercise's own buttons: the stage that holds it is used again by the next exercise.
      for (const b of root.querySelectorAll('.option[data-q]')) b.addEventListener('click', () => choose(b));
      for (const b of root.querySelectorAll('[data-story-play]')) b.addEventListener('click', () => {
        halt();
        playAll('slow' in b.dataset);
      });
      for (const b of root.querySelectorAll('[data-line-play]')) b.addEventListener('click', () => {
        halt();
        play({ text: lines[Number(b.dataset.linePlay)].is });
      });
      // A line played from its own button (the lesson page plays it) ends the whole story.
      for (const b of root.querySelectorAll('[data-play]')) b.addEventListener('click', () => run++);
    },
    // A number picks an option of the question in focus, else of the first one not answered.
    pickByNumber(n) {
      const focused = document.activeElement?.closest?.('.option[data-q]');
      const i = focused ? Number(focused.dataset.q) : Math.max(0, chosen.indexOf(null));
      choose(buttonsOf(i)[n - 1]);
    },
    ready: () => chosen.every((c) => c !== null),
    check() {
      halt();
      spec.questions.forEach((q, i) => {
        for (const b of buttonsOf(i)) {
          b.disabled = true;
          const k = Number(b.dataset.value);
          const state = k === q.answer ? 'correct' : k === chosen[i] ? 'wrong' : null;
          if (!state) continue;
          b.dataset.state = state;
          b.insertAdjacentHTML('beforeend', `${markIcon(state)}<span class="visually-hidden">${t(`feedback.${state}`)}</span>`);
        }
      });
      const hidden = root.querySelector('[data-reading-text]');
      if (hidden) hidden.hidden = false;
      const missed = spec.questions.filter((q, i) => !right(i));
      return {
        result: missed.length ? 'wrong' : 'correct',
        answerHTML: answersHTML(),
        why: missed.map(lineNote).join(''),
      };
    },
    reveal() {
      halt();
      const hidden = root?.querySelector('[data-reading-text]');
      if (hidden) hidden.hidden = false;
      return { answerHTML: answersHTML(), why: spec.questions.map(lineNote).join('') };
    },
  };
}
