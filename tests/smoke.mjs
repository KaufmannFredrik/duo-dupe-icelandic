#!/usr/bin/env node
// Playwright smoke test: completes the first lesson at phone and desktop sizes by answering every
// exercise correctly, then checks that progress was saved (lesson 1 done, lesson 2 current, XP in
// the HUD), that progress survives export, reset and import, that hearts end a lesson, that a
// first visit asks for a generated voice and then uses it (also for the unit host's greeting), that
// five right answers in a row give a combo bonus, that the unit's host closes the lesson, that the
// lesson counts toward the daily quests, and that
// the site loads offline once the service worker is installed.
// With --all it also plays every lesson of the hand-made units, the sounds and letters drills, a
// review round of due form cards (each exercise must answer a card that was due), and
// checks the story reader (word panel, line audio from the generated voice, the cast of a dialogue)
// and that finishing every unit makes all seven characters friends, at desktop size.
// With --unit=<id>[,<id>] it only plays every lesson of those units (a quick check while making one).
//   node tests/smoke.mjs [--all] [--unit=time]

import { readFileSync } from 'node:fs';
import { chromium } from 'playwright';
import { startServer } from '../scripts/serve.mjs';
import { answer } from './helpers/answer.mjs';
import { fakeSpeech } from './helpers/fake-speech.mjs';
import { QUEST_BONUS } from '../js/quests.js';

const VIEWPORTS = {
  phone: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true },
  desktop: { viewport: { width: 1440, height: 900 } },
};

const { server, url } = await startServer();
const browser = await chromium.launch();
let failed = false;

// Returns the exercise types played; types.combos counts the combo lines in the feedback sheet,
// types.specs holds the exercises.
async function playLesson(page, href) {
  await page.goto(`${url}${href}${href.includes('?') ? '&' : '?'}qa`);
  await page.waitForFunction(() => window.__tolva);
  const types = [];
  types.combos = 0;
  types.specs = [];
  for (let i = 0; i < 30; i++) {
    await page.waitForFunction(() => document.querySelector('.complete__title') || (window.__tolva.spec() && !document.querySelector('[data-sheet].is-open')));
    if (await page.locator('.complete__title').count()) break;
    const spec = await answer(page);
    types.push(spec.type);
    types.specs.push(spec);
    await page.click('[data-action="check"]');
    const state = await page.getAttribute('[data-sheet]', 'data-state');
    if (state !== 'correct') throw new Error(`${href} exercise ${i + 1} (${spec.type}) graded ${state}`);
    types.combos += await page.locator('[data-sheet] .sheet__combo').count();
    await page.click('[data-action="continue"]');
  }
  await page.locator('.complete__title').waitFor({ timeout: 5000 });
  return types;
}

// The service worker is tested on its own below; elsewhere it would only add noise.
const isolated = { serviceWorkers: 'block' };
const hudXP = async (page) => Number(await page.locator('.hud .stat--xp span').first().textContent());

// Every lesson of the hand-made units (units whose lessons are listed, not "auto"), as [unit, lesson].
function handMadeLessons(only) {
  const unitFiles = JSON.parse(readFileSync(new URL('../content/units/index.json', import.meta.url), 'utf8')).units;
  return unitFiles
    .map((f) => JSON.parse(readFileSync(new URL(`../content/units/${f}`, import.meta.url), 'utf8')))
    .filter((u) => Array.isArray(u.lessons) && (!only || only.includes(u.id)))
    .flatMap((u) => u.lessons.map((l) => [u.id, l.id]));
}

