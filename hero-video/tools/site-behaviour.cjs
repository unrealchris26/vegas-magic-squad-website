/* site-behaviour.cjs <url> - the hero film's runtime contract on the real page:
 * reduced motion removes it (poster stands), scrolling away pauses it,
 * coming back resumes it, and nothing logs an error. */
const { spawn } = require('child_process');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const URL_ = process.argv[2];
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function session(port, setup) {
  const cp = spawn(CHROME, ['--headless=new', '--hide-scrollbars', '--autoplay-policy=no-user-gesture-required',
    '--remote-debugging-port=' + port, 'about:blank'], { stdio: 'ignore' });
  let t = null;
  for (let i = 0; i < 60; i++) { try { t = await fetch(`http://127.0.0.1:${port}/json/list`).then(r => r.json()); break; } catch { await sleep(250); } }
  const ws = new WebSocket(t.find(x => x.type === 'page').webSocketDebuggerUrl);
  await new Promise(r => ws.addEventListener('open', r));
  let id = 0; const pend = new Map(); const errs = [];
  ws.addEventListener('message', ev => {
    const m = JSON.parse(ev.data);
    if (m.id && pend.has(m.id)) { pend.get(m.id)(m.result); pend.delete(m.id); return; }
    if (m.method === 'Runtime.exceptionThrown') errs.push((m.params.exceptionDetails.exception || {}).description || 'exception');
    if (m.method === 'Log.entryAdded' && m.params.entry.level === 'error' && !/_vercel/.test(m.params.entry.url || '')) errs.push(m.params.entry.text + ' ' + (m.params.entry.url || ''));
  });
  const send = (m, p = {}) => new Promise(res => { const i = ++id; pend.set(i, res); ws.send(JSON.stringify({ id: i, method: m, params: p })); });
  const js = async e => { const r = await send('Runtime.evaluate', { expression: e, returnByValue: true, awaitPromise: true }); return r && r.result && r.result.value; };
  await send('Page.enable'); await send('Runtime.enable'); await send('Log.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
  if (setup) await setup(send);
  await send('Page.navigate', { url: URL_ });
  await sleep(4000);
  return { js, errs, close: () => { ws.close(); cp.kill(); } };
}

(async () => {
  // 1. normal: plays, pauses off screen, resumes on return
  let s = await session(9811);
  const state = () => s.js(`(() => { const v = document.querySelector('.hero__vid');
    return v ? JSON.stringify({ present: true, paused: v.paused, t: +v.currentTime.toFixed(2), src: v.currentSrc.split('/').pop(), aria: v.getAttribute('aria-hidden'), tab: v.tabIndex }) : JSON.stringify({ present: false }); })()`);
  console.log('on load            ', await state());
  await s.js('window.scrollTo(0, document.body.scrollHeight / 2); 1'); await sleep(1200);
  console.log('scrolled away      ', await state());
  await s.js('window.scrollTo(0, 0); 1'); await sleep(1500);
  console.log('scrolled back      ', await state());
  console.log('console errors     ', s.errs.length ? s.errs.join(' | ') : 'none');
  s.close();

  // 2. reduced motion: no film, the poster picture is what shows
  s = await session(9812, send => send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] }));
  console.log('reduced motion     ', await s.js(`(() => { const v = document.querySelector('.hero__vid'); const img = document.querySelector('.hero__img');
    return JSON.stringify({ video: v ? 'STILL PRESENT' : 'removed', poster: img.currentSrc.split('/').pop(), posterLoaded: img.complete && img.naturalWidth > 0, posterVisible: getComputedStyle(img).visibility }); })()`));
  console.log('console errors     ', s.errs.length ? s.errs.join(' | ') : 'none');
  s.close();
  process.exit(0);
})();
