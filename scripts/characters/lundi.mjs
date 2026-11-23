// Lundi: an Atlantic puffin in profile, facing right, with sand eels in its bill. Cyan rim light
// on the back, magenta on the chest and bill, like the other characters.
import { seeded, motionStyle, breatheCSS, blinkCSS, lids, swayCSS, pulseCSS } from './lib.mjs';

const f = (n) => Math.round(n * 10) / 10;
const C = {
  night0: '#0A0A16', blue: '#0080FF', cyan: '#00FFFF', magenta: '#FF10F0', pink: '#FF006E', gold: '#FFD700', chrome: '#C0C0C0',
  plume: '#14152E', plumeMid: '#22244A', plumeSheen: '#3A4A8C',
  disc: '#F1F1F7', discShade: '#B9BACB', discDeep: '#8D8EA6',
  billBase: '#6F80A8', billYellow: '#FFCF33', billRed: '#FF5A2A', billDeep: '#D7331A',
  eyeRing: '#FF4B3A',
};

export function lundi(expr = 'happy', { still = false } = {}) {
  const MOTION = breatheCSS('lu', 3.8) + blinkCSS('lu', 4.6) + swayCSS('lu-fish', 5, 2.6, '50% 0%');
  const back = 'M34 240C30 206 40 172 58 146C66 132 66 112 70 98C76 70 98 50 124 50C142 50 154 60 158 76L160 128C156 136 150 142 146 146C164 160 176 188 182 240Z';
  const disc = 'M84 96C88 72 108 60 128 60C142 60 152 66 156 78L158 124C148 132 128 136 112 132C96 128 84 114 84 96Z';
  const bill = 'M157 72C178 72 200 90 212 118C204 122 190 126 176 128C168 129 162 130 157 130Z';
  const grooves = [0, 1, 2].map((i) => {
    const x = 176 + i * 9;
    return `<path d="M${x} ${f(84 + i * 6)}C${x + 4} ${f(98 + i * 4)} ${x + 4} ${f(112 + i * 2)} ${x - 1} ${f(126 - i * 2)}" stroke="${C.billDeep}" stroke-width="1.6" fill="none" opacity="0.75"/>`;
  }).join('');
  // a sand eel: an S-shaped body drooping from the bill, a forked tail and an eye at the head end
  const eel = (x, y, rot, len, flip = 1) => {
    const b = `M0 0C${6 * flip} ${f(len * 0.3)} ${-6 * flip} ${f(len * 0.62)} ${2 * flip} ${len}`;
    return `<g transform="translate(${x} ${y}) rotate(${rot})"><g class="lu-fish">
    <path d="${b}" stroke="#5E7C9C" stroke-width="4.6" fill="none" stroke-linecap="round"/>
    <path d="${b}" stroke="url(#lu-eel)" stroke-width="3.4" fill="none" stroke-linecap="round"/>
    <path d="M${f(1.2 * flip)} 3C${f(5 * flip)} ${f(len * 0.3)} ${f(-4 * flip)} ${f(len * 0.6)} ${f(2.4 * flip)} ${f(len - 4)}" stroke="#FFFFFF" stroke-width="0.8" fill="none" opacity="0.75"/>
    <path d="M${2 * flip} ${len}L${f(-1.5 * flip)} ${len + 6}L${2 * flip} ${len + 3.5}L${f(5.5 * flip)} ${len + 6}Z" fill="#9FC0D8"/>
    <circle cx="${f(0.6 * flip)}" cy="2.4" r="0.9" fill="${C.night0}"/></g></g>`;
  };
  // feather edges on the wing, a few overlapping scallops
  const feathers = Array.from({ length: 6 }, (_, i) => {
    const y = 170 + i * 12;
    return `<path d="M${54 + i * 6} ${y}C${68 + i * 6} ${y - 4} ${84 + i * 6} ${y - 2} ${96 + i * 7} ${y + 6}" stroke="${C.plumeSheen}" stroke-width="1.3" fill="none" opacity="0.7"/>`;
  }).join('');
  // The eye by expression. The dark triangles above and below the eye act as brows.
  const tri = (y, up, rot = 0) => `<path d="${up ? 'M131 79L134 84L128 84Z' : 'M128 100L134 100L131 106Z'}" fill="#4A4B66" transform="rotate(${rot} 131 ${y})"/>`;
  const ring = `<circle cx="131" cy="92" r="7.2" fill="${C.eyeRing}"/>`;
  const pupil = (dx, dy) => `<circle cx="${131 + dx}" cy="${92 + dy}" r="5.2" fill="${C.night0}"/><circle cx="${132.8 + dx}" cy="${90.2 + dy}" r="1.7" fill="#FFFFFF"/><circle cx="${129.6 + dx}" cy="${94 + dy}" r="0.7" fill="#FFFFFF" opacity="0.7"/>`;
  const eye = {
    happy: `${tri(82, true)}${tri(102, false)}${ring}${pupil(0, 0)}`,
    // eyes closed in delight: a happy arc inside the ring
    cheer: `${tri(80, true)}${tri(102, false)}${ring}<circle cx="131" cy="92" r="5.2" fill="${C.discShade}"/><path d="M126 94Q131 86.5 136 94" stroke="${C.night0}" stroke-width="2.4" fill="none" stroke-linecap="round"/>`,
    // looking up and ahead, the "brow" raised
    thinking: `<g transform="translate(0 -2)">${tri(82, true, 18)}</g>${tri(102, false)}<clipPath id="lu-eye-t"><circle cx="131" cy="92" r="5.2"/></clipPath>${ring}<g clip-path="url(#lu-eye-t)"><circle cx="131" cy="92" r="5.2" fill="${C.discShade}"/>${pupil(1.6, -1.8)}</g>`,
    // half-closed and looking down: the lid covers the top of the eye
    sorry: `${tri(82, true, -16)}${tri(102, false)}${ring}<clipPath id="lu-eye-s"><circle cx="131" cy="92" r="5.2"/></clipPath><g clip-path="url(#lu-eye-s)"><circle cx="131" cy="92" r="5.2" fill="${C.discShade}"/>${pupil(-0.6, 1.8)}<path d="M124 86H138V91.6C134 90.4 128 90.4 124 92Z" fill="${C.disc}"/></g><path d="M124.6 92C128 90.2 134 90.2 137.4 91.4" stroke="${C.night0}" stroke-width="1.6" fill="none" stroke-linecap="round"/>`,
  }[expr];
  // what changes around the bill: an open gape for cheer, a question mark for thinking
  const extra = {
    happy: '',
    cheer: `<path d="M158 108L209 118L160 116Z" fill="#4A0D18"/><g fill="${C.gold}"><path d="M150 52l2 5 5 2-5 2-2 5-2-5-5-2 5-2Z"/><path d="M176 64l1.4 3.4 3.4 1.4-3.4 1.4-1.4 3.4-1.4-3.4-3.4-1.4 3.4-1.4Z"/></g>`,
    thinking: `<g transform="translate(164 40)"><circle r="13" fill="${C.night0}" stroke="${C.gold}" stroke-width="2"/><path d="M-4 -3.5C-4 -7.5 4 -7.5 4 -3.5C4 -0.5 0 0 0 3.5" stroke="${C.gold}" stroke-width="2.6" fill="none" stroke-linecap="round"/><circle cy="8" r="1.7" fill="${C.gold}"/></g><circle cx="152" cy="58" r="3" fill="${C.night0}" stroke="${C.gold}" stroke-width="1.4"/>`,
    sorry: '',
  }[expr];
  return `<svg viewBox="0 0 240 240" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Lundi">
${motionStyle(MOTION, still)}
<defs>
  <linearGradient id="lu-plume" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="${C.plumeMid}"/><stop offset="1" stop-color="${C.plume}"/></linearGradient>
  <radialGradient id="lu-disc" cx="0.55" cy="0.35" r="0.75"><stop offset="0" stop-color="${C.disc}"/><stop offset="0.7" stop-color="${C.discShade}"/><stop offset="1" stop-color="${C.discDeep}"/></radialGradient>
  <linearGradient id="lu-belly" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="${C.disc}"/><stop offset="1" stop-color="${C.discShade}"/></linearGradient>
  <linearGradient id="lu-bill" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="${C.billRed}"/><stop offset="1" stop-color="${C.billDeep}"/></linearGradient>
  <linearGradient id="lu-eel" x1="0" x2="1"><stop offset="0" stop-color="#E6F6FF"/><stop offset="0.6" stop-color="#9FC0D8"/><stop offset="1" stop-color="#5E7C9C"/></linearGradient>
  <linearGradient id="lu-rimL" x1="0" x2="1"><stop offset="0" stop-color="${C.cyan}" stop-opacity="0.9"/><stop offset="0.35" stop-color="${C.cyan}" stop-opacity="0"/></linearGradient>
  <linearGradient id="lu-rimR" x1="1" x2="0"><stop offset="0" stop-color="${C.magenta}" stop-opacity="0.85"/><stop offset="0.35" stop-color="${C.magenta}" stop-opacity="0"/></linearGradient>
  <radialGradient id="lu-glow" cx="0.5" cy="0.5" r="0.5">
    <stop offset="0" stop-color="${C.blue}" stop-opacity="0.32"/><stop offset="0.6" stop-color="${C.cyan}" stop-opacity="0.08"/><stop offset="1" stop-color="${C.cyan}" stop-opacity="0"/>
  </radialGradient>
  <filter id="lu-soft" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="1.8"/></filter>
  <clipPath id="lu-back"><path d="${back}"/></clipPath>
  <clipPath id="lu-bill"><path d="${bill}"/></clipPath>
</defs>
<circle cx="120" cy="120" r="108" fill="url(#lu-glow)"/>
<g class="lu-breathe">

<!-- body, wing and back -->
<path d="${back}" fill="url(#lu-plume)"/>
<g clip-path="url(#lu-back)">
  <path d="${back}" fill="none" stroke="url(#lu-rimL)" stroke-width="9" filter="url(#lu-soft)"/>
  <!-- white chest under the dark collar -->
  <path d="M146 146C164 160 176 188 182 240H112C114 204 122 172 138 152Z" fill="url(#lu-belly)"/>
  <path d="M146 146C164 160 176 188 182 240" stroke="${C.magenta}" stroke-width="6" fill="none" opacity="0.55" filter="url(#lu-soft)"/>
  <!-- wing -->
  <path d="M50 150C70 142 96 150 112 170C124 186 128 214 126 240H42C40 208 42 172 50 150Z" fill="${C.plume}"/>
  <path d="M50 150C70 142 96 150 112 170C124 186 128 214 126 240" stroke="${C.plumeSheen}" stroke-width="1.6" fill="none"/>
  ${feathers}
  <path d="M60 104C70 80 92 62 118 56" stroke="#7E93D8" stroke-width="2" fill="none" opacity="0.45" stroke-linecap="round"/>
</g>

<!-- face disc -->
<path d="${disc}" fill="url(#lu-disc)"/>
<path d="M90 112C100 126 120 132 140 130" stroke="${C.discDeep}" stroke-width="1.4" fill="none" opacity="0.6"/>
<!-- the grey line behind the eye -->
<path d="M126 94C116 96 104 98 92 102" stroke="${C.discDeep}" stroke-width="2.2" fill="none" stroke-linecap="round" opacity="0.8"/>

<!-- eye: red ring, dark triangles above and below -->
${eye}
${expr === 'cheer' || still ? '' : lids('lu', [131], 92, 5.8, 5.8, C.discShade)}

<!-- bill -->
<path d="${bill}" fill="url(#lu-bill)"/>
<g clip-path="url(#lu-bill)">
  <rect x="155" y="70" width="11" height="64" fill="${C.billBase}"/>
  <path d="M166 70V134" stroke="${C.billYellow}" stroke-width="3"/>
  <path d="M158 75C178 75 198 92 209 114" stroke="#FFB18E" stroke-width="2" fill="none" opacity="0.6"/>
  ${grooves}
  <path d="M157 130C178 128 196 122 210 116" stroke="${C.magenta}" stroke-width="5" fill="none" opacity="0.55" filter="url(#lu-soft)"/>
</g>
<path d="M158 108C176 110 196 114 211 118" stroke="#8E1B10" stroke-width="1.6" fill="none"/>
${extra}
<!-- the yellow rosette at the corner of the mouth -->
<circle cx="157" cy="108" r="4.4" fill="${C.billYellow}"/>
<circle cx="156" cy="107" r="1.6" fill="#FFF1B3"/>

<!-- sand eels hanging from the bill -->
${eel(172, 112, -18, 30, 1)}
${eel(182, 114, 4, 36, -1)}
${eel(192, 116, 14, 32, 1)}
${eel(201, 118, 30, 26, -1)}
</g>
</svg>`;
}

