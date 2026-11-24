// Letters and sounds (content/letters.json): the drill. Pure functions, so the tests run them in
// Node. Every exercise trains one item, a letter or a combination (hv, ll, pp/tt/kk...), and counts
// for its spaced-repetition card "letter|<id>" (js/srs.js), so weak letters come back in reviews.
//   letter      hear a course word, pick the spelling missing from it (ó or o, hv or v)
//   lettername  hear a letter's name, pick the letter
//   likenb      in a word, does this letter sound as in Norwegian?
//   spell       hear a short course word (its meaning shown), write it
//   pair        a minimal pair (content/minimal-pairs.json): long or short, pp/tt/kk, ll
// A word is used for a sound only when its pronunciation in the lexicon (Wiktionary's IPA) has
// that sound where the spelling has it: a in ganga is said [au], so ganga never asks "a or á?".

import { rng, shuffle } from './rng.js';

const PREFIX = 'letter|';
export const letterKey = (id) => `${PREFIX}${id}`;
export const isLetterKey = (key) => typeof key === 'string' && key.startsWith(PREFIX);
export const letterOf = (key) => key.slice(PREFIX.length);

/** The letters, then the combinations. */
export const itemsOf = (content) => [...content.letters, ...content.combos];

/** The course words for letterModel(): known = words the learner has met. */
export const courseWords = (lexicon, known = new Set()) =>
  Object.entries(lexicon.lemmas).map(([id, l]) => ({ id, word: l.lemma, ipa: l.ipa?.[0], known: known.has(id) }));

// Which item each minimal-pair contrast trains.
export const CONTRAST_ITEM = { length: 'length', preaspiration: 'pp', ll: 'll' };

const VOWEL_LETTERS = 'aáeéiíoóuúyýæö';
const IPA_VOWELS = 'aeiouyɪʏɛɔœøæɑ';
const isVowel = (c) => VOWEL_LETTERS.includes(c);

// The sound of the first (stressed) vowel each spelling should have in the IPA.
const NUCLEUS = { a: ['a'], á: ['au'], e: ['ɛ'], é: ['ɛ'], i: ['ɪ'], í: ['i'], o: ['ɔ'], ó: ['ou'], u: ['ʏ'], ú: ['u'], y: ['ɪ'], ý: ['i'], æ: ['ai'], ö: ['œ'], au: ['œi', 'œy'], ei: ['ei'], ey: ['ei'] };

/** The first pronunciation without brackets, stress marks and length marks: "[ˈpouːk]" -> "pouk". */
export const plainIpa = (ipa) => String(ipa ?? '').split(/\]\s*\[/)[0].replace(/[[\]ˈˌː.()]/g, '');

// The first vowel sound of an IPA string and what comes just before it.
function firstNucleus(ipa) {
  const p = plainIpa(ipa);
  const i = [...p].findIndex((c) => IPA_VOWELS.includes(c));
  if (i < 0) return null;
  const chars = [...p];
  let j = i;
  while (j < chars.length && IPA_VOWELS.includes(chars[j])) j++;
  return { before: chars.slice(0, i).join(''), sound: chars.slice(i, j).join('') };
}

// The first vowel of a written word: one letter, or a gliding pair (au, ei, ey).
function firstVowel(word) {
  const i = [...word].findIndex(isVowel);
  if (i < 0) return null;
  const two = word.slice(i, i + 2);
  return ['au', 'ei', 'ey'].includes(two) ? { at: i, text: two } : { at: i, text: word[i] };
}

const SPELLINGS = (item) => item.spell ?? [item.id];

/**
 * Where an item is heard in a word: { at, text } (the spelling there), or null. Vowels: the first,
 * stressed vowel, with the IPA's first vowel sound as expected. Consonants: the spellings and
 * positions in content/CLAIMS.md (þ, d, t, hv, hj, sj at the start; ð after a vowel; ll, nn, pp,
 * tt, kk where the IPA shows tl, tn or the breath).
 */
