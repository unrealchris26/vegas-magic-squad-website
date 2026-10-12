"""Generate both HyperFrames projects from one spec.

    hero-video/          desktop project (1920x1080) - also the workspace
    hero-video/mobile/   mobile project  (1080x1920)

HyperFrames allows one root composition per project, so the two crops are
two projects. Each shot is a sub-composition with its own timeline; the root
holds the atmosphere. Everything that must match between the crops - shot
order, timing, eases, the grade - is written once, here, in SHOTS.

    python tools/bake.py     # after changing an image or an exposure trim
    python tools/build.py    # after changing anything else
"""
import json, os, shutil
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
PROJ = os.path.dirname(HERE)
MOB = os.path.join(PROJ, 'mobile')

T = 16.0            # loop length
STEP = 2.0          # a new image every STEP seconds
XF = 0.8            # transition length, centred on each boundary (8 images in 16s: 1.0 left half the film mid-blend)
E = "'sine.inOut'"

# The film, in order. The images are the client's own 1920x1080 frames from
# "For Hyperframes/"; desktop uses them full-frame at native resolution.
#   exposure  per-image trim before the shared look (baked by tools/bake.py)
#   move      'push' (scale 1 -> 1.06 toward `at`) or 'drift' (lateral, held scale)
#   at        the subject, as fractions of the 1920x1080 frame: the push aims here
#   mob_x     centre of the native 1080x1080 mobile crop, as a fraction of 1920
#   into      how this shot arrives: 'dissolve' | 'leak' | 'smoke'
SHOTS = [
    dict(id='f4', exposure=0.25,  move='push',  at=(0.32, 0.22), mob_x=0.36, into=None),        # Kent, back to us, the room
    dict(id='f6', exposure=-0.5,  move='push',  at=(0.46, 0.27), mob_x=0.44, into='dissolve'),  # Kent on stage, arms out -> match
    dict(id='f7', exposure=-0.1,  move='drift', at=(0.55, 0.33), mob_x=0.57, into='leak'),      # Dream, cards at the table
    dict(id='f3', exposure=0.15,  move='push',  at=(0.77, 0.30), mob_x=0.66, into='smoke'),     # Kent and the guest, arms out
    dict(id='f5', exposure=-0.95, move='push',  at=(0.33, 0.25), mob_x=0.36, into='dissolve'),  # Brandon, a reception
    dict(id='f2', exposure=-0.65, move='drift', at=(0.36, 0.38), mob_x=0.38, into='leak'),      # the gasp, rooftop
    dict(id='f1', exposure=-0.95, move='push',  at=(0.18, 0.35), mob_x=0.28, into='dissolve'),  # Dream, rooftop group -> match
    dict(id='f8', exposure=-0.6,  move='push',  at=(0.86, 0.35), mob_x=0.72, into='smoke'),     # trade-show crowd
]
EXPOSURE = {s['id']: s['exposure'] for s in SHOTS}   # read by tools/bake.py

CROPS = {
    'desktop': dict(dir=PROJ, cls='desk', cid='hero-desktop', W=1920, H=1080,
                    drift=48, wipe=('-660px', '-3180px'),
                    atmos=dict(seed=1012, haze=dict(cool=340, warm=260), sway=2.6,
                               dust=dict(count=44, bokeh=0.26,
                                         zones=[[0.56, 0.98], [0.56, 0.98], [0.56, 0.98], [0.0, 0.05]]))),
    'mobile': dict(dir=MOB, cls='mob', cid='hero-mobile', W=1080, H=1920,
                   drift=26, wipe=('-660px', '-3180px'),
                   atmos=dict(seed=2024, haze=dict(cool=300, warm=240), sway=2.2,
                              dust=dict(count=34, bokeh=0.26, zones=[[0.04, 0.96]]))),
}


