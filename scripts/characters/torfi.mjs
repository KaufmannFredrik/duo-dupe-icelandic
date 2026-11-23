// Torfi: a talking turf house. A painted wooden gable with white bargeboards, a grass roof running
// down to the ground, herringbone turf walls, lit windows for eyes and an open door for a mouth.
import { seeded, motionStyle, breatheCSS, blinkCSS, lids, swayCSS, pulseCSS } from './lib.mjs';

const f = (n) => Math.round(n * 10) / 10;
const C = {
  night0: '#0A0A16', blue: '#0080FF', cyan: '#00FFFF', magenta: '#FF10F0', pink: '#FF006E', gold: '#FFD700',
  grass: '#167B6C', grassLight: '#3FD6A8', grassDark: '#0C4D49',
  turf: '#3A2B52', turfLine: '#6B4E7E',
  wood: '#8E1F52', woodDark: '#5A1236', woodLight: '#B23A70',
  trim: '#EEEAF8', trimShade: '#B4AFD0',
  light: '#FFE38A', lightDeep: '#FFB341',
};

export function torfi(expr = 'happy', { still = false } = {}) {
  const MOTION = breatheCSS('to', 6.4) + '.to-glass{animation:to-flicker 3.4s steps(1) infinite}@keyframes to-flicker{0%,100%{opacity:1}22%{opacity:0.86}24%{opacity:1}61%{opacity:0.9}63%{opacity:1}}' + '.to-smoke{animation:to-smoke 6s ease-in-out infinite}@keyframes to-smoke{0%,100%{transform:translateY(0);opacity:1}50%{transform:translateY(-6px);opacity:0.7}}' + pulseCSS('to-door', 0.3, 0.6, 3);
  const mound = 'M10 214C18 186 34 150 58 120C78 94 100 78 120 76C140 78 162 94 182 120C206 150 222 186 230 214Z';
  const gable = 'M76 214V142L120 98L164 142V214Z';
  // herringbone turf rows on the side walls
  const herring = [];
  for (let row = 0; row < 5; row++) {
    const y = 160 + row * 11;
    for (let k = 0; k < 6; k++) {
      const xl = 24 + k * 9 + row * 3;
      const xr = 216 - k * 9 - row * 3;
      const dir = row % 2 ? 1 : -1;
      if (xl < 72) herring.push(`<path d="M${xl} ${y}l${4 * dir} 8" stroke="${C.turfLine}" stroke-width="1.6"/>`);
      if (xr > 168) herring.push(`<path d="M${xr} ${y}l${-4 * dir} 8" stroke="${C.turfLine}" stroke-width="1.6"/>`);
    }
  }
  // grass blades along the roof ridge, seeded
  let seed = 5;
  const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  // the mound's outline as cubic Béziers (left half; the right half mirrors it)
  const bez = (p0, p1, p2, p3, t) => {
    const u = 1 - t;
    return [0, 1].map((k) => u * u * u * p0[k] + 3 * u * u * t * p1[k] + 3 * u * t * t * p2[k] + t * t * t * p3[k]);
  };
  const segs = [[[10, 214], [18, 186], [34, 150], [58, 120]], [[58, 120], [78, 94], [100, 78], [120, 76]]];
  const edge = [];
  for (const sg of segs) for (let t = 0; t < 1; t += 1 / 12) edge.push(bez(...sg, t));
  edge.push([120, 76]);
  const outline = [...edge, ...edge.slice(0, -1).reverse().map(([x, y]) => [240 - x, y])];
  const blades = [];
  for (let i = 3; i < outline.length - 3; i++) {
    const [x, y] = outline[i];
    const [x0, y0] = outline[i - 1];
    const [x1, y1] = outline[i + 1];
    let nx = y1 - y0, ny = -(x1 - x0);
    const len = Math.hypot(nx, ny) || 1;
    nx /= len; ny /= len;
    if (ny > 0) { nx = -nx; ny = -ny; }
    // grass grows up: lean the blade from the outline's normal toward vertical
    nx *= 0.45; ny = ny * 0.45 - 0.9;
    const dl = Math.hypot(nx, ny);
    nx /= dl; ny /= dl;
    if (rand() < 0.35) continue;
    const h = 3 + rand() * 6;
    const bend = (rand() - 0.5) * 3;
    blades.push(`<path d="M${f(x - nx)} ${f(y - ny)}q${f(nx * h * 0.6 + bend)} ${f(ny * h * 0.6)} ${f(nx * h + bend * 1.5)} ${f(ny * h)}" stroke="${rand() < 0.3 ? C.cyan : C.grassLight}" stroke-width="1.6" fill="none" stroke-linecap="round" opacity="${f(0.65 + rand() * 0.35)}"/>`);
  }
  const boards = Array.from({ length: 9 }, (_, i) => {
    const x = 80 + i * 10;
    const top = 142 - (44 - Math.abs(120 - x)) ;
    return `<path d="M${x} ${f(Math.max(top, 100))}V214" stroke="${C.woodDark}" stroke-width="1.4" opacity="0.6"/>`;
  }).join('');
  // The face by expression: window eyes, lintel brows, the door as a mouth.
  const pupil = (cx, dx, dy) => `<circle cx="${cx + 1 + dx}" cy="${151 + dy}" r="5.6" fill="${C.night0}"/><circle cx="${cx + 2.8 + dx}" cy="${148.8 + dy}" r="1.9" fill="#FFFFFF"/><circle cx="${cx - 1 + dx}" cy="${153.4 + dy}" r="0.8" fill="#FFFFFF" opacity="0.7"/>`;
  const eyeIn = {
    happy: (cx) => pupil(cx, 0, 0),
    cheer: (cx) => `<path d="M${cx - 7} 153Q${cx} 143 ${cx + 7} 153" stroke="${C.night0}" stroke-width="3" fill="none" stroke-linecap="round"/>`,
    thinking: (cx) => pupil(cx, 2.4, -3),
    sorry: (cx) => pupil(cx, -0.6, 3),
  }[expr];
  const lintel = (x1, y1, xm, ym, x2, y2) => `<path d="M${x1} ${y1}Q${xm} ${ym} ${x2} ${y2}" stroke="${C.trim}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
  const brows = {
    happy: `${lintel(86, 132, 99, 127, 112, 131)}${lintel(128, 131, 141, 127, 154, 132)}`,
    cheer: `${lintel(86, 128, 99, 121, 112, 127)}${lintel(128, 127, 141, 121, 154, 128)}`,
    thinking: `${lintel(86, 132, 99, 128, 112, 131)}${lintel(128, 126, 141, 118, 154, 126)}`,
    sorry: `${lintel(86, 133, 99, 131, 112, 126)}${lintel(128, 126, 141, 131, 154, 133)}`,
  }[expr];
  // the door: open, wide open in delight, half shut in thought, nearly shut when sorry
  const frame = `<path d="M106 214V184C106 174 112 168 120 168C128 168 134 174 134 184V214Z" fill="${C.trim}"/>`;
  const glow = `<path d="M109 214V185C109 177 114 171 120 171C126 171 131 177 131 185V214Z" fill="url(#to-door)"/><path d="M109 214V185C109 177 114 171 120 171C126 171 131 177 131 185V214Z" fill="${C.lightDeep}" opacity="0.4" filter="url(#to-bloom)" class="to-door"/>`;
  const leaf = (x) => `<clipPath id="to-door-${expr}"><path d="M109 214V185C109 177 114 171 120 171C126 171 131 177 131 185V214Z"/></clipPath><g clip-path="url(#to-door-${expr})"><rect x="108" y="170" width="${x - 108}" height="46" fill="${C.woodDark}"/><path d="M${x} 170V214" stroke="#3E0B24" stroke-width="1.2"/></g><circle cx="${x - 3}" cy="196" r="1.6" fill="${C.gold}"/>`;
  const door = frame + glow + {
    happy: `<path d="M109 185C109 177 114 171 120 171V214H109Z" fill="${C.woodDark}"/><circle cx="117" cy="196" r="1.6" fill="${C.gold}"/>`,
    cheer: `${leaf(112)}<path d="M100 214L92 230H148L140 214Z" fill="url(#to-spill)" opacity="0.8"/>`,
    thinking: leaf(124),
    sorry: leaf(128.5),
  }[expr] + `<path d="M112 176C114 173 117 172 120 172" stroke="#FFFFFF" stroke-width="1.2" fill="none" opacity="0.5"/>`;
  const win = (cx) => `<g>
    <rect x="${cx - 13}" y="136" width="26" height="26" rx="2" fill="${C.trim}"/>
    <rect x="${cx - 10}" y="139" width="20" height="20" fill="url(#to-glass)" class="to-glass"/>
    <rect x="${cx - 10}" y="139" width="20" height="20" fill="${C.lightDeep}" opacity="0.35" filter="url(#to-bloom)"/>
    <path d="M${cx} 139V159M${cx - 10} 149H${cx + 10}" stroke="${C.trim}" stroke-width="2"/>
    ${eyeIn(cx)}
  </g>`;
  return `<svg viewBox="0 0 240 240" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Torfi">
${motionStyle(MOTION, still)}
<defs>
  <linearGradient id="to-grass" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="${C.grassLight}"/><stop offset="0.35" stop-color="${C.grass}"/><stop offset="1" stop-color="${C.grassDark}"/></linearGradient>
  <linearGradient id="to-wood" x1="0" x2="1"><stop offset="0" stop-color="${C.woodLight}"/><stop offset="0.5" stop-color="${C.wood}"/><stop offset="1" stop-color="${C.woodDark}"/></linearGradient>
  <radialGradient id="to-glass" cx="0.5" cy="0.6" r="0.7"><stop offset="0" stop-color="${C.light}"/><stop offset="1" stop-color="${C.lightDeep}"/></radialGradient>
  <linearGradient id="to-door" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="${C.light}"/><stop offset="1" stop-color="${C.lightDeep}"/></linearGradient>
  <linearGradient id="to-rimL" x1="0" x2="1"><stop offset="0" stop-color="${C.cyan}" stop-opacity="0.9"/><stop offset="0.3" stop-color="${C.cyan}" stop-opacity="0"/></linearGradient>
  <linearGradient id="to-rimR" x1="1" x2="0"><stop offset="0" stop-color="${C.magenta}" stop-opacity="0.9"/><stop offset="0.3" stop-color="${C.magenta}" stop-opacity="0"/></linearGradient>
  <linearGradient id="to-ground" x1="0" x2="1"><stop offset="0" stop-color="${C.cyan}" stop-opacity="0"/><stop offset="0.5" stop-color="${C.magenta}"/><stop offset="1" stop-color="${C.cyan}" stop-opacity="0"/></linearGradient>
  <radialGradient id="to-glow" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="${C.lightDeep}" stop-opacity="0.22"/><stop offset="0.6" stop-color="${C.blue}" stop-opacity="0.12"/><stop offset="1" stop-color="${C.blue}" stop-opacity="0"/></radialGradient>
  <radialGradient id="to-smoke" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#D6D3EE" stop-opacity="0.9"/><stop offset="1" stop-color="#9A96C8" stop-opacity="0.6"/></radialGradient>
  <linearGradient id="to-spill" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="${C.light}" stop-opacity="0.45"/><stop offset="1" stop-color="${C.light}" stop-opacity="0"/></linearGradient>
  <filter id="to-soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="1.8"/></filter>
  <filter id="to-bloom" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="4"/></filter>
  <clipPath id="to-mound"><path d="${mound}"/></clipPath>
  <clipPath id="to-gable"><path d="${gable}"/></clipPath>
</defs>
<circle cx="120" cy="120" r="108" fill="url(#to-glow)"/>
<g class="to-breathe">

<!-- smoke from the roof -->
<g class="to-smoke"><circle cx="150" cy="70" r="7" fill="url(#to-smoke)"/><circle cx="158" cy="58" r="9" fill="url(#to-smoke)"/><circle cx="168" cy="44" r="7" fill="url(#to-smoke)"/></g>
<path d="M146 82V96" stroke="${C.turf}" stroke-width="7" stroke-linecap="round"/>

<!-- the turf mound: turf walls below, grass on top -->
<path d="${mound}" fill="${C.turf}"/>
<g clip-path="url(#to-mound)">
  <path d="M0 150C40 142 80 132 120 132C160 132 200 142 240 150V60H0Z" fill="url(#to-grass)"/>
  <path d="M0 150C40 142 80 132 120 132C160 132 200 142 240 150" stroke="${C.grassDark}" stroke-width="3" fill="none"/>
  ${herring.join('')}
  <path d="${mound}" fill="none" stroke="url(#to-rimL)" stroke-width="10" filter="url(#to-soft)"/>
  <path d="${mound}" fill="none" stroke="url(#to-rimR)" stroke-width="10" filter="url(#to-soft)"/>
</g>
${blades.join('')}

<!-- wooden gable -->
<path d="${gable}" fill="url(#to-wood)"/>
<g clip-path="url(#to-gable)">${boards}</g>
<path d="M72 146L120 98L168 146" stroke="${C.trim}" stroke-width="6" fill="none" stroke-linejoin="round"/>
<path d="M75 145L120 100" stroke="${C.cyan}" stroke-width="2" fill="none" opacity="0.8" filter="url(#to-soft)"/>
<path d="M120 100L165 145" stroke="${C.magenta}" stroke-width="2" fill="none" opacity="0.7" filter="url(#to-soft)"/>
<path d="M120 98V86M114 90L120 84L126 90" stroke="${C.trim}" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>

<!-- eyes: lit windows, with lintels as brows -->
${win(100)}${win(140)}
${brows}

<!-- mouth: the door, warm light inside -->
${door}
<!-- rosy cheeks on the boards -->
<ellipse cx="90" cy="172" rx="9" ry="5" fill="${C.pink}" opacity="${expr === 'sorry' ? 0.15 : expr === 'cheer' ? 0.5 : 0.35}"/>
<ellipse cx="150" cy="172" rx="9" ry="5" fill="${C.pink}" opacity="${expr === 'sorry' ? 0.15 : expr === 'cheer' ? 0.5 : 0.35}"/>

<!-- horizon and a step of light from the door -->
<path d="M108 214L98 230H142L132 214Z" fill="url(#to-spill)"/>
<path d="M6 214H234" stroke="url(#to-ground)" stroke-width="3"/>
<path d="M6 214H234" stroke="url(#to-ground)" stroke-width="8" opacity="0.4" filter="url(#to-soft)"/>
</g>
</svg>`;
}

