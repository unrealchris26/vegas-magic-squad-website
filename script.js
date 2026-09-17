/* ==========================================================================
   Vegas Magic Squad
   ========================================================================== */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ------------------------------------------------------------------ *
   * 1. The bulb chase.
   *    Bulbs are real elements so the light actually travels the rail,
   *    the way a marquee chase does, instead of a gradient sliding under
   *    a mask.
   *
   *    This used to drive two things: the hero's four-sided bulb frame and
   *    the footer strip. The hero frame has been removed, so only the strip
   *    is left — the clockwise ring-ordering that walked one pulse around
   *    the hero border went with it.
   * ------------------------------------------------------------------ */
  var CYCLE = 2.6;         // seconds, matches the `chase` keyframes
  var SPACING = 30;        // preferred px between bulb centres

  // The count is derived from the real bulb and gap sizes so a run always fits
  // its rail. A hardcoded spacing overruns the rail as soon as the bulb grows.
  function fill(el, px) {
    var cs = getComputedStyle(el);
    var gap = parseFloat(cs.columnGap || cs.gap) || 12;
    var probe = el.firstElementChild;
    var size = probe ? probe.getBoundingClientRect().width : 0;
    if (!size) size = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--bulb-size')) || 9;

    var maxFit = Math.floor((px + gap) / (size + gap));
    var n = Math.max(3, Math.min(Math.round(px / SPACING), maxFit));
    if (el.childElementCount === n) return;
    el.textContent = '';
    var frag = document.createDocumentFragment();
    for (var i = 0; i < n; i++) {
      var b = document.createElement('span');
      b.className = 'bulb';
      frag.appendChild(b);
    }
    el.appendChild(frag);
  }

  function lay() {
    document.querySelectorAll('.bulbs').forEach(function (el) {
      var r = el.getBoundingClientRect();
      var edge = el.getAttribute('data-edge');
      // Kept general rather than hardcoded to the strip: a vertical rail is
      // measured on its height, and one may well come back.
      var vertical = edge === 'left' || edge === 'right' || edge === 'diag';
      fill(el, vertical ? r.height : r.width);
    });

    // Stagger each bulb so one pulse travels the rail instead of the whole
    // run blinking at once.
    document.querySelectorAll('.bulbs--strip').forEach(function (host) {
      var kids = host.children;
      for (var i = 0; i < kids.length; i++) {
        kids[i].style.setProperty('--d', (i / kids.length * CYCLE).toFixed(3) + 's');
      }
    });
  }

  lay();
  var relayTimer;
  window.addEventListener('resize', function () {
    clearTimeout(relayTimer);
    relayTimer = setTimeout(lay, 180);
  });

  /* ------------------------------------------------------------------ *
   * 2. Section rules ignite with the same filament grammar.
   * ------------------------------------------------------------------ */
  var ignitable = document.querySelectorAll('.clients__panel');
  if ('IntersectionObserver' in window && !reduced.matches) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('ignite', 'is-lit');
        io.unobserve(e.target);
      });
    }, { threshold: 0.35, rootMargin: '0px 0px -8% 0px' });
    ignitable.forEach(function (el) { el.classList.add('ignite'); io.observe(el); });
  } else {
    ignitable.forEach(function (el) { el.classList.add('ignite', 'is-lit'); });
  }

  /* ------------------------------------------------------------------ *
   * 3. Nav
   * ------------------------------------------------------------------ */
  /* Guarded because this file is shared with squad.html, which has no burger.
     Without the guard the whole IIFE throws here and every module below it —
     the rails, the form, the year — silently never runs. */
  var toggle = document.getElementById('navtoggle');
  var links = document.getElementById('navlinks');

  if (toggle && links) {
    (function nav() {
      function closeNav() {
        links.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'Open menu');
      }

      toggle.addEventListener('click', function () {
        var open = links.classList.toggle('is-open');
        toggle.setAttribute('aria-expanded', String(open));
        toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      });
      links.addEventListener('click', function (e) {
        if (e.target.tagName === 'A') closeNav();
      });
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && links.classList.contains('is-open')) {
          closeNav();
          toggle.focus();
        }
      });
    })();
  }

  /* ------------------------------------------------------------------ *
   * 3b. Hero title: the letters fly in from scattered, once, on load.
   *     Real spans in the real webfont, so the type stays crisp and
   *     selectable rather than being converted to paths.
   * ------------------------------------------------------------------ */
  (function shatterTitle() {
    var title = document.getElementById('hero-name');
    if (!title || typeof window.gsap === 'undefined') return;

    var text = title.textContent.replace(/\s+/g, ' ').trim();
    // The animated letters are decorative duplicates of this string, so the
    // heading keeps one clean accessible name instead of being read out
    // character by character.
    title.setAttribute('aria-label', text);

    // An endless shatter is exactly the motion this setting exists to stop.
    if (reduced.matches) return;

    var frag = document.createDocumentFragment();
    var words = text.split(' ');
    words.forEach(function (word, wi) {
      var w = document.createElement('span');
      w.className = 'word';
      word.split('').forEach(function (ch) {
        var sp = document.createElement('span');
        sp.className = 'ltr';
        sp.textContent = ch;
        w.appendChild(sp);
      });
      frag.appendChild(w);
      // A real space between word spans, so the line can still break on
      // narrow screens. A non-breaking space would force one unwrappable
      // line and overflow the hero on a phone.
      if (wi < words.length - 1) frag.appendChild(document.createTextNode(' '));
    });

    var shell = document.createElement('span');
    shell.setAttribute('aria-hidden', 'true');
    shell.appendChild(frag);
    title.textContent = '';
    title.appendChild(shell);

    var letters = title.querySelectorAll('.ltr');
    if (!letters.length) return;
    function rand(min, max) { return Math.random() * (max - min) + min; }

    gsap.set(letters, {
      x: function () { return rand(-500, 500); },
      y: function () { return rand(-500, 500); },
      rotation: function () { return rand(-720, 720); },
      scale: 0,
      opacity: 0
    });

    // A one-time entrance: the letters fly in and stay put.
    gsap.timeline({
      onComplete: function () {
        // Hand the letters back to normal document flow once they land, so
        // fifteen composited layers are not left alive for the page's life.
        gsap.set(letters, { clearProps: 'transform,opacity,willChange' });
      }
    }).to(letters, {
      x: 0, y: 0, rotation: 0, scale: 1, opacity: 1,
      duration: 0.75,
      ease: 'power4.inOut',
      stagger: 0.0125
    });
  })();

  /* ------------------------------------------------------------------ *
   * 4. Showreel rail : swipeable on phones, drifting left on its own.
   *
   *    The swipe is the browser's — the rail is a native overflow-x
   *    container (styles.css, @media max-width:720px), so momentum, the
   *    rubber-band at the ends and the snap all come for free and behave
   *    the way every other scroller on the device behaves.
   *
   *    The autoplay is layered on top by tweening scrollLeft rather than
   *    translating a track. That is the whole trick: a transform would move
   *    the cards away from their own hit areas, and a finger landing mid
   *    animation would be fighting it. Writing scroll position instead means
   *    the finger always wins — it simply takes the scroller over.
   *
   *    The loop is seamless because the three cards are cloned once. When a
   *    glide lands on the first clone the rail jumps back by exactly one set
   *    width, which is the identical pixel picture, so the leftward travel
   *    never visibly rewinds.
   * ------------------------------------------------------------------ */
  (function showreelRail() {
    var rail = document.querySelector('.reelgrid');
    if (!rail) return;

    var phone = window.matchMedia('(max-width: 720px)');
    var DWELL = 2600;   // ms a card holds still before the next glide
    var GLIDE = 780;    // ms of travel
    var QUIET = 3600;   // ms of no touching before autoplay picks up again

    var originals = Array.prototype.slice.call(rail.children);
    if (originals.length < 2) return;

    var clones = [];
    var cards = originals;
    var index = 0;
    var dwellTimer = null, quietTimer = null, frame = null;
    var gliding = false, running = false, onScreen = true;

    function easeInOutCubic(t) {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    // Distance from a card to its own clone: one whole set, gaps included.
    // Measured rather than computed, so changing the gap in CSS needs no edit here.
    function stride() {
      return clones.length ? clones[0].offsetLeft - originals[0].offsetLeft : 0;
    }

    // Exact, and free of any assumption about which ancestor is positioned.
    function offsetOf(card) {
      return rail.scrollLeft +
        (card.getBoundingClientRect().left - rail.getBoundingClientRect().left);
    }

    // Snap has to come off for an instant scrollLeft write too: with mandatory
    // snap live, the assignment is re-resolved and the seam becomes visible.
    function jumpTo(px) {
      rail.classList.add('is-gliding');
      rail.scrollLeft = px;
      void rail.offsetWidth;            // commit before snapping returns
      rail.classList.remove('is-gliding');
    }

    function build() {
      if (clones.length) return;
      var frag = document.createDocumentFragment();
      originals.forEach(function (card) {
        var copy = card.cloneNode(true);
        // Without this a screen reader announces every card twice and each
        // duplicate link lands in the tab order.
        copy.setAttribute('aria-hidden', 'true');
        copy.setAttribute('tabindex', '-1');
        copy.removeAttribute('aria-label');
        copy.setAttribute('data-clone', '');
        clones.push(copy);
        frag.appendChild(copy);
      });
      rail.appendChild(frag);
      cards = originals.concat(clones);
    }

    function teardown() {
      stop();
      clones.forEach(function (c) { c.remove(); });
      clones = [];
      cards = originals;
      index = 0;
      rail.scrollLeft = 0;
    }

    // Re-read where the rail actually sits, since a swipe can leave it
    // anywhere, and normalise back out of the clone half if it ended up there.
    function sync() {
      var best = 0, bestGap = Infinity;
      cards.forEach(function (card, i) {
        var gap = Math.abs(offsetOf(card) - rail.scrollLeft);
        if (gap < bestGap) { bestGap = gap; best = i; }
      });
      index = best;
      var set = stride();
      while (index >= originals.length && set > 0) {
        index -= originals.length;
        jumpTo(rail.scrollLeft - set);
      }
    }

    function glide() {
      if (!running || gliding || !onScreen) return;

      var next = cards[index + 1];
      if (!next) { sync(); schedule(); return; }

      var from = rail.scrollLeft;
      var to = offsetOf(next);
      var max = rail.scrollWidth - rail.clientWidth;
      if (to > max) to = max;
      var span = to - from;
      if (span <= 1) { sync(); schedule(); return; }

      var t0 = performance.now();
      gliding = true;
      rail.classList.add('is-gliding');

      (function step(now) {
        var t = Math.min((now - t0) / GLIDE, 1);
        rail.scrollLeft = from + span * easeInOutCubic(t);
        if (t < 1) { frame = requestAnimationFrame(step); return; }

        frame = null;
        index += 1;
        // Landed on the clone set, so rewind by one set width. Identical
        // pixels, which is what keeps the leftward drift continuous.
        var set = stride();
        if (index >= originals.length && set > 0) {
          index -= originals.length;
          rail.scrollLeft = rail.scrollLeft - set;
        }
        void rail.offsetWidth;
        rail.classList.remove('is-gliding');
        gliding = false;
        schedule();
      })(t0);
    }

    function schedule() {
      clearTimeout(dwellTimer);
      if (!running) return;
      dwellTimer = setTimeout(glide, DWELL);
    }

    function start() {
      if (running || reduced.matches || !phone.matches) return;
      build();
      running = true;
      sync();
      schedule();
    }

    function stop() {
      running = false;
      clearTimeout(dwellTimer);
      clearTimeout(quietTimer);
      if (frame) { cancelAnimationFrame(frame); frame = null; }
      if (gliding) {
        gliding = false;
        rail.classList.remove('is-gliding');
      }
    }

    // A hand on the rail outranks the autoplay every time. It only picks up
    // again once the rail has been left alone long enough to be sure.
    function handOver() {
      stop();
      clearTimeout(quietTimer);
      quietTimer = setTimeout(function () {
        if (!phone.matches || reduced.matches) return;
        running = true;
        sync();
        schedule();
      }, QUIET);
    }

    ['pointerdown', 'touchstart', 'wheel', 'focusin'].forEach(function (evt) {
      rail.addEventListener(evt, handOver, { passive: true });
    });
    rail.addEventListener('scroll', function () {
      if (gliding) return;              // our own frames, not a finger
      handOver();
    }, { passive: true });

    // Nothing animates off-screen or in a backgrounded tab.
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        onScreen = entries[0].isIntersecting;
        if (onScreen) { if (running) schedule(); }
        else clearTimeout(dwellTimer);
      }, { threshold: 0.3 }).observe(rail);
    }
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) clearTimeout(dwellTimer);
      else if (running) schedule();
    });

    function evaluate() {
      if (phone.matches && !reduced.matches) start();
      else teardown();
    }

    // addEventListener is the modern spelling of a matchMedia listener,
    // addListener the one older Safari still needs.
    function watch(mq, fn) {
      if (mq.addEventListener) mq.addEventListener('change', fn);
      else if (mq.addListener) mq.addListener(fn);
    }
    watch(phone, evaluate);
    watch(reduced, evaluate);

    var reelResize;
    window.addEventListener('resize', function () {
      clearTimeout(reelResize);
      reelResize = setTimeout(function () { if (running) sync(); }, 200);
    });

    evaluate();
  })();

  /* ------------------------------------------------------------------ *
   * 4b. Drift rails : they scroll left on their own, and you can drag them.
   *
   *     Two of these now — the testimonials, and the line-up once it drops to
   *     phone width — so the engine is a factory rather than a copy.
   *
   *     It was a CSS transform marquee until the rail had to become
   *     draggable. A translated track cannot be swiped: the cards are no
   *     longer where the browser thinks they are, and there is no scroll
   *     position for a finger to take hold of. So the drift moves scrollLeft
   *     instead, and the rail is a real scroll container underneath.
   *
   *     What that buys: touch swipe, trackpad, shift-wheel and keyboard
   *     arrows all work without a line of code, with the platform's own
   *     momentum and rubber-band. The only hand-written gesture is mouse
   *     drag, because that is the one a scroll container does not give you.
   *
   *     Three copies of the set, parked in the middle one. Two would loop
   *     leftward fine, but dragging RIGHT from the start would hit scrollLeft
   *     0 and stop dead before there was any chance to wrap. With a full set
   *     either side, the wrap always happens with content already rendered on
   *     both sides of it.
   * ------------------------------------------------------------------ */
  function driftRail(cfg) {
    var rail = document.querySelector(cfg.rail);
    var track = rail && rail.querySelector(cfg.track);
    if (!track) return null;

    var originals = Array.prototype.slice.call(track.children);
    if (originals.length < 2) return null;

    var SPEED = cfg.speed || 32;   // px per second
    var HOLD = 2800;               // ms of stillness after a drag or swipe
    var COPIES = 3;                // sets in the track; index 1 is home

    var active = false, built = false, dragging = false, hovering = false;
    var holding = false, onScreen = true, holdTimer = null;
    var startX = 0, startScroll = 0, last = 0, frame = null, moved = false;
    var pos = 0;                   // the drift position we own, in float px
    var setW = 0;                  // cached width of one set

    function build() {
      if (built) return;
      for (var c = 1; c < COPIES; c++) {
        originals.forEach(function (card) {
          var copy = card.cloneNode(true);
          // The same cards over again. Announced once.
          copy.setAttribute('aria-hidden', 'true');
          copy.setAttribute('data-clone', '');
          track.appendChild(copy);
        });
      }
      built = true;
    }

    function strip() {
      track.querySelectorAll('[data-clone]').forEach(function (c) { c.remove(); });
      built = false;
      setW = 0;
    }

    // One set, gaps included. Measured off the DOM so a gap change in CSS needs
    // no matching edit here — but measured ONCE and cached, because offsetLeft
    // forces a layout flush, and doing that every frame next to a scroll write
    // is textbook layout thrashing. That was what made the drift stutter.
    function measure() {
      setW = built
        ? track.children[originals.length].offsetLeft - track.children[0].offsetLeft
        : 0;
    }

    // Keep the position inside the middle set, in both directions, because the
    // rail can be dragged backwards as far as anyone likes.
    function wrapped(x) {
      if (setW <= 0) return x;
      if (x >= setW * 2) return x - setW;
      if (x < setW) return x + setW;
      return x;
    }

    function idle() {
      return active && !dragging && !hovering && !holding && onScreen &&
             !document.hidden && !reduced.matches;
    }

    function tick(now) {
      var dt = now - last;
      last = now;
      // A backgrounded tab returns one enormous dt; capping it stops the rail
      // teleporting on the first frame back.
      if (dt > 80) dt = 80;

      if (idle()) {
        /* The position is accumulated here as a float and then assigned, never
           read back out of scrollLeft and added to. At this speed a frame is
           well under a pixel, and browsers round the value they hand back from
           scrollLeft — so `scrollLeft += 0.4` reads 0, writes 0.4, reads 0
           again, and the rail never moves at all. Owning the number is what
           makes a sub-pixel-per-frame drift possible. */
        pos = wrapped(pos + SPEED * dt / 1000);
        rail.scrollLeft = pos;
      } else if (active) {
        /* Someone else is driving — a drag, a swipe still carrying momentum,
           a wheel, an arrow key. Follow their position rather than write one,
           because assigning scrollLeft mid-momentum cancels the momentum.
           The one exception is the seam, where the wrap has to happen. */
        pos = rail.scrollLeft;
        var w = wrapped(pos);
        if (w !== pos) { pos = w; rail.scrollLeft = w; }
      }

      frame = requestAnimationFrame(tick);
    }

    // Any interaction stops the drift, then it eases back in after a pause.
    function hold() {
      if (!active) return;
      holding = true;
      clearTimeout(holdTimer);
      holdTimer = setTimeout(function () { holding = false; }, HOLD);
    }

    /* --- mouse drag ---------------------------------------------------- *
     * Touch and pen are left strictly alone: the browser already scrolls
     * them, with momentum this code could only approximate badly. Taking
     * those over with pointermove would make the rail worse, not better. */
    rail.addEventListener('pointerdown', function (e) {
      if (!active) return;
      hold();
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      dragging = true;
      moved = false;
      startX = e.clientX;
      startScroll = rail.scrollLeft;
      rail.classList.add('is-dragging');
      if (rail.setPointerCapture) rail.setPointerCapture(e.pointerId);
    });

    rail.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      e.preventDefault();
      if (Math.abs(e.clientX - startX) > 4) moved = true;
      rail.scrollLeft = startScroll - (e.clientX - startX);
    });

    function endDrag(e) {
      if (!dragging) return;
      dragging = false;
      rail.classList.remove('is-dragging');
      if (rail.releasePointerCapture && e.pointerId != null) {
        try { rail.releasePointerCapture(e.pointerId); } catch (err) {}
      }
      hold();
    }
    rail.addEventListener('pointerup', endDrag);
    rail.addEventListener('pointercancel', endDrag);

    // A drag that ends on a card must not also register as a click on it.
    // Keyed off actual movement during THIS drag — comparing scroll positions
    // instead would misfire after a touch swipe, which never sets startScroll.
    rail.addEventListener('click', function (e) {
      if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; }
    }, true);

    /* --- everything else that should stop it ---------------------------- */
    rail.addEventListener('mouseenter', function () { hovering = true; });
    rail.addEventListener('mouseleave', function () { hovering = false; });
    rail.addEventListener('focusin', function () { hovering = true; });
    rail.addEventListener('focusout', function () { hovering = false; });
    rail.addEventListener('wheel', hold, { passive: true });
    rail.addEventListener('touchstart', hold, { passive: true });
    rail.addEventListener('keydown', hold);

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        onScreen = entries[0].isIntersecting;
      }, { threshold: 0 }).observe(rail);
    }

    function enable() {
      if (active) return;
      active = true;
      build();
      rail.classList.add('is-live');
      // A scroll region has to be reachable by keyboard. Set here rather than
      // in the HTML so a rail that is only live on phones does not leave a
      // dead tab stop on desktop.
      rail.setAttribute('tabindex', '0');
      measure();
      // Park in the middle set so there is a full set to drag into either way.
      pos = setW;
      rail.scrollLeft = pos;
      if (frame) cancelAnimationFrame(frame);
      last = performance.now();
      frame = requestAnimationFrame(tick);
    }

    function disable() {
      if (!active) return;
      active = false;
      if (frame) { cancelAnimationFrame(frame); frame = null; }
      clearTimeout(holdTimer);
      holding = dragging = false;
      rail.classList.remove('is-live', 'is-dragging');
      rail.removeAttribute('tabindex');
      strip();
      rail.scrollLeft = 0;
    }

    function remeasure() {
      if (!active) return;
      measure();
      pos = wrapped(rail.scrollLeft);
      rail.scrollLeft = pos;
    }

    return { enable: enable, disable: disable, remeasure: remeasure };
  }

  // addEventListener is the modern spelling of a matchMedia listener,
  // addListener the one older Safari still needs.
  function watchMedia(mq, fn) {
    if (mq.addEventListener) mq.addEventListener('change', fn);
    else if (mq.addListener) mq.addListener(fn);
  }

  var rails = [];

  // Testimonials: always a rail, at every width.
  var quotes = driftRail({ rail: '.quotes__rail', track: '.quotes__track', speed: 32 });
  if (quotes) { quotes.enable(); rails.push(quotes); }

  /* The line-up: a three-up grid on desktop, a rail on phones. Three portraits
     abreast on a 390px screen is about 110px each, which is too small to read
     a face in — so below 720px it becomes one large portrait at a time. A
     touch slower than the testimonials: there are only three cards and they
     are mostly picture, so the same speed reads as restless. */
  var lineup = driftRail({ rail: '.lineup__rail', track: '.lineup', speed: 24 });
  if (lineup) {
    rails.push(lineup);
    var phoneRail = window.matchMedia('(max-width: 720px)');
    var syncLineup = function () {
      if (phoneRail.matches) lineup.enable();
      else lineup.disable();
    };
    watchMedia(phoneRail, syncLineup);
    syncLineup();
  }

  // No reduced-motion listener is needed: idle() reads reduced.matches on every
  // frame, so toggling the setting takes effect on the next one. The loop keeps
  // running either way — dragging and swiping still work, which is the point.
  // The setting turns off motion nobody asked for, not the rail.

  var railResize;
  window.addEventListener('resize', function () {
    clearTimeout(railResize);
    // Card widths are vw-based, so the loop distance changes with the viewport
    // and the cached set width has to be re-derived or the seam drifts.
    railResize = setTimeout(function () {
      rails.forEach(function (r) { r.remeasure(); });
    }, 200);
  });

  /* ------------------------------------------------------------------ *
   * 5. Booking CTAs hand focus to the form.
   *
   *    Fifteen buttons on this page point at #booking. A bare hash jump
   *    scrolls the page but leaves focus on the button the visitor just
   *    left, so anyone driving by keyboard arrives looking at the form and
   *    still has to tab through every link above it to reach the first
   *    field — the jump was visual only.
   *
   *    The scroll itself is left alone: no preventDefault, so it stays the
   *    browser's own smooth scroll, the hash still updates and the back
   *    button still walks back out. Only focus is moved, and only once the
   *    travel has settled.
   * ------------------------------------------------------------------ */
  (function bookingFocus() {
    var first = document.getElementById('f-name');
    if (!first) return;

    // preventScroll is the whole reason this is safe to do mid-flight:
    // without it, focus() yanks the page into position itself and fights
    // the smooth scroll that is still running.
    function land() {
      try { first.focus({ preventScroll: true }); }
      catch (e) { first.focus(); }
    }

    function afterTravel(fn) {
      // Reduced motion turns the smooth scroll off (html{scroll-behavior:auto}),
      // so the page is already there and waiting would only add lag.
      if (reduced.matches) { fn(); return; }
      if (!('onscrollend' in window)) { setTimeout(fn, 620); return; }

      var done = false;
      function settle() {
        if (done) return;
        done = true;
        window.removeEventListener('scrollend', settle);
        clearTimeout(bail);
        fn();
      }
      // scrollend never fires when the page was already in position, so the
      // timeout is the real path for a CTA clicked from inside #booking.
      var bail = setTimeout(settle, 900);
      window.addEventListener('scrollend', settle);
    }

    document.addEventListener('click', function (e) {
      // A modified or middle click is a new tab, not a trip down this page.
      if (e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (!e.target || !e.target.closest) return;
      if (!e.target.closest('a[href="#booking"]')) return;
      afterTravel(land);
    });
  })();

  /* ------------------------------------------------------------------ *
   * 6. Booking form
   * ------------------------------------------------------------------ */
  var form = document.getElementById('bookform');
  var status = document.getElementById('formstatus');
  var submit = document.getElementById('submit');
  var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  if (form && status && submit) {

  function setError(el, msg) {
    var slot = document.querySelector('[data-err="' + el.id + '"]');
    if (slot) slot.textContent = msg;
    el.setAttribute('aria-invalid', 'true');
  }
  function clearError(el) {
    var slot = document.querySelector('[data-err="' + el.id + '"]');
    if (slot) slot.textContent = '';
    el.removeAttribute('aria-invalid');
  }

  function checkField(el) {
    var v = (el.value || '').trim();

    if (el.hasAttribute('required') && !v) {
      setError(el, el.id === 'f-type' ? 'Choose corporate or private.' : 'This one is needed.');
      return false;
    }
    if (el.id === 'f-email' && v && !EMAIL.test(v)) {
      setError(el, 'That email address looks incomplete.');
      return false;
    }
    if (el.id === 'f-date' && v) {
      var today = new Date(); today.setHours(0, 0, 0, 0);
      var picked = new Date(v + 'T00:00:00');
      if (isNaN(picked.getTime())) { setError(el, 'Pick a date from the calendar.'); return false; }
      if (picked < today) { setError(el, 'That date has already passed. Pick a later one.'); return false; }
    }
    if (el.id === 'f-guests' && v) {
      var n = Number(v);
      if (!isFinite(n) || n < 1 || Math.floor(n) !== n) {
        setError(el, 'Use a whole number of guests.');
        return false;
      }
    }
    if (el.id === 'f-phone' && v && v.replace(/[^\d]/g, '').length < 7) {
      setError(el, 'That phone number looks too short.');
      return false;
    }

    clearError(el);
    return true;
  }

  var fields = Array.prototype.slice.call(
    form.querySelectorAll('input, select, textarea')
  );

  fields.forEach(function (el) {
    el.addEventListener('blur', function () { if (el.value.trim() || el.hasAttribute('required')) checkField(el); });
    el.addEventListener('input', function () { if (el.getAttribute('aria-invalid') === 'true') checkField(el); });
    el.addEventListener('change', function () { if (el.getAttribute('aria-invalid') === 'true') checkField(el); });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var ok = true, firstBad = null;
    fields.forEach(function (el) {
      if (!checkField(el)) { ok = false; if (!firstBad) firstBad = el; }
    });

    if (!ok) {
      status.textContent = 'Check the highlighted fields and send again.';
      status.className = 'formnote is-bad';
      if (firstBad) firstBad.focus();
      return;
    }

    var payload = {};
    fields.forEach(function (el) { if (el.name) payload[el.name] = el.value.trim(); });

    submit.classList.add('is-sending');
    submit.disabled = true;
    status.textContent = 'Checking your enquiry.';
    status.className = 'formnote';

    sendEnquiry(payload)
      .then(function () {
        form.reset();
        fields.forEach(clearError);
        // Deliberately does not claim delivery: the handler below transmits
        // nothing. Replace this string when the form is wired to a real endpoint.
        status.textContent = 'Form checks out, but it is not connected yet, so nothing was sent. Email unrealvegas@gmail.com in the meantime.';
        status.className = 'formnote is-ok';
      })
      .catch(function () {
        status.textContent = 'That did not send. Email unrealvegas@gmail.com and we will pick it up there.';
        status.className = 'formnote is-bad';
      })
      .then(function () {
        submit.classList.remove('is-sending');
        submit.disabled = false;
      });
  });

  /* ==================================================================== *
   * PLACEHOLDER SUBMIT HANDLER  --  REPLACE BEFORE LAUNCH
   * --------------------------------------------------------------------
   * Nothing is transmitted anywhere. This resolves after a short delay so
   * the success, error and loading states are all reachable and testable.
   *
   * To make it real, delete the body of this function and return a real
   * request. For example, with Formspree:
   *
   *   function sendEnquiry(data) {
   *     return fetch('https://formspree.io/f/YOUR_FORM_ID', {
   *       method: 'POST',
   *       headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
   *       body: JSON.stringify(data)
   *     }).then(function (r) {
   *       if (!r.ok) throw new Error('Request failed');
   *     });
   *   }
   *
   * Netlify Forms, Basin, Getform and a custom endpoint all follow the
   * same shape: POST the payload, throw on a non-ok response.
   * ==================================================================== */
  function sendEnquiry(data) {
    return new Promise(function (resolve) {
      console.info('[Vegas Magic Squad] Placeholder handler. Enquiry not sent:', data);
      setTimeout(resolve, 900);
    });
  }

  }  /* end form guard */

  /* ------------------------------------------------------------------ *
   * 7. Footer year
   * ------------------------------------------------------------------ */
  var yr = document.getElementById('yr');
  if (yr) yr.textContent = String(new Date().getFullYear());
})();
