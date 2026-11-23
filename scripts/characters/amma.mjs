// Amma Sigga: a grandmother in a lopapeysa, lit like a synthwave portrait (cyan from the left,
// magenta from the right). viewBox 240 x 240, transparent background.
import { humanFace, motionStyle, breatheCSS, blinkCSS, lids, swayCSS, pulseCSS } from './lib.mjs';

const f = (n) => Math.round(n * 10) / 10;
const C = {
  night: '#1A1A2E', night0: '#0A0A16', night2: '#232345',
  cyan: '#00FFFF', blue: '#0080FF', magenta: '#FF10F0', pink: '#FF006E', gold: '#FFD700', chrome: '#C0C0C0',
  skin: '#F0C6A6', skinMid: '#D9A184', skinShade: '#A86E5E', skinDeep: '#6E4250',
  hair: '#ECEAF4', hairMid: '#BDBBD3', hairDark: '#7E7CA0',
  wool: '#2B3463', woolDark: '#1C2247', woolLight: '#3A4682',
};

// The approved happy face, kept exactly as drawn.
const HAPPY_UPPER = `<!-- brows -->
<path d="M92 86C97 82 106 82 112 85" stroke="${C.hairDark}" stroke-width="2.4" stroke-linecap="round" fill="none"/>
<path d="M128 85C134 82 143 82 148 86" stroke="${C.hairDark}" stroke-width="2.4" stroke-linecap="round" fill="none"/>

<!-- eyes: smiling, lids lifted by the cheeks -->
<path d="M95 101C99 96 108 96 112 101C108 104 99 104 95 101Z" fill="#FDF7F2"/>
<path d="M128 101C132 96 141 96 145 101C141 104 132 104 128 101Z" fill="#FDF7F2"/>
<circle cx="103.5" cy="100.4" r="3.6" fill="#3B6EA8"/><circle cx="136.5" cy="100.4" r="3.6" fill="#3B6EA8"/>
<circle cx="103.5" cy="100.4" r="1.8" fill="${C.night0}"/><circle cx="136.5" cy="100.4" r="1.8" fill="${C.night0}"/>
<circle cx="104.8" cy="99.2" r="1" fill="#FFFFFF"/><circle cx="137.8" cy="99.2" r="1" fill="#FFFFFF"/>
<path d="M94 101C99 95 108 95 113 101" stroke="${C.skinDeep}" stroke-width="1.8" fill="none" stroke-linecap="round"/>
<path d="M127 101C132 95 141 95 146 101" stroke="${C.skinDeep}" stroke-width="1.8" fill="none" stroke-linecap="round"/>
<path d="M96 104C101 107 107 107 111 104M129 104C133 107 139 107 144 104" stroke="${C.skinShade}" stroke-width="1.2" fill="none" opacity="0.8"/>
`;
const HAPPY_MOUTH = `<path d="M107 134C112 141 128 141 133 134C128 136 112 136 107 134Z" fill="#B24A5E"/>
<path d="M108 134.5C114 137 126 137 132 134.5C127 139 113 139 108 134.5Z" fill="#FFFFFF" opacity="0.85"/>
<path d="M106 134C112 143 128 143 134 134" stroke="${C.skinDeep}" stroke-width="1.6" fill="none" stroke-linecap="round"/>

`;

// Points along an ellipse arc (degrees, 0 = right, 90 = down).
const onEllipse = (cx, cy, rx, ry, deg) => [cx + rx * Math.cos((deg * Math.PI) / 180), cy + ry * Math.sin((deg * Math.PI) / 180)];
const angleAt = (rx, ry, deg) => (Math.atan2(ry * Math.cos((deg * Math.PI) / 180), -rx * Math.sin((deg * Math.PI) / 180)) * 180) / Math.PI;

// One yoke row: motif repeated along an ellipse between two angles, rotated to the curve.
function yokeRow(cx, cy, rx, ry, from, to, step, motif) {
  let out = '';
  for (let d = from; d <= to + 0.01; d += step) {
    const [x, y] = onEllipse(cx, cy, rx, ry, d);
    out += `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(angleAt(rx, ry, d) + 180)})">${motif}</g>`;
  }
  return out;
}

const tri = (c) => `<path d="M-4 3L0 -4L4 3Z" fill="${c}"/>`;
const diamond = (c) => `<path d="M0 -5L4 0L0 5L-4 0Z" fill="${c}"/><path d="M0 -2L1.6 0L0 2L-1.6 0Z" fill="${C.woolDark}"/>`;
const dot = (c) => `<circle r="1.6" fill="${c}"/>`;
const cross = (c) => `<path d="M-3 0H3M0 -3V3" stroke="${c}" stroke-width="1.6"/>`;

