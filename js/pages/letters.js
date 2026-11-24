// Letters and sounds (Stafirnir): the 32 letters in Icelandic order and the spellings that sound
// different from Norwegian, from content/letters.json. Each tile shows how well the learner knows
// it (its "letter|x" card, js/engine/letters.js); tapping it opens its name, sound, comparison with
// Norwegian and example words, with audio. The drill is lesson.html?mode=alphabet.

import { ready } from '../app.js';
import { pick, t } from '../i18n.js';
import { gloss, loadLexicon, loadRecordings, recordings } from '../data.js';
import { cards } from '../progress.js';
import { MAX_BOX } from '../srs.js';
import { isLetterKey, isWeak, letterOf } from '../engine/letters.js';
import { itemLabel, loadLetters } from '../letters.js';
import { play, ttsCredit } from '../audio.js';
import { icon } from '../shell.js';

await ready;
const [{ content, items }, lexicon, list] = await Promise.all([loadLetters(), loadLexicon(), cards(), loadRecordings()]);
const $ = (sel) => document.querySelector(sel);
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

const card = new Map(list.filter((c) => isLetterKey(c.key)).map((c) => [letterOf(c.key), c]));
const RELATIONS = ['new', 'other', 'close', 'same'];
const glyphs = (item) => (content.letters.includes(item) ? `${item.id.toLocaleUpperCase('is')} ${item.id}` : itemLabel(item, pick));

// How well an item is known, from its card's Leitner box: 0 (not practiced) to MAX_BOX.
const level = (id) => card.get(id)?.box ?? 0;
function ring(id) {
  const r = 9;
  const c = 2 * Math.PI * r;
  const frac = level(id) / MAX_BOX;
  return `<svg class="letter-ring" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle class="letter-ring__track" cx="12" cy="12" r="${r}"/>
    <circle class="letter-ring__value" cx="12" cy="12" r="${r}" stroke-dasharray="${(frac * c).toFixed(1)} ${c.toFixed(1)}"/></svg>`;
}
const knownText = (id) => (card.has(id) ? t('letters.level', { n: level(id), max: MAX_BOX }) : t('letters.notYet'));

// The button's name is its visible text (letter, name, comparison) and, for screen readers, its progress.
function tile(item) {
  const name = item.name ? `<span class="letter-tile__name" lang="is">${esc(item.name)}</span>` : '';
  return `<li><button type="button" class="letter-tile" data-item="${esc(item.id)}" data-nb="${item.nb}" aria-haspopup="dialog">
      ${ring(item.id)}<span class="letter-tile__glyph" lang="is">${esc(glyphs(item))}</span>${name}
      <span class="letter-tile__tag">${t(`letters.nb.${item.nb}`)}</span><span class="visually-hidden">, ${knownText(item.id)}</span></button></li>`;
}

$('[data-order]').textContent = pick(content.order);
$('[data-legend]').innerHTML = `<ul class="letter-legend__list" role="list">${RELATIONS.map((r) => `<li data-nb="${r}"><span class="letter-legend__mark" aria-hidden="true"></span><strong>${t(`letters.nb.${r}`)}</strong>: ${t(`letters.nbText.${r}`)}</li>`).join('')}</ul>`;
$('[data-letters]').innerHTML = content.letters.map(tile).join('');
$('[data-combos]').innerHTML = content.combos.map(tile).join('');

// Weak letters: answered, but low or often wrong.
const weak = [...card.entries()].filter(([id, c]) => items.has(id) && isWeak(c)).length;
const weakLink = $('[data-weak]');
if (weak) {
  weakLink.textContent = t('letters.practiceWeak', { n: weak });
  weakLink.hidden = false;
}

// --- The dialog of a letter -----------------------------------------------------------------------

const dialog = $('[data-letter-dialog]');
let opener = null;

function example(id) {
  const l = lexicon.lemmas[id];
  if (!l) return '';
  const rec = recordings(id)[0];
  const url = rec?.mp3 ?? rec?.ogg;
  return `<li><button type="button" class="icon-button icon-button--outline" data-play="${esc(l.lemma)}"${url ? ` data-url="${esc(url)}"` : ''} aria-label="${t('letters.playWord', { word: esc(l.lemma) })}">${icon('play')}</button>
    <span lang="is" class="learn-text">${esc(l.lemma)}</span> <span class="muted">${esc(gloss(id))}</span></li>`;
}

function openItem(id, from) {
  const item = items.get(id);
  if (!item) return;
  opener = from;
  const ipa = (item.ipa ?? []).map((x) => `[${esc(x)}]`).join(' ');
  const nameLine = item.name
    ? `<p class="letter-dialog__name"><button type="button" class="button button--sm" data-play="${esc(item.say ?? item.name)}">${icon('play')}<span>${t('letters.hearName')}</span></button>
        <span>${t('letters.name')}: <strong lang="is">${esc(item.name)}</strong></span></p>`
    : '';
  dialog.innerHTML = `<div class="letter-dialog__head">
      <h2 class="modal__title letter-dialog__glyph" id="letter-dialog-title"><span lang="is">${esc(glyphs(item))}</span></h2>
      <p class="cluster letter-dialog__sound"><span class="letter-dialog__ipa" title="IPA">${ipa}</span><span class="tag letter-tag" data-nb="${item.nb}">${t(`letters.nb.${item.nb}`)}</span></p>
      <button type="button" class="icon-button letter-dialog__close" data-close aria-label="${t('letters.close')}">${icon('close')}</button></div>
    ${nameLine}
    <p class="letter-dialog__text">${esc(pick(item.text))}</p>
    <h3 class="label">${t('letters.examples')}</h3>
    <ul class="letter-examples" role="list">${(item.examples ?? []).map(example).join('')}</ul>
    <p class="muted">${ring(id)} ${knownText(id)}</p>
    <div class="modal__actions"><a class="button button-primary" href="lesson.html?mode=alphabet&amp;focus=${encodeURIComponent(id)}">${t('letters.practiceItem', { x: esc(itemLabel(item, pick)) })}</a>
      <button type="button" class="button" data-close>${t('letters.close')}</button></div>`;
  dialog.showModal();
  dialog.querySelector('[data-play]')?.focus();
}

document.addEventListener('click', (e) => {
  const tileBtn = e.target.closest('.letter-tile');
  if (tileBtn) return openItem(tileBtn.dataset.item, tileBtn);
  const b = e.target.closest('[data-play]');
  if (b) return play({ text: b.dataset.play, url: b.dataset.url });
  if (e.target.closest('[data-close]')) dialog.close();
});
// A click on the backdrop (outside the dialog's box) closes it.
dialog.addEventListener('click', (e) => {
  if (e.target !== dialog) return;
  const r = dialog.getBoundingClientRect();
  if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) dialog.close();
});
dialog.addEventListener('close', () => opener?.focus());

// A link to a letter (letters.html#æ) opens it.
const fromHash = decodeURIComponent(location.hash.slice(1));
if (items.has(fromHash)) openItem(fromHash, document.querySelector(`.letter-tile[data-item="${CSS.escape(fromHash)}"]`));

ttsCredit().then((c) => ($('[data-voice-credit]').textContent = c));
