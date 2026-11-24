// Lesson generation. Turns a lesson's focus words into exercise specs, using only Tatoeba
// sentences from data/sentences.json (checked with GreynirCorrect at build time) and DMII Core
// forms from data/forms/. Pure: the caller passes the loaded data in, so tests run in Node.
//
// Exercise specs are plain JSON, so mistakes can be stored and replayed later.

import { CASES, analysesIn, buildTable, isCommonTag, parseTag } from '../grammar.js';
import { pick, rng, shuffle } from './rng.js';

const tokenize = (text) => [...text.matchAll(/\p{L}+/gu)].map((m) => ({ raw: m[0], low: m[0].toLocaleLowerCase('is'), index: m.index }));
const CASE_CLASSES = new Set(['no', 'lo', 'pfn', 'fn', 'to']);

/** The rules of content/case-rules.json, with each rule's noun groups turned into lemma ids. */
export function expandRules(file) {
  const group = (g) => file.nounGroups?.[g] ?? [];
  return Object.fromEntries(Object.entries(file.rules).map(([id, r]) => [id, r.nouns ? { ...r, nouns: r.nouns.flatMap(group) } : r]));
}

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
 * @param {(sid: string) => (string|null)[]|undefined} [data.casesOf]  per word of a sentence, the
 *   case the parser gives it there (NF, ÞF, ÞGF, EF or null); undefined if not parsed
 * @param {object} data.audio          data/audio.json "recordings"
 * @param {object} data.rules          expandRules(content/case-rules.json)
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
  // The course word the i-th word is, when that is certain (one candidate), else null.
  const onlyAt = (sid, i) => {
    if (i < 0 || i >= toks(sid).length) return null;
    const ids = idsAt(sid, i);
    return ids.length === 1 ? lexicon.lemmas[ids[0]] : null;
  };
  // The case the parser gives the i-th word in its sentence, or null.
  const casesOf = data.casesOf ?? (() => undefined);
  const caseAt = (sid, i) => {
    if (!tags(sid)) return null;
    const c = casesOf(sid);
    return c?.length === toks(sid).length ? c[i] : null;
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
    // The options show translations (English or Bokmål), so no two may share one in either language.
    const shown = (x) => [sentences[x].en[0], sentences[x].nb?.[0]].filter(Boolean);
    const seen = new Set(shown(sid));
    const others = [];
    for (const x of shuffle(pool, r)) {
      if (others.length === 3) break;
      if (x === sid || shown(x).some((t) => seen.has(t)) || !sentenceOk(x, everyWord)) continue;
      for (const t of shown(x)) seen.add(t);
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

  // What a word option shows: its English meaning or its Bokmål gloss, so options differ in both.
  const glossesOf = (x) => [lexicon.lemmas[x]?.meaning, lexicon.lemmas[x]?.nb?.[0]].filter(Boolean);
  const sameGloss = (a, b) => glossesOf(a).some((g) => glossesOf(b).includes(g));

  function meaning(id, allowed, r) {
    const others = shuffle([...allowed].filter((x) => x !== id && lexicon.lemmas[x] && !sameGloss(x, id)), r).slice(0, 3);
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
    const pairs = [];
    for (const id of shuffle(ids, r)) {
      if (pairs.some((x) => sameGloss(x, id))) continue;
      pairs.push(id);
      if (pairs.length === 4) break;
    }
    return pairs.length >= 3 ? { type: 'match', pairs, key: null } : null;
  }

  // A case target: a token that is this lemma in the sentence (tagged so, or when untagged the
  // only course word spelled so), whose analyses agree on number, definiteness and gender, and
  // whose comparable forms differ by case. Its case is the one the parser gives it there: "kaffi"
  // can be three cases, and in "Er hann að drekka kaffi?" it is the accusative. A form that can
  // be several cases is used only when the parser decided; unique: the form has one case only;
  // tag: only this form (a review of the form's card), so the card that is due gets practiced.
  function caseTarget(id, sid, { unique = false, tag = null } = {}) {
    const bm = paradigm(id);
    for (const [i, tok] of toks(sid).entries()) {
      const ids = idsAt(sid, i);
      if (ids.length !== 1 || ids[0] !== id) continue;
      let an = analysesIn(bm, tok.raw).filter((a) => a.parsed.case && a.parsed.variant === 1);
      if (!an.length) continue;
      const p0 = an[0].parsed;
      const same = (q) => q.number === p0.number && q.definite === p0.definite && q.gender === p0.gender && q.degree === p0.degree && q.strength === p0.strength;
      if (!an.every((a) => same(a.parsed))) continue; // the parser chooses a case, never a number
      const formCases = new Set(an.map((a) => a.parsed.case));
      if (unique && formCases.size !== 1) continue;
      const parsed = caseAt(sid, i);
      if (parsed) an = an.filter((a) => a.parsed.case === parsed);
      else if (formCases.size > 1) continue;
      if (!an.length) continue;
      const chosen = tag ? an.find((a) => a.tag === tag) : an[0];
      if (!chosen) continue;
      const p = chosen.parsed;
      const comparable = bm.filter((f) => f.b && /\d$/.test(f.g) === false).map((f) => ({ f, q: analysesIn([f], f.b)[0]?.parsed })).filter(({ q }) => q?.case && same(q));
      const options = [...new Set(comparable.map(({ f }) => f.b))];
      if (options.length < 2) continue;
      return { tok, index: i, tag: chosen.tag, parsed: p, cases: [...new Set(an.map((a) => a.parsed.case))], options };
    }
    return null;
  }

  // The rule behind the case of the i-th word (lemma id) of a sentence: a preposition right before
  // its phrase, which must be that preposition there ("á" in "Ég á dóttur" is the verb eiga), or a
  // verb before it. The phrase starts after the words before it that the parser gives the same
  // case ("fyrir tveimur árum"). Rules with "nouns" are for time expressions and apply only when
  // the word or the next one is one of those nouns ("á sunnudaginn"); rules with "verbs" only after
  // one of those verbs ("horfa á"). Rules with a condition are tried first.
  const conditional = (r) => Boolean(r.nouns || r.verbs);
  const ruleList = Object.entries(rules).sort(([, a], [, b]) => Number(conditional(b)) - Number(conditional(a)));
  function ruleFor(sid, i, caseId, id) {
    let start = i;
    while (start > 0 && caseAt(sid, start - 1) === caseId) start--;
    const prev = onlyAt(sid, start - 1);
    const near = new Set([id, ...(i + 1 < toks(sid).length ? idsAt(sid, i + 1) : [])]);
    const verbBefore = (lemma) => toks(sid).some((_, j) => j < i && onlyAt(sid, j)?.lemma === lemma && onlyAt(sid, j).ofl === 'so');
    for (const [rid, rule] of ruleList) {
      if (rule.case !== caseId) continue;
      if (rule.nouns && !rule.nouns.some((n) => near.has(n))) continue;
      if (rule.verbs && !rule.verbs.some(verbBefore)) continue;
      if (rule.kind === 'preposition' && prev?.lemma === rule.trigger && prev.ofl === 'fs') return rid;
      if (rule.kind === 'verb' && verbBefore(rule.trigger)) return rid;
    }
    return null;
  }

  // tag: only that form (reviews), looked for in every sentence instead of the 16 shortest.
  function caseSpec(type, id, allowed, used, r, { tag = null } = {}) {
    if (!CASE_CLASSES.has(lexicon.lemmas[id].ofl)) return null;
    const cands = sentencesFor(id, allowed, used, 9, true);
    for (const sid of tag ? cands : cands.slice(0, 16)) {
      const t = caseTarget(id, sid, { unique: type === 'case', tag });
      if (!t) continue;
      used.add(sid);
      const base = { lemma: id, sentence: sid, target: t.tok.raw, tag: t.tag, rule: ruleFor(sid, t.index, t.cases[0], id), key: `${id}|${t.tag}`, meta: { case: t.cases[0], number: t.parsed.number, gender: t.parsed.gender ?? lexicon.lemmas[id].kyn } };
      return type === 'case' ? { type: 'case', ...base, cases: t.cases } : { type: 'ending', ...base, options: shuffle(t.options, r) };
    }
    return null;
  }

  // --- Verb forms -----------------------------------------------------------------------------------

  // A finite verb form in the active indicative: person, number and tense, as in the verb table.
  const finite = (p) => p.voice === 'GM' && p.mood === 'FH' && Boolean(p.person) && p.variant === 1;
  const PERSON = { 'ég_pfn': 1, 'þú_pfn': 2, 'hann_pfn': 3, 'hún_pfn': 3, 'það_pfn': 3 };
  // Persons and numbers of the personal pronouns in the nominative in a sentence (its subjects).
  function subjects(sid) {
    const out = [];
    for (const [i, tok] of toks(sid).entries()) {
      const ids = idsAt(sid, i);
      if (ids.length !== 1 || !PERSON[ids[0]]) continue;
      const parsed = caseAt(sid, i);
      if (parsed && parsed !== 'NF') continue;
      const an = analysesIn(paradigm(ids[0]), tok.raw).find((a) => a.parsed.case === 'NF');
      if (an) out.push({ person: PERSON[ids[0]], number: an.parsed.number });
    }
    return out;
  }

  // A verb target: a token that is this verb in the sentence, in a finite form whose spelling is
  // not also the infinitive or the supine ("drekka" after "vil" is not 3rd person plural). A form
  // that is also an imperative is used only with a subject pronoun that fits it ("Ég drekk", not
  // "Spurðu Alex", where spurðu is "ask!" and not "they asked"). Where persons share a form
  // ("drekkur": 2nd and 3rd singular), the subject pronoun decides, else the 3rd person (a noun
  // subject). Options: the other forms of the same tense, so the choice is about person and number.
  // tag: only this form (a review).
  function verbTarget(id, sid, { tag = null } = {}) {
    const bm = paradigm(id);
    for (const [i, tok] of toks(sid).entries()) {
      const ids = idsAt(sid, i);
      if (ids.length !== 1 || ids[0] !== id) continue;
      const all = analysesIn(bm, tok.raw).filter((a) => a.parsed.variant === 1);
      let an = all.filter((a) => finite(a.parsed));
      if (!an.length || all.some((a) => a.parsed.mood === 'NH' || a.parsed.mood === 'SAGNB')) continue;
      const tense = an[0].parsed.tense;
      if (!an.every((a) => a.parsed.tense === tense)) continue;
      const subj = subjects(sid);
      const fit = an.filter((a) => subj.some((s) => s.person === a.parsed.person && s.number === a.parsed.number));
      // A sentence that starts with the verb and is no question is a command ("Spurðu Alex.", with
      // the everyday imperative spurðu where the DMII Core has spyrðu), unless a subject fits.
      if (i === 0 && !/\?\s*$/.test(sentences[sid].is) && !fit.length) continue;
      if (all.some((a) => a.parsed.mood === 'BH')) {
        if (!fit.length) continue;
        an = fit;
      } else if (!tag && an.length > 1) {
        const third = an.filter((a) => a.parsed.person === 3);
        an = fit.length ? fit : third.length ? third : an;
      }
      const chosen = tag ? an.find((a) => a.tag === tag) : an[0];
      if (!chosen) continue;
      const forms = [...new Set(bm.filter((f) => f.b && /\d$/.test(f.g) === false && finite(parseTag(f.g)) && parseTag(f.g).tense === tense).map((f) => f.b))];
      const answer = forms.find((f) => f.toLocaleLowerCase('is') === tok.low);
      if (!answer || forms.length < 3) continue;
      return { tok, index: i, tag: chosen.tag, parsed: chosen.parsed, answer, forms };
    }
    return null;
  }

  // "conjugate": pick the verb's form for the blank; "typeform": type it.
  function verbSpec(type, id, allowed, used, r, { tag = null } = {}) {
    if (lexicon.lemmas[id].ofl !== 'so') return null;
    const cands = sentencesFor(id, allowed, used, 9, true);
    for (const sid of tag ? cands : cands.slice(0, 16)) {
      const t = verbTarget(id, sid, { tag });
      if (!t) continue;
      used.add(sid);
      const base = { lemma: id, sentence: sid, target: t.tok.raw, tag: t.tag, key: `${id}|${t.tag}`, meta: { person: t.parsed.person, number: t.parsed.number, tense: t.parsed.tense } };
      if (type === 'typeform') return { type, ...base };
      const others = shuffle(t.forms.filter((f) => f !== t.answer), r).slice(0, 3);
      return { type: 'conjugate', ...base, options: shuffle([t.answer, ...others], r) };
    }
    return null;
  }

  // A noun's singular with three cells to fill; the indefinite nominative is always shown.
  // want: a review of one form (a card such as "bjór_no|ÞFFTgr" or "drekka_so|GM-FH-ÞT-1P-ET"):
  // the part of the word's table that has that cell (as the case trainer shows it, so any word
  // class), with that cell and up to two more to fill.
  function table(id, r, want = null) {
    if (want) return tableFor(id, want, r);
    if (lexicon.lemmas[id].ofl !== 'no') return null;
    const tags = paradigm(id)
      .filter((f) => f.b && /^(NF|ÞF|ÞGF|EF)ET(gr)?$/.test(f.g) && f.g !== 'NFET')
      .map((f) => f.g);
    if (tags.length < 3) return null;
    return { type: 'table', lemma: id, blanks: shuffle(tags, r).slice(0, 3), key: `${id}|table` };
  }

  // The table options under which a tag has a cell: a verb's tense, an adjective's strength.
  const tableOptions = (tag) => ({ tense: /(^|-)ÞT(-|$)/.test(tag) ? 'ÞT' : 'NT', strength: /^FVB-/.test(tag) ? 'VB' : 'SB' });
  function tableFor(id, want, r) {
    const l = lexicon.lemmas[id];
    const options = tableOptions(want);
    const tb = buildTable({ ofl: l.ofl, ord: l.lemma, bmyndir: paradigm(id) }, options);
    if (!tb) return null;
    const all = tb.groups.flatMap((g) => g.columns);
    const cellsOf = (g) => tb.rows.flatMap((row) => g.columns.map((c) => row.cells[all.indexOf(c)]).filter((cell) => cell?.forms.length).map((cell) => cell.tag));
    const group = tb.groups.find((g) => cellsOf(g).includes(want));
    if (!group) return null;
    const others = [...new Set(cellsOf(group))].filter((g) => g !== want);
    if (others.length < 2) return null; // keep at least one cell shown
    return { type: 'table', lemma: id, blanks: [want, ...shuffle(others, r).slice(0, Math.min(2, others.length - 1))], options, key: `${id}|${want}` };
  }

  // --- Lessons ------------------------------------------------------------------------------------

  // Words with case (nouns, adjectives, pronouns, numerals) rotate through case work early; verbs
  // start with their forms (person and number), the others alternating between two starting points;
  // other words go through meaning and sentence work, each starting further along.
  const CASE_CYCLE = ['ending', 'case', 'listen', 'meaning', 'choice', 'ending', 'dictation', 'case', 'typeword', 'wordbank'];
  const VERB_CYCLE = ['conjugate', 'listen', 'meaning', 'choice', 'dictation', 'conjugate', 'wordbank', 'typeword', 'choice'];
  const WORD_CYCLE = ['listen', 'meaning', 'choice', 'dictation', 'wordbank', 'typeword', 'choice'];
  const cycleFor = (id) => (CASE_CLASSES.has(lexicon.lemmas[id].ofl) ? CASE_CYCLE : lexicon.lemmas[id].ofl === 'so' ? VERB_CYCLE : WORD_CYCLE);
  const startFor = (id, i) => (CASE_CLASSES.has(lexicon.lemmas[id].ofl) ? 0 : lexicon.lemmas[id].ofl === 'so' ? (i % 2) * 5 : i % WORD_CYCLE.length);
  // A form card's exercise: case words in a sentence, verbs in a sentence, else the word's table.
  const formSpec = (type, id, allow, used, r, tag) =>
    lexicon.lemmas[id].ofl === 'so' ? verbSpec(type === 'ending' ? 'conjugate' : type, id, allow, used, r, { tag }) : caseSpec(type, id, allow, used, r, { tag });

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
    const step = new Map(focus.map((id, i) => [id, startFor(id, i)]));
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
            : type === 'conjugate' ? verbSpec(type, id, allow, used, r)
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

  /**
   * Review of due cards: "id|meaning" cards get word exercises; a form card ("bjór_no|ÞFETgr") gets
   * an exercise on exactly that form, in a sentence or else in the noun's table, so the card that
   * is due is the one answered. A card no exercise can reach is skipped (reviewable() says which).
   */
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
        : formSpec('ending', id, allow, used, r, part) ?? table(id, r, part);
      if (spec) out.push(spec);
    }
    return out;
  }

  /** Whether review() can make an exercise for a card (any word may be used). */
  function reviewable(key) {
    const [id, part] = key.split('|');
    if (!lexicon.lemmas[id]) return false;
    if (part === 'meaning') return true;
    if (part === 'table') return Boolean(table(id, rng(1)));
    return Boolean(formSpec('ending', id, everyWord, new Set(), rng(1), part) ?? table(id, rng(1), part));
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

  return { lesson, review, reviewable, placement, sentenceOk, caseTarget, ruleFor, toks, hasLemma };
}
