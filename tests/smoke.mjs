#!/usr/bin/env node
// Playwright smoke test: completes the first lesson at phone and desktop sizes by answering every
// exercise correctly, then checks that progress was saved (lesson 1 done, lesson 2 current, XP in
// the HUD), that progress survives export, reset and import, that hearts end a lesson, that a
// first visit asks for a generated voice and then uses it (also for the unit host's greeting), that
// five right answers in a row give a combo bonus, that the unit's host closes the lesson, that the
// lesson counts toward the daily quests, and that
// the site loads offline once the service worker is installed.
// With --all it also plays every lesson of the hand-made units, checks the letters page and plays
// its drill (all letters, and one letter), the sounds and letters drills, a
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
    // A phone shows a way to start without scrolling (before, the voice card filled the screen).
    const start = await page.locator('.voice-intro .button-primary').boundingBox();
    if (!start || start.y + start.height > VIEWPORTS.phone.viewport.height - 64) throw new Error(`the start button is below the fold at ${Math.round(start?.y ?? -1)} px`);
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
    await page.locator('.host__pic').first().waitFor();
    await context.setOffline(true);
    for (const href of ['learn.html', 'stories.html?story=cafe', 'lesson.html?unit=hello&lesson=2&qa', 'dictionary.html?q=kaffi', 'declension.html?lemma=bjór']) {
      await page.goto(`${url}${href}`);
      await page.waitForFunction(() => document.documentElement.classList.contains('is-ready'), null, { timeout: 10000 });
      if (href.startsWith('lesson')) await page.waitForFunction(() => window.__tolva?.spec(), null, { timeout: 10000 });
      // The cast's pictures are not precached but kept once seen: the hosts seen online show offline.
      if (href === 'learn.html') {
        await page.locator('.host__pic').first().waitFor();
        await page.waitForFunction(() => [...document.querySelectorAll('.host__pic')].some((i) => i.complete), null, { timeout: 5000 });
        const [shown, broken] = await page.$$eval('.host__pic', (imgs) => [imgs.filter((i) => i.complete && i.naturalWidth > 0).length, imgs.filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.src)]);
        if (broken.length || !shown) throw new Error(`pictures missing offline: ${broken.join(', ') || 'all'}`);
      }
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
    // Every finished unit is recorded, so later changes to the path never lock it again.
    const recorded = await page.evaluate(() => new Promise((resolve) => {
      const req = indexedDB.open('tolva');
      req.onsuccess = () => {
        const get = req.result.transaction('kv').objectStore('kv').get('progress');
        get.onsuccess = () => resolve(Object.keys(get.result?.units ?? {}));
      };
    }));
    const unitCount = new Set(handMadeLessons().map(([u]) => u)).size;
    if (recorded.length !== unitCount) throw new Error(`${recorded.length} of ${unitCount} units recorded as finished`);
    console.log(`PASS friends: each of the seven characters became a friend once; all ${unitCount} units recorded as finished`);
  } catch (e) {
    failed = true;
    console.log(`FAIL friends: ${e.message}`);
  }
  // Letters and sounds: the page shows the 32 letters and the spellings; a tile opens its dialog
  // with example words and its name spoken by the generated voice; a round on one letter records
  // that letter's card, which its tile then shows.
  try {
    await page.goto(`${url}letters.html`);
    await page.locator('.letter-tile').first().waitFor({ timeout: 5000 });
    const letters = await page.locator('[data-letters] .letter-tile').count();
    const combos = await page.locator('[data-combos] .letter-tile').count();
    if (letters !== 32 || combos < 10) throw new Error(`${letters} letters and ${combos} spellings shown`);
    await page.click('.letter-tile[data-item="þ"]');
    await page.locator('[data-letter-dialog][open] .letter-examples li').first().waitFor({ timeout: 5000 });
    const nameAudio = page.waitForResponse((r) => r.url().includes('/data/audio/tts/') && r.ok(), { timeout: 5000 });
    await page.click('[data-letter-dialog] .letter-dialog__name [data-play]');
    await nameAudio;
    await page.keyboard.press('Escape');
    if (await page.locator('[data-letter-dialog][open]').count()) throw new Error('Escape does not close the dialog');
    if (!(await page.evaluate(() => document.activeElement?.dataset.item === 'þ'))) throw new Error('focus does not return to the tile');
    const types = await playLesson(page, 'lesson.html?mode=alphabet&focus=þ');
    if (types.length !== 6 || types.specs.some((s) => s.key !== 'letter|þ')) throw new Error(`the þ round: ${types.specs.map((s) => s.key).join(', ')}`);
    await page.goto(`${url}letters.html`);
    await page.locator('.letter-tile').first().waitFor({ timeout: 5000 });
    const ring = await page.getAttribute('.letter-tile[data-item="þ"] .letter-ring__value', 'stroke-dasharray');
    if (Number(ring.split(' ')[0]) <= 0) throw new Error('the þ tile shows no progress after a round on þ');
    console.log(`PASS letters: ${letters} letters and ${combos} spellings, the dialog plays the name, a round on þ (${[...new Set(types)].join(', ')}) shows on its tile`);
  } catch (e) {
    failed = true;
    console.log(`FAIL letters: ${e.message}`);
  }
  for (const href of ['lesson.html?mode=alphabet', 'lesson.html?mode=sounds', 'lesson.html?mode=letters', 'lesson.html?mode=bridge', 'lesson.html?mode=story&story=housing&listen']) {
    try {
      const types = await playLesson(page, href);
      for (const t of types) seen.set(t, (seen.get(t) ?? 0) + 1);
      // Questions about a story lead back to it.
      if (href.includes('mode=story') && !(await page.locator('.complete__actions a[href="stories.html?story=housing"]').count())) throw new Error('the story questions do not lead back to the story');
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
  // The attempt log keeps the newest 5,000 answers (MAX_ATTEMPTS in js/progress.js); the all-time
  // tally of answers keeps counting.
  try {
    const store = (p) =>
      p.evaluate(
        () =>
          new Promise((resolve) => {
            const req = indexedDB.open('tolva');
            req.onsuccess = () => {
              const tx = req.result.transaction(['kv', 'attempts']);
              const out = {};
              tx.objectStore('kv').get('tally').onsuccess = (e) => (out.tally = e.target.result);
              tx.objectStore('attempts').count().onsuccess = (e) => (out.count = e.target.result);
              tx.oncomplete = () => resolve(out);
            };
          }),
      );
    await page.goto(`${url}practice.html`);
    await page.evaluate(
      () =>
        new Promise((resolve) => {
          const req = indexedDB.open('tolva');
          req.onsuccess = () => {
            const tx = req.result.transaction('attempts', 'readwrite');
            for (let i = 0; i < 5100; i++) tx.objectStore('attempts').put({ key: 'old_no|meaning', result: 'correct', at: i });
            tx.oncomplete = resolve;
          };
        }),
    );
    const before = await store(page);
    await playLesson(page, 'lesson.html?unit=hello&lesson=1');
    const after = await store(page);
    const added = after.tally.answered - before.tally.answered;
    if (before.count <= 5000 || after.count !== 5000) throw new Error(`${before.count} answers before the lesson, ${after.count} after (5,000 expected)`);
    if (added < 10 || added > 20) throw new Error(`the tally counted ${added} answers for a 12-exercise lesson`);
    console.log(`PASS attempt log: ${before.count} answers cut to ${after.count}, the tally counted on to ${after.tally.answered}`);
  } catch (e) {
    failed = true;
    console.log(`FAIL attempt log: ${e.message}`);
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
  // In Norwegian: a word's origin in the dictionary is in Bokmål, and so are Credits and the voice credit.
  try {
    const nbContext = await browser.newContext({ ...VIEWPORTS.desktop, ...isolated });
    await nbContext.addInitScript(() => localStorage.setItem('tolva.settings.v1', JSON.stringify({ uiLang: 'nb', ttsVoice: 'steinn' })));
    const p = await nbContext.newPage();
    p.on('pageerror', (e) => errors.push(e.message));
    await p.goto(`${url}dictionary.html?q=bók`);
    const etym = p.locator('#dict-etym + p');
    await etym.waitFor({ timeout: 5000 });
    const etymText = await etym.textContent();
    if ((await etym.getAttribute('lang')) !== 'nb' || !etymText.startsWith('Fra norrønt bók')) throw new Error(`the origin of bók reads "${etymText}"`);
    await p.goto(`${url}credits.html`);
    await p.waitForFunction(() => document.documentElement.classList.contains('is-ready'));
    const heading = await p.locator('#c-tts').textContent();
    if (heading !== 'Generert stemme') throw new Error(`Credits heading "${heading}"`);
    await p.goto(`${url}letters.html`);
    await p.locator('[data-voice-credit]', { hasText: 'Syntetisk stemme Steinn (mann)' }).waitFor({ timeout: 5000 });
    await nbContext.close();
    console.log('PASS Norwegian: the origin of bók, the Credits page and the voice credit are in Bokmål');
  } catch (e) {
    failed = true;
    console.log(`FAIL Norwegian: ${e.message}`);
  }
  // The dictionary: a made sentence links to its Tatoeba original and says a word was changed;
  // examples are the sentences in which the parser reads the word as that word.
  try {
    await page.goto(`${url}dictionary.html?q=kartafla`);
    const credit = page.locator('#dict-examples ~ ul .example small', { hasText: 'one word changed for TÖLVA' }).first();
    await credit.waitFor({ timeout: 5000 });
    const href = await credit.locator('a').getAttribute('href');
    if (!/sentences\/show\/\d+$/.test(href)) throw new Error(`a made sentence links to ${href}`);
    await page.goto(`${url}dictionary.html?q=saddur`);
    await page.locator('#dict-examples ~ ul .example').first().waitFor({ timeout: 5000 });
    const examples = await page.locator('#dict-examples ~ ul .example [lang="is"]').allTextContents();
    if (!examples.length || examples.some((x) => /\bsatt\b/i.test(x))) throw new Error(`saddur examples: ${examples.join(' | ')}`);
    console.log(`PASS dictionary: a made sentence credits its original (${href.split('/').pop()}); saddur shows ${examples.length} examples, none with satt (true)`);
  } catch (e) {
    failed = true;
    console.log(`FAIL dictionary: ${e.message}`);
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
