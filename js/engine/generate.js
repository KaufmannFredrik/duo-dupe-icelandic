// Lesson generation. Turns a lesson's focus words into exercise specs, using only Tatoeba
// sentences from data/sentences.json (checked with GreynirCorrect at build time) and DMII Core
// forms from data/forms/. Pure: the caller passes the loaded data in, so tests run in Node.
//
// Exercise specs are plain JSON, so mistakes can be stored and replayed later.

import { CASES, analysesIn, isCommonTag } from '../grammar.js';
import { pick, rng, shuffle } from './rng.js';

const tokenize = (text) => [...text.matchAll(/\p{L}+/gu)].map((m) => ({ raw: m[0], low: m[0].toLocaleLowerCase('is'), index: m.index }));
const CASE_CLASSES = new Set(['no', 'lo', 'pfn', 'fn', 'to']);

/**
 * @param {object} data
 * @param {object} data.lexicon        data/lexicon.json
 * @param {(id: string) => {g: string, b: string}[]} data.paradigm  forms of a lemma
 * @param {Map<string, Set<string>>} data.formIndex  lowercase form -> lemma ids
 * @param {object} data.sentences      data/sentences.json "sentences"
 * @param {string[]} data.pool         data/sentences.json "pool"
 * @param {(sid: string) => (string|-1|null)[]|undefined} [data.tagsOf]  per word of a sentence, the
 *   course word it is there (data/tags.json): a lemma id, "~" + id when used loosely, -1 for
 *   another word, null if undetermined
 * @param {object} data.audio          data/audio.json "recordings"
 * @param {object} data.rules          content/case-rules.json "rules"
 * @param {Set<string>} [data.names]   lowercase names allowed in sentences
 */
