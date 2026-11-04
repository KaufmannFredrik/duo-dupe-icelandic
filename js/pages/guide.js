// Guidebook: a unit's grammar notes, with example sentences from Tatoeba and tables built from
// DMII Core paradigms. Icelandic in the notes is written as {is:...} and validated at build time.

import { ready } from '../app.js';
import { pick, t } from '../i18n.js';
import { entry, lemma, loadAll, sentence, translation } from '../data.js';
import { loadCourse, unitOf } from '../course.js';
import { renderTable } from '../ui/table.js';
import { play } from '../audio.js';
import { icon } from '../shell.js';

await ready;
await loadAll();
const course = await loadCourse();
const unit = unitOf(course, new URLSearchParams(location.search).get('unit')) ?? course.units[0];
const root = document.querySelector('[data-guide]');
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const prose = (text) => esc(text).replace(/\{is:([^}]+)\}/g, (_, x) => `<span lang="is" class="is-inline">${x}</span>`);

document.querySelector('[data-guide-title]').textContent = `${t('learn.unit', { n: unit.order })}: ${pick(unit.title)}`;

if (!unit.guide) {
  root.innerHTML = `<p class="muted">${t('guide.none')}</p>`;
} else {
  root.innerHTML = unit.guide.sections
    .map(
      (sec, i) => `<section class="card card--quiet stack guide-section" aria-labelledby="g-${i}">
        <h2 id="g-${i}">${esc(pick(sec.title))}</h2>
        <p class="measure">${prose(pick(sec.text))}</p>
        ${(sec.tables ?? []).map((id) => (entry(id) ? `<div class="guide-table"><h3 class="label"><span lang="is">${esc(lemma(id).lemma)}</span></h3>${renderTable(id, { compact: true })}</div>` : '')).join('')}
        ${
          sec.examples?.length
            ? `<ul class="examples">${sec.examples
                .filter((sid) => sentence(sid))
                .map((sid) => {
                  const s = sentence(sid);
                  const tr = translation(sid);
                  return `<li class="example"><button type="button" class="icon-button" data-play="${esc(s.is)}" aria-label="${t('audio.playSentence')}">${icon('play')}</button>
                    <span lang="is">${esc(s.is)}</span><small lang="${tr.lang}">${esc(tr.text)}</small>
                    <small><a href="https://tatoeba.org/en/sentences/show/${sid}" rel="noopener">Tatoeba #${sid}</a>, ${esc(s.author ?? t('credit.unknownAuthor'))}</small></li>`;
                })
                .join('')}</ul>`
            : ''
        }
      </section>`,
    )
    .join('') + (unit.guide.source ? `<p class="credit">${esc(pick(unit.guide.source))}</p>` : '') + `<p class="credit">${t('guide.credit')}</p>`;
}

const first = unit.lessons.find((l) => !l.review);
document.querySelector('[data-guide-start]').href = `lesson.html?unit=${unit.id}&lesson=${first.id}`;
document.addEventListener('click', (e) => {
  const b = e.target.closest('[data-play]');
  if (b) play({ text: b.dataset.play, url: b.dataset.url });
});