export function spot(item, word, ipa) {
  if (!ipa || !word) return null;
  const p = plainIpa(ipa);
  const w = word.toLocaleLowerCase('is');
  const nuc = firstNucleus(ipa);
  const vowel = firstVowel(w);
  for (const s of SPELLINGS(item)) {
    if (NUCLEUS[s]) {
      if (!vowel || vowel.text !== s || !nuc || !NUCLEUS[s].includes(nuc.sound)) continue;
      if (s === 'é' && !nuc.before.endsWith('j')) continue;
      // After h, é is heard with the h as [ç] (hér); keep to clear cases.
      if (s === 'é' && w[vowel.at - 1] === 'h') continue;
      return vowel;
    }
    const start = (sound) => (w.startsWith(s) && p.startsWith(sound) ? { at: 0, text: s } : null);
    switch (s) {
      case 'þ': {
        const r = start('θ');
        if (r) return r;
        break;
      }
      case 'd':
      case 't': {
        const r = start(s === 't' ? 'tʰ' : 't');
        if (r && !(s === 'd' && p.startsWith('tʰ'))) return r;
        break;
      }
      case 'hv': {
        const r = start('kʰv');
        if (r) return r;
        break;
      }
      case 'hj': {
        const r = start('ç');
        if (r) return r;
        break;
      }
      case 'sj': {
        const r = start('sj');
        if (r) return r;
        break;
      }
      case 'ð': {
        const i = [...w].findIndex((c, k) => c === 'ð' && k > 0 && isVowel(w[k - 1]) && (k === w.length - 1 || isVowel(w[k + 1])));
        if (i > 0 && p.includes('ð')) return { at: i, text: 'ð' };
        break;
      }
      case 'll':
      case 'nn': {
        const i = w.indexOf(s);
        if (i > 0 && p.includes(s === 'll' ? 'tl' : 'tn')) return { at: i, text: s };
        break;
      }
      case 'pp':
      case 'tt':
      case 'kk': {
        const i = w.indexOf(s);
        const breath = s === 'kk' ? /h[kc]/ : new RegExp(`h${s[0]}`);
        if (i > 0 && breath.test(p)) return { at: i, text: s };
        break;
      }
      default:
    }
  }
  return null;
}

/** The spellings offered beside the one in the word. */
function confusables(item, text) {
  if (item.id === 'pp') return [text[0]];
  return item.confusable ?? [];
}

// Letters whose names sound alike (bé, dé, pé, té; á, há, ká...), offered together when the
// learner hears a name. Not a claim about the language: a choice of wrong options.
const NAME_GROUPS = [['b', 'd', 'p', 't', 'é', 'g'], ['á', 'h', 'k'], ['f', 'l', 'm', 'n', 'r', 's', 'x', 'ð', 'e'], ['i', 'í', 'y', 'ý'], ['o', 'ó', 'j'], ['u', 'ú', 'ö'], ['a', 'æ', 'v', 'þ']];

/**
 * @param {object} content content/letters.json
 * @param {{ id: string, word: string, ipa?: string, known?: boolean }[]} words course words
 * @param {object} [pairs] content/minimal-pairs.json
 */
export function letterModel(content, words, pairs = { pairs: [] }) {
  const items = itemsOf(content);
  const byId = new Map(items.map((x) => [x.id, x]));
  const byWord = new Map(words.map((w) => [w.id, w]));
  const letters = new Set(content.letters.map((x) => x.id));
  // Words where each item is heard, the known ones first.
  const heard = new Map(items.map((item) => [item.id, words.map((w) => ({ w, s: spot(item, w.word, w.ipa) })).filter((x) => x.s)]));
  const pairsFor = (id) => pairs.pairs.filter((pp) => CONTRAST_ITEM[pp.contrast] === id);

  const makers = {
    letter(item, r) {
      const found = heard.get(item.id);
      if (!found.length) return null;
      const known = found.filter((x) => x.w.known);
      const { w, s } = (known.length ? known : found)[Math.floor(r() * (known.length || found.length))];
      const options = [s.text, ...confusables(item, s.text)].filter((v, i, a) => a.indexOf(v) === i);
      if (options.length < 2) return null;
      return { type: 'letter', item: item.id, lemma: w.id, word: w.word, at: s.at, len: s.text.length, answer: s.text, options: shuffle(options, r), key: letterKey(item.id) };
    },
    lettername(item, r) {
      if (!letters.has(item.id)) return null;
      const group = NAME_GROUPS.find((g) => g.includes(item.id)) ?? [];
      const others = shuffle(group.filter((x) => x !== item.id), r);
      const rest = shuffle([...letters].filter((x) => x !== item.id && !others.includes(x)), r);
      const options = shuffle([item.id, ...[...others, ...rest].slice(0, 2)], r);
      return { type: 'lettername', item: item.id, say: item.say ?? item.name, answer: item.id, options, key: letterKey(item.id) };
    },
    likenb(item) {
      if (!item.askNb || !['same', 'other'].includes(item.nb) || !byWord.has(item.askNb)) return null;
      const word = byWord.get(item.askNb).word;
      // The spelling asked about, as it is written in the word (kk in takk, f in hafa).
      const label = letters.has(item.id) ? item.id : SPELLINGS(item).find((s) => word.includes(s));
      if (!label) return null;
      return { type: 'likenb', item: item.id, label, lemma: item.askNb, word, answer: item.nb, key: letterKey(item.id) };
    },
    spell(item, r) {
      const short = (w) => w && w.word.length <= 7 && !/[\s-]/.test(w.word);
      const pool = [...new Set([...(item.examples ?? []).map((id) => byWord.get(id)), ...heard.get(item.id).map((x) => x.w)])].filter(short);
      if (!pool.length) return null;
      const known = pool.filter((w) => w.known);
      const list = known.length ? known : pool;
      const w = list[Math.floor(r() * list.length)];
      return { type: 'spell', item: item.id, lemma: w.id, word: w.word, key: letterKey(item.id) };
    },
    pair(item, r) {
      const list = pairsFor(item.id);
      if (!list.length) return null;
      const pp = list[Math.floor(r() * list.length)];
      return { type: 'pair', words: pp.words, answer: pp.words[Math.floor(r() * 2)], contrast: pp.contrast, item: item.id, key: letterKey(item.id) };
    },
  };
  const TYPES = Object.keys(makers);

  /** The exercise types that can train an item. */
  const typesFor = (id) => TYPES.filter((type) => makers[type](byId.get(id), rng(1)));

  // One exercise for an item, of the type used least so far in this round (ties at random).
  function exerciseFor(id, used, r) {
    const item = byId.get(id);
    if (!item) return null;
    const order = shuffle(TYPES, r).sort((a, b) => (used.get(a) ?? 0) - (used.get(b) ?? 0));
    for (const type of order) {
      const spec = makers[type](item, r);
      if (spec) {
        used.set(type, (used.get(type) ?? 0) + 1);
        return spec;
      }
    }
    return null;
  }

  return { items, byId, typesFor, exerciseFor, heard: (id) => heard.get(id) ?? [] };
}

