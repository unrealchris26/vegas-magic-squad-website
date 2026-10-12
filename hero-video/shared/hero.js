/* hero.js - the atmosphere over the hero loop, for either crop.
 *
 * The five shots are sub-compositions (compositions/shot-*.html), each with
 * its own camera move and entrance on its own timeline. What lives here is
 * everything that spans the whole loop: haze, the spotlight cone, gold dust
 * and the two gold light leaks. All of it runs on the 15s loop period, so the
 * last frame hands straight to the first.
 *
 * Generated projects load this unchanged; geometry arrives in cfg. All
 * randomness is seeded and every value is a pure function of timeline time,
 * so a frame renders identically on any seek.
 */
(function () {
  'use strict';

  var T = 15;            // replaced by cfg.period in HeroAtmosphere
  var E = 'sine.inOut';

  // mulberry32 - small, fast, seeded. Determinism rules forbid Math.random.
  function rng(seed) {
    var a = seed >>> 0;
    return function () {
      a = (a + 0x6d2b79f5) >>> 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* Gold dust. Each mote rises a whole number of loop-heights per loop and
   * sways a whole number of cycles, so the last frame meets the first. The
   * tween runs a 0 -> 15 proxy: the interpolated value IS the time, and the
   * modifiers turn it into position and opacity. */
  function dust(tl, cfg) {
    var box = document.getElementById('dust');
    var W = cfg.width, H = cfg.height, M = 60;
    var r = rng(cfg.seed);
    var span = H + 2 * M;
    var wrapY = gsap.utils.wrap(-M, H + M);
    for (var i = 0; i < cfg.dust.count; i++) {
      var bokeh = r() < cfg.dust.bokeh;
      var size = bokeh ? 10 + r() * 16 : 2 + r() * 3.2;
      var zone = cfg.dust.zones[Math.floor(r() * cfg.dust.zones.length)];
      var m = {
        x0: (zone[0] + r() * (zone[1] - zone[0])) * W,
        y0: -M + r() * span,
        loops: r() < 0.7 ? 1 : 2,
        amp: 6 + r() * 16, cyc: 1 + Math.floor(r() * 3), ph: r() * 6.2832,
        base: bokeh ? 0.14 + r() * 0.14 : 0.45 + r() * 0.45,
        tw: 1 + Math.floor(r() * 3), tph: r() * 6.2832
      };
      var el = document.createElement('i');
      el.className = bokeh ? 'mote bokeh' : 'mote';
      el.style.width = el.style.height = size.toFixed(1) + 'px';
      el.style.marginLeft = el.style.marginTop = (-size / 2).toFixed(1) + 'px';
      box.appendChild(el);
      tl.fromTo(el, { x: 0, y: 0, opacity: 0 }, {
        x: T, y: T, opacity: T, duration: T, ease: 'none',
        modifiers: {
          x: gsap.utils.unitize((function (m) {
            return function (t) { return m.x0 + m.amp * Math.sin((6.2832 * m.cyc * t) / T + m.ph); };
          })(m)),
          y: gsap.utils.unitize((function (m) {
            return function (t) { return wrapY(m.y0 - (m.loops * span * t) / T); };
          })(m)),
          opacity: (function (m) {
            return function (t) { return m.base * (0.62 + 0.38 * Math.sin((6.2832 * m.tw * t) / T + m.tph)); };
          })(m)
        }
      }, 0);
    }
  }

  /* Haze that loops at any speed. Two copies of one layer, half a period
   * apart: each drifts steadily and is fully faded out at the instant it
   * jumps back; their opacities sum to the peak, so density never pulses. */
  function haze(tl, sel, d, peak) {
    var a = sel + ' .h1', b = sel + ' .h2';
    tl.fromTo(a, { x: 0 }, { x: -d, duration: T, ease: 'none' }, 0);
    tl.fromTo(a, { opacity: 0 }, { opacity: peak, duration: T / 2, ease: E }, 0);
    tl.to(a, { opacity: 0, duration: T / 2, ease: E }, T / 2);

    tl.fromTo(b, { x: -d / 2 }, { x: -d, duration: T / 2, ease: 'none' }, 0);
    tl.fromTo(b, { x: 0 }, { x: -d / 2, duration: T / 2, ease: 'none', immediateRender: false }, T / 2);
    tl.fromTo(b, { opacity: peak }, { opacity: 0, duration: T / 2, ease: E }, 0);
    tl.to(b, { opacity: peak, duration: T / 2, ease: E }, T / 2);
  }

  // Gold leak (registry organic-light-leak-overlay construction, recoloured).
  function leak(tl, sel, at) {
    tl.fromTo(sel, { opacity: 0 }, { opacity: 0.8, duration: 0.6, ease: E }, at);
    tl.to(sel, { opacity: 0, duration: 0.95, ease: E }, at + 0.6);
    tl.fromTo(sel + ' .lk-a', { xPercent: -10, scale: 0.94 }, { xPercent: 12, scale: 1.06, duration: 1.5, ease: E }, at);
    tl.fromTo(sel + ' .lk-b', { xPercent: 12, yPercent: -6 }, { xPercent: -10, yPercent: 6, duration: 1.5, ease: E }, at);
  }

  window.HeroAtmosphere = function (cfg) {
    T = cfg.period || T;   // every loop-continuous layer runs on the loop length
    var tl = gsap.timeline({ paused: true });
    haze(tl, '#haze-cool', cfg.haze.cool, 0.45);
    haze(tl, '#haze-warm', -cfg.haze.warm, 0.28);
    tl.fromTo('#spot .cone', { rotation: 0 }, {
      keyframes: { rotation: [0, cfg.sway, 0, -cfg.sway, 0], easeEach: E },
      duration: T, ease: 'none'
    }, 0);
    (cfg.leaks || []).forEach(function (at, n) { leak(tl, '#leak' + (n + 1), at); });
    dust(tl, cfg);
    return tl;
  };
})();
