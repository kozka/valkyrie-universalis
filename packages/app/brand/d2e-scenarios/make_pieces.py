# Descent's scenario screens in the Universalis theme (themes/universalis/scenarios.css, its Descent part): kozka's
# frames (brand/d2e-scenarios/frames.png, 1672x941, on transparent) cut into the pieces the stylesheet stretches as
# windows of old were made (border-image), the ornaments at the middle of the title and the card apart, so that those
# can stretch; and his cave behind it all, darker. Run from brand/d2e-scenarios/: python make_pieces.py <assets folder>
import sys
import numpy as np
import cv2
from PIL import Image

OUT = sys.argv[1] if len(sys.argv) > 1 else '.'
F = np.asarray(Image.open('frames.png').convert('RGBA')).astype(np.float32)

def save(arr, name, q=92, lossless=False):
    im = Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8))
    im.save(f'{OUT}/{name}', 'WEBP', quality=q, lossless=lossless, method=6)
    print(name, im.size)

def crop(arr, x0, y0, x1, y1):
    return arr[y0:y1, x0:x1].copy()

def tile_columns(arr, x0, x1, y0, y1, sx0, sx1, blend=12):
    """Columns x0..x1, rows y0..y1, painted over with the plain strip sx0..sx1 of the same rows, repeated, blended."""
    strip = arr[y0:y1, sx0:sx1].copy()
    w = sx1 - sx0
    out = np.zeros((y1 - y0, x1 - x0 + w, 4), np.float32)
    wt = np.zeros((y1 - y0, x1 - x0 + w, 1), np.float32)
    ramp = np.ones(w, np.float32)
    ramp[:blend] = np.linspace(0.05, 1, blend)
    ramp[-blend:] = np.linspace(1, 0.05, blend)
    x = 0
    while x < x1 - x0:
        out[:, x:x + w] += strip * ramp[None, :, None]
        wt[:, x:x + w] += ramp[None, :, None]
        x += w - blend
    fill = (out / np.maximum(wt, 1e-3))[:, :x1 - x0]
    m = np.ones(x1 - x0, np.float32)
    m[:blend] = np.linspace(0, 1, blend)
    m[-blend:] = np.linspace(1, 0, blend)
    arr[y0:y1, x0:x1] = arr[y0:y1, x0:x1] * (1 - m[None, :, None]) + fill * m[None, :, None]

def ornament(orig, clean, x0, y0, x1, y1):
    """What the ornament adds to the clean frame: the original where it differs, soft at its edge."""
    o = crop(orig, x0, y0, x1, y1)
    c = crop(clean, x0, y0, x1, y1)
    d = np.abs(o[..., :3] * o[..., 3:] / 255 - c[..., :3] * c[..., 3:] / 255).max(2) + np.abs(o[..., 3] - c[..., 3])
    m = (d > 34).astype(np.uint8)
    m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, np.ones((7, 7), np.uint8))
    n, lab, st, _ = cv2.connectedComponentsWithStats(m)
    keep = 1 + int(np.argmax(st[1:, cv2.CC_STAT_AREA]))
    m = (lab == keep).astype(np.uint8)
    m = cv2.dilate(m, np.ones((5, 5), np.uint8))
    m = cv2.GaussianBlur(m.astype(np.float32), (0, 0), 1.2)
    o[..., 3] *= np.clip(m, 0, 1)
    return o

# The title's banner without its hammer and its gem, and those apart
title = F.copy()
tile_columns(title, 700, 975, 14, 241, 560, 640)
save(crop(title, 305, 14, 1366, 241), 'd2e-scenario-title.webp')
save(ornament(F, title, 700, 14, 975, 140), 'd2e-scenario-title-crest.webp')
save(ornament(F, title, 785, 160, 890, 241), 'd2e-scenario-title-medal.webp')

# The card without the ornaments at the middle of its top and bottom, nor the red button inside it
card = F.copy()
# Its top and bottom edges plain from corner to corner (kozka, 2 November 2026: no ornaments along them), so that
# they stretch to any width as a straight rail
tile_columns(card, 165, 1508, 416, 530, 465, 575)
tile_columns(card, 165, 1508, 828, 915, 465, 575)
src = card[570:770, 500:950].copy()
m = np.zeros((200, 450), np.float32)
m[30:-30, 30:420] = 1
m = cv2.GaussianBlur(m, (0, 0), 10)
m[45:-45, 60:400] = 1
m = m[..., None]
card[570:770, 1145:1595] = card[570:770, 1145:1595] * (1 - m) + src * m
alpha = (card[..., 3] > 10).astype(np.uint8)
n, lab, st, _ = cv2.connectedComponentsWithStats(alpha[416:915, 15:1658])
own = (lab == 1 + int(np.argmax(st[1:, cv2.CC_STAT_AREA]))).astype(np.float32)
own = cv2.dilate(own, np.ones((3, 3), np.uint8))
card[416:915, 15:1658, 3] *= own
save(crop(card, 15, 416, 1658, 915), 'd2e-scenario-card.webp')
save(ornament(F, card, 735, 416, 940, 530), 'd2e-scenario-card-top.webp')
save(ornament(F, card, 755, 830, 920, 915), 'd2e-scenario-card-bottom.webp')

# The buttons and fields
save(crop(F, 16, 81, 277, 193), 'd2e-scenario-button-red.webp')
save(crop(F, 20, 330, 414, 420), 'd2e-scenario-button.webp')
save(crop(F, 183, 247, 917, 326), 'd2e-scenario-textbox.webp')
save(crop(F, 930, 241, 1033, 337), 'd2e-scenario-square.webp')
save(crop(F, 1047, 247, 1349, 333), 'd2e-scenario-select.webp')

# The cave, darker still, behind the screens
cave = np.asarray(Image.open('cave.png').convert('RGB')).astype(np.float32) / 255
save(0.8 * cave ** 1.25 * 255, 'd2e-scenario-cave.webp', q=86)
