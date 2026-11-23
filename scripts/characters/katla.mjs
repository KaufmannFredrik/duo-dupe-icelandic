// Katla: a student with long neon-dyed hair, retro headphones, freckles and a hoodie with a
// gold "Þ" pin. Same lighting as the others: cyan from the left, magenta from the right.
import { humanFace, motionStyle, breatheCSS, blinkCSS, lids, swayCSS, pulseCSS } from './lib.mjs';

const f = (n) => Math.round(n * 10) / 10;
const C = {
  night0: '#0A0A16', night2: '#232345', blue: '#0080FF', cyan: '#00FFFF', magenta: '#FF10F0', pink: '#FF006E', gold: '#FFD700', chrome: '#C0C0C0',
  skin: '#F6D2B8', skinMid: '#E2AB8E', skinShade: '#B57A6A', skinDeep: '#74465A',
  hairRoot: '#2A1D5C', hairMid: '#B0128C', hairTip: '#FF5AD9',
  hood: '#2C2F66', hoodDark: '#1B1D47', hoodLight: '#3D4290',
};

// The approved happy face, kept exactly as drawn.
const HAPPY_UPPER = `<!-- brows -->
<path d="M94 90C99 86 106 86 112 88" stroke="${C.hairRoot}" stroke-width="2.4" stroke-linecap="round" fill="none"/>
<path d="M128 88C134 86 141 86 146 90" stroke="${C.hairRoot}" stroke-width="2.4" stroke-linecap="round" fill="none"/>

<!-- eyes: big, bright, lashes and a small wing -->
<path d="M94 102C98 96 108 95 113 101C109 106 99 107 94 102Z" fill="#FFFFFF"/>
<path d="M127 101C132 95 142 96 146 102C141 107 131 106 127 101Z" fill="#FFFFFF"/>
<circle cx="103.5" cy="101.2" r="4.4" fill="url(#ka-iris)"/><circle cx="136.5" cy="101.2" r="4.4" fill="url(#ka-iris)"/>
<circle cx="103.5" cy="101.2" r="2" fill="${C.night0}"/><circle cx="136.5" cy="101.2" r="2" fill="${C.night0}"/>
<circle cx="105" cy="99.6" r="1.2" fill="#FFFFFF"/><circle cx="138" cy="99.6" r="1.2" fill="#FFFFFF"/>
<circle cx="102.4" cy="103" r="0.6" fill="#FFFFFF" opacity="0.8"/><circle cx="135.4" cy="103" r="0.6" fill="#FFFFFF" opacity="0.8"/>
<path d="M93 102C98 95 108 94 114 100L116 97M147 102C142 95 132 94 126 100L124 97" stroke="${C.night0}" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M97 106C101 108 107 108 111 105M129 105C133 108 139 108 143 106" stroke="${C.skinShade}" stroke-width="1" fill="none"/>

`;
const HAPPY_MOUTH = `<!-- mouth: a lopsided, friendly smile -->
<path d="M109 132C114 137 126 137 132 131C126 133 114 134 109 132Z" fill="#C6456A"/>
<path d="M108 132C114 139 126 139 133 130" stroke="${C.skinDeep}" stroke-width="1.7" fill="none" stroke-linecap="round"/>
<path d="M114 138C118 140 123 140 127 138" stroke="#E07A90" stroke-width="1.6" fill="none" opacity="0.8" stroke-linecap="round"/>

`;

