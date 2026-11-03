// Special-character row for typing Icelandic: þ ð æ ö á é í ó ú ý, with a shift key for
// capitals. Keys insert at the caret of the target input and keep focus there. On short
// landscape screens the row collapses behind a toggle (see layout.css).

import { t } from '../i18n.js';

const LETTERS = ['þ', 'ð', 'æ', 'ö', 'á', 'é', 'í', 'ó', 'ú', 'ý'];

// Keep sticky bars above the on-screen keyboard where the browser does not resize the layout
// (iOS Safari ignores interactive-widget=resizes-content).
let tracking = false;
function trackKeyboard() {
  if (tracking || !window.visualViewport) return;
  tracking = true;
  const vv = window.visualViewport;
  const update = () => {
    const offset = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
    document.documentElement.style.setProperty('--kb-offset', `${Math.round(offset)}px`);
  };
  vv.addEventListener('resize', update);
  vv.addEventListener('scroll', update);
}

/**
 * @param {HTMLInputElement|HTMLTextAreaElement|(() => HTMLInputElement|null)} target
 * @returns {HTMLElement} wrapper with the toggle and the row
 */
export function charRow(target) {
  trackKeyboard();
  const getInput = typeof target === 'function' ? target : () => target;
  const wrap = document.createElement('div');
  wrap.className = 'charrow-wrap';
  const id = `charrow-${Math.random().toString(36).slice(2, 8)}`;
  wrap.innerHTML = `<button type="button" class="button button--sm charrow-toggle" aria-expanded="false" aria-controls="${id}">${t('charrow.toggle')}</button>
    <div class="charrow" id="${id}" role="group" aria-label="${t('charrow.label')}" data-collapsible>
      <button type="button" class="charkey" data-shift aria-pressed="false" aria-label="${t('charrow.shift')}">⇧</button>
      ${LETTERS.map((c) => `<button type="button" class="charkey" data-char="${c}" lang="is" aria-label="${t('charrow.insert', { char: c })}">${c}</button>`).join('')}
    </div>`;
  const row = wrap.querySelector('.charrow');
  const shift = wrap.querySelector('[data-shift]');
  const toggle = wrap.querySelector('.charrow-toggle');

  toggle.addEventListener('click', () => {
    const open = row.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(open));
  });
  shift.addEventListener('click', () => {
    const on = shift.getAttribute('aria-pressed') !== 'true';
    shift.setAttribute('aria-pressed', String(on));
    for (const key of row.querySelectorAll('[data-char]')) {
      key.textContent = on ? key.dataset.char.toLocaleUpperCase('is') : key.dataset.char;
      key.setAttribute('aria-label', t('charrow.insert', { char: key.textContent }));
    }
  });
  // Pointer presses must not move focus out of the input.
  row.addEventListener('pointerdown', (e) => {
    if (e.target.closest('[data-char]')) e.preventDefault();
  });
  row.addEventListener('click', (e) => {
    const key = e.target.closest('[data-char]');
    const input = getInput();
    if (!key || !input || input.disabled) return;
    const start = input.selectionStart ?? input.value.length;
    const end = input.selectionEnd ?? input.value.length;
    input.setRangeText(key.textContent, start, end, 'end');
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.focus();
  });
  return wrap;
}
