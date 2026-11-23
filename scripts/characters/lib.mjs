// Shared parts for the TÖLVA characters (scripts/characters/*.mjs, built by
// scripts/build-characters.mjs into assets/characters/). Every character is a 240 x 240 SVG on a
// transparent background, lit like the app: cyan from the left, magenta from the right.

export { EXPRESSIONS } from '../../js/characters.js';

export const f = (n) => Math.round(n * 10) / 10;

export const PALETTE = {
  night0: '#0A0A16', night2: '#232345', blue: '#0080FF', cyan: '#00FFFF', magenta: '#FF10F0',
  pink: '#FF006E', gold: '#FFD700', chrome: '#C0C0C0', muted: '#9A9AC0',
};

/** A deterministic random number generator, so every build draws the same strands and blades. */
export function seeded(seed) {
  let s = seed;
  return () => ((s = (s * 16807) % 2147483647) / 2147483647);
}

/**
 * Brows, eyes and mouth of a human face, by expression. Amma, Jónas and Katla keep their own
 * hand-tuned "happy" face and use this for the others; Elias uses it for all four. Coordinates
 * are the character's own.
 * @param {object} p
 * @param {number[]} p.eyes  x of the left and right eye centers
 * @param {number} p.eyeY    y of the eye centers
 * @param {number} p.eyeW    half the eye's width
 * @param {number} p.irisR   iris radius
 * @param {string} p.iris    iris fill (a color or url(#…))
 * @param {string} p.lid     upper lid and lash color
 * @param {number} p.lidW    lid line width
 * @param {object} p.brows   { y, inner, outer, color, width }: the brows' resting height, the x
 *                           offsets of their inner and outer ends from the eye center
 * @param {number[]} p.mouth [x, y, half-width] of the mouth's center line
 * @param {string} p.lip     lip color; p.skinShade and p.skinDeep for creases and outlines
 * @param {string} p.prefix  id prefix of the character, for its clip paths
 * @returns {{ upper: string, mouth: string }} brows and eyes; the mouth, drawn separately
 */
