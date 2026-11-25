// Credits: everyone whose sentences and recordings appear in the app, from the data files.

import { ready } from '../app.js';
import { t } from '../i18n.js';
import { loadAll } from '../data.js';

await ready;
const { sentences, audio } = await loadAll();
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

const authors = new Map();
for (const s of Object.values(sentences)) {
  const name = s.author ?? t('credit.unknownAuthor');
  authors.set(name, (authors.get(name) ?? 0) + 1);
}
document.querySelector('[data-tatoeba-summary]').textContent = t('credits.tatoebaSummary', { sentences: Object.keys(sentences).length, authors: authors.size, made: Object.values(sentences).filter((s) => s.from).length });
document.querySelector('[data-tatoeba-authors]').innerHTML = [...authors]
  .sort((a, b) => b[1] - a[1])
  .map(([name, n]) => `<span>${esc(name)} (${n})</span>`)
  .join(', ');

const speakers = new Map();
for (const recs of Object.values(audio)) {
  for (const r of recs) {
    const key = `${r.speaker ?? '?'}|${r.license}`;
    speakers.set(key, (speakers.get(key) ?? 0) + 1);
  }
}
document.querySelector('[data-speakers]').innerHTML = [...speakers]
  .sort((a, b) => b[1] - a[1])
  .map(([k, n]) => {
    const [name, license] = k.split('|');
    return `<span>${esc(name)}, ${esc(license)} (${n})</span>`;
  })
  .join('; ');
