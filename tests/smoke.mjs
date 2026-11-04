#!/usr/bin/env node
// Playwright smoke test: completes the first lesson at phone and desktop sizes by answering every
// exercise correctly, then checks that progress was saved (lesson 1 done, lesson 2 current).
// With --all it also plays every lesson of units 1 and 2 at desktop size.
//   node tests/smoke.mjs [--all]

import { chromium } from 'playwright';
import { startServer } from '../scripts/serve.mjs';
import { answer } from './helpers/answer.mjs';

const VIEWPORTS = {
  phone: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true },
  desktop: { viewport: { width: 1440, height: 900 } },
};

const { server, url } = await startServer();
const browser = await chromium.launch();
let failed = false;

async function playLesson(page, href) {
  await page.goto(`${url}${href}&qa`);
  await page.waitForFunction(() => window.__tolva);
  const types = [];
  for (let i = 0; i < 30; i++) {
    await page.waitForFunction(() => document.querySelector('.complete__title') || (window.__tolva.spec() && !document.querySelector('[data-sheet].is-open')));
    if (await page.locator('.complete__title').count()) break;
    const spec = await answer(page);
    types.push(spec.type);
    await page.click('[data-action="check"]');
    const state = await page.getAttribute('[data-sheet]', 'data-state');
    if (state !== 'correct') throw new Error(`${href} exercise ${i + 1} (${spec.type}) graded ${state}`);
    await page.click('[data-action="continue"]');
  }
  await page.locator('.complete__title').waitFor({ timeout: 5000 });
  return types;
}

for (const [name, options] of Object.entries(VIEWPORTS)) {
  const context = await browser.newContext(options);
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  try {
    const types = await playLesson(page, 'lesson.html?unit=hello&lesson=1');
    await page.goto(`${url}learn.html`);
    await page.locator('.node--current').first().waitFor();
    const done = await page.locator('a.node--done[href*="unit=hello&lesson=1"]').count();
    const current = await page.locator('a.node--current[href*="unit=hello&lesson=2"]').count();
    if (!done || !current) throw new Error('progress not saved: lesson 1 should be done and lesson 2 current');
    if (errors.length) throw new Error(`page errors: ${errors.join('; ')}`);
    console.log(`PASS ${name}: completed ${types.length} exercises (${[...new Set(types)].join(', ')}), progress saved`);
  } catch (e) {
    failed = true;
    console.log(`FAIL ${name}: ${e.message}`);
  }
  await context.close();
}

if (process.argv.includes('--all')) {
  const context = await browser.newContext(VIEWPORTS.desktop);
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  const seen = new Map();
  const lessons = [...['1', '2', '3', '4', '5', 'review'].map((l) => ['hello', l]), ...['1', '2', '3', '4', '5', '6', '7', 'review'].map((l) => ['cafe', l])];
  for (const [unit, lesson] of lessons) {
    try {
      const types = await playLesson(page, `lesson.html?unit=${unit}&lesson=${lesson}`);
      for (const t of types) seen.set(t, (seen.get(t) ?? 0) + 1);
      console.log(`PASS ${unit}/${lesson}: ${types.length} exercises`);
    } catch (e) {
      failed = true;
      console.log(`FAIL ${unit}/${lesson}: ${e.message}`);
    }
  }
  if (errors.length) {
    failed = true;
    console.log(`page errors: ${errors.join('; ')}`);
  }
  console.log(`Exercise types played: ${[...seen].map(([t, n]) => `${t} ${n}`).join(', ')}`);
  await context.close();
}

await browser.close();
server.close();
process.exit(failed ? 1 : 0);
