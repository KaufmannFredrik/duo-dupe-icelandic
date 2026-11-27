#!/usr/bin/env node
// Visual QA: screenshots of every screen and state at phone, tablet and desktop sizes, axe
// accessibility checks on each, and a no-horizontal-scroll check at 320 px.
//   npx playwright install chromium   (once)
//   node scripts/visual-qa.mjs [--only=landing,lesson-1]
// Screenshots go to screenshots/<viewport>/<name>.png (gitignored). Exit 1 on any violation.

import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import { ROOT } from './lib/bulk.mjs';
import { startServer } from './serve.mjs';
import { loadData } from '../tests/helpers/data.mjs';
import { answer } from '../tests/helpers/answer.mjs';
import { fakeSpeech } from '../tests/helpers/fake-speech.mjs';
import { allowedFor } from '../js/engine/course-model.js';
import { hashSeed } from '../js/engine/rng.js';

const OUT = path.join(ROOT, 'screenshots');
const only = process.argv.find((a) => a.startsWith('--only='))?.slice(7).split(',');

const VIEWPORTS = {
  phone: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 },
  tablet: { viewport: { width: 768, height: 1024 }, hasTouch: true, deviceScaleFactor: 1 },
  desktop: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 },
};

// Lessons are generated, so find where each exercise type first appears (fresh progress uses
// the seed "<lesson key>#0", as in the browser).
const data = loadData();
const firstOf = new Map();
let specialTypeword = null;
for (const unit of data.course.units.filter((u, i) => i < 2 || u.id === 'numbers')) {
  for (const lesson of unit.lessons) {
    const specs = data.generator.lesson({ focus: lesson.focus, allowed: allowedFor(data.course, unit.id, lesson.index), seed: hashSeed(`${lesson.key}#0`), practiced: Boolean(lesson.review) });
    specs.forEach((spec, i) => {
      const href = `lesson.html?unit=${unit.id}&lesson=${lesson.id}&step=${i + 1}&qa`;
      if (!firstOf.has(spec.type)) firstOf.set(spec.type, href);
      if (spec.phone && !firstOf.has(`${spec.type}-phone`)) firstOf.set(`${spec.type}-phone`, href);
      if (!specialTypeword && spec.type === 'typeword' && /[þðæöáéíóúý]/.test(data.lexicon.lemmas[spec.lemma].lemma)) specialTypeword = href;
    });
  }
}
// A phone number to type may only come in a later play of a lesson (a new unit's words shift the
// draws): find it in plays #0 to #2, and the shot records that many plays before opening it.
const phoneTyped = (() => {
  for (const lesson of data.course.units.find((u) => u.id === 'numbers').lessons) {
    for (const play of [0, 1, 2]) {
      const specs = data.generator.lesson({ focus: lesson.focus, allowed: allowedFor(data.course, 'numbers', lesson.index), seed: hashSeed(`${lesson.key}#${play}`), practiced: Boolean(lesson.review) });
      const i = specs.findIndex((s) => s.type === 'numtype' && s.phone);
      if (i >= 0) return { key: lesson.key, play, href: `lesson.html?unit=numbers&lesson=${lesson.id}&step=${i + 1}&qa` };
    }
  }
  throw new Error('no lesson has a phone number to type in its first three plays');
})();

