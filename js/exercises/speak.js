// Say the sentence (experimental speaking practice). The browser's recognizer writes down what
// it heard; the words are matched against the sentence in order. Recognizers mishear learners,
// so a low match is never graded until the learner confirms "yes, that is what I said".

import { t } from '../i18n.js';
import { bestMatch, words } from '../normalize.js';
import { listen, speechSupport } from '../speech.js';
import { icon } from '../shell.js';
import { esc, heading, promptCard } from './common.js';

const GOOD = 0.8;

export function build(spec, ctx) {
  const s = ctx.data.sentence(spec.sentence);
  const tr = ctx.data.translation(spec.sentence);
  let best = null;
  let confirmed = false;
  let session = null;
  let root;

  // The sentence with each word marked heard or not.
  const targetHTML = (marks) => {
    let i = 0;
    return s.is
      .split(/(\p{L}+)/u)
      .map((part) => (/^\p{L}+$/u.test(part) ? `<span class="speak__word" data-heard="${Boolean(marks[i++])}">${esc(part)}</span>` : esc(part)))
      .join('');
  };

  function render() {
    const heardEl = root.querySelector('[data-heard]');
    const confirm = root.querySelector('[data-confirm]');
    if (!best) return;
    heardEl.innerHTML = best.heard
      ? `<span class="label">${t('speak.heard')}</span> <q lang="is">${esc(best.heard)}</q><br><span lang="is" class="speak__target">${targetHTML(best.marks)}</span>`
      : t('speak.nothing');
    confirm.hidden = !best.heard || best.score >= GOOD || confirmed;
    ctx.changed();
  }

  function setListening(on) {
    const mic = root.querySelector('[data-mic]');
    mic.setAttribute('aria-pressed', String(on));
    mic.querySelector('span').textContent = t(on ? 'speak.listening' : best ? 'speak.again' : 'speak.start');
  }

  async function start() {
    if (session) {
      session.stop();
      return;
    }
    confirmed = false;
    const heardEl = root.querySelector('[data-heard]');
    heardEl.textContent = '';
    root.querySelector('[data-confirm]').hidden = true;
    try {
      session = listen({ onInterim: (text) => (heardEl.textContent = text), local: (await speechSupport()) === 'local' });
      setListening(true);
      const transcripts = await session.result;
      best = bestMatch(transcripts, s.is);
    } catch (e) {
      best = null;
      heardEl.textContent = t(['not-allowed', 'service-not-allowed', 'network', 'language-not-supported'].includes(e.message) ? `speak.error.${e.message}` : 'speak.error.other');
    } finally {
      session = null;
      setListening(false);
    }
    render();
  }

  return {
    html:
      heading('ex.speak') +
      promptCard({ text: s.is, lang: 'is', audio: s.is }) +
      `<p class="muted" lang="${tr.lang}">${esc(tr.text)}</p>
      <div class="speak">
        <button type="button" class="button speak__mic" data-mic aria-pressed="false">${icon('mic')}<span>${t('speak.start')}</span></button>
        <p class="speak__heard" aria-live="polite" data-heard></p>
        <div class="speak__confirm card card--quiet" data-confirm hidden>
          <p>${t('speak.understood')}</p>
          <div class="cluster"><button type="button" class="button button--sm" data-yes>${t('speak.yes')}</button>
            <button type="button" class="button button--sm" data-retry>${t('speak.retry')}</button></div>
        </div>
      </div>`,
    mount(r) {
      root = r;
      root.querySelector('[data-mic]').addEventListener('click', start);
      root.querySelector('[data-retry]').addEventListener('click', start);
      root.querySelector('[data-yes]').addEventListener('click', () => {
        confirmed = true;
        render();
        document.querySelector('[data-action="check"]')?.focus();
      });
    },
    ready: () => Boolean(best?.heard) && (best.score >= GOOD || confirmed),
    check() {
      session?.stop();
      root.querySelector('[data-mic]').disabled = true;
      root.querySelector('[data-confirm]').hidden = true;
      const result = best.score >= GOOD ? 'correct' : best.score >= 0.5 ? 'almost' : 'wrong';
      const missed = words(s.is).filter((_, i) => !best.marks[i]);
      return {
        result,
        ...this.reveal(),
        why: missed.length ? `<p>${t('speak.missed', { words: `<span lang="is">${esc(missed.join(', '))}</span>` })}</p>` : '',
      };
    },
    reveal: () => ({
      answerHTML: `<span lang="is">${esc(s.is)}</span><br><span lang="${tr.lang}" class="muted">${esc(tr.text)}</span>`,
      audio: s.is,
      sentence: spec.sentence,
    }),
  };
}
