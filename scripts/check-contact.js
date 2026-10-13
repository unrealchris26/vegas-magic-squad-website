#!/usr/bin/env node
/* ==========================================================================
   npm run check-contact
   ==========================================================================
   The email and phone are written out by hand on every page (no JS
   injection, so crawlers and structured data can read them). This makes sure
   they are the approved ones everywhere: any other email address or phone
   number in the site's own files fails the check, with file and line.

   To change the business contact details, change APPROVED below first, then
   update the pages until this passes.

   Scanned: the site's own HTML, CSS, JS, XML, TXT and JSON, including the
   email templates. Skipped: third-party code (vendor/), build output (dist/),
   node_modules, the video projects (hero-video/, logo-intro/), local scratch
   (.tmp/), this scripts/ folder and Markdown notes, which discuss old values on purpose.
   No dependencies.
   ========================================================================== */
'use strict';

const fs = require('fs');
const path = require('path');

const APPROVED = {
  emails: ['kent@vegasmagicsquad.com'],
  phones: ['2074583115'],              // digits only, without the +1
};

const ROOT = path.join(__dirname, '..');
// scripts/ is this tooling, whose tests use dummy addresses on purpose
const SKIP_DIRS = new Set(['.git', 'node_modules', 'dist', 'vendor', 'hero-video', 'logo-intro', '.tmp', '.vercel', '.impeccable', 'For Hyperframes', 'scripts']);
const EXT = /\.(?:html?|css|js|cjs|mjs|xml|txt|json)$/i;

const EMAIL = /[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}/g;
const PHONE = new RegExp([
  /tel:\+?[\d().\s-]{7,}\d/.source,                              // tel: links
  /\+?1?[\s.-]?\(\d{3}\)\s?\d{3}[\s.-]\d{4}/.source,             // (207) 458-3115
  /(?<![\d.])\+?1?[\s.-]?\d{3}[.-]\d{3}[.-]\d{4}(?![\d.])/.source, // 207-458-3115, +1 207.458.3115
].join('|'), 'g');

function digits(phone) {
  let d = phone.replace(/\D/g, '');
  if (d.length === 11 && d[0] === '1') d = d.slice(1);
  return d;
}

function walk(dir, out) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) walk(path.join(dir, entry.name), out);
    } else if (EXT.test(entry.name) && entry.name !== 'package-lock.json') {
      out.push(path.join(dir, entry.name));
    }
  }
  return out;
}

const problems = [];
let scanned = 0;
for (const file of walk(ROOT, [])) {
  scanned++;
  const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
  const rel = path.relative(ROOT, file).split(path.sep).join('/');
  lines.forEach((line, i) => {
    for (const m of line.matchAll(EMAIL)) {
      if (!APPROVED.emails.includes(m[0].toLowerCase())) {
        problems.push(`${rel}:${i + 1}  email  ${m[0]}`);
      }
    }
    for (const m of line.matchAll(PHONE)) {
      if (!APPROVED.phones.includes(digits(m[0]))) {
        problems.push(`${rel}:${i + 1}  phone  ${m[0].trim()}`);
      }
    }
  });
}

if (problems.length) {
  console.error(`check-contact: ${problems.length} unapproved contact detail(s) in ${scanned} files\n`);
  problems.forEach(p => console.error('  ' + p));
  console.error(`\napproved: ${APPROVED.emails.join(', ')} / ${APPROVED.phones.join(', ')} (scripts/check-contact.js)`);
  process.exit(1);
}
console.log(`check-contact: ok (${scanned} files; only ${APPROVED.emails.join(', ')} and (207) 458-3115)`);
