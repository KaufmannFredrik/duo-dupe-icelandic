// Which course word each word of a sentence is, from the Greynir parser's analysis.
// Used by scripts/build-tags.mjs; pure, so tests/tags.test.mjs can check the rules.

const low = (s) => s.toLocaleLowerCase('is');
export const words = (text) => [...text.matchAll(/\p{L}+/gu)].map((m) => m[0]);

// Greynir and BÍN word classes, mapped to the DMII Core classes used in content/vocab/core.json.
export const CLASS = { no: 'no', kk: 'no', kvk: 'no', hk: 'no', so: 'so', lo: 'lo', ao: 'ao', eo: 'ao', fs: 'fs', pfn: 'pfn', abfn: 'afn', afn: 'afn', fn: 'fn', st: 'st', stt: 'st', nhm: 'st', to: 'to', töl: 'to', uh: 'uh' };

// A multiword token of these classes is an idiom ("einu sinni" once, "á morgun" tomorrow,
// "undir eins" at once): its words are not taught as the course words they look like.
const IDIOM = new Set(['ao', 'eo', 'fs', 'st', 'stt', 'nhm', 'uh']);
// "til vinstri" (to the left): the parser may read the side as a noun; it is the same word.
const SIDES = new Set(['vinstri', 'hægri']);

/**
 * Lines the parser's tokens up with the app's words. A parser token can cover several words
 * ("einu sinni", "New York"); each of them gets that token's analysis.
 * @returns {(object|undefined)[]} one parser token (or undefined) per word
 */
export function align(appWords, parserTokens) {
  const out = new Array(appWords.length).fill(undefined);
  let i = 0;
  for (const tok of parserTokens) {
    for (const w of words(tok.t ?? '')) {
      let j = i;
      while (j < appWords.length && low(appWords[j]) !== low(w) && j < i + 3) j++;
      if (j < appWords.length && low(appWords[j]) === low(w)) {
        out[j] = tok;
        i = j + 1;
      }
    }
  }
  return out;
}

/**
 * Whether the parser's analysis (lemma l, class c) names the course word `id`. Beyond an exact
 * match, a few differences are conventions, not different words:
 *  - the parser's lemma is itself a DMII Core form of the word (þér for þú, hvað for hver),
 *  - a past participle used as an adjective (farinn, lokaður) belongs to its verb,
 *  - an adverb that is the neuter of an adjective (seint, beint),
 *  - prepositions used as adverbs or particles (til, um, við), and að as a preposition,
 *  - interjections in any class (já, bless), compass directions and sides as nouns (norður, vinstri),
 *  - einn and annar as numeral, pronoun or adjective.
 * Different words with the same spelling stay apart: mun (munu "will", not muna), myndir
 * (mynd), ferð (a trip, not fara), dýr (an animal, not "expensive"), þegar ("already").
 */
export function sameWord(id, word, tok, forms, lexicon) {
  const L = lexicon.lemmas[id];
  const cls = CLASS[tok.c];
  const lemmaIsForm = forms.get(low(tok.l ?? ''))?.has(id) ?? false;
  if (low(tok.l) === low(L.lemma)) {
    if (cls === L.ofl) return true;
    if (L.ofl === 'uh') return true;
    if (L.ofl === 'fs' && (cls === 'ao' || cls === 'st')) return true;
    if (L.lemma === 'að' && (cls === 'fs' || cls === 'ao')) return true;
    if (L.ofl === 'ao' && cls === 'no') return true;
    if (SIDES.has(L.lemma) && cls === 'no') return true;
    const pronounLike = new Set(['fn', 'to', 'lo']);
    return pronounLike.has(L.ofl) && pronounLike.has(cls);
  }
  if (cls === L.ofl && lemmaIsForm) return true;
  if (L.ofl === 'so' && cls === 'lo' && lemmaIsForm) return true;
  if (L.ofl === 'ao' && cls === 'lo' && low(word) === low(L.lemma)) return true;
  return false;
}

/**
 * Which course word `word` is, given the parser's token for it.
 * @param {Map<string, Set<string>>} forms lowercase form -> course lemma ids
 * @returns {string|-1|null} a lemma id, -1 for another word, null when undetermined
 */
export function resolve(word, tok, forms, lexicon) {
  const candidates = [...(forms.get(low(word)) ?? [])];
  if (!candidates.length) return -1;
  if (!tok) return null;
  if ('l' in tok) {
    if (words(tok.t ?? '').length > 1) {
      if (IDIOM.has(tok.c)) return null;
      return candidates.length === 1 ? candidates[0] : null; // "klukkan sjö", "fimm hundruð"
    }
    const exact = candidates.filter((id) => low(lexicon.lemmas[id].lemma) === low(tok.l) && lexicon.lemmas[id].ofl === CLASS[tok.c]);
    if (exact.length) return exact.length === 1 ? exact[0] : null;
    const m = candidates.filter((id) => sameWord(id, word, tok, forms, lexicon));
    return m.length === 1 ? m[0] : m.length ? null : -1;
  }
  // Not parsed: decided only when every BÍN meaning of the form is the same course word.
  const ids = new Set();
  let other = false;
  for (const [stofn, cls] of tok.m ?? []) {
    const m = candidates.filter((id) => sameWord(id, word, { l: stofn, c: cls }, forms, lexicon));
    if (m.length) m.forEach((id) => ids.add(id));
    else other = true;
  }
  if (ids.size === 1 && !other) return [...ids][0];
  if (!ids.size && tok.m?.length) return -1;
  return null;
}
