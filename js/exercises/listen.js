// Listen to a human recording and pick the word you heard.

import { t } from '../i18n.js';
import { esc, heading, listenCard, optionsGroup } from './common.js';

export function build(spec, ctx) {
  const rec = spec.recording;
  const url = rec.mp3 ?? rec.ogg;
  const word = ctx.data.lemma(spec.lemma).lemma;
  const opts = optionsGroup(spec.options, (id) => `<span lang="is">${esc(ctx.data.lemma(id).lemma)}</span>`, ctx.changed);
  const credit = `${t('audio.recordedBy', { name: esc(rec.speaker ?? '?') })}, <a href="${esc(rec.page)}" rel="noopener">${esc(rec.license)}</a>`;
  return {
    html:
      heading('ex.listen') + listenCard({ text: word, url, credit }) + opts.html,
    mount: opts.mount,
    pickByNumber: opts.pickByNumber,
    ready: () => opts.selected() !== null,
    check() {
      opts.resolve((v) => v === spec.lemma);
      return { result: opts.selected() === spec.lemma ? 'correct' : 'wrong', ...this.reveal() };
    },
    reveal: () => ({ answerHTML: `<span lang="is">${esc(word)}</span> = <span lang="${ctx.lang}">${esc(ctx.data.gloss(spec.lemma))}</span>`, audio: word, audioUrl: url }),
  };
}
