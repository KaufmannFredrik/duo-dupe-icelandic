// Complete a few cells of a declension table (singular, without and with the article).

import { t } from '../i18n.js';
import { buildTable, parseTag } from '../grammar.js';
import { grade } from '../normalize.js';
import { charRow } from '../ui/charrow.js';
import { caseTag } from '../ui/forms.js';
import { esc, heading, markIcon, promptCard } from './common.js';

export function build(spec, ctx) {
  const entry = { ofl: 'no', ord: ctx.data.lemma(spec.lemma).lemma, bmyndir: ctx.data.paradigm(spec.lemma) };
  const table = buildTable(entry);
  const group = table.groups.find((g) => g.key === 'sg') ?? table.groups[0];
  const cols = group.columns;
  const colIndex = (col) => table.groups.flatMap((g) => g.columns).indexOf(col);
  const blanks = new Set(spec.blanks);
  let inputs = [];
  let last = null;
  const rows = table.rows
    .map((row) => {
      const cells = cols
        .map((col) => {
          const cell = row.cells[colIndex(col)];
          if (!cell.forms.length) return '<td><span class="decl__cell muted">-</span></td>';
          if (blanks.has(cell.tag)) {
            return `<td><input class="decl__input" lang="is" data-tag="${cell.tag}" aria-label="${esc(`${t(row.label)} ${t(col.label)}`)}" autocomplete="off" autocapitalize="off" spellcheck="false"></td>`;
          }
          return `<td><span class="decl__cell" lang="is">${esc(cell.forms[0])}</span></td>`;
        })
        .join('');
      return `<tr><th scope="row">${caseTag(row.caseId)}</th>${cells}</tr>`;
    })
    .join('');
  return {
    html: `${heading('ex.table')}${promptCard({ text: entry.ord, audio: entry.ord })}
      <div class="decl-wrap"><table class="decl"><caption class="visually-hidden">${t('decl.caption', { lemma: esc(entry.ord) })}</caption>
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
        records.push({ key: `${spec.lemma}|${i.dataset.tag}`, result: g.result, meta: { case: p.case, number: p.number, gender: ctx.data.lemma(spec.lemma).kyn } });
        if (g.result === 'wrong') worst = 'wrong';
        else if (g.result === 'almost' && worst === 'correct') worst = 'almost';
      }
      return { result: worst, ...this.reveal(), records };
    },
    reveal: () => ({
      answerHTML: spec.blanks.map((tag) => `${caseTag(parseTag(tag).case, { full: false })} <span lang="is">${esc(entry.bmyndir.find((f) => f.g === tag)?.b ?? '')}</span>`).join(' · '),
      audio: entry.ord,
    }),
  };
}
