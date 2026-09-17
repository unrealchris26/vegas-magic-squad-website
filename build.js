#!/usr/bin/env node
/* ==========================================================================
   Vegas Magic Squad — deploy build
   ==========================================================================
   Copies the site into dist/ and nothing else.

   This exists because the project folder is a workspace, not a web root. It
   also holds DESIGN.md, PRODUCT.md, HANDOFF.md, .impeccable/, screenshots of
   another studio's site used as reference, and ~11MB of source images that
   never made it onto the page. Publishing the folder as-is would put all of
   that on a public URL, so the deploy gets an explicit allowlist instead.

   The asset list is not hardcoded — it is read out of index.html, styles.css
   and script.js, so adding an image to the page is enough to ship it and
   this file does not rot. Anything referenced but missing fails the build
   rather than shipping a 404.

   No dependencies. Node 16+.
   ========================================================================== */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const OUT = path.join(ROOT, 'dist');

// The pages and the two shared files; every asset below is discovered.
const ENTRIES = ['index.html', 'squad.html', 'styles.css', 'script.js'];

// Only these get pulled in by reference. Keeps a stray mailto: or #anchor out.
const ASSET_EXT = /\.(?:css|js|mjs|woff2?|ttf|otf|jpe?g|png|webp|avif|gif|svg|ico|webmanifest|mp4|webm)$/i;

/* Every relative path in a src=, href= or url(). Absolute URLs, protocol
   links and bare fragments fall out on the extension test below. */
const REF = /(?:\b(?:src|href)\s*=\s*|url\(\s*)["']?([^"')\s>]+)/gi;

function isLocal(ref) {
  return ref &&
    !/^[a-z][a-z0-9+.-]*:/i.test(ref) &&   // http:, mailto:, tel:, data:
    !ref.startsWith('//') &&
    !ref.startsWith('#') &&
    ASSET_EXT.test(ref.split(/[?#]/)[0]);
}

function collect() {
  const found = new Set();
  for (const entry of ENTRIES) {
    const file = path.join(ROOT, entry);
    if (!fs.existsSync(file)) {
      throw new Error(`Entry file missing: ${entry}`);
    }
    const text = fs.readFileSync(file, 'utf8');
    let m;
    REF.lastIndex = 0;
    while ((m = REF.exec(text)) !== null) {
      const ref = m[1].split(/[?#]/)[0];
      if (!isLocal(ref)) continue;
      if (ENTRIES.includes(ref)) continue;        // already copied as an entry
      found.add(ref.replace(/^\.\//, ''));
    }
  }
  return [...found].sort();
}

function copy(rel) {
  const from = path.join(ROOT, rel);
  const to = path.join(OUT, rel);
  // A referenced file that is not on disk is a 404 waiting to happen, and a
  // 404 on a font or the stylesheet is not a subtle failure. Stop the build.
  if (!fs.existsSync(from)) {
    throw new Error(`Referenced but missing on disk: ${rel}`);
  }
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.copyFileSync(from, to);
  return fs.statSync(from).size;
}

function main() {
  fs.rmSync(OUT, { recursive: true, force: true });
  fs.mkdirSync(OUT, { recursive: true });

  const assets = collect();
  let bytes = 0;
  const heavy = [];

  for (const rel of [...ENTRIES, ...assets]) {
    const size = copy(rel);
    bytes += size;
    if (size > 300 * 1024) heavy.push([rel, size]);
  }

  // _headers and _redirects are Netlify's, and belong at the publish root.
  for (const extra of ['_headers', '_redirects', 'robots.txt']) {
    if (fs.existsSync(path.join(ROOT, extra))) {
      bytes += copy(extra);
    }
  }

  const mb = (bytes / 1024 / 1024).toFixed(2);
  console.log(`built dist/ — ${ENTRIES.length + assets.length} files, ${mb} MB`);

  if (heavy.length) {
    console.log('\nover 300KB, worth a look before this goes on a phone plan:');
    heavy
      .sort((a, b) => b[1] - a[1])
      .forEach(([rel, size]) => {
        console.log(`  ${(size / 1024).toFixed(0).padStart(5)} KB  ${rel}`);
      });
  }
}

try {
  main();
} catch (err) {
  console.error(`\nbuild failed: ${err.message}\n`);
  process.exit(1);
}
