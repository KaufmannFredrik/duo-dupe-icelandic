// Guided writing (js/engine/writing.js, data/writing.json): gaps graded by what may go in them.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { filledText, gradeSlot, gradeTask, lineParts, sampleAnswers, taskSlots } from '../js/engine/writing.js';
import { loadData } from './helpers/data.mjs';
import { allowedFor } from '../js/engine/course-model.js';

const w = JSON.parse(readFileSync(new URL('../data/writing.json', import.meta.url), 'utf8'));
const content = JSON.parse(readFileSync(new URL('../content/writing.json', import.meta.url), 'utf8'));
const S = w.slots;
const lines = (id) => ({ lines: w.tasks.find((t) => t.id === id).lines.map((l) => l.is) });
const g = (slot, input) => gradeSlot(S[slot], input);

test('writing: a line splits into text and gaps', () => {
  assert.deepEqual(lineParts('Ég er frá {country}.'), [{ text: 'Ég er frá ' }, { slot: 'country' }, { text: '.' }]);
  assert.deepEqual(taskSlots(lines('a1-form')), ['name', 'country', 'where', 'language', 'job']);
});

test('writing: a name is any name, with a capital letter', () => {
  assert.equal(g('name', 'Anna').result, 'correct');
  assert.equal(g('name', 'Jón Jónsson').result, 'correct');
  assert.deepEqual([g('name', 'anna').result, g('name', 'anna').reason, g('name', 'anna').answer], ['almost', 'capital', 'Anna']);
  assert.equal(g('name', '123').reason, 'name');
  assert.equal(g('name', '').result, 'wrong');
});

test('writing: a country after frá is in the dative, and another case is named', () => {
  assert.equal(g('country', 'Noregi').result, 'correct');
  assert.equal(g('country', 'Íslandi').result, 'correct');
  assert.deepEqual([g('country', 'noregi').result, g('country', 'noregi').reason], ['almost', 'capital']);
  assert.deepEqual([g('country', 'Noregur').result, g('country', 'Noregur').reason, g('country', 'Noregur').answer], ['wrong', 'case', 'Noregi']);
  assert.equal(g('country', 'Islandi').result, 'almost', 'a missing accent is almost');
  assert.equal(g('country', 'Norge').reason, 'unknown');
});

test('writing: a town comes with its own preposition', () => {
  assert.equal(g('where', 'í Reykjavík').result, 'correct');
  assert.equal(g('where', 'á Akureyri').result, 'correct');
  assert.deepEqual([g('where', 'í Akureyri').reason, g('where', 'í Akureyri').answer], ['prep', 'á Akureyri']);
  assert.deepEqual([g('where', 'Kópavogi').reason, g('where', 'Kópavogi').answer], ['prep', 'í Kópavogi']);
  assert.deepEqual([g('where', 'í Kópavogur').reason, g('where', 'í Kópavogur').answer], ['case', 'í Kópavogi']);
  assert.deepEqual([g('where', 'í reykjavík').result, g('where', 'í reykjavík').reason], ['almost', 'capital']);
});

test('writing: a language after tala is in the accusative; ill agrees with the writer; a weekday after á', () => {
  assert.equal(g('language', 'íslensku').result, 'correct');
  assert.equal(g('language', 'norsku').result, 'correct');
  assert.deepEqual([g('language', 'íslenska').reason, g('language', 'íslenska').answer], ['case', 'íslensku']);
  assert.equal(g('job', 'kennari').result, 'correct');
  assert.equal(g('job', 'kennara').reason, 'case');
  assert.equal(g('ill', 'veik').result, 'correct');
  assert.equal(g('ill', 'veikur').result, 'correct');
  assert.equal(g('ill', 'veikt').reason, 'form');
  assert.equal(g('day', 'mánudaginn').result, 'correct');
  assert.equal(g('day', 'mánudagur').reason, 'form');
});

test('writing: a task is right when every gap is, almost when none is wrong', () => {
  const task = lines('sick-day');
  assert.equal(gradeTask(task, S, sampleAnswers(task, S)).result, 'correct');
  assert.equal(gradeTask(task, S, ['veik', 'föstudaginn', 'jón']).result, 'almost');
  const wrong = gradeTask(task, S, ['veikt', 'föstudaginn', 'Jón']);
  assert.equal(wrong.result, 'wrong');
  assert.equal(filledText(task, wrong.slots), 'Góðan daginn. Ég er veikur í dag og kem ekki í vinnuna. Ég kem aftur á föstudaginn. Kveðja, Jón');
});

test('writing: data/writing.json has the tasks of content/writing.json, and every gap word is one form', () => {
  assert.deepEqual(w.tasks.map((t) => t.id), content.tasks.map((t) => t.id));
  for (const [id, slot] of Object.entries(S)) {
    if (slot.kind !== 'forms') continue;
    assert.ok(slot.words.length > 0, `${id} has words`);
    for (const x of slot.words) assert.ok(!x.others.includes(x.form), `${id}: ${x.form} is not also another form`);
  }
});

test('writing: a task is in a unit review, and its fixed words are known there', () => {
  const d = loadData();
  for (const task of w.tasks.filter((t) => t.unit)) {
    const unit = d.course.units.find((u) => u.id === task.unit);
    assert.ok(unit, `${task.id}: unit ${task.unit}`);
    const known = allowedFor(d.course, unit.id, unit.lessons.length - 1);
    for (const line of task.lines) {
      for (const p of lineParts(line.is).filter((x) => x.text)) {
        for (const word of p.text.match(/\p{L}+/gu) ?? []) {
          const ids = [...(d.formIndex.get(word.toLocaleLowerCase('is')) ?? [])];
          assert.ok(ids.some((id) => known.has(id)), `${task.id}: "${word}" is a word the learner knows at the ${unit.id} review`);
        }
      }
    }
  }
});