const onlyUnits = process.argv.find((a) => a.startsWith('--unit='))?.slice(7).split(',');
if (onlyUnits) {
  const context = await browser.newContext({ ...VIEWPORTS.desktop, ...isolated });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  const lessons = handMadeLessons(onlyUnits);
  if (!lessons.length) {
    failed = true;
    console.log(`FAIL no hand-made lessons in ${onlyUnits.join(', ')}`);
  }
  for (const [unit, lesson] of lessons) {
    try {
      const types = await playLesson(page, `lesson.html?unit=${unit}&lesson=${lesson}`);
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
  await browser.close();
  server.close();
  process.exit(failed ? 1 : 0);
}

for (const [name, options] of Object.entries(VIEWPORTS)) {
  const context = await browser.newContext({ ...options, ...isolated });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  try {
    const types = await playLesson(page, 'lesson.html?unit=hello&lesson=1');
    const combos = Math.floor(types.length / 5);
    if (types.combos !== combos) throw new Error(`${types.combos} combo lines in ${types.length} right answers, expected ${combos}`);
    if (!(await page.locator('.complete img.char--lg[alt^="Lundi"]').count())) throw new Error('the unit host (Lundi) does not close the lesson');
    // The first daily quest is always about lessons, so a perfect lesson counts toward it.
    await page.goto(`${url}practice.html`);
    await page.locator('.quest').first().waitFor();
    if (Number(await page.locator('.quest').first().getAttribute('data-n')) < 1) throw new Error('a perfect lesson did not count toward the lesson quest');
    const chest = (await page.locator('.quests__chest--done').count()) ? QUEST_BONUS : 0;
    await page.goto(`${url}learn.html`);
    await page.locator('.node--current').first().waitFor();
    const done = await page.locator('a.node--done[href*="unit=hello&lesson=1"]').count();
    const current = await page.locator('a.node--current[href*="unit=hello&lesson=2"]').count();
    if (!done || !current) throw new Error('progress not saved: lesson 1 should be done and lesson 2 current');
    const xp = await hudXP(page);
    if (xp !== 10 * types.length + 5 * combos + chest) throw new Error(`HUD shows ${xp} XP after a perfect lesson, expected ${10 * types.length + 5 * combos + chest}`);
    if (errors.length) throw new Error(`page errors: ${errors.join('; ')}`);
    console.log(`PASS ${name}: completed ${types.length} exercises (${[...new Set(types)].join(', ')}), ${combos} combos, quests counted, progress saved, ${xp} XP`);
  } catch (e) {
    failed = true;
    console.log(`FAIL ${name}: ${e.message}`);
  }
  await context.close();
}

// Export, reset, import: the XP and lesson state come back.
{
  let xp = 0;
  const context = await browser.newContext({ ...VIEWPORTS.desktop, ...isolated, acceptDownloads: true });
  const page = await context.newPage();
  try {
    await playLesson(page, 'lesson.html?unit=hello&lesson=1');
    await page.goto(`${url}profile.html`);
    await page.locator('.badge-tile[data-earned="true"]').first().waitFor();
    xp = await hudXP(page);
    if (!(await page.locator('[data-backup]').textContent()).includes('Not exported')) throw new Error('no "not exported yet" line before the first export');
    const [download] = await Promise.all([page.waitForEvent('download'), page.click('[data-export]')]);
    const file = await download.path();
    await page.waitForFunction(() => document.querySelector('[data-backup]').textContent.startsWith('Last exported'));
    await page.click('[data-reset]');
    await page.click('[data-confirm] [data-ok]');
    // The export already put a line in the status, so wait for the reset itself.
    await page.waitForFunction(() => Number(document.querySelector('.hud .stat--xp span').textContent) === 0, null, { timeout: 5000 }).catch(() => {
      throw new Error('reset did not clear XP');
    });
    await page.setInputFiles('[data-import]', file);
    await page.click('[data-confirm] [data-ok]');
    await page.waitForFunction((want) => Number(document.querySelector('.hud .stat--xp span').textContent) === want, xp, { timeout: 5000 });
    await page.goto(`${url}learn.html`);
    await page.locator('.node--current').first().waitFor();
    if (!(await page.locator('a.node--done[href*="unit=hello&lesson=1"]').count())) throw new Error('lesson 1 not done after import');
    // A stored mistake whose sentence is gone (excluded since) is dropped, not shown.
    const excluded = Object.keys(JSON.parse(readFileSync(new URL('../content/sentence-exclude.json', import.meta.url), 'utf8')).sentences)[0];
    await page.evaluate(
      (sid) =>
        new Promise((resolve) => {
          const req = indexedDB.open('tolva');
          req.onsuccess = () => {
            const tx = req.result.transaction('mistakes', 'readwrite');
            tx.objectStore('mistakes').clear();
            tx.objectStore('mistakes').put({ key: 'gone|meaning', at: Date.now(), spec: { type: 'choice', lemma: 'kaffi_no', sentence: sid, options: [sid], key: 'gone|meaning' } });
            tx.objectStore('mistakes').put({ key: 'takk_uh|meaning', at: 1, spec: { type: 'typeword', lemma: 'takk_uh', key: 'takk_uh|meaning' } });
            tx.oncomplete = resolve;
          };
        }),
      excluded,
    );
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    const played = await playLesson(page, 'lesson.html?mode=mistakes');
    if (errors.length || played.join() !== 'typeword') throw new Error(`mistakes round: ${played.join()} ${errors.join('; ')}`);
    console.log('PASS export, reset and import; the last export is shown; a mistake that cannot be shown is dropped');
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

// Voice: a first visit to Learn asks for a generated voice; the choice is kept, the card does not
// come back, and the generated audio then comes from that voice.
{
  const context = await browser.newContext({ ...VIEWPORTS.phone, ...isolated });
  const page = await context.newPage();
  try {
    await page.goto(`${url}learn.html`);
    await page.locator('.voice-intro').waitFor({ timeout: 5000 });
    const sample = page.waitForResponse((r) => r.url().includes('/data/audio/samples/ugla-') && r.ok(), { timeout: 5000 });
    await page.click('.voice-intro [data-sample="ugla"]');
    await sample;
    await page.check('.voice-intro input[value="ugla"]');
    await page.locator('[data-voice-saved]:not(:empty)').waitFor({ timeout: 5000 });
    await page.reload();
    await page.locator('.path').first().waitFor({ timeout: 5000 });
    if (await page.locator('.voice-intro').count()) throw new Error('the voice card is still shown after choosing');
    const greeting = page.waitForResponse((r) => r.url().includes('/data/audio/tts/ugla/') && r.ok(), { timeout: 5000 });
    await page.click('.host [data-play]');
    await greeting;
    await page.goto(`${url}stories.html?story=cafe`);
    const audio = page.waitForResponse((r) => r.url().includes('/data/audio/tts/ugla/') && r.ok(), { timeout: 5000 });
    await page.click('[data-play-line="0"]');
    await audio;
    console.log('PASS voice: chosen on the first visit, kept, and used for generated audio and the host greeting');
  } catch (e) {
    failed = true;
    console.log(`FAIL voice: ${e.message}`);
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
  let friendLines = 0;
  for (const [unit, lesson] of handMadeLessons()) {
    try {
      const types = await playLesson(page, `lesson.html?unit=${unit}&lesson=${lesson}`);
      friendLines += await page.locator('.complete__friend').count();
      for (const t of types) seen.set(t, (seen.get(t) ?? 0) + 1);
      console.log(`PASS ${unit}/${lesson}: ${types.length} exercises`);
    } catch (e) {
      failed = true;
      console.log(`FAIL ${unit}/${lesson}: ${e.message}`);
    }
  }
  try {
    await page.goto(`${url}profile.html`);
    await page.locator('.friend-tile').first().waitFor({ timeout: 5000 });
    const made = await page.locator('.friend-tile[data-friend="true"]').count();
    if (friendLines !== 7 || made !== 7) throw new Error(`${friendLines} "new friend" lines and ${made} friends on the profile, expected 7 and 7`);
    console.log('PASS friends: each of the seven characters became a friend once');
  } catch (e) {
    failed = true;
    console.log(`FAIL friends: ${e.message}`);
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
  // Review: only form cards due. Every exercise must answer a card that was due (a table answers
  // several), and those cards must not be due afterwards.
  try {
    const cardsIn = (p, update) =>
      p.evaluate(
        (u) =>
          new Promise((resolve, reject) => {
            const req = indexedDB.open('tolva');
            req.onsuccess = () => {
              const tx = req.result.transaction('cards', u ? 'readwrite' : 'readonly');
              const store = tx.objectStore('cards');
              let all = [];
              store.getAll().onsuccess = (e) => {
                all = e.target.result;
                if (u) for (const c of all) store.put({ ...c, due: /\|(meaning|table)$/.test(c.key) ? Date.now() + 864e5 : 0 });
              };
              tx.oncomplete = () => resolve(all.map((c) => ({ key: c.key, due: c.due })));
              tx.onerror = () => reject(tx.error);
            };
          }),
        update,
      );
    await page.goto(`${url}practice.html`);
    await cardsIn(page, true);
    const dueBefore = new Set((await cardsIn(page, false)).filter((c) => c.due <= Date.now()).map((c) => c.key));
    const types = await playLesson(page, 'lesson.html?mode=review');
    for (const t of types) seen.set(t, (seen.get(t) ?? 0) + 1);
    const after = new Map((await cardsIn(page, false)).map((c) => [c.key, c.due]));
    for (const s of types.specs) {
      const keys = s.type === 'table' ? s.blanks.map((tag) => `${s.lemma}|${tag}`) : [s.key];
      if (!keys.some((k) => dueBefore.has(k))) throw new Error(`${s.type} ${keys.join(', ')}: no card of it was due`);
      for (const k of keys.filter((x) => dueBefore.has(x))) if (after.get(k) <= Date.now()) throw new Error(`${k} is still due after the review`);
    }
    if (types.length < 6) throw new Error(`only ${types.length} review exercises from ${dueBefore.size} due cards`);
    console.log(`PASS review: ${types.length} exercises, each on a due form card (${dueBefore.size} due)`);
  } catch (e) {
    failed = true;
    console.log(`FAIL review: ${e.message}`);
  }
  // A typed word with the same meaning as the one asked for counts: a mistake on þekkja ("to know")
  // answered with vita.
  try {
    await page.goto(`${url}practice.html`);
    await page.evaluate(
      () =>
        new Promise((resolve) => {
          const req = indexedDB.open('tolva');
          req.onsuccess = () => {
            const tx = req.result.transaction('mistakes', 'readwrite');
            tx.objectStore('mistakes').clear();
            tx.objectStore('mistakes').put({ key: 'þekkja_so|meaning', at: Date.now(), spec: { type: 'typeword', lemma: 'þekkja_so', key: 'þekkja_so|meaning' } });
            tx.oncomplete = resolve;
          };
        }),
    );
    await page.goto(`${url}lesson.html?mode=mistakes&qa`);
    await page.waitForFunction(() => window.__tolva?.spec());
    await page.fill('#answer', 'vita');
    await page.click('[data-action="check"]');
    const state = await page.getAttribute('[data-sheet]', 'data-state');
    const why = await page.locator('.sheet__why').textContent();
    if (state !== 'correct' || !why.includes('þekkja')) throw new Error(`graded ${state}: ${why}`);
    console.log('PASS same meaning: vita for "to know" counts, and the feedback names þekkja');
  } catch (e) {
    failed = true;
    console.log(`FAIL same meaning: ${e.message}`);
  }
  try {
    await page.goto(`${url}stories.html`);
    await page.locator('.story-card').first().waitFor({ timeout: 5000 });
    const cards = await page.locator('.story-card').count();
    if (cards < 10) throw new Error(`only ${cards} stories listed`);
    await page.goto(`${url}stories.html?story=cafe`);
    await page.locator('.story__cast li').first().waitFor({ timeout: 5000 });
    if ((await page.locator('.story__cast strong').allTextContents()).join() !== 'Torfi') throw new Error('the café reading is not told by Torfi');
    await page.locator('.word').first().click();
    await page.locator('.word-panel .word-panel__lemma').first().waitFor({ timeout: 5000 });
    const audio = page.waitForResponse((r) => r.url().includes('/data/audio/tts/') && r.ok(), { timeout: 5000 });
    await page.click('[data-play-line="0"]');
    await audio;
    await page.goto(`${url}stories.html?story=shopping`);
    await page.locator('.story__cast li').first().waitFor({ timeout: 5000 });
    const castNames = await page.locator('.story__cast strong').allTextContents();
    const speakers = await page.locator('.speaker--char img').count();
    if (castNames.join() !== 'Katla,Torfi' || speakers < 6) throw new Error(`shopping cast ${castNames.join()} with ${speakers} pictured lines`);
    console.log(`PASS stories: ${cards} listed, word panel opens, line audio loads, dialogue cast and narrator shown`);
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
