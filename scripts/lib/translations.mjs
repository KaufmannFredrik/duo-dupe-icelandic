// Bokmål translations written for TÖLVA (content/translations-nb.json), for Tatoeba sentences
// that have no Bokmål translation on Tatoeba. In data/sentences.json such a sentence gets
// nb: [text] and nbBy: 'tolva'; a Tatoeba translation always wins.

export const HAND_NB = 'content/translations-nb.json';

/**
 * Puts the hand translations into the sentences of data/sentences.json (mutates them). Earlier
 * hand translations are replaced, so removing one from the content file removes it here too.
 * @param {Record<string, { nb: string[], nbBy?: string }>} sentences
 * @param {Record<string, string>} hand sentence id -> Bokmål text
 * @returns {number} how many sentences got a hand translation
 */
export function applyHandNb(sentences, hand) {
  let added = 0;
  for (const [id, s] of Object.entries(sentences)) {
    if (s.nbBy === 'tolva') {
      s.nb = [];
      delete s.nbBy;
    }
    if (hand[id] && !s.nb.length) {
      s.nb = [hand[id]];
      s.nbBy = 'tolva';
      added++;
    }
  }
  return added;
}
