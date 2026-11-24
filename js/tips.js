// Tala's tip in the side panel: one guidebook section a day from the learner's current unit (or
// the nearest earlier unit with a guidebook), as its title and first sentence with a link to the
// rest. The guidebooks' claims are sourced in content/CLAIMS.md, so the tips need no new ones.

import { hashSeed } from './engine/rng.js';

/** The day's section: { unit, index, section }, or null when no unit up to this one has a guidebook. */
export function dailyTip(course, unitId, day) {
  for (let k = course.units.findIndex((u) => u.id === unitId); k >= 0; k--) {
    const unit = course.units[k];
    const sections = unit.guide?.sections ?? [];
    if (sections.length) {
      const index = hashSeed(`tip:${day}`) % sections.length;
      return { unit, index, section: sections[index] };
    }
  }
  return null;
}

/** The first sentence of guidebook prose; a full stop inside {is:...} does not end it. */
export function firstSentence(text) {
  let depth = 0;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '{') depth++;
    else if (c === '}') depth = Math.max(0, depth - 1);
    else if (depth === 0 && /[.!?]/.test(c) && (i === text.length - 1 || /\s/.test(text[i + 1]))) return text.slice(0, i + 1);
  }
  return text;
}