export function amma(expr = 'happy', { still = false } = {}) {
  const MOTION = breatheCSS('as') + blinkCSS('as', 5.4) + swayCSS('as-yarn', 3, 3.4, '50% 80%');
  const yoke = [
    yokeRow(120, 162, 44, 22, 10, 170, 10, dot(C.gold)),
    yokeRow(120, 162, 56, 30, 8, 172, 9, tri(C.cyan)),
    yokeRow(120, 162, 70, 39, 10, 170, 10, diamond(C.magenta)),
    yokeRow(120, 162, 84, 48, 10, 170, 8, tri(C.gold).replace('M-4 3L0 -4L4 3Z', 'M-4 -3L0 4L4 -3Z')),
    yokeRow(120, 162, 96, 56, 12, 168, 9, cross(C.cyan)),
  ].join('');

  const parts = expr === 'happy'
    ? { upper: HAPPY_UPPER, mouth: HAPPY_MOUTH }
    : humanFace(expr, {
      prefix: 'as', eyes: [103.5, 136.5], eyeY: 100.6, eyeW: 8.5, irisR: 3.6, iris: '#3B6EA8', lid: C.skinDeep, lidW: 1.8,
      brows: { y: 84, inner: 8.5, outer: 11.5, color: C.hairDark, width: 2.4 },
      mouth: [120, 135, 13], lip: '#B24A5E', skinShade: C.skinShade, skinDeep: C.skinDeep,
    });
  return `<svg viewBox="0 0 240 240" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Amma Sigga">
${motionStyle(MOTION, still)}
<defs>
  <radialGradient id="as-skin" cx="0.46" cy="0.42" r="0.62">
    <stop offset="0" stop-color="${C.skin}"/><stop offset="0.62" stop-color="${C.skinMid}"/><stop offset="1" stop-color="${C.skinShade}"/>
  </radialGradient>
  <linearGradient id="as-rimL" x1="0" x2="1" y1="0" y2="0">
    <stop offset="0" stop-color="${C.cyan}" stop-opacity="0.9"/><stop offset="0.45" stop-color="${C.cyan}" stop-opacity="0"/>
  </linearGradient>
  <linearGradient id="as-rimR" x1="1" x2="0" y1="0" y2="0">
    <stop offset="0" stop-color="${C.magenta}" stop-opacity="0.85"/><stop offset="0.45" stop-color="${C.magenta}" stop-opacity="0"/>
  </linearGradient>
  <linearGradient id="as-woolRimL" x1="0" x2="1" y1="0" y2="0">
    <stop offset="0" stop-color="${C.cyan}" stop-opacity="0.45"/><stop offset="1" stop-color="${C.cyan}" stop-opacity="0"/>
  </linearGradient>
  <linearGradient id="as-woolRimR" x1="1" x2="0" y1="0" y2="0">
    <stop offset="0" stop-color="${C.magenta}" stop-opacity="0.45"/><stop offset="1" stop-color="${C.magenta}" stop-opacity="0"/>
  </linearGradient>
  <pattern id="as-knit" width="6" height="5" patternUnits="userSpaceOnUse"><path d="M0.5 0.5L3 4L5.5 0.5" stroke="${C.woolDark}" stroke-width="1" fill="none"/></pattern>
  <filter id="as-soft" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="1.6"/></filter>
  <radialGradient id="as-yarn" cx="0.38" cy="0.35" r="0.7">
    <stop offset="0" stop-color="#FF6BF5"/><stop offset="0.6" stop-color="${C.magenta}"/><stop offset="1" stop-color="#8A0784"/>
  </radialGradient>
  <linearGradient id="as-hair" x1="0" x2="0" y1="0" y2="1">
    <stop offset="0" stop-color="${C.hair}"/><stop offset="1" stop-color="${C.hairMid}"/>
  </linearGradient>
  <linearGradient id="as-wool" x1="0" x2="0" y1="0" y2="1">
    <stop offset="0" stop-color="${C.woolLight}"/><stop offset="0.5" stop-color="${C.wool}"/><stop offset="1" stop-color="${C.woolDark}"/>
  </linearGradient>
  <radialGradient id="as-cheek" cx="0.5" cy="0.5" r="0.5">
    <stop offset="0" stop-color="${C.pink}" stop-opacity="0.38"/><stop offset="1" stop-color="${C.pink}" stop-opacity="0"/>
  </radialGradient>
  <radialGradient id="as-glow" cx="0.5" cy="0.5" r="0.5">
    <stop offset="0" stop-color="${C.magenta}" stop-opacity="0.28"/><stop offset="0.6" stop-color="${C.blue}" stop-opacity="0.12"/><stop offset="1" stop-color="${C.blue}" stop-opacity="0"/>
  </radialGradient>
  <clipPath id="as-face"><path d="M120 52C147 52 161 73 161 100C161 123 151 140 138 150C131 155 126 157 120 157C114 157 109 155 102 150C89 140 79 123 79 100C79 73 93 52 120 52Z"/></clipPath>
  <clipPath id="as-body"><path d="M22 240V218C24 194 52 178 96 171L120 175L144 171C188 178 216 194 218 218V240Z"/></clipPath>
</defs>
<circle cx="120" cy="112" r="104" fill="url(#as-glow)"/>
<g class="as-breathe">

<!-- bun and back hair -->
<circle cx="120" cy="40" r="21" fill="url(#as-hair)"/>
<path d="M104 34C110 26 130 24 137 34M102 44C112 36 128 36 138 44" stroke="${C.hairDark}" stroke-width="1.6" fill="none" opacity="0.6"/>
<path d="M101 34C104 26 110 21 116 20" stroke="${C.cyan}" stroke-width="1.6" fill="none" opacity="0.55" filter="url(#as-soft)"/>
<path d="M139 34C136 26 130 21 124 20" stroke="${C.magenta}" stroke-width="1.6" fill="none" opacity="0.5" filter="url(#as-soft)"/>
<path d="M74 104C70 78 84 56 106 50C114 48 126 48 134 50C156 56 170 78 166 104C165 110 162 114 160 115C161 100 158 86 150 78C138 68 102 68 90 78C82 86 79 100 80 115C78 114 75 110 74 104Z" fill="url(#as-hair)"/>
<path d="M76 100C74 84 82 66 98 57" stroke="${C.cyan}" stroke-width="2" fill="none" opacity="0.6" filter="url(#as-soft)"/>
<path d="M164 100C166 84 158 66 142 57" stroke="${C.magenta}" stroke-width="2" fill="none" opacity="0.6" filter="url(#as-soft)"/>

<!-- neck -->
<path d="M104 146C106 158 104 168 98 174L120 182L142 174C136 168 134 158 136 146Z" fill="${C.skinShade}"/>
<path d="M104 152C112 160 128 160 136 152" stroke="${C.skinDeep}" stroke-width="1.2" fill="none" opacity="0.5"/>

<!-- sweater -->
<path d="M22 240V218C24 194 52 178 96 171L120 175L144 171C188 178 216 194 218 218V240Z" fill="url(#as-wool)"/>
<g clip-path="url(#as-body)"><rect x="22" y="160" width="196" height="80" fill="url(#as-knit)" opacity="0.55"/>${yoke}
  <path d="M22 210C60 196 90 214 120 214C150 214 180 196 218 210" stroke="${C.woolDark}" stroke-width="1" fill="none" opacity="0.6"/>
  <rect x="22" y="150" width="34" height="90" fill="url(#as-woolRimL)"/>
  <rect x="184" y="150" width="34" height="90" fill="url(#as-woolRimR)"/>
</g>
<!-- ribbed collar -->
<path d="M94 170C102 180 138 180 146 170L144 166C136 174 104 174 96 166Z" fill="${C.woolLight}"/>
${Array.from({ length: 11 }, (_, i) => { const x = 98 + i * 4.4; return `<path d="M${f(x)} ${f(168 + Math.abs(i - 5) * -0.2 + 2)}v6" stroke="${C.woolDark}" stroke-width="1"/>`; }).join('')}

<!-- ears and earrings -->
<path d="M80 98C73 96 71 106 74 113C76 119 80 121 83 119Z" fill="${C.skinMid}"/>
<path d="M160 98C167 96 169 106 166 113C164 119 160 121 157 119Z" fill="${C.skinMid}"/>
<circle cx="78" cy="123" r="2.6" fill="${C.gold}"/><circle cx="162" cy="123" r="2.6" fill="${C.gold}"/>

<!-- face -->
<path d="M120 52C147 52 161 73 161 100C161 123 151 140 138 150C131 155 126 157 120 157C114 157 109 155 102 150C89 140 79 123 79 100C79 73 93 52 120 52Z" fill="url(#as-skin)"/>
<g clip-path="url(#as-face)">
  <path d="M120 52C147 52 161 73 161 100C161 123 151 140 138 150C131 155 126 157 120 157C114 157 109 155 102 150C89 140 79 123 79 100C79 73 93 52 120 52Z" fill="none" stroke="url(#as-rimL)" stroke-width="7" filter="url(#as-soft)"/>
  <path d="M120 52C147 52 161 73 161 100C161 123 151 140 138 150C131 155 126 157 120 157C114 157 109 155 102 150C89 140 79 123 79 100C79 73 93 52 120 52Z" fill="none" stroke="url(#as-rimR)" stroke-width="7" filter="url(#as-soft)"/>
  <ellipse cx="98" cy="124" rx="13" ry="9" fill="url(#as-cheek)"/>
  <ellipse cx="142" cy="124" rx="13" ry="9" fill="url(#as-cheek)"/>
  <!-- jaw and temple shading -->
  <path d="M86 128C94 146 108 154 120 155C132 154 146 146 154 128C150 150 134 160 120 160C106 160 90 150 86 128Z" fill="${C.skinShade}" opacity="0.45"/>
</g>

<!-- hair over the forehead: side-swept waves -->
<path d="M80 96C78 70 96 54 120 54C144 54 162 70 160 96C155 80 146 70 132 68C126 74 112 76 100 72C92 76 84 84 80 96Z" fill="url(#as-hair)"/>
<path d="M88 84C96 72 108 68 120 69M120 60C132 60 146 66 154 80M98 62C106 57 114 56 122 57" stroke="${C.hairDark}" stroke-width="1.5" fill="none" opacity="0.55"/>
<path d="M82 92C84 78 92 66 104 60" stroke="${C.cyan}" stroke-width="1.4" fill="none" opacity="0.45"/>
<path d="M158 92C156 78 150 68 140 62" stroke="${C.magenta}" stroke-width="1.4" fill="none" opacity="0.4"/>

${parts.upper}
${expr === 'cheer' || still ? '' : lids('as', [103.5, 136.5], 100.6, 9.6, 5, C.skin)}
<!-- crow's feet -->
<path d="M88 100L84 98M88 104L84 104M88 108L85 110M152 100L156 98M152 104L156 104M152 108L155 110" stroke="${C.skinShade}" stroke-width="1" opacity="0.8"/>

<!-- glasses -->
<g fill="none" stroke="${C.gold}" stroke-width="2.2">
  <circle cx="103.5" cy="102" r="13"/><circle cx="136.5" cy="102" r="13"/>
  <path d="M116.5 100C118.5 97.5 121.5 97.5 123.5 100"/>
  <path d="M90.5 100L80 97M149.5 100L160 97"/>
</g>
<path d="M95 94C98 91 102 90 106 90" stroke="#FFFFFF" stroke-width="1.6" opacity="0.55" fill="none" stroke-linecap="round"/>
<path d="M128 94C131 91 135 90 139 90" stroke="#FFFFFF" stroke-width="1.6" opacity="0.55" fill="none" stroke-linecap="round"/>

<!-- nose -->
<path d="M118 102C116 112 113 118 113 122C113 126 117 127 120 127C123 127 127 126 127 122" stroke="${C.skinShade}" stroke-width="1.8" fill="none" stroke-linecap="round"/>
<path d="M115 124C116 126 118 126 119 125M121 125C122 126 124 126 125 124" stroke="${C.skinDeep}" stroke-width="1.2" fill="none" opacity="0.7"/>
<path d="M121 104C122 110 124 116 125 120" stroke="#FFF2E6" stroke-width="1.6" fill="none" opacity="0.55" stroke-linecap="round"/>

<!-- smile and laugh lines -->
<path d="M108 120C104 126 104 132 107 136M132 120C136 126 136 132 133 136" stroke="${C.skinShade}" stroke-width="1.4" fill="none" opacity="0.75"/>
${parts.mouth}

<!-- a ball of yarn with two needles -->
<g class="as-yarn">
<path d="M168 202L214 168" stroke="${C.chrome}" stroke-width="3" stroke-linecap="round"/>
<path d="M176 214L222 190" stroke="${C.chrome}" stroke-width="3" stroke-linecap="round"/>
<circle cx="214" cy="168" r="3.6" fill="${C.gold}"/><circle cx="222" cy="190" r="3.6" fill="${C.gold}"/>
<circle cx="190" cy="214" r="22" fill="url(#as-yarn)"/>
<g fill="none" stroke="#7A0675" stroke-width="1.4" opacity="0.75">
  <path d="M172 204C182 196 200 198 208 210"/><path d="M170 214C182 206 202 208 211 220"/><path d="M174 225C186 218 202 220 208 230"/>
  <path d="M186 193C178 204 178 222 186 235"/><path d="M198 194C192 206 193 224 199 234"/>
</g>
<path d="M178 200C182 196 188 194 193 194" stroke="#FFC6FA" stroke-width="2" fill="none" opacity="0.8" stroke-linecap="round"/>
<path d="M170 222C160 228 152 236 150 240" stroke="${C.magenta}" stroke-width="2" fill="none"/>
</g>
</g>
</svg>`;
}
