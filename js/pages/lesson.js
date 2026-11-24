// The lesson player. Modes (URL ?mode=):
//   (none)      a course lesson: ?unit=hello&lesson=2, or the next open lesson
//   review      due spaced-repetition cards
//   mistakes    replays exercises answered wrong
//   letters     typing drill for words with þ, ð, æ, ö and accents
//   sounds      minimal pairs: hear one word of a pair, pick which it was
//   speak       say short sentences you have met (experimental; Settings turns it on)
//   bridge      see a Norwegian relative, type the Icelandic word
//   placement   adaptive test: one step per unit, stops at the first unit with a miss
// Every answer is recorded per item (word meaning or single form) for spaced repetition.
// Every fifth right answer in a row earns a combo bonus. In a course lesson the unit's host reacts to
// each answer in the feedback sheet (happy, thinking when almost, sorry when wrong, cheering on a
// combo) and appears on the closing screens; elsewhere Tala does.

import { loadJSON, ready } from '../app.js';
import { pick, t } from '../i18n.js';
import { caseRules, getGenerator, gloss, glossLang, lemma, loadAll, paradigm, recordings, sameGloss, sentence, translation } from '../data.js';
import { speechSupport } from '../speech.js';
import { loadBridge } from '../bridge.js';
import { allowedFor, findLesson, loadCourse, nextLesson, unitDone } from '../course.js';
import { cards, completeLesson, dropMistake, loadProgress, mistakes, recordAttempt, skipUnits } from '../progress.js';
import { dueCards } from '../srs.js';
import { getSettings } from '../store.js';
import { buildExercise } from '../exercises/index.js';
import { esc } from '../exercises/common.js';
import { hashSeed, rng, shuffle } from '../engine/rng.js';
import { play } from '../audio.js';
import { keepStorage } from '../offline.js';
import { sfx } from '../sfx.js';
import { icon } from '../shell.js';
import { talaSVG } from '../tala.js';
import { celebrationLines } from '../ui/celebrate.js';
import { befriendedBy, hostOf } from '../characters.js';
import { characterImg } from '../ui/character.js';

await ready;
const $ = (sel, root = document) => root.querySelector(sel);
const stage = $('[data-exercise]');
const main = $('#main');
const progressBar = $('[data-progress]');
const actions = $('.lesson__actions');
const checkBtn = $('[data-action="check"]');
const skipBtn = $('[data-action="skip"]');
const sheet = $('[data-sheet]');
const live = $('[data-live]');
const quitDialog = $('[data-quit-dialog]');
const finePointer = window.matchMedia('(pointer: fine)').matches;

await loadAll();
const course = await loadCourse();
const progress = await loadProgress();
const gen = getGenerator();
const params = new URLSearchParams(location.search);
const mode = params.get('mode') ?? 'lesson';
const position = nextLesson(course, progress);
const learnedSoFar = allowedFor(course, position.unit.id, position.lesson.index);

// --- Plans: what to practice ----------------------------------------------------------------------

function lessonPlan() {
  const found = params.get('unit') ? findLesson(course, params.get('unit'), params.get('lesson') ?? '1') : position;
  const { unit, lesson } = found.lesson ? found : position;
  const times = progress.lessons[lesson.key]?.times ?? 0;
  const allowed = allowedFor(course, unit.id, lesson.index);
  return {
    key: lesson.key,
    unit,
    title: `${pick(unit.title)}: ${lesson.title ? pick(lesson.title) : lesson.review ? t('learn.review') : t('learn.lessonN', { n: lesson.index + 1 })}`,
    specs: gen.lesson({ focus: lesson.focus, allowed, seed: hashSeed(`${lesson.key}#${times}`) }),
  };
}

// Every due card, most overdue first; the generator makes up to twelve exercises from them, each
// on exactly the word or form of its card, and skips a card it cannot make one for.
async function reviewPlan() {
  const due = dueCards(await cards(), Date.now());
  return { key: 'practice/review', title: t('practice.review'), specs: gen.review({ cards: due, allowed: learnedSoFar, seed: Date.now() % 1e9, count: 12 }), empty: t('practice.reviewEmpty') };
}

const data = { lemma, sentence, translation, gloss, sameGloss, paradigm, recordings, caseRules };

// A stored exercise can name a sentence or a word that is gone: a sentence excluded since
// (content/sentence-exclude.json), or an old or imported progress file. Such a mistake cannot be
// shown, so it is dropped instead of breaking the round.
function canShow(spec) {
  try {
    buildExercise(spec, { data, lang: glossLang(), strict: false, seed: 1, finePointer: false, contrasts: {}, changed() {} });
    return true;
  } catch {
    return false;
  }
}

