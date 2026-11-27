// Which course word each word of a sentence is, from the Greynir parser's analysis.
// Used by scripts/build-tags.mjs; pure, so tests/tags.test.mjs can check the rules.

const low = (s) => s.toLocaleLowerCase('is');
export const words = (text) => [...text.matchAll(/\p{L}+/gu)].map((m) => m[0]);

// Greynir and BÍN word classes, mapped to the DMII Core classes used in content/vocab/core.json.
export const CLASS = { no: 'no', kk: 'no', kvk: 'no', hk: 'no', so: 'so', lo: 'lo', ao: 'ao', eo: 'ao', fs: 'fs', pfn: 'pfn', abfn: 'afn', afn: 'afn', fn: 'fn', st: 'st', stt: 'st', nhm: 'st', to: 'to', töl: 'to', rt: 'rt', uh: 'uh' };

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
 *  - interjections in any class (já, bless), compass directions and sides as nouns (norður, vinstri),
 *  - ordinals, which BÍN classes on their own (rt) and the parser as adjectives (þriðji),
 *  - a plural-only course noun the parser names by a singular lemma that BÍN also lists with the
 *    same plural forms (PLURAL_ONLY: tónleikarnir is tónleikar, "a concert", to the course and
 *    the plural of tónleikur to the parser),
 *  - an adverb form the parser reads as an adjective's (ADVERB_OF: vinsamlegast, "please").
 * Others are the same word used in another way, and are "loose": prepositions as adverbs or
 * particles ("Við erum öll til", we are all ready; "búa til", to make), að as a preposition, and
 * einn or annar as pronoun or adjective ("Hann býr einn", he lives alone). A loose word counts as
 * known to the learner, but its sentence is not used to teach that word.
 * Different words with the same spelling stay apart: mun (munu "will", not muna), myndir
 * (mynd), ferð (a trip, not fara), dýr (an animal, not "expensive"), þegar ("already").
 */
// The parser's singular lemma -> the plural-only course noun with the same plural forms (BÍN).
const PLURAL_ONLY = new Map([['tónleikur', 'tónleikar']]);
// The parser's adjective -> the course adverb whose form it reads as the adjective's: vinsamlegast
// ("please") is the superlative of the adverb vinsamlega in BÍN, and the parser reads it as the
// neuter superlative of vinsamlegur.
const ADVERB_OF = new Map([['vinsamlegur', 'vinsamlega']]);

/** @returns {boolean|'loose'} */
export function sameWord(id, word, tok, forms, lexicon) {
  const L = lexicon.lemmas[id];
  const cls = CLASS[tok.c];
  if (cls === 'no' && L.ofl === 'no' && PLURAL_ONLY.get(low(tok.l ?? '')) === low(L.lemma) && forms.get(low(word))?.has(id)) return true;
  if (cls === 'lo' && L.ofl === 'ao' && ADVERB_OF.get(low(tok.l ?? '')) === low(L.lemma) && forms.get(low(word))?.has(id)) return true;
  const lemmaIsForm = forms.get(low(tok.l ?? ''))?.has(id) ?? false;
  if (low(tok.l) === low(L.lemma)) {
    if (cls === L.ofl) return true;
    if (L.ofl === 'uh') return true;
    if (L.ofl === 'rt' && cls === 'lo') return true; // Greynir reads an ordinal as an adjective
    if (L.ofl === 'fs' && (cls === 'ao' || cls === 'st')) return 'loose';
    if (L.lemma === 'að' && (cls === 'fs' || cls === 'ao')) return 'loose';
    if (L.ofl === 'ao' && cls === 'no') return true;
    if (SIDES.has(L.lemma) && cls === 'no') return true;
    const pronounLike = new Set(['fn', 'to', 'lo']);
    return pronounLike.has(L.ofl) && pronounLike.has(cls) ? 'loose' : false;
  }
  if (cls === L.ofl && lemmaIsForm) return true;
  if (L.ofl === 'so' && cls === 'lo' && lemmaIsForm) return true;
  if (L.ofl === 'ao' && cls === 'lo' && low(word) === low(L.lemma)) return true;
  return false;
}

// The parser's case names (tag-icelandic.py "k") as DMII Core case tags, and the one-letter codes
// data/tags.json stores them as: nominative, accusative, dative, genitive.
const PARSER_CASE = { nf: 'NF', þf: 'ÞF', þgf: 'ÞGF', ef: 'EF' };
export const CASE_CODE = { NF: 'n', ÞF: 'a', ÞGF: 'd', EF: 'g' };

// Greynir reads an indefinite meal right after í, eftir or fyrir as dative ("fisk í kvöldmat",
// "eftir kvöldmat"). Wherever the form shows the case, Tatoeba has the accusative there (eftir
// matinn, fyrir kvöldmatinn, fyrir morgunmatinn: 14 sentences, no dative), so that reading is not kept.
const MEALS = new Set(['matur', 'morgunmatur', 'hádegismatur', 'kvöldmatur']);
const MEAL_PREPOSITIONS = new Set(['í', 'eftir', 'fyrir']);

/** The sentences ("s" numbers) of a parsed text that have a verb. */
export const sentencesWithVerb = (tokens) => new Set(tokens.filter((t) => t.c === 'so').map((t) => t.s));

/**
 * The case the parser gives `word` in its sentence (NF, ÞF, ÞGF or EF), or null: when the
 * sentence was not parsed, the word has no case, its token covers several words ("klukkan sjö",
 * an idiom), whose case says nothing about this word, or the reading is a known parser error.
 * A sentence without a verb ("Góða nótt.", "Bjór, takk.") takes its case from a verb left out,
 * so the parser's nominative there is a guess and is not kept.
 * @param {object} [prev] the parser token of the word before
 * @param {Set<number>} [withVerb] sentencesWithVerb() of the text
 */
export function caseOf(word, tok, prev, withVerb) {
  if (!tok?.k || words(tok.t ?? '').length !== 1 || low(tok.t) !== low(word)) return null;
  if (withVerb && !withVerb.has(tok.s)) return null;
  if (tok.k === 'þgf' && MEALS.has(tok.l) && prev?.c === 'fs' && MEAL_PREPOSITIONS.has(low(prev.l ?? ''))) return null;
  return PARSER_CASE[tok.k] ?? null;
}

/**
 * Which course word `word` is, given the parser's token for it.
 * @param {Map<string, Set<string>>} forms lowercase form -> course lemma ids
 * @returns {string|-1|null} a lemma id ("~" + id when loose), -1 for another word, null when undetermined
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
    const m = candidates.map((id) => [id, sameWord(id, word, tok, forms, lexicon)]).filter(([, s]) => s);
    if (m.length !== 1) return m.length ? null : -1;
    return m[0][1] === 'loose' ? `~${m[0][0]}` : m[0][0];
  }
  // Not parsed: decided only when every BÍN meaning of the form is the same course word.
  const ids = new Set();
  let other = false;
  for (const [stofn, cls] of tok.m ?? []) {
    const m = candidates.filter((id) => sameWord(id, word, { l: stofn, c: cls }, forms, lexicon) === true);
    if (m.length) m.forEach((id) => ids.add(id));
    else other = true;
  }
  if (ids.size === 1 && !other) return [...ids][0];
  if (!ids.size && tok.m?.length) return -1;
  return null;
}
