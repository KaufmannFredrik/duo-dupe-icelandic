// Credits: lists the Tatoeba sentences shown in the app, each with its author.

import { ready } from '../app.js';
import { loadLexicon } from '../lexicon.js';

await ready;
const lexicon = await loadLexicon();
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

document.querySelector('[data-sentence-credits]').innerHTML = Object.entries(lexicon.sentences)
  .map(([id, s]) => `<li><span lang="is">${esc(s.is)}</span>: <a href="${s.url}" rel="noopener">Tatoeba #${id}</a> by ${esc(s.author)}. Translation: ${s.en.map((e) => `#${e.id}`).join(', ')}.</li>`)
  .join('');