async function mistakesPlan() {
  const all = (await mistakes()).sort((a, b) => b.at - a.at);
  const gone = all.filter((m) => !canShow(m.spec));
  for (const m of gone) await dropMistake(m.key);
  const list = all.filter((m) => !gone.includes(m)).slice(0, 12);
  return { key: 'practice/mistakes', title: t('practice.mistakes'), specs: list.map((m) => m.spec), empty: t('practice.mistakesEmpty') };
}

function lettersPlan() {
  const r = rng(Date.now() % 1e9);
  const ids = shuffle([...learnedSoFar].filter((id) => /[þðæöáéíóúý]/i.test(lemma(id)?.lemma ?? '')), r).slice(0, 10);
  return { key: 'practice/letters', title: t('practice.letters'), specs: ids.map((id) => ({ type: 'typeword', lemma: id, key: `${id}|meaning` })) };
}

async function soundsPlan() {
  const mp = await loadJSON('content/minimal-pairs.json');
  const r = rng(Date.now() % 1e9);
  const specs = shuffle(mp.pairs.flatMap((p) => p.words.map((w) => ({ type: 'pair', words: p.words, answer: w, contrast: p.contrast, key: null }))), r).slice(0, 12);
  return { key: 'practice/sounds', title: t('practice.sounds'), specs, contrasts: mp.contrasts };
}

// Speaking: short sentences made of words the learner has met, shortest first.
async function speakPlan() {
  const title = t('practice.speak');
  if (!getSettings().speaking || (await speechSupport()) === 'none') return { key: 'practice/speak', title, specs: [], empty: t('practice.speakOff') };
  const { pool } = await loadAll();
  const fits = (allowed) => pool.filter((sid) => gen.toks(sid).length >= 2 && gen.toks(sid).length <= 6 && gen.sentenceOk(sid, allowed));
  let ids = fits(learnedSoFar);
  if (ids.length < 6) ids = fits(allowedFor(course, course.units[0].id, course.units[0].lessons.length - 1));
  const picked = shuffle(ids, rng(Date.now() % 1e9)).slice(0, 8);
  return { key: 'practice/speak', title, specs: picked.map((sid) => ({ type: 'speak', sentence: sid, key: null })) };
}

// Norwegian bridge: sourced pairs (shared Old Norse word or shared loan) that the spelling
// patterns explain, words met so far first.
async function bridgePlan() {
  const { pairs } = await loadBridge();
  const sourced = Object.entries(pairs).filter(([, p]) => p.evidence !== 'form' && p.rules?.length);
  const r = rng(Date.now() % 1e9);
  const met = shuffle(sourced.filter(([id]) => learnedSoFar.has(id)), r);
  const rest = shuffle(sourced.filter(([id]) => !learnedSoFar.has(id)), r).sort((a, b) => (lemma(a[0]).freq?.rank ?? 1e9) - (lemma(b[0]).freq?.rank ?? 1e9));
  const picked = [...met, ...rest].slice(0, 10);
  return { key: 'practice/bridge', title: t('title.bridge'), specs: shuffle(picked, r).map(([id, pair]) => ({ type: 'bridge', lemma: id, pair, key: `${id}|meaning` })) };
}

function placementPlan() {
  const steps = gen.placement({ units: course.units, seed: Date.now() % 1e9 });
  return { key: 'placement', title: t('placement.title'), specs: steps.flatMap((s) => s.items.map((item) => ({ ...item, step: s.unit }))), steps, placement: true };
}

const plan =
  mode === 'review' ? await reviewPlan()
  : mode === 'mistakes' ? await mistakesPlan()
  : mode === 'letters' ? lettersPlan()
  : mode === 'sounds' ? await soundsPlan()
  : mode === 'speak' ? await speakPlan()
  : mode === 'bridge' ? await bridgePlan()
  : mode === 'placement' ? placementPlan()
  : lessonPlan();
$('[data-lesson-title]').textContent = plan.title;
const host = hostOf(plan.unit);

// A big picture for the closing screens: the unit's host, or Tala outside the course.
const TALA_FOR = { cheer: 'happy', sorry: 'wrong' };
function closingPicture(expr) {
  if (host) return characterImg(host.id, { expr, size: 220, label: t(`cast.${expr}`, { name: host.name }), className: 'char--lg' });
  return talaSVG(TALA_FOR[expr], { label: t(`mascot.${TALA_FOR[expr]}`), className: 'tala tala--lg' });
}

