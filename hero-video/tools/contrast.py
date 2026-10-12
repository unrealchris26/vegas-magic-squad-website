"""Can cream #fdf6ea at 64px bold sit anywhere in the headline zone?

For each sampled frame, the headline zone (desktop: left 55%; mobile: bottom
45%) is cut into 64x64 patches - one glyph's footprint at 64px - and each
patch's mean relative luminance is set against the cream's. 64px bold is
WCAG "large text", so AA needs 3:1; the stricter 4.5:1 is reported too.

    python tools/contrast.py <frames dir> desktop|mobile
"""
import glob, os, sys
import numpy as np
import cv2

CREAM = (0xfd, 0xf6, 0xea)


def lin(c):
    c = c / 255.0
    return np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)


def lum_img(bgr):
    b, g, r = [lin(bgr[:, :, i].astype(np.float32)) for i in range(3)]
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


L_CREAM = float(0.2126 * lin(np.float32(CREAM[0])) + 0.7152 * lin(np.float32(CREAM[1])) + 0.0722 * lin(np.float32(CREAM[2])))


def zone(img, crop):
    h, w = img.shape[:2]
    return img[:, : int(w * 0.55)] if crop == 'desktop' else img[int(h * 0.55):, :]


def main(d, crop):
    rows = []
    for f in sorted(glob.glob(os.path.join(d, '*.png'))):
        img = cv2.imread(f)
        if img is None:
            continue
        # frames from the CLI may be scaled; normalise to the true canvas
        target = (1920, 1080) if crop == 'desktop' else (1080, 1920)
        if (img.shape[1], img.shape[0]) != target:
            img = cv2.resize(img, target, interpolation=cv2.INTER_AREA)
        Lz = lum_img(zone(img, crop))
        P = 64
        h, w = (Lz.shape[0] // P) * P, (Lz.shape[1] // P) * P
        patches = Lz[:h, :w].reshape(h // P, P, w // P, P).mean(axis=(1, 3))
        ratio = (L_CREAM + 0.05) / (patches + 0.05)
        rows.append((os.path.basename(f), float(ratio.min()), float(np.percentile(ratio, 5)),
                     float((ratio < 3).mean() * 100), float((ratio < 4.5).mean() * 100)))
    print(f'{"frame":34} {"worst":>6} {"p5":>6} {"<3:1":>7} {"<4.5:1":>7}')
    for r in rows:
        print(f'{r[0]:34} {r[1]:6.2f} {r[2]:6.2f} {r[3]:6.1f}% {r[4]:6.1f}%')
    worst = min(r[1] for r in rows)
    print(f'\nworst patch over {len(rows)} frames: {worst:.2f}:1  ->  '
          f'AA large (3:1) {"PASS" if worst >= 3 else "FAIL"},  AA normal (4.5:1) {"PASS" if worst >= 4.5 else "fail"}')


if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2])
