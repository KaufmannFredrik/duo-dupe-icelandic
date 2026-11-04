#!/usr/bin/env node
// Renders the app icons for the web app manifest and iOS from Tala's head (js/tala.js) on the
// night background, with Playwright. "any" icons fill most of the square; the maskable icon
// keeps the head inside the central 80% safe zone.
//   node scripts/build-icons.mjs

import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';
import { ROOT } from './lib/bulk.mjs';
import { talaSVG } from '../js/tala.js';

const OUT = path.join(ROOT, 'assets', 'icons');
const ICONS = [
  { file: 'icon-192.png', size: 192, head: 0.78 },
  { file: 'icon-512.png', size: 512, head: 0.78 },
  { file: 'icon-maskable-512.png', size: 512, head: 0.56 },
  { file: 'apple-touch-icon.png', size: 180, head: 0.72 },
];

await mkdir(OUT, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage();
// The head crop's viewBox cuts the antenna glow; widen it a little for the icons.
const svg = talaSVG('happy', { label: 'TÖLVA', crop: 'head' }).replace(/viewBox="[^"]+"/, 'viewBox="0 0 124 100"');
for (const { file, size, head } of ICONS) {
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(`<!doctype html><html><body style="margin:0;width:${size}px;height:${size}px;display:grid;place-items:center;
    background:radial-gradient(circle at 50% 40%, #232345, #1A1A2E 70%)">
    <div style="width:${Math.round(size * head)}px">${svg.replace('<svg ', '<svg style="width:100%;height:auto;display:block" ')}</div></body></html>`);
  await page.screenshot({ path: path.join(OUT, file), omitBackground: false });
  console.error(`wrote assets/icons/${file}`);
}
await browser.close();