def windows():
    """Each shot's clip window. Shot i arrives in the transition centred on
    STEP*i and leaves in the one centred on STEP*(i+1). The last shot hands
    over to the seam: shot 1's opening state fades in by T-0.4, then holds
    still to the loop point, so the final frames ARE frame 0."""
    n = len(SHOTS)
    out = []
    for i in range(n):
        start = 0.0 if i == 0 else STEP * i - XF / 2
        end = T if i == n - 1 else STEP * (i + 1) + XF / 2
        out.append((round(start, 3), round(end - start, 3)))
    return out


SEAM_IN, SEAM_LEN = T - 1.2, 0.8   # seam fades in 14.8 -> 15.6, held to 16.0


def img(id_, src):
    # The grade is BAKED into assets/graded/ by tools/bake.py - same engine,
    # same payload, same trims. Not applied at runtime: the runtime only
    # treats media visible at page load, so every later shot rendered ungraded.
    return f'<img id="{id_}" src="{src}" alt="" />'


def subcomp(cid, W, H, body, script):
    return f'''<!doctype html>
<html lang="en">
  <head><meta charset="UTF-8" /></head>
  <body>
    <template>
      <style>
        #root {{ position: absolute; inset: 0; overflow: hidden; }}
      </style>
      <div id="root" data-composition-id="{cid}" data-width="{W}" data-height="{H}">
{body}
      </div>
      <script>
        (function () {{
          var tl = gsap.timeline({{ paused: true }});
{script}
          window.__timelines["{cid}"] = tl;
        }})();
      </script>
    </template>
  </body>
</html>
'''


def shot_html(c, tag, k, s, dur, seam=False):
    """One shot: arrive, one slow move, leave. Everything sine.inOut."""
    W, H = c['W'], c['H']
    sid = 'k0' if seam else f'k{k + 1}'
    src = f'assets/graded/{s["id"]}-{tag}{"-seam" if seam else ""}.jpg'
    cam_inner = img(f'{sid}-img', src)
    plate = tag == 'mobile'
    wrap_open = '<div class="wipe">' if (s['into'] == 'smoke' and not seam) else '<div class="fade">'
    body = (f'        <div id="{sid}" class="shot {sid}">{wrap_open}'
            + ('<div class="mplate" data-layout-allow-overflow>' if plate else '')
            + f'<div class="cam" style="transform-origin: {origin(s, tag)}">\n          {cam_inner}\n        '
            + ('</div></div></div></div>' if plate else '</div></div></div>'))
    lines = []
    if seam:
        lines.append(f"          // shot 1's opening state, static: fades in, then holds to the loop point")
        lines.append(f"          tl.fromTo('#{sid} .fade', {{ opacity: 0 }}, {{ opacity: 1, duration: {SEAM_LEN}, ease: {E} }}, 0);")
        return subcomp(f'shot-seam', W, H, body, '\n'.join(lines))
    # arrive
    if k > 0:
        if s['into'] == 'smoke':
            lines.append(f"          tl.fromTo('#{sid} .wipe', {{ '--wipe': '{c['wipe'][0]}' }}, {{ '--wipe': '{c['wipe'][1]}', duration: {XF}, ease: {E} }}, 0);")
        else:
            lines.append(f"          tl.fromTo('#{sid} .fade', {{ opacity: 0 }}, {{ opacity: 1, duration: {XF}, ease: {E} }}, 0);")
    # the one move
    if s['move'] == 'drift':
        d = c['drift']
        lines.append(f"          tl.fromTo('#{sid} .cam', {{ x: {-d}, scale: 1.05 }}, {{ x: {d}, scale: 1.05, duration: {dur}, ease: {E} }}, 0);")
    else:
        lines.append(f"          tl.fromTo('#{sid} .cam', {{ scale: 1 }}, {{ scale: 1.06, duration: {dur}, ease: {E} }}, 0);")
    # leave: under the next shot's arrival, so the hand-off passes through night
    # instead of stacking two photographs at full strength
    out_wrap = '.wipe' if s['into'] == 'smoke' else '.fade'
    if k == len(SHOTS) - 1:
        lines.append(f"          tl.to('#{sid} {out_wrap}', {{ opacity: 0, duration: {SEAM_LEN}, ease: {E} }}, {round(SEAM_IN - (STEP * k - XF / 2), 3)});")
    else:
        lines.append(f"          tl.to('#{sid} {out_wrap}', {{ opacity: 0, duration: {XF * 0.7}, ease: {E} }}, {round(dur - XF * 0.7, 3)});")
    return subcomp(f'shot-{k + 1}', W, H, body, '\n'.join(lines))


