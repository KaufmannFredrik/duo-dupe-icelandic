// Answer normalization and grading for typed Icelandic.
// correct: matches after NFC, case, whitespace and punctuation normalization.
// almost:  only missing acute accents, or (in early units) ASCII stand-ins for special
//          letters: th for þ, d for ð, ae for æ, o for ö.
// Strict mode counts missing accents as wrong, because accents change words (ar/ár, for/fór).

const PUNCT = /[.,!?;:"'“”„‟«»‹›()[\]{}…¿¡\u2013\u2014-]/g;
const ACUTE = { á: 'a', é: 'e', í: 'i', ó: 'o', ú: 'u', ý: 'y' };
const SPECIAL = { þ: 'th', ð: 'd', æ: 'ae', ö: 'o' };

export function normalize(s) {
  return String(s ?? '')
    .normalize('NFC')
    .toLocaleLowerCase('is')
    .replace(PUNCT, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export const stripAcutes = (s) => s.replace(/[áéíóúý]/g, (c) => ACUTE[c]);
export const foldSpecials = (s) => s.replace(/[þðæö]/g, (c) => SPECIAL[c]);
export const foldAscii = (s) => foldSpecials(stripAcutes(s));

/**
 * @param {string} input what the learner typed
 * @param {string[]} answers accepted answers; the first is shown as the correction
 * @param {{ strict?: boolean, early?: boolean }} [options] early: ASCII stand-ins count as almost
 * @returns {{ result: 'correct'|'almost'|'wrong', answer: string, reason?: 'accents'|'letters'|'letters+accents' }}
 */
export function grade(input, answers, { strict = false, early = true } = {}) {
  const got = normalize(input);
  const wants = answers.map((a) => [a, normalize(a)]);
  if (!got) return { result: 'wrong', answer: answers[0] };
  for (const [a, w] of wants) if (w === got) return { result: 'correct', answer: a };
  for (const [a, w] of wants) {
    if (stripAcutes(w) === stripAcutes(got)) return { result: strict ? 'wrong' : 'almost', answer: a, reason: 'accents' };
  }
  if (early) {
    for (const [a, w] of wants) {
      if (foldAscii(w) !== foldAscii(got)) continue;
      const accents = foldSpecials(w) !== foldSpecials(got);
      if (strict && accents) return { result: 'wrong', answer: a, reason: 'letters+accents' };
      return { result: 'almost', answer: a, reason: accents ? 'letters+accents' : 'letters' };
    }
  }
  return { result: 'wrong', answer: answers[0] };
}

/**
 * Special letters and accented vowels of the answer that the input is missing, with the plain
 * letters that were probably typed instead: missingLetters('Gódan', 'Góðan') -> [['ð', 'd']].
 */
export function missingLetters(input, answer) {
  const got = normalize(input);
  const want = normalize(answer);
  const count = (s, c) => [...s].filter((x) => x === c).length;
  const missing = [...want].filter((c) => (c in SPECIAL || c in ACUTE) && count(got, c) < count(want, c));
  return [...new Set(missing)].map((c) => [c, SPECIAL[c] ?? ACUTE[c]]);
}

/** Splits a sentence into lowercase word tokens, dropping punctuation. */
export const words = (s) => normalize(s).split(' ').filter(Boolean);

/**
 * How much of a target sentence a speech transcript contains, word by word, in order (longest
 * common subsequence of normalized words). Numbers written as digits never match, because the
 * course teaches the words. Used by the speaking practice.
 * @returns {{ score: number, marks: boolean[] }} marks[i]: target word i was heard
 */
export function matchWords(heard, target) {
  const a = words(heard);
  const b = words(target);
  const dp = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
  for (let i = a.length - 1; i >= 0; i--) {
    for (let j = b.length - 1; j >= 0; j--) dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
  }
  const marks = new Array(b.length).fill(false);
  for (let i = 0, j = 0; i < a.length && j < b.length; ) {
    if (a[i] === b[j]) {
      marks[j] = true;
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) i++;
    else j++;
  }
  return { score: b.length ? dp[0][0] / b.length : 0, marks };
}

/** The best of several transcripts for a target. */
export function bestMatch(transcripts, target) {
  let best = { heard: transcripts[0] ?? '', score: 0, marks: words(target).map(() => false) };
  for (const heard of transcripts) {
    const m = matchWords(heard, target);
    if (m.score > best.score) best = { heard, ...m };
  }
  return best;
}
