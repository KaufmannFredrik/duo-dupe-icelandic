// Guided writing (docs/PLAN.md, "New exercise types"): a short model text with gaps the learner
// fills about themselves, graded by what may go in each gap, not by one answer. A gap takes any name,
// or one word of a list in the form the frame needs: after frá a country in the dative (Noregi),
// after tala a language in the accusative (íslensku), and a town with the preposition it takes (í Reykjavík, á Akureyri). The forms come from the DMII Core
// (scripts/build-writing.mjs writes data/writing.json from content/writing.json). Pure functions,
// shared by the exercise (js/exercises/write.js) and the tests.

import { grade, normalize } from '../normalize.js';

const SLOT = /\{([a-z]+)\}/g;

/** A line of a model, split into text and gaps: "Ég heiti {name}." -> [{ text }, { slot: 'name' }, { text }]. */
export function lineParts(line) {
  const out = [];
  let at = 0;
  for (const m of line.matchAll(SLOT)) {
    if (m.index > at) out.push({ text: line.slice(at, m.index) });
    out.push({ slot: m[1] });
    at = m.index + m[0].length;
  }
  if (at < line.length) out.push({ text: line.slice(at) });
  return out;
}

/** The gaps of a task, in order. */
export const taskSlots = (task) => task.lines.flatMap((l) => lineParts(l).filter((p) => p.slot).map((p) => p.slot));

const capital = (w) => w[0].toLocaleUpperCase('is') + w.slice(1);
const NAME_WORD = /^\p{L}[\p{L}'’-]*$/u;

/**
 * Grades what was written in one gap.
 * @param {object} slot data/writing.json slot: { kind: 'name' } or { kind: 'forms', case, proper, words: [{ lemma, form, others }] }
 * @returns {{ result: 'correct'|'almost'|'wrong', answer: string, reason?: string, lemma?: string }}
 *   reason: name (not a name), capital (a name with a small letter), case or form (another form of a
 *   listed word: answer is the one the frame needs), prep (a town with the other preposition, or
 *   none), unknown (no listed word), or a grade() reason (accents, letters)
 */
export function gradeSlot(slot, input, options = {}) {
  const typed = String(input ?? '').trim().replace(/\s+/g, ' ');
  if (slot.kind === 'name') {
    const words = typed.split(' ').filter(Boolean);
    if (!words.length || words.length > 3 || !words.every((w) => NAME_WORD.test(w))) return { result: 'wrong', answer: '', reason: 'name' };
    const fixed = words.map(capital).join(' ');
    return fixed === typed ? { result: 'correct', answer: typed } : { result: 'almost', answer: fixed, reason: 'capital' };
  }
  const g = grade(typed, slot.words.map((w) => w.form), options);
  const word = slot.words.find((w) => w.form === g.answer);
  if (g.result !== 'wrong') {
    // A place name written with a small letter (noregi, í reykjavík) is almost right.
    const small = (a, b) => a.split(' ').some((w, k) => w[0] !== w[0].toLocaleLowerCase('is') && b.split(' ')[k]?.[0] !== w[0]);
    if (slot.proper && g.result === 'correct' && small(g.answer, typed)) return { result: 'almost', answer: g.answer, reason: 'capital', lemma: word.lemma };
    return { ...g, lemma: word.lemma };
  }
  const got = normalize(typed);
  // The place without its preposition, or with the other one (í Akureyri for á Akureyri).
  const bare = (s) => normalize(s).replace(/^(í|á) /, '');
  const place = slot.words.find((w) => w.prep && bare(w.bare) === bare(typed));
  if (place) return { result: 'wrong', answer: place.form, reason: 'prep', lemma: place.lemma };
  const other = slot.words.find((w) => w.others.some((o) => normalize(o) === got || (w.prep && bare(o) === bare(typed))));
  if (other) return { result: 'wrong', answer: other.form, reason: slot.tags ? 'form' : 'case', lemma: other.lemma };
  return { result: 'wrong', answer: slot.words[0].form, reason: 'unknown' };
}

/**
 * Grades a whole task: correct when every gap is, almost when every gap is at least almost.
 * @param {string[]} inputs what was written, one per gap (taskSlots order)
 */
export function gradeTask(task, slots, inputs, options = {}) {
  const graded = taskSlots(task).map((id, i) => ({ id, ...gradeSlot(slots[id], inputs[i], options) }));
  const result = graded.every((g) => g.result === 'correct') ? 'correct' : graded.every((g) => g.result !== 'wrong') ? 'almost' : 'wrong';
  return { result, slots: graded };
}

/** The model text with the learner's gaps filled in (the corrected form where one was wrong). */
export function filledText(task, graded) {
  let i = 0;
  return task.lines.map((l) => lineParts(l).map((p) => (p.text ?? graded[i++].answer)).join('')).join(' ');
}

/** A right answer for every gap (for tests and the smoke run): a sample name, the first word of each list. */
export const sampleAnswers = (task, slots) => taskSlots(task).map((id) => (slots[id].kind === 'name' ? 'Anna' : slots[id].words[0].form));
