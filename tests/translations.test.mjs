import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { applyHandNb, wiktionaryNb } from '../scripts/lib/translations.mjs';

const json = (rel) => JSON.parse(readFileSync(new URL(`../${rel}`, import.meta.url), 'utf8'));

test('hand Bokmål: a gloss fills a gap, a fix replaces Wiktionary and keeps its list', () => {
  const records = { a: { nb: [] }, b: { nb: ['bli', 'være'] }, c: { nb: ['hus'] } };
  const added = applyHandNb(records, { a: ['takk'], b: ['feil'] }, { b: { nb: ['være'] } });
  assert.equal(added, 2);
  assert.deepEqual(records.a, { nb: ['takk'], nbBy: 'tolva' });
  assert.deepEqual(records.b, { nb: ['være'], nbWas: ['bli', 'være'], nbBy: 'tolva' });
  assert.deepEqual(records.c, { nb: ['hus'] }, 'a gloss never replaces a Wiktionary one');
  assert.deepEqual(wiktionaryNb(records.b), ['bli', 'være']);
  assert.deepEqual(wiktionaryNb(records.a), []);
  assert.deepEqual(wiktionaryNb(records.c), ['hus']);
});

test('hand Bokmål: applying again changes nothing, and a removed fix brings Wiktionary back', () => {
  const records = { b: { nb: ['bli', 'være'] }, a: { nb: [] } };
  applyHandNb(records, { a: ['takk'] }, { b: { nb: ['være'] } });
  const once = structuredClone(records);
  applyHandNb(records, { a: ['takk'] }, { b: { nb: ['være'] } });
  assert.deepEqual(records, once);
  applyHandNb(records, {}, {});
  assert.deepEqual(records, { b: { nb: ['bli', 'være'] }, a: { nb: [] } });
});

test('Bokmål glosses: the corrections are in the data', () => {
  const { lemmas } = json('data/lexicon.json');
  const first = (id) => lemmas[id].nb[0];
  // The first gloss is what exercises show (content/glosses-nb.json "fixes", content/CLAIMS.md).
  assert.equal(first('vera_so'), 'være');
  assert.equal(first('rauður_lo'), 'rød');
  assert.equal(first('úti_ao'), 'ute');
  assert.equal(first('heima_ao'), 'hjemme');
  assert.equal(first('heim_ao'), 'hjem');
  assert.equal(first('þessi_fn'), 'denne');
  assert.notEqual(first('vinur_no'), first('vinkona_no'));
  // Every gloss of several words is a listed Bokmål expression.
  const { phrases } = json('content/glosses-nb.json');
  for (const [id, l] of Object.entries(lemmas)) for (const g of l.nb) if (/\s/.test(g)) assert.ok(phrases.includes(g), `${id}: "${g}"`);
});
