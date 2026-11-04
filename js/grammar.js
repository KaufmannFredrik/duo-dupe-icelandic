// Grammar helpers over DMII Core paradigms: tag parsing and table layouts for nouns, adjectives,
// pronouns, numerals and verbs. Pure functions (no DOM, no fetch), so they run in Node tests.
// Tables only look forms up by tag; no form is ever built in code.

export const CASES = ['NF', 'ÞF', 'ÞGF', 'EF'];
export const CASE_CLASS = { NF: 'nf', ÞF: 'thf', ÞGF: 'thgf', EF: 'ef' };
export const GENDERS = ['KK', 'KVK', 'HK'];

/**
 * Parses a DMII tag such as "ÞGFETgr", "FSB-KVK-ÞFFT", "KK-NFET" or "GM-FH-NT-3P-ET".
 * @returns {{case?: string, number?: 'sg'|'pl', definite?: boolean, gender?: string, degree?: string,
 *   strength?: 'strong'|'weak', voice?: string, mood?: string, tense?: string, person?: number, variant: number}}
 */
export function parseTag(tag = '') {
  const out = { variant: 1 };
  const variant = /(\d)$/.exec(tag);
  if (variant) {
    out.variant = Number(variant[1]);
    tag = tag.slice(0, -1);
  }
  const caseNum = /(?:^|-)(NF|ÞF|ÞGF|EF)(ET|FT)?(gr)?(?:-|$)/.exec(tag);
  if (caseNum) {
    out.case = caseNum[1];
    if (caseNum[2]) out.number = caseNum[2] === 'ET' ? 'sg' : 'pl';
    out.definite = Boolean(caseNum[3]);
  }
  const gender = /(?:^|-)(KK|KVK|HK)(?:-|$)/.exec(tag);
  if (gender) out.gender = gender[1];
  const adj = /^(F|M|E)(SB|VB)?(?:-|$)/.exec(tag);
  if (adj && !tag.startsWith('FH')) {
    out.degree = { F: 'positive', M: 'comparative', E: 'superlative' }[adj[1]];
    if (adj[2]) out.strength = adj[2] === 'SB' ? 'strong' : 'weak';
  }
  const voice = /(?:^|-)(GM|MM)(?:-|$)/.exec(tag);
  if (voice) out.voice = voice[1];
  const mood = /(?:^|-)(NH|FH|VH|BH|LHNT|LHÞT|SAGNB)(?:-|$)/.exec(tag);
  if (mood) out.mood = mood[1];
  const tense = /(?:^|-)(NT|ÞT)(?:-|$)/.exec(tag);
  if (tense) out.tense = tense[1];
  const person = /(?:^|-)([123])P(?:-|$)/.exec(tag);
  if (person) out.person = Number(person[1]);
  if (!out.number) {
    const n = /(?:^|-)(ET|FT)(?:-|$)/.exec(tag);
    if (n) out.number = n[1] === 'ET' ? 'sg' : 'pl';
  }
  return out;
}

/** All forms with a tag, first variant first: [{ g, b }] filtered by a tag predicate. */
const find = (bmyndir, pred) => bmyndir.filter((f) => f.b && pred(parseTag(f.g), f.g));

/** First-variant form for an exact tag, plus any alternative variants. */
export function formsFor(bmyndir, tag) {
  return bmyndir.filter((f) => f.b && f.g.replace(/\d$/, '') === tag).map((f) => f.b);
}

/** Which table layout fits a word class. */
export function tableKind(ofl) {
  return { no: 'noun', lo: 'adjective', pfn: 'pronoun', afn: 'pronoun', fn: 'gendered', to: 'gendered', so: 'verb' }[ofl] ?? null;
}

/**
 * Builds a table: { kind, groups: [{ key, label, columns: [{key, label, tag}] }], rows: [{ key, label, cells: [{tag, forms}] }] }.
 * labels are i18n keys, filled in by the UI.
 * @param {{ ofl: string, bmyndir: {g: string, b: string}[] }} entry
 * @param {{ tense?: 'NT'|'ÞT', strength?: 'SB'|'VB' }} [options]
 */
