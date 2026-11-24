import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { dailyTip, firstSentence } from '../js/tips.js';
import { courseModel } from '../js/engine/course-model.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const json = (rel) => JSON.parse(readFileSync(path.join(ROOT, rel), 'utf8'));
const index = json('content/units/index.json');
const course = courseModel({ index, units: index.units.map((f) => json(`content/units/${f}`)), lexicon: json('data/lexicon.json') });

test('tips: a section of the current unit, the same all day, and over a month most of them', () => {
  for (const unit of course.units) {
    const tip = dailyTip(course, unit.id, '2026-11-24');
    assert.equal(tip.unit.id, unit.id, `${unit.id} has a guidebook, so its own tip`);
    assert.equal(tip.section, unit.guide.sections[tip.index]);
    assert.deepEqual(dailyTip(course, unit.id, '2026-11-24'), tip);
    const seen = new Set(Array.from({ length: 30 }, (_, d) => dailyTip(course, unit.id, `2026-12-${d + 1}`).index));
    assert.ok(seen.size >= Math.min(3, unit.guide.sections.length), `${unit.id}: only ${seen.size} different tips in 30 days`);
  }
});

test('tips: the first sentence, not cut inside Icelandic', () => {
  assert.equal(firstSentence('{is:Hvað er klukkan?} asks the time. More here.'), '{is:Hvað er klukkan?} asks the time.');
  assert.equal(firstSentence('Say {is:Það rignir.} for rain. Then more.'), 'Say {is:Það rignir.} for rain.');
  assert.equal(firstSentence('No full stop'), 'No full stop');
  for (const unit of course.units) {
    for (const s of unit.guide.sections) for (const lang of ['en', 'nb']) assert.ok(firstSentence(s.text[lang]).length <= 400, `${unit.id}: a first sentence over 400 characters`);
  }
});
