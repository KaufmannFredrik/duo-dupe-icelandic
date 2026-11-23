// Hekla: a talking volcano. A synthwave mountain with neon contour lines, a snow cap, a glowing
// crater and lava trickles, a steam plume, and a friendly face in the rock. Cyan light from the
// left, magenta from the right, on a glowing horizon line.
import { seeded, motionStyle, breatheCSS, blinkCSS, lids, swayCSS, pulseCSS } from './lib.mjs';

const f = (n) => Math.round(n * 10) / 10;
const C = {
  night0: '#0A0A16', night2: '#232345', blue: '#0080FF', cyan: '#00FFFF', magenta: '#FF10F0', pink: '#FF006E', gold: '#FFD700',
  rock: '#3B2C6E', rockMid: '#2A2156', rockDark: '#17133A',
  snow: '#F2F4FF', snowShade: '#B8BEE6',
  lava: '#FF7A1A', lavaHot: '#FFE066',
};

export function hekla(expr = 'happy', { still = false } = {}) {
  const MOTION = breatheCSS('he', 6) + blinkCSS('he', 5.6) + pulseCSS('he-lava', 0.3, 0.8, 2.4) + pulseCSS('he-spark', 0.2, 1, 1.6) + pulseCSS('he-spark2', 0.2, 1, 1.6, 0.8) + '.he-steam{animation:he-steam 5.5s ease-in-out infinite}@keyframes he-steam{0%,100%{transform:translateY(0);opacity:1}50%{transform:translateY(-5px);opacity:0.75}}';
  const mountain = 'M14 214C40 196 58 170 72 146C84 124 92 96 98 74C104 66 112 63 120 64C128 63 137 65 144 72C150 96 158 122 170 144C184 170 202 196 226 214Z';
  // contour lines: horizontal slices of the mountain, curved to suggest its roundness
  const contours = [];
  for (let i = 0; i < 7; i++) {
    const y = 106 + i * 16;
    const half = 22 + (y - 74) * 0.66;
    contours.push(`<path d="M${f(120 - half)} ${y}C${f(120 - half * 0.5)} ${f(y + 6)} ${f(120 + half * 0.5)} ${f(y + 6)} ${f(120 + half)} ${y}" stroke="${C.cyan}" stroke-width="1" fill="none" opacity="${f(0.16 + i * 0.02)}"/>`);
  }
  // ridges running down the slopes
  const ridges = [-0.8, -0.35, 0.35, 0.8].map((k) => `<path d="M${f(120 + k * 18)} 76C${f(120 + k * 34)} 130 ${f(120 + k * 62)} 176 ${f(120 + k * 98)} 214" stroke="${C.magenta}" stroke-width="1" fill="none" opacity="0.18"/>`).join('');
  // The face by expression: brows are rock ridges, eyes dark with gold pupils, the mouth glows.
  const brow = (x1, y1, xm, ym, x2, y2) => `<path d="M${x1} ${y1}Q${xm} ${ym} ${x2} ${y2}" stroke="${C.rockDark}" stroke-width="3.4" fill="none" stroke-linecap="round"/>`;
  const eyeOpen = (cx, dx, dy) => `<ellipse cx="${cx}" cy="143" rx="7.5" ry="9" fill="${C.night0}"/><ellipse cx="${cx + dx}" cy="${145 + dy}" rx="4" ry="5" fill="${C.gold}" opacity="0.9"/><circle cx="${cx + 2.5 + dx}" cy="${139.5 + dy}" r="2.4" fill="#FFFFFF"/><circle cx="${cx - 2.5 + dx}" cy="${148 + dy}" r="1" fill="#FFFFFF" opacity="0.8"/>`;
  const eyeClosed = (cx) => `<path d="M${cx - 8} 146Q${cx} 134 ${cx + 8} 146" stroke="${C.night0}" stroke-width="3.6" fill="none" stroke-linecap="round"/>`;
  const cheeks = (o) => `<ellipse cx="96" cy="160" rx="12" ry="7" fill="url(#he-cheek)" opacity="${o}"/><ellipse cx="146" cy="160" rx="12" ry="7" fill="url(#he-cheek)" opacity="${o}"/>`;
  const face = {
    happy: `${cheeks(1)}${brow(88, 130, 98, 125, 108, 129)}${brow(134, 129, 144, 125, 154, 130)}${eyeOpen(98, 0, 0)}${eyeOpen(144, 0, 0)}
<path d="M106 162C110 174 132 174 136 162C128 166 114 166 106 162Z" fill="${C.night0}"/>
<path d="M112 168C116 172 126 172 130 168C126 167 116 167 112 168Z" fill="${C.lava}"/>
<path d="M104 161C110 176 132 176 138 161" stroke="${C.rockDark}" stroke-width="2.4" fill="none" stroke-linecap="round"/>`,
    cheer: `${cheeks(1)}${brow(88, 126, 98, 119, 108, 124)}${brow(134, 124, 144, 119, 154, 126)}${eyeClosed(98)}${eyeClosed(144)}
<path d="M103 159C106 180 136 180 139 159C128 163 114 163 103 159Z" fill="${C.night0}"/>
<path d="M110 168C114 176 128 176 132 168C126 166 116 166 110 168Z" fill="${C.lava}"/>
<path d="M114 166C118 171 124 171 128 166" fill="${C.lavaHot}"/>
<path d="M101 158C106 182 136 182 141 158" stroke="${C.rockDark}" stroke-width="2.4" fill="none" stroke-linecap="round"/>`,
    thinking: `${cheeks(0.6)}${brow(88, 130, 98, 126, 108, 129)}${brow(134, 124, 144, 116, 154, 124)}${eyeOpen(98, 2, -3)}${eyeOpen(144, 2, -3)}
<path d="M114 168Q122 166 132 163" stroke="${C.rockDark}" stroke-width="2.6" fill="none" stroke-linecap="round"/>
<path d="M133 161q2 2 0.5 4" stroke="${C.rockDark}" stroke-width="1.6" fill="none" stroke-linecap="round"/>`,
    sorry: `${cheeks(0.4)}${brow(88, 131, 98, 129, 108, 124)}${brow(134, 124, 144, 129, 154, 131)}${eyeOpen(98, -0.6, 2.4)}${eyeOpen(144, -0.6, 2.4)}
<path d="M110 170Q121 163 132 170" stroke="${C.rockDark}" stroke-width="2.6" fill="none" stroke-linecap="round"/>`,
  }[expr];
  // a cheer sends up more sparks; a sorry volcano only steams a little
  const sparks = expr === 'cheer'
    ? `<circle cx="80" cy="40" r="2" fill="${C.gold}"/><circle cx="176" cy="48" r="2.2" fill="${C.gold}"/><circle cx="70" cy="62" r="1.6" fill="${C.lavaHot}"/><circle cx="184" cy="66" r="1.6" fill="${C.lavaHot}"/><circle cx="104" cy="22" r="1.6" fill="${C.gold}"/><circle cx="134" cy="12" r="1.8" fill="${C.lavaHot}"/>`
    : '';
  return `<svg viewBox="0 0 240 240" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Hekla">
${motionStyle(MOTION, still)}
<defs>
  <linearGradient id="he-rock" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="${C.rock}"/><stop offset="0.55" stop-color="${C.rockMid}"/><stop offset="1" stop-color="${C.rockDark}"/></linearGradient>
  <linearGradient id="he-snow" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="${C.snow}"/><stop offset="1" stop-color="${C.snowShade}"/></linearGradient>
  <radialGradient id="he-crater" cx="0.5" cy="0.6" r="0.6"><stop offset="0" stop-color="${C.lavaHot}"/><stop offset="0.5" stop-color="${C.lava}"/><stop offset="1" stop-color="${C.pink}"/></radialGradient>
  <linearGradient id="he-lava" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="${C.lavaHot}"/><stop offset="0.5" stop-color="${C.lava}"/><stop offset="1" stop-color="${C.pink}" stop-opacity="0.2"/></linearGradient>
  <linearGradient id="he-rimL" x1="0" x2="1"><stop offset="0" stop-color="${C.cyan}" stop-opacity="0.9"/><stop offset="0.3" stop-color="${C.cyan}" stop-opacity="0"/></linearGradient>
  <linearGradient id="he-rimR" x1="1" x2="0"><stop offset="0" stop-color="${C.magenta}" stop-opacity="0.9"/><stop offset="0.3" stop-color="${C.magenta}" stop-opacity="0"/></linearGradient>
  <radialGradient id="he-steam" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#D9D6F0" stop-opacity="0.95"/><stop offset="1" stop-color="#9A96C8" stop-opacity="0.85"/></radialGradient>
  <radialGradient id="he-cheek" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="${C.lava}" stop-opacity="0.55"/><stop offset="1" stop-color="${C.pink}" stop-opacity="0"/></radialGradient>
  <radialGradient id="he-glow" cx="0.5" cy="0.4" r="0.5"><stop offset="0" stop-color="${C.lava}" stop-opacity="0.35"/><stop offset="0.5" stop-color="${C.magenta}" stop-opacity="0.12"/><stop offset="1" stop-color="${C.blue}" stop-opacity="0"/></radialGradient>
  <linearGradient id="he-ground" x1="0" x2="1"><stop offset="0" stop-color="${C.cyan}" stop-opacity="0"/><stop offset="0.5" stop-color="${C.magenta}"/><stop offset="1" stop-color="${C.cyan}" stop-opacity="0"/></linearGradient>
  <filter id="he-soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="1.8"/></filter>
  <filter id="he-bloom" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="4"/></filter>
  <clipPath id="he-clip"><path d="${mountain}"/></clipPath>
</defs>
<circle cx="120" cy="112" r="108" fill="url(#he-glow)"/>
<g class="he-breathe">

<!-- steam plume -->
<g opacity="0.92"${expr === 'sorry' ? ' transform="translate(120 66) scale(0.55) translate(-120 -66)"' : ''}>
  <g class="he-steam"><circle cx="112" cy="46" r="13" fill="url(#he-steam)"/>
  <circle cx="128" cy="40" r="16" fill="url(#he-steam)"/>
  <circle cx="144" cy="30" r="12" fill="url(#he-steam)"/>
  <circle cx="156" cy="20" r="9" fill="url(#he-steam)"/>
  <circle cx="100" cy="54" r="9" fill="url(#he-steam)"/>
  <path d="M104 42C110 34 120 30 130 30" stroke="#FFFFFF" stroke-width="2" fill="none" opacity="0.7" stroke-linecap="round"/>
  <path d="M146 22C150 18 156 16 160 17" stroke="#FFFFFF" stroke-width="1.6" fill="none" opacity="0.6" stroke-linecap="round"/></g>
</g>
<!-- sparks -->
${sparks}<g class="he-spark"><circle cx="96" cy="34" r="1.8" fill="${C.gold}"/><circle cx="168" cy="38" r="1.5" fill="${C.gold}"/></g><g class="he-spark2"><circle cx="84" cy="50" r="1.2" fill="${C.lavaHot}"/><circle cx="160" cy="54" r="1.4" fill="${C.lavaHot}"/></g>

<!-- mountain -->
<path d="${mountain}" fill="url(#he-rock)"/>
<g clip-path="url(#he-clip)">
  ${contours.join('')}
  ${ridges}
  <path d="${mountain}" fill="none" stroke="url(#he-rimL)" stroke-width="10" filter="url(#he-soft)"/>
  <path d="${mountain}" fill="none" stroke="url(#he-rimR)" stroke-width="10" filter="url(#he-soft)"/>
  <!-- snow cap with drips -->
  <path d="M90 70H152L158 98C152 104 148 96 144 102C140 110 134 100 130 106C126 114 120 104 116 108C112 114 106 102 102 106C98 110 94 100 88 104Z" fill="url(#he-snow)"/>
  <path d="M96 76C100 72 106 70 112 70" stroke="#FFFFFF" stroke-width="2" fill="none" stroke-linecap="round"/>
  <path d="M90 78C92 88 92 96 88 104" stroke="${C.cyan}" stroke-width="3" fill="none" opacity="0.6" filter="url(#he-soft)"/>
  <!-- lava trickles -->
  <path d="M108 70C106 82 110 92 106 104C104 112 108 118 106 124" stroke="url(#he-lava)" stroke-width="3" fill="none" stroke-linecap="round"/>
  <path d="M136 70C138 80 134 88 138 98C140 106 136 112 140 120C142 126 140 132 142 136" stroke="url(#he-lava)" stroke-width="3.4" fill="none" stroke-linecap="round"/>
</g>
<!-- crater -->
<ellipse cx="121" cy="67" rx="25" ry="6" fill="${C.rockDark}"/>
<ellipse cx="121" cy="68" rx="20" ry="4.4" fill="url(#he-crater)"/>
<ellipse cx="121" cy="66" rx="24" ry="8" fill="${C.lava}" filter="url(#he-bloom)" class="he-lava"/>
<path d="M114 66C118 64 124 64 128 66" stroke="#FFFBD0" stroke-width="1.4" fill="none" opacity="0.9" stroke-linecap="round"/>

<!-- face -->
${face}
${expr === 'cheer' || still ? '' : lids('he', [98, 144], 143, 8.6, 10, C.rockMid)}

<!-- horizon -->
<path d="M6 214H234" stroke="url(#he-ground)" stroke-width="3"/>
<path d="M6 214H234" stroke="url(#he-ground)" stroke-width="8" opacity="0.4" filter="url(#he-soft)"/>
</g>
</svg>`;
}

