// Match Icelandic words with their meanings. Tap one on each side; matched pairs lock.

import { t } from '../i18n.js';
import { sfx } from '../sfx.js';
import { play } from '../audio.js';
import { rng, shuffle } from '../engine/rng.js';
import { esc, heading, markIcon } from './common.js';

export function build(spec, ctx) {
  const r = rng(ctx.seed);
  const left = shuffle(spec.pairs, r);
  const right = shuffle(spec.pairs, r);
  let pending = { is: null, gloss: null };
  let matched = 0;
  let mistakes = 0;
  const btn = (side, id) =>
    `<button type="button" class="option" data-side="${side}" data-id="${id}" aria-pressed="false"><span lang="${side === 'is' ? 'is' : ctx.lang}">${esc(side === 'is' ? ctx.data.lemma(id).lemma : ctx.data.gloss(id))}</span></button>`;
  return {
    html: `${heading('ex.match')}<div class="match">
      <div class="match__col" role="group" aria-label="${t('ex.matchIcelandic')}">${left.map((id) => btn('is', id)).join('')}</div>
      <div class="match__col" role="group" aria-label="${t('ex.matchMeaning')}">${right.map((id) => btn('gloss', id)).join('')}</div></div>`,
    mount(root) {
      root.querySelector('.match').addEventListener('click', (e) => {
        const b = e.target.closest('.option');
        if (!b || b.disabled) return;
        const side = b.dataset.side;
        for (const x of root.querySelectorAll(`[data-side="${side}"]`)) x.setAttribute('aria-pressed', 'false');
        b.setAttribute('aria-pressed', 'true');
        pending[side] = b;
        if (side === 'is') {
          const rec = ctx.data.recordings(b.dataset.id)[0];
          play({ text: ctx.data.lemma(b.dataset.id).lemma, url: rec?.mp3 ?? rec?.ogg, quiet: true });
        }
        if (!pending.is || !pending.gloss) return;
        const pair = [pending.is, pending.gloss];
        pending = { is: null, gloss: null };
        if (pair[0].dataset.id === pair[1].dataset.id) {
          matched++;
          sfx('correct');
          for (const x of pair) {
            x.disabled = true;
            x.dataset.state = 'correct';
            x.setAttribute('aria-pressed', 'false');
            x.insertAdjacentHTML('beforeend', `${markIcon('correct')}<span class="visually-hidden">${t('ex.matched')}</span>`);
          }
          ctx.changed();
        } else {
          mistakes++;
          sfx('wrong');
          for (const x of pair) x.dataset.state = 'wrong';
          setTimeout(() => pair.forEach((x) => { delete x.dataset.state; x.setAttribute('aria-pressed', 'false'); }), 700);
        }
      });
    },
    ready: () => matched === spec.pairs.length,
    check() {
      return { result: mistakes === 0 ? 'correct' : 'almost', why: mistakes ? `<p>${t('ex.matchMistakes', { n: mistakes })}</p>` : '', ...this.reveal() };
    },
    reveal: () => ({
      answerHTML: spec.pairs.map((id) => `<span lang="is">${esc(ctx.data.lemma(id).lemma)}</span> = <span lang="${ctx.lang}">${esc(ctx.data.gloss(id))}</span>`).join('<br>'),
    }),
  };
}