export function createGenerator(data) {
  const { lexicon, paradigm, formIndex, sentences, pool, audio, rules } = data;
  const names = data.names ?? new Set();
  const tokenCache = new Map();
  const toks = (sid) => {
    if (!tokenCache.has(sid)) tokenCache.set(sid, tokenize(sentences[sid].is));
    return tokenCache.get(sid);
  };

  const tagsOf = data.tagsOf ?? (() => undefined);
  const tagCache = new Map();
  const tags = (sid) => {
    if (!tagCache.has(sid)) {
      const t = tagsOf(sid);
      tagCache.set(sid, t?.length === toks(sid).length ? t : null);
    }
    return tagCache.get(sid);
  };
  // The course words the i-th word of a sentence can be: the parser's choice when it made one
  // (so "afar" in "afar heitur" is not a form of afi), otherwise every course word spelled so.
  // loose: include a word used loosely ("til" in "Við erum öll til"), which the learner knows but
  // which is not taught from that sentence.
  const idsAt = (sid, i, { loose = false } = {}) => {
    const tag = tags(sid)?.[i];
    if (typeof tag === 'string') return tag[0] !== '~' ? [tag] : loose ? [tag.slice(1)] : [];
    if (tag === -1) return [];
    return [...(formIndex.get(toks(sid)[i].low) ?? [])];
  };

  // A word is fine for a learner when it is an allowed course word or a name.
  const knownToken = (sid, i, allowed) => {
    const tok = toks(sid)[i];
    if (idsAt(sid, i, { loose: true }).some((id) => allowed.has(id))) return true;
    return names.has(tok.low) || (tok.index > 0 && tok.raw[0] !== tok.low[0]);
  };
  const sentenceOk = (sid, allowed) => sentences[sid]?.en.length > 0 && toks(sid).every((_, i) => knownToken(sid, i, allowed));
  // A tagged sentence contains a word only where the parser says so; an untagged one by spelling.
  const hasLemma = (sid, id) => (tags(sid) ? tags(sid).includes(id) : toks(sid).some((t) => formIndex.get(t.low)?.has(id)));
  const byLength = (ids) => ids.toSorted((a, b) => toks(a).length - toks(b).length || sentences[a].is.length - sentences[b].is.length);

  const everyWord = new Set(Object.keys(lexicon.lemmas));

  // Sentences with the word, made only of words the learner knows. relax: when there are none,
  // accept any course word (for reading exercises, which show the translation).
  function sentencesFor(id, allowed, used, maxTokens = 9, relax = false) {
    const pick = (words) => byLength(pool.filter((sid) => !used.has(sid) && toks(sid).length <= maxTokens && hasLemma(sid, id) && sentenceOk(sid, words)));
    const strict = pick(allowed);
    return strict.length || !relax ? strict : pick(everyWord);
  }

  // --- Exercise builders: each returns a spec or null when the data does not support it -----------

  function choice(id, allowed, used, r) {
    const cands = sentencesFor(id, allowed, used, 9, true);
    if (!cands.length) return null;
    const sid = pick(cands.slice(0, 6), r);
    const en = sentences[sid].en[0];
    const seen = new Set([en]);
    const others = [];
    for (const x of shuffle(pool, r)) {
      if (others.length === 3) break;
      const e = sentences[x].en[0];
      if (x === sid || seen.has(e) || !sentenceOk(x, everyWord)) continue;
      seen.add(e);
      others.push(x);
    }
    if (others.length < 2) return null;
    used.add(sid);
    return { type: 'choice', lemma: id, sentence: sid, options: shuffle([sid, ...others], r), key: `${id}|meaning` };
  }

  function wordbank(id, allowed, used, r) {
    const cands = sentencesFor(id, allowed, used, 7);
    if (!cands.length) return null;
    const sid = pick(cands.slice(0, 6), r);
    const present = new Set(toks(sid).map((t) => t.low));
    // Distractors: other forms of words in the sentence, the mistakes a learner would really make.
    const distractors = [];
    for (const i of shuffle([...toks(sid).keys()], r)) {
      const ids = idsAt(sid, i, { loose: true }).filter((x) => allowed.has(x));
      for (const lemmaId of ids) {
        const common = [...new Set(paradigm(lemmaId).filter((f) => isCommonTag(f.g)).map((f) => f.b))];
        const alt = shuffle(common.filter((f) => !present.has(f.toLocaleLowerCase('is'))), r)[0];
        if (alt && !distractors.includes(alt)) distractors.push(alt);
        if (distractors.length >= 2) break;
      }
      if (distractors.length >= 2) break;
    }
    used.add(sid);
    return { type: 'wordbank', lemma: id, sentence: sid, distractors, key: `${id}|meaning` };
  }

  function dictation(id, allowed, used, r) {
    const spec = wordbank(id, allowed, used, r);
    return spec && toks(spec.sentence).length <= 6 ? { ...spec, type: 'dictation' } : null;
  }

  function typeword(id) {
    return { type: 'typeword', lemma: id, key: `${id}|meaning` };
  }

  function meaning(id, allowed, r) {
    const others = shuffle([...allowed].filter((x) => x !== id && lexicon.lemmas[x]?.meaning !== lexicon.lemmas[id].meaning), r).slice(0, 3);
    if (others.length < 3) return null;
    return { type: 'meaning', lemma: id, options: shuffle([id, ...others], r), key: `${id}|meaning` };
  }

  function listen(id, allowed, r) {
    const rec = audio[id]?.find((x) => x.mp3 || x.ogg);
    if (!rec) return null;
    const lemma = lexicon.lemmas[id].lemma;
    const others = shuffle([...allowed].filter((x) => x !== id && lexicon.lemmas[x].lemma !== lemma), r).slice(0, 3);
    if (others.length < 3) return null;
    return { type: 'listen', lemma: id, recording: rec, options: shuffle([id, ...others], r), key: `${id}|meaning` };
  }

  function match(ids, r) {
    const glosses = new Set();
    const pairs = [];
    for (const id of shuffle(ids, r)) {
      const g = lexicon.lemmas[id].meaning;
      if (glosses.has(g)) continue;
      glosses.add(g);
      pairs.push(id);
      if (pairs.length === 4) break;
    }
    return pairs.length >= 3 ? { type: 'match', pairs, key: null } : null;
  }

  // A case target: a token that is this lemma in the sentence (tagged so, or when untagged the
  // only course word spelled so), whose analyses agree on number, definiteness and gender, and
  // whose comparable forms differ by case.
  function caseTarget(id, sid, { unique = false } = {}) {
    const bm = paradigm(id);
    for (const [i, tok] of toks(sid).entries()) {
      const ids = idsAt(sid, i);
      if (ids.length !== 1 || ids[0] !== id) continue;
      const an = analysesIn(bm, tok.raw).filter((a) => a.parsed.case && a.parsed.variant === 1);
      if (!an.length) continue;
      const p = an[0].parsed;
      const same = (q) => q.number === p.number && q.definite === p.definite && q.gender === p.gender && q.degree === p.degree && q.strength === p.strength;
      if (!an.every((a) => same(a.parsed))) continue;
      const comparable = bm.filter((f) => f.b && /\d$/.test(f.g) === false).map((f) => ({ f, q: analysesIn([f], f.b)[0]?.parsed })).filter(({ q }) => q?.case && same(q));
      const options = [...new Set(comparable.map(({ f }) => f.b))];
      if (options.length < 2) continue;
      if (unique && new Set(an.map((a) => a.parsed.case)).size !== 1) continue;
      return { tok, tag: an[0].tag, parsed: p, cases: [...new Set(an.map((a) => a.parsed.case))], options };
    }
    return null;
  }

  function ruleFor(sid, tok, caseId) {
    const before = toks(sid).filter((t) => t.index < tok.index);
    const prev = before.at(-1)?.low;
    const verbBefore = (lemma) => before.some((_, i) => idsAt(sid, i).some((x) => lexicon.lemmas[x]?.lemma === lemma && lexicon.lemmas[x].ofl === 'so'));
    for (const [rid, rule] of Object.entries(rules)) {
      if (rule.kind === 'preposition' && rule.trigger === prev && rule.case === caseId) return rid;
      if (rule.kind === 'verb' && rule.case === caseId && verbBefore(rule.trigger)) return rid;
    }
    return null;
  }

  function caseSpec(type, id, allowed, used, r) {
    if (!CASE_CLASSES.has(lexicon.lemmas[id].ofl)) return null;
    for (const sid of sentencesFor(id, allowed, used, 9, true).slice(0, 16)) {
      const t = caseTarget(id, sid, { unique: type === 'case' });
      if (!t) continue;
      used.add(sid);
      const base = { lemma: id, sentence: sid, target: t.tok.raw, tag: t.tag, rule: ruleFor(sid, t.tok, t.cases[0]), key: `${id}|${t.tag}`, meta: { case: t.cases[0], number: t.parsed.number, gender: t.parsed.gender ?? lexicon.lemmas[id].kyn } };
      return type === 'case' ? { type: 'case', ...base, cases: t.cases } : { type: 'ending', ...base, options: shuffle(t.options, r) };
    }
    return null;
  }

  function table(id, r) {
    if (lexicon.lemmas[id].ofl !== 'no') return null;
    const tags = paradigm(id)
      .filter((f) => f.b && /^(NF|ÞF|ÞGF|EF)ET(gr)?$/.test(f.g) && f.g !== 'NFET')
      .map((f) => f.g);
    if (tags.length < 3) return null;
    return { type: 'table', lemma: id, blanks: shuffle(tags, r).slice(0, 3), key: `${id}|table` };
  }

  // --- Lessons ------------------------------------------------------------------------------------

  // Words with case (nouns, adjectives, pronouns, numerals) rotate through case work early;
  // other words through meaning and sentence work.
  const CASE_CYCLE = ['ending', 'case', 'listen', 'meaning', 'choice', 'ending', 'dictation', 'case', 'typeword', 'wordbank'];
  const WORD_CYCLE = ['listen', 'meaning', 'choice', 'dictation', 'wordbank', 'typeword', 'choice'];
  const cycleFor = (id) => (CASE_CLASSES.has(lexicon.lemmas[id].ofl) ? CASE_CYCLE : WORD_CYCLE);

  /**
   * @param {{ focus: string[], allowed: Iterable<string>, seed: number, count?: number }} options
   *   focus: the lesson's new words; allowed: every word the learner may meet (includes focus).
   */
  function lesson({ focus, allowed, seed, count = 12 }) {
    const r = rng(seed);
    const allow = new Set([...allowed, ...focus]);
    const used = new Set();
    const out = [];
    const intro = match(focus, r);
    if (intro) out.push(intro);
    const step = new Map(focus.map((id, i) => [id, CASE_CLASSES.has(lexicon.lemmas[id].ofl) ? 0 : i % WORD_CYCLE.length]));
    let tableDone = false;
    for (let round = 0; out.length < count && round < 8; round++) {
      for (const id of shuffle(focus, r)) {
        if (out.length >= count) break;
        if (!tableDone && round === 1) {
          const tb = table(id, r);
          if (tb) {
            out.push(tb);
            tableDone = true;
            continue;
          }
        }
        const cycle = cycleFor(id);
        for (let tries = 0; tries < cycle.length; tries++) {
          const type = cycle[step.get(id) % cycle.length];
          step.set(id, step.get(id) + 1);
          const spec =
            type === 'choice' ? choice(id, allow, used, r)
            : type === 'wordbank' ? wordbank(id, allow, used, r)
            : type === 'dictation' ? dictation(id, allow, used, r)
            : type === 'meaning' ? meaning(id, allow, r)
            : type === 'listen' ? listen(id, allow, r)
            : type === 'typeword' ? typeword(id)
            : caseSpec(type, id, allow, used, r);
          if (spec) {
            out.push(spec);
            break;
          }
        }
      }
    }
    return out.slice(0, count);
  }

  /** Review of due cards: "id|meaning" cards get word exercises, form cards get case exercises. */
  function review({ cards, allowed, seed, count = 12 }) {
    const r = rng(seed);
    const allow = new Set(allowed);
    const used = new Set();
    const out = [];
    for (const card of cards) {
      if (out.length >= count) break;
      const [id, part] = card.key.split('|');
      if (!lexicon.lemmas[id]) continue;
      allow.add(id);
      const spec =
        part === 'meaning' ? choice(id, allow, used, r) ?? meaning(id, allow, r) ?? typeword(id)
        : part === 'table' ? table(id, r)
        : caseSpec('ending', id, allow, used, r) ?? table(id, r);
      if (spec) out.push(spec);
    }
    return out;
  }

  /** Placement: one word question per unit, plus a case question from unit 2 on. */
  function placement({ units, seed }) {
    const r = rng(seed);
    const steps = [];
    const allowed = new Set();
    for (const [i, unit] of units.entries()) {
      for (const id of unit.lemmas) allowed.add(id);
      const words = unit.lemmas.slice(0, 12);
      const items = [];
      const m = meaning(pick(words, r), allowed, r);
      if (m) items.push(m);
      if (i > 0) {
        for (const id of shuffle(unit.lemmas, r)) {
          const c = caseSpec('case', id, allowed, new Set(), r);
          if (c) {
            items.push(c);
            break;
          }
        }
      }
      steps.push({ unit: unit.id, items });
    }
    return steps;
  }

  return { lesson, review, placement, sentenceOk, caseTarget, toks, hasLemma };
}
