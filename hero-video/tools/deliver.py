"""From the two near-lossless masters to everything the brief asks for.

    python tools/deliver.py

renders/master-{desktop,mobile}.mp4  ->  output/
  hero-desktop.mp4 / .webm, hero-mobile.mp4 / .webm   (brief's exact encoder
                                                       settings; CRF raised only
                                                       if a file is over target)
  hero-poster-desktop.jpg / hero-poster-mobile.jpg     (q82)
  hero-shots.jpg                                       (contact sheet)
  loop-preview-desktop.mp4 / -mobile.mp4               (3 loops, -stream_loop 2)
  qa.txt                                               (sizes, seam, contrast)
"""
import os, subprocess, json, sys
import numpy as np
import cv2
from PIL import Image, ImageDraw, ImageFont

PROJ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
R = os.path.join(PROJ, 'renders')
O = os.path.join(PROJ, 'output')
os.makedirs(O, exist_ok=True)
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from contrast import lum_img, L_CREAM  # same metric as the composition check

MB = 1024 * 1024
TARGET = {('desktop', 'mp4'): 4.0, ('desktop', 'webm'): 3.0,
          ('mobile', 'mp4'): 3.0, ('mobile', 'webm'): 2.5}
SIZE = {'desktop': (1920, 1080), 'mobile': (1080, 1920)}
SHOTS = [('1  Kent, the room', 1.0), ('2  Kent on stage', 3.0), ('3  Dream, cards', 5.0),
         ('4  Kent + guest', 7.0), ('5  Brandon, reception', 9.0), ('6  the gasp', 11.0),
         ('7  Dream, rooftop', 13.0), ('8  trade show', 14.6)]
POSTER_T = 7.0   # Kent and the guest: performer right, left side dark - calm for a still
QA = []


def run(cmd):
    p = subprocess.run(cmd, capture_output=True, text=True)
    if p.returncode:
        raise SystemExit('FAILED: ' + ' '.join(cmd) + '\n' + p.stderr[-1500:])
    return p


def encode(crop, fmt, crf):
    src = os.path.join(R, f'master-{crop}.mp4')
    dst = os.path.join(O, f'hero-{crop}.{fmt}')
    if fmt == 'mp4':
        v = ['-c:v', 'libx264', '-crf', str(crf), '-preset', 'slow', '-pix_fmt', 'yuv420p',
             '-profile:v', 'high', '-movflags', '+faststart']
    else:
        v = ['-c:v', 'libvpx-vp9', '-crf', str(crf), '-b:v', '0', '-pix_fmt', 'yuv420p',
             '-row-mt', '1', '-deadline', 'good', '-cpu-used', '2']
    run(['ffmpeg', '-y', '-v', 'error', '-i', src, *v, '-r', '30', '-an', dst])
    return dst


def deliver_video(crop, fmt):
    crf = 26 if fmt == 'mp4' else 36          # the brief's values
    while True:
        dst = encode(crop, fmt, crf)
        mb = os.path.getsize(dst) / MB
        if mb <= TARGET[(crop, fmt)] or crf >= (35 if fmt == 'mp4' else 50):
            break
        crf += 1                               # lower the bitrate, never the resolution
    QA.append(f'{os.path.basename(dst):22} {mb:5.2f} MB  target <= {TARGET[(crop, fmt)]:.1f} MB  '
              f'{"OK" if mb <= TARGET[(crop, fmt)] else "OVER"}  (crf {crf})')
    return dst


def probe(path):
    out = run(['ffprobe', '-v', 'error', '-show_entries', 'stream=codec_type,codec_name,width,height,r_frame_rate,nb_frames',
               '-show_entries', 'format=duration', '-of', 'json', path]).stdout
    return json.loads(out)


def frames(path, crop):
    W, H = SIZE[crop]
    # binary capture: run() decodes as text, which would mangle the frames
    p = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-f', 'rawvideo', '-pix_fmt', 'bgr24', '-'],
                       capture_output=True)
    if p.returncode:
        raise SystemExit('frame decode failed: ' + p.stderr.decode(errors='replace')[-800:])
    a = np.frombuffer(p.stdout, np.uint8)
    return a.reshape(-1, H, W, 3)


def seam(crop, f):
    """Is the loop point a jump? Compare last->first against ordinary motion.
    Raw differences include film grain, which re-randomises every 1.5 frames
    and so makes every step look busy; the structural test blurs grain and
    codec noise away and is the one that decides."""
    small = np.stack([cv2.resize(x, (480, int(480 * x.shape[0] / x.shape[1]))) for x in f]).astype(np.float32)
    blur = np.stack([cv2.GaussianBlur(x, (0, 0), 3) for x in small])
    for name, s in (('raw', small), ('structural', blur)):
        d = np.abs(np.diff(s, axis=0)).mean(axis=(1, 2, 3))
        loop = float(np.abs(s[0] - s[-1]).mean())
        med, p95 = float(np.median(d)), float(np.percentile(d, 95))
        QA.append(f'{crop:8} loop seam ({name:10}): last->first {loop:.2f} | normal step median {med:.2f}, '
                  f'95th pct {p95:.2f}  ->  {"no visible jump" if loop <= p95 else "JUMP"}')


