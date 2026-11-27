// Rendering helpers for grammatical information: case tags and plain-language form descriptions.

import { t } from '../i18n.js';
import { CASE_CLASS, parseTag } from '../grammar.js';

/** A case tag with its color, abbreviation and (optionally) the full name: never color alone. */
export function caseTag(caseId, { full = true } = {}) {
  const cls = CASE_CLASS[caseId];
  return `<span class="tag tag--${cls}"><span class="tag__abbr">${caseId}</span>${full ? `<span class="tag__name">${t(`case.${cls}`)}</span>` : ''}</span>`;
}

export const genderLabel = (kyn) => (kyn ? t(`gender.${kyn.toLowerCase()}`) : '');
export const classLabel = (ofl) => t(`ofl.${ofl}`);

/**
 * "accusative singular, definite", "3rd person singular, present", "masculine dative plural".
 * withCase: false leaves out the case (when a case tag is shown next to it); ofl: the word class.
 */
export function describe(tagOrParsed, { withCase = true, ofl } = {}) {
  const p = typeof tagOrParsed === 'string' ? parseTag(tagOrParsed) : tagOrParsed;
  const parts = [];
  if (p.person) parts.push(t(`person.${p.person}`));
  if (p.gender) parts.push(t(`gender.${p.gender.toLowerCase()}`));
  if (p.case && withCase) parts.push(t(`case.${CASE_CLASS[p.case]}`));
  if (p.number) parts.push(t(`form.${p.number}`));
  let text = parts.join(' ');
  // Only nouns carry the definite article.
  if (p.case && ofl === 'no') text += `, ${t(p.definite ? 'form.definite' : 'form.indefinite')}`;
  if (p.tense) text += `, ${t(p.tense === 'NT' ? 'tense.present' : 'tense.past')}`;
  if (p.mood === 'NH') text = t('mood.infinitive');
  if (p.mood === 'SAGNB') text = t('mood.supine');
  return text;
}
