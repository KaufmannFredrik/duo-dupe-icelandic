// Guidebook: a unit's grammar notes, with example sentences from Tatoeba and tables built from
// DMII Core paradigms. Icelandic in the notes is written as {is:...} and validated at build time.

import { ready } from '../app.js';
import { pick, t } from '../i18n.js';
import { entry, lemma, loadAll, sentence, translation } from '../data.js';
import { loadCourse, unitLabel, unitOf } from '../course.js';
import { renderTable } from '../ui/table.js';
import { play } from '../audio.js';
import { icon } from '../shell.js';
import { hostOf } from '../characters.js';
import { characterImg } from '../ui/character.js';

await ready;
await loadAll();
const course = await loadCourse();
const unit = unitOf(course, new URLSearchParams(location.search).get('unit')) ?? course.units[0];
const root = document.querySelector('[data-guide]');
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const prose = (text) => esc(text).replace(/\{is:([^}]+)\}/g, (_, x) => `<span lang="is" class="is-inline">${x}</span>`);

document.querySelector('[data-guide-title]').textContent = `${unitLabel(unit, t)}: ${pick(unit.title)}`;

// The unit's host, thinking, as the one who explains the grammar.
const host = hostOf(unit);
if (host) {
  document.querySelector('[data-guide-host]').innerHTML = `<div class="host host--guide">${characterImg(host.id, { expr: 'thinking', size: 72, label: '', className: 'host__pic' })}
    <p class="host__bubble"><span class="host__name">${esc(host.name)} <span class="host__kind">${esc(pick(host.kind))}</span></span><span>${t('guide.host', { name: esc(host.name) })}</span></p></div>`;
}

if (!unit.guide) {
  root.innerHTML = `<p class="muted">${t('guide.none')}</p>`;
} else {
  // A table is a lemma id, or { lemma, tense } for a verb in another tense than the present.
  const tableHTML = (tb) => {
    const { lemma: id, tense } = typeof tb === 'string' ? { lemma: tb } : tb;
    if (!entry(id)) return '';
    const label = tense === 'ÞT' ? ` <span class="muted">(${t('tense.past')})</span>` : '';
    return `<div class="guide-table"><h3 class="label"><span lang="is">${esc(lemma(id).lemma)}</span>${label}</h3>${renderTable(id, { compact: true, tense })}</div>`;
  };
  root.innerHTML = unit.guide.sections
    .map(
      (sec, i) => `<section class="card card--quiet stack guide-section" aria-labelledby="g-${i}">
        <h2 id="g-${i}">${esc(pick(sec.title))}</h2>
        <p class="measure">${prose(pick(sec.text))}</p>
        ${(sec.tables ?? []).map(tableHTML).join('')}
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