def contrast(crop, f):
    worst, at = 99, 0
    for i in range(0, len(f), 15):                       # every 0.5s
        img = f[i]
        h, w = img.shape[:2]
        z = img[:, : int(w * .55)] if crop == 'desktop' else img[int(h * .55):, :]
        Lz = lum_img(z)
        P = 64
        hh, ww = (Lz.shape[0] // P) * P, (Lz.shape[1] // P) * P
        pt = Lz[:hh, :ww].reshape(hh // P, P, ww // P, P).mean(axis=(1, 3))
        r = float(((L_CREAM + .05) / (pt + .05)).min())
        if r < worst:
            worst, at = r, i / 30
    QA.append(f'{crop:8} cream 64px bold over the headline zone, encoded file, every 0.5s: worst {worst:.2f}:1 '
              f'at {at:.1f}s  ->  AA large text (3:1) {"PASS" if worst >= 3 else "FAIL"}')


def poster(crop, f):
    img = f[int(round(POSTER_T * 30))]
    dst = os.path.join(O, f'hero-poster-{crop}.jpg')
    Image.fromarray(img[:, :, ::-1]).save(dst, quality=82, optimize=True, progressive=True)
    QA.append(f'{os.path.basename(dst):22} {os.path.getsize(dst) / 1024:5.0f} KB  (frame at {POSTER_T}s)')


def loop_preview(crop):
    src = os.path.join(O, f'hero-{crop}.mp4')
    dst = os.path.join(O, f'loop-preview-{crop}.mp4')
    run(['ffmpeg', '-y', '-v', 'error', '-stream_loop', '2', '-i', src, '-c', 'copy', dst])
    d = float(probe(dst)['format']['duration'])
    QA.append(f'{os.path.basename(dst):22} {d:.2f}s (3 loops)')


def sheet(fd, fm):
    """One frame per shot plus the loop seam, desktop beside mobile, labelled."""
    font = ImageFont.truetype('arialbd.ttf', 24)
    small = ImageFont.truetype('arial.ttf', 18)
    tw, th = 640, 360                       # desktop tile
    mw = int(th * 9 / 16)                   # mobile tile, same height
    cell_w, cell_h = tw + 12 + mw, th + 74
    items = [(lab, int(round(t * 30))) for lab, t in SHOTS] +             [('loop seam - last frame', len(fd) - 1), ('loop seam - first frame', 0)]
    cols = 4
    rows = (len(items) + cols - 1) // cols
    S = Image.new('RGB', (cols * (cell_w + 20) + 20, rows * (cell_h + 16) + 16), (13, 17, 25))
    D = ImageDraw.Draw(S)
    for k, (lab, i) in enumerate(items):
        x = 20 + (k % cols) * (cell_w + 20)
        y = 16 + (k // cols) * (cell_h + 16)
        d = Image.fromarray(fd[i][:, :, ::-1]).resize((tw, th), Image.LANCZOS)
        m = Image.fromarray(fm[min(i, len(fm) - 1)][:, :, ::-1]).resize((mw, th), Image.LANCZOS)
        D.text((x, y), lab, fill=(230, 209, 147), font=font)
        S.paste(d, (x, y + 36)); S.paste(m, (x + tw + 12, y + 36))
        D.text((x, y + 36 + th + 6), f'{i / 30:.2f}s     desktop 1920x1080  |  mobile 1080x1920', fill=(190, 182, 165), font=small)
    dst = os.path.join(O, 'hero-shots.jpg')
    S.save(dst, quality=88)
    QA.append(f'hero-shots.jpg {S.size[0]}x{S.size[1]}')


def main():
    vids = {}
    for crop in ('desktop', 'mobile'):
        for fmt in ('mp4', 'webm'):
            vids[(crop, fmt)] = deliver_video(crop, fmt)
    for (crop, fmt), path in vids.items():
        info = probe(path)
        v = [s for s in info['streams'] if s['codec_type'] == 'video'][0]
        a = [s for s in info['streams'] if s['codec_type'] == 'audio']
        QA.append(f'{os.path.basename(path):22} {v["codec_name"]} {v["width"]}x{v["height"]} '
                  f'{v["r_frame_rate"]}fps {float(info["format"]["duration"]):.2f}s audio tracks: {len(a)}')
    f = {c: frames(vids[(c, 'mp4')], c) for c in ('desktop', 'mobile')}
    for c in ('desktop', 'mobile'):
        seam(c, f[c]); contrast(c, f[c]); poster(c, f[c]); loop_preview(c)
    sheet(f['desktop'], f['mobile'])
    open(os.path.join(O, 'qa.txt'), 'w').write('\n'.join(QA) + '\n')
    print('\n'.join(QA))


if __name__ == '__main__':
    main()
