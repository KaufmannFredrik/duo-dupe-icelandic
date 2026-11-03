// Styleguide: fills in the parts of styleguide.html that come from code (mascot, case tags,
// goal ring) and wires the toast and modal demos.

import { ready } from '../app.js';
import { t } from '../i18n.js';
import { CASES, caseTag } from '../lexicon.js';
import { EXPRESSIONS, talaSVG } from '../tala.js';
import { goalRing } from '../shell.js';
import { toast } from '../ui/toast.js';
import { charRow } from '../ui/charrow.js';

await ready;

document.querySelector('[data-sg-tala]').innerHTML = EXPRESSIONS.map(
  (x) => `<figure class="sg__swatch">${talaSVG(x, { label: t(`mascot.${x}`), className: 'tala' })}<figcaption>${x}</figcaption></figure>`,
).join('');
document.querySelector('[data-sg-cases]').innerHTML = CASES.map((c) => caseTag(c.id)).join('');
document.querySelector('[data-sg-rings]').innerHTML = goalRing(5, 30) + goalRing(20, 30) + goalRing(30, 30) + goalRing(20, 30, 'goal-ring--lg');
const input = document.querySelector('#sg-input');
document.querySelector('[data-sg-charrow]').append(charRow(input));

document.querySelector('[data-sg-toast]').addEventListener('click', () => toast(t('sg.toastText')));
const dialog = document.querySelector('[data-sg-modal]');
document.querySelector('[data-sg-open-modal]').addEventListener('click', () => dialog.showModal());
dialog.addEventListener('click', (e) => {
  if (e.target.closest('[data-close]')) dialog.close();
});
