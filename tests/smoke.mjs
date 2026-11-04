#!/usr/bin/env node
// Playwright smoke test: completes the first lesson at phone and desktop sizes by answering every
// exercise correctly, then checks that progress was saved (lesson 1 done, lesson 2 current, XP in
// the HUD), that progress survives export, reset and import, that hearts end a lesson, and that
// the site loads offline once the service worker is installed.
// With --all it also plays every lesson of units 1 and 2, the sounds and letters drills, and
// checks the story reader (word panel, line audio from the generated voice) at desktop size.
//   node tests/smoke.mjs [--all]

import { chromium } from 'playwright';
import { startServer } from '../scripts/serve.mjs';
import { answer } from './helpers/answer.mjs';
import { fakeSpeech } from './helpers/fake-speech.mjs';

const VIEWPORTS = {
  phone: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true },
  desktop: { viewport: { width: 1440, height: 900 } },
};

const { server, url } = await startServer();
const browser = await chromium.launch();
let failed = false;

async function playLesson(page, href) {
  await page.goto(`${url}${href}${href.includes('?') ? '&' : '?'}qa`);
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

// The service worker is tested on its own below; elsewhere it would only add noise.
const isolated = { serviceWorkers: 'block' };
const hudXP = async (page) => Number(await page.locator('.hud .stat--xp span').first().textContent());

for (const [name, options] of Object.entries(VIEWPORTS)) {
  const context = await browser.newContext({ ...options, ...isolated });
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
    const xp = await hudXP(page);
    if (xp !== 120) throw new Error(`HUD shows ${xp} XP after a perfect lesson, expected 120`);
    if (errors.length) throw new Error(`page errors: ${errors.join('; ')}`);
    console.log(`PASS ${name}: completed ${types.length} exercises (${[...new Set(types)].join(', ')}), progress saved, ${xp} XP`);
  } catch (e) {
    failed = true;
    console.log(`FAIL ${name}: ${e.message}`);
  }
  await context.close();
}

// Export, reset, import: the XP and lesson state come back.
{
  const context = await browser.newContext({ ...VIEWPORTS.desktop, ...isolated, acceptDownloads: true });
  const page = await context.newPage();
  try {
    await playLesson(page, 'lesson.html?unit=hello&lesson=1');
    await page.goto(`${url}profile.html`);
    await page.locator('.badge-tile[data-earned="true"]').first().waitFor();
    const [download] = await Promise.all([page.waitForEvent('download'), page.click('[data-export]')]);
    const file = await download.path();
    await page.click('[data-reset]');
    await page.click('[data-confirm] [data-ok]');
    await page.waitForFunction(() => document.querySelector('[data-data-status]').textContent.length > 0);
    if ((await hudXP(page)) !== 0) throw new Error('reset did not clear XP');
    await page.setInputFiles('[data-import]', file);
    await page.click('[data-confirm] [data-ok]');
    await page.waitForFunction(() => Number(document.querySelector('.hud .stat--xp span').textContent) === 120, null, { timeout: 5000 });
    await page.goto(`${url}learn.html`);
    await page.locator('.node--current').first().waitFor();
    if (!(await page.locator('a.node--done[href*="unit=hello&lesson=1"]').count())) throw new Error('lesson 1 not done after import');
    console.log('PASS export, reset and import');
  } catch (e) {
    failed = true;
    console.log(`FAIL export/import: ${e.message}`);
  }
  await context.close();
}

// Hearts: five skipped exercises end the lesson.
{
  const context = await browser.newContext({ ...VIEWPORTS.phone, ...isolated });
  await context.addInitScript(() => localStorage.setItem('tolva.settings.v1', JSON.stringify({ hearts: true })));
  const page = await context.newPage();
  try {
    await page.goto(`${url}lesson.html?unit=hello&lesson=1&qa`);
    await page.waitForFunction(() => window.__tolva?.spec());
    if (!(await page.locator('.hearts').count())) throw new Error('no hearts in the lesson header');
    for (let i = 0; i < 5; i++) {
      await page.click('[data-action="skip"]');
      await page.click('[data-action="continue"]');
    }
    await page.locator('.complete__title').waitFor({ timeout: 5000 });
    const title = await page.locator('.complete__title').textContent();
    if (!/hearts/i.test(title)) throw new Error(`expected the out-of-hearts screen, got "${title}"`);
    console.log('PASS hearts');
  } catch (e) {
    failed = true;
    console.log(`FAIL hearts: ${e.message}`);
  }
  await context.close();
}