def origin(s, tag):
    ax, ay = s['at']
    if tag == 'mobile':
        # within the square crop: x relative to the crop window, y as-is
        left = mob_left(s)
        ax = min(max((ax * 1920 - left) / 1080, 0.05), 0.95)
    return f'{ax * 100:.1f}% {ay * 100:.1f}%'


def mob_left(s):
    return int(round(min(max(s['mob_x'] * 1920 - 540, 0), 1920 - 1080)))


GRAIN = f'''      /* registry: grain-overlay at the brief's ~6%, finite: {int(T / 0.5)} x 0.5s is
         exactly one loop, so the last frame hands to the first */
      @keyframes hf-grain-noise {{
        0%, 100% {{ transform: translate(0, 0); }}
        10% {{ transform: translate(-5%, -5%); }}
        20% {{ transform: translate(-10%, 5%); }}
        30% {{ transform: translate(5%, -10%); }}
        40% {{ transform: translate(-5%, 15%); }}
        50% {{ transform: translate(-10%, 5%); }}
        60% {{ transform: translate(15%, 0); }}
        70% {{ transform: translate(0, 10%); }}
        80% {{ transform: translate(-15%, 0); }}
        90% {{ transform: translate(10%, 5%); }}
      }}
      #grain-overlay {{ position: absolute; inset: 0; pointer-events: none; overflow: hidden; }}
      #grain-overlay .grain-texture {{
        position: absolute; top: -50%; left: -50%; width: 200%; height: 200%;
        background: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
        opacity: 0.06;
        animation: hf-grain-noise 0.5s steps(1) {int(T / 0.5)} both;
      }}'''


def root(c):
    W, H = c['W'], c['H']
    wins = windows()
    hosts = []
    for k, (st, du) in enumerate(wins):
        cid = f'shot-{k + 1}'
        hosts.append(f'      <div id="{cid}" class="slot" data-composition-id="{cid}" data-composition-src="compositions/{cid}.html"'
                     f' data-start="{st}" data-duration="{du}" data-track-index="{1 + k % 2}" data-width="{W}" data-height="{H}"></div>')
    hosts.append(f'      <div id="shot-seam" class="slot" data-composition-id="shot-seam" data-composition-src="compositions/shot-seam.html"'
                 f' data-start="{SEAM_IN}" data-duration="{round(T - SEAM_IN, 3)}" data-track-index="3" data-width="{W}" data-height="{H}"></div>')
    # the gold leaks sit over the 'leak' arrivals; each peaks 0.6s after it starts
    leaks = [round(STEP * k - 0.6, 3) for k, s in enumerate(SHOTS) if s['into'] == 'leak']
    cfg = dict(width=W, height=H, period=T, leaks=leaks, **c['atmos'])
    leak_divs = '\n'.join(f'      <div id="leak{n + 1}" class="leak"><div class="lk-a"></div><div class="lk-b"></div></div>'
                          for n in range(len(leaks)))
    return f'''<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width={W}, height={H}" />
    <title>Hero loop - {'desktop' if c['cls'] == 'desk' else 'mobile'}</title>
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
    <link rel="stylesheet" href="shared/hero.css" />
    <style>
      html, body {{ width: {W}px; height: {H}px; }}
      .slot {{ position: absolute; inset: 0; }}
{GRAIN}
    </style>
  </head>
  <body>
    <!-- GENERATED by tools/build.py - edit the spec there, not this file. -->
    <div id="root" class="{c['cls']}" data-composition-id="{c['cid']}" data-start="0" data-duration="{T:g}"
      data-width="{W}" data-height="{H}">
      <div class="night"></div>
{chr(10).join(hosts)}
      <div id="haze-cool" class="haze"><div class="h1"></div><div class="h2"></div></div>
      <div id="haze-warm" class="haze"><div class="h1"></div><div class="h2"></div></div>
      <div id="spot"><div class="aim"><div class="cone"></div></div></div>
{leak_divs}
      <div id="dust"></div>
      <div class="scrim"></div>
      <div id="grain-overlay"><div class="grain-texture"></div></div>
    </div>
    <script src="shared/hero.js"></script>
    <script>
      window.__timelines["{c['cid']}"] = HeroAtmosphere({json.dumps(cfg)});
    </script>
  </body>
</html>
'''


