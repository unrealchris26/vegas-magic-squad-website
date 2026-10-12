"""Measure the site's real hero text over the real film (see site-contrast.cjs).

    python tools/site-contrast.py <dir with bg-*.png + boxes.json> <label>

Headline: --gold-hi #e6d193, large text (3:1 for AA). Lede: --night-tx
#efe9dd at ~19-33px, which the site sets with a heavy dark text-shadow; it is
measured here WITHOUT the shadow, against 3:1 when it renders >= 24px (large)
and 4.5:1 below. Every 32px patch inside each text box, at every sampled time.
"""
import glob, json, os, sys
import numpy as np
import cv2
from contrast import lum_img, lin


def L_of(hexc):
    r, g, b = [int(hexc[i:i + 2], 16) for i in (1, 3, 5)]
    return float(0.2126 * lin(np.float32(r)) + 0.7152 * lin(np.float32(g)) + 0.0722 * lin(np.float32(b)))


def main(d, label):
    boxes = json.load(open(os.path.join(d, 'boxes.json')))
    texts = [('headline #e6d193', boxes['name'], L_of('#e6d193'), 3.0),
             # WCAG large text: >= 24px, or >= 18.66px when bold (700+)
             ('lede #efe9dd', boxes['lede'], L_of('#efe9dd'),
              3.0 if boxes['ledeSize'] >= 24 or (boxes['ledeSize'] >= 18.66 and boxes['ledeWeight'] >= 700) else 4.5)]
    print(f'{label}: film = {boxes["film"].split("/").pop()}, lede {boxes["ledeSize"]:.0f}px weight {boxes["ledeWeight"]}')
    for name, b, Lt, need in texts:
        worst, at = 99, None
        for f in sorted(glob.glob(os.path.join(d, 'bg-*.png'))):
            img = cv2.imread(f)
            x0, y0, x1, y1 = [max(0, v) for v in b]
            Lz = lum_img(img[y0:y1, x0:x1])
            P = 32
            h, w = (Lz.shape[0] // P) * P, (Lz.shape[1] // P) * P
            if h == 0 or w == 0:
                continue
            pt = Lz[:h, :w].reshape(h // P, P, w // P, P).mean(axis=(1, 3))
            r = float(((Lt + .05) / (pt + .05)).min())
            if r < worst:
                worst, at = r, os.path.basename(f)[3:7]
        print(f'  {name:18} box {b}  worst {worst:5.2f}:1 at t={at}s  need {need}:1  ->  {"PASS" if worst >= need else "FAIL"}')


if __name__ == '__main__':
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    main(sys.argv[1], sys.argv[2])
