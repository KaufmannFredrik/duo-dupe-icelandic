// Complete a few cells of a word's table. In lessons: a noun's singular, without and with the
// article. In reviews: the part of any word's table that has the form the review asks for (a
// noun's plural, an adjective's weak forms, a verb's past), as the case trainer shows it.

import { t } from '../i18n.js';
import { buildTable, parseTag } from '../grammar.js';
import { grade } from '../normalize.js';
import { charRow } from '../ui/charrow.js';
import { caseTag, describe } from '../ui/forms.js';
import { esc, heading, markIcon, promptCard } from './common.js';

export function build(spec, ctx) {
  const l = ctx.data.lemma(spec.lemma);
  const entry = { ofl: l.ofl, ord: l.lemma, bmyndir: ctx.data.paradigm(spec.lemma) };
  const table = buildTable(entry, spec.options ?? {});
  const all = table.groups.flatMap((g) => g.columns);
  const cellAt = (row, col) => row.cells[all.indexOf(col)];
  const blanks = new Set(spec.blanks);
  // The column group with the cells to fill (the singular in lessons).
  const group = table.groups.find((g) => table.rows.some((row) => g.columns.some((col) => blanks.has(cellAt(row, col)?.tag)))) ?? table.groups[0];
  const cols = group.columns;
  let inputs = [];
  let last = null;
  const rows = table.rows
    .map((row) => {
      const cells = cols
        .map((col) => {
          const cell = cellAt(row, col);
          if (!cell?.forms.length) return '<td><span class="decl__cell muted">-</span></td>';
          if (blanks.has(cell.tag)) {
            return `<td><input class="decl__input" lang="is" data-tag="${cell.tag}" aria-label="${esc(`${t(row.label)} ${t(col.label)}`)}" autocomplete="off" autocapitalize="off" spellcheck="false"></td>`;
          }
          return `<td><span class="decl__cell" lang="is">${esc(cell.forms[0])}</span></td>`;
        })
        .join('');
      return `<tr><th scope="row">${row.caseId ? caseTag(row.caseId) : esc(t(row.label))}</th>${cells}</tr>`;
    })
    .join('');
  const label = (tag) => {
    const p = parseTag(tag);
    return p.case ? caseTag(p.case, { full: false }) : esc(describe(p, { ofl: l.ofl }));
  };
  return {
    html: `${heading('ex.table')}${promptCard({ text: entry.ord, audio: entry.ord })}
      <div class="decl-wrap"><table class="decl" data-kind="${table.kind}"><caption class="visually-hidden">${t('decl.caption', { lemma: esc(entry.ord) })}</caption>
      <thead><tr><td class="decl__corner"></td>${cols.map((c) => `<th scope="col">${t(c.label)}</th>`).join('')}</tr></thead><tbody>${rows}</tbody></table></div>
      <div data-charrow></div>`,
    mount(root) {
      inputs = [...root.querySelectorAll('.decl__input')];
      for (const i of inputs) {
        i.addEventListener('input', ctx.changed);
        i.addEventListener('focus', () => { last = i; });
      }
      root.querySelector('[data-charrow]').replaceWith(charRow(() => last ?? inputs[0]));
      if (ctx.finePointer) inputs[0]?.focus();
    },
    ready: () => inputs.every((i) => i.value.trim()),
    check() {
      const records = [];
      let worst = 'correct';
      for (const i of inputs) {
        const answers = entry.bmyndir.filter((f) => f.g.replace(/\d$/, '') === i.dataset.tag).map((f) => f.b);
        const g = grade(i.value, answers, { strict: ctx.strict });
        i.readOnly = true;
        i.dataset.state = g.result;
        i.insertAdjacentHTML('afterend', `<span class="decl__mark decl__mark--${g.result}">${markIcon(g.result).replace('option__mark', 'icon--sm')}<span lang="is">${esc(answers[0])}</span></span>`);
        const p = parseTag(i.dataset.tag);
        records.push({ key: `${spec.lemma}|${i.dataset.tag}`, result: g.result, meta: { case: p.case, number: p.number, gender: p.gender ?? l.kyn } });
        if (g.result === 'wrong') worst = 'wrong';
        else if (g.result === 'almost' && worst === 'correct') worst = 'almost';
      }
      return { result: worst, ...this.reveal(), records };
    },
    reveal: () => ({
      answerHTML: spec.blanks.map((tag) => `${label(tag)} <span lang="is">${esc(entry.bmyndir.find((f) => f.g === tag)?.b ?? '')}</span>`).join(' · '),
      audio: entry.ord,
    }),
  };
}
