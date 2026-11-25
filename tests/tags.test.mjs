import { test } from 'node:test';
import assert from 'node:assert/strict';
import { align, caseOf, resolve, sentencesWithVerb } from '../scripts/lib/tags.mjs';

// A tiny course: the forms and lemmas the rules are tested with.
const lexicon = {
  lemmas: {
    afi_no: { lemma: 'afi', ofl: 'no' },
    sinn_fn: { lemma: 'sinn', ofl: 'fn' },
    einn_to: { lemma: 'einn', ofl: 'to' },
    sig_afn: { lemma: 'sig', ofl: 'afn' },
    sjá_so: { lemma: 'sjá', ofl: 'so' },
    þú_pfn: { lemma: 'þú', ofl: 'pfn' },
    fara_so: { lemma: 'fara', ofl: 'so' },
    til_fs: { lemma: 'til', ofl: 'fs' },
    muna_so: { lemma: 'muna', ofl: 'so' },
    seint_ao: { lemma: 'seint', ofl: 'ao' },
    já_uh: { lemma: 'já', ofl: 'uh' },
    dýr_lo: { lemma: 'dýr', ofl: 'lo' },
    klukka_no: { lemma: 'klukka', ofl: 'no' },
    sjö_to: { lemma: 'sjö', ofl: 'to' },
    þriðji_rt: { lemma: 'þriðji', ofl: 'rt' },
  },
};
const forms = new Map(
  Object.entries({
    afar: ['afi_no'], sinni: ['sinn_fn'], einu: ['einn_to'], einn: ['einn_to'], sér: ['sig_afn', 'sjá_so'], þér: ['þú_pfn'],
    farinn: ['fara_so'], til: ['til_fs'], mun: ['muna_so'], seint: ['seint_ao'], já: ['já_uh'], dýr: ['dýr_lo'],
    klukkan: ['klukka_no'], sjö: ['sjö_to'], þriðju: ['þriðji_rt'],
  }).map(([k, v]) => [k, new Set(v)]),
);
const r = (word, tok) => resolve(word, tok, forms, lexicon);

test('tags: a word that is no course word, or another word with the same spelling, is -1', () => {
  assert.equal(r('hestur', { t: 'hestur', l: 'hestur', c: 'no' }), -1);
  assert.equal(r('afar', { t: 'afar', l: 'afar', c: 'eo' }), -1);
  assert.equal(r('mun', { t: 'mun', l: 'munu', c: 'so' }), -1);
  assert.equal(r('dýr', { t: 'dýr', l: 'dýr', c: 'no' }), -1);
});

test('tags: the parser picks between two course words with the same spelling', () => {
  assert.equal(r('sér', { t: 'sér', l: 'sjá', c: 'so' }), 'sjá_so');
  assert.equal(r('sér', { t: 'sér', l: 'sig', c: 'abfn' }), 'sig_afn');
});

test('tags: conventions that name the same word are accepted', () => {
  // An ordinal is its own class in BÍN (rt) and an adjective to the parser.
  assert.equal(r('þriðju', { t: 'þriðju', l: 'þriðji', c: 'lo' }), 'þriðji_rt');
  // The parser's lemma is itself a DMII Core form of the course word: þér (of þú), farinn (of fara).
  assert.equal(r('þér', { t: 'þér', l: 'þér', c: 'pfn' }), 'þú_pfn');
  assert.equal(r('farinn', { t: 'farinn', l: 'farinn', c: 'lo' }), 'fara_so');
  const withoutForm = new Map([...forms, ['farinn', new Set(['fara_so'])]].filter(([k]) => k !== 'þér'));
  withoutForm.set('þér', new Set(['sjá_so']));
  assert.equal(resolve('þér', { t: 'þér', l: 'þér', c: 'pfn' }, withoutForm, lexicon), -1, 'a lemma that is not a form of the word');
  assert.equal(r('til', { t: 'til', l: 'til', c: 'ao' }), '~til_fs', 'a preposition as a particle is loose');
  assert.equal(r('seint', { t: 'seint', l: 'seinn', c: 'lo' }), 'seint_ao');
  assert.equal(r('já', { t: 'já', l: 'já', c: 'no' }), 'já_uh');
  assert.equal(r('einn', { t: 'einn', l: 'einn', c: 'fn' }), '~einn_to', 'einn as a pronoun (alone) is loose');
});

test('tags: idioms are undetermined, amounts and times keep their words', () => {
  assert.equal(r('einu', { t: 'einu sinni', l: 'einu sinni', c: 'ao' }), null);
  assert.equal(r('sinni', { t: 'einu sinni', l: 'einu sinni', c: 'ao' }), null);
  assert.equal(r('klukkan', { t: 'klukkan sjö', l: 'klukkan sjö', c: 'tími' }), 'klukka_no');
  assert.equal(r('sjö', { t: 'klukkan sjö', l: 'klukkan sjö', c: 'tími' }), 'sjö_to');
});

test('tags: without a parse, a form is decided only when all its meanings are one course word', () => {
  assert.equal(r('afar', { t: 'afar', m: [['afar', 'ao'], ['afi', 'kk']] }), null);
  assert.equal(r('sinni', { t: 'sinni', m: [['sinn', 'fn']] }), 'sinn_fn');
  assert.equal(r('mun', { t: 'mun', m: [['munu', 'so']] }), -1);
  assert.equal(r('sinni', undefined), null);
});

test('tags: parser tokens line up with the app words, also across multiword tokens', () => {
  const t1 = { t: 'Hann', l: 'hann', c: 'pfn' };
  const t2 = { t: 'einu sinni', l: 'einu sinni', c: 'ao' };
  const out = align(['Hann', 'elskaði', 'hana', 'einu', 'sinni'], [t1, { t: 'elskaði' }, { t: 'hana' }, t2, { t: '.' }]);
  assert.equal(out[0], t1);
  assert.equal(out[3], t2);
  assert.equal(out[4], t2);
});

test('tags: the case is the one the parser gives one word in a sentence with a verb', () => {
  const kaffi = { t: 'kaffi', l: 'kaffi', c: 'no', k: 'þf', s: 0 };
  const verb = { t: 'drekka', l: 'drekka', c: 'so', s: 0 };
  assert.equal(caseOf('kaffi', kaffi, verb, sentencesWithVerb([verb, kaffi])), 'ÞF');
  assert.equal(caseOf('kaffi', { ...kaffi, k: undefined }, verb), null, 'no case');
  assert.equal(caseOf('klukkan', { t: 'klukkan sjö', l: 'klukkan sjö', c: 'tími', k: 'nf', s: 0 }), null, 'a token of several words');
  // "Góða nótt. Dreymi þig vel.": the first sentence has no verb, so its case is a guess.
  const nott = { t: 'nótt', l: 'nótt', c: 'no', k: 'nf', s: 0 };
  assert.equal(caseOf('nótt', nott, undefined, sentencesWithVerb([nott, { t: 'Dreymi', l: 'dreyma', c: 'so', s: 1 }])), null);
});

test('tags: a meal after í, eftir or fyrir is never kept as dative', () => {
  const eftir = { t: 'eftir', l: 'eftir', c: 'fs', s: 0 };
  const meal = (k) => ({ t: 'kvöldmat', l: 'kvöldmatur', c: 'no', k, s: 0 });
  assert.equal(caseOf('kvöldmat', meal('þgf'), eftir), null);
  assert.equal(caseOf('kvöldmat', meal('þf'), eftir), 'ÞF');
  assert.equal(caseOf('kvöldmat', meal('þgf'), { t: 'með', l: 'með', c: 'fs', s: 0 }), 'ÞGF');
});
