#!/usr/bin/env node
/* ==========================================================================
   npm run check-form -- [page-url]        (default http://127.0.0.1:8765/)
   ==========================================================================
   Drives the booking form in headless Chrome and checks it:
   1. renders,
   2. rejects an empty submit with errors on name, email and phone,
   3. reaches the success state ("request received") when filled in.
   window.fetch is stubbed BEFORE any page script runs, so no lead is ever
   sent to GoHighLevel; the check only confirms the request WOULD go there.

   Chrome's profile and temp files go in .tmp/ (gitignored) and are deleted
   afterwards. Set CHROME to the browser path if it is not the default.
   No dependencies (Node 22+ for the built-in WebSocket).
   ========================================================================== */
'use strict';

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const URL_ = process.argv[2] || 'http://127.0.0.1:8765/';
const CHROME = process.env.CHROME || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9555;
const TMP = path.join(__dirname, '..', '.tmp', 'check-form');
const sleep = ms => new Promise(r => setTimeout(r, ms));
setInterval(() => {}, 1000);                // Node's WebSocket does not hold the process open

(async () => {
  fs.mkdirSync(TMP, { recursive: true });
  const cp = spawn(CHROME, ['--headless=new', '--user-data-dir=' + path.join(TMP, 'profile'),
    '--disk-cache-dir=' + path.join(TMP, 'cache'), '--disable-gpu-shader-disk-cache', '--disable-breakpad',
    '--remote-debugging-port=' + PORT, 'about:blank'],
    { stdio: 'ignore', env: Object.assign({}, process.env, { TEMP: TMP, TMP: TMP }) });
  const finish = async code => {
    try { cp.kill(); await new Promise(r => cp.once('exit', r)); } catch {}
    fs.rmSync(TMP, { recursive: true, force: true, maxRetries: 10, retryDelay: 300 });
    process.exit(code);
  };
  setTimeout(() => { console.error('check-form: timed out'); finish(2); }, 90000);

  let t = null;
  for (let i = 0; i < 60 && !t; i++) { try { t = await fetch(`http://127.0.0.1:${PORT}/json/list`).then(r => r.json()); } catch { await sleep(250); } }
  if (!t) { console.error('check-form: Chrome did not start'); return finish(2); }
  const ws = new WebSocket(t.find(x => x.type === 'page').webSocketDebuggerUrl);
  await new Promise(r => ws.addEventListener('open', r));
  let id = 0; const pend = new Map(); const errs = [];
  ws.addEventListener('message', ev => {
    const m = JSON.parse(ev.data);
    if (m.id && pend.has(m.id)) { pend.get(m.id)(m.result); pend.delete(m.id); return; }
    if (m.method === 'Runtime.exceptionThrown') errs.push((m.params.exceptionDetails.exception || {}).description || 'exception');
  });
  const send = (m, p = {}) => new Promise(res => { const i = ++id; pend.set(i, res); ws.send(JSON.stringify({ id: i, method: m, params: p })); });
  const js = async e => { const r = await send('Runtime.evaluate', { expression: e, returnByValue: true, awaitPromise: true }); return r && r.result && r.result.value; };

  await send('Page.enable'); await send('Runtime.enable');
  await send('Page.addScriptToEvaluateOnNewDocument', { source: `
    window.__sent = [];
    window.fetch = function (url) { window.__sent.push(String(url)); return Promise.resolve(new Response('{}', { status: 200 })); };` });
  await send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });
  await send('Page.navigate', { url: URL_ });
  await sleep(2500);

  const r = {};
  r.renders = await js(`(() => { const f = document.getElementById('bookform'); if (!f) return '';
    const b = f.getBoundingClientRect(); return f.querySelectorAll('input,select,textarea').length + ' controls, ' + Math.round(b.width) + 'x' + Math.round(b.height); })()`);
  r.validates = await js(`(() => { document.getElementById('submit').click();
    return [...document.querySelectorAll('#bookform [aria-invalid="true"]')].map(e => e.id).join(', '); })()`);
  r.success = await js(`(async () => {
    const set = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); };
    set('f-name', 'Test Person'); set('f-email', 'test@example.com'); set('f-phone', '7025550100');
    document.getElementById('submit').click();
    await new Promise(r => setTimeout(r, 1500));
    const d = document.getElementById('calldone');
    return d && !d.hidden ? 'request-received panel shown' : '';
  })()`);
  r.wouldSendTo = await js(`window.__sent.map(u => new URL(u).host).join(', ')`);

  const ok = r.renders && r.validates === 'f-name, f-email, f-phone' && r.success && /leadconnectorhq/.test(r.wouldSendTo) && !errs.length;
  console.log(`renders      ${r.renders || 'NO FORM'}`);
  console.log(`validates    ${r.validates || 'no errors on empty submit'}`);
  console.log(`success      ${r.success || 'success state NOT shown'}`);
  console.log(`would send   ${r.wouldSendTo || 'nothing'} (stubbed - nothing sent)`);
  console.log(`page errors  ${errs.length ? errs.join(' | ') : 'none'}`);
  console.log(ok ? 'check-form: ok' : 'check-form: FAILED');
  ws.close();
  finish(ok ? 0 : 1);
})();