// Each shot: page URL, optional actions to reach a state, full-page or viewport capture.
const wrongOption = async (p) => {
  const spec = await p.evaluate(() => window.__tolva.spec());
  const right = ['letter', 'lettername', 'likenb', 'pair', 'numlisten'].includes(spec.type) ? spec.answer : spec.lemma;
  await p.locator(`.option:not([data-value="${right}"])`).first().click();
};
// A realistic progress export dated around today, imported through the profile page.
function progressFixture() {
  const day = (n) => {
    const d = new Date(Date.now() - n * 864e5);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };
  const days = { [day(6)]: 40, [day(5)]: 120, [day(3)]: 30, [day(2)]: 60, [day(0)]: 12 };
  const attempts = [];
  const cases = [['NF', 0.95], ['ÞF', 0.8], ['ÞGF', 0.6], ['EF', 0.4]];
  let id = 0;
  for (const [c, rate] of cases) {
    for (const number of ['sg', 'pl']) {
      for (let i = 0; i < 10; i++) attempts.push({ id: ++id, key: `kaffi_no|${c}`, case: c, number, gender: 'hk', result: i < rate * 10 - (number === 'pl' ? 1 : 0) ? 'correct' : 'wrong', at: Date.now() });
    }
  }
  return {
    app: 'tolva',
    version: 1,
    exported: new Date().toISOString(),
    progress: {
      xp: 262, days, frozen: [day(1)], freezes: 1, best: 4, skippedUnits: [], placement: null,
      // Unit 1 finished (Lundi is a friend), unit 2 not started.
      lessons: Object.fromEntries([1, 2, 3, 4, 5].map((n) => [`hello/${n}`, { done: true, best: n === 2 ? 0.83 : 1, times: n === 2 ? 2 : 1 }])),
      badges: { first: day(6), perfect: day(6), streak3: day(2) },
    },
    cards: [], mistakes: [], attempts,
  };
}
const FIXTURE = path.join(OUT, 'progress-fixture.json');

async function importProgress(p) {
  await p.goto(`${base}profile.html`);
  await settle(p);
  await p.setInputFiles('[data-import]', FIXTURE);
  await p.click('[data-confirm] [data-ok]');
  await p.waitForFunction(() => Number(document.querySelector('.hud .stat--xp span').textContent) > 0);
  await p.evaluate(() => document.activeElement?.blur());
}

// Marks lessons done straight in IndexedDB, through the app's own db module.
async function seedLessons(p, keys) {
  await p.evaluate(async (list) => {
    const { put } = await import(new URL('js/db.js', location.href).href);
    await put('kv', { lessons: Object.fromEntries(list.map((k) => [k, { done: true, at: Date.now(), best: 1, times: 1 }])) }, 'progress');
  }, keys);
}

// Records a lesson as played n times, so it opens with the seed "<key>#n".
async function seedPlays(p, key, n) {
  await p.evaluate(async ([k, times]) => {
    const { put } = await import(new URL('js/db.js', location.href).href);
    await put('kv', { lessons: { [k]: { done: true, at: Date.now(), best: 1, times } } }, 'progress');
  }, [key, n]);
}

// Answers n exercises right; the sheet of the last one stays open.
async function answerRight(p, n) {
  for (let i = 0; i < n; i++) {
    if (i) await p.click('[data-action="continue"]');
    await p.waitForFunction(() => window.__tolva.spec() && !document.querySelector('[data-sheet].is-open'));
    await answer(p);
    await p.click('[data-action="check"]');
  }
}

// Letters drill: answers until an exercise of the type comes up (a round is random, and mixes the
// types: the least used comes next).
async function untilType(p, type) {
  for (let i = 0; i < 10; i++) {
    await p.waitForFunction(() => window.__tolva?.spec() && !document.querySelector('[data-sheet].is-open'));
    if ((await p.evaluate(() => window.__tolva.spec().type)) === type) return;
    await answer(p);
    await p.click('[data-action="check"]');
    await p.click('[data-action="continue"]');
  }
  throw new Error(`no ${type} exercise in the letters drill`);
}

async function playThrough(p) {
  for (let i = 0; i < 30; i++) {
    await p.waitForFunction(() => document.querySelector('.complete__title') || (window.__tolva.spec() && !document.querySelector('[data-sheet].is-open')));
    if (await p.locator('.complete__title').count()) break;
    await answer(p);
    await p.click('[data-action="check"]');
    await p.click('[data-action="continue"]');
  }
  await p.locator('.complete__title').waitFor();
}