export function buildTable(entry, { tense = 'NT', strength = 'SB' } = {}) {
  const b = (entry.bmyndir ?? []).filter((f) => f.b);
  const has = (tag) => formsFor(b, tag).length > 0;
  const kind = tableKind(entry.ofl);
  const caseRows = (tagFor, columns) =>
    CASES.map((c) => ({ key: c, label: `case.${CASE_CLASS[c]}`, caseId: c, cells: columns.map((col) => ({ tag: tagFor(c, col), forms: formsFor(b, tagFor(c, col)) })) }));

  if (kind === 'noun') {
    const cols = [
      { key: 'sg', label: 'form.indefinite', number: 'ET', gr: '' },
      { key: 'sg-def', label: 'form.definite', number: 'ET', gr: 'gr' },
      { key: 'pl', label: 'form.indefinite', number: 'FT', gr: '' },
      { key: 'pl-def', label: 'form.definite', number: 'FT', gr: 'gr' },
    ].filter((col) => CASES.some((c) => has(`${c}${col.number}${col.gr}`)));
    const groups = ['ET', 'FT']
      .map((n) => ({ key: n === 'ET' ? 'sg' : 'pl', label: n === 'ET' ? 'number.sg' : 'number.pl', columns: cols.filter((c) => c.number === n) }))
      .filter((g) => g.columns.length);
    return { kind, groups, rows: caseRows((c, col) => `${c}${col.number}${col.gr}`, groups.flatMap((g) => g.columns)) };
  }

  if (kind === 'pronoun') {
    // The reflexive "sig" has no number and no nominative: tags are just "ÞF", "ÞGF", "EF".
    if (!b.some((f) => /ET|FT/.test(f.g))) {
      const cols = [{ key: 'all', label: 'number.both', number: '' }];
      return { kind, groups: [{ key: 'all', label: null, columns: cols }], rows: caseRows((c) => c, cols) };
    }
    const cols = [
      { key: 'sg', label: 'number.sg', number: 'ET' },
      { key: 'pl', label: 'number.pl', number: 'FT' },
    ].filter((col) => CASES.some((c) => has(`${c}${col.number}`)));
    return { kind, groups: [{ key: 'all', label: null, columns: cols }], rows: caseRows((c, col) => `${c}${col.number}`, cols) };
  }

  if (kind === 'adjective' || kind === 'gendered') {
    const prefix = kind === 'adjective' ? `F${strength}-` : '';
    const groups = ['ET', 'FT']
      .map((n) => ({
        key: n === 'ET' ? 'sg' : 'pl',
        label: n === 'ET' ? 'number.sg' : 'number.pl',
        columns: GENDERS.map((g) => ({ key: `${g}-${n}`, label: `gender.${g.toLowerCase()}`, gender: g, number: n })),
      }))
      .map((g) => ({ ...g, columns: g.columns.filter((col) => CASES.some((c) => has(`${prefix}${col.gender}-${c}${col.number}`) || has(`${prefix}${col.gender}-${c}`))) }))
      .filter((g) => g.columns.length);
    // Numerals above "one" have no number marking in the tag: "KK-NF".
    const tagFor = (c, col) => (has(`${prefix}${col.gender}-${c}${col.number}`) ? `${prefix}${col.gender}-${c}${col.number}` : `${prefix}${col.gender}-${c}`);
    return { kind, groups, rows: caseRows(tagFor, groups.flatMap((g) => g.columns)) };
  }

  if (kind === 'verb') {
    const cols = [
      { key: 'sg', label: 'number.sg', number: 'ET' },
      { key: 'pl', label: 'number.pl', number: 'FT' },
    ];
    const rows = [1, 2, 3].map((p) => ({
      key: `${p}P`,
      label: `person.${p}`,
      cells: cols.map((col) => ({ tag: `GM-FH-${tense}-${p}P-${col.number}`, forms: formsFor(b, `GM-FH-${tense}-${p}P-${col.number}`) })),
    }));
    return { kind, groups: [{ key: 'all', label: null, columns: cols }], rows, infinitive: formsFor(b, 'GM-NH')[0] ?? entry.ord };
  }
  return null;
}

/**
 * Forms a beginner meets often: first variants only, and no imperatives, subjunctives, middle
 * voice, participles or comparison. Used to pick realistic distractors.
 */
export function isCommonTag(tag) {
  if (/\d$/.test(tag)) return false;
  if (/(^|-)(BH|VH|MM|LHNT|LHÞT|SAGNB|ST)(-|$)/.test(tag)) return false;
  if (/^(M|E)(SB|VB)?-/.test(tag)) return false;
  return true;
}

/** Distinct forms of a word, in paradigm order. */
export const distinctForms = (bmyndir) => [...new Set((bmyndir ?? []).filter((f) => f.b).map((f) => f.b))];

/** Analyses of a form within one paradigm: [{ tag, parsed }]. */
export function analysesIn(bmyndir, form) {
  const low = form.toLocaleLowerCase('is');
  return find(bmyndir ?? [], () => true)
    .filter((f) => f.b.toLocaleLowerCase('is') === low)
    .map((f) => ({ tag: f.g, parsed: parseTag(f.g) }));
}
