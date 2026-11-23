// The TÖLVA cast: seven characters drawn by scripts/characters/*.mjs into assets/characters/
// (node scripts/build-characters.mjs). Each has four expressions, animated, with a still copy of
// each file for Calm mode. Tala stays the app's mascot; the cast hosts the units and speaks in the
// stories. Which character hosts a unit, and what they say there, is in the unit file:
// "host": { "character": "lundi", "says": "<Tatoeba sentence id>" }. A dialogue story names its
// speakers in "cast": { "A": "katla" }. Pure data and functions, so scripts and pages share it.

import { unitDone } from './engine/course-model.js';

export const EXPRESSIONS = ['happy', 'cheer', 'thinking', 'sorry'];

export const CAST = [
  { id: 'lundi', name: 'Lundi', kind: { en: 'A puffin', nb: 'En lundefugl' } },
  { id: 'torfi', name: 'Torfi', kind: { en: 'A talking turf house', nb: 'Et snakkende torvhus' } },
  { id: 'amma', name: 'Amma Sigga', kind: { en: 'A grandmother', nb: 'En bestemor' } },
  { id: 'elias', name: 'Elias', kind: { en: 'A learner from Norway', nb: 'En elev fra Norge' } },
  { id: 'hekla', name: 'Hekla', kind: { en: 'A talking volcano', nb: 'En snakkende vulkan' } },
  { id: 'jonas', name: 'Jónas', kind: { en: 'A fisherman', nb: 'En fisker' } },
  { id: 'katla', name: 'Katla', kind: { en: 'A student', nb: 'En student' } },
];

export const character = (id) => CAST.find((c) => c.id === id) ?? null;

/** The character who hosts a unit (a unit from the course model), or null. */
export const hostOf = (unit) => (unit?.host ? character(unit.host.character) : null);

/**
 * Every cast member with the first unit they host. A character becomes a friend when that unit is
 * finished (or skipped by the placement test).
 * @returns {{ id: string, name: string, kind: object, unit: object|null, friend: boolean }[]}
 */
export function friends(course, progress) {
  return CAST.map((c) => {
    const unit = course.units.find((u) => u.host?.character === c.id) ?? null;
    return { ...c, unit, friend: Boolean(unit && unitDone(unit, progress)) };
  });
}

/** The character who becomes a friend by finishing this unit, or null. */
export function befriendedBy(course, unit) {
  const host = hostOf(unit);
  return host && course.units.find((u) => u.host?.character === host.id) === unit ? host : null;
}

/** Path of a character file. still: the copy without animation (Calm mode, reduced motion). */
export const characterSrc = (id, expr = 'happy', still = false) => `assets/characters/${id}-${expr}${still ? '-still' : ''}.svg`;
