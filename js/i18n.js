// UI strings in English and Norwegian Bokmål. HTML carries the English text as a fallback;
// elements opt in with data-i18n (text), data-i18n-html (trusted markup from our own JSON),
// data-i18n-aria-label, data-i18n-placeholder and data-i18n-title.

export const UI_LANGS = ['en', 'nb'];

let lang = 'en';
let strings = {};
let fallback = {};

async function load(code) {
  const res = await fetch(new URL(`./i18n/${code}.json`, import.meta.url));
  if (!res.ok) throw new Error(`i18n ${code}: HTTP ${res.status}`);
  return res.json();
}

export function detectLang(setting) {
  if (UI_LANGS.includes(setting)) return setting;
  const prefs = (navigator.languages?.length ? navigator.languages : [navigator.language ?? 'en']).map((l) => l.toLowerCase());
  return prefs.some((l) => /^(nb|no|nn)\b/.test(l)) ? 'nb' : 'en';
}

export async function initI18n(code) {
  lang = UI_LANGS.includes(code) ? code : 'en';
  try {
    fallback = await load('en');
    strings = lang === 'en' ? fallback : await load(lang);
  } catch (e) {
    console.warn('Could not load UI strings; using the built-in English text.', e);
    lang = 'en';
  }
  document.documentElement.lang = lang;
}

export const getLang = () => lang;

/** t('lesson.check') or t('hud.goal', { done: 20, goal: 30 }) */
export function t(key, vars) {
  let s = strings[key] ?? fallback[key] ?? key;
  if (vars) s = s.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m));
  return s;
}

/** Picks the current language from a { en, nb } object. */
export const pick = (obj) => (obj && typeof obj === 'object' ? obj[lang] ?? obj.en : obj);

export function applyI18n(root = document) {
  if (!Object.keys(fallback).length) return; // strings failed to load: keep the HTML text
  for (const el of root.querySelectorAll('[data-i18n]')) el.textContent = t(el.dataset.i18n);
  for (const el of root.querySelectorAll('[data-i18n-html]')) el.innerHTML = t(el.dataset.i18nHtml);
  for (const el of root.querySelectorAll('[data-i18n-aria-label]')) el.setAttribute('aria-label', t(el.dataset.i18nAriaLabel));
  for (const el of root.querySelectorAll('[data-i18n-placeholder]')) el.setAttribute('placeholder', t(el.dataset.i18nPlaceholder));
  for (const el of root.querySelectorAll('[data-i18n-title]')) el.setAttribute('title', t(el.dataset.i18nTitle));
}