// A small face in the feedback sheet that reacts to the answer. Decorative: the title says it.
const FACE_FOR = { correct: 'happy', almost: 'thinking', wrong: 'sorry' };
const TALA_FACE = { happy: 'happy', cheer: 'happy', thinking: 'thinking', sorry: 'wrong' };
function sheetFace(expr) {
  if (host) return characterImg(host.id, { expr, size: 48, label: '', className: 'sheet__face' });
  return talaSVG(TALA_FACE[expr], { className: 'tala tala--mini sheet__face' });
}

// --- Player ---------------------------------------------------------------------------------------

const specs = plan.specs;
let index = Math.max(0, Math.min(specs.length - 1, (Number(params.get('step')) || 1) - 1));
let current;
const results = [];
let saving = Promise.resolve(); // the answers being saved, in order

// Combo: every COMBO-th right answer in a row adds COMBO_XP (not in the placement test).
const COMBO = 5;
const COMBO_XP = 5;
let run = 0;
let bonus = 0;
// For the daily quests: the best run, and right answers to listening and typing exercises.
let bestRun = 0;
const counted = { listen: 0, type: 0 };
const LISTENING = new Set(['listen', 'dictation', 'pair']);

// Hearts (Settings, off by default): five per lesson, one lost per wrong answer. Not in placement.
const HEARTS = 5;
let hearts = getSettings().hearts && !plan.placement && specs.length ? HEARTS : null;
const heartsEl = document.createElement('span');
heartsEl.className = 'hearts';
function renderHearts() {
  heartsEl.innerHTML = `${icon('heart')}<span aria-hidden="true">${hearts}</span><span class="visually-hidden">${t('lesson.hearts', { n: hearts })}</span>`;
  heartsEl.dataset.low = String(hearts <= 1);
}
if (hearts !== null) {
  renderHearts();
  $('.lesson__top [data-sound-toggle]').before(heartsEl);
}

const ctxFor = (i) => ({
  data,
  lang: glossLang(),
  strict: getSettings().strict,
  seed: hashSeed(`${plan.key}:${i}`),
  finePointer,
  contrasts: plan.contrasts,
  changed: () => {
    checkBtn.disabled = !current.ready();
  },
});

function renderProgress() {
  progressBar.innerHTML = specs.map((_, n) => `<span class="progress__seg" data-state="${n < index ? 'done' : n === index ? 'current' : 'todo'}"></span>`).join('');
  progressBar.setAttribute('aria-valuemax', String(specs.length));
  progressBar.setAttribute('aria-valuenow', String(index));
  progressBar.setAttribute('aria-valuetext', t('lesson.progress', { n: Math.min(index + 1, specs.length), total: specs.length }));
}

function show(n, { focus = true } = {}) {
  current = buildExercise(specs[n], ctxFor(n));
  stage.dataset.type = specs[n].type;
  stage.innerHTML = current.html;
  current.mount(stage);
  checkBtn.disabled = true;
  actions.hidden = false;
  renderProgress();
  if (focus && !stage.contains(document.activeElement)) main.focus({ preventScroll: true });
}

function credit(sid) {
  const s = sentence(sid);
  return s ? `<p class="credit">${t('credit.sentence', { id: sid, author: esc(s.author ?? t('credit.unknownAuthor')) }).replace(`#${sid}`, `<a href="https://tatoeba.org/en/sentences/show/${sid}" rel="noopener">#${sid}</a>`)}</p>` : '';
}

// combo: the length of the run of right answers when this one completes a combo, else 0.
function openSheet(r, skipped, combo = 0) {
  const state = r.result;
  const title = skipped ? t('feedback.skipped') : t(`feedback.${state}`);
  const comboText = combo ? t('lesson.combo', { n: combo, xp: COMBO_XP }) : '';
  const iconName = state === 'correct' ? 'check' : state === 'almost' ? 'almost' : 'wrong';
  sheet.dataset.state = state;
  const playAttrs = r.audio ? `data-play="${esc(r.audio)}"${r.audioUrl ? ` data-url="${esc(r.audioUrl)}"` : ''}` : '';
  sheet.innerHTML = `<div class="sheet__inner">
      <div class="sheet__head"><svg class="sheet__icon" aria-hidden="true"><use href="assets/icons.svg#i-${iconName}"></use></svg><h2 class="sheet__title" id="sheet-title">${title}</h2>${sheetFace(combo ? 'cheer' : FACE_FOR[state])}</div>
      ${combo ? `<p class="sheet__combo">${icon('xp')}<span>${comboText}</span></p>` : ''}
      <div><p class="label">${t('feedback.answer')}</p><p class="sheet__answer">${r.answerHTML}</p></div>
      ${r.why ? `<div class="sheet__why">${r.why}</div>` : ''}
      ${r.sentence ? credit(r.sentence) : ''}
      <div class="sheet__actions">
        ${r.audio ? `<button type="button" class="icon-button icon-button--outline" ${playAttrs} aria-label="${t('audio.playAnswer')}">${icon('play')}</button>` : ''}
        <button type="button" class="button button--${state}" data-action="continue">${t('lesson.continue')} ${icon('arrow-right')}</button>
      </div></div>`;
  sheet.classList.add('is-open');
  stage.inert = true;
  actions.inert = true;
  live.textContent = `${title}. ${comboText ? `${comboText} ` : ''}${sheet.querySelector('.sheet__answer').textContent}`;
  sheet.querySelector('[data-action="continue"]').focus();
}

