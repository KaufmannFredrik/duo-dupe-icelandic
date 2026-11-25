// Music lab: the four moods of the generated menu music side by side, with the volume, a jump to
// each section (the tvísöngur bridge included) and what is playing: section, bar, chord, and in the
// bridge the two voices and the interval between them. Nothing plays until the learner presses Play.

import { ready } from '../app.js';
import { t } from '../i18n.js';
import { getSettings, setSetting } from '../store.js';
import { dayKey } from '../stats.js';
import { hashSeed } from '../engine/rng.js';
import { STYLES, STYLE_IDS } from '../music/styles.js';
import { chord, key, noteName } from '../music/theory.js';
import { createPlayer, volumeGain } from '../music/player.js';
import { audioContext, unlock } from '../audio-context.js';
import { icon } from '../shell.js';

await ready;

const SECTIONS = ['intro', 'verse', 'chorus', 'bridge'];
const moods = document.querySelector('[data-moods]');
const nowEl = document.querySelector('[data-now]');
const barsEl = document.querySelector('[data-bars]');
const voicesEl = document.querySelector('[data-voices]');
const stopBtn = document.querySelector('[data-stop]');
const anotherBtn = document.querySelector('[data-another]');
const volume = document.querySelector('#music-volume');
const volumeOut = document.querySelector('[data-volume-out]');

const keyName = (tonic, mode) => t(`music.mode.${mode}`, { t: tonic.replace('b', '♭').replace('#', '♯') });
const chords = (k, tokens) => tokens.map((tok) => chord(k, tok).name);
const line = (names) => `${names.slice(0, 4).join(' ')} | ${names.slice(4).join(' ')}`;

function card(id) {
  const s = STYLES[id];
  const k = key(...s.key);
  const rows = [
    ['verse', line(chords(k, s.sections.verse.chords))],
    ['chorus', line(chords(k, s.sections.chorus.chords))],
    ['bridge', t('music.bridgeIn', { key: keyName(...s.sections.bridge.duet) })],
  ];
  return `<section class="card card--quiet stack music-mood" aria-labelledby="mood-${id}">
    <h2 class="card__title" id="mood-${id}">${t(`music.mood.${id}`)}</h2>
    <p class="cluster"><span class="tag">${keyName(...s.key)}</span><span class="tag">${t('music.tempo', { n: s.tempo })}</span></p>
    <p class="setting__help">${t(`music.where.${id}`)}</p>
    <dl class="music-chords">${rows.map(([sec, text]) => `<dt>${t(`music.section.${sec}`)}</dt><dd>${text}</dd>`).join('')}</dl>
    <div><button type="button" class="button button--sm button-primary" data-play="${id}" aria-pressed="false">${icon('play')}<span>${t('music.play')}</span></button></div>
    <div class="cluster" role="group" aria-label="${t('music.jump')}">${SECTIONS.map((sec) => `<button type="button" class="chip" data-mood="${id}" data-jump="${sec}">${t(`music.section.${sec}`)}</button>`).join('')}</div>
  </section>`;
}
moods.innerHTML = STYLE_IDS.map(card).join('');

let ctx = null;
let player = null;
let seed = hashSeed(dayKey());

const setting = () => getSettings().musicVolume;
volume.value = String(setting());
volumeOut.textContent = `${setting()}%`;
volume.addEventListener('input', () => {
  const v = Number(volume.value);
  volumeOut.textContent = `${v}%`;
  setSetting('musicVolume', v);
  player?.setVolume(volumeGain(v));
});

function intervalText(gap) {
  if (gap === 0) return t('music.interval.unison');
  const size = Math.abs(gap) === 7 ? 'fifth' : 'third';
  return t(`music.interval.${size}${gap < 0 ? 'Below' : 'Above'}`);
}

function showBar(info) {
  const { song, section, at, bar } = info;
  nowEl.textContent = t('music.bar', { mood: t(`music.mood.${song.style}`), section: t(`music.section.${section}`), n: at + 1 });
  const start = bar - at;
  const local = start % song.bars.length;
  barsEl.innerHTML = song.bars
    .slice(local, local + 8)
    .map((b, i) => `<li${i === at ? ' class="is-current" aria-current="true"' : ''}>${b.label === 'tvísöngur' ? '·' : b.label}</li>`)
    .join('');
  barsEl.hidden = section === 'bridge';
  if (section === 'bridge') {
    const duet = song.sections.bridge.duet;
    const step = at * 16;
    const i = duet.v1.findIndex((n) => n.abs <= step && step < n.abs + n.dur);
    if (i >= 0) {
      const a = duet.v1[i].midi;
      const b = duet.v2[i].midi;
      voicesEl.textContent = t('music.voices', { a: noteName(a), b: noteName(b), interval: intervalText(b - a) });
    }
    voicesEl.hidden = i < 0;
  } else {
    voicesEl.hidden = true;
  }
}

function setPressed(id) {
  for (const b of moods.querySelectorAll('[data-play]')) {
    const on = b.dataset.play === id;
    b.setAttribute('aria-pressed', String(on));
    b.querySelector('span').textContent = t(on ? 'music.playing' : 'music.play');
  }
  stopBtn.disabled = !id;
  anotherBtn.disabled = !id;
}

async function play(id, section = 'intro') {
  ctx ??= audioContext();
  await unlock();
  const old = player;
  player = null;
  old?.stop({ fade: 0.4 });
  const p = createPlayer(ctx, id, { seed, volume: volumeGain(setting()), onBar: (info) => player === p && showBar(info) });
  player = p;
  p.start(STYLES[id].form.indexOf(section) * 8, { fade: 0.8 });
  setPressed(id);
}

function stop() {
  player?.stop();
  player = null;
  setPressed(null);
  nowEl.textContent = t('music.idle');
  barsEl.hidden = true;
  voicesEl.hidden = true;
}

moods.addEventListener('click', (e) => {
  const playBtn = e.target.closest('[data-play]');
  if (playBtn) {
    if (player?.style === playBtn.dataset.play) stop();
    else play(playBtn.dataset.play);
    return;
  }
  const jump = e.target.closest('[data-jump]');
  if (jump) play(jump.dataset.mood, jump.dataset.jump);
});
stopBtn.addEventListener('click', stop);
anotherBtn.addEventListener('click', () => {
  if (!player) return;
  seed = hashSeed(`${seed}:another`);
  const id = player.style;
  const cycleStart = Math.floor(player.position() / player.length) * player.length;
  const at = Math.floor(player.position()) - cycleStart;
  const section = STYLES[id].form[Math.floor(at / 8)];
  play(id, section);
});

// Silence when the page is hidden; Play starts it again.
document.addEventListener('visibilitychange', () => {
  if (document.hidden && player) stop();
});

