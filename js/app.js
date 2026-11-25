// Page bootstrap shared by every screen: display settings (Calm mode, scanlines), UI language,
// brand strings, the app shell, the sound and music toggles, and the menu music (loaded only once
// the learner turns music on). Pages do `import { ready } from './app.js'`.

import { getSettings, setSetting } from './store.js';
import { applyI18n, detectLang, initI18n, pick, t } from './i18n.js';
import { renderShell } from './shell.js';
import { settle } from './progress.js';
import { registerWorker } from './offline.js';
import { sfx } from './sfx.js';

const html = document.documentElement;
const CALM_QUERIES = ['(prefers-reduced-motion: reduce)', '(prefers-contrast: more)', '(forced-colors: active)'].map((q) => window.matchMedia(q));

export function applyDisplaySettings() {
  const s = getSettings();
  const auto = CALM_QUERIES.some((m) => m.matches);
  html.dataset.calm = s.calm === 'on' || (s.calm === 'auto' && auto) ? 'on' : 'off';
  html.dataset.scan = s.scan === 'default' ? html.dataset.scanPage ?? 'default' : s.scan;
}

export async function loadJSON(relativeToRoot) {
  const res = await fetch(new URL(`../${relativeToRoot}`, import.meta.url));
  if (!res.ok) throw new Error(`${relativeToRoot}: HTTP ${res.status}`);
  return res.json();
}

export let brand = { name: 'TÖLVA', wordmark: 'TÖLVA', tagline: { en: '' } };

function applyBrand() {
  for (const el of document.querySelectorAll('[data-brand]')) {
    const value = brand[el.dataset.brand];
    if (value) el.textContent = pick(value);
  }
  const title = document.body.dataset.titleKey;
  document.title = title ? `${t(title)} · ${brand.name}` : `${brand.name}: ${pick(brand.tagline)}`;
}

function bindSoundToggles() {
  const update = () => {
    const on = getSettings().sound;
    for (const btn of document.querySelectorAll('[data-sound-toggle]')) {
      btn.setAttribute('aria-pressed', String(on));
      btn.setAttribute('aria-label', t(on ? 'sound.turnOff' : 'sound.turnOn'));
      btn.querySelector('use')?.setAttribute('href', `assets/icons.svg#${on ? 'i-sound-on' : 'i-sound-off'}`);
    }
  };
  document.addEventListener('click', (e) => {
    if (!e.target.closest('[data-sound-toggle]')) return;
    setSetting('sound', !getSettings().sound);
    update();
    sfx('tap');
  });
  window.addEventListener('tolva:settings', update);
  window.addEventListener('tolva:shell', update);
  update();
}

function bindMusic() {
  const update = () => {
    const on = getSettings().music;
    for (const btn of document.querySelectorAll('[data-music-toggle]')) {
      btn.setAttribute('aria-pressed', String(on));
      btn.setAttribute('aria-label', t(on ? 'music.turnOff' : 'music.turnOn'));
      btn.querySelector('use')?.setAttribute('href', `assets/icons.svg#${on ? 'i-music' : 'i-music-off'}`);
    }
  };
  document.addEventListener('click', (e) => {
    if (!e.target.closest('[data-music-toggle]')) return;
    setSetting('music', !getSettings().music);
  });
  window.addEventListener('tolva:settings', update);
  window.addEventListener('tolva:shell', update);
  update();
  // The music code (about 70 KB) loads only when music is on.
  const load = () => import('./music/background.js').then((m) => m.initMusic());
  if (getSettings().music) load();
  else {
    const on = (e) => {
      if (!getSettings().music) return;
      window.removeEventListener('tolva:settings', on);
      load();
    };
    window.addEventListener('tolva:settings', on);
  }
}

async function init() {
  applyDisplaySettings();
  for (const m of CALM_QUERIES) m.addEventListener('change', applyDisplaySettings);
  window.addEventListener('tolva:settings', applyDisplaySettings);

  const settings = getSettings();
  await initI18n(detectLang(settings.uiLang));
  try {
    brand = await loadJSON('content/brand.json');
  } catch (e) {
    console.warn('content/brand.json not loaded; using built-in brand strings.', e);
  }
  try {
    await settle();
  } catch (e) {
    console.warn('Streak freezes not settled.', e);
  }
  if (document.body.dataset.shell !== undefined) await renderShell(document.body.dataset.page);
  applyI18n();
  applyBrand();
  bindSoundToggles();
  bindMusic();
  html.classList.add('is-ready');
  registerWorker();
}

export const ready = init();
