#!/usr/bin/env node
// WCAG 2.x contrast check for the design tokens, plus a lint for forbidden text colors.
// Fails (exit 1) when a text pair is under 4.5:1 (normal text) or 3:1 (large text), or a
// non-text pair (borders, icons, focus rings, fills) is under 3:1.
//   node scripts/check-contrast.mjs

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { ROOT } from './lib/bulk.mjs';

const css = (f) => readFile(path.join(ROOT, 'css', f), 'utf8');
const tokensCss = await css('tokens.css');

// Resolve --name: #hex and --name: var(--other) declarations.
const raw = Object.fromEntries([...tokensCss.matchAll(/--([\w-]+):\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]));
function color(name) {
  if (name === 'white') return '#FFFFFF';
  if (name === 'black') return '#000000';
  let v = raw[name];
  for (let i = 0; v && v.startsWith('var(') && i < 5; i++) v = raw[v.slice(6, -1)];
  if (!v || !/^#[0-9a-f]{6}$/i.test(v)) throw new Error(`token --${name} is not a hex color (${v})`);
  return v;
}

const lum = (hex) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a, b) => {
  const [l1, l2] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
};

const MIN = { text: 4.5, large: 3, nontext: 3 };
// [foreground, background, kind, where it is used]
const PAIRS = [
  ['rf-cyan', 'rf-night', 'text', 'primary text and headings'],
  ['rf-chrome', 'rf-night', 'text', 'body copy'],
  ['rf-gold', 'rf-night', 'text', 'XP, streak'],
  ['rf-magenta', 'rf-night', 'text', 'section titles, labels'],
  ['rf-pink-text', 'rf-night', 'text', 'pink text, accusative tag'],
  ['rf-muted', 'rf-night', 'text', 'secondary text'],
  ['rf-muted', 'rf-night-0', 'text', 'secondary text in nav and HUD'],
  ['rf-chrome', 'rf-night-0', 'text', 'nav labels'],
  ['rf-muted', 'rf-night-2', 'text', 'secondary text on raised surfaces'],
  ['rf-chrome', 'rf-night-2', 'text', 'body copy on raised surfaces'],
  ['rf-cyan', 'rf-night-2', 'text', 'headings on raised surfaces'],
  ['rf-gold', 'rf-night-2', 'text', 'gold text on raised surfaces'],
  ['rf-magenta', 'rf-night-2', 'text', 'labels on raised surfaces (unit banner, sheet)'],
  ['white', 'rf-night-2', 'text', 'chips, answers'],
  ['white', 'rf-night-0', 'text', 'inputs, heat cells'],
  ['rf-pink-text', 'rf-night-2', 'large', 'NOT QUITE title on the sheet (large text only)'],
  ['black', 'rf-pink', 'text', 'text on pink fills (primary button)'],
  ['black', 'rf-cyan', 'text', 'text on cyan fills'],
  ['black', 'rf-gold', 'text', 'text on gold fills, skip link'],
  ['rf-blue', 'rf-night', 'nontext', 'borders and glows'],
  ['rf-blue', 'rf-night-0', 'nontext', 'nav borders'],
  ['rf-pink', 'rf-night', 'nontext', 'pink fills and borders'],
  ['rf-muted', 'rf-night', 'nontext', 'disabled borders, locked nodes'],
  ['rf-gold', 'rf-night', 'nontext', 'focus ring'],
  ['rf-gold', 'rf-night-2', 'nontext', 'focus ring on raised surfaces'],
  ['rf-cyan', 'rf-night', 'nontext', 'selected and correct borders'],
];
// Pairs that must never be used for text: reported for reference, not required to pass.
const FORBIDDEN = [
  ['rf-blue', 'rf-night', 'blue is for borders and glows only'],
  ['white', 'rf-pink', 'white text on pink fills'],
];

let failures = 0;
console.log('Pair                              Ratio   Need  Result  Use');
for (const [fg, bg, kind, use] of PAIRS) {
  const r = ratio(color(fg), color(bg));
  const ok = r >= MIN[kind];
  if (!ok) failures++;
  console.log(`${`${fg} on ${bg}`.padEnd(34)}${r.toFixed(2).padStart(5)}  ${String(MIN[kind]).padStart(4)}  ${ok ? 'pass' : 'FAIL'}    ${use}`);
}
console.log('\nNever for text (reference only):');
for (const [fg, bg, why] of FORBIDDEN) console.log(`  ${fg} on ${bg}: ${ratio(color(fg), color(bg)).toFixed(2)} (${why})`);

// Lint: blue and pink (fill) must never be a text color.
const lint = [];
for (const file of ['base.css', 'components.css', 'layout.css']) {
  const text = await css(file);
  text.split('\n').forEach((line, i) => {
    if (/(^|[\s;{])color:\s*var\(--rf-(blue|pink)\)/.test(line)) lint.push(`${file}:${i + 1}: ${line.trim()}`);
  });
}
if (lint.length) {
  failures += lint.length;
  console.log('\nForbidden text colors:');
  for (const l of lint) console.log(`  ${l}`);
}

console.log(failures ? `\n${failures} contrast problem(s).` : '\nAll contrast checks pass.');
process.exit(failures ? 1 : 0);