const SHOTS = [
  { name: 'landing', url: 'index.html', full: true },
  { name: 'learn', url: 'learn.html', full: true },
  { name: 'guide-hello', url: 'guide.html?unit=hello', full: true },
  { name: 'guide-aboutme', url: 'guide.html?unit=aboutme', full: true },
  { name: 'guide-cafe', url: 'guide.html?unit=cafe', full: true },
  { name: 'guide-family', url: 'guide.html?unit=family', full: true },
  { name: 'guide-numbers', url: 'guide.html?unit=numbers', full: true },
  { name: 'guide-around', url: 'guide.html?unit=around', full: true },
  { name: 'guide-time', url: 'guide.html?unit=time', full: true },
  { name: 'guide-myday', url: 'guide.html?unit=myday', full: true },
  { name: 'guide-food', url: 'guide.html?unit=food', full: true },
  { name: 'guide-home', url: 'guide.html?unit=home', full: true },
  { name: 'guide-people', url: 'guide.html?unit=people', full: true },
  { name: 'guide-body', url: 'guide.html?unit=body', full: true },
  { name: 'guide-freetime', url: 'guide.html?unit=freetime', full: true },
  { name: 'guide-services', url: 'guide.html?unit=services', full: true },
  { name: 'guide-past', url: 'guide.html?unit=past', full: true },
  { name: 'guide-shopping', url: 'guide.html?unit=shopping', full: true },
  { name: 'guide-weather', url: 'guide.html?unit=weather', full: true },
  { name: 'guide-study', url: 'guide.html?unit=study', full: true },
  { name: 'guide-grammar', url: 'guide.html?unit=grammar', full: true },
  { name: 'guide-newwords', url: 'guide.html?unit=newwords', full: true },
  ...[...firstOf].map(([type, url]) => ({ name: `ex-${type}`, url })),
  { name: 'ex-choice-selected', url: firstOf.get('choice'), act: async (p) => p.locator('.option').first().click() },
  { name: 'feedback-numlisten-wrong', url: firstOf.get('numlisten'), act: async (p) => { await wrongOption(p); await p.click('[data-action="check"]'); } },
  { name: 'feedback-numtype-phone', url: phoneTyped.href, act: async (p) => { if (phoneTyped.play) { await seedPlays(p, phoneTyped.key, phoneTyped.play); await p.goto(base + phoneTyped.href); await settle(p); } await answer(p); await p.click('[data-action="check"]'); } },
  { name: 'feedback-numbuild', url: firstOf.get('numbuild'), act: async (p) => { await answer(p); await p.click('[data-action="check"]'); } },
  // Guided writing ends the Gata review (data/writing.json): the form, and its feedback on three kinds of mistake.
  { name: 'ex-write', url: 'lesson.html?unit=around&lesson=review&step=99&qa' },
  { name: 'feedback-write-wrong', url: 'lesson.html?unit=around&lesson=review&step=99&qa', full: true, act: async (p) => { await p.fill('[data-gap="0"]', 'anna'); await p.fill('[data-gap="1"]', 'Noregur'); await p.fill('[data-gap="2"]', 'í Akureyri'); await p.click('[data-action="check"]'); } },
  { name: 'feedback-correct', url: firstOf.get('choice'), act: async (p) => { await answer(p); await p.click('[data-action="check"]'); } },
  { name: 'feedback-almost', url: specialTypeword ?? 'lesson.html?mode=letters&qa', act: async (p) => { await answer(p, 'almost'); await p.click('[data-action="check"]'); } },
  { name: 'feedback-wrong', url: firstOf.get('meaning'), act: async (p) => { await wrongOption(p); await p.click('[data-action="check"]'); } },
  { name: 'feedback-case', url: firstOf.get('case'), act: async (p) => { await answer(p); await p.click('[data-action="check"]'); } },
  { name: 'lesson-quit', url: firstOf.get('choice'), act: async (p) => p.keyboard.press('Escape') },
  { name: 'placement', url: 'lesson.html?mode=placement' },
  { name: 'review-empty', url: 'lesson.html?mode=review' },
  { name: 'declension', url: 'declension.html?lemma=kaffi', full: true },
  { name: 'declension-verb', url: 'declension.html?lemma=vera', full: true },
  { name: 'declension-adjective', url: 'declension.html?lemma=góður', full: true },
  { name: 'declension-practice', url: 'declension.html?lemma=bjór', full: true, act: async (p) => { await p.check('input[name="level"][value="2"]', { force: true }); await p.fill('.decl__input >> nth=0', 'bjórinn'); await p.click('[data-check-table]'); } },
  { name: 'stories', url: 'stories.html', full: true },
  { name: 'stories-reader', url: 'stories.html?story=hello', full: true },
  { name: 'stories-shopping', url: 'stories.html?story=shopping', full: true },
  { name: 'stories-numbers', url: 'stories.html?story=numbers', full: true },
  { name: 'stories-myday', url: 'stories.html?story=myday', full: true },
  { name: 'stories-food', url: 'stories.html?story=food', full: true },
  { name: 'stories-home', url: 'stories.html?story=home', full: true },
  { name: 'stories-people', url: 'stories.html?story=people', full: true },
  { name: 'stories-body', url: 'stories.html?story=body', full: true },
  { name: 'stories-freetime', url: 'stories.html?story=freetime', full: true },
  { name: 'stories-services', url: 'stories.html?story=services', full: true },
  { name: 'stories-past', url: 'stories.html?story=past', full: true },
  { name: 'stories-word', url: 'stories.html?story=cafe', act: async (p) => p.click('.word:text-is("te")') },
  { name: 'stories-speaking', url: 'stories.html?story=cafe', act: async (p) => p.evaluate(() => { document.querySelector('.reader__line').classList.add('is-current'); document.querySelectorAll('.word')[2].classList.add('is-speaking'); }) },
  { name: 'stories-translations', url: 'stories.html?story=family', act: async (p) => p.check('[data-show-translations]', { force: true }) },
  { name: 'letters', url: 'letters.html', full: true },
  { name: 'letters-dialog', url: 'letters.html', act: async (p) => p.click('.letter-tile[data-item="þ"]') },
  { name: 'ex-letter', url: 'lesson.html?mode=alphabet&qa', act: async (p) => untilType(p, 'letter') },
  { name: 'ex-lettername', url: 'lesson.html?mode=alphabet&qa', act: async (p) => untilType(p, 'lettername') },
  { name: 'ex-likenb', url: 'lesson.html?mode=alphabet&qa', act: async (p) => untilType(p, 'likenb') },
  { name: 'ex-spell', url: 'lesson.html?mode=alphabet&qa', act: async (p) => untilType(p, 'spell') },
  { name: 'feedback-letter', url: 'lesson.html?mode=alphabet&qa', act: async (p) => { await untilType(p, 'letter'); await answer(p); await p.click('[data-action="check"]'); } },
  { name: 'feedback-likenb-wrong', url: 'lesson.html?mode=alphabet&qa', act: async (p) => { await untilType(p, 'likenb'); await wrongOption(p); await p.click('[data-action="check"]'); } },
  { name: 'feedback-spell-almost', url: 'lesson.html?mode=alphabet&focus=á&qa', act: async (p) => { await untilType(p, 'spell'); await answer(p, 'almost'); await p.click('[data-action="check"]'); } },
  { name: 'sounds', url: 'lesson.html?mode=sounds&qa' },
  { name: 'feedback-pair', url: 'lesson.html?mode=sounds&qa', act: async (p) => { await answer(p); await p.click('[data-action="check"]'); } },
  { name: 'voices', url: 'voices.html', full: true },
  { name: 'music', url: 'music.html', full: true },
  { name: 'bridge', url: 'bridge.html', full: true },
  { name: 'bridge-filtered', url: 'bridge.html', act: async (p) => p.click('[data-rule="ending-ur"]') },
  { name: 'ex-bridge', url: 'lesson.html?mode=bridge&qa' },
  { name: 'feedback-bridge', url: 'lesson.html?mode=bridge&qa', act: async (p) => { await answer(p); await p.click('[data-action="check"]'); } },
  { name: 'dictionary-bridge', url: 'dictionary.html?q=bók', full: true },
  { name: 'profile-progress', url: 'profile.html', full: true, act: importProgress },
  { name: 'learn-progress', url: 'learn.html', act: async (p) => { await importProgress(p); await p.goto(`${base}learn.html`); await settle(p); } },
  { name: 'lesson-complete', url: 'lesson.html?unit=hello&lesson=1&qa', act: playThrough },
  { name: 'feedback-combo', url: 'lesson.html?unit=hello&lesson=1&qa', act: async (p) => answerRight(p, 5) },
  { name: 'lesson-friend', url: 'lesson.html?unit=hello&lesson=5&qa', act: async (p) => { await seedLessons(p, ['hello/1', 'hello/2', 'hello/3', 'hello/4']); await playThrough(p); } },
  { name: 'lesson-hearts', url: 'lesson.html?unit=hello&lesson=1&qa', hearts: true },
  { name: 'out-of-hearts', url: 'lesson.html?unit=hello&lesson=1&qa', hearts: true, act: async (p) => { for (let i = 0; i < 5; i++) { await p.click('[data-action="skip"]'); await p.click('[data-action="continue"]'); } } },
  { name: 'dictionary', url: 'dictionary.html', full: true },
  { name: 'dictionary-form', url: 'dictionary.html?q=bjórinn', full: true },
  { name: 'practice', url: 'practice.html', full: true },
  { name: 'profile', url: 'profile.html', full: true },
  { name: 'settings', url: 'settings.html', full: true, sw: true },
  { name: 'speak', url: 'lesson.html?mode=speak&qa', speak: true },
  { name: 'speak-confirm', url: 'lesson.html?mode=speak&qa', speak: true, act: async (p) => { await p.evaluate(() => (window.__heard = 'ég er')); await p.click('[data-mic]'); await p.locator('[data-confirm]:not([hidden])').waitFor(); } },
  { name: 'feedback-speak', url: 'lesson.html?mode=speak&qa', speak: true, act: async (p) => { await answer(p); await p.click('[data-action="check"]'); } },
  { name: 'credits', url: 'credits.html', full: true },
  { name: 'styleguide', url: 'styleguide.html', full: true },
  { name: 'landing-calm', url: 'index.html', calm: true },
];
const OVERFLOW_PAGES = [
  'index.html', 'learn.html', 'guide.html?unit=hello', 'guide.html?unit=aboutme', 'guide.html?unit=cafe', 'guide.html?unit=family', 'guide.html?unit=numbers', 'guide.html?unit=around', 'guide.html?unit=time', 'guide.html?unit=myday', 'guide.html?unit=shopping', 'guide.html?unit=food', 'guide.html?unit=home', 'guide.html?unit=people', 'guide.html?unit=weather', 'guide.html?unit=body', 'guide.html?unit=freetime', 'guide.html?unit=study', 'guide.html?unit=services', 'guide.html?unit=past', 'guide.html?unit=grammar', 'guide.html?unit=newwords', ...firstOf.values(), 'lesson.html?mode=placement',
  'declension.html?lemma=kaffi', 'declension.html?lemma=vera', 'declension.html?lemma=góður', 'declension.html?lemma=tveir',
  'stories.html', 'stories.html?story=hello', 'stories.html?story=aboutme', 'stories.html?story=cafe', 'stories.html?story=numbers', 'stories.html?story=time', 'stories.html?story=myday', 'stories.html?story=shopping', 'stories.html?story=food', 'stories.html?story=home', 'stories.html?story=people', 'stories.html?story=body', 'stories.html?story=freetime', 'stories.html?story=study', 'stories.html?story=services', 'stories.html?story=past', 'stories.html?story=grammar', 'stories.html?story=newwords', 'lesson.html?mode=sounds', 'letters.html', 'lesson.html?mode=alphabet', 'voices.html', 'music.html', 'bridge.html', 'lesson.html?mode=bridge', 'dictionary.html', 'practice.html', 'profile.html', 'settings.html', 'credits.html', 'styleguide.html',
];