/** A card is weak when it was answered and sits low (box 0 or 1) or is right less than 3 times in 4. */
export function isWeak(card) {
  if (!card || !card.seen) return false;
  const answered = card.correct + card.wrong;
  return card.box <= 1 || (answered > 0 && card.correct / answered < 0.75);
}

// New letters and letters with another sound first, then close ones, then the same.
const NB_RANK = { new: 0, other: 1, close: 2, same: 3 };

/**
 * A round of letter exercises.
 * @param {ReturnType<typeof letterModel>} model
 * @param {{ cards?: object[], seed: number, count?: number, focus?: string|null, weak?: boolean, now?: number }} options
 *   cards: the learner's cards (any; letter cards are picked out); focus: one item only;
 *   weak: only weak items (all items when none is weak yet)
 * @returns {{ specs: object[], weakOnly: boolean }}
 */
export function letterDrill(model, { cards = [], seed, count = 10, focus = null, weak = false, now = Date.now() }) {
  const r = rng(seed);
  const card = new Map(cards.filter((c) => isLetterKey(c.key)).map((c) => [letterOf(c.key), c]));
  let ids;
  let weakOnly = false;
  if (focus && model.byId.has(focus)) {
    // One item: a short round, six exercises of different kinds.
    count = Math.min(count, 6);
    ids = [focus];
  } else {
    const all = model.items.map((x) => x.id);
    const weakIds = all.filter((id) => isWeak(card.get(id))).sort((a, b) => card.get(a).box - card.get(b).box);
    if (weak && weakIds.length) {
      weakOnly = true;
      ids = weakIds;
    } else {
      // Due cards first (most overdue first), then items never practiced (new letters and letters
      // with another sound before the rest), then the others.
      const due = all.filter((id) => card.get(id) && card.get(id).due <= now).sort((a, b) => card.get(a).due - card.get(b).due);
      const fresh = shuffle(all.filter((id) => !card.has(id)), r).sort((a, b) => NB_RANK[model.byId.get(a).nb] - NB_RANK[model.byId.get(b).nb]);
      const rest = shuffle(all.filter((id) => card.has(id) && card.get(id).due > now), r);
      ids = [...due, ...fresh, ...rest];
    }
  }
  const used = new Map();
  const specs = [];
  // Weak items fill the round; a short list of them goes round again.
  for (let i = 0; specs.length < count && i < count * 3; i++) {
    const id = ids[i % ids.length];
    if (!focus && i >= ids.length && !weakOnly) break;
    const spec = model.exerciseFor(id, used, r);
    if (spec) specs.push(spec);
  }
  // Two exercises in a row on the same word are dull: move the second further on where possible.
  for (let i = 1; i < specs.length; i++) {
    if (specs[i].lemma && specs[i].lemma === specs[i - 1].lemma) {
      const j = specs.findIndex((s, k) => k > i && s.lemma !== specs[i].lemma && s.lemma !== specs[i - 1]?.lemma);
      if (j > 0) [specs[i], specs[j]] = [specs[j], specs[i]];
    }
  }
  return { specs, weakOnly };
}

/** One exercise per due letter card, for a review round. */
export function letterReview(model, { cards, seed }) {
  const r = rng(seed);
  const used = new Map();
  return cards.filter((c) => isLetterKey(c.key)).map((c) => model.exerciseFor(letterOf(c.key), used, r)).filter(Boolean);
}
