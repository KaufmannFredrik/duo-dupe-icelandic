// Shared building blocks for exercise modules. Every exercise module exports
// build(spec, ctx) -> { html, mount(root), ready(), check(), reveal(), pickByNumber?(n) }.
// check() and reveal() return { result?, answerHTML, audio?, why?, records? }.

import { t } from '../i18n.js';
import { icon } from '../shell.js';

export const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

export const heading = (key, vars) => `<h2 class="label" id="ex-label">${t(key, vars)}</h2>`;

/** Prompt card. audio: text for speech, or { text, url } for a recording. */
export function promptCard({ text, html, lang = 'is', audio = null }) {
  const a = audio && (typeof audio === 'string' ? { text: audio } : audio);
  const attrs = a ? `data-play="${esc(a.text)}"${a.url ? ` data-url="${esc(a.url)}"` : ''}` : '';
  const buttons = a
    ? `<div class="prompt-card__audio">
        <button type="button" class="button button--sm" ${attrs}>${icon('play')}<span>${t('audio.play')}</span></button>
        <button type="button" class="button button--sm" ${attrs} data-slow>${icon('slow')}<span>${t('audio.slow')}</span></button></div>`
    : '';
  return `<div class="card prompt-card">${buttons}<p class="prompt-card__text" lang="${lang}">${html ?? esc(text)}</p></div>`;
}

export const markIcon = (state) =>
  `<svg class="icon option__mark" aria-hidden="true"><use href="assets/icons.svg#i-${state === 'correct' ? 'check' : state === 'almost' ? 'almost' : 'wrong'}"></use></svg>`;

/** Single-select option buttons with keyboard numbers. */
export function optionsGroup(values, render, onChange) {
  let selected = null;
  let root;
  const html = `<div class="options" role="group" aria-labelledby="ex-label">${values
    .map((v, n) => `<button type="button" class="option" data-value="${esc(v)}" aria-pressed="false"><span class="option__key kbd" aria-hidden="true">${n + 1}</span>${render(v)}</button>`)
    .join('')}</div>`;
  const buttons = () => [...root.querySelectorAll('.option')];
  const choose = (btn) => {
    if (!btn || btn.disabled) return;
    selected = btn.dataset.value;
    for (const b of buttons()) b.setAttribute('aria-pressed', String(b === btn));
    onChange?.(selected);
  };
  return {
    html,
    mount(r) {
      root = r;
      for (const b of buttons()) b.addEventListener('click', () => choose(b));
    },
    pickByNumber: (n) => choose(buttons()[n - 1]),
    selected: () => selected,
    resolve(isRight) {
      for (const b of buttons()) {
        b.disabled = true;
        const state = isRight(b.dataset.value) ? 'correct' : b.dataset.value === selected ? 'wrong' : null;
        if (!state) continue;
        b.dataset.state = state;
        b.insertAdjacentHTML('beforeend', `${markIcon(state)}<span class="visually-hidden">${t(`feedback.${state}`)}</span>`);
      }
    },
  };
}

const tokenRe = /\p{L}+/gu;

const blank = () => `<span class="blank"><span class="visually-hidden">${t('ex.blank')}</span><span aria-hidden="true">${'\u00a0'.repeat(6)}</span></span>`;

/** A sentence with one word replaced (blank) or highlighted (mark), escaped for HTML. */
export function sentenceHTML(text, target, mode) {
  let out = '';
  let last = 0;
  let done = false;
  for (const m of text.matchAll(tokenRe)) {
    out += esc(text.slice(last, m.index));
    last = m.index + m[0].length;
    if (!done && m[0] === target) {
      done = true;
      out += mode === 'blank' ? blank() : `<mark class="target">${esc(m[0])}</mark>`;
    } else out += esc(m[0]);
  }
  return out + esc(text.slice(last));
}

export const wordsOf = (text) => text.match(tokenRe) ?? [];
