// Case trainer: the full paradigm of any course word (nouns, adjectives, pronouns, numerals,
// verbs). Practice mode reveals the table progressively: level 1 hides a third of the cells,
// level 2 two thirds, level 3 all of them. Every checked cell counts for spaced repetition.

import { ready } from '../app.js';
import { t } from '../i18n.js';
import { caseRules, gloss, lemma, loadAll, loadLexicon, recordings } from '../data.js';
import { tableKind, parseTag } from '../grammar.js';
import { grade } from '../normalize.js';
import { getSettings } from '../store.js';
import { addXP, recordAttempt } from '../progress.js';
import { celebrate } from '../ui/celebrate.js';
import { play } from '../audio.js';
import { sfx } from '../sfx.js';
import { icon } from '../shell.js';
import { charRow } from '../ui/charrow.js';
import { caseTag, classLabel, genderLabel } from '../ui/forms.js';
import { renderTable, tableFor } from '../ui/table.js';
import { hashSeed, rng, shuffle } from '../engine/rng.js';

await ready;
await loadAll();
const lexicon = await loadLexicon();
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const root = document.querySelector('[data-decl]');

const CLASS_ORDER = ['no', 'lo', 'pfn', 'afn', 'fn', 'to', 'rt', 'so'];
const words = Object.entries(lexicon.lemmas).filter(([wid, l]) => tableKind(l.ofl) && tableFor(wid)?.rows.some((r) => r.cells.some((c) => c.forms.length)));
const requested = new URLSearchParams(location.search).get('lemma');
const find = (w) => words.find(([wid, l]) => wid === w || l.lemma === w)?.[0];
let id = find(requested) ?? 'kaffi_no';
let level = 0;
let tense = 'NT';
let strength = 'SB';
let lastInput = null;

function picker() {
  return `<label class="field"><span class="field__label">${t('decl.word')}</span>
    <select class="select" data-word>${CLASS_ORDER.map((ofl) => {
      const list = words.filter(([, l]) => l.ofl === ofl).sort((a, b) => a[1].lemma.localeCompare(b[1].lemma, 'is'));
      return list.length ? `<optgroup label="${esc(classLabel(ofl))}">${list.map(([wid, l]) => `<option value="${wid}" lang="is"${wid === id ? ' selected' : ''}>${esc(l.lemma)}</option>`).join('')}</optgroup>` : '';
    }).join('')}</select></label>`;
}

function seg(name, options, value, legendKey) {
  return `<fieldset class="segmented"><legend class="${legendKey ? 'segmented__legend' : 'visually-hidden'}">${t(legendKey ?? `decl.${name}`)}</legend>
    ${options.map(([v, key]) => `<label><input type="radio" name="${name}" value="${v}"${v === value ? ' checked' : ''}><span>${t(key)}</span></label>`).join('')}</fieldset>`;
}

// "When is each case used?" is built from the case rules, so it matches the exercise hints.
function caseUses() {
  const rules = Object.values(caseRules());
  const triggers = (c) => [...new Set(rules.filter((r) => r.case === c && r.kind === 'preposition').map((r) => r.trigger))].map((x) => `<span lang="is">${esc(x)}</span>`).join(', ');
  return `<details class="card card--quiet case-uses"><summary>${t('decl.uses')}</summary>
    <dl>
      <dt>${caseTag('NF')}</dt><dd>${t('decl.useNF')}</dd>
      <dt>${caseTag('ÞF')}</dt><dd>${t('decl.useTHF')} ${triggers('ÞF')}</dd>
      <dt>${caseTag('ÞGF')}</dt><dd>${t('decl.useTHGF')} ${triggers('ÞGF')}</dd>
      <dt>${caseTag('EF')}</dt><dd>${t('decl.useEF')} ${triggers('EF')}</dd>
    </dl><p class="credit">${t('decl.usesNote')}</p></details>`;
}

function blanksFor() {
  if (!level) return new Set();
  const tags = tableFor(id, { tense, strength }).rows.flatMap((r) => r.cells.filter((c) => c.forms.length).map((c) => c.tag));
  const n = level === 3 ? tags.length : Math.ceil((tags.length * level) / 3);
  return new Set(shuffle(tags, rng(hashSeed(`${id}${level}${tense}${strength}`))).slice(0, n));
}