async function settle(page) {
  await page.waitForFunction(() => document.documentElement.classList.contains('is-ready'), null, { timeout: 15_000 });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(350);
}

const { server, url: base } = await startServer();
await mkdir(OUT, { recursive: true });
await writeFile(FIXTURE, JSON.stringify(progressFixture()));
const browser = await chromium.launch();
const report = { axe: [], overflow: [], errors: [] };

for (const [vpName, options] of Object.entries(VIEWPORTS)) {
  await mkdir(path.join(OUT, vpName), { recursive: true });
  for (const shot of SHOTS) {
    if (only && !only.includes(shot.name)) continue;
    const context = await browser.newContext({ ...options, reducedMotion: shot.calm ? 'reduce' : 'no-preference', serviceWorkers: shot.sw ? 'allow' : 'block' });
    if (shot.hearts) await context.addInitScript(() => localStorage.setItem('tolva.settings.v1', JSON.stringify({ hearts: true })));
    if (shot.speak) {
      await context.addInitScript(() => localStorage.setItem('tolva.settings.v1', JSON.stringify({ speaking: true })));
      await context.addInitScript(fakeSpeech);
    }
    const page = await context.newPage();
    page.on('pageerror', (e) => report.errors.push(`${vpName}/${shot.name}: ${e.message}`));
    page.on('console', (m) => m.type() === 'error' && report.errors.push(`${vpName}/${shot.name}: console: ${m.text()}`));
    await page.goto(base + shot.url);
    try {
      await settle(page);
    } catch (e) {
      report.errors.push(`${vpName}/${shot.name}: page never became ready (${e.message.split('\n')[0]})`);
      await context.close();
      continue;
    }
    if (shot.act) {
      await shot.act(page);
      await page.waitForTimeout(400);
    }
    await page.screenshot({ path: path.join(OUT, vpName, `${shot.name}.png`), fullPage: Boolean(shot.full) });
    const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
    for (const v of axe.violations) {
      report.axe.push({ viewport: vpName, shot: shot.name, id: v.id, impact: v.impact, help: v.help, nodes: v.nodes.slice(0, 5).map((n) => `${n.target.join(' ')}: ${n.failureSummary?.split('\n')[1]?.trim() ?? ''}`) });
    }
    await context.close();
  }
}

