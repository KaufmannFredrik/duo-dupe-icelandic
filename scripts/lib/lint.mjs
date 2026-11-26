// Icelandic grammar and spelling check through GreynirCorrect (scripts/lint-icelandic.py),
// with a cache in .cache/greynir/ keyed by sentence text, so each sentence is checked once.

import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { appendFile, mkdir, readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { createInterface } from 'node:readline';
import path from 'node:path';
import { CACHE, ROOT } from './bulk.mjs';

// Codes that say nothing about correctness: the parser could not analyze the sentence (E001),
// the sentence ends in an exclamation mark (E007), or a word is unknown, such as a foreign name (U001).
export const INFO_CODES = new Set(['E001', 'E007', 'U001']);

// Spelling suggestions checked by hand and found wrong, as "<code> <text>": the word is a correct
// DMII Core form that means what the translation says. Each is explained in docs/DECISIONS.md.
export const FALSE_POSITIVES = new Set([
  // kvefið is kvef ("a cold") with the article, not a misspelling of kveðið (unit Líkaminn).
  "W001/w Orðið 'kvefið' gæti átt að vera 'kveðið'",
]);

const CACHE_FILE = path.join(CACHE, 'greynir', 'lint.jsonl');
const key = (text) => createHash('sha1').update(text).digest('hex');

export function pythonPath() {
  const candidates = [path.join(ROOT, '.venv', 'Scripts', 'python.exe'), path.join(ROOT, '.venv', 'bin', 'python')];
  return candidates.find((p) => existsSync(p)) ?? null;
}

export const SETUP_HELP = 'GreynirCorrect is not set up. Run once: python -m venv .venv, then .venv/Scripts/pip install reynir-correct (macOS/Linux: .venv/bin/pip), then .venv/Scripts/python -m icegrams.download.';

async function loadCache() {
  const cache = new Map();
  if (!existsSync(CACHE_FILE)) return cache;
  for (const line of (await readFile(CACHE_FILE, 'utf8')).split('\n')) {
    if (!line) continue;
    const { k, annotations } = JSON.parse(line);
    cache.set(k, annotations);
  }
  return cache;
}

/**
 * @param {string[]} texts sentences to check
 * @param {{ onProgress?: (done: number, total: number) => void }} [options]
 * @returns {Promise<Map<string, {code: string, text: string}[]>>} annotations by sentence text
 */
export async function lintTexts(texts, { onProgress } = {}) {
  const python = pythonPath();
  if (!python) throw new Error(SETUP_HELP);
  const cache = await loadCache();
  const todo = [...new Set(texts)].filter((t) => !cache.has(key(t)));
  if (todo.length) {
    await mkdir(path.dirname(CACHE_FILE), { recursive: true });
    const child = spawn(python, ['-I', path.join(ROOT, 'scripts', 'lint-icelandic.py')], { stdio: ['pipe', 'pipe', 'inherit'] });
    const done = new Promise((resolve, reject) => {
      child.on('error', reject);
      child.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`lint-icelandic.py exited with ${code}`))));
    });
    child.stdin.end(todo.map((text, i) => JSON.stringify({ id: i, text })).join('\n'));
    let n = 0;
    for await (const line of createInterface({ input: child.stdout, crlfDelay: Infinity })) {
      if (!line) continue;
      const { id, annotations } = JSON.parse(line);
      const k = key(todo[id]);
      cache.set(k, annotations);
      await appendFile(CACHE_FILE, `${JSON.stringify({ k, annotations })}\n`);
      if (++n % 250 === 0) onProgress?.(n, todo.length);
    }
    await done;
  }
  return new Map([...new Set(texts)].map((t) => [t, cache.get(key(t)) ?? []]));
}

/** Annotations that point at a real or likely error. */
export const blocking = (annotations) => annotations.filter((a) => !INFO_CODES.has(a.code) && !FALSE_POSITIVES.has(`${a.code} ${a.text}`));
