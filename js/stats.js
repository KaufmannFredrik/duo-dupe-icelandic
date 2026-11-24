// Pure progress statistics, shared by the shell, the profile and the tests: local day keys, the
// streak with streak freezes, badges and the weak-spot cells. No storage and no DOM here.

/** The learner's local calendar day as YYYY-MM-DD. */
export function dayKey(now = Date.now()) {
  const d = new Date(now);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** A day key moved by n days (calendar arithmetic in UTC, so daylight saving cannot skip a day). */
export function addDays(key, n) {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
}

export const MAX_FREEZES = 2;
export const FREEZE_EVERY = 7; // one freeze for every seven days of streak

const active = (days, key) => (days[key] ?? 0) > 0;

/**
 * Current streak: consecutive active days ending today, or yesterday when today has no XP yet.
 * A frozen day keeps the streak alive but does not add to it.
 */
export function streakOf(days, frozen = [], today = dayKey()) {
  const ice = new Set(frozen);
  let key = active(days, today) ? today : addDays(today, -1);
  let n = 0;
  for (let guard = 0; guard < 10000; guard++) {
    if (active(days, key)) n++;
    else if (!ice.has(key)) break;
    key = addDays(key, -1);
  }
  return n;
}

/**
 * Spends streak freezes on the days missed since the last active (or frozen) day, but only when
 * there are enough freezes to cover the whole gap. Returns the updated { freezes, frozen } and
 * whether anything changed. Idempotent: a frozen day is not frozen twice.
 */
export function settleFreezes({ days, frozen = [], freezes = 0 }, today = dayKey()) {
  const marked = [...Object.keys(days).filter((k) => active(days, k)), ...frozen].sort();
  const last = marked.at(-1);
  if (!last || last >= addDays(today, -1)) return { freezes, frozen, changed: false };
  const gap = [];
  for (let key = addDays(last, 1); key < today; key = addDays(key, 1)) gap.push(key);
  if (gap.length > freezes || streakOf(days, frozen, last) === 0) return { freezes, frozen, changed: false };
  return { freezes: freezes - gap.length, frozen: [...frozen, ...gap], changed: true };
}

/** Freezes earned when a streak grows from `before` to `after` days. */
export function freezesEarned(before, after) {
  return Math.floor(after / FREEZE_EVERY) - Math.floor(before / FREEZE_EVERY);
}

/** The last n days, oldest first, with their state for the streak calendar. */
export function recentDays(days, frozen = [], goal = 20, n = 7, today = dayKey()) {
  const ice = new Set(frozen);
  return Array.from({ length: n }, (_, i) => {
    const key = addDays(today, i - n + 1);
    const xp = days[key] ?? 0;
    return { key, xp, state: xp >= goal ? 'goal' : xp > 0 ? 'active' : ice.has(key) ? 'frozen' : 'none' };
  });
}

// Badges: id, icon, and the test over a summary of the learner's progress.
export const BADGES = [
  { id: 'first', icon: 'star', earned: (s) => s.lessonsDone >= 1 },
  { id: 'streak3', icon: 'streak', earned: (s) => s.best >= 3 },
  { id: 'streak7', icon: 'streak', earned: (s) => s.best >= 7 },
  { id: 'perfect', icon: 'trophy', earned: (s) => s.perfect >= 1 },
  { id: 'unit', icon: 'check', earned: (s) => s.unitsDone >= 1 },
  { id: 'tables', icon: 'table', earned: (s) => s.formsRight >= 100 },
  { id: 'sounds', icon: 'sound-wave', earned: (s) => s.soundsDone >= 1 },
  { id: 'xp1000', icon: 'xp', earned: (s) => s.xp >= 1000 },
];

const isFormRight = (a) => a.result === 'correct' && a.key && !a.key.endsWith('|meaning');

/**
 * All-time counts of answers, kept as a running total (js/progress.js "tally") because the attempt
 * log keeps only the newest answers. Computed from a log when there is no total yet.
 */
export function tallyOf(attempts = []) {
  return { answered: attempts.length, right: attempts.filter((a) => a.result !== 'wrong').length, formsRight: attempts.filter(isFormRight).length };
}

/** The tally after one more answer. */
export function addToTally(tally, attempt) {
  const t = tally ?? tallyOf();
  return { answered: t.answered + 1, right: t.right + (attempt.result !== 'wrong' ? 1 : 0), formsRight: t.formsRight + (isFormRight(attempt) ? 1 : 0) };
}

/**
 * Counts used by the badges and the profile, from progress and the answer tally (or, when none is
 * given, the attempt log).
 */
export function summarize(p, attempts = [], today = dayKey(), tally = tallyOf(attempts)) {
  const lessons = Object.entries(p.lessons ?? {});
  const { answered, right } = tally;
  const streak = streakOf(p.days ?? {}, p.frozen, today);
  return {
    xp: p.xp ?? 0,
    streak,
    best: Math.max(p.best ?? 0, streak),
    freezes: p.freezes ?? 0,
    today: (p.days ?? {})[today] ?? 0,
    lessonsDone: lessons.filter(([k, l]) => l.done && !k.startsWith('practice/') && k !== 'placement').length,
    unitsDone: lessons.filter(([k, l]) => l.done && k.endsWith('/review')).length,
    perfect: lessons.filter(([, l]) => l.best === 1).length,
    soundsDone: p.lessons?.['practice/sounds']?.times ?? 0,
    formsRight: tally.formsRight,
    accuracy: answered ? right / answered : null,
    answered,
  };
}

export const MIN_ANSWERS = 3;

/**
 * Accuracy per grammatical cell from the attempt log. keyOf picks the cell, for example
 * (a) => `${a.case}|${a.number}`; attempts without a case or number are skipped.
 * @returns {Map<string, { right: number, total: number, lemmas: Map<string, number> }>}
 */
export function heatCells(attempts, keyOf) {
  const cells = new Map();
  for (const a of attempts) {
    if (!a.case || !a.number) continue;
    const key = keyOf(a);
    if (!key) continue;
    const c = cells.get(key) ?? { right: 0, total: 0, lemmas: new Map() };
    c.total++;
    if (a.result !== 'wrong') c.right++;
    else {
      const id = a.key.split('|')[0];
      c.lemmas.set(id, (c.lemmas.get(id) ?? 0) + 1);
    }
    cells.set(key, c);
  }
  return cells;
}

export const heatLevel = (pct) => (pct >= 85 ? 'strong' : pct >= 65 ? 'ok' : 'weak');
