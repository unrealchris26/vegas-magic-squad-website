/* site-shot.js <url> <width> <height> <out.png> [waitMs] [mobile]
 * Screenshot of the site's first viewport (the hero) in headless Chrome.
 * Used for the before/after hero comparison. */
const { spawn } = require('child_process');
const fs = require('fs');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const [URL_, W, H, OUT, WAIT = '4000', MOB = '', SEEK = ''] = process.argv.slice(2);
const PORT = 9600 + (Number(W) % 97);
const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  const cp = spawn(CHROME, ['--headless=new', '--hide-scrollbars', '--autoplay-policy=no-user-gesture-required',
    '--remote-debugging-port=' + PORT, 'about:blank'], { stdio: 'ignore' });
  let t = null;
  for (let i = 0; i < 60; i++) { try { t = await fetch(`http://127.0.0.1:${PORT}/json/list`).then(r => r.json()); break; } catch { await sleep(250); } }
  const ws = new WebSocket(t.find(x => x.type === 'page').webSocketDebuggerUrl);
  await new Promise(r => ws.addEventListener('open', r));
  let id = 0; const pend = new Map();
  ws.addEventListener('message', ev => { const m = JSON.parse(ev.data); if (m.id && pend.has(m.id)) { pend.get(m.id)(m.result); pend.delete(m.id); } });
  const send = (m, p = {}) => new Promise(res => { const i = ++id; pend.set(i, res); ws.send(JSON.stringify({ id: i, method: m, params: p })); });
  const js = async e => { const r = await send('Runtime.evaluate', { expression: e, returnByValue: true, awaitPromise: true }); return r && r.result && r.result.value; };
  const mobile = MOB === 'mobile';
  await send('Page.enable'); await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: +W, height: +H, deviceScaleFactor: mobile ? 2 : 1, mobile });
  await send('Page.navigate', { url: URL_ });
  await sleep(+WAIT);
  if (SEEK !== '') {
    await js(`(async () => { const v = document.querySelector('video.hero__vid'); if (!v) return;
      v.pause(); await new Promise(r => { v.addEventListener('seeked', r, { once: true }); v.currentTime = ${SEEK}; });
      await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))); })()`);
  }
  const info = await js(`(() => { const v = document.querySelector('video.hero__vid, video.hero-bg');
    return JSON.stringify(v ? { src: v.currentSrc.split('/').pop(), paused: v.paused, t: +v.currentTime.toFixed(2), poster: v.poster.split('/').pop() } : { video: 'none' }); })()`);
  const shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(OUT, Buffer.from(shot.data, 'base64'));
  console.log(`${W}x${H}${mobile ? ' mobile' : ''} -> ${OUT}  ${info}`);
  ws.close(); cp.kill(); process.exit(0);
})();
