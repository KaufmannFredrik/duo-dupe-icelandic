// Reading and listening questions (section A2; docs/PLAN.md, "New exercise types"): a story of
// content/stories/ with questions about it in English and Norwegian. A story's questions are
// { line, en, nb, answer: { en, nb }, wrong: [{ en, nb }, ...] }, each answered by one line. Pure
// functions, shared by the lesson page, the stories page's link and the tests.

import { rng, shuffle } from './rng.js';

/** How many of a story's questions one exercise asks. */
export const QUESTIONS = 3;

/** Whether a story has questions to ask. */
export const hasQuestions = (story) => (story?.questions?.length ?? 0) >= QUESTIONS;

/**
 * The exercise for a story: QUESTIONS of its questions (in the order of the lines that answer
 * them), each with its options shuffled. The spec carries the text and the questions, so a stored
 * exercise needs no story file. listen: the story is heard, and its text shown after the answers.
 */
export function readingSpec(story, { seed, listen = false }) {
  const r = rng(seed);
  const asked = shuffle(story.questions.map((q, i) => i), r).slice(0, QUESTIONS).sort((a, b) => a - b);
  return {
    type: 'reading',
    story: story.id,
    title: story.title,
    narrator: story.narrator ?? null,
    listen,
    lines: story.lines.map((l) => l.sentence),
    questions: asked.map((i) => {
      const q = story.questions[i];
      const options = shuffle([q.answer, ...q.wrong], r);
      return { line: q.line, q: { en: q.en, nb: q.nb }, options, answer: options.indexOf(q.answer) };
    }),
    key: null,
  };
}

/** The story an A2 unit's review ends with: the one read after the unit, if it has questions. */
export const storyFor = (stories, unitId) => stories.find((s) => s.after === unitId && hasQuestions(s)) ?? null;
