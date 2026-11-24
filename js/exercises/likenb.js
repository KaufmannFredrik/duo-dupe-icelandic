// In a word, does a letter or a spelling sound as in Norwegian? "About the same" or "another
// sound", from content/letters.json (every comparison is sourced in content/CLAIMS.md).

import { getLang, t } from '../i18n.js';
import { esc, heading, itemNote, optionsGroup, promptCard } from './common.js';

export function build(spec, ctx) {
  const rec = ctx.data.recordings(spec.lemma)[0];
  const url = rec?.mp3 ?? rec?.ogg ?? null;
  const opts = optionsGroup(['same', 'other'], (v) => `<span>${t(`ex.likenb.${v}`)}</span>`, ctx.changed);
  const question = t('ex.likenbQ', { x: `<strong lang="is">${esc(spec.label)}</strong>`, word: `<span lang="is" class="learn-text">${esc(spec.word)}</span>` });
  return {
    html: heading('ex.likenb') + promptCard({ html: question, lang: getLang(), audio: { text: spec.word, url } }) + opts.html,
    mount: opts.mount,
    pickByNumber: opts.pickByNumber,
    ready: () => opts.selected() !== null,
    check() {
      opts.resolve((v) => v === spec.answer);
      return { result: opts.selected() === spec.answer ? 'correct' : 'wrong', ...this.reveal() };
    },
    reveal: () => ({
      answerHTML: `${t(`ex.likenb.${spec.answer}`)}: <span lang="is">${esc(spec.word)}</span>`,
      audio: spec.word,
      audioUrl: url,
      why: itemNote(ctx, spec.item),
    }),
  };
}
