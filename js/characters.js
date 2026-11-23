// The TÖLVA cast: seven characters drawn by scripts/characters/*.mjs into assets/characters/
// (node scripts/build-characters.mjs). Each has four expressions, animated, with a still copy of
// each file for Calm mode. Tala stays the app's mascot; the cast hosts the units and speaks in the
// stories. Pure data and paths, so the build script (Node) and the pages share it.

export const EXPRESSIONS = ['happy', 'cheer', 'thinking', 'sorry'];

/**
 * hosts: the units each character hosts, in course order (unit ids from content/units/).
 * The first unit a character hosts is where the learner meets them.
 */
export const CAST = [
  { id: 'lundi', name: 'Lundi', kind: { en: 'A puffin', nb: 'En lundefugl' }, hosts: ['hello'] },
  { id: 'torfi', name: 'Torfi', kind: { en: 'A talking turf house', nb: 'Et snakkende torvhus' }, hosts: ['cafe', 'shopping'] },
  { id: 'amma', name: 'Amma Sigga', kind: { en: 'A grandmother', nb: 'En bestemor' }, hosts: ['family'] },
  { id: 'elias', name: 'Elias', kind: { en: 'A learner from Norway', nb: 'En elev fra Norge' }, hosts: ['around', 'grammar'] },
  { id: 'hekla', name: 'Hekla', kind: { en: 'A talking volcano', nb: 'En snakkende vulkan' }, hosts: ['time'] },
  { id: 'jonas', name: 'Jónas', kind: { en: 'A fisherman', nb: 'En fisker' }, hosts: ['weather'] },
  { id: 'katla', name: 'Katla', kind: { en: 'A student', nb: 'En student' }, hosts: ['study', 'newwords'] },
];

export const character = (id) => CAST.find((c) => c.id === id) ?? null;

/** The character who hosts a unit, or null. */
export const hostOf = (unitId) => CAST.find((c) => c.hosts.includes(unitId)) ?? null;

/** Path of a character file. still: the copy without animation (Calm mode, reduced motion). */
export const characterSrc = (id, expr = 'happy', still = false) => `assets/characters/${id}-${expr}${still ? '-still' : ''}.svg`;
