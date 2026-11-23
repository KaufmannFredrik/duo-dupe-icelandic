// Course structure as pure functions, shared by the browser (js/course.js) and Node tests.

const LESSON_SIZE = 6;

function autoLessons(lemmas) {
  const chunks = [];
  for (let i = 0; i < lemmas.length; i += LESSON_SIZE) chunks.push(lemmas.slice(i, i + LESSON_SIZE));
  if (chunks.length > 1 && chunks.at(-1).length < 3) chunks.at(-2).push(...chunks.pop());
  return [...chunks.map((focus, i) => ({ id: String(i + 1), title: null, focus })), { id: 'review', title: null, review: true }];
}

/** Builds the course from content/units/index.json, the unit files and data/lexicon.json. */
export function courseModel({ index, units, lexicon }) {
  const sorted = units.toSorted((a, b) => a.order - b.order).map((u) => {
    const theme = lexicon.themes.find((t) => t.id === u.theme);
    const lessons = (u.lessons === 'auto' ? autoLessons(theme.lemmas) : u.lessons).map((l, i) => ({
      ...l,
      key: `${u.id}/${l.id}`,
      index: i,
      focus: l.review ? theme.lemmas : l.focus,
    }));
    return { ...u, lemmas: theme.lemmas, lessons, auto: u.lessons === 'auto' };
  });
  const always = (index.alwaysAllowed ?? []).flatMap((t) => lexicon.themes.find((x) => x.id === t)?.lemmas ?? []);
  return { units: sorted, always };
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

/**
 * Lesson states for the Learn path. A unit opens when the previous one is finished or skipped
 * (placement test). Inside an open unit, done lessons are "done", the first open lesson is
 * "current", the review is "review" once the other lessons are done, and the rest are "locked".
 * @returns {Map<string, 'done'|'current'|'review'|'locked'>} keyed by lesson key
 */
export function lessonStates(course, progress) {
  const states = new Map();
  let open = true;
  let currentSet = false;
  for (const unit of course.units) {
    const skipped = progress.skippedUnits?.includes(unit.id);
    const regular = unit.lessons.filter((l) => !l.review);
    const allDone = regular.every((l) => progress.lessons[l.key]?.done);
    for (const l of unit.lessons) {
      let state;
      if (skipped) state = 'done';
      else if (!open) state = 'locked';
      else if (progress.lessons[l.key]?.done) state = l.review ? 'review' : 'done';
      else if (l.review) state = allDone ? 'review' : 'locked';
      else if (!currentSet) {
        state = 'current';
        currentSet = true;
      } else state = 'locked';
      states.set(l.key, state);
    }
    open = open && (skipped || allDone);
  }
  return states;
}

/** A unit is finished when its lessons (not the review) are done, or the placement test skipped it. */
export function unitDone(unit, progress) {
  if (progress.skippedUnits?.includes(unit.id)) return true;
  return unit.lessons.filter((l) => !l.review).every((l) => progress.lessons[l.key]?.done);
}

/** The lesson to start when the learner just presses Start. */
export function nextLesson(course, progress) {
  const states = lessonStates(course, progress);
  for (const unit of course.units) for (const l of unit.lessons) if (states.get(l.key) === 'current') return { unit, lesson: l };
  const unit = course.units.at(-1);
  return { unit, lesson: unit.lessons.at(-1) };
}
