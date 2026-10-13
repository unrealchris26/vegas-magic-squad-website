#!/usr/bin/env node
/* ==========================================================================
   npm run check-links -- [base-url]      (default http://127.0.0.1:8765)
   ==========================================================================
   Crawls the served site from "/" and reports:
   - internal pages or assets that do not return 200,
   - #fragment links whose target id does not exist on the target page.
   Serve the build first:  node build.js && node serve.js dist
   /_vercel/* is skipped: Vercel serves it at the edge, so it 404s locally.
   No dependencies (Node 18+ for fetch).
   ========================================================================== */
'use strict';

const base = (process.argv[2] || 'http://127.0.0.1:8765').replace(/\/$/, '');
const pages = new Map();                 // path -> html
const checked = new Map();               // path -> status
const problems = [];
const queue = ['/'];

const isPage = p => !/\.[a-z0-9]{2,5}$/i.test(p);

async function status(p) {
  if (checked.has(p)) return checked.get(p);
  let code;
  try { code = (await fetch(base + p, { redirect: 'manual' })).status; } catch { code = 'ERR'; }
  checked.set(p, code);
  return code;
}

(async () => {
  while (queue.length) {
    const p = queue.shift();
    if (pages.has(p) || checked.has(p)) continue;
    const res = await fetch(base + p, { redirect: 'manual' }).catch(() => null);
    checked.set(p, res ? res.status : 'ERR');
    if (!res || res.status !== 200) { problems.push(`${res ? res.status : 'ERR'}  ${p}`); continue; }
    const html = await res.text();
    pages.set(p, html);
    for (const [, attr, ref] of html.matchAll(/\b(href|src|poster)="([^"]+)"/g)) {
      if (/^[a-z][a-z0-9+.-]*:/i.test(ref) || ref.startsWith('//')) continue;
      const u = new URL(ref, base + p);
      const target = u.pathname;
      if (target.startsWith('/_vercel/')) continue;
      if (attr === 'href' && isPage(target)) { if (!pages.has(target)) queue.push(target); }
      else {
        const code = await status(target);
        if (code !== 200) problems.push(`${code}  ${target}  (from ${p})`);
      }
    }
  }
  for (const [p, html] of pages) {
    for (const [, ref] of html.matchAll(/href="([^"]*#[^"]+)"/g)) {
      if (/^[a-z][a-z0-9+.-]*:/i.test(ref)) continue;
      const u = new URL(ref, base + p);
      const frag = decodeURIComponent(u.hash.slice(1));
      if (!frag || frag === 'top') continue;
      const target = pages.get(u.pathname);
      if (target === undefined) { problems.push(`no page ${u.pathname} for #${frag} (from ${p})`); continue; }
      if (!new RegExp(`\\bid="${frag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`).test(target)) {
        problems.push(`missing #${frag} on ${u.pathname} (from ${p})`);
      }
    }
  }
  console.log(`pages: ${[...pages.keys()].sort().join(', ')}`);
  console.log(`checked ${checked.size} URLs`);
  if (problems.length) {
    console.error(`\n${problems.length} problem(s):`);
    [...new Set(problems)].sort().forEach(x => console.error('  ' + x));
    process.exit(1);
  }
  console.log('no broken links or anchors');
})();
