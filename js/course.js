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

export { lessonStates, allowedFor, findLesson, unitOf, nextLesson } from './engine/course-model.js';
