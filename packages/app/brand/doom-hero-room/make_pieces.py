# DooM's hero selection in the Universalis theme (DescentHeroRoom.tsx, its DooM look): kozka's frames for it
# (brand/doom-hero-room/frames.png, 1671x941, on transparent) cut into the pieces the screen lays out, the glow of their
# lights alone (for the screen to flicker), and the ship's room behind them (room.png, already without frames).
# Run from brand/doom-hero-room/: python make_pieces.py <assets folder>
import sys
import numpy as np
import cv2
from PIL import Image

OUT = sys.argv[1] if len(sys.argv) > 1 else '.'
F = np.asarray(Image.open('frames.png').convert('RGBA')).astype(np.float32)
H, W = F.shape[:2]

def save(arr, name, q=92, lossless=False):
    im = arr if isinstance(arr, Image.Image) else Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8))
    im.save(f'{OUT}/{name}', 'WEBP', quality=q, lossless=lossless, method=6)
    print(name, im.size)

def crop(arr, x0, y0, x1, y1):
    return arr[y0:y1, x0:x1].copy()

def glow(arr):
    """The lights of a piece alone: its hot orange pixels, as themselves on transparent."""
    r, g, b = arr[..., 0], arr[..., 1], arr[..., 2]
    a = np.clip((r - 170) / 60, 0, 1) * np.clip((r - b - 90) / 60, 0, 1) * (arr[..., 3] / 255)
    a = cv2.GaussianBlur(a, (0, 0), 1.2)
    return np.dstack([arr[..., :3], a * 255])

# Stone of a sort: the grain of the Back button's inside, in mirrored tiles, coloured as the frames' dark metal
SRC = F[815:885, 140:410, :3]

def grime(w, h, base=(27, 21, 18), amount=0.3):
    src = cv2.resize(SRC, (int(SRC.shape[1] * 1.3), int(SRC.shape[0] * 1.3)), interpolation=cv2.INTER_CUBIC)
    th, tw = src.shape[:2]
    reps_x, reps_y = w // (tw - 30) + 2, h // (th - 20) + 2
    canvas = np.zeros(((th - 20) * reps_y + 20, (tw - 30) * reps_x + 30, 3), np.float32)
    weight = np.zeros(canvas.shape[:2] + (1,), np.float32)
    rx = np.ones(tw, np.float32); rx[:30] = np.linspace(0, 1, 30); rx[-30:] = np.linspace(1, 0, 30)
    ry = np.ones(th, np.float32); ry[:20] = np.linspace(0, 1, 20); ry[-20:] = np.linspace(1, 0, 20)
    ramp = ry[:, None, None] * rx[None, :, None] + 1e-4
    for j in range(reps_y):
        for i in range(reps_x):
            t = src[::(-1 if j % 2 else 1), ::(-1 if i % 2 else 1)]
            y, x = j * (th - 20), i * (tw - 30)
            canvas[y:y + th, x:x + tw] += t * ramp
            weight[y:y + th, x:x + tw] += ramp
    tex = (canvas / np.maximum(weight, 1e-3))[:h, :w]
    lum = tex @ np.array([0.3, 0.59, 0.11], np.float32)
    lum = (lum - lum.mean()) / (lum.std() + 1e-3)
    return np.array(base, np.float32)[None, None, :] * (1 + amount * lum[..., None])

def fill_inside(arr, x0, y0, x1, y1, feather=3, dark_middle=True):
    """Paints the box with grime, blended in at its edges, opaque."""
    w, h = x1 - x0, y1 - y0
    tex = grime(w, h)
    if dark_middle:
        yy = np.linspace(-1, 1, h)[:, None, None]
        tex *= 0.85 + 0.25 * np.abs(yy) ** 2
        tex += (np.abs(yy) ** 8) * np.array([60, 14, 2], np.float32)
    m = np.zeros(arr.shape[:2], np.float32)
    m[y0:y1, x0:x1] = 1
    m = cv2.GaussianBlur(m, (0, 0), feather)
    m[y0 + feather:y1 - feather, x0 + feather:x1 - feather] = 1
    full = arr[..., :3].copy()
    full[y0:y1, x0:x1] = tex
    arr[..., :3] = arr[..., :3] * (1 - m[..., None]) + full * m[..., None]
    arr[..., 3] = np.maximum(arr[..., 3], m * 255)

# The title's banner, its hole filled with dark metal for the words
title = F.copy()
fill_inside(title, 458, 50, 1180, 142, feather=4, dark_middle=False)
t = crop(title, 316, 10, 1350, 178)
save(t, 'doom-heroes-title.webp')
save(glow(crop(F, 316, 10, 1350, 178)), 'doom-heroes-title-glow.webp')

