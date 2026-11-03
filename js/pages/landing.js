// Landing page: places Tala on the synthwave horizon.

import { ready } from '../app.js';
import { talaSVG } from '../tala.js';

await ready;
document.querySelector('[data-tala]').outerHTML = talaSVG('happy', { className: 'tala' });