function closeSheet() {
  sheet.classList.remove('is-open');
  stage.inert = false;
  actions.inert = false;
}

async function doCheck(skipped = false) {
  if (!skipped && checkBtn.disabled) return;
  const spec = specs[index];
  const r = skipped ? { result: 'wrong', ...current.reveal() } : current.check();
  results.push(r.result);
  sfx(r.result);
  run = r.result === 'correct' ? run + 1 : 0;
  const combo = !plan.placement && run > 0 && run % COMBO === 0 ? run : 0;
  bonus += combo ? COMBO_XP : 0;
  bestRun = Math.max(bestRun, run);
  if (r.result === 'correct' && LISTENING.has(spec.type)) counted.listen++;
  if (r.result === 'correct' && spec.type === 'typeword') counted.type++;
  if (hearts !== null && r.result === 'wrong') {
    hearts--;
    renderHearts();
  }
  openSheet(r, skipped, combo);
  if (plan.placement) return;
  const records = r.records ?? (spec.key ? [{ key: spec.key, result: r.result, meta: spec.meta }] : []);
  // Saved one after another; finishing the lesson waits for them (badges count the saved answers).
  saving = saving.then(async () => {
    for (const rec of records) await recordAttempt({ ...rec, spec: rec.result === 'wrong' ? spec : undefined });
  });
  await saving;
}

// Placement: after each unit's questions, continue only if all were right.
function placementStop() {
  const spec = specs[index - 1];
  const next = specs[index];
  if (!spec || !next || spec.step === next.step) return false;
  const stepResults = specs.map((s, i) => [s, results[i]]).filter(([s, res]) => s.step === spec.step && res !== undefined);
  return stepResults.some(([, res]) => res !== 'correct');
}

function next() {
  closeSheet();
  index++;
  if (hearts === 0) return outOfHearts();
  if (index >= specs.length || (plan.placement && placementStop())) complete();
  else show(index);
}

function burst() {
  return `<div class="complete__burst" aria-hidden="true">${'<span></span>'.repeat(12)}</div>`;
}

async function complete() {
  index = specs.length;
  renderProgress();
  actions.hidden = true;
  if (plan.placement) return completePlacement();
  const events = {
    combo: bestRun,
    ...counted,
    ...(mode === 'lesson' ? { lessons: 1, perfect: results.every((x) => x === 'correct') ? 1 : 0 } : {}),
    ...(mode === 'sounds' ? { sounds: 1 } : {}),
  };
  await saving;
  const done = await completeLesson(plan.key, results, { bonus, events });
  // Progress lives only on this device: ask the browser to keep it (js/offline.js).
  keepStorage();
  const { xp, score } = done;
  const news = celebrationLines(done);
  if (bonus) news.unshift(['xp', t('lesson.comboTotal', { xp: bonus })]);
  const after = await loadProgress();
  // Finishing the first unit a character hosts makes them a friend (listed on the Profile).
  const friend = plan.unit && !unitDone(plan.unit, progress) && unitDone(plan.unit, after) ? befriendedBy(course, plan.unit) : null;
  const nextUp = nextLesson(course, after);
  const nextHref = `lesson.html?unit=${nextUp.unit.id}&lesson=${nextUp.lesson.id}`;
  stage.innerHTML = `<div class="complete">${burst()}
      ${closingPicture('cheer')}
      <h2 class="complete__title">${t('lesson.complete')}</h2>
      <div class="cluster complete__stats"><span class="stat">${icon('xp')}<span>+${xp} XP</span></span><span class="stat">${icon('check')}<span>${t('lesson.accuracy', { pct: Math.round(score * 100) })}</span></span></div>
      ${news.length ? `<ul class="complete__news" role="list">${news.map(([ic, text]) => `<li>${icon(ic)}<span>${esc(text)}</span></li>`).join('')}</ul>` : ''}
      ${friend ? `<p class="complete__friend">${characterImg(friend.id, { size: 56, still: true, label: '' })}<span>${t('friends.new', { name: esc(friend.name) })} <a href="profile.html#friends-title">${t('friends.see')}</a></span></p>` : ''}
      <div class="cluster complete__actions"><a class="button button-primary" href="${mode === 'lesson' ? nextHref : 'practice.html'}">${t('lesson.continue')}</a><a class="button" href="learn.html">${t('nav.learn')}</a></div></div>`;
  sfx('complete');
  live.textContent = t('lesson.complete');
  stage.querySelector('.button-primary').focus();
}

