#!/usr/bin/env python3
"""Erzeugt die Logo-Dateien der Plattform aus dem Original-Logo (JPG/PNG auf weißem Grund).

Aufruf:  python3 tools/make-logo-assets.py <logo-original.jpg>

Ergebnis in icons/:
  logo-full.png          Vollversion auf hellem Grund (weißer Hintergrund)
  logo-full-darkbg.png   Vollversion für dunkle Flächen (transparent; das dunkelblaue
                         Tropfen-Element und die Tagline werden hell, Gold bleibt)
  logo-mark.png          nur das runde Zeichen für dunkle Flächen (Kopfzeile)
  logo-mark-badge.png    nur das Zeichen in Originalfarben, klein (Kopfzeile, weißes Badge per CSS)
  logo-mark-light.png    nur das runde Zeichen, Originalfarben, weißer Grund (Quelle für App-Icons)
Danach:  python3 tools/make-icons.py icons/logo-mark-light.png
"""
import sys
import numpy as np
from PIL import Image

CREAM = np.array([243, 238, 230], dtype=np.float32)

def load(path):
    return Image.open(path).convert('RGB')

def to_rgba_for_dark(rgb):
    """Weißen Grund in Transparenz umrechnen, Blautöne (Navy) in Creme."""
    a = np.asarray(rgb).astype(np.float32)
    mn = a.min(axis=2)
    alpha = np.clip((250.0 - mn) / 60.0, 0.0, 1.0)
    # Randpixel von Weiß "entmischen", damit auf dunklem Grund keine hellen Säume entstehen
    safe = np.maximum(alpha, 1e-3)[..., None]
    col = np.clip((a - (1.0 - alpha)[..., None] * 255.0) / safe, 0, 255)
    navy = np.clip((col[..., 2] - col[..., 0] - 10.0) / 30.0, 0.0, 1.0)[..., None]
    col = col * (1.0 - navy) + CREAM * navy
    out = np.dstack([col, alpha * 255.0]).astype(np.uint8)
    return Image.fromarray(out, 'RGBA')

def fg_bbox(rgb, thresh=235, region=None):
    a = np.asarray(rgb).astype(np.float32)
    mask = a.min(axis=2) < thresh
    if region:
        x0, y0, x1, y1 = region
        m2 = np.zeros_like(mask); m2[y0:y1, x0:x1] = mask[y0:y1, x0:x1]; mask = m2
    ys, xs = np.where(mask)
    return xs.min(), ys.min(), xs.max() + 1, ys.max() + 1

def main(src):
    rgb = load(src)
    W, H = rgb.size
    # Gesamtlogo zuschneiden (Rand ~4 %)
    x0, y0, x1, y1 = fg_bbox(rgb)
    pad = int(0.04 * (x1 - x0))
    full_box = (max(0, x0 - pad), max(0, y0 - pad), min(W, x1 + pad), min(H, y1 + pad))
    full = rgb.crop(full_box)
    # Zeichen: Bereich oberhalb der Wortmarke (Zeilen-Lücke zwischen Zeichen und Schrift suchen)
    a = np.asarray(rgb).astype(np.float32).min(axis=2) < 235
    rows = a.sum(axis=1)
    gap_rows = [y for y in range(y0, y1) if rows[y] == 0]
    # erste Leerzeile nach dem Zeichen (unterhalb der Hälfte des Zeichens, oberhalb der Schrift)
    first_text = None
    for y in range(int(y0 + 0.3 * (y1 - y0)), y1):
        if rows[y] == 0:
            first_text = y; break
    mark_y1 = first_text if first_text else int(y0 + 0.62 * (y1 - y0))
    mx0, my0, mx1, my1 = fg_bbox(rgb, region=(0, 0, W, mark_y1))
    mpad = int(0.05 * (mx1 - mx0))
    mark_box = (max(0, mx0 - mpad), max(0, my0 - mpad), min(W, mx1 + mpad), min(H, my1 + mpad))
    mark = rgb.crop(mark_box)

    def scaled(img, width):
        h = round(img.height * width / img.width)
        return img.resize((width, h), Image.LANCZOS)

    scaled(full, 1000).save('icons/logo-full.png', optimize=True)
    to_rgba_for_dark(full).resize((1000, round(full.height * 1000 / full.width)), Image.LANCZOS).save('icons/logo-full-darkbg.png', optimize=True)
    to_rgba_for_dark(mark).resize((320, round(mark.height * 320 / mark.width)), Image.LANCZOS).save('icons/logo-mark.png', optimize=True)
    scaled(mark, 1024).save('icons/logo-mark-light.png', optimize=True)
    scaled(mark, 300).save('icons/logo-mark-badge.png', optimize=True)  # Kopfzeile: Originalfarben auf weißem Badge
    print('ok', full_box, mark_box)

if __name__ == '__main__':
    main(sys.argv[1])
