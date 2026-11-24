// Bokmål written for TÖLVA: sentence translations (content/translations-nb.json) for Tatoeba
// sentences without a Bokmål translation, word glosses (content/glosses-nb.json "glosses") for
// course words Wiktionary gives none for, and corrections (its "fixes") of Wiktionary glosses that
// are wrong. In /data they are marked nbBy: 'tolva'; a corrected word keeps Wiktionary's list as
// nbWas, so removing the correction from content/ brings it back. A Tatoeba translation always wins.

import { gzipSync } from 'node:zlib';

export const HAND_NB = 'content/translations-nb.json';
export const HAND_GLOSSES = 'content/glosses-nb.json';

export const TOLVA_SOURCE = {
  id: 'tolva',
  name: 'Bokmål translations and glosses written for TÖLVA',
  url: 'content/translations-nb.json, content/glosses-nb.json',
  license: 'CC BY 4.0',
  changes: 'Written by hand where Tatoeba (sentences) or Wiktionary (word glosses) has no Bokmål, and in place of Wiktionary glosses that are wrong (the original is kept as "nbWas"); every word is checked against Bokmålsordboka. Marked "nbBy": "tolva".',
};

/**
 * Puts hand-written Bokmål into records (sentences of data/sentences.json or lemmas of
 * data/lexicon.json; mutates them). Earlier hand entries are undone first, so changing or
 * removing one in the content file changes it here too.
 * @param {Record<string, { nb: string[], nbBy?: string, nbWas?: string[] }>} records
 * @param {Record<string, string|string[]>} hand id -> text (a sentence) or list (word glosses), used
 *   where the source has no Bokmål
 * @param {Record<string, { nb: string[] }>} [fixes] id -> a list that replaces the source's (word glosses)
 * @returns {number} how many records got hand-written Bokmål
 */
export function applyHandNb(records, hand, fixes = {}) {
  let added = 0;
  for (const [id, r] of Object.entries(records)) {
    if (r.nbWas) {
      r.nb = r.nbWas;
      delete r.nbWas;
      delete r.nbBy;
    } else if (r.nbBy === 'tolva') {
      r.nb = [];
      delete r.nbBy;
    }
    if (fixes[id] && r.nb.length) {
      r.nbWas = r.nb;
      r.nb = [...fixes[id].nb];
      r.nbBy = 'tolva';
      added++;
    } else if (hand[id] && !r.nb.length) {
      r.nb = Array.isArray(hand[id]) ? [...hand[id]] : [hand[id]];
      r.nbBy = 'tolva';
      added++;
    }
  }
  return added;
}

/** The Bokmål glosses Wiktionary gives for a word of data/lexicon.json (empty if none). */
export const wiktionaryNb = (l) => l.nbWas ?? (l.nbBy === 'tolva' ? [] : l.nb ?? []);

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