function outOfHearts() {
  actions.hidden = true;
  const again = new URL(location.href);
  again.searchParams.delete('step');
  stage.innerHTML = `<div class="complete">
      ${closingPicture('sorry')}
      <h2 class="complete__title">${t('lesson.noHearts')}</h2>
      <p>${t('lesson.noHeartsText')}</p>
      <div class="cluster complete__actions"><a class="button button-primary" href="${esc(again.href)}">${t('lesson.again')}</a>
        <a class="button" href="lesson.html?mode=mistakes">${t('practice.mistakes')}</a></div></div>`;
  live.textContent = t('lesson.noHearts');
  stage.querySelector('.button-primary').focus();
}

async function completePlacement() {
  // The learner starts at the first unit whose step was not all correct.
  const answered = specs.slice(0, results.length);
  const failed = answered.find((s, i) => results[i] !== 'correct')?.step;
  const startIndex = failed ? course.units.findIndex((u) => u.id === failed) : course.units.length - 1;
  const start = course.units[Math.max(0, startIndex)];
  const skip = course.units.slice(0, Math.max(0, startIndex)).map((u) => u.id);
  stage.innerHTML = `<div class="complete">
      ${talaSVG(skip.length ? 'happy' : 'thinking', { label: t(skip.length ? 'mascot.happy' : 'mascot.thinking'), className: 'tala tala--lg' })}
      <h2 class="complete__title">${t('placement.done')}</h2>
      <p>${t('placement.result', { unit: esc(pick(start.title)), n: start.order })}</p>
      <div class="cluster complete__actions">
        ${skip.length ? `<button type="button" class="button button-primary" data-apply>${t('placement.apply', { n: start.order })}</button>` : ''}
        <a class="button${skip.length ? '' : ' button-primary'}" href="learn.html">${t('placement.fromStart')}</a></div></div>`;
  stage.querySelector('[data-apply]')?.addEventListener('click', async () => {
    await skipUnits(skip, { at: Date.now(), start: start.id });
    location.href = 'learn.html';
  });
  stage.querySelector('.button').focus();
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
  if (b) play({ text: b.dataset.play, url: b.dataset.url, slow: 'slow' in b.dataset });
});

document.addEventListener('keydown', (e) => {
  if (quitDialog.open || e.ctrlKey || e.metaKey || e.altKey) return;
  if (e.key === 'Escape') {
    e.preventDefault();
    openQuit();
    return;
  }
  if (e.key === 'Enter') {
    if (e.target.closest('button, a, select')) return;
    e.preventDefault();
    if (sheet.classList.contains('is-open')) next();
    else if (index < specs.length) doCheck();
    return;
  }
  if (e.target.matches('input, textarea')) return;
  if (/^[1-9]$/.test(e.key) && !sheet.classList.contains('is-open')) current?.pickByNumber?.(Number(e.key));
  const k = e.key.toLowerCase();
  if (k === 'p' || k === 's') {
    const scope = sheet.classList.contains('is-open') ? sheet : stage;
    const b = scope.querySelector(k === 's' ? '[data-play][data-slow]' : '[data-play]:not([data-slow])') ?? scope.querySelector('[data-play]');
    if (b) play({ text: b.dataset.play, url: b.dataset.url, slow: k === 's' });
  }
});

// Test hook for the Playwright smoke test and screenshots (only with ?qa in the URL).
if (params.has('qa')) window.__tolva = { spec: () => specs[index], index: () => index, lemma, sentence, paradigm };

if (!specs.length) {
  actions.hidden = true;
  stage.innerHTML = `<div class="complete">${talaSVG('sleepy', { label: t('mascot.sleepy'), className: 'tala tala--lg' })}
    <h2 class="complete__title">${t('practice.nothing')}</h2><p>${esc(plan.empty ?? '')}</p>
    <a class="button button-primary" href="learn.html">${t('nav.learn')}</a></div>`;
  progressBar.innerHTML = '';
} else {
  show(index, { focus: false });
}
