// Jónas: a fisherman with a weathered face, a reddish beard going grey, a ribbed watch cap and a
// yellow oilskin with the collar up. Same lighting as Amma: cyan from the left, magenta from the right.
import { humanFace, motionStyle, breatheCSS, blinkCSS, lids, swayCSS, pulseCSS } from './lib.mjs';

const f = (n) => Math.round(n * 10) / 10;
const C = {
  night0: '#0A0A16', blue: '#0080FF', cyan: '#00FFFF', magenta: '#FF10F0', pink: '#FF006E', gold: '#FFD700', chrome: '#C0C0C0',
  skin: '#E9B892', skinMid: '#CF9273', skinShade: '#9C5F4F', skinDeep: '#5E3644',
  beard: '#C98654', beardMid: '#A9693F', beardDark: '#6E4129', grey: '#DCD6D2',
  cap: '#C4126E', capDark: '#7E0A47', capLight: '#E63A8E',
  coat: '#FFD21A', coatMid: '#E0AE00', coatDark: '#9C7600',
  knit: '#27305E', knitDark: '#1A2046',
};

// The approved happy face, kept exactly as drawn.
const HAPPY_UPPER = `<!-- bushy brows -->
<path d="M90 92C96 86 106 86 113 90L112 93C106 90 98 90 91 95Z" fill="${C.beardMid}"/>
<path d="M150 92C144 86 134 86 127 90L128 93C134 90 142 90 149 95Z" fill="${C.beardMid}"/>
<path d="M93 90C99 87 106 87 111 90M147 90C141 87 134 87 129 90" stroke="${C.grey}" stroke-width="0.9" fill="none" opacity="0.7"/>

<!-- eyes: squinting into the wind, smiling -->
<path d="M95 104C99 100 107 100 111 104C107 106 99 106 95 104Z" fill="#FBF3EC"/>
<path d="M129 104C133 100 141 100 145 104C141 106 133 106 129 104Z" fill="#FBF3EC"/>
<circle cx="103" cy="103.6" r="2.9" fill="#3E7FA6"/><circle cx="137" cy="103.6" r="2.9" fill="#3E7FA6"/>
<circle cx="103" cy="103.6" r="1.5" fill="${C.night0}"/><circle cx="137" cy="103.6" r="1.5" fill="${C.night0}"/>
<circle cx="104.1" cy="102.6" r="0.8" fill="#FFFFFF"/><circle cx="138.1" cy="102.6" r="0.8" fill="#FFFFFF"/>
<path d="M94 104C99 99 107 99 112 104M128 104C133 99 141 99 146 104" stroke="${C.skinDeep}" stroke-width="1.9" fill="none" stroke-linecap="round"/>
<path d="M96 107C101 109 106 109 110 107M130 107C134 109 139 109 144 107" stroke="${C.skinShade}" stroke-width="1.2" fill="none"/>
<path d="M89 103L85 101M89 107L85 107M90 111L86 113M151 103L155 101M151 107L155 107M150 111L154 113" stroke="${C.skinShade}" stroke-width="1.1"/>

`;
const HAPPY_MOUTH = `<path d="M109 137C114 141 126 141 131 137" stroke="${C.skinDeep}" stroke-width="2" fill="none" stroke-linecap="round"/>
<path d="M112 140C116 143 124 143 128 140" stroke="#B95A5E" stroke-width="2" fill="none" stroke-linecap="round" opacity="0.8"/>

`;

