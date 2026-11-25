# Descent's hero selection in the Universalis theme (DescentHeroRoom.tsx), "Dwarven Runestone" (2 November 2026):
# kozka's frames (frames.png, 1672x941, on transparent, at the room's own size and place) cut into the pieces the
# screen lays out, and his dwarven hall (room-lit.png, room-dark.png) with its layers (layers/: the left brazier's
# flame, the glow of the runes on the two columns, the two banners) prepared for descentRoomArt.ts: the banners painted
# out of the room so that they can sway, the flames and the runes out of the lit room so that they burn and pulse alone.
# Run from brand/d2e-hero-room/: python make_pieces.py <assets folder>
import sys
import numpy as np
import cv2
from PIL import Image

OUT = sys.argv[1] if len(sys.argv) > 1 else '.'
F = np.asarray(Image.open('frames.png').convert('RGBA')).astype(np.float32)
H, W = F.shape[:2]
rng = np.random.default_rng(3)

def load(name):
    return np.asarray(Image.open(name).convert('RGBA')).astype(np.float32)

def save(arr, name, q=92, lossless=False):
    im = Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8))
    im.save(f'{OUT}/{name}', 'WEBP', quality=q, lossless=lossless, method=6)
    print(name, im.size)

def crop(a, x0, y0, x1, y1):
    return a[y0:y1, x0:x1].copy()

# The title's banner, without the page dots under it
save(crop(F, 299, 8, 1372, 155), 'd2e-heroes-title.webp')

# The eight rings with their name plates, a sheet the screen cuts in tiles; without the page dots and the bar's hammer
rings = F.copy()
rings[148:186, 755:915, 3] = 0
rings[676:700, 790:880, 3] = 0
save(crop(rings, 301, 171, 1369, 700), 'd2e-heroes-rings.webp')

save(crop(F, 183, 325, 292, 543), 'd2e-heroes-previous.webp')
save(crop(F, 1381, 325, 1489, 543), 'd2e-heroes-next.webp')

# The bar: Back, Confirm, and the plate between them with an empty inside, so that it takes any number of circles
bar = F.copy()
bar[:676] = 0
bar[676:700, :790, 3] = 0
bar[676:700, 880:, 3] = 0
save(crop(bar, 11, 676, 412, 936), 'd2e-heroes-back.webp')
save(crop(bar, 1292, 676, 1662, 936), 'd2e-heroes-confirm.webp')
plate = bar.copy()
X0, X1, Y0, Y1 = 456, 1250, 757, 903
h, w = Y1 - Y0, X1 - X0
tile = sum(cv2.GaussianBlur(rng.normal(0, 1, (h, w)).astype(np.float32), (0, 0), sg) * k for sg, k in ((0.7, 0.5), (2.5, 1.2), (10, 1.6)))
tile = (tile - tile.mean()) / (tile.std() + 1e-3)
base = np.array([34, 37, 42], np.float32)
yy = np.abs(np.linspace(-1, 1, Y1 - Y0))[:, None, None]
fill = base * (1 + 0.16 * tile[..., None]) * (0.85 + 0.25 * yy ** 2)
m = np.zeros((H, W), np.float32)
m[Y0:Y1, X0:X1] = 1
m = cv2.GaussianBlur(m, (0, 0), 3)
m[Y0 + 5:Y1 - 5, X0 + 5:X1 - 5] = 1
full = plate[..., :3].copy()
full[Y0:Y1, X0:X1] = fill
plate[..., :3] = plate[..., :3] * (1 - m[..., None]) + full * m[..., None]
plate[..., 3] = np.maximum(plate[..., 3], m * 255)
# The first circle's blue glow spills on the plate's left border: grey there, as the rest of the stone
strip = plate[750:910, 455:500, :3]
lum = strip @ np.array([0.3, 0.59, 0.11], np.float32)
blue = np.clip((strip[..., 2] - strip[..., 0] - 25) / 40, 0, 1)[..., None]
plate[750:910, 455:500, :3] = strip * (1 - blue) + (lum[..., None] * np.array([0.95, 1, 1.08], np.float32)) * blue
save(crop(plate, 405, 676, 1300, 936), 'd2e-heroes-plate.webp')

def disc(cx, cy, r_in, r_out, size, hollow=None):
    half = size // 2
    c = F[cy - half:cy - half + size, cx - half:cx - half + size].copy()
    yy, xx = np.mgrid[0:size, 0:size]
    d = np.hypot(xx - half + 0.5, yy - half + 0.5)
    a = np.clip((r_out - d) / (r_out - r_in), 0, 1)
    if hollow is not None:
        a *= np.clip((d - hollow) / 1.5, 0, 1)
    c[..., 3] *= a
    return c

save(disc(534, 824, 64, 68, 140), 'd2e-heroes-circle-lit.webp')
save(disc(990, 824, 59, 63, 128), 'd2e-heroes-circle-dark.webp')
save(disc(534, 824, 64, 68, 140, hollow=53), 'd2e-heroes-ring-lit.webp')
save(disc(990, 824, 59, 63, 128, hollow=51), 'd2e-heroes-ring-dark.webp')
d = F[824 - 18:824 + 18, 608 - 18:608 + 18].copy()
yy, xx = np.mgrid[0:36, 0:36]
d[..., 3] *= np.clip((19 - (np.abs(xx - 17.5) + np.abs(yy - 17.5))) / 3, 0, 1)
save(d, 'd2e-heroes-diamond.webp')