def stage_assets():
    g = os.path.join(PROJ, 'assets', 'graded')
    # Mobile: a native-resolution 1080x1080 square cut from each graded frame,
    # centred on the performer. Same pixels as desktop, so the same grade.
    for s in SHOTS:
        im = Image.open(os.path.join(g, f'{s["id"]}-desktop.jpg'))
        left = mob_left(s)
        im.crop((left, 0, left + 1080, 1080)).save(os.path.join(g, f'{s["id"]}-mobile.jpg'), quality=95, subsampling=0)
    # The seam reuses shot 1; a separate file keeps the two img nodes from
    # being discovered as one duplicated media entry.
    first = SHOTS[0]['id']
    for tag in ('desktop', 'mobile'):
        shutil.copy2(os.path.join(g, f'{first}-{tag}.jpg'), os.path.join(g, f'{first}-{tag}-seam.jpg'))

    # The mobile project carries only what it renders.
    shutil.rmtree(os.path.join(MOB, 'assets'), ignore_errors=True)
    need = ['shared/hero.js', 'shared/hero.css', 'assets/fx/haze.png', 'assets/fx/smoke-v.png',
            'assets/fx/smoke-h.png']   # the shared stylesheet names it; lint resolves every url()
    need += [f'assets/graded/{s["id"]}-mobile.jpg' for s in SHOTS] + [f'assets/graded/{first}-mobile-seam.jpg']
    for rel in need:
        d = os.path.join(MOB, rel)
        os.makedirs(os.path.dirname(d), exist_ok=True)
        shutil.copy2(os.path.join(PROJ, rel), d)
    for f in ('package.json', 'CLAUDE.md', 'AGENTS.md', 'hyperframes.json', 'hyperframes.lock.json'):
        shutil.copy2(os.path.join(PROJ, f), os.path.join(MOB, f))
    meta = json.load(open(os.path.join(PROJ, 'meta.json')))
    meta.update(id='hero-video-mobile', name='hero-video-mobile')
    json.dump(meta, open(os.path.join(MOB, 'meta.json'), 'w'), indent=2)


def main():
    stage_assets()
    wins = windows()
    for tag, c in CROPS.items():
        comp = os.path.join(c['dir'], 'compositions')
        shutil.rmtree(comp, ignore_errors=True)
        os.makedirs(comp)
        open(os.path.join(c['dir'], 'index.html'), 'w', encoding='utf-8', newline='\n').write(root(c))
        for k, (s, (st, du)) in enumerate(zip(SHOTS, wins)):
            open(os.path.join(comp, f'shot-{k + 1}.html'), 'w', encoding='utf-8', newline='\n').write(shot_html(c, tag, k, s, du))
        open(os.path.join(comp, 'shot-seam.html'), 'w', encoding='utf-8', newline='\n').write(
            shot_html(c, tag, 0, SHOTS[0], round(T - SEAM_IN, 3), seam=True))
        print(f'{tag}: index.html + {len(SHOTS)} shots + seam -> {c["dir"]}')
    for k, ((st, du), s) in enumerate(zip(wins, SHOTS)):
        print(f'   shot {k + 1}  {s["id"]}  {st:5.2f}-{st + du:5.2f}s  in: {s["into"] or "-":8} move: {s["move"]}')


if __name__ == '__main__':
    main()
