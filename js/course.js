// The course: units from content/units/, lesson focus words, the words a learner may meet at
// each point, and lesson states (done, current, review, locked) from progress.

import { loadJSON } from './app.js';
import { loadLexicon } from './data.js';
import { courseModel } from './engine/course-model.js';

let course;

export async function loadCourse() {
  if (course) return course;
  const [index, lexicon] = await Promise.all([loadJSON('content/units/index.json'), loadLexicon()]);
  const units = await Promise.all(index.units.map((f) => loadJSON(`content/units/${f}`)));
  course = courseModel({ index, units, lexicon });
  return course;
}

export { lessonStates, allowedFor, findLesson, unitOf, nextLesson, unitDone, unitsToRecord, wordsLearned, goalState } from './engine/course-model.js';

let goals;
/** content/goals.json: the goals of each section of the path, and its size in words. */
export async function loadGoals() {
  goals ??= await loadJSON('content/goals.json');
  return goals;
}
/**
 * The label of a unit: "Unit 4" or "Bonus unit" (a bonus unit has no number); inline: for the
 * middle of a sentence ("unit 4", "the bonus unit").
 */
export const unitLabel = (unit, t, { inline = false } = {}) =>
  unit.number ? t(inline ? 'learn.unitInline' : 'learn.unit', { n: unit.number }) : t(inline ? 'learn.bonusUnitInline' : 'learn.bonusUnit');
