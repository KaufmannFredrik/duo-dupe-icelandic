// Reading and listening questions (js/engine/reading.js, content/stories/): a story's questions,
// three at a time, each with its options shuffled.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { QUESTIONS, hasQuestions, readingSpec, storyFor } from '../js/engine/reading.js';
import { loadData } from './helpers/data.mjs';

const json = (rel) => JSON.parse(readFileSync(new URL(`../${rel}`, import.meta.url), 'utf8'));
const stories = json('content/stories/index.json').stories.map((f) => json(`content/stories/${f}`));
const d = loadData();
const sectionOf = (unitId) => d.course.sections.find((s) => s.id === d.course.units.find((u) => u.id === unitId)?.section);

test('reading: every section A2 unit with a story has questions about it', () => {
  const a2 = d.course.units.filter((u) => sectionOf(u.id)?.level === 'A2');
  assert.ok(a2.length > 0);
  for (const u of a2) {
    const story = stories.find((s) => s.after === u.id);
    if (story) assert.ok(hasQuestions(story), `${story.id}: at least ${QUESTIONS} questions`);
  }
  assert.equal(storyFor(stories, 'housing')?.id, 'housing');
  assert.equal(storyFor(stories, 'hello'), null, 'an A1 story has no questions');
});

test('reading: an exercise asks three questions in story order, with the answer among the options', () => {
  const story = storyFor(stories, 'housing');
  const seen = new Set();
  for (let seed = 1; seed <= 40; seed++) {
    const spec = readingSpec(story, { seed, listen: seed % 2 === 0 });
    assert.equal(spec.type, 'reading');
    assert.equal(spec.listen, seed % 2 === 0);
    assert.deepEqual(spec.lines, story.lines.map((l) => l.sentence));
    assert.equal(spec.questions.length, QUESTIONS);
    const lines = spec.questions.map((q) => q.line);
    assert.deepEqual(lines, [...lines].sort((a, b) => a - b), 'in the order of the story');
    for (const q of spec.questions) {
      const source = story.questions.find((x) => x.en === q.q.en);
      assert.ok(source, q.q.en);
      assert.equal(q.options.length, 1 + source.wrong.length);
      assert.deepEqual(q.options[q.answer], source.answer);
      for (const o of q.options) assert.ok(o.en && o.nb);
      seen.add(q.q.en);
    }
    assert.deepEqual(readingSpec(story, { seed, listen: seed % 2 === 0 }), spec, 'the same seed, the same exercise');
  }
  assert.equal(seen.size, story.questions.length, 'every question comes up');
});

test('reading: each line a question rests on is a readable sentence with a translation', () => {
  for (const story of stories.filter(hasQuestions)) {
    for (const q of story.questions) {
      const sid = story.lines[q.line]?.sentence;
      assert.ok(d.sentences[sid], `${story.id}: line ${q.line}`);
      assert.ok(d.sentences[sid].en?.length, `${story.id}: line ${q.line} has an English translation`);
    }
  }
});