# The eight frames, a sheet; their glow, a sheet of the same size
rings = crop(F, 259, 194, 1411, 765)
save(rings, 'doom-heroes-rings.webp')
save(glow(rings), 'doom-heroes-rings-glow.webp')

# A portrait's shape: the first frame's hole, widened by 5 pixels to go under the metal, white on transparent
a = F[..., 3] > 128
from scipy import ndimage
hole = ndimage.binary_fill_holes(a[230:420, 300:500]) & ~a[230:420, 300:500]
lab, n = ndimage.label(hole)
sizes = ndimage.sum(hole, lab, range(1, n + 1))
hole = lab == (1 + int(np.argmax(sizes)))
ys, xs = np.where(hole)
print('hole box', 300 + xs.min(), 230 + ys.min(), 300 + xs.max() + 1, 230 + ys.max() + 1)
hm = hole[ys.min():ys.max() + 1, xs.min():xs.max() + 1].astype(np.uint8)
hm = np.pad(hm, 6)
hm = cv2.dilate(hm, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (11, 11)))
hm = cv2.GaussianBlur(hm.astype(np.float32) * 255, (0, 0), 1)
save(np.dstack([np.full(hm.shape + (3,), 255, np.float32), hm]), 'doom-heroes-hole.webp', lossless=True)

# The arrows
save(crop(F, 136, 364, 256, 604), 'doom-heroes-previous.webp')
save(crop(F, 1417, 364, 1535, 604), 'doom-heroes-next.webp')

# The bar: Back, Confirm (their glow too) and the plate between them, emptied for any number of circles
save(crop(F, 8, 767, 466, 936), 'doom-heroes-back.webp')
save(glow(crop(F, 8, 767, 466, 936)), 'doom-heroes-back-glow.webp')
save(crop(F, 1205, 767, 1663, 936), 'doom-heroes-confirm.webp')
save(glow(crop(F, 1205, 767, 1663, 936)), 'doom-heroes-confirm-glow.webp')
plate = F.copy()
fill_inside(plate, 468, 798, 1196, 901)
save(crop(plate, 455, 767, 1216, 936), 'doom-heroes-plate.webp')

def disc(cx, cy, r_in, r_out, size, hollow_r=None):
    half = size // 2
    c = F[cy - half:cy - half + size, cx - half:cx - half + size].copy()
    yy, xx = np.mgrid[0:size, 0:size]
    d = np.hypot(xx - half + 0.5, yy - half + 0.5)
    al = np.clip((r_out - d) / (r_out - r_in), 0, 1)
    if hollow_r is not None:
        al *= np.clip((d - hollow_r) / 1.5, 0, 1)
    c[..., 3] *= al
    return c

save(disc(548, 850, 58, 66, 136), 'doom-heroes-circle-lit.webp')
save(disc(1118, 850, 53, 58, 124), 'doom-heroes-circle-dark.webp')
save(disc(548, 850, 58, 66, 136, hollow_r=46), 'doom-heroes-ring-lit.webp')
save(disc(1118, 850, 53, 58, 124, hollow_r=45), 'doom-heroes-ring-dark.webp')
d = F[850 - 18:850 + 18, 617 - 18:617 + 18].copy()
yy, xx = np.mgrid[0:36, 0:36]
dd = np.abs(xx - 17.5) + np.abs(yy - 17.5)
d[..., 3] *= np.clip((19 - dd) / 4, 0, 1)
save(d, 'doom-heroes-diamond.webp')

# The room, at the frames' size; and where its great window is, as alpha, for what happens outside
room = Image.open('room.png').convert('RGB').resize((1672, 941), Image.LANCZOS)
save(room, 'doom-heroes-room.webp', q=88)
r = np.asarray(room).astype(np.float32)
R, B = r[..., 0], r[..., 2]
m = ((R > 55) & (R > B * 1.25)).astype(np.uint8)
m[:, :1235] = 0
m[640:] = 0
m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, np.ones((25, 25), np.uint8))
m = cv2.morphologyEx(m, cv2.MORPH_OPEN, np.ones((9, 9), np.uint8))
n, lab, st, _ = cv2.connectedComponentsWithStats(m)
m = (lab == 1 + np.argmax(st[1:, cv2.CC_STAT_AREA])).astype(np.float32)
m = cv2.GaussianBlur(m, (0, 0), 3)[0:640, 1235:1672]
save(np.dstack([np.full(m.shape + (3,), 255, np.float32), m * 255]), 'doom-heroes-window.webp', q=80)
