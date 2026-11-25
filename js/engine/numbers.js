// Numbers by ear (docs/PLAN.md, unit Tölur): what a number is called, the numbers that sound
// alike, and the phone numbers the course plays. Pure, so the lesson generator, the audio build
// (scripts/build-numbers.mjs writes the texts for scripts/build-audio.py) and the tests share it.
// The claims behind it are listed in content/CLAIMS.md (Tölur).

import { hashSeed, rng } from './rng.js';

// The course's cardinal words by value. One to four are in the masculine, the form used when
// counting with no noun in mind; from five on numbers never change.
export const CARDINAL = {
  1: 'einn', 2: 'tveir', 3: 'þrír', 4: 'fjórir', 5: 'fimm', 6: 'sex', 7: 'sjö', 8: 'átta', 9: 'níu', 10: 'tíu',
  11: 'ellefu', 12: 'tólf', 13: 'þrettán', 14: 'fjórtán', 15: 'fimmtán', 16: 'sextán', 17: 'sautján', 18: 'átján', 19: 'nítján',
  20: 'tuttugu', 30: 'þrjátíu', 40: 'fjörutíu', 50: 'fimmtíu', 60: 'sextíu', 70: 'sjötíu', 80: 'áttatíu', 90: 'níutíu',
};

// The ordinals 1st to 10th: the course word and the form said for a date or in a list (the weak
// masculine nominative, "fyrsti maí"). annar is the course word "other" too, so its own card is
// never drilled as a number; it only appears among the options.
export const ORDINAL = {
  1: ['fyrstur_lo', 'fyrsti'], 2: ['annar_fn', 'annar'], 3: ['þriðji_rt', 'þriðji'], 4: ['fjórði_rt', 'fjórði'], 5: ['fimmti_rt', 'fimmti'],
  6: ['sjötti_rt', 'sjötti'], 7: ['sjöundi_rt', 'sjöundi'], 8: ['áttundi_rt', 'áttundi'], 9: ['níundi_rt', 'níundi'], 10: ['tíundi_rt', 'tíundi'],
};

const cardinalId = (n) => `${CARDINAL[n]}_to`;
const BY_ID = new Map([
  ...Object.keys(CARDINAL).map((n) => [cardinalId(Number(n)), { kind: 'cardinal', n: Number(n) }]),
  ...Object.entries(ORDINAL).filter(([n]) => n !== '2').map(([n, [id, form]]) => [id, { kind: 'ordinal', n: Number(n), form }]),
]);

/** The number a course word stands for: { kind: 'cardinal'|'ordinal', n, form? }, or null. */
export const numberOf = (id) => BY_ID.get(id) ?? null;

/** 1 to 99 as said when counting: tens, "og", then the unit ("fjörutíu og sjö"). */
export function say(n) {
  if (CARDINAL[n]) return CARDINAL[n];
  if (n > 20 && n < 100) return `${CARDINAL[n - (n % 10)]} og ${CARDINAL[n % 10]}`;
  throw new RangeError(`no words for ${n}`);
}

/** The course words (lemma ids) a number is said with, besides "og". */
export const wordsOf = (n) => (CARDINAL[n] ? [cardinalId(n)] : [cardinalId(n - (n % 10)), cardinalId(n % 10)]);

/** The numbers a course word can be heard in: a teen alone, a ten alone or with a unit. */
export function numbersWith(id) {
  const v = numberOf(id);
  if (v?.kind !== 'cardinal') return [];
  if (v.n < 20 || v.n % 10) return [v.n];
  return Array.from({ length: 10 }, (_, u) => v.n + u);
}

// Numbers that sound or look like n, best first: 17 sautján and 70 sjötíu and 7 sjö; 47 and 74.
export function confusables(n) {
  const t = Math.floor(n / 10);
  const u = n % 10;
  const cands =
    n < 10 ? [n + 10, n * 10, n + 20, n === 9 ? 8 : n + 1]
    : u === 0 ? [10 + t, t, n + t, n === 90 ? 80 : n + 10]
    : n < 20 ? [u, u * 10, 20 + u, n % 2 ? n + 1 : n - 1]
    : [u * 10 + t, 10 + u, (t === 9 ? 8 : t + 1) * 10 + u, 10 + t, n + 1, n - 1];
  return [...new Set(cands)].filter((x) => x !== n && x >= 1 && x <= 99);
}

