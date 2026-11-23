// A picture of a cast member (js/characters.js) as an <img>. In Calm mode (which also follows the
// device's reduced-motion setting) the still copy is used; otherwise the animated one.

import { character, characterSrc } from '../characters.js';

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const calm = () => document.documentElement.dataset.calm === 'on';

/**
 * @param {string} id character id
 * @param {{ expr?: string, size?: number, label?: string, className?: string, still?: boolean }} [options]
 *   label: the alt text (default: the character's name); '' when the name is written beside it
 *   still: true for the copy without motion even outside Calm mode
 */
export function characterImg(id, { expr = 'happy', size = 64, label, className = '', still = false } = {}) {
  const c = character(id);
  if (!c) return '';
  return `<img class="char${className ? ` ${className}` : ''}" src="${characterSrc(id, expr, still || calm())}" width="${size}" height="${size}" alt="${esc(label ?? c.name)}" decoding="async">`;
}
