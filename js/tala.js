// Tala, the TÖLVA mascot: a boxy CRT-monitor head with a pixel face, an antenna staff with a
// glowing tip (the seeress's staff), and a small magenta scarf. Returns SVG markup as a string,
// so it runs in the browser and in Node (scripts/build-tala.mjs writes assets/tala/*.svg).

const C = {
  night0: '#0A0A16',
  night2: '#232345',
  cyan: '#00FFFF',
  blue: '#0080FF',
  magenta: '#FF10F0',
  scarfShade: '#B00CA8',
  pinkText: '#FF3D8B',
  gold: '#FFD700',
  chrome: '#C0C0C0',
  muted: '#9A9AC0',
};

export const EXPRESSIONS = ['neutral', 'happy', 'wrong', 'sleepy', 'thinking'];

// Faces are 16 x 11 pixel grids drawn on the screen: '#' face color, '+' accent (gold).
const FACES = {
  neutral: {
    color: C.cyan,
    rows: [
      '................',
      '................',
      '................',
      '...##......##...',
      '...##......##...',
      '................',
      '................',
      '......####......',
      '................',
      '................',
      '................',
    ],
  },
  happy: {
    color: C.cyan,
    rows: [
      '................',
      '................',
      '...##......##...',
      '..#..#....#..#..',
      '................',
      '................',
      '....#......#....',
      '.....######.....',
      '................',
      '................',
      '................',
    ],
  },
  wrong: {
    color: C.pinkText,
    rows: [
      '................',
      '................',
      '...#.#....#.#...',
      '....#......#....',
      '...#.#....#.#...',
      '................',
      '................',
      '.....######.....',
      '....#......#....',
      '................',
      '................',
    ],
  },
  sleepy: {
    color: C.muted,
    dim: true,
    rows: [
      '...........+++..',
      '............+...',
      '...........+++..',
      '................',
      '..####....####..',
      '................',
      '................',
      '.......##.......',
      '................',
      '................',
      '................',
    ],
  },
  thinking: {
    color: C.cyan,
    rows: [
      '................',
      '................',
      '....##......##..',
      '....##......##..',
      '................',
      '................',
      '................',
      '.......###......',
      '................',
      '..........+.+.+.',
      '................',
    ],
  },
};

const PX = 4;
const GRID_X = 22;
const GRID_Y = 37;

function facePixels(face) {
  let out = '';
  face.rows.forEach((row, y) => {
    [...row].forEach((ch, x) => {
      if (ch === '.') return;
      const fill = ch === '+' ? C.gold : face.color;
      out += `<rect x="${GRID_X + x * PX}" y="${GRID_Y + y * PX}" width="${PX}" height="${PX}" fill="${fill}"/>`;
    });
  });
  return out;
}

const escapeAttr = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

/**
 * @param {string} expression one of EXPRESSIONS
 * @param {{ label?: string, className?: string, crop?: 'head' }} [options]
 *   label: accessible name; without it the SVG is decorative (aria-hidden).
 *   crop: 'head' frames only the monitor and staff tip, for small sizes.
 */
export function talaSVG(expression = 'neutral', { label, className = 'tala', crop } = {}) {
  const face = FACES[expression] ?? FACES.neutral;
  const viewBox = crop === 'head' ? '4 2 116 98' : '0 0 128 168';
  const a11y = label ? `role="img" aria-label="${escapeAttr(label)}"` : 'aria-hidden="true" focusable="false"';
  const tip = expression === 'sleepy' ? C.muted : C.gold;
  const screen = face.dim ? '#06060E' : C.night0;
  return `<svg class="${escapeAttr(className)}" viewBox="${viewBox}" data-expression="${expression}" ${a11y} xmlns="http://www.w3.org/2000/svg">
<ellipse cx="58" cy="163" rx="40" ry="3.5" fill="${C.magenta}" opacity="0.35"/>
<path d="M108 24V162" stroke="${C.chrome}" stroke-width="4"/>
<g class="tala__tip"><circle cx="108" cy="15" r="13" fill="${tip}" opacity="0.15"/><circle cx="108" cy="15" r="8.5" fill="${tip}" opacity="0.35"/></g>
<circle cx="108" cy="15" r="5" fill="${tip}"/>
<rect x="42" y="142" width="8" height="13" fill="${C.night2}" stroke="${C.cyan}" stroke-width="2"/>
<rect x="60" y="142" width="8" height="13" fill="${C.night2}" stroke="${C.cyan}" stroke-width="2"/>
<rect x="37" y="154" width="15" height="6" fill="${C.night2}" stroke="${C.cyan}" stroke-width="2"/>
<rect x="58" y="154" width="15" height="6" fill="${C.night2}" stroke="${C.cyan}" stroke-width="2"/>
<path d="M36 118L21 131" stroke="${C.cyan}" stroke-width="4"/>
<rect x="15" y="128" width="8" height="8" fill="${C.night2}" stroke="${C.cyan}" stroke-width="2"/>
<rect x="34" y="104" width="42" height="39" fill="${C.night2}" stroke="${C.cyan}" stroke-width="3"/>
<path d="M42 124H66M42 130H66M42 136H58" stroke="${C.blue}" stroke-width="2"/>
<rect x="64" y="134" width="4" height="4" fill="${C.gold}"/>
<path d="M74 118L104 112" stroke="${C.cyan}" stroke-width="4"/>
<rect x="102" y="107" width="10" height="10" fill="${C.night2}" stroke="${C.cyan}" stroke-width="2"/>
<rect x="28" y="96" width="52" height="10" fill="${C.magenta}"/>
<rect x="28" y="102" width="52" height="2" fill="${C.scarfShade}"/>
<path d="M36 104L28 127H37L44 106Z" fill="${C.magenta}"/>
<path d="M29 124H37" stroke="${C.scarfShade}" stroke-width="2"/>
<rect x="28" y="127" width="2" height="4" fill="${C.magenta}"/><rect x="32" y="127" width="2" height="4" fill="${C.magenta}"/><rect x="35" y="127" width="2" height="3" fill="${C.magenta}"/>
<rect x="10" y="26" width="88" height="70" fill="${C.night2}" stroke="${C.cyan}" stroke-width="3"/>
<rect x="18" y="34" width="72" height="50" fill="${screen}" stroke="${C.blue}" stroke-width="2"/>
<path d="M22 39H32M22 42H26" stroke="#FFFFFF" stroke-opacity="0.18" stroke-width="2"/>
${facePixels(face)}
<rect x="18" y="88" width="6" height="3" fill="${face.dim ? C.muted : C.cyan}"/>
<circle cx="80" cy="90" r="2.2" fill="${C.chrome}"/><circle cx="88" cy="90" r="2.2" fill="${C.chrome}"/>
</svg>`;
}
