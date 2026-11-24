// Letters and sounds in the browser: content/letters.json, the minimal pairs, and the drill model
// over the course words (js/engine/letters.js). Loaded once per page.

import { loadJSON } from './app.js';
import { loadLexicon } from './data.js';
import { courseWords, itemsOf, letterModel } from './engine/letters.js';

let loading;

/** { content, pairs, items }: the letters file, content/minimal-pairs.json, and items by id. */
export function loadLetters() {
  loading ??= Promise.all([loadJSON('content/letters.json'), loadJSON('content/minimal-pairs.json')]).then(([content, pairs]) => ({
    content,
    pairs,
    items: new Map(itemsOf(content).map((x) => [x.id, x])),
  }));
  return loading;
}

/** The drill model. known: ids of the words the learner has met, which exercises prefer. */
export async function lettersModel(known = new Set()) {
  const [{ content, pairs }, lexicon] = await Promise.all([loadLetters(), loadLexicon()]);
  return letterModel(content, courseWords(lexicon, known), pairs);
}

/** How an item is written on screen: the letter, or a combination's label in the app language. */
export const itemLabel = (item, pick) => (item.label && typeof item.label === 'object' ? pick(item.label) : item.label ?? item.id);
