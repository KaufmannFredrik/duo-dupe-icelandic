// Renders a paradigm table (from grammar.buildTable) as HTML for any word class.
// Cells are buttons that play the form; in practice mode chosen cells become inputs.

import { t } from '../i18n.js';
import { buildTable } from '../grammar.js';
import { lemma, paradigm } from '../data.js';
import { icon } from '../shell.js';
import { caseTag } from './forms.js';

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

export function tableFor(id, options = {}) {
  const l = lemma(id);
  return buildTable({ ofl: l.ofl, ord: l.lemma, bmyndir: paradigm(id) }, options);
}

/**
 * @param {string} id lemma id
 * @param {{ compact?: boolean, blanks?: Set<string>, tense?: string, strength?: string }} [options]
 *   compact: only the first column group (the singular), for notes; blanks: tags to ask for.
 */
export function renderTable(id, { compact = false, blanks = new Set(), tense, strength } = {}) {
  const l = lemma(id);
  const table = tableFor(id, { tense, strength });
  if (!table) return '';
  const groups = compact ? table.groups.slice(0, 1) : table.groups;
  const cols = groups.flatMap((g) => g.columns.map((c) => ({ ...c, group: g.key })));
  const all = table.groups.flatMap((g) => g.columns);
  const labelled = groups.some((g) => g.label);
  const corner = '<td class="decl__corner"></td>';
  const groupRow = labelled ? `<tr>${corner}${groups.map((g) => `<th scope="colgroup" colspan="${g.columns.length}" class="decl__group decl__${g.key}">${t(g.label)}</th>`).join('')}</tr>` : '';
  const headRow = `<tr>${labelled ? '<td></td>' : corner}${cols.map((c) => `<th scope="col" class="decl__${c.group}">${t(c.label)}</th>`).join('')}</tr>`;
  const rows = table.rows
    .map((row) => {
      const cells = cols
        .map((col) => {
          const cell = row.cells[all.findIndex((c) => c.key === col.key)];
          const cls = `decl__${col.group}`;
          if (!cell?.forms.length) return `<td class="${cls}"><span class="decl__cell muted">-</span></td>`;
          if (blanks.has(cell.tag)) {
            return `<td class="${cls}"><input class="decl__input" lang="is" data-tag="${cell.tag}" data-answers="${esc(cell.forms.join('|'))}" aria-label="${esc(`${t(row.label)}, ${t(col.label)}`)}" autocomplete="off" autocapitalize="off" spellcheck="false"></td>`;
          }
          const [first, ...rest] = cell.forms;
          return `<td class="${cls}"><button type="button" class="decl__cell" data-play="${esc(first)}"><span><span lang="is">${esc(first)}</span>${rest.length ? `<span class="decl__alt" lang="is">${rest.map(esc).join(', ')}</span>` : ''}</span>${icon('sound-wave')}</button></td>`;
        })
        .join('');
      return `<tr><th scope="row">${row.caseId ? caseTag(row.caseId) : esc(t(row.label))}</th>${cells}</tr>`;
    })
    .join('');
  const caption = t('decl.caption', { lemma: esc(l.lemma) });
  return `<div class="decl-wrap"><table class="decl" data-kind="${table.kind}" data-number="sg"><caption class="visually-hidden">${caption}</caption>
    <thead>${groupRow}${headRow}</thead><tbody>${rows}</tbody></table></div>`;
}
