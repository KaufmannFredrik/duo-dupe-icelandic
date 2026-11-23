import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CAST, EXPRESSIONS, befriendedBy, characterSrc, friends, hostOf } from '../js/characters.js';
import { courseModel } from '../js/engine/course-model.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const json = (rel) => JSON.parse(readFileSync(path.join(ROOT, rel), 'utf8'));
const index = json('content/units/index.json');
const course = courseModel({ index, units: index.units.map((f) => json(`content/units/${f}`)), lexicon: json('data/lexicon.json') });
const unit = (id) => course.units.find((u) => u.id === id);
const fresh = () => ({ lessons: {}, skippedUnits: [] });
const finish = (p, id) => {
  for (const l of unit(id).lessons.filter((x) => !x.review)) p.lessons[l.key] = { done: true };
  return p;
};

test('characters: every picture the app can ask for exists, animated and still', () => {
  for (const { id } of CAST) {
    for (const expr of EXPRESSIONS) {
      for (const still of [false, true]) assert.ok(existsSync(path.join(ROOT, characterSrc(id, expr, still))), characterSrc(id, expr, still));
    }
  }
});

test('characters: a still copy has no motion; an animated one stops for reduced motion', () => {
  for (const { id } of CAST) {
    const still = readFileSync(path.join(ROOT, characterSrc(id, 'happy', true)), 'utf8');
    const moving = readFileSync(path.join(ROOT, characterSrc(id, 'happy')), 'utf8');
    assert.ok(!/<style|animation/.test(still), `${id} still copy has no animation`);
    assert.match(moving, /prefers-reduced-motion: reduce\)\{\*\{animation:none!important\}\}/, `${id} respects reduced motion`);
  }
});

test('characters: every unit has a host, and every character hosts a unit', () => {
  for (const u of course.units) assert.ok(hostOf(u), `${u.id} has a host`);
  const hosting = new Set(course.units.map((u) => hostOf(u).id));
  for (const { id } of CAST) assert.ok(hosting.has(id), `${id} hosts a unit`);
});

test('characters: finishing the first unit a character hosts makes them a friend', () => {
  assert.equal(friends(course, fresh()).filter((c) => c.friend).length, 0);
  const p = finish(fresh(), 'hello');
  assert.deepEqual(friends(course, p).filter((c) => c.friend).map((c) => c.id), ['lundi']);
  // Torfi hosts cafe and shopping: cafe makes the friend, shopping does not make another.
  assert.equal(befriendedBy(course, unit('cafe'))?.id, 'torfi');
  assert.equal(befriendedBy(course, unit('shopping')), null);
  assert.equal(friends(course, finish(p, 'cafe')).find((c) => c.id === 'torfi').friend, true);
});

test('characters: units skipped by the placement test count as finished', () => {
  const p = { ...fresh(), skippedUnits: ['hello', 'cafe', 'family'] };
  assert.deepEqual(friends(course, p).filter((c) => c.friend).map((c) => c.id).sort(), ['amma', 'lundi', 'torfi']);
});
