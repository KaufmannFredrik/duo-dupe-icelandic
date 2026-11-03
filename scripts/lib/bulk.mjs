// Shared helpers for the build scripts: repository paths, the download cache, and bzip2 streams.

import { spawn, spawnSync } from 'node:child_process';
import { createInterface } from 'node:readline';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
// TOLVA_CACHE moves the download cache, for example out of a synced folder.
export const CACHE = path.resolve(process.env.TOLVA_CACHE ?? path.join(ROOT, '.cache'));

let bzip2Path;
export function bzip2() {
  if (bzip2Path) return bzip2Path;
  const candidates = ['bzip2'];
  if (process.platform === 'win32') {
    for (const dir of ['usr\\bin', 'ucrt64\\bin', 'mingw64\\bin']) candidates.push(`C:\\Program Files\\Git\\${dir}\\bzip2.exe`);
  }
  bzip2Path = candidates.find((c) => !spawnSync(c, ['--help'], { stdio: 'ignore' }).error);
  if (!bzip2Path) throw new Error('bzip2 not found. It ships with macOS, Linux and Git for Windows; run this from a shell where `bzip2` works.');
  return bzip2Path;
}

export function bunzipLines(file) {
  const child = spawn(bzip2(), ['-dc', file], { stdio: ['ignore', 'pipe', 'inherit'] });
  return createInterface({ input: child.stdout, crlfDelay: Infinity });
}

export function bunzipBuffer(file) {
  return new Promise((resolve, reject) => {
    const child = spawn(bzip2(), ['-dc', file], { stdio: ['ignore', 'pipe', 'inherit'] });
    const chunks = [];
    child.stdout.on('data', (c) => chunks.push(c));
    child.on('error', reject);
    child.on('close', (code) => (code === 0 ? resolve(Buffer.concat(chunks)) : reject(new Error(`bzip2 exited with ${code} for ${file}`))));
  });
}