export function humanFace(expr, p) {
  const [lx, rx] = p.eyes;
  const y = p.eyeY;
  const w = p.eyeW;
  const out = [];
  // brows: [inner lift, outer lift] per side, negative is up
  const lift = { happy: [[0, 0], [0, 0]], cheer: [[-4, -3], [-4, -3]], thinking: [[0, 0], [-6, -3]], sorry: [[-5, 2], [-5, 2]] }[expr];
  for (const [side, cx] of [[-1, lx], [1, rx]]) {
    const [li, lo] = lift[side < 0 ? 0 : 1];
    const xi = cx - side * p.brows.inner;
    const xo = cx + side * p.brows.outer;
    const yi = p.brows.y + li;
    const yo = p.brows.y + 2 + lo;
    const xm = (xi + xo) / 2;
    const ym = Math.min(yi, yo) - (expr === 'sorry' ? 1 : 3);
    out.push(`<path d="M${f(xo)} ${f(yo)}Q${f(xm)} ${f(ym)} ${f(xi)} ${f(yi)}" stroke="${p.brows.color}" stroke-width="${p.brows.width}" stroke-linecap="round" fill="none"/>`);
  }
  // eyes
  for (const [side, cx] of [[-1, lx], [1, rx]]) {
    if (expr === 'cheer') {
      out.push(`<path d="M${f(cx - w)} ${f(y + 1.5)}C${f(cx - w / 2)} ${f(y - 4.5)} ${f(cx + w / 2)} ${f(y - 4.5)} ${f(cx + w)} ${f(y + 1.5)}" stroke="${p.lid}" stroke-width="${f(p.lidW + 0.4)}" fill="none" stroke-linecap="round"/>`);
      out.push(`<path d="M${f(cx - w * 0.6)} ${f(y + 4.5)}C${f(cx - w * 0.2)} ${f(y + 6)} ${f(cx + w * 0.2)} ${f(y + 6)} ${f(cx + w * 0.6)} ${f(y + 4.5)}" stroke="${p.skinShade}" stroke-width="1" fill="none" opacity="0.8"/>`);
      continue;
    }
    const gaze = expr === 'thinking' ? [2, -1.6] : expr === 'happy' ? [0, 0] : [side * -0.6, 1.4];
    const open = p.eyeOpen ?? 5;
    const top = expr === 'sorry' ? open * 0.72 : open;
    out.push(`<path d="M${f(cx - w)} ${y}C${f(cx - w / 2)} ${f(y - top)} ${f(cx + w / 2)} ${f(y - top)} ${f(cx + w)} ${y}C${f(cx + w / 2)} ${f(y + 3.2)} ${f(cx - w / 2)} ${f(y + 3.2)} ${f(cx - w)} ${y}Z" fill="#FFFFFF"/>`);
    out.push(`<clipPath id="${p.prefix}-eye${side}-${expr}"><path d="M${f(cx - w)} ${y}C${f(cx - w / 2)} ${f(y - top)} ${f(cx + w / 2)} ${f(y - top)} ${f(cx + w)} ${y}C${f(cx + w / 2)} ${f(y + 3.2)} ${f(cx - w / 2)} ${f(y + 3.2)} ${f(cx - w)} ${y}Z"/></clipPath>`);
    const ix = cx + gaze[0];
    const iy = y - 0.4 + gaze[1];
    out.push(`<g clip-path="url(#${p.prefix}-eye${side}-${expr})"><circle cx="${f(ix)}" cy="${f(iy)}" r="${p.irisR}" fill="${p.iris}"/><circle cx="${f(ix)}" cy="${f(iy)}" r="${f(p.irisR * 0.48)}" fill="${PALETTE.night0}"/><circle cx="${f(ix + 1.2)}" cy="${f(iy - 1.2)}" r="${f(p.irisR * 0.28)}" fill="#FFFFFF"/></g>`);
    // upper lid; for "sorry" the outer corner droops
    const droop = expr === 'sorry' ? 1.6 : 0;
    const ox = cx + side * w;
    const ix0 = cx - side * w;
    out.push(`<path d="M${f(ix0 - side)} ${f(y)}C${f(cx - side * w / 2)} ${f(y - top - 0.6)} ${f(cx + side * w / 2)} ${f(y - top - 0.6 + droop)} ${f(ox + side)} ${f(y + droop)}" stroke="${p.lid}" stroke-width="${p.lidW}" fill="none" stroke-linecap="round"/>`);
    if (p.wing) out.push(`<path d="M${f(ox + side)} ${f(y + droop)}l${f(side * 2.4)} -3" stroke="${p.lid}" stroke-width="${p.lidW}" fill="none" stroke-linecap="round"/>`);
  }
  // mouth
  const upper = out.splice(0).join('\n');
  const [mx, my, mw] = p.mouth;
  if (expr === 'cheer') {
    const top = `M${f(mx - mw)} ${f(my)}C${f(mx - mw / 3)} ${f(my + 2)} ${f(mx + mw / 3)} ${f(my + 2)} ${f(mx + mw)} ${f(my)}`;
    out.push(`<path d="${top}C${f(mx + mw * 0.7)} ${f(my + 12)} ${f(mx - mw * 0.7)} ${f(my + 12)} ${f(mx - mw)} ${f(my)}Z" fill="#5A1631"/>`);
    out.push(`<clipPath id="${p.prefix}-mouth-cheer"><path d="${top}C${f(mx + mw * 0.7)} ${f(my + 12)} ${f(mx - mw * 0.7)} ${f(my + 12)} ${f(mx - mw)} ${f(my)}Z"/></clipPath>`);
    out.push(`<g clip-path="url(#${p.prefix}-mouth-cheer)"><rect x="${f(mx - mw)}" y="${f(my - 1)}" width="${f(mw * 2)}" height="4.4" fill="#FFFFFF"/><ellipse cx="${f(mx)}" cy="${f(my + 10)}" rx="${f(mw * 0.5)}" ry="4" fill="#E0607E"/></g>`);
    out.push(`<path d="${top}C${f(mx + mw * 0.7)} ${f(my + 12)} ${f(mx - mw * 0.7)} ${f(my + 12)} ${f(mx - mw)} ${f(my)}" stroke="${p.skinDeep}" stroke-width="1.6" fill="none" stroke-linejoin="round"/>`);
  } else if (expr === 'happy') {
    // a gentle open smile with a hint of teeth
    const top = `M${f(mx - mw)} ${f(my)}C${f(mx - mw / 3)} ${f(my + 2.4)} ${f(mx + mw / 3)} ${f(my + 2.4)} ${f(mx + mw)} ${f(my)}`;
    const shape = `${top}C${f(mx + mw * 0.6)} ${f(my + 7)} ${f(mx - mw * 0.6)} ${f(my + 7)} ${f(mx - mw)} ${f(my)}Z`;
    out.push(`<path d="${shape}" fill="#6A1A36"/>`);
    out.push(`<clipPath id="${p.prefix}-mouth-happy"><path d="${shape}"/></clipPath><g clip-path="url(#${p.prefix}-mouth-happy)"><rect x="${f(mx - mw)}" y="${f(my)}" width="${f(mw * 2)}" height="3.2" fill="#FFFFFF" opacity="0.92"/></g>`);
    out.push(`<path d="M${f(mx - mw - 1)} ${f(my - 0.5)}C${f(mx - mw / 2)} ${f(my + 9)} ${f(mx + mw / 2)} ${f(my + 9)} ${f(mx + mw + 1)} ${f(my - 0.5)}" stroke="${p.skinDeep}" stroke-width="1.6" fill="none" stroke-linecap="round"/>`);
    out.push(`<path d="M${f(mx - mw * 0.4)} ${f(my + 8.4)}Q${f(mx)} ${f(my + 9.6)} ${f(mx + mw * 0.4)} ${f(my + 8.4)}" stroke="${p.lip}" stroke-width="1.6" fill="none" stroke-linecap="round" opacity="0.7"/>`);
  } else if (expr === 'thinking') {
    out.push(`<path d="M${f(mx - mw * 0.3)} ${f(my + 3)}Q${f(mx + mw * 0.2)} ${f(my + 1.5)} ${f(mx + mw * 0.75)} ${f(my)}" stroke="${p.skinDeep}" stroke-width="1.8" fill="none" stroke-linecap="round"/>`);
    out.push(`<path d="M${f(mx + mw * 0.82)} ${f(my - 1.5)}q1.6 1.4 0.6 3.2" stroke="${p.skinShade}" stroke-width="1.2" fill="none" stroke-linecap="round"/>`);
  } else {
    out.push(`<path d="M${f(mx - mw * 0.6)} ${f(my + 4)}Q${f(mx)} ${f(my - 1)} ${f(mx + mw * 0.6)} ${f(my + 4)}" stroke="${p.skinDeep}" stroke-width="1.8" fill="none" stroke-linecap="round"/>`);
    out.push(`<path d="M${f(mx - mw * 0.35)} ${f(my + 6.5)}Q${f(mx)} ${f(my + 5)} ${f(mx + mw * 0.35)} ${f(my + 6.5)}" stroke="${p.lip}" stroke-width="1.6" fill="none" stroke-linecap="round" opacity="0.7"/>`);
  }
  return { upper, mouth: out.join('\n') };
}

