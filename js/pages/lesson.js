// Phase 1 demo lesson: six exercise types on real data (Tatoeba sentences, DMII Core forms),
// the three feedback states, keyboard shortcuts and the quit dialog. Phase 3 grows this into
// the full engine with units, scoring and spaced repetition.

import { loadJSON, ready } from '../app.js';
import { pick, t } from '../i18n.js';
import { CASES, analyses, caseTag, describeForm, distinctForms, loadLexicon, sentence } from '../lexicon.js';
import { grade, missingLetters, normalize } from '../normalize.js';
import { getSettings } from '../store.js';
import { play } from '../audio.js';
import { sfx } from '../sfx.js';
import { charRow } from '../ui/charrow.js';
import { icon } from '../shell.js';
import { talaSVG } from '../tala.js';

await ready;
const [, lesson, caseRules] = await Promise.all([loadLexicon(), loadJSON('content/demo/lesson.json'), loadJSON('content/case-rules.json')]);

const $ = (sel, root = document) => root.querySelector(sel);
const stage = $('[data-exercise]');
const main = $('#main');
const progress = $('[data-progress]');
const actions = $('.lesson__actions');
const checkBtn = $('[data-action="check"]');
const skipBtn = $('[data-action="skip"]');
const sheet = $('[data-sheet]');
const live = $('[data-live]');
const quitDialog = $('[data-quit-dialog]');

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const isText = (id) => sentence(id).is;
const enText = (id) => sentence(id).en[0].text;
const fine = window.matchMedia('(pointer: fine)').matches;