// Speaking (experimental): with a stand-in recognizer, a round can be completed, and a poor
// match asks "Did we understand you?" before anything is graded.
{
  const context = await browser.newContext({ ...VIEWPORTS.phone, ...isolated });
  await context.addInitScript(() => localStorage.setItem('tolva.settings.v1', JSON.stringify({ speaking: true })));
  await context.addInitScript(fakeSpeech);
  const page = await context.newPage();
  try {
    await page.goto(`${url}practice.html`);
    await page.locator('[data-speak-card]:not([hidden])').waitFor({ timeout: 5000 });
    await page.goto(`${url}lesson.html?mode=speak&qa`);
    await page.waitForFunction(() => window.__tolva?.spec());
    await page.evaluate(() => (window.__heard = 'eitthvað allt annað'));
    await page.click('[data-mic]');
    await page.locator('[data-confirm]:not([hidden])').waitFor({ timeout: 5000 });
    if (!(await page.isDisabled('[data-action="check"]'))) throw new Error('a poor match can be checked before the learner confirms');
    await page.evaluate(() => delete window.__heard);
    const types = await playLesson(page, 'lesson.html?mode=speak');
    console.log(`PASS speaking: confirm step, then ${types.length} sentences`);
  } catch (e) {
    failed = true;
    console.log(`FAIL speaking: ${e.message}`);
  }
  await context.close();
}

// Offline: once the service worker has installed, pages and data load without a network.
{
  const context = await browser.newContext(VIEWPORTS.desktop);
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  try {
    await page.goto(`${url}learn.html`);
    await page.evaluate(() => navigator.serviceWorker.ready);
    await page.reload();
    await page.waitForFunction(() => navigator.serviceWorker.controller);
    await context.setOffline(true);
    for (const href of ['learn.html', 'stories.html?story=cafe', 'lesson.html?unit=hello&lesson=2&qa', 'dictionary.html?q=kaffi', 'declension.html?lemma=bjór']) {
      await page.goto(`${url}${href}`);
      await page.waitForFunction(() => document.documentElement.classList.contains('is-ready'), null, { timeout: 10000 });
      if (href.startsWith('lesson')) await page.waitForFunction(() => window.__tolva?.spec(), null, { timeout: 10000 });
    }
    if (errors.length) throw new Error(`page errors: ${errors.join('; ')}`);
    console.log('PASS offline: pages, lessons and data load from the service worker cache');
  } catch (e) {
    failed = true;
    console.log(`FAIL offline: ${e.message}`);
  }
  await context.close();
}

if (process.argv.includes('--all')) {
  const context = await browser.newContext({ ...VIEWPORTS.desktop, ...isolated });
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
  for (const href of ['lesson.html?mode=sounds', 'lesson.html?mode=letters', 'lesson.html?mode=bridge']) {
    try {
      const types = await playLesson(page, href);
      for (const t of types) seen.set(t, (seen.get(t) ?? 0) + 1);
      console.log(`PASS ${href}: ${types.length} exercises`);
    } catch (e) {
      failed = true;
      console.log(`FAIL ${href}: ${e.message}`);
    }
  }
  try {
    await page.goto(`${url}stories.html`);
    await page.locator('.story-card').first().waitFor({ timeout: 5000 });
    const cards = await page.locator('.story-card').count();
    if (cards < 5) throw new Error(`only ${cards} stories listed`);
    await page.goto(`${url}stories.html?story=cafe`);
    await page.locator('.word').first().click();
    await page.locator('.word-panel .word-panel__lemma').first().waitFor({ timeout: 5000 });
    const audio = page.waitForResponse((r) => r.url().includes('/data/audio/tts/') && r.ok(), { timeout: 5000 });
    await page.click('[data-play-line="0"]');
    await audio;
    console.log(`PASS stories: ${cards} listed, word panel opens, line audio loads`);
  } catch (e) {
    failed = true;
    console.log(`FAIL stories: ${e.message}`);
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
