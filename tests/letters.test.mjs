import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { courseWords, isLetterKey, isWeak, itemsOf, letterDrill, letterKey, letterModel, letterReview, spot } from '../js/engine/letters.js';
import { tallyOf } from '../js/stats.js';

const json = (rel) => JSON.parse(readFileSync(new URL(`../${rel}`, import.meta.url), 'utf8'));
const content = json('content/letters.json');
const lexicon = json('data/lexicon.json');
const pairs = json('content/minimal-pairs.json');
const model = letterModel(content, courseWords(lexicon), pairs);
const items = itemsOf(content);
const ipaOf = (word) => Object.values(lexicon.lemmas).find((l) => l.lemma === word)?.ipa?.[0];
const card = (id, box, extra = {}) => ({ key: letterKey(id), box, due: 0, seen: 3, correct: 2, wrong: 1, last: 0, ...extra });

test('every letter and spelling can be practiced in at least two ways', () => {
  for (const item of items) assert.ok(model.typesFor(item.id).length >= 2, `${item.id}: ${model.typesFor(item.id).join(', ')}`);
  for (const l of content.letters) assert.ok(model.typesFor(l.id).includes('lettername'), `${l.id} has no name exercise`);
});

test('a word asks for a spelling only where its pronunciation has that sound', () => {
  const asked = (id, word) => spot(model.byId.get(id), word, ipaOf(word)) !== null;
  // The vowel changes before ng, nk and gi (a in ganga is [au]); ll and nn are not always tl, tn.
  assert.equal(asked('a', 'ganga'), false);
  assert.equal(asked('e', 'enginn'), false);
  assert.equal(asked('u', 'ungur'), false);
  assert.equal(asked('ll', 'halló'), false);
  assert.equal(asked('ll', 'alltaf'), false);
  assert.equal(asked('nn', 'finna'), false);
  assert.equal(asked('é', 'hér'), false, 'h and é run together as [ç]');
  // and the clear cases are asked.
  for (const [id, word] of [['a', 'taka'], ['á', 'já'], ['ó', 'bók'], ['ð', 'maður'], ['þ', 'þú'], ['hv', 'hvar'], ['hj', 'hjól'], ['ll', 'bolli'], ['nn', 'einn'], ['pp', 'takk'], ['au', 'brauð'], ['ei', 'nei'], ['æ', 'bær'], ['ö', 'kjöt'], ['y', 'systir'], ['ý', 'nýr']]) {
    assert.equal(asked(id, word), true, `${id} in ${word}`);
  }
});

test('hear a word: the gap holds the answer, which is offered once beside sounds that differ', () => {
  const SAME_SOUND = [['i', 'y'], ['í', 'ý']];
  for (const item of items) {
    for (let seed = 1; seed <= 20; seed++) {
      const used = new Map([['lettername', 9], ['likenb', 9], ['spell', 9], ['pair', 9]]);
      const spec = model.exerciseFor(item.id, used, () => (seed * 0.0491) % 1);
      if (spec?.type !== 'letter') continue;
      assert.equal(spec.word.slice(spec.at, spec.at + spec.len), spec.answer, `${item.id} in ${spec.word}`);
      assert.equal(spec.options.filter((o) => o === spec.answer).length, 1);
      assert.equal(new Set(spec.options).size, spec.options.length);
      for (const [x, y] of SAME_SOUND) assert.ok(!(spec.options.includes(x) && spec.options.includes(y)), `${spec.options} sound alike`);
      assert.equal(spec.key, letterKey(item.id));
    }
  }
});

test('the other exercise types are about their own item', () => {
  for (const item of items) {
    for (const type of model.typesFor(item.id)) {
      const used = new Map(['letter', 'lettername', 'likenb', 'spell', 'pair'].map((x) => [x, x === type ? 0 : 9]));
      const spec = model.exerciseFor(item.id, used, () => 0.3);
      assert.equal(spec.type, type);
      assert.equal(spec.key, letterKey(item.id));
      if (type === 'lettername') {
        assert.equal(spec.answer, item.id);
        assert.equal(new Set(spec.options).size, 3);
        assert.ok(spec.options.includes(item.id));
        assert.equal(spec.say, item.say ?? item.name);
      }
      if (type === 'likenb') {
        assert.ok(['same', 'other'].includes(spec.answer));
        assert.equal(spec.answer, item.nb);
        assert.ok(spec.word.includes(spec.label), `${spec.label} in ${spec.word}`);
      }
      if (type === 'spell') assert.ok(spec.word.length <= 7);
      if (type === 'pair') assert.ok(spec.words.includes(spec.answer));
    }
  }
});

test('a first round starts with the new letters and the ones that sound different', () => {
  const { specs } = letterDrill(model, { seed: 5, cards: [], now: 0 });
  assert.equal(specs.length, 10);
  const rel = specs.map((s) => model.byId.get(s.item).nb);
  assert.ok(rel.every((r) => r === 'new' || r === 'other'), rel.join(', '));
  assert.ok(new Set(specs.map((s) => s.type)).size >= 3, 'a mix of exercise types');
  for (const s of specs) assert.ok(isLetterKey(s.key));
});

test('due letters come first; weak letters can be practiced alone; one letter can be practiced', () => {
  const now = 1e12;
  const due = letterDrill(model, { seed: 2, cards: [card('m', 2, { due: now - 1 }), card('þ', 3, { due: now + 1e9 })], now });
  assert.equal(due.specs[0].item, 'm');
  assert.ok(!due.specs.some((s) => s.item === 'þ'), 'a letter not due yet waits');

  const weak = letterDrill(model, { seed: 2, cards: [card('ð', 1), card('hv', 1), card('a', 5, { correct: 9, wrong: 0 })], weak: true, now });
  assert.equal(weak.weakOnly, true);
  assert.ok(weak.specs.length >= 6);
  assert.ok(weak.specs.every((s) => s.item === 'ð' || s.item === 'hv'));
  assert.equal(letterDrill(model, { seed: 2, cards: [], weak: true, now }).weakOnly, false, 'no weak letters: a normal round');

  const one = letterDrill(model, { seed: 3, cards: [], focus: 'ó', now });
  assert.equal(one.specs.length, 6);
  assert.ok(one.specs.every((s) => s.item === 'ó'));
  assert.ok(new Set(one.specs.map((s) => s.type)).size >= 3);
});

test('a review has one exercise per due letter card', () => {
  const cards = [card('æ', 2), card('ll', 1), { key: 'hestur_no|meaning', box: 1, due: 0 }];
  const specs = letterReview(model, { cards, seed: 4 });
  assert.deepEqual(specs.map((s) => s.item), ['æ', 'll']);
});

test('isWeak: answered and low, or right less than three times in four', () => {
  assert.equal(isWeak(undefined), false);
  assert.equal(isWeak(card('a', 1)), true);
  assert.equal(isWeak(card('a', 4, { correct: 2, wrong: 2 })), true);
  assert.equal(isWeak(card('a', 4, { correct: 9, wrong: 1 })), false);
});

test('letter answers are not counted as forms right', () => {
  const log = [{ key: 'letter|æ', result: 'correct' }, { key: 'hestur_no|ÞGFET', result: 'correct' }];
  assert.equal(tallyOf(log).formsRight, 1);
});