// Deterministic shuffle, so every run (and every screenshot) shows the same order.
function shuffle(items, seed) {
  const a = [...items];
  let s = seed;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const heading = (key) => `<h2 class="label" id="ex-label">${t(key)}</h2>`;

function promptCard({ text, html, lang = 'is', audio = true }) {
  const buttons = audio
    ? `<div class="prompt-card__audio">
        <button type="button" class="button button--sm" data-play="${esc(text)}">${icon('play')}<span>${t('audio.play')}</span></button>
        <button type="button" class="button button--sm" data-play="${esc(text)}" data-slow>${icon('slow')}<span>${t('audio.slow')}</span></button></div>`
    : '';
  return `<div class="card prompt-card">${buttons}<p class="prompt-card__text" lang="${lang}">${html ?? esc(text)}</p></div>`;
}

const markIcon = (state) => `<svg class="icon option__mark" aria-hidden="true"><use href="assets/icons.svg#i-${state === 'correct' ? 'check' : state === 'almost' ? 'almost' : 'wrong'}"></use></svg>`;

// Single-select options shared by choice, ending and case exercises.
function optionsGroup(values, render, changed) {
  let selected = null;
  const html = `<div class="options" role="group" aria-labelledby="ex-label">${values
    .map((v, n) => `<button type="button" class="option" data-value="${esc(v)}" aria-pressed="false"><span class="option__key kbd" aria-hidden="true">${n + 1}</span>${render(v)}</button>`)
    .join('')}</div>`;
  const buttons = () => [...stage.querySelectorAll('.option')];
  const choose = (btn) => {
    if (!btn || btn.disabled) return;
    selected = btn.dataset.value;
    for (const b of buttons()) b.setAttribute('aria-pressed', String(b === btn));
    sfx('tap');
    changed();
  };
  return {
    html,
    mount: () => buttons().forEach((b) => b.addEventListener('click', () => choose(b))),
    pickByNumber: (n) => choose(buttons()[n - 1]),
    selected: () => selected,
    resolve(isRight) {
      for (const b of buttons()) {
        b.disabled = true;
        const right = isRight(b.dataset.value);
        const state = right ? 'correct' : b.dataset.value === selected ? 'wrong' : null;
        if (state) {
          b.dataset.state = state;
          b.insertAdjacentHTML('beforeend', `${markIcon(state)}<span class="visually-hidden">${t(`feedback.${state}`)}</span>`);
        }
      }
    },
  };
}

const builders = {
  choice(ex, i, changed) {
    const opts = optionsGroup(shuffle(ex.options, i + 1), (id) => `<span lang="en">${esc(enText(id))}</span>`, changed);
    return {
      html: heading('ex.choice') + promptCard({ text: isText(ex.sentence) }) + opts.html,
      mount: opts.mount,
      pickByNumber: opts.pickByNumber,
      ready: () => opts.selected() !== null,
      check() {
        opts.resolve((v) => v === ex.sentence);
        return { result: opts.selected() === ex.sentence ? 'correct' : 'wrong', ...this.reveal() };
      },
      reveal: () => ({ answerHTML: `<span lang="en">${esc(enText(ex.sentence))}</span>`, audio: isText(ex.sentence) }),
    };
  },

  wordbank(ex, i, changed) {
    const target = isText(ex.sentence);
    const tokens = target.replace(/[.,!?;:]/g, '').split(/\s+/).filter(Boolean);
    const bank = shuffle([...tokens, ...ex.distractors].map((w, k) => ({ w, k: String(k) })), i + 7);
    const placed = [];
    const word = (k) => bank.find((b) => b.k === k).w;
    return {
      html:
        heading('ex.wordbank') +
        promptCard({ text: enText(ex.sentence), lang: 'en', audio: false }) +
        `<div class="answer-line" data-answer role="group" aria-label="${t('ex.yourAnswer')}"></div>
         <div class="bank" data-bank role="group" aria-label="${t('ex.wordBank')}">${bank.map((b) => `<button type="button" class="chip" lang="is" data-k="${b.k}">${esc(b.w)}</button>`).join('')}</div>`,
      mount() {
        const line = $('[data-answer]', stage);
        const bankEl = $('[data-bank]', stage);
        bankEl.addEventListener('click', (e) => {
          const chip = e.target.closest('.chip');
          if (!chip || chip.disabled) return;
          placed.push(chip.dataset.k);
          chip.disabled = true;
          chip.classList.add('is-used');
          line.insertAdjacentHTML('beforeend', `<button type="button" class="chip" lang="is" data-k="${chip.dataset.k}">${esc(word(chip.dataset.k))}</button>`);
          sfx('tap');
          ([...bankEl.querySelectorAll('.chip:not(:disabled)')].find((c) => c.compareDocumentPosition(chip) & Node.DOCUMENT_POSITION_PRECEDING) ?? bankEl.querySelector('.chip:not(:disabled)') ?? checkBtn).focus();
          changed();
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
          changed();
        });
      },
      ready: () => placed.length > 0,
      check() {
        for (const c of stage.querySelectorAll('.chip')) c.disabled = true;
        const built = placed.map(word).join(' ');
        return { result: normalize(built) === normalize(target) ? 'correct' : 'wrong', ...this.reveal() };
      },
      reveal: () => ({ answerHTML: `<span lang="is">${esc(target)}</span>`, audio: target }),
    };
  },

  type(ex, i, changed) {
    const target = isText(ex.sentence);
    let input;
    return {
      html:
        heading('ex.type') +
        promptCard({ text: enText(ex.sentence), lang: 'en', audio: false }) +
        `<div class="field"><label class="field__label" for="answer">${t('ex.yourAnswer')}</label>
         <input id="answer" class="input" type="text" lang="is" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" enterkeyhint="done"></div>
         <div data-charrow></div>`,
      mount() {
        input = $('#answer', stage);
        $('[data-charrow]', stage).replaceWith(charRow(input));
        input.addEventListener('input', changed);
        if (fine) input.focus();
      },
      ready: () => input.value.trim().length > 0,
      check() {
        const g = grade(input.value, [target], { strict: getSettings().strict });
        input.readOnly = true;
        input.dataset.state = g.result;
        if (g.result === 'wrong') input.setAttribute('aria-invalid', 'true');
        const pairs = missingLetters(input.value, target).map(([c, plain]) => `<span lang="is">${c}</span> ≠ ${plain}`).join(', ');
        const why = g.reason ? `<p>${t(`feedback.reason.${g.reason}`, { pairs })}</p>` : '';
        return { result: g.result, why, ...this.reveal() };
      },
      reveal: () => ({ answerHTML: `<span lang="is">${esc(target)}</span>`, audio: target }),
    };
  },

  ending(ex, i, changed) {
    const text = isText(ex.sentence);
    const blank = `<span class="blank"><span class="visually-hidden">${t('ex.blank')}</span><span aria-hidden="true">      </span></span>`;
    const opts = optionsGroup(shuffle(distinctForms(ex.lemma), i + 3), (f) => `<span lang="is">${esc(f)}</span>`, changed);
    const marked = esc(text).replace(esc(ex.target), `<mark class="target">${esc(ex.target)}</mark>`);
    return {
      html: heading('ex.ending') + promptCard({ text, html: esc(text).replace(esc(ex.target), blank), audio: false }) + `<p class="muted" lang="en">${esc(enText(ex.sentence))}</p>` + opts.html,
      mount: opts.mount,
      pickByNumber: opts.pickByNumber,
      ready: () => opts.selected() !== null,
      check() {
        opts.resolve((v) => v === ex.target);
        return { result: opts.selected() === ex.target ? 'correct' : 'wrong', ...this.reveal() };
      },
      reveal: () => ({ answerHTML: `<span lang="is">${marked}</span>`, audio: text, why: whyFor(ex) }),
    };
  },

  case(ex, i, changed) {
    const text = isText(ex.sentence);
    const found = analyses(ex.target).filter((a) => a.lemma === ex.lemma && a.parsed);
    const right = new Set(found.map((a) => a.parsed.case));
    const marked = esc(text).replace(esc(ex.target), `<mark class="target">${esc(ex.target)}</mark>`);
    const opts = optionsGroup(CASES.map((c) => c.id), (id) => caseTag(id), changed);
    return {
      html: heading('ex.case') + promptCard({ text, html: marked }) + `<p class="muted" lang="en">${esc(enText(ex.sentence))}</p>` + opts.html,
      mount: opts.mount,
      pickByNumber: opts.pickByNumber,
      ready: () => opts.selected() !== null,
      check() {
        opts.resolve((v) => right.has(v));
        return { result: right.has(opts.selected()) ? 'correct' : 'wrong', ...this.reveal() };
      },
      reveal: () => ({ answerHTML: `<span lang="is">${marked}</span> ${[...right].map((c) => caseTag(c)).join(' ')}`, audio: text, why: whyFor(ex) }),
    };
  },

  match(ex, i, changed) {
    const left = shuffle(ex.pairs, i + 11);
    const right = shuffle(ex.pairs, i + 5);
    let pending = { is: null, en: null };
    let matched = 0;
    let mistakes = 0;
    const btn = (side, id) => `<button type="button" class="option" data-side="${side}" data-id="${id}" aria-pressed="false"><span lang="${side}">${esc(side === 'is' ? isText(id) : enText(id))}</span></button>`;
    return {
      html: `${heading('ex.match')}<div class="match">
        <div class="match__col" role="group" aria-label="${t('ex.matchIcelandic')}">${left.map((id) => btn('is', id)).join('')}</div>
        <div class="match__col" role="group" aria-label="${t('ex.matchEnglish')}">${right.map((id) => btn('en', id)).join('')}</div></div>`,
      mount() {
        stage.querySelector('.match').addEventListener('click', (e) => {
          const b = e.target.closest('.option');
          if (!b || b.disabled) return;
          const side = b.dataset.side;
          stage.querySelectorAll(`[data-side="${side}"]`).forEach((x) => x.setAttribute('aria-pressed', 'false'));
          b.setAttribute('aria-pressed', 'true');
          pending[side] = b;
          if (side === 'is') play({ text: isText(b.dataset.id), quiet: true });
          if (!pending.is || !pending.en) return;
          const pair = [pending.is, pending.en];
          pending = { is: null, en: null };
          if (pair[0].dataset.id === pair[1].dataset.id) {
            matched++;
            sfx('correct');
            for (const x of pair) {
              x.disabled = true;
              x.dataset.state = 'correct';
              x.setAttribute('aria-pressed', 'false');
              x.insertAdjacentHTML('beforeend', `${markIcon('correct')}<span class="visually-hidden">${t('ex.matched')}</span>`);
            }
            changed();
          } else {
            mistakes++;
            sfx('wrong');
            for (const x of pair) x.dataset.state = 'wrong';
            setTimeout(() => pair.forEach((x) => { delete x.dataset.state; x.setAttribute('aria-pressed', 'false'); }), 700);
          }
        });
      },
      ready: () => matched === ex.pairs.length,
      check() {
        return { result: mistakes === 0 ? 'correct' : 'almost', why: mistakes ? `<p>${t('ex.matchMistakes', { n: mistakes })}</p>` : '', ...this.reveal() };
      },
      reveal: () => ({ answerHTML: ex.pairs.map((id) => `<span lang="is">${esc(isText(id))}</span> = <span lang="en">${esc(enText(id))}</span>`).join('<br>'), audio: null }),
    };
  },
};

function whyFor(ex) {
  const rule = caseRules.rules[ex.rule];
  const a = analyses(ex.target).find((x) => x.lemma === ex.lemma && x.parsed);
  const form = a ? `<p><span lang="is">${esc(ex.target)}</span>: ${esc(describeForm(a.parsed))} (<span lang="is">${esc(ex.lemma)}</span>).</p>` : '';
  return `${rule ? `<p>${esc(pick(rule))}</p>` : ''}${form}`;
}

// --- Flow --------------------------------------------------------------------------------------

const exercises = lesson.exercises;
const params = new URLSearchParams(location.search);
let index = Math.max(0, Math.min(exercises.length - 1, (Number(params.get('step')) || 1) - 1));
let current;
const results = [];

function renderProgress() {
  progress.innerHTML = exercises.map((_, n) => `<span class="progress__seg" data-state="${n < index ? 'done' : n === index ? 'current' : 'todo'}"></span>`).join('');
  progress.setAttribute('aria-valuemax', String(exercises.length));
  progress.setAttribute('aria-valuenow', String(index));
  progress.setAttribute('aria-valuetext', t('lesson.progress', { n: Math.min(index + 1, exercises.length), total: exercises.length }));
}

function show(n, { focus = true } = {}) {
  const ex = exercises[n];
  current = builders[ex.type](ex, n, () => {
    checkBtn.disabled = !current.ready();
  });
  stage.innerHTML = current.html;
  current.mount();
  checkBtn.disabled = true;
  actions.hidden = false;
  renderProgress();
  if (focus && !stage.contains(document.activeElement)) main.focus({ preventScroll: true });
}

function openSheet(r, skipped) {
  const state = r.result;
  const title = skipped ? t('feedback.skipped') : t(`feedback.${state}`);
  const iconName = state === 'correct' ? 'check' : state === 'almost' ? 'almost' : 'wrong';
  sheet.dataset.state = state;
  sheet.innerHTML = `<div class="sheet__inner">
      <div class="sheet__head"><svg class="sheet__icon" aria-hidden="true"><use href="assets/icons.svg#i-${iconName}"></use></svg><h2 class="sheet__title" id="sheet-title">${title}</h2></div>
      <div><p class="label">${t('feedback.answer')}</p><p class="sheet__answer">${r.answerHTML}</p></div>
      ${r.why ? `<div class="sheet__why">${r.why}</div>` : ''}
      <div class="sheet__actions">
        ${r.audio ? `<button type="button" class="icon-button icon-button--outline" data-play="${esc(r.audio)}" aria-label="${t('audio.playAnswer')}">${icon('play')}</button>` : ''}
        <button type="button" class="button button--${state}" data-action="continue">${t('lesson.continue')} ${icon('arrow-right')}</button>
      </div></div>`;
  sheet.classList.add('is-open');
  stage.inert = true;
  actions.inert = true;
  live.textContent = `${title}. ${sheet.querySelector('.sheet__answer').textContent}`;
  sheet.querySelector('[data-action="continue"]').focus();
}

function closeSheet() {
  sheet.classList.remove('is-open');
  stage.inert = false;
  actions.inert = false;
}

function doCheck(skipped = false) {
  if (!skipped && checkBtn.disabled) return;
  const r = skipped ? { result: 'wrong', ...current.reveal() } : current.check();
  results.push(r.result);
  sfx(r.result);
  openSheet(r, skipped);
}

function next() {
  closeSheet();
  index++;
  if (index >= exercises.length) complete();
  else show(index);
}

function complete() {
  const correct = results.filter((r) => r === 'correct').length;
  const almost = results.filter((r) => r === 'almost').length;
  const xp = correct * 10 + almost * 5;
  renderProgress();
  actions.hidden = true;
  stage.innerHTML = `<div class="complete">
      <div class="complete__burst" aria-hidden="true">${'<span></span>'.repeat(12)}</div>
      ${talaSVG('happy', { label: t('mascot.happy'), className: 'tala tala--lg' })}
      <h2 class="complete__title">${t('lesson.complete')}</h2>
      <div class="cluster complete__stats"><span class="stat">${icon('xp')}<span>+${xp} XP</span></span><span class="stat">${icon('check')}<span>${t('lesson.accuracy', { pct: Math.round((100 * (correct + almost)) / results.length) })}</span></span></div>
      <p class="muted">${t('demo.lesson')}</p>
      <div class="cluster complete__actions"><a class="button button-primary" href="learn.html">${t('lesson.continue')}</a><a class="button" href="lesson.html">${t('lesson.again')}</a></div></div>`;
  sfx('complete');
  live.textContent = t('lesson.complete');
  stage.querySelector('.button-primary').focus();
}

function openQuit() {
  if (!quitDialog.open) quitDialog.showModal();
}

checkBtn.addEventListener('click', () => doCheck());
skipBtn.addEventListener('click', () => doCheck(true));
sheet.addEventListener('click', (e) => {
  if (e.target.closest('[data-action="continue"]')) next();
});
$('[data-action="quit"]').addEventListener('click', openQuit);
quitDialog.querySelector('[data-keep]').addEventListener('click', () => quitDialog.close());

document.addEventListener('click', (e) => {
  const b = e.target.closest('[data-play]');
  if (b) play({ text: b.dataset.play, slow: 'slow' in b.dataset });
});

document.addEventListener('keydown', (e) => {
  if (quitDialog.open || e.ctrlKey || e.metaKey || e.altKey) return;
  if (e.key === 'Escape') {
    e.preventDefault();
    openQuit();
    return;
  }
  const onControl = e.target.closest('button, a, select');
  if (e.key === 'Enter') {
    if (onControl) return; // native activation handles focused buttons and links
    e.preventDefault();
    if (sheet.classList.contains('is-open')) next();
    else doCheck();
    return;
  }
  if (e.target.matches('input, textarea')) return;
  if (/^[1-9]$/.test(e.key) && !sheet.classList.contains('is-open')) current?.pickByNumber?.(Number(e.key));
  if (e.key === 'p' || e.key === 'P' || e.key === 's' || e.key === 'S') {
    const scope = sheet.classList.contains('is-open') ? sheet : stage;
    const b = scope.querySelector(e.key.toLowerCase() === 's' ? '[data-play][data-slow]' : '[data-play]:not([data-slow])') ?? scope.querySelector('[data-play]');
    if (b) play({ text: b.dataset.play, slow: e.key.toLowerCase() === 's' });
  }
});

$('[data-lesson-title]').textContent = pick(lesson.title);
show(index, { focus: false });
