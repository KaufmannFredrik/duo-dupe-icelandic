// Elias: a learner like the app's users, a young Norwegian who has just moved to Reykjavík. Dark
// curly hair, a quilted puffer jacket against the cold, a magenta scarf like Tala's and a small
// Norwegian flag pin. Same lighting as the others: cyan from the left, magenta from the right.
import { f, humanFace, seeded, motionStyle, breatheCSS, blinkCSS, lids, swayCSS, pulseCSS } from './lib.mjs';

const C = {
  night0: '#0A0A16', blue: '#0080FF', cyan: '#00FFFF', magenta: '#FF10F0', pink: '#FF006E', gold: '#FFD700', chrome: '#C0C0C0',
  skin: '#C38B63', skinMid: '#A06A47', skinShade: '#7A4C33', skinDeep: '#45272A',
  hair: '#22161A', hairSheen: '#5B3A6E',
  jacket: '#1BA8C4', jacketLight: '#62E2F0', jacketDark: '#0D5C78',
  scarf: '#FF10F0', scarfShade: '#B00CA8',
};

export function elias(expr = 'happy', { still = false } = {}) {
  const MOTION = breatheCSS('el', 4.8) + blinkCSS('el', 5.8) + swayCSS('el-scarf', 2.5, 3.6, '30% 0%');
  const face = 'M120 57C144 57 158 76 158 101C158 122 150 140 138 150C131 155 126 157 120 157C114 157 109 155 102 150C90 140 82 122 82 101C82 76 96 57 120 57Z';
  const parts = humanFace(expr, {
    prefix: 'el', eyes: [103.5, 136.5], eyeY: 101.5, eyeW: 8.6, eyeOpen: 5.4, irisR: 3.9, iris: 'url(#el-iris)', lid: C.skinDeep, lidW: 2.1,
    brows: { y: 87, inner: 8.5, outer: 10.5, color: '#1A1013', width: 3.2 },
    mouth: [120, 134, 11], lip: '#8E4A4E', skinShade: C.skinShade, skinDeep: C.skinDeep,
  });
  // curls: overlapping circles over the crown and temples, each with a small sheen arc
  const rand = seeded(19);
  const curls = [];
  for (let i = 0; i < 34; i++) {
    const t = i / 33;
    const a = Math.PI * (1.02 + t * 0.96);
    const ring = 44 + (i % 3) * 5;
    const x = 120 + Math.cos(a) * ring * 1.02 + (rand() - 0.5) * 4;
    const y = 92 + Math.sin(a) * ring * 0.92 + (rand() - 0.5) * 4;
    const r = 7 + rand() * 3.4;
    curls.push(`<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="${C.hair}"/>`);
    const sheen = x < 120 ? C.cyan : C.hairSheen;
    curls.push(`<path d="M${f(x - r * 0.6)} ${f(y - r * 0.2)}A${f(r * 0.7)} ${f(r * 0.7)} 0 0 1 ${f(x + r * 0.3)} ${f(y - r * 0.6)}" stroke="${sheen}" stroke-width="1.2" fill="none" opacity="${x < 100 ? 0.6 : 0.45}"/>`);
  }
  const seams = [176, 192, 208, 224].map((y, i) => `<path d="M24 ${y + 8}C70 ${y - 2} 170 ${y - 2} 216 ${y + 8}" stroke="${C.jacketDark}" stroke-width="1.6" fill="none" opacity="${0.75 - i * 0.05}"/><path d="M26 ${y + 5}C70 ${y - 5} 170 ${y - 5} 214 ${y + 5}" stroke="${C.jacketLight}" stroke-width="1" fill="none" opacity="0.4"/>`).join('');
  return `<svg viewBox="0 0 240 240" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Elias">
${motionStyle(MOTION, still)}
<defs>
  <radialGradient id="el-skin" cx="0.46" cy="0.42" r="0.62">
    <stop offset="0" stop-color="${C.skin}"/><stop offset="0.62" stop-color="${C.skinMid}"/><stop offset="1" stop-color="${C.skinShade}"/>
  </radialGradient>
  <radialGradient id="el-iris" cx="0.5" cy="0.4" r="0.6"><stop offset="0" stop-color="#A8764E"/><stop offset="0.6" stop-color="#5E3822"/><stop offset="1" stop-color="#2E1A10"/></radialGradient>
  <linearGradient id="el-rimL" x1="0" x2="1"><stop offset="0" stop-color="${C.cyan}" stop-opacity="0.9"/><stop offset="0.45" stop-color="${C.cyan}" stop-opacity="0"/></linearGradient>
  <linearGradient id="el-rimR" x1="1" x2="0"><stop offset="0" stop-color="${C.magenta}" stop-opacity="0.85"/><stop offset="0.45" stop-color="${C.magenta}" stop-opacity="0"/></linearGradient>
  <linearGradient id="el-sideL" x1="0" x2="1"><stop offset="0" stop-color="${C.cyan}" stop-opacity="0.4"/><stop offset="1" stop-color="${C.cyan}" stop-opacity="0"/></linearGradient>
  <linearGradient id="el-sideR" x1="1" x2="0"><stop offset="0" stop-color="${C.magenta}" stop-opacity="0.5"/><stop offset="1" stop-color="${C.magenta}" stop-opacity="0"/></linearGradient>
  <linearGradient id="el-jacket" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="${C.jacketLight}"/><stop offset="0.45" stop-color="${C.jacket}"/><stop offset="1" stop-color="${C.jacketDark}"/></linearGradient>
  <linearGradient id="el-scarf" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#FF6BF5"/><stop offset="0.6" stop-color="${C.scarf}"/><stop offset="1" stop-color="${C.scarfShade}"/></linearGradient>
  <radialGradient id="el-cheek" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="${C.pink}" stop-opacity="0.22"/><stop offset="1" stop-color="${C.pink}" stop-opacity="0"/></radialGradient>
  <radialGradient id="el-glow" cx="0.5" cy="0.5" r="0.5">
    <stop offset="0" stop-color="${C.cyan}" stop-opacity="0.18"/><stop offset="0.6" stop-color="${C.blue}" stop-opacity="0.12"/><stop offset="1" stop-color="${C.blue}" stop-opacity="0"/>
  </radialGradient>
  <filter id="el-soft" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="1.6"/></filter>
  <clipPath id="el-face"><path d="${face}"/></clipPath>
  <clipPath id="el-body"><path d="M20 240V214C22 190 52 176 92 170L120 176L148 170C188 176 218 190 220 214V240Z"/></clipPath>
</defs>
<circle cx="120" cy="112" r="104" fill="url(#el-glow)"/>
<g class="el-breathe">

<!-- neck -->
<path d="M105 146C107 158 105 166 100 172L120 180L140 172C135 166 133 158 135 146Z" fill="${C.skinShade}"/>

<!-- puffer jacket, quilted -->
<path d="M20 240V214C22 190 52 176 92 170L120 176L148 170C188 176 218 190 220 214V240Z" fill="url(#el-jacket)"/>
<g clip-path="url(#el-body)">
  ${seams}
  <path d="M120 186V240" stroke="${C.jacketDark}" stroke-width="2.2"/>
  <path d="M123 190V240" stroke="${C.chrome}" stroke-width="1.4" opacity="0.7"/>
  <rect x="20" y="160" width="36" height="80" fill="url(#el-sideL)"/>
  <rect x="184" y="160" width="36" height="80" fill="url(#el-sideR)"/>
</g>
<!-- high collar -->
<path d="M88 170C92 160 104 156 120 160C136 156 148 160 152 170L148 188C140 182 130 180 120 182C110 180 100 182 92 188Z" fill="${C.jacket}"/>
<path d="M92 172C104 166 136 166 148 172" stroke="${C.jacketLight}" stroke-width="1.4" fill="none" opacity="0.6"/>

<!-- scarf, wound once with a tail, like Tala's -->
<path d="M90 164C100 172 140 172 150 164L152 176C140 184 100 184 88 176Z" fill="url(#el-scarf)"/>
<path d="M92 170C104 176 136 176 148 170" stroke="${C.scarfShade}" stroke-width="1.6" fill="none"/>
<g class="el-scarf"><path d="M132 174L146 214L134 216L122 178Z" fill="url(#el-scarf)"/>
<path d="M134 186L140 202" stroke="${C.scarfShade}" stroke-width="1.4"/>
<path d="M135 214v5M139 213.6v5.4M143 213.2v4.8" stroke="${C.scarf}" stroke-width="2" stroke-linecap="round"/></g>

<!-- Norwegian flag pin -->
<g transform="translate(166 196)">
  <rect x="-10" y="-7" width="20" height="14" rx="1.6" fill="#BA0C2F" stroke="#FFFFFF" stroke-width="0.8"/>
  <path d="M-3.6 -7V7M-10 0H10" stroke="#FFFFFF" stroke-width="4"/>
  <path d="M-3.6 -7V7M-10 0H10" stroke="#00205B" stroke-width="2"/>
  <path d="M-8 -5.4C-6 -6.4 -3 -6.6 0 -6.4" stroke="#FFFFFF" stroke-width="0.9" fill="none" opacity="0.6"/>
</g>

<!-- ears -->
<path d="M83 100C76 98 74 109 77 116C79 122 83 124 86 121Z" fill="${C.skinMid}"/>
<path d="M157 100C164 98 166 109 163 116C161 122 157 124 154 121Z" fill="${C.skinMid}"/>

<!-- face -->
<path d="${face}" fill="url(#el-skin)"/>
<g clip-path="url(#el-face)">
  <path d="${face}" fill="none" stroke="url(#el-rimL)" stroke-width="7" filter="url(#el-soft)"/>
  <path d="${face}" fill="none" stroke="url(#el-rimR)" stroke-width="7" filter="url(#el-soft)"/>
  <ellipse cx="99" cy="121" rx="11" ry="7" fill="url(#el-cheek)"/>
  <ellipse cx="141" cy="121" rx="11" ry="7" fill="url(#el-cheek)"/>
  <path d="M90 132C96 146 108 154 120 155C132 154 144 146 150 132C146 150 134 160 120 160C106 160 94 150 90 132Z" fill="${C.skinShade}" opacity="0.4"/>
</g>

${parts.upper}
${expr === 'cheer' || still ? '' : lids('el', [103.5, 136.5], 101.5, 10, 5.8, C.skin)}

<!-- nose -->
<path d="M118 104C116 113 113 118 113 122C113 126 117 127 120 127C123 127 127 126 127 122" stroke="${C.skinShade}" stroke-width="1.8" fill="none" stroke-linecap="round"/>
<path d="M115 124C116 126 118 126 119 125M121 125C122 126 124 126 125 124" stroke="${C.skinDeep}" stroke-width="1.2" fill="none" opacity="0.7"/>
<path d="M122 106C123 112 124 116 125 119" stroke="#E8B48C" stroke-width="1.6" fill="none" opacity="0.6" stroke-linecap="round"/>

${parts.mouth}

<!-- curly hair -->
${curls.join('')}
<path d="M84 96C84 80 92 66 104 60" stroke="${C.cyan}" stroke-width="2.2" fill="none" opacity="0.55" filter="url(#el-soft)"/>
<path d="M156 96C156 80 148 66 136 60" stroke="${C.magenta}" stroke-width="2.2" fill="none" opacity="0.5" filter="url(#el-soft)"/>
</g>
</svg>`;
}
