"""The office's own photos as the home screen's backgrounds (with home_layout=office).

    python tools/office_photos.py [folder]      (default: web/backgrounds/AlAhyaa)

Makes a 1920-wide JPEG of each photo, softened (less color, a light blur), in app/assets/backgrounds.local/, and backgrounds.json there with how bright each
may stay ("keep": the share of light its dark layer lets through), so text reads on sunny photos as on the others.
custom_build.py packs them instead of web/backgrounds when they're there (never in a --generic build). Needs Pillow.
Run it again after adding or removing photos. Both folders are git-ignored: the photos are the person's.
"""
import json
import os
import sys

from PIL import Image, ImageEnhance, ImageFilter, ImageOps, ImageStat

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'app', 'assets', 'backgrounds.local')
TARGET = 85   # the middle band's brightness (0-255) after the dark layer, about that of the Unsplash set
# Drone shots of courts and pools are busy and bright: softened once here (no cost on the TV) so the text, the logo and
# the row stay the eye's first stop, in both looks.
SATURATION = 0.6
BLUR = 3


def main():
    src = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, 'web', 'backgrounds', 'AlAhyaa')
    os.makedirs(OUT, exist_ok=True)
    for old in os.listdir(OUT):
        os.remove(os.path.join(OUT, old))
    listed = []
    for name in sorted(os.listdir(src)):
        if not name.lower().endswith(('.jpg', '.jpeg', '.png')):
            continue
        im = Image.open(os.path.join(src, name))
        im.draft('RGB', (1920, 1920))   # JPEG decodes at a fraction of its size: much faster
        im = ImageOps.exif_transpose(im).convert('RGB')
        im = im.resize((1920, round(im.height * 1920 / im.width)), Image.LANCZOS)
        im = ImageEnhance.Color(im).enhance(SATURATION).filter(ImageFilter.GaussianBlur(BLUR))
        g = im.convert('L').resize((192, round(im.height / 10)))
        mid = ImageStat.Stat(g.crop((0, g.height // 5, 192, g.height * 4 // 5))).mean[0]
        keep = round(max(0.55, min(1.0, TARGET / mid)), 2)
        base = os.path.splitext(name)[0]
        im.save(os.path.join(OUT, base + '.jpg'), quality=82, optimize=True, progressive=True)
        listed.append([base, keep])
        print('%s  %d KB  keep %.2f' % (base, os.path.getsize(os.path.join(OUT, base + '.jpg')) // 1024, keep))
    with open(os.path.join(OUT, 'backgrounds.json'), 'w', encoding='utf-8') as f:
        json.dump(listed, f)
    print('%d photos in %s' % (len(listed), OUT))


if __name__ == '__main__':
    main()
