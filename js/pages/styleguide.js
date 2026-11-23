// Styleguide: fills in the parts of styleguide.html that come from code (mascot, case tags,
// goal ring) and wires the toast and modal demos.

import { ready } from '../app.js';
import { t } from '../i18n.js';
import { CASES } from '../grammar.js';
import { caseTag } from '../ui/forms.js';
import { EXPRESSIONS, talaSVG } from '../tala.js';
import { CAST, EXPRESSIONS as CAST_EXPRESSIONS } from '../characters.js';
import { characterImg } from '../ui/character.js';
import { goalRing } from '../shell.js';
import { toast } from '../ui/toast.js';
import { charRow } from '../ui/charrow.js';

await ready;

document.querySelector('[data-sg-tala]').innerHTML = EXPRESSIONS.map(
  (x) => `<figure class="sg__swatch">${talaSVG(x, { label: t(`mascot.${x}`), className: 'tala' })}<figcaption>${x}</figcaption></figure>`,
).join('');
document.querySelector('[data-sg-cases]').innerHTML = CASES.map((c) => caseTag(c)).join('');
document.querySelector('[data-sg-rings]').innerHTML = goalRing(5, 30) + goalRing(20, 30) + goalRing(30, 30) + goalRing(20, 30, 'goal-ring--lg');
const input = document.querySelector('#sg-input');
document.querySelector('[data-sg-charrow]').append(charRow(input));

document.querySelector('[data-sg-toast]').addEventListener('click', () => toast(t('sg.toastText')));
const dialog = document.querySelector('[data-sg-modal]');
document.querySelector('[data-sg-open-modal]').addEventListener('click', () => dialog.showModal());
dialog.addEventListener('click', (e) => {
  if (e.target.closest('[data-close]')) dialog.close();
});

// The cast: every character in every expression.
document.querySelector('[data-sg-cast]').innerHTML = CAST.map(
  (c) => `<div class="sg__grid">${CAST_EXPRESSIONS.map((x) => `<figure class="sg__swatch">${characterImg(c.id, { expr: x, size: 96, label: `${c.name}, ${x}` })}<figcaption>${c.name}: ${x}</figcaption></figure>`).join('')}</div>`,
).join('');
