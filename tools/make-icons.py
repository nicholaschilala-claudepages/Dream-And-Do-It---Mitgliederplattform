#!/usr/bin/env python3
"""Erzeugt die App-Icons aus dem Logo-Zeichen (Originalfarben auf weißem Grund).

Aufruf:  python3 tools/make-icons.py icons/logo-mark-light.png
(erzeugt von tools/make-logo-assets.py). Das Zeichen wird mittig auf Weiß gesetzt,
weil das dunkelblaue Tropfen-Element auf einem dunklen Grund verschwinden würde:
  icons/icon-192.png, icon-512.png   (purpose "any", Zeichen ~72 % der Höhe)
  icons/icon-maskable-512.png        (purpose "maskable", Zeichen im Safe-Zone-Kreis, ~56 %)
  icons/apple-touch-icon.png (180)   (iOS, deckend)
  icons/favicon-32.png, favicon-48.png
"""
import sys
from PIL import Image
BG = (255, 255, 255)

def compose(mark, size, frac):
    # Zuschnitt auf das Zeichen (alles, was nicht fast weiß ist)
    g = mark.convert('L').point(lambda v: 255 if v < 240 else 0)
    m = mark.crop(g.getbbox())
    scale = size * frac / max(m.size)
    m = m.resize((max(1, round(m.width * scale)), max(1, round(m.height * scale))), Image.LANCZOS)
    img = Image.new('RGB', (size, size), BG)
    img.paste(m, ((size - m.width) // 2, (size - m.height) // 2))
    return img

def main(src):
    mark = Image.open(src).convert('RGB')
    out = {
        'icons/icon-192.png': (192, 0.74),
        'icons/icon-512.png': (512, 0.74),
        'icons/icon-maskable-512.png': (512, 0.56),
        'icons/apple-touch-icon.png': (180, 0.74),
        'icons/favicon-32.png': (32, 0.86),
        'icons/favicon-48.png': (48, 0.86),
    }
    for path, (size, frac) in out.items():
        compose(mark, size, frac).save(path, optimize=True)
        print('ok', path)

if __name__ == '__main__':
    main(sys.argv[1])