/** Other ordinals for k (1 to 10), as options: the neighbours first. */
export function ordinalConfusables(k) {
  const cands = [k === 10 ? 9 : k + 1, k === 1 ? 3 : k - 1, ((k + 4) % 10) + 1, ((k + 6) % 10) + 1];
  return [...new Set(cands)].filter((x) => x !== k);
}

// --- Phone numbers -------------------------------------------------------------------------------

// Seven digits, said as the first three one by one and then two pairs, each pair one number
// (elon.io: "567 12 34"). The course's phone numbers keep to what every source agrees on: no 1 to 4
// said alone or at the end of a pair (sources differ on their gender there), no 0 said alone and
// no pair starting with 0. The first digit is 5 to 8, as Icelandic numbers start. Each focus word
// has two, its pair beside one of the numbers known before this unit (10, 20, 25 to 29).
const SINGLES = [5, 6, 7, 8, 9];
const EARLY = [10, 20, 25, 26, 27, 28, 29];
const FOCUS = [11, 12, 13, 14, 15, 16, 17, 18, 19, 30, 40, 50, 60, 70, 80, 90];

function makePhones() {
  const out = new Map();
  // A fixed seed, so the list (and its audio) never changes.
  const r = rng(hashSeed('phone numbers'));
  const next = (list) => list[Math.floor(r() * list.length)];
  for (const f of FOCUS) {
    const pairs = f < 20 ? [f, f] : [f + 5 + (f / 10) % 5, f];
    out.set(f, pairs.map((p, i) => {
      const digits = `${next([5, 6, 7, 8])}${next(SINGLES)}${next(SINGLES)}`;
      const other = next(EARLY);
      return i === 0 ? `${digits}${p}${other}` : `${digits}${other}${p}`;
    }));
  }
  return out;
}
const PHONES = makePhones();

/** The phone numbers drilled with a course word (digits, "5671258"). */
export const phonesWith = (id) => (numberOf(id)?.kind === 'cardinal' ? PHONES.get(numberOf(id).n) ?? [] : []);
export const allPhones = () => [...PHONES.values()].flat();

/** How a phone number is said: "fimm sex sjö, tólf, fimmtíu og átta". */
export const phoneSay = (p) => `${[...p.slice(0, 3)].map((d) => CARDINAL[d]).join(' ')}, ${say(Number(p.slice(3, 5)))}, ${say(Number(p.slice(5)))}`;

/** As it is said, in groups: "567 12 58". */
export const phoneShow = (p) => `${p.slice(0, 3)} ${p.slice(3, 5)} ${p.slice(5)}`;

/** The course words a phone number is said with. */
export const phoneWords = (p) => [...new Set([...[...p.slice(0, 3)].flatMap((d) => wordsOf(Number(d))), ...wordsOf(Number(p.slice(3, 5))), ...wordsOf(Number(p.slice(5)))])];

/** Wrong options for a phone number: the pairs swapped, a pair that sounds alike, a digit changed. */
export function phoneConfusables(p) {
  const a = Number(p.slice(3, 5));
  const b = Number(p.slice(5));
  const pad = (n) => String(n).padStart(2, '0');
  const twin = (n) => confusables(n).find((x) => x >= 10) ?? n;
  const d = Number(p[1]);
  const cands = [
    `${p.slice(0, 3)}${pad(b)}${pad(a)}`,
    `${p.slice(0, 3)}${pad(twin(a))}${pad(b)}`,
    `${p.slice(0, 3)}${pad(a)}${pad(twin(b))}`,
    `${p[0]}${d === 9 ? 8 : d + 1}${p.slice(2)}`,
  ];
  return [...new Set(cands)].filter((x) => x !== p);
}

/** Every text the number exercises can play, for the audio build. */
export function allTexts() {
  const texts = new Set();
  for (let n = 1; n < 100; n++) texts.add(say(n));
  for (const [, form] of Object.values(ORDINAL)) texts.add(form);
  for (const p of allPhones()) texts.add(phoneSay(p));
  return [...texts];
}
