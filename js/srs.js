// Spaced repetition with Leitner boxes. A card is one item to remember: a word's meaning
// ("hestur_no|meaning") or a single inflected form ("hestur_no|ÞGFET"), so practice targets the
// exact form that is weak. Pure functions: storage lives in db.js.

const MINUTE = 60_000;
const DAY = 24 * 60 * MINUTE;

// Box 0 is new. Each correct answer moves a card up one box.
export const INTERVALS = [0, 1 * DAY, 2 * DAY, 4 * DAY, 8 * DAY, 16 * DAY, 32 * DAY, 64 * DAY];
export const MAX_BOX = INTERVALS.length - 1;
export const RETRY_AFTER = 10 * MINUTE;

export const cardKey = (lemmaId, part = 'meaning') => `${lemmaId}|${part}`;

export function newCard(key, now = Date.now()) {
  return { key, box: 0, due: now, seen: 0, correct: 0, wrong: 0, last: null };
}

/**
 * @param {object} card
 * @param {'correct'|'almost'|'wrong'} result
 * @param {number} [now]
 */
export function review(card, result, now = Date.now()) {
  const next = { ...card, seen: card.seen + 1, last: now };
  if (result === 'correct') {
    next.box = Math.min(card.box + 1, MAX_BOX);
    next.correct = card.correct + 1;
    next.due = now + INTERVALS[next.box];
  } else if (result === 'almost') {
    // Not wrong, but not secure yet: keep the box and come back after the shorter interval.
    next.box = Math.max(card.box, 1);
    next.due = now + INTERVALS[Math.max(next.box - 1, 1)];
  } else {
    next.box = 1;
    next.wrong = card.wrong + 1;
    next.due = now + RETRY_AFTER;
  }
  return next;
}

export const isDue = (card, now = Date.now()) => card.due <= now;

/** Due cards first (most overdue first), then the weakest. */
export function dueCards(cards, now = Date.now(), limit = Infinity) {
  return cards
    .filter((c) => isDue(c, now))
    .sort((a, b) => a.due - b.due || a.box - b.box)
    .slice(0, limit);
}

/** 0 (new or just failed) to 1 (top box), for progress displays. */
export const strength = (card) => (card ? card.box / MAX_BOX : 0);

/** Accuracy over the attempts on a card, or null without attempts. */
export const accuracy = (card) => (card && card.correct + card.wrong ? card.correct / (card.correct + card.wrong) : null);