// No horizontal scroll down to 320 px.
const narrow = await browser.newContext({ viewport: { width: 320, height: 640 }, isMobile: true, hasTouch: true, serviceWorkers: 'block' });
// With --only, just the pages of the chosen shots.
const onlyUrls = only && new Set(SHOTS.filter((s) => only.includes(s.name)).map((s) => s.url));
for (const url of OVERFLOW_PAGES.filter((u) => !onlyUrls || onlyUrls.has(u))) {
  const page = await narrow.newPage();
  await page.goto(base + url);
  await settle(page);
  const result = await page.evaluate(() => {
    const vw = document.documentElement.clientWidth;
    const wide = [...document.querySelectorAll('body *')]
      .filter((el) => {
        const r = el.getBoundingClientRect();
        return r.width > 0 && r.right > vw + 1 && getComputedStyle(el).position !== 'fixed';
      })
      .slice(0, 5)
      .map((el) => `${el.tagName.toLowerCase()}.${[...el.classList].join('.')} right=${Math.round(el.getBoundingClientRect().right)}`);
    return { scrollWidth: document.documentElement.scrollWidth, vw, wide };
  });
  if (result.scrollWidth > result.vw) report.overflow.push({ url, ...result });
  await page.close();
}
await narrow.close();
await browser.close();
server.close();

await writeFile(path.join(OUT, 'report.json'), JSON.stringify(report, null, 2));
const byRule = Object.groupBy(report.axe, (v) => v.id);
console.log(`Screenshots: ${path.relative(ROOT, OUT)}/{${Object.keys(VIEWPORTS).join(',')}}/*.png`);
console.log(`axe violations: ${report.axe.length}${report.axe.length ? '' : ' (none)'}`);
for (const [id, list] of Object.entries(byRule)) {
  console.log(`  ${id} (${list[0].impact}): ${list[0].help}`);
  for (const v of list.slice(0, 6)) console.log(`    ${v.viewport}/${v.shot}: ${v.nodes.join(' | ')}`);
}
console.log(`Horizontal overflow at 320 px: ${report.overflow.length ? '' : 'none'}`);
for (const o of report.overflow) console.log(`  ${o.url}: scrollWidth ${o.scrollWidth} > ${o.vw}; ${o.wide.join('; ')}`);
console.log(`Page errors: ${report.errors.length ? '' : 'none'}`);
for (const e of [...new Set(report.errors)]) console.log(`  ${e}`);
process.exit(report.axe.length || report.overflow.length || report.errors.length ? 1 : 0);
