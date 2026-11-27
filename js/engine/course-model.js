// Course structure as pure functions, shared by the browser (js/course.js) and Node tests.
//
// The path runs through sections (content/units/index.json "sections": A1, A2, then a bonus), each
// a list of unit ids in order; a unit's number is its place in the path (a bonus unit has none).
// A finished unit is recorded in progress (p.units), so a unit that later gets a new lesson, or a
// unit moved or inserted in the path, never locks a learner out of what they had opened.

const LESSON_SIZE = 6;

function autoLessons(lemmas) {
  const chunks = [];
  for (let i = 0; i < lemmas.length; i += LESSON_SIZE) chunks.push(lemmas.slice(i, i + LESSON_SIZE));
  if (chunks.length > 1 && chunks.at(-1).length < 3) chunks.at(-2).push(...chunks.pop());
  return [...chunks.map((focus, i) => ({ id: String(i + 1), title: null, focus })), { id: 'review', title: null, review: true }];
}

/**
 * Builds the course from content/units/index.json, the unit files and data/lexicon.json. Without
 * "sections" in the index (older data), the units form one section in their "order".
 * @returns {{ units: object[], sections: object[], always: string[] }} units in path order, each with
 *   section (id), number (1, 2, ... or null for a bonus unit); sections with their units
 */
export function courseModel({ index, units, lexicon }) {
  const byId = new Map(units.map((u) => [u.id, u]));
  const sectionList = index.sections ?? [{ id: 'all', level: null, units: units.toSorted((a, b) => a.order - b.order).map((u) => u.id) }];
  let number = 0;
  const sections = sectionList.map((s) => {
    const list = s.units.map((id) => {
      const u = byId.get(id);
      if (!u) throw new Error(`content/units/index.json: section ${s.id} names unknown unit ${id}`);
      // A section check (u.check, the A1 check) has no words of its own: its one lesson draws
      // tasks from the section's goals (js/engine/check.js).
      const theme = u.theme ? lexicon.themes.find((t) => t.id === u.theme) : null;
      const lemmas = theme?.lemmas ?? [];
      const lessons = (u.lessons === 'auto' ? autoLessons(lemmas) : u.lessons).map((l, i) => ({
        ...l,
        key: `${u.id}/${l.id}`,
        index: i,
        focus: l.review ? lemmas : l.focus ?? [],
      }));
      return { ...u, lemmas, lessons, auto: u.lessons === 'auto', section: s.id, number: s.bonus ? null : ++number };
    });
    return { ...s, units: list };
  });
  const sorted = sections.flatMap((s) => s.units);
  const always = (index.alwaysAllowed ?? []).flatMap((t) => lexicon.themes.find((x) => x.id === t)?.lemmas ?? []);
  return { units: sorted, sections, always };
}

export const unitOf = (course, unitId) => course.units.find((u) => u.id === unitId);

export function findLesson(course, unitId, lessonId) {
  const unit = unitOf(course, unitId);
  return unit ? { unit, lesson: unit.lessons.find((l) => l.id === lessonId) ?? null } : { unit: null, lesson: null };
}

/** Words the learner may meet in a lesson: earlier units, this unit up to this lesson, and the always-allowed words. */
export function allowedFor(course, unitId, lessonIndex) {
  const set = new Set(course.always);
  for (const u of course.units) {
    if (u.id === unitId) {
      for (const l of u.lessons.slice(0, lessonIndex + 1)) for (const id of l.focus ?? []) set.add(id);
      break;
    }
    for (const id of u.lemmas) set.add(id);
  }
  return set;
}

const regularDone = (unit, progress) => unit.lessons.filter((l) => !l.review).every((l) => progress.lessons?.[l.key]?.done);

/**
 * A unit is finished when its lessons (not the review) are done, when it was recorded as finished
 * (p.units, before lessons were added to it), or when the placement test skipped it.
 */
export function unitDone(unit, progress) {
  if (progress.skippedUnits?.includes(unit.id)) return true;
  return Boolean(progress.units?.[unit.id]) || regularDone(unit, progress);
}

/** Units whose lessons are all done but that are not recorded as finished yet: their ids. */
export const unitsToRecord = (course, progress) => course.units.filter((u) => !progress.units?.[u.id] && regularDone(u, progress)).map((u) => u.id);

/**
 * Lesson states for the Learn path. A unit opens when every unit before it is finished or skipped
 * (placement test). Inside an open unit, done lessons are "done", the first open lesson is
 * "current", the review is "review" once the other lessons are done, and the rest are "locked".
 * In a unit recorded as finished, a lesson added since is "new": open, but not where Start goes.
 * A unit recorded as finished stays open even when a unit inserted before it is not (the A1 check
 * before the bonus unit), so a new unit in the path never locks a learner out.
 * @returns {Map<string, 'done'|'current'|'review'|'new'|'locked'>} keyed by lesson key
 */
export function lessonStates(course, progress) {
  const states = new Map();
  let open = true;
  let currentSet = false;
  for (const unit of course.units) {
    const skipped = progress.skippedUnits?.includes(unit.id);
    const finished = unitDone(unit, progress);
    const recorded = Boolean(progress.units?.[unit.id]);
    for (const l of unit.lessons) {
      let state;
      if (skipped) state = 'done';
      else if (!open && !recorded) state = 'locked';
      else if (progress.lessons[l.key]?.done) state = l.review ? 'review' : 'done';
      else if (l.review) state = finished ? 'review' : 'locked';
      else if (finished) state = 'new';
      else if (!currentSet) {
        state = 'current';
        currentSet = true;
      } else state = 'locked';
      states.set(l.key, state);
    }
    open = open && finished;
  }
  return states;
}

/** Course words learned (in one section, or all): the words of done lessons and every word of a skipped unit. */
export function wordsLearned(course, progress, sectionId = null) {
  const out = new Set();
  for (const u of course.units) {
    if (sectionId && u.section !== sectionId) continue;
    if (progress.skippedUnits?.includes(u.id)) {
      for (const id of u.lemmas) out.add(id);
      continue;
    }
    for (const l of u.lessons) if (!l.review && progress.lessons?.[l.key]?.done) for (const id of l.focus ?? []) out.add(id);
  }
  return out;
}

/**
 * A goal of content/goals.json: "practiced" when every unit that trains it is finished, "open"
 * while some are not, "coming" when no unit of the course trains it yet.
 */
export function goalState(goal, course, progress) {
  const units = goal.units.map((id) => unitOf(course, id)).filter(Boolean);
  if (!units.length) return 'coming';
  return units.every((u) => unitDone(u, progress)) ? 'practiced' : 'open';
}

/** The lesson to start when the learner just presses Start. */
export function nextLesson(course, progress) {
  const states = lessonStates(course, progress);
  for (const unit of course.units) for (const l of unit.lessons) if (states.get(l.key) === 'current') return { unit, lesson: l };
  const unit = course.units.at(-1);
  return { unit, lesson: unit.lessons.at(-1) };
}
