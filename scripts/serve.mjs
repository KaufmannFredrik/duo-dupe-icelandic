#!/usr/bin/env node
// Minimal static file server for development and tests (no dependencies).
//   node scripts/serve.mjs [port]      then open http://localhost:8080/

import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ROOT } from './lib/bulk.mjs';

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.webmanifest': 'application/manifest+json',
  '.mp3': 'audio/mpeg',
  '.ogg': 'audio/ogg',
  '.opus': 'audio/ogg',
  '.ico': 'image/x-icon',
};

export function startServer(port = 0) {
  const server = createServer(async (req, res) => {
    try {
      const url = new URL(req.url, 'http://localhost');
      let file = path.normalize(path.join(ROOT, decodeURIComponent(url.pathname)));
      if (!file.startsWith(ROOT)) throw Object.assign(new Error('outside root'), { code: 'ENOENT' });
      if ((await stat(file)).isDirectory()) file = path.join(file, 'index.html');
      const body = await readFile(file);
      res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] ?? 'application/octet-stream', 'Cache-Control': 'no-store' });
      res.end(body);
    } catch {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Not found');
    }
  });
  return new Promise((resolve) => server.listen(port, '127.0.0.1', () => resolve({ server, url: `http://127.0.0.1:${server.address().port}/` })));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { url } = await startServer(Number(process.argv[2] ?? 8080));
  console.log(`Serving ${ROOT} at ${url}`);
}
