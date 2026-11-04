// The Norwegian bridge in the browser: Bokmål relatives of course words (data/bridge.json, built
// by scripts/build-bridge.mjs from Bokmålsordboka and Wiktionary) and how to present them.

import { loadJSON } from './app.js';
import { t } from './i18n.js';

let bridge;
export async function loadBridge() {
  bridge ??= await loadJSON('data/bridge.json').catch(() => ({ pairs: {} }));
  return bridge;
}

export const relative = (id) => bridge?.pairs[id] ?? null;

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

/** Link to the Bokmålsordboka article (sourced pairs) or a search (look-alikes). */
export const ordbokeneUrl = (pair) => (pair.article ? `https://ordbokene.no/bm/${pair.article}` : `https://ordbokene.no/bm/search?q=${encodeURIComponent(pair.nb)}`);

/** One line on why the two words belong together, as HTML. */
export function evidenceHTML(pair) {
  if (pair.evidence === 'old-norse') return t('bridge.ev.oldNorse', { word: `<i lang="non">${esc(pair.oldNorse)}</i>` });
  if (pair.evidence === 'loan') return t('bridge.ev.loan', { language: esc(pair.loan.language), word: `<i>${esc(pair.loan.word)}</i>` });
  return t('bridge.ev.form');
}

/** The spelling patterns that turn the Icelandic word into the Norwegian one, as chips. */
export function rulesHTML(pair) {
  if (pair.rules === null) return `<span class="chip chip--static">${t('bridge.rule.other')}</span>`;
  if (!pair.rules.length) return `<span class="chip chip--static">${t('bridge.rule.same')}</span>`;
  return pair.rules.map((r) => `<span class="chip chip--static">${t(`bridge.rule.${r}`)}</span>`).join('');
}
