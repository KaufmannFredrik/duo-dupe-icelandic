// Bokmål written for TÖLVA where the sources have none: sentence translations
// (content/translations-nb.json) for Tatoeba sentences without a Bokmål translation, and word
// glosses (content/glosses-nb.json) for course words Wiktionary gives none for. In /data they are
// marked nbBy: 'tolva'; a Tatoeba translation or Wiktionary gloss always wins.

import { gzipSync } from 'node:zlib';

export const HAND_NB = 'content/translations-nb.json';
export const HAND_GLOSSES = 'content/glosses-nb.json';

export const TOLVA_SOURCE = {
  id: 'tolva',
  name: 'Bokmål translations and glosses written for TÖLVA',
  url: 'content/translations-nb.json, content/glosses-nb.json',
  license: 'CC BY 4.0',
  changes: 'Written by hand only where Tatoeba (sentences) or Wiktionary (word glosses) has no Bokmål; every word is checked against Bokmålsordboka. Marked "nbBy": "tolva".',
};

/**
 * Puts hand-written Bokmål into records (sentences of data/sentences.json or lemmas of
 * data/lexicon.json; mutates them). Earlier hand entries are replaced, so removing one from the
 * content file removes it here too.
 * @param {Record<string, { nb: string[], nbBy?: string }>} records
 * @param {Record<string, string|string[]>} hand id -> text (a sentence) or list (word glosses)
 * @returns {number} how many records got hand-written Bokmål
 */
export function applyHandNb(records, hand) {
  let added = 0;
  for (const [id, r] of Object.entries(records)) {
    if (r.nbBy === 'tolva') {
      r.nb = [];
      delete r.nbBy;
    }
    if (hand[id] && !r.nb.length) {
      r.nb = Array.isArray(hand[id]) ? [...hand[id]] : [hand[id]];
      r.nbBy = 'tolva';
      added++;
    }
  }
  return added;
}

/** Notes in data/SOURCES.json that a data file holds TÖLVA's own Bokmål, with its new size. */
export function noteTolvaSource(sources, rel, text) {
  const file = sources.files?.[rel];
  if (file) {
    file.bytes = Buffer.byteLength(text);
    file.gzip = gzipSync(text).length;
    if (!file.sources.includes('tolva')) file.sources.push('tolva');
  }
  if (!sources.sources.some((s) => s.id === 'tolva')) sources.sources.push(TOLVA_SOURCE);
}