function render() {
  const l = lemma(id);
  const kind = tableKind(l.ofl);
  const rec = recordings(id)[0];
  const multiNumber = ['noun', 'adjective', 'gendered'].includes(kind) && tableFor(id).groups.length > 1;
  root.innerHTML = `<div class="decl-head">
      <div class="decl-word"><span class="decl-word__lemma" lang="is">${esc(l.lemma)}</span>
        ${l.kyn ? `<span class="tag tag--gender">${genderLabel(l.kyn)}</span>` : ''}<span class="tag tag--pos">${esc(classLabel(l.ofl))}</span>
        ${l.ipa[0] ? `<span class="muted">${esc(l.ipa[0])}</span>` : ''}
        <button type="button" class="icon-button icon-button--outline" data-play="${esc(l.lemma)}" ${rec ? `data-url="${esc(rec.mp3 ?? rec.ogg)}"` : ''} aria-label="${t('audio.playWord', { word: esc(l.lemma) })}">${icon('play')}</button></div>
      <p class="muted">${esc(gloss(id))}</p>
    </div>
    <div class="decl-controls">
      ${picker()}
      ${kind === 'verb' ? seg('tense', [['NT', 'tense.present'], ['ÞT', 'tense.past']], tense) : ''}
      ${kind === 'adjective' ? seg('strength', [['SB', 'decl.strong'], ['VB', 'decl.weak']], strength) : ''}
      ${multiNumber ? `<div class="decl-number">${seg('number', [['sg', 'number.sg'], ['pl', 'number.pl']], 'sg')}</div>` : ''}
      ${seg('level', [['0', 'decl.look'], ['1', 'decl.level1'], ['2', 'decl.level2'], ['3', 'decl.level3']], String(level), 'decl.practice')}
    </div>
    <div data-table>${renderTable(id, { blanks: blanksFor(), tense, strength })}</div>
    <div class="stack" data-tools ${level ? '' : 'hidden'}><div data-charrow></div>
      <div class="cluster"><button type="button" class="button button-primary" data-check-table>${t('decl.check')}</button><p class="muted" data-score role="status"></p></div></div>
    ${['noun', 'adjective', 'pronoun', 'gendered'].includes(kind) ? caseUses() : ''}
    <p class="credit">${t('credit.bin')}</p>`;
  if (level) root.querySelector('[data-charrow]').replaceWith(charRow(() => lastInput ?? root.querySelector('.decl__input')));
}

render();

root.addEventListener('change', (e) => {
  const el = e.target;
  if (el.matches('[data-word]')) {
    id = el.value;
    history.replaceState(null, '', `?lemma=${encodeURIComponent(lemma(id).lemma)}`);
    render();
    root.querySelector('[data-word]').focus();
  } else if (el.name === 'number') root.querySelector('.decl').dataset.number = el.value;
  else if (['level', 'tense', 'strength'].includes(el.name)) {
    if (el.name === 'level') level = Number(el.value);
    if (el.name === 'tense') tense = el.value;
    if (el.name === 'strength') strength = el.value;
    render();
    root.querySelector(`input[name="${el.name}"]:checked`)?.focus();
  }
});
root.addEventListener('focusin', (e) => {
  if (e.target.matches('.decl__input')) lastInput = e.target;
});
root.addEventListener('click', async (e) => {
  const b = e.target.closest('[data-play]');
  if (b) play({ text: b.dataset.play, url: b.dataset.url });
  if (!e.target.closest('[data-check-table]')) return;
  const inputs = [...root.querySelectorAll('.decl__input')];
  let right = 0;
  let xp = 0;
  for (const input of inputs) {
    const answers = input.dataset.answers.split('|');
    const g = grade(input.value, answers, { strict: getSettings().strict });
    input.dataset.state = g.result;
    input.readOnly = true;
    input.setAttribute('aria-invalid', String(g.result === 'wrong'));
    input.closest('td').querySelector('.decl__mark')?.remove();
    const mark = g.result === 'correct' ? 'check' : g.result === 'almost' ? 'almost' : 'wrong';
    input.insertAdjacentHTML('afterend', `<span class="decl__mark decl__mark--${g.result}">${icon(mark, 'icon icon--sm')}<span>${g.result === 'correct' ? t('feedback.correct') : `<span lang="is">${esc(answers[0])}</span>`}</span></span>`);
    if (g.result !== 'wrong') right++;
    xp += g.result === 'correct' ? 2 : g.result === 'almost' ? 1 : 0;
    const p = parseTag(input.dataset.tag);
    await recordAttempt({ key: `${id}|${input.dataset.tag}`, result: g.result, meta: { case: p.case, number: p.number, gender: p.gender ?? lemma(id).kyn } });
  }
  root.querySelector('[data-score]').textContent = `${t('decl.score', { right, total: inputs.length })}${xp ? ` +${xp} XP` : ''}`;
  sfx(right === inputs.length ? 'correct' : 'almost');
  celebrate(await addXP(xp));
});
