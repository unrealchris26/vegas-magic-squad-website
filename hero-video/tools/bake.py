"""Bake the shared grade into every plate, using HyperFrames' own grading engine.

Why: the runtime only sets up a data-color-grading treatment for media that is
visible when the page loads. A shot that enters later starts hidden, never gets
treated, and renders ungraded. Measured on the first render: only shot 1 was
graded; shots 2-5 and the seam copy were not. So the grade is applied once,
here, to each photo on its own in a one-frame composition where it IS visible
at load, and the film uses the baked results with no runtime grading at all.

Same engine, same payload (tools/grade/look-canonical.json), same per-shot
exposure trim as before - one filter chain on every shot, now actually on
every shot.

    python tools/bake.py          ->  assets/graded/<id>-desktop.jpg
"""
import json, os, shutil, subprocess, sys, glob
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
PROJ = os.path.dirname(HERE)
PHOTOS = os.path.join(PROJ, 'assets', 'photos')
OUT = os.path.join(PROJ, 'assets', 'graded')
WORK = os.path.join(HERE, 'bake')
LOOK = json.load(open(os.path.join(HERE, 'grade', 'look-canonical.json')))
sys.path.insert(0, HERE)
from build import EXPOSURE   # one source for the trims

# Every shot's source frame, graded once at its own exposure trim. Mobile
# squares are cut from these graded frames by build.py, so both crops carry
# the same pixels and the same grade.
JOBS = [(f'{sid}.jpg', sid) for sid in EXPOSURE]

HF = ['npx', '--yes', 'hyperframes@0.8.148']


def page(w, h, grading):
    return f'''<!doctype html>
<html lang="en"><head><meta charset="UTF-8" />
<script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
<style>html,body{{margin:0;width:{w}px;height:{h}px;overflow:hidden;background:#000}}
#root{{position:relative;width:100%;height:100%}} #i{{display:block;width:100%;height:100%}}</style></head>
<body><div id="root" data-composition-id="bake" data-start="0" data-duration="1" data-width="{w}" data-height="{h}">
<img id="i" src="src.jpg" alt="" data-color-grading='{grading}' />
</div><script>window.__timelines["bake"] = gsap.timeline({{ paused: true }});</script></body></html>
'''


def bake(name, shot):
    src = os.path.join(PHOTOS, name)
    w, h = Image.open(src).size
    g = json.loads(json.dumps(LOOK))
    g['adjust']['exposure'] = EXPOSURE[shot]
    if os.path.exists(WORK):
        shutil.rmtree(WORK)
    os.makedirs(WORK)
    shutil.copy2(os.path.join(PROJ, 'hyperframes.json'), WORK)
    shutil.copy2(src, os.path.join(WORK, 'src.jpg'))
    open(os.path.join(WORK, 'index.html'), 'w', encoding='utf-8').write(page(w, h, json.dumps(g, separators=(',', ':'))))
    p = subprocess.run(HF + ['snapshot', WORK, '--at', '0'], capture_output=True, text=True, shell=(os.name == 'nt'))
    shots = glob.glob(os.path.join(WORK, 'snapshots', 'frame-*.png'))
    if not shots:
        raise SystemExit(f'bake failed for {name}:\n{p.stdout[-800:]}\n{p.stderr[-800:]}')
    im = Image.open(shots[0]).convert('RGB')
    if im.size != (w, h):
        im = im.resize((w, h), Image.LANCZOS)
    os.makedirs(OUT, exist_ok=True)
    dst = os.path.join(OUT, name.replace('.jpg', '-desktop.jpg'))
    im.save(dst, quality=95, subsampling=0)
    print(f'baked {name:10} exposure {EXPOSURE[shot]:+.2f}  {w}x{h}  -> {os.path.basename(dst)}')


if __name__ == '__main__':
    for name, shot in JOBS:
        bake(name, shot)
    shutil.rmtree(WORK, ignore_errors=True)