export function katla(expr = 'happy', { still = false } = {}) {
  const MOTION = breatheCSS('ka', 4.2) + blinkCSS('ka', 4.8) + pulseCSS('ka-led1', 0.35, 1, 1.4) + pulseCSS('ka-led2', 0.35, 1, 1.4, 0.7);
  const face = 'M120 58C143 58 157 76 157 100C157 120 149 138 137 148C131 153 126 155 120 155C114 155 109 153 103 148C91 138 83 120 83 100C83 76 97 58 120 58Z';
  // freckles across the nose and cheeks, seeded
  let seed = 11;
  const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const freckles = Array.from({ length: 20 }, () => {
    const side = rand() < 0.5 ? -1 : 1;
    const x = 120 + side * (6 + rand() * 24);
    const y = 112 + rand() * 12 - Math.abs(x - 120) * 0.08;
    return `<circle cx="${f(x)}" cy="${f(y)}" r="${f(0.45 + rand() * 0.5)}" fill="#A8604E" opacity="${f(0.3 + rand() * 0.25)}"/>`;
  }).join('');
  // strands in the long hair
  const strands = [];
  for (let i = 0; i < 14; i++) {
    const side = i % 2 ? 1 : -1;
    const x = 120 + side * (40 + (i % 7) * 3.2);
    strands.push(`<path d="M${f(x)} ${f(96 + (i % 5) * 6)}C${f(x + side * 4)} ${f(130 + (i % 3) * 8)} ${f(x + side * 2)} ${f(160 + (i % 4) * 6)} ${f(x + side * 6)} ${f(190 + (i % 3) * 6)}" stroke="${i % 3 ? '#FF8DE6' : C.hairRoot}" stroke-width="1.2" fill="none" opacity="${i % 3 ? 0.45 : 0.35}"/>`);
  }
  const parts = expr === 'happy'
    ? { upper: HAPPY_UPPER, mouth: HAPPY_MOUTH }
    : humanFace(expr, {
      prefix: 'ka', eyes: [103.5, 136.5], eyeY: 101.4, eyeW: 9.5, eyeOpen: 6.4, wing: true, irisR: 4.4, iris: 'url(#ka-iris)', lid: C.night0, lidW: 2,
      brows: { y: 87, inner: 8.5, outer: 9.5, color: C.hairRoot, width: 2.4 },
      mouth: [120.5, 133, 12], lip: '#E07A90', skinShade: C.skinShade, skinDeep: C.skinDeep,
    });
  return `<svg viewBox="0 0 240 240" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Katla">
${motionStyle(MOTION, still)}
<defs>
  <radialGradient id="ka-skin" cx="0.46" cy="0.42" r="0.62">
    <stop offset="0" stop-color="${C.skin}"/><stop offset="0.62" stop-color="${C.skinMid}"/><stop offset="1" stop-color="${C.skinShade}"/>
  </radialGradient>
  <linearGradient id="ka-hair" x1="0" x2="0" y1="0" y2="1">
    <stop offset="0" stop-color="${C.hairRoot}"/><stop offset="0.35" stop-color="#6A1878"/><stop offset="0.7" stop-color="${C.hairMid}"/><stop offset="1" stop-color="${C.hairTip}"/>
  </linearGradient>
  <linearGradient id="ka-fringe" x1="0" x2="1" y1="0" y2="1">
    <stop offset="0" stop-color="${C.hairRoot}"/><stop offset="1" stop-color="${C.hairMid}"/>
  </linearGradient>
  <linearGradient id="ka-rimL" x1="0" x2="1"><stop offset="0" stop-color="${C.cyan}" stop-opacity="0.9"/><stop offset="0.45" stop-color="${C.cyan}" stop-opacity="0"/></linearGradient>
  <linearGradient id="ka-rimR" x1="1" x2="0"><stop offset="0" stop-color="${C.magenta}" stop-opacity="0.85"/><stop offset="0.45" stop-color="${C.magenta}" stop-opacity="0"/></linearGradient>
  <linearGradient id="ka-sideL" x1="0" x2="1"><stop offset="0" stop-color="${C.cyan}" stop-opacity="0.45"/><stop offset="1" stop-color="${C.cyan}" stop-opacity="0"/></linearGradient>
  <linearGradient id="ka-sideR" x1="1" x2="0"><stop offset="0" stop-color="${C.magenta}" stop-opacity="0.45"/><stop offset="1" stop-color="${C.magenta}" stop-opacity="0"/></linearGradient>
  <linearGradient id="ka-hood" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="${C.hoodLight}"/><stop offset="0.55" stop-color="${C.hood}"/><stop offset="1" stop-color="${C.hoodDark}"/></linearGradient>
  <linearGradient id="ka-band" x1="0" x2="1"><stop offset="0" stop-color="#E9ECF5"/><stop offset="0.5" stop-color="${C.chrome}"/><stop offset="1" stop-color="#7F82A6"/></linearGradient>
  <radialGradient id="ka-cup" cx="0.4" cy="0.35" r="0.7"><stop offset="0" stop-color="#3C3F7E"/><stop offset="1" stop-color="${C.night0}"/></radialGradient>
  <radialGradient id="ka-cheek" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="${C.pink}" stop-opacity="0.3"/><stop offset="1" stop-color="${C.pink}" stop-opacity="0"/></radialGradient>
  <radialGradient id="ka-iris" cx="0.5" cy="0.4" r="0.6"><stop offset="0" stop-color="#7FF0D2"/><stop offset="0.6" stop-color="#1E9E86"/><stop offset="1" stop-color="#0D5A55"/></radialGradient>
  <radialGradient id="ka-glow" cx="0.5" cy="0.5" r="0.5">
    <stop offset="0" stop-color="${C.cyan}" stop-opacity="0.2"/><stop offset="0.6" stop-color="${C.magenta}" stop-opacity="0.12"/><stop offset="1" stop-color="${C.magenta}" stop-opacity="0"/>
  </radialGradient>
  <filter id="ka-soft" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="1.6"/></filter>
  <filter id="ka-led" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="2.4"/></filter>
  <clipPath id="ka-face"><path d="${face}"/></clipPath>
  <clipPath id="ka-hairclip"><path d="M72 104C66 70 88 48 120 48C152 48 174 70 168 104C172 134 178 166 172 204C164 208 154 206 148 200C152 172 152 150 150 132L90 132C88 150 88 172 92 200C86 206 76 208 68 204C62 166 68 134 72 104Z"/></clipPath>
  <clipPath id="ka-body"><path d="M24 240V218C26 194 54 180 92 174L120 180L148 174C186 180 214 194 216 218V240Z"/></clipPath>
</defs>
<circle cx="120" cy="112" r="104" fill="url(#ka-glow)"/>
<g class="ka-breathe">

<!-- long hair behind the shoulders -->
<path d="M72 104C66 70 88 48 120 48C152 48 174 70 168 104C172 134 178 166 172 204C164 208 154 206 148 200C152 172 152 150 150 132L90 132C88 150 88 172 92 200C86 206 76 208 68 204C62 166 68 134 72 104Z" fill="url(#ka-hair)"/>
<g clip-path="url(#ka-hairclip)">${strands.join('')}</g>

<!-- neck -->
<path d="M106 144C108 158 106 168 100 176L120 184L140 176C134 168 132 158 134 144Z" fill="${C.skinShade}"/>

<!-- hoodie: body, the hood bunched behind the neck, drawstrings -->
<path d="M24 240V218C26 194 54 180 92 174L120 180L148 174C186 180 214 194 216 218V240Z" fill="url(#ka-hood)"/>
<path d="M84 176C88 166 104 162 120 166C136 162 152 166 156 176C150 186 136 190 120 190C104 190 90 186 84 176Z" fill="${C.hoodLight}"/>
<path d="M92 178C100 184 140 184 148 178" stroke="${C.hoodDark}" stroke-width="2" fill="none"/>
<g clip-path="url(#ka-body)">
  <rect x="24" y="160" width="34" height="80" fill="url(#ka-sideL)"/>
  <rect x="182" y="160" width="34" height="80" fill="url(#ka-sideR)"/>
  <path d="M60 240C62 222 66 208 72 198M180 240C178 222 174 208 168 198" stroke="${C.hoodDark}" stroke-width="1.6" fill="none"/>
</g>
<path d="M110 186C110 200 108 214 106 226M130 186C130 200 132 214 134 226" stroke="${C.cyan}" stroke-width="2" fill="none" stroke-linecap="round"/>
<rect x="103.5" y="224" width="5" height="9" rx="1.5" fill="${C.chrome}"/><rect x="131.5" y="224" width="5" height="9" rx="1.5" fill="${C.chrome}"/>
<!-- long hair falling over the front of the shoulders -->
<path d="M86 128C82 150 80 178 86 200C90 208 98 206 98 200C94 180 94 154 96 136Z" fill="url(#ka-hair)"/>
<path d="M154 128C158 150 160 178 154 200C150 208 142 206 142 200C146 180 146 154 144 136Z" fill="url(#ka-hair)"/>
<path d="M88 140C86 160 86 180 90 198" stroke="${C.cyan}" stroke-width="1.6" fill="none" opacity="0.6" filter="url(#ka-soft)"/>
<path d="M152 140C154 160 154 180 150 198" stroke="#FF9BE9" stroke-width="1.6" fill="none" opacity="0.6"/>
<!-- the Þ pin -->
<g transform="translate(168 210)">
  <circle r="11" fill="${C.gold}"/><circle r="11" fill="none" stroke="#B89A00" stroke-width="1.5"/>
  <path d="M-3 -6V6M-3 -3.2H1.5C4 -3.2 5 -1.8 5 0C5 1.8 4 3.2 1.5 3.2H-3" stroke="${C.night0}" stroke-width="2.2" fill="none" stroke-linejoin="round"/>
  <path d="M-7 -5C-5 -8 -2 -9 1 -9" stroke="#FFF6B0" stroke-width="1.4" fill="none" stroke-linecap="round"/>
</g>

<!-- face -->
<path d="${face}" fill="url(#ka-skin)"/>
<g clip-path="url(#ka-face)">
  <path d="${face}" fill="none" stroke="url(#ka-rimL)" stroke-width="7" filter="url(#ka-soft)"/>
  <path d="${face}" fill="none" stroke="url(#ka-rimR)" stroke-width="7" filter="url(#ka-soft)"/>
  <ellipse cx="99" cy="120" rx="11" ry="7" fill="url(#ka-cheek)"/>
  <ellipse cx="141" cy="120" rx="11" ry="7" fill="url(#ka-cheek)"/>
  <path d="M90 130C96 144 108 152 120 153C132 152 144 144 150 130C146 148 134 158 120 158C106 158 94 148 90 130Z" fill="${C.skinShade}" opacity="0.4"/>
</g>
${freckles}

${parts.upper}
${expr === 'cheer' || still ? '' : lids('ka', [103.5, 136.5], 101.4, 10.6, 6.2, C.skin)}
<!-- nose -->
<path d="M119 104C118 112 115 117 115 120C115 123 118 124 120 124C122 124 125 123 125 120" stroke="${C.skinShade}" stroke-width="1.6" fill="none" stroke-linecap="round"/>
<path d="M122 106C123 111 124 115 124 118" stroke="#FFF4EA" stroke-width="1.5" fill="none" opacity="0.6" stroke-linecap="round"/>

${parts.mouth}

<!-- side-swept fringe -->
<path d="M84 98C80 74 96 56 120 56C144 56 160 72 158 96C150 82 140 74 126 72C116 80 100 86 88 98C86 98 85 98 84 98Z" fill="url(#ka-fringe)"/>
<path d="M120 58C110 62 100 72 92 88M130 60C122 66 112 76 104 84M146 68C140 70 132 72 126 72" stroke="#FF6CDD" stroke-width="1.4" fill="none" opacity="0.55"/>
<path d="M86 94C86 78 96 64 110 59" stroke="${C.cyan}" stroke-width="1.6" fill="none" opacity="0.6" filter="url(#ka-soft)"/>

<!-- headphones -->
<path d="M74 104C70 64 92 40 120 40C148 40 170 64 166 104" stroke="url(#ka-band)" stroke-width="7" fill="none" stroke-linecap="round"/>
<path d="M78 92C78 64 96 46 120 45" stroke="#FFFFFF" stroke-width="1.6" fill="none" opacity="0.6" stroke-linecap="round"/>
<rect x="64" y="94" width="22" height="36" rx="10" fill="url(#ka-cup)" stroke="${C.cyan}" stroke-width="2"/>
<rect x="154" y="94" width="22" height="36" rx="10" fill="url(#ka-cup)" stroke="${C.magenta}" stroke-width="2"/>
<path d="M68 104C68 99 71 97 74 97" stroke="#FFFFFF" stroke-width="1.4" fill="none" opacity="0.5" stroke-linecap="round"/>
<circle cx="75" cy="122" r="2.8" fill="${C.cyan}" filter="url(#ka-led)" class="ka-led1"/><circle cx="75" cy="122" r="1.6" fill="#E8FFFF"/>
<circle cx="165" cy="122" r="2.8" fill="${C.magenta}" filter="url(#ka-led)" class="ka-led2"/><circle cx="165" cy="122" r="1.6" fill="#FFE0FC"/>
</g>
</svg>`;
}
