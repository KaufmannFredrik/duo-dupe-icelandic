// Read access to the generated lexicon (Phase 1: data/demo/lexicon.json). Every inflected form
// shown anywhere comes from the DMII Core paradigms stored there, never from code.

import { loadJSON } from './app.js';
import { normalize, stripAcutes } from './normalize.js';
import { t } from './i18n.js';

let lexicon;
let index;

export async function loadLexicon() {
  lexicon ??= await loadJSON('data/demo/lexicon.json');
  return lexicon;
}

export const CASES = [
  { id: 'NF', cls: 'nf', key: 'case.nf' },
  { id: 'ÞF', cls: 'thf', key: 'case.thf' },
  { id: 'ÞGF', cls: 'thgf', key: 'case.thgf' },
  { id: 'EF', cls: 'ef', key: 'case.ef' },
];

/** Parses a DMII noun tag such as ÞGFETgr into case, number and definiteness. */
export function parseNounTag(tag) {
  const m = /^(NF|ÞF|ÞGF|EF)(ET|FT)(gr)?(\d)?$/.exec(tag);
  return m ? { case: m[1], number: m[2] === 'ET' ? 'sg' : 'pl', definite: Boolean(m[3]), variant: m[4] ? Number(m[4]) : 1 } : null;
}

export const entry = (lemma) => lexicon?.lemmas[lemma];
export const paradigm = (lemma) => entry(lemma)?.bin.entry.bmyndir ?? [];
export const sentence = (id) => lexicon?.sentences[id];

/** Distinct forms of a lemma, in paradigm order. */
export const distinctForms = (lemma) => [...new Set(paradigm(lemma).map((f) => f.b))];

/** All analyses of a word form: [{ lemma, tag, parsed }]. Accent-insensitive fallback. */
export function analyses(form) {
  if (!index) {
    index = new Map();
    for (const [lemma, e] of Object.entries(lexicon.lemmas)) {
      for (const f of e.bin.entry.bmyndir) {
        const key = normalize(f.b);
        if (!index.has(key)) index.set(key, []);
        index.get(key).push({ lemma, tag: f.g, parsed: parseNounTag(f.g) });
      }
    }
  }
  const key = normalize(form);
  return index.get(key) ?? [...index].filter(([k]) => stripAcutes(k) === stripAcutes(key)).flatMap(([, v]) => v);
}

export function genderKey(kyn) {
  return { kk: 'gender.kk', kvk: 'gender.kvk', hk: 'gender.hk' }[kyn];
}

export function caseTag(caseId, { full = true } = {}) {
  const c = CASES.find((x) => x.id === caseId);
  return `<span class="tag tag--${c.cls}"><span class="tag__abbr">${c.id}</span>${full ? `<span class="tag__name">${t(c.key)}</span>` : ''}</span>`;
}

/** "accusative singular, definite"; with { withCase: false } just "singular, definite". */
export function describeForm(parsed, { withCase = true } = {}) {
  if (!parsed) return '';
  const number = t(`form.${parsed.number}`);
  const def = t(parsed.definite ? 'form.definite' : 'form.indefinite');
  if (!withCase) return t('form.numberDef', { number, def });
  return t('form.describe', { case: t(CASES.find((c) => c.id === parsed.case).key), number, def });
}

export const glosses = (lemma) => entry(lemma)?.wiktionary.flatMap((w) => w.glosses) ?? [];
export const ipa = (lemma) => entry(lemma)?.wiktionary.flatMap((w) => w.ipa) ?? [];
export const recording = (lemma) => entry(lemma)?.wiktionary.flatMap((w) => w.audio).find((a) => a.mp3 || a.ogg);
