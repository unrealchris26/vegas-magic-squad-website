/* site-contrast.cjs <url> <width> <height> <outdir> [mobile]
 * Real-page readability: pause the hero film at points across the loop, hide
 * the headline block, screenshot what is behind it, and record where the
 * headline, lede and buttons actually sit. tools/site-contrast.py then
 * measures the site's real text colours over those exact pixels. */
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const [URL_, W, H, OUT, MOB = ''] = process.argv.slice(2);
const PORT = 9700 + (Number(W) % 89);
const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const cp = spawn(CHROME, ['--headless=new', '--hide-scrollbars', '--autoplay-policy=no-user-gesture-required',
    '--remote-debugging-port=' + PORT, 'about:blank'], { stdio: 'ignore' });
  let t = null;
  for (let i = 0; i < 60; i++) { try { t = await fetch(`http://127.0.0.1:${PORT}/json/list`).then(r => r.json()); break; } catch { await sleep(250); } }
  const ws = new WebSocket(t.find(x => x.type === 'page').webSocketDebuggerUrl);
  await new Promise(r => ws.addEventListener('open', r));
  let id = 0; const pend = new Map();
  ws.addEventListener('message', ev => { const m = JSON.parse(ev.data); if (m.id && pend.has(m.id)) { pend.get(m.id)(m.result); pend.delete(m.id); } });
  const send = (m, p = {}) => new Promise(res => { const i = ++id; pend.set(i, res); ws.send(JSON.stringify({ id: i, method: m, params: p })); });
  const js = async e => { const r = await send('Runtime.evaluate', { expression: e, returnByValue: true, awaitPromise: true });
    if (r && r.exceptionDetails) throw new Error(JSON.stringify(r.exceptionDetails).slice(0, 400)); return r && r.result && r.result.value; };
  const mobile = MOB === 'mobile';
  await send('Page.enable'); await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: +W, height: +H, deviceScaleFactor: 1, mobile });
  await send('Page.navigate', { url: URL_ });
  await sleep(4500);                                   // title animation + strike tiers settle
  const boxes = JSON.parse(await js(`(() => {
    const r = s => { const e = document.querySelector(s); if (!e) return null; const b = e.getBoundingClientRect();
      return [Math.round(b.left), Math.round(b.top), Math.round(b.right), Math.round(b.bottom)]; };
    return JSON.stringify({ name: r('.bill__name'), lede: r('.bill__lede'), acts: r('.bill__acts'),
      film: (document.querySelector('.hero__vid') || {}).currentSrc || 'none',
      ledeSize: parseFloat(getComputedStyle(document.querySelector('.bill__lede')).fontSize),
      ledeWeight: parseInt(getComputedStyle(document.querySelector('.bill__lede')).fontWeight, 10) });
  })()`));
  const times = [];
  for (let s = 0.5; s < 16; s += 1) times.push(+s.toFixed(1));   // the whole 16s loop
  for (const at of times) {
    await js(`(async () => {
      const v = document.querySelector('.hero__vid');
      // hide the TEXT only - anything drawn behind it (a contrast pool) stays measured
      if (!document.getElementById('__hidetext')) {
        const st = document.createElement('style'); st.id = '__hidetext';
        st.textContent = '.bill__name, .bill__name *, .bill__lede { color: transparent !important; -webkit-text-fill-color: transparent !important; text-shadow: none !important; }'
          + '.bill__acts, .reelgrid { visibility: hidden !important; }';
        document.head.appendChild(st);
      }
      if (!v) return;
      v.pause();
      await new Promise(res => { v.addEventListener('seeked', res, { once: true }); v.currentTime = ${at}; });
      await new Promise(res => requestAnimationFrame(() => requestAnimationFrame(res)));
    })()`);
    const shot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(OUT, `bg-${String(at).padStart(4, '0')}.png`), Buffer.from(shot.data, 'base64'));
  }
  fs.writeFileSync(path.join(OUT, 'boxes.json'), JSON.stringify(boxes, null, 1));
  console.log(`${W}x${H}${mobile ? ' mobile' : ''}: ${times.length} backgrounds, film=${boxes.film.split('/').pop()}`);
  ws.close(); cp.kill(); process.exit(0);
})();
