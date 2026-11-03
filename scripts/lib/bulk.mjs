// Shared helpers for the build scripts: repository paths, the download cache, and bzip2 streams.

import { spawn, spawnSync } from 'node:child_process';
import { createReadStream, createWriteStream, existsSync } from 'node:fs';
import { mkdir, readFile, rename, stat, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { createInterface } from 'node:readline';
import { Readable, Transform } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { createInflateRaw } from 'node:zlib';
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

// Download cache with a manifest of URL, size, SHA-256 and retrieval date per file.

const UA = 'TOLVA-build/0.1 (+https://github.com/KaufmannFredrik/duo-dupe-icelandic)';
const MANIFEST = path.join(CACHE, 'manifest.json');

export async function loadManifest() {
  try {
    return JSON.parse(await readFile(MANIFEST, 'utf8'));
  } catch {
    return {};
  }
}

async function sha256File(file) {
  const hash = createHash('sha256');
  await pipeline(createReadStream(file), hash);
  return hash.digest('hex');
}

/** Downloads url to .cache/<rel> once (or again with refresh) and returns its manifest entry. */
export async function download(url, rel, { refresh = false } = {}) {
  const dest = path.join(CACHE, rel);
  const manifest = await loadManifest();
  if (!refresh && existsSync(dest)) {
    if (manifest[rel]?.sha256) return manifest[rel];
    // A file placed by hand: record it.
    const info = await stat(dest);
    manifest[rel] = { url, file: rel, bytes: info.size, sha256: await sha256File(dest), retrieved: info.mtime.toISOString(), lastModified: null };
  } else {
    await mkdir(path.dirname(dest), { recursive: true });
    console.error(`downloading ${url}`);
    const res = await fetch(url, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(30 * 60_000) });
    if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`);
    const hash = createHash('sha256');
    let bytes = 0;
    const tap = new Transform({
      transform(chunk, _enc, cb) {
        hash.update(chunk);
        bytes += chunk.length;
        cb(null, chunk);
      },
    });
    await pipeline(Readable.fromWeb(res.body), tap, createWriteStream(`${dest}.part`));
    await rename(`${dest}.part`, dest);
    manifest[rel] = { url, file: rel, bytes, sha256: hash.digest('hex'), retrieved: new Date().toISOString(), lastModified: res.headers.get('last-modified') };
  }
  await mkdir(CACHE, { recursive: true });
  await writeFile(MANIFEST, JSON.stringify(manifest, null, 2));
  return manifest[rel];
}

/** Minimal zip reader (no zip64): lists entries and streams one entry's contents. */
export async function openZip(file) {
  const buf = await readFile(file);
  let eocd = -1;
  for (let i = buf.length - 22; i >= Math.max(0, buf.length - 65_557); i--) {
    if (buf.readUInt32LE(i) === 0x06054b50) {
      eocd = i;
      break;
    }
  }
  if (eocd < 0) throw new Error(`${file} is not a zip file`);
  const entries = [];
  let p = buf.readUInt32LE(eocd + 16);
  for (let i = 0, n = buf.readUInt16LE(eocd + 10); i < n; i++) {
    if (buf.readUInt32LE(p) !== 0x02014b50) throw new Error(`${file}: corrupt central directory`);
    const nameLen = buf.readUInt16LE(p + 28);
    entries.push({
      name: buf.toString('utf8', p + 46, p + 46 + nameLen),
      method: buf.readUInt16LE(p + 10),
      csize: buf.readUInt32LE(p + 20),
      size: buf.readUInt32LE(p + 24),
      offset: buf.readUInt32LE(p + 42),
    });
    p += 46 + nameLen + buf.readUInt16LE(p + 30) + buf.readUInt16LE(p + 32);
  }
  const stream = (e) => {
    if (e.csize === 0xffffffff || e.offset === 0xffffffff) throw new Error('zip64 archives are not supported');
    const start = e.offset + 30 + buf.readUInt16LE(e.offset + 26) + buf.readUInt16LE(e.offset + 28);
    const data = Readable.from([buf.subarray(start, start + e.csize)]);
    if (e.method === 0) return data;
    if (e.method === 8) return data.pipe(createInflateRaw());
    throw new Error(`unsupported zip compression method ${e.method}`);
  };
  return { entries, stream };
}