export function jonas(expr = 'happy', { still = false } = {}) {
  const MOTION = breatheCSS('jo', 5.2) + blinkCSS('jo', 6.2) + pulseCSS('jo-pin', 0.75, 1, 2.8);
  const face = 'M120 58C146 58 162 78 163 104C164 126 156 146 142 158C134 165 127 168 120 168C113 168 106 165 98 158C84 146 76 126 77 104C78 78 94 58 120 58Z';
  // ribbing on the cap's turned-up band
  const ribs = Array.from({ length: 23 }, (_, i) => {
    const x = 74 + i * 4.2;
    return `<path d="M${f(x)} 76V92" stroke="${C.capDark}" stroke-width="1.3" opacity="0.7"/>`;
  }).join('');
  // beard texture: short curved strands scattered over the beard, flowing down and outward
  // from the chin's center line. Seeded, so every build draws the same beard.
  let seed = 7;
  const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const inBeard = (x, y) => {
    const top = 126 + Math.abs(x - 120) * -0.05 + (Math.abs(x - 120) < 16 ? 8 : 0);
    const half = 39 - Math.max(0, y - 140) * 0.9;
    return y > top && y < 172 && Math.abs(x - 120) < half;
  };
  const strands = [];
  const tones = [[C.beardDark, 0.4], [C.beardDark, 0.4], ['#E4A574', 0.55], [C.grey, 0.55]];
  for (let n = 0; strands.length < 90 && n < 2000; n++) {
    const x = 82 + rand() * 76;
    const y = 120 + rand() * 52;
    if (!inBeard(x, y)) continue;
    const out = (x - 120) / 40;
    const len = 5 + rand() * 6;
    const dx = out * 3 + (rand() - 0.5) * 2;
    if (!inBeard(x + dx, y + len + 1)) continue;
    const [tone, op] = tones[Math.floor(rand() * tones.length)];
    strands.push(`<path d="M${f(x)} ${f(y)}q${f(dx * 0.3)} ${f(len * 0.5)} ${f(dx)} ${f(len)}" stroke="${tone}" stroke-width="${f(0.8 + rand() * 0.6)}" fill="none" stroke-linecap="round" opacity="${op}"/>`);
  }
  const parts = expr === 'happy'
    ? { upper: HAPPY_UPPER, mouth: HAPPY_MOUTH }
    : humanFace(expr, {
      prefix: 'jo', eyes: [103, 137], eyeY: 103.8, eyeW: 8, irisR: 2.9, iris: '#3E7FA6', lid: C.skinDeep, lidW: 1.9,
      brows: { y: 88, inner: 9, outer: 12, color: C.beardMid, width: 4 },
      mouth: [120, 138, 11], lip: '#B95A5E', skinShade: C.skinShade, skinDeep: C.skinDeep,
    });
  return `<svg viewBox="0 0 240 240" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Jónas">
${motionStyle(MOTION, still)}
<defs>
  <radialGradient id="jo-skin" cx="0.46" cy="0.4" r="0.62">
    <stop offset="0" stop-color="${C.skin}"/><stop offset="0.6" stop-color="${C.skinMid}"/><stop offset="1" stop-color="${C.skinShade}"/>
  </radialGradient>
  <linearGradient id="jo-rimL" x1="0" x2="1"><stop offset="0" stop-color="${C.cyan}" stop-opacity="0.9"/><stop offset="0.45" stop-color="${C.cyan}" stop-opacity="0"/></linearGradient>
  <linearGradient id="jo-rimR" x1="1" x2="0"><stop offset="0" stop-color="${C.magenta}" stop-opacity="0.85"/><stop offset="0.45" stop-color="${C.magenta}" stop-opacity="0"/></linearGradient>
  <linearGradient id="jo-sideL" x1="0" x2="1"><stop offset="0" stop-color="${C.cyan}" stop-opacity="0.28"/><stop offset="1" stop-color="${C.cyan}" stop-opacity="0"/></linearGradient>
  <linearGradient id="jo-sideR" x1="1" x2="0"><stop offset="0" stop-color="${C.magenta}" stop-opacity="0.35"/><stop offset="1" stop-color="${C.magenta}" stop-opacity="0"/></linearGradient>
  <linearGradient id="jo-beard" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="${C.beard}"/><stop offset="0.7" stop-color="${C.beardMid}"/><stop offset="1" stop-color="${C.beardDark}"/></linearGradient>
  <linearGradient id="jo-cap" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="${C.capLight}"/><stop offset="1" stop-color="${C.cap}"/></linearGradient>
  <linearGradient id="jo-coat" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="${C.coat}"/><stop offset="0.65" stop-color="${C.coatMid}"/><stop offset="1" stop-color="${C.coatDark}"/></linearGradient>
  <radialGradient id="jo-cheek" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#E0505A" stop-opacity="0.45"/><stop offset="1" stop-color="#E0505A" stop-opacity="0"/></radialGradient>
  <radialGradient id="jo-glow" cx="0.5" cy="0.5" r="0.5">
    <stop offset="0" stop-color="${C.blue}" stop-opacity="0.3"/><stop offset="0.6" stop-color="${C.magenta}" stop-opacity="0.1"/><stop offset="1" stop-color="${C.magenta}" stop-opacity="0"/>
  </radialGradient>
  <filter id="jo-soft" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="1.6"/></filter>
  <clipPath id="jo-face"><path d="${face}"/></clipPath>
  <clipPath id="jo-body"><path d="M16 240V216C18 190 50 176 88 170L120 178L152 170C190 176 222 190 224 216V240Z"/></clipPath>
</defs>
<circle cx="120" cy="112" r="104" fill="url(#jo-glow)"/>
<g class="jo-breathe">

<!-- neck and turtleneck -->
<path d="M102 150C104 164 102 172 96 178H144C138 172 136 164 138 150Z" fill="${C.skinShade}"/>
<path d="M92 172C98 164 142 164 148 172L150 186H90Z" fill="${C.knit}"/>
${Array.from({ length: 13 }, (_, i) => `<path d="M${f(94 + i * 4.3)} 170v14" stroke="${C.knitDark}" stroke-width="1.2"/>`).join('')}

<!-- oilskin coat with the collar up -->
<path d="M16 240V216C18 190 50 176 88 170L120 190L152 170C190 176 222 190 224 216V240Z" fill="url(#jo-coat)"/>
<g clip-path="url(#jo-body)">
  <path d="M120 190V240" stroke="${C.coatDark}" stroke-width="2"/>
  <path d="M124 196V240" stroke="#FFF1A8" stroke-width="1.2" opacity="0.6"/>
  <rect x="112" y="204" width="6" height="10" rx="2" fill="${C.night0}"/><rect x="112" y="224" width="6" height="10" rx="2" fill="${C.night0}"/>
  <path d="M40 240C44 220 50 206 58 196M200 240C196 220 190 206 182 196" stroke="${C.coatDark}" stroke-width="1.6" fill="none" opacity="0.7"/>
  <path d="M60 200C64 214 64 230 62 240M180 200C176 214 176 230 178 240" stroke="#FFF1A8" stroke-width="1.4" fill="none" opacity="0.45"/>
  <rect x="16" y="160" width="36" height="80" fill="url(#jo-sideL)"/>
  <rect x="188" y="160" width="36" height="80" fill="url(#jo-sideR)"/>
</g>
<!-- collar points -->
<path d="M88 170L80 156L112 182L120 190Z" fill="${C.coatMid}"/>
<path d="M152 170L160 156L128 182L120 190Z" fill="${C.coat}"/>
<path d="M80 156L112 182M160 156L128 182" stroke="${C.coatDark}" stroke-width="1.4"/>

<!-- ears -->
<path d="M79 104C72 102 70 113 73 120C75 126 80 128 83 125Z" fill="${C.skinMid}"/>
<path d="M161 104C168 102 170 113 167 120C165 126 160 128 157 125Z" fill="${C.skinMid}"/>

<!-- face -->
<path d="${face}" fill="url(#jo-skin)"/>
<g clip-path="url(#jo-face)">
  <path d="${face}" fill="none" stroke="url(#jo-rimL)" stroke-width="7" filter="url(#jo-soft)"/>
  <path d="${face}" fill="none" stroke="url(#jo-rimR)" stroke-width="7" filter="url(#jo-soft)"/>
  <ellipse cx="96" cy="120" rx="12" ry="8" fill="url(#jo-cheek)"/>
  <ellipse cx="144" cy="120" rx="12" ry="8" fill="url(#jo-cheek)"/>
  <path d="M86 96C94 90 104 90 112 94" stroke="${C.skinShade}" stroke-width="1" fill="none" opacity="0.6"/>
  <path d="M96 82C108 79 132 79 144 82" stroke="${C.skinShade}" stroke-width="1" fill="none" opacity="0.5"/>
  <path d="M100 86C110 84 130 84 140 86" stroke="${C.skinShade}" stroke-width="1" fill="none" opacity="0.45"/>
</g>

<!-- beard: full, from the cheekbones round the jaw -->
<path d="M80 112C82 132 88 150 100 162C108 170 114 174 120 175C126 174 132 170 140 162C152 150 158 132 160 112C156 124 150 128 144 128C136 128 130 124 120 124C110 124 104 128 96 128C90 128 84 124 80 112Z" fill="url(#jo-beard)"/>
${strands.join('')}
<path d="M81 114C83 134 90 150 100 161" stroke="${C.cyan}" stroke-width="2.2" fill="none" opacity="0.55" filter="url(#jo-soft)"/>
<path d="M159 114C157 134 150 150 140 161" stroke="${C.magenta}" stroke-width="2.2" fill="none" opacity="0.55" filter="url(#jo-soft)"/>
<!-- moustache and mouth -->
<path d="M104 132C110 126 116 126 120 129C124 126 130 126 136 132C132 135 126 134 120 133C114 134 108 135 104 132Z" fill="${C.beardMid}"/>
<path d="M106 132C112 128 116 128 120 130C124 128 128 128 134 132" stroke="${C.grey}" stroke-width="1" fill="none" opacity="0.6"/>
${parts.mouth}

${parts.upper}
${expr === 'cheer' || still ? '' : lids('jo', [103, 137], 103.8, 9.2, 4.6, C.skin)}
<!-- nose: broad, sunburnt -->
<path d="M117 104C115 113 111 119 111 124C111 128 115 129 120 129C125 129 129 128 129 124" stroke="${C.skinShade}" stroke-width="2" fill="none" stroke-linecap="round"/>
<ellipse cx="120" cy="124" rx="6" ry="3.6" fill="#E0505A" opacity="0.25"/>
<path d="M122 106C123 112 125 117 126 121" stroke="#FFF0E2" stroke-width="1.8" fill="none" opacity="0.5" stroke-linecap="round"/>

<!-- watch cap -->
<path d="M76 92C74 66 94 46 120 46C146 46 166 66 164 92Z" fill="url(#jo-cap)"/>
<path d="M90 58C98 51 108 48 118 48" stroke="#FF8CC0" stroke-width="2" fill="none" opacity="0.6" stroke-linecap="round"/>
${Array.from({ length: 9 }, (_, i) => `<path d="M${f(84 + i * 9)} ${f(60 - Math.sin((i / 8) * Math.PI) * 10)}V76" stroke="${C.capDark}" stroke-width="1" opacity="0.35"/>`).join('')}
<path d="M72 78C72 74 76 72 80 72H160C164 72 168 74 168 78V90C168 94 164 96 160 96H80C76 96 72 94 72 90Z" fill="${C.cap}"/>
${ribs}
<path d="M73 79C74 76 77 74 80 74" stroke="${C.cyan}" stroke-width="2" fill="none" opacity="0.75" filter="url(#jo-soft)"/>
<path d="M167 79C166 76 163 74 160 74" stroke="${C.magenta}" stroke-width="2" fill="none" opacity="0.75" filter="url(#jo-soft)"/>

<!-- an anchor pin on the coat -->
<g transform="translate(160 206)" class="jo-pin">
  <circle r="8" fill="${C.night0}" stroke="${C.cyan}" stroke-width="1.6"/>
  <path d="M0 -4.5V4.5M-3 -1.5H3M-4 1.5C-3.6 4 -1.6 5 0 5C1.6 5 3.6 4 4 1.5" stroke="${C.cyan}" stroke-width="1.4" fill="none" stroke-linecap="round"/>
  <circle cy="-5" r="1.3" fill="none" stroke="${C.cyan}" stroke-width="1.1"/>
</g>
</g>
</svg>`;
}
