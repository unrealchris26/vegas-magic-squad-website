"""Seeded, deterministic atmosphere textures. Re-run to regenerate; same
seed, same pixels.

assets/fx/haze.png         1920x1080 haze density as alpha, tileable on BOTH
                           axes (built from an FFT spectrum, which is periodic
                           by construction), so it repeats across the wide
                           drifting haze layers with no visible join. The loop
                           itself comes from hero.js's two-layer crossfade.
assets/fx/smoke-h.png      5760x1080 wipe mask for desktop: transparent left
                           half, opaque right half, wispy edge in the middle.
assets/fx/smoke-v.png      1080x5760 the same for mobile, travelling down.
"""
import os
import numpy as np
import cv2

OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'assets', 'fx')
os.makedirs(OUT, exist_ok=True)
rng = np.random.default_rng(20261012)


def periodic_noise(h, w, beta, lo, hi):
    """Band-limited noise that tiles seamlessly: random phases on a 1/f^beta
    amplitude spectrum, kept between spatial frequencies lo and hi (cycles
    per tile)."""
    fy = np.fft.fftfreq(h)[:, None] * h
    fx = np.fft.fftfreq(w)[None, :] * w
    f = np.sqrt(fx ** 2 + fy ** 2)
    amp = np.where((f >= lo) & (f <= hi), 1.0 / np.maximum(f, 1e-6) ** beta, 0.0)
    phase = np.exp(2j * np.pi * rng.random((h, w)))
    n = np.real(np.fft.ifft2(amp * phase))
    n -= n.min()
    return n / n.max()


def haze():
    h, w = 540, 960                                   # tile, upscaled 2x below
    big = periodic_noise(h, w, 1.6, 1, 14)
    fine = periodic_noise(h, w, 1.2, 6, 40)
    n = 0.78 * big + 0.22 * fine
    n = np.clip((n - 0.42) / 0.5, 0, 1) ** 1.6       # wisps, not fog
    # Upscale without breaking the wrap: pad with the tile's own opposite
    # edges, resize, then crop the pad back off. Resizing the bare tile would
    # reflect at the border and leave a visible seam once per loop.
    p = 8
    n = np.pad(n.astype(np.float32), p, mode='wrap')
    n = cv2.resize(n, (n.shape[1] * 2, n.shape[0] * 2), interpolation=cv2.INTER_CUBIC)
    n = n[2 * p:-2 * p, 2 * p:-2 * p]
    assert n.shape == (1080, 1920), n.shape
    a = np.clip(n * 235, 0, 255).astype(np.uint8)
    rgba = np.dstack([np.full_like(a, 255)] * 3 + [a])
    cv2.imwrite(os.path.join(OUT, 'haze.png'), rgba)


def smoke(w, h, along, name):
    """along: length of the travel axis. The edge sits at its midpoint and is
    pushed around by low-frequency noise on the cross axis plus fine wisps."""
    # A 2D noise field displaces the ramp, so the boundary billows and breaks
    # into wisps the way smoke does, instead of being one wobbly line.
    cross = h if along == w else w
    t = np.arange(along, dtype=np.float32)[None, :]                 # travel coord
    n = 0.62 * periodic_noise(cross, along, 1.5, 2, 18) + 0.38 * periodic_noise(cross, along, 1.0, 12, 90)
    d = (t - along / 2) / 240.0 + (n - 0.5) * 2.6
    alpha = np.clip(d * 0.5 + 0.5, 0, 1)
    alpha = alpha * alpha * (3 - 2 * alpha)                           # smoothstep
    alpha[:, : int(along * 0.30)] = 0                                 # clean far ends
    alpha[:, int(along * 0.70):] = 1
    a = (alpha * 255).astype(np.uint8)
    if along != w:
        a = a.T
    rgba = np.dstack([np.full_like(a, 255)] * 3 + [a])
    cv2.imwrite(os.path.join(OUT, name), rgba)


if __name__ == '__main__':
    haze()
    smoke(5760, 1080, 5760, 'smoke-h.png')
    smoke(1080, 5760, 5760, 'smoke-v.png')
    for f in sorted(os.listdir(OUT)):
        print(f, os.path.getsize(os.path.join(OUT, f)) // 1024, 'KB')
