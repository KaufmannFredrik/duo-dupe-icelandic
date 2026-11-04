import { test } from 'node:test';
import assert from 'node:assert/strict';
import { INTERVALS, MAX_BOX, RETRY_AFTER, accuracy, cardKey, dueCards, newCard, review, strength } from '../js/srs.js';

const T0 = Date.UTC(2026, 10, 3, 12);
const DAY = 24 * 3600_000;

test('cardKey: meaning by default, or a specific form', () => {
  assert.equal(cardKey('hestur_no'), 'hestur_no|meaning');
  assert.equal(cardKey('hestur_no', 'ÞGFET'), 'hestur_no|ÞGFET');
});

test('review: correct answers climb the boxes and lengthen the interval', () => {
  let c = newCard('k', T0);
  c = review(c, 'correct', T0);
  assert.equal(c.box, 1);
  assert.equal(c.due, T0 + INTERVALS[1]);
  c = review(c, 'correct', c.due);
  assert.equal(c.box, 2);
  assert.equal(c.due - c.last, 2 * DAY);
  assert.equal(c.correct, 2);
  assert.equal(c.seen, 2);
});

test('review: the top box is a ceiling', () => {
  let c = { ...newCard('k', T0), box: MAX_BOX };
  c = review(c, 'correct', T0);
  assert.equal(c.box, MAX_BOX);
});

test('review: a wrong answer drops to box 1 and comes back in ten minutes', () => {
  let c = { ...newCard('k', T0), box: 5 };
  c = review(c, 'wrong', T0);
  assert.equal(c.box, 1);
  assert.equal(c.due, T0 + RETRY_AFTER);
  assert.equal(c.wrong, 1);
});

test('review: almost keeps the box (at least 1) with a shorter interval', () => {
  let c = { ...newCard('k', T0), box: 4 };
  c = review(c, 'almost', T0);
  assert.equal(c.box, 4);
  assert.equal(c.due, T0 + INTERVALS[3]);
  const fresh = review(newCard('n', T0), 'almost', T0);
  assert.equal(fresh.box, 1);
  assert.equal(fresh.due, T0 + INTERVALS[1]);
});

test('dueCards: only due cards, most overdue first', () => {
  const cards = [
    { ...newCard('a', T0), due: T0 - 1000 },
    { ...newCard('b', T0), due: T0 + DAY },
    { ...newCard('c', T0), due: T0 - 5000 },
  ];
  assert.deepEqual(dueCards(cards, T0).map((c) => c.key), ['c', 'a']);
  assert.deepEqual(dueCards(cards, T0, 1).map((c) => c.key), ['c']);
});

test('strength and accuracy', () => {
  assert.equal(strength(undefined), 0);
  assert.equal(strength({ box: MAX_BOX }), 1);
  assert.equal(accuracy({ correct: 3, wrong: 1 }), 0.75);
  assert.equal(accuracy({ correct: 0, wrong: 0 }), null);
});
