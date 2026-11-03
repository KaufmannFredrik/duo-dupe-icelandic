import { test } from 'node:test';
import assert from 'node:assert/strict';
import { grade, missingLetters, normalize, words } from '../js/normalize.js';

test('normalize: NFC, case, punctuation and spaces', () => {
  assert.equal(normalize('  Góðan   DAGINN! '), 'góðan daginn');
  assert.equal(normalize('Góðan'), 'góðan'); // combining acute becomes precomposed ó
  assert.equal(normalize('Halló, ég heiti Nancy.'), 'halló ég heiti nancy');
});

test('words: tokens without punctuation', () => {
  assert.deepEqual(words('Halló, ég heiti Nancy.'), ['halló', 'ég', 'heiti', 'nancy']);
});

test('grade: exact match is correct', () => {
  assert.equal(grade('góðan daginn', ['Góðan daginn!']).result, 'correct');
});

test('grade: missing acute accents are almost in lenient mode and wrong in strict mode', () => {
  assert.deepEqual(grade('godan daginn', ['Góðan daginn!']).result, 'almost');
  const lenient = grade('ar', ['ár']);
  assert.equal(lenient.result, 'almost');
  assert.equal(lenient.reason, 'accents');
  assert.equal(grade('ar', ['ár'], { strict: true }).result, 'wrong');
});

test('grade: ASCII stand-ins for special letters are almost in early units', () => {
  const r = grade('gódan daginn', ['Góðan daginn!']);
  assert.equal(r.result, 'almost');
  assert.equal(r.reason, 'letters');
  assert.equal(grade('thetta er hestur', ['Þetta er hestur.']).result, 'almost');
  assert.equal(grade('aefing', ['æfing']).result, 'almost');
  assert.equal(grade('gódan daginn', ['Góðan daginn!'], { early: false }).result, 'wrong');
});

test('grade: stand-ins plus missing accents are wrong in strict mode', () => {
  assert.equal(grade('godan daginn', ['Góðan daginn!'], { strict: true }).result, 'wrong');
  assert.equal(grade('godan daginn', ['Góðan daginn!']).reason, 'letters+accents');
});

test('missingLetters: names the special letters and accents the learner missed', () => {
  assert.deepEqual(missingLetters('Gódan daginn', 'Góðan daginn!'), [['ð', 'd']]);
  assert.deepEqual(missingLetters('godan daginn', 'Góðan daginn!'), [['ó', 'o'], ['ð', 'd']]);
  assert.deepEqual(missingLetters('Góðan daginn', 'Góðan daginn!'), []);
});

test('grade: other words are wrong, empty input is wrong', () => {
  assert.equal(grade('gott kvöld', ['Góðan daginn!']).result, 'wrong');
  assert.equal(grade('   ', ['Góðan daginn!']).result, 'wrong');
});