// --- Motion ---------------------------------------------------------------------------------------
// Each character carries its animations as CSS inside the SVG, so they play when the file is shown
// as an image. They stop under prefers-reduced-motion, and the build writes a still copy of every
// file (no <style>) for the app's Calm mode.

/** The <style> element of a character: its animation rules, or nothing for a still copy. */
export function motionStyle(css, still) {
  if (still) return '';
  return `<style>${css}@media (prefers-reduced-motion: reduce){*{animation:none!important}}</style>`;
}

/** Breathing: the whole figure drifts down and up by about a pixel. */
export const breatheCSS = (p, period = 4.6) =>
  `.${p}-breathe{animation:${p}-breathe ${period}s ease-in-out infinite}@keyframes ${p}-breathe{0%,100%{transform:translateY(0)}50%{transform:translateY(1.3px)}}`;

/** Blinking: eyelids that drop over the eyes for a moment every few seconds. */
export const blinkCSS = (p, period = 5.4) =>
  `.${p}-lid{transform-box:fill-box;transform-origin:50% 0;transform:scaleY(0);animation:${p}-blink ${period}s infinite}@keyframes ${p}-blink{0%,92%,100%{transform:scaleY(0)}94.5%{transform:scaleY(1)}97%{transform:scaleY(0)}}`;

/** The eyelids for blinkCSS: one rounded shape per eye, in the skin's color. */
export function lids(p, eyes, y, w, h, fill) {
  return eyes.map((cx) => `<rect class="${p}-lid" x="${f(cx - w)}" y="${f(y - h)}" width="${f(w * 2)}" height="${f(h * 2)}" rx="${f(h)}" fill="${fill}"/>`).join('');
}

/** A gentle back-and-forth turn around an element's own center or a given origin. */
export const swayCSS = (cls, deg, period, origin = '50% 50%') =>
  `.${cls}{transform-box:fill-box;transform-origin:${origin};animation:${cls} ${period}s ease-in-out infinite}@keyframes ${cls}{0%,100%{transform:rotate(${-deg}deg)}50%{transform:rotate(${deg}deg)}}`;

/** A slow pulse of opacity, for lights and glows. */
export const pulseCSS = (cls, from, to, period, delay = 0) =>
  `.${cls}{animation:${cls} ${period}s ${delay}s ease-in-out infinite}@keyframes ${cls}{0%,100%{opacity:${from}}50%{opacity:${to}}}`;
