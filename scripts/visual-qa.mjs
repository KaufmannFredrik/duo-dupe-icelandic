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

const OUT = path.join(ROOT, 'screenshots');
const only = process.argv.find((a) => a.startsWith('--only='))?.slice(7).split(',');

const VIEWPORTS = {
  phone: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 },
  tablet: { viewport: { width: 768, height: 1024 }, hasTouch: true, deviceScaleFactor: 1 },
  desktop: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 },
};

// Each shot: page URL, optional actions to reach a state, full-page or viewport capture.
const lessonAt = (step) => `lesson.html?step=${step}`;
const SHOTS = [
  { name: 'landing', url: 'index.html', full: true },
  { name: 'learn', url: 'learn.html', full: true },
  { name: 'lesson-1-choice', url: lessonAt(1) },
  { name: 'lesson-1-selected', url: lessonAt(1), act: async (p) => p.click('.option >> nth=1') },
  { name: 'feedback-correct', url: lessonAt(1), act: async (p) => { await p.click('.option:has-text("What is your name?")'); await p.click('[data-action="check"]'); } },
  { name: 'lesson-2-wordbank', url: lessonAt(2), act: async (p) => { await p.click('[data-bank] .chip:text-is("Halló")'); await p.click('[data-bank] .chip:text-is("ég")'); } },
  { name: 'lesson-3-type', url: lessonAt(3), act: async (p) => p.fill('#answer', 'Godan dag') },
  { name: 'feedback-almost', url: lessonAt(3), act: async (p) => { await p.fill('#answer', 'Gódan daginn'); await p.click('[data-action="check"]'); } },
  { name: 'lesson-4-ending', url: lessonAt(4) },
  { name: 'feedback-wrong', url: lessonAt(4), act: async (p) => { await p.click('.option:has-text("Íslandi")'); await p.click('[data-action="check"]'); } },
  { name: 'lesson-5-case', url: lessonAt(5) },
  { name: 'lesson-6-match', url: lessonAt(6), act: async (p) => { await p.click('[data-side="is"]:has-text("Takk!")'); await p.click('[data-side="en"]:has-text("Thank you!")'); } },
  { name: 'lesson-quit', url: lessonAt(1), act: async (p) => p.keyboard.press('Escape') },
  { name: 'declension', url: 'declension.html', full: true },
  { name: 'declension-practice', url: 'declension.html', full: true, act: async (p) => { await p.check('[data-practice]', { force: true }); await p.fill('.decl__input >> nth=0', 'hesturinn'); await p.click('[data-check-table]'); } },
  { name: 'stories', url: 'stories.html', full: true },
  { name: 'stories-word', url: 'stories.html', act: async (p) => p.click('.word:text-is("hestur")') },
  { name: 'dictionary', url: 'dictionary.html', full: true },
  { name: 'practice', url: 'practice.html', full: true },
  { name: 'profile', url: 'profile.html', full: true },
  { name: 'settings', url: 'settings.html', full: true },
  { name: 'credits', url: 'credits.html', full: true },
  { name: 'styleguide', url: 'styleguide.html', full: true },
  { name: 'landing-calm', url: 'index.html', calm: true },
];
const OVERFLOW_PAGES = ['index.html', 'learn.html', ...[1, 2, 3, 4, 5, 6].map(lessonAt), 'declension.html', 'stories.html', 'dictionary.html', 'practice.html', 'profile.html', 'settings.html', 'credits.html', 'styleguide.html'];

async function settle(page) {
  await page.waitForFunction(() => document.documentElement.classList.contains('is-ready'), null, { timeout: 15_000 });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(350);
}

const { server, url: base } = await startServer();
const browser = await chromium.launch();
const report = { axe: [], overflow: [], errors: [] };

for (const [vpName, options] of Object.entries(VIEWPORTS)) {
  await mkdir(path.join(OUT, vpName), { recursive: true });
  for (const shot of SHOTS) {
    if (only && !only.includes(shot.name)) continue;
    const context = await browser.newContext({ ...options, reducedMotion: shot.calm ? 'reduce' : 'no-preference' });
    const page = await context.newPage();
    page.on('pageerror', (e) => report.errors.push(`${vpName}/${shot.name}: ${e.message}`));
    page.on('console', (m) => m.type() === 'error' && report.errors.push(`${vpName}/${shot.name}: console: ${m.text()}`));
    await page.goto(base + shot.url);
    await settle(page);
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
const narrow = await browser.newContext({ viewport: { width: 320, height: 640 }, isMobile: true, hasTouch: true });
for (const url of OVERFLOW_PAGES) {
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
