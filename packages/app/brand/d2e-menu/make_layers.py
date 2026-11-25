# Descent's main menu backdrop in the Universalis theme, "Dwarven Runestone" (2 November 2026): kozka's dwarven hall
# (brand/d2e-menu/full.png, 1672x940), its banners apart (banners/, at the picture's size), the hall without them and
# without its blue fires (clean-fog.png) and without its mist (clean.png), all aligned within a pixel. From them the
# layers that themes/universalis/runeHallArt.ts moves: the hall with its banners, fires, runes and mist taken out, the
# banners, the fires and the runes alone, and where the falls are. Run from brand/d2e-menu/:
# python make_layers.py <assets folder>
import sys
import numpy as np
import cv2
from PIL import Image

OUT = sys.argv[1] if len(sys.argv) > 1 else '.'
W, H = 1672, 940

def rgb(name):
    return np.asarray(Image.open(name).convert('RGB').resize((W, H), Image.LANCZOS)).astype(np.float32)

def rgba(name):
    return np.asarray(Image.open(name).convert('RGBA')).astype(np.float32)

def save(arr, name, q=90):
    im = Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8))
    im.save(f'{OUT}/{name}', 'WEBP', quality=q, method=6)
    print(name, im.size)

def part(arr, name, pad=2, q=90):
    ys, xs = np.where(arr[..., 3] > 4)
    x0, y0 = max(0, xs.min() - pad), max(0, ys.min() - pad)
    x1, y1 = min(W, xs.max() + 1 + pad), min(H, ys.max() + 1 + pad)
    save(arr[y0:y1, x0:x1], name, q)
    print('  at', x0, y0)

full, fog = rgb('full.png'), rgb('clean-fog.png')
lum = lambda a: a @ np.array([0.3, 0.59, 0.11], np.float32)
ys, xs = np.mgrid[0:H, 0:W]
save(full, 'd2e-menu-full.webp', 88)

# The blue fires and the glowing runes: where the full hall is bluer and brighter than the one without them
d = full - fog
blue = np.clip((d[..., 2] - 25) / 70, 0, 1) * np.clip((full[..., 2] - full[..., 0] - 30) / 60, 0, 1)
blue = cv2.GaussianBlur(blue, (0, 0), 1.2)
ys, xs = np.mgrid[0:H, 0:W]
door = ((xs > 1195) & (xs < 1460) & (ys > 140) & (ys < 560)).astype(np.float32)
runes = blue * door
# The braziers: their flames and the light just round them
BRAZIERS = [(461, 478), (793, 513), (901, 522), (1020, 518), (1124, 514), (1205, 494), (1431, 492), (1491, 607)]
near = np.zeros((H, W), np.float32)
for bx, by in BRAZIERS:
    near = np.maximum(near, np.clip(1 - np.hypot((xs - bx) / 30, (ys - by + 12) / 38), 0, 1))
fires = np.clip((full[..., 2] - full[..., 0] - 40) / 60, 0, 1) * np.clip((lum(full) - 50) / 70, 0, 1) * np.clip(near * 3, 0, 1)
fires = cv2.GaussianBlur(fires, (0, 0), 0.8)
save(np.dstack([full, runes * 255])[130:570, 1185:1470], 'd2e-menu-runes.webp')
print('  at 1185 130')
part(np.dstack([full, fires * 255]), 'd2e-menu-fires.webp')

# The banners, and the hall without them (its own copy without banners under them, widened a little)
banners = rgba('banners/00_todos_los_estandartes.png')
cloth = (banners[..., 3] > 8).astype(np.uint8)
ell = lambda r: cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (r, r))
under = cv2.dilate(cloth, ell(21)).astype(np.float32)
# The hall without banners, matched in colour to the full one round each banner (they were rendered apart)
ring = (cv2.dilate(cloth, ell(41)) > 0) & ~(cv2.dilate(cloth, ell(23)) > 0)
n, lab, st, _ = cv2.connectedComponentsWithStats(cv2.dilate(cloth, ell(41)))
matched = fog.copy()
for i in range(1, n):
    r = ring & (lab == i)
    k = (full[r].mean(0) + 1) / (fog[r].mean(0) + 1)
    matched[lab == i] = fog[lab == i] * k
under = cv2.GaussianBlur(under, (0, 0), 3)[..., None]
lights = cv2.GaussianBlur(np.maximum(runes, fires), (0, 0), 3)[..., None].clip(0, 1)
base = full * (1 - under) + matched * under
# Under the fires and runes, the hall without them, so that they can dim
base = base * (1 - lights) + full * 0.35 * lights

# The mist stays painted in the hall; the drawing drifts more over it (runeHallArt.ts)
save(base, 'd2e-menu-base.webp', 88)

for name, file in (('left', '01_estandarte_izquierdo'), ('red', '02_estandarte_rojo_central'), ('small', '03_estandarte_azul_pequeno'), ('right', '04_estandarte_derecho')):
    part(rgba(f'banners/{file}.png'), f'd2e-menu-banner-{name}.webp')

# The falls: their bright pale water in their boxes, as alpha, for the water to run down
falls = np.zeros((H, W), np.float32)
for x0, y0, x1, y1 in ((960, 40, 1105, 370), (895, 360, 995, 560), (865, 595, 970, 795), (1105, 715, 1185, 835)):
    box = full[y0:y1, x0:x1]
    l = lum(box)
    sat = box.max(2) - box.min(2)
    falls[y0:y1, x0:x1] = np.clip((l - 60) / 60, 0, 1) * np.clip((90 - sat) / 40, 0, 1)
falls = cv2.GaussianBlur(falls, (0, 0), 2) * (1 - under[..., 0])
part(np.dstack([np.full((H, W, 3), 255, np.float32), falls * 255]), 'd2e-menu-falls.webp', q=85)
