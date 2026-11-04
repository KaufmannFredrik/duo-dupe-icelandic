import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { RULES, explain } from '../js/bridge-rules.js';

test('explain: the smallest set of rules, in rule order', () => {
  assert.deepEqual(explain('hestur', 'hest'), ['ending-ur']);
  assert.deepEqual(explain('bók', 'bok'), ['o-acute']);
  assert.deepEqual(explain('þak', 'tak'), ['thorn']);
  assert.deepEqual(explain('koma', 'komme'), ['ending-a', 'double']);
  assert.deepEqual(explain('bátur', 'båt'), ['a-acute', 'ending-ur']);
  assert.deepEqual(explain('draumur', 'drøm'), ['au', 'ending-ur']);
  assert.deepEqual(explain('nei', 'nei'), []);
});

test('explain: null when no combination of rules gets there', () => {
  assert.equal(explain('vatn', 'vann'), null);
  assert.equal(explain('hundur', 'katt'), null);
});

test('every rule has an id and changes something', () => {
  const ids = RULES.map((r) => r.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const r of RULES) assert.ok(r.from instanceof RegExp && typeof r.to === 'string', r.id);
});

test('data/bridge.json: every pair belongs to a course word and has its evidence', async () => {
  const lexicon = JSON.parse(await readFile(new URL('../data/lexicon.json', import.meta.url), 'utf8'));
  const bridge = JSON.parse(await readFile(new URL('../data/bridge.json', import.meta.url), 'utf8'));
  const ruleIds = new Set(RULES.map((r) => r.id));
  for (const [id, p] of Object.entries(bridge.pairs)) {
    assert.ok(lexicon.lemmas[id], `${id} is not a course word`);
    assert.ok(typeof p.nb === 'string' && p.nb.length > 0, id);
    assert.ok(['old-norse', 'loan', 'form'].includes(p.evidence), id);
    if (p.evidence === 'old-norse') assert.ok(p.oldNorse && Number.isInteger(p.article), id);
    if (p.evidence === 'loan') assert.ok(p.loan?.language && p.loan?.word, id);
    if (p.rules) for (const r of p.rules) assert.ok(ruleIds.has(r), `${id}: unknown rule ${r}`);
  }
});
