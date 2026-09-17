#!/usr/bin/env node
/* ==========================================================================
   Vegas Magic Squad — local preview server
   ==========================================================================
   Zero dependencies. Node is already required by build.js, so this adds no
   new runtime to the project.

     node serve.js            serve the project folder (live source)
     node serve.js dist       serve the built output
     node serve.js . 4000     pick the port
     node serve.js . 0 --no-open   don't launch a browser

   Everything is sent with no-cache on purpose: this is a preview server, and
   a cached stylesheet that hides an edit you just made wastes more time than
   the requests save. The real caching rules live in _headers, for Netlify.
   ========================================================================== */
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const args = process.argv.slice(2).filter(a => !a.startsWith('--'));
const flags = process.argv.slice(2).filter(a => a.startsWith('--'));

const ROOT = path.resolve(__dirname, args[0] || '.');
const WANTED = Number(args[1]) || Number(process.env.PORT) || 8765;
const OPEN = !flags.includes('--no-open');

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.txt': 'text/plain; charset=utf-8',
  '.md': 'text/plain; charset=utf-8'
};

if (!fs.existsSync(ROOT)) {
  console.error(`\n  Nothing to serve: ${ROOT} does not exist.`);
  if (path.basename(ROOT) === 'dist') console.error('  Run "node build.js" first, or use run.cmd dist.\n');
  process.exit(1);
}

const server = http.createServer((req, res) => {
  let rel;
  try {
    rel = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  } catch (e) {
    res.writeHead(400).end('Bad request');
    return;
  }

  let file = path.join(ROOT, rel);

  // Never serve outside the root, whatever the URL claims.
  if (!file.startsWith(ROOT)) {
    res.writeHead(403).end('Forbidden');
    return;
  }

  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) {
    file = path.join(file, 'index.html');
  }
  // Bare "/about" should find about.html, the way a static host would.
  if (!fs.existsSync(file) && fs.existsSync(file + '.html')) file += '.html';

  if (!fs.existsSync(file) || !fs.statSync(file).isFile()) {
    console.log(`  404  ${rel}`);
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`<!doctype html><meta charset="utf-8">
      <title>404</title>
      <body style="background:#07090f;color:#e6d193;font:16px/1.6 system-ui;padding:48px">
      <h1 style="font-weight:600">404</h1>
      <p><code>${rel}</code> is not in ${path.basename(ROOT)}/</p>
      <p><a href="/" style="color:#c8a850">Back to the site</a></p>`);
    return;
  }

  const type = TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream';
  res.writeHead(200, {
    'Content-Type': type,
    'Cache-Control': 'no-store, max-age=0',
    'Access-Control-Allow-Origin': '*'
  });
  fs.createReadStream(file).pipe(res);
});

// A port left in TIME_WAIT by a previous run should not stop this one, so it
// steps to the next free port rather than dying with EADDRINUSE.
let port = WANTED;
let tries = 0;
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE' && tries < 12) {
    tries += 1;
    port += 1;
    server.listen(port, '127.0.0.1');
    return;
  }
  console.error(`\n  Could not start the server: ${err.message}\n`);
  process.exit(1);
});

server.listen(port, '127.0.0.1', () => {
  const url = `http://localhost:${port}/`;
  console.log('');
  console.log('  Vegas Magic Squad — preview');
  console.log('  ' + '-'.repeat(46));
  console.log(`  serving   ${ROOT}`);
  console.log(`  address   ${url}`);
  if (port !== WANTED) console.log(`  note      ${WANTED} was busy, used ${port} instead`);
  console.log(`  pages     ${url}  and  ${url}squad.html`);
  console.log('  ' + '-'.repeat(46));
  console.log('  Ctrl+C to stop. Edits show on refresh — nothing is cached.');
  console.log('');

  if (OPEN) {
    // "start" needs an empty title argument first or it eats the URL.
    if (process.platform === 'win32') spawn('cmd', ['/c', 'start', '', url], { detached: true, stdio: 'ignore' }).unref();
    else if (process.platform === 'darwin') spawn('open', [url], { detached: true, stdio: 'ignore' }).unref();
    else spawn('xdg-open', [url], { detached: true, stdio: 'ignore' }).unref();
  }
});

process.on('SIGINT', () => {
  console.log('\n  Stopped.\n');
  process.exit(0);
});
