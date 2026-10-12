"""Stage the five source photos and cut the working plates for both crops.

Nothing here alters a person: every operation is a crop and a resample. The
grade, vignette and motion are applied later by the composition, identically
to every shot. Re-run after changing a crop box; it overwrites assets/plates/.

Crop boxes are fractions of the ORIGINAL image (left, top, right, bottom), so
they survive a re-export of the source at another resolution.
"""
import os, shutil, sys
from PIL import Image, ImageOps, ImageDraw

HERE = os.path.dirname(os.path.abspath(__file__))
PROJ = os.path.dirname(HERE)
SITE = os.path.dirname(PROJ)
PHOTOS = os.path.join(PROJ, 'assets', 'photos')
PLATES = os.path.join(PROJ, 'assets', 'plates')
os.makedirs(PHOTOS, exist_ok=True)
os.makedirs(PLATES, exist_ok=True)

SRC = {
    'p13-kent-room':   'Kent Axell Master Magician Illusionist Live Performance South River Pic 10.jpg',
    'p02-kent-arms':   'DSC05954 copy.jpg',
    'p23-dream':       '411210269_597872759131078_7863584308131003107_n.jpg',
    'p28-cards':       'images/site/closeup-cards-table.jpg',
    'p10-ovation':     'Kent Axell Master Magician Illusionist Live Performance St George Country Club 9.JPG',
}

# (box as fractions, output size). Full-frame plates carry ~1.2x headroom over
# the frame so a 1.08 push never upsamples; the two low-res plates are kept at
# their native pixel size and placed at <= 1:1 by the composition.
DESKTOP = {
    'p13-kent-room': ((0.000, 0.105, 0.600, 0.611), (2304, 1296)),
    'p02-kent-arms': ((0.005, 0.075, 0.905, 0.834), (2304, 1296)),
    'p10-ovation':   ((0.000, 0.000, 1.000, 1.000), (2304, 1296)),
    'p23-dream':     ((0, 0, 1, 1), None),
    'p28-cards':     ((0, 0, 1, 1), None),
}
MOBILE = {
    'p13-kent-room': ((0.162, 0.000, 0.537, 1.000), (1296, 2304)),
    'p02-kent-arms': ((0.360, 0.080, 0.640, 0.828), (1296, 2304)),
    'p10-ovation':   ((0.633, 0.296, 0.856, 1.000), (1296, 2304)),
    'p23-dream':     ((0, 0, 1, 1), None),
    'p28-cards':     ((0, 0, 1, 1), None),
}


def load(name):
    return ImageOps.exif_transpose(Image.open(os.path.join(PHOTOS, name + '.jpg'))).convert('RGB')


def cut(im, box, size):
    W, H = im.size
    l, t, r, b = box
    c = im.crop((round(l * W), round(t * H), round(r * W), round(b * H)))
    if size:
        c = c.resize(size, Image.LANCZOS)
    return c


def main():
    for name, rel in SRC.items():
        dst = os.path.join(PHOTOS, name + '.jpg')
        if not os.path.exists(dst):
            shutil.copy2(os.path.join(SITE, rel), dst)
    previews = []
    for tag, table in (('desktop', DESKTOP), ('mobile', MOBILE)):
        for name, (box, size) in table.items():
            im = load(name)
            c = cut(im, box, size)
            out = os.path.join(PLATES, f'{name}-{tag}.jpg')
            c.save(out, quality=93, subsampling=0)
            src_w = round((box[2] - box[0]) * im.size[0])
            print(f'{tag:7} {name:14} crop {src_w}px wide -> {c.size[0]}x{c.size[1]}')
            previews.append((tag, name, c))
    if '--preview' in sys.argv:
        sheet(previews)


def sheet(previews):
    """Each crop at frame aspect with the text-safe zone shaded."""
    tiles = []
    for tag, name, c in previews:
        if c.size[0] < 1200 and tag == 'desktop':      # a right-side plate
            frame = Image.new('RGB', (1920, 1080), (7, 9, 15))
            p = c.copy()
            p.thumbnail((10000, 1080), Image.LANCZOS)
            frame.paste(p, (1920 - p.size[0] - 60, 0))
            c = frame
        if c.size[1] < 1800 and tag == 'mobile':
            frame = Image.new('RGB', (1080, 1920), (7, 9, 15))
            p = c.copy()
            p.thumbnail((1080, 10000), Image.LANCZOS)
            frame.paste(p, (0, 0))
            c = frame
        t = c.copy()
        t.thumbnail((640, 640), Image.LANCZOS)
        d = ImageDraw.Draw(t, 'RGBA')
        w, h = t.size
        if tag == 'desktop':
            d.rectangle((0, 0, int(w * .55), h), fill=(255, 0, 0, 38))
            d.line((int(w * .55), 0, int(w * .55), h), fill=(255, 80, 80, 200), width=2)
        else:
            d.rectangle((0, int(h * .55), w, h), fill=(255, 0, 0, 38))
            d.line((0, int(h * .55), w, int(h * .55)), fill=(255, 80, 80, 200), width=2)
        d.text((6, 4), f'{tag} {name}', fill=(255, 230, 150, 255))
        tiles.append(t)
    W = sum(t.size[0] for t in tiles[:5]) + 50
    rowh = [max(t.size[1] for t in tiles[:5]), max(t.size[1] for t in tiles[5:])]
    out = Image.new('RGB', (max(W, sum(t.size[0] for t in tiles[5:]) + 50), sum(rowh) + 30), (30, 30, 34))
    x, y = 5, 5
    for i, t in enumerate(tiles):
        if i == 5:
            x, y = 5, rowh[0] + 20
        out.paste(t, (x, y))
        x += t.size[0] + 10
    out.save(os.path.join(HERE, 'crops-preview.jpg'), quality=85)
    print('preview ->', os.path.join(HERE, 'crops-preview.jpg'))


if __name__ == '__main__':
    main()