# The room
lit = np.asarray(Image.open('room-lit.png').convert('RGB')).astype(np.float32)
dark = np.asarray(Image.open('room-dark.png').convert('RGB')).astype(np.float32)
layer = {n: load(f'layers/{n}.png') for n in ('01_llama_brasero_izquierdo', '02a_brillo_runas_izquierda', '02b_brillo_runas_derecha', '03_estandarte_izquierdo', '04_estandarte_derecho')}

# The right brazier's flame, which has no layer: its blue light over the dark room, above the bowl
fx0, fy0, fx1, fy1 = 1300, 400, 1405, 505
diff = (lit - dark)[fy0:fy1, fx0:fx1]
blue = np.clip((diff[..., 2] - 60) / 90, 0, 1) * np.clip((diff[..., 2] - diff[..., 0] - 30) / 60, 0, 1)
blue = cv2.GaussianBlur(blue, (0, 0), 0.8)
right = np.zeros((H, W, 4), np.float32)
right[fy0:fy1, fx0:fx1, :3] = lit[fy0:fy1, fx0:fx1]
right[fy0:fy1, fx0:fx1, 3] = blue * 255
layer['flame_right'] = right

def alpha(a, grow=0, blur=0):
    m = (a[..., 3] > 8).astype(np.uint8)
    if grow:
        m = cv2.dilate(m, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (grow * 2 + 1, grow * 2 + 1)))
    m = m.astype(np.float32)
    return cv2.GaussianBlur(m, (0, 0), blur) if blur else m

# The banners painted out of both rooms (they sway over it); the flames and the runes out of the lit one
banners = np.maximum(alpha(layer['03_estandarte_izquierdo'], 7), alpha(layer['04_estandarte_derecho'], 7))
def paint_out(img, mask):
    small = cv2.resize(img.astype(np.uint8), None, fx=0.5, fy=0.5, interpolation=cv2.INTER_AREA)
    ms = cv2.resize((mask > 0.5).astype(np.uint8) * 255, None, fx=0.5, fy=0.5, interpolation=cv2.INTER_NEAREST)
    filled = cv2.inpaint(small, ms, 9, cv2.INPAINT_TELEA)
    up = cv2.resize(filled, (W, H), interpolation=cv2.INTER_CUBIC).astype(np.float32)
    up += cv2.GaussianBlur(rng.normal(0, 1, (H, W)).astype(np.float32), (0, 0), 0.8)[..., None] * 3
    soft = cv2.GaussianBlur(mask, (0, 0), 2)[..., None]
    return img * (1 - soft) + up * soft
dark = paint_out(dark, banners)
lit = paint_out(lit, banners)
alone = np.maximum.reduce([alpha(layer[n], 3, 2) for n in ('01_llama_brasero_izquierdo', 'flame_right', '02a_brillo_runas_izquierda', '02b_brillo_runas_derecha')])[..., None]
lit_out = lit * (1 - alone) + dark * alone
save(dark, 'd2e-heroes-room.webp', q=88)
save(lit_out, 'd2e-heroes-room-lit.webp', q=86)

def part(a, name, pad=2):
    ys, xs = np.where(a[..., 3] > 4)
    x0, y0, x1, y1 = max(0, xs.min() - pad), max(0, ys.min() - pad), min(W, xs.max() + 1 + pad), min(H, ys.max() + 1 + pad)
    save(crop(a, x0, y0, x1, y1), name, q=90)
    print('  at', x0, y0)

part(layer['01_llama_brasero_izquierdo'], 'd2e-heroes-flame-left.webp')
part(layer['flame_right'], 'd2e-heroes-flame-right.webp')
part(layer['02a_brillo_runas_izquierda'], 'd2e-heroes-runes-left.webp')
part(layer['02b_brillo_runas_derecha'], 'd2e-heroes-runes-right.webp')
part(layer['03_estandarte_izquierdo'], 'd2e-heroes-banner-left.webp')
part(layer['04_estandarte_derecho'], 'd2e-heroes-banner-right.webp')

# The still room: the dark one lit through the drawing's pools (descentRoomArt.ts POOLS), with everything in place
POOLS = [(375, 400, 300, 0.9), (1352, 470, 260, 0.85), (285, 190, 180, 0.55), (1307, 320, 190, 0.55), (1300, 94, 150, 0.55),
         (1439, 136, 150, 0.5), (1530, 110, 260, 0.45), (40, 205, 120, 0.55), (225, 300, 90, 0.45), (55, 525, 110, 0.5),
         (485, 628, 80, 0.4), (1286, 662, 80, 0.4), (390, 560, 90, 0.35), (1368, 597, 80, 0.35)]
ys, xs = np.mgrid[0:H, 0:W]
L = np.zeros((H, W), np.float32)
for (px, py, pr, ps) in POOLS:
    dd = np.hypot(xs - px, ys - py) / pr
    L += ps * np.clip(np.where(dd < 0.45, 1 - 0.55 * dd / 0.45, 0.45 * (1 - dd) / 0.55), 0, 1)
L = np.clip(L, 0, 1)[..., None]
still = dark * (1 - L) + lit_out * L
for n in ('03_estandarte_izquierdo', '04_estandarte_derecho', '02a_brillo_runas_izquierda', '02b_brillo_runas_derecha', '01_llama_brasero_izquierdo', 'flame_right'):
    a = layer[n][..., 3:] / 255
    still = still * (1 - a) + layer[n][..., :3] * a
save(still, 'd2e-heroes-room-still.webp', q=86)
