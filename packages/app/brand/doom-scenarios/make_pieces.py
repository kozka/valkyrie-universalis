# DooM's scenario screens in the Universalis theme (themes/universalis/scenarios.css, its DooM part): kozka's steel
# frames (brand/doom-scenarios/: title.png, frames.png) cut into the pieces the stylesheet stretches (border-image), their
# holes filled with dark metal (dark red for the buttons that go back), the small lights at the middle of the title
# apart, its glow alone to flicker; and the ship's bridge behind, darker. Run from brand/doom-scenarios/:
# python make_pieces.py <assets folder>
import sys
import numpy as np
import cv2
from PIL import Image
from scipy import ndimage

OUT = sys.argv[1] if len(sys.argv) > 1 else '.'
rng = np.random.default_rng(5)

def load(name):
    return np.asarray(Image.open(name).convert('RGBA')).astype(np.float32)

def save(arr, name, q=92):
    im = Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8))
    im.save(f'{OUT}/{name}', 'WEBP', quality=q, method=6)
    print(name, im.size)

def plate(h, w, base):
    """Dark worn metal: noise at a few scales over a colour, darker toward the middle."""
    n = sum(cv2.GaussianBlur(rng.normal(0, 1, (h, w)).astype(np.float32), (0, 0), s) * a for s, a in ((0.7, 0.5), (2.5, 1.2), (9, 1.6)))
    n = (n - n.mean()) / (n.std() + 1e-3)
    yy = np.abs(np.linspace(-1, 1, h))[:, None]
    shade = 0.8 + 0.3 * yy ** 2
    return np.array(base, np.float32)[None, None, :] * (1 + 0.16 * n[..., None]) * shade[..., None]

def fill_hole(arr, base, keep_out=None):
    """The piece's hole (inside its frame) painted with metal, a pixel under the frame all round."""
    solid = arr[..., 3] > 128
    hole = ndimage.binary_fill_holes(solid) & ~solid
    if keep_out is not None:
        hole &= ~keep_out
    lab, n = ndimage.label(hole)
    if n == 0:
        return arr
    sizes = ndimage.sum(hole, lab, range(1, n + 1))
    hole = lab == 1 + int(np.argmax(sizes))
    m = cv2.dilate(hole.astype(np.uint8), np.ones((5, 5), np.uint8)).astype(np.float32)
    m = cv2.GaussianBlur(m, (0, 0), 1)
    tex = plate(arr.shape[0], arr.shape[1], base)
    out = arr.copy()
    a = out[..., 3:] / 255
    # Under the frame: the frame over the metal
    out[..., :3] = out[..., :3] * a + tex * (1 - a) * m[..., None] + out[..., :3] * 0
    out[..., :3] = np.where(m[..., None] > 0, arr[..., :3] * a + tex * (1 - a), arr[..., :3])
    out[..., 3] = np.maximum(arr[..., 3], m * 255)
    return out

def glow(arr):
    r, g, b = arr[..., 0], arr[..., 1], arr[..., 2]
    a = np.clip((r - 170) / 60, 0, 1) * np.clip((r - b - 90) / 60, 0, 1) * (arr[..., 3] / 255)
    return np.dstack([arr[..., :3], cv2.GaussianBlur(a, (0, 0), 1.2) * 255])

def tile_columns(arr, x0, x1, y0, y1, sx0, sx1, blend=12):
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

def ornament(orig, clean):
    d = np.abs(orig[..., :3] * orig[..., 3:] / 255 - clean[..., :3] * clean[..., 3:] / 255).max(2) + np.abs(orig[..., 3] - clean[..., 3])
    m = (d > 34).astype(np.uint8)
    m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, np.ones((7, 7), np.uint8))
    m = cv2.dilate(m, np.ones((5, 5), np.uint8))
    m = cv2.GaussianBlur(m.astype(np.float32), (0, 0), 1.2)
    o = orig.copy()
    o[..., 3] *= np.clip(m, 0, 1)
    return o

# The title's banner (title.png, its drawing 2080×535 from 46, 92), its hole filled; the lights at the middle of its
# top and bottom apart, and its glow alone
T = load('title.png')[92:627, 46:2126].copy()
title = fill_hole(T, (24, 21, 20))
clean = title.copy()
tile_columns(clean, 920, 1132, 0, 168, 784, 854)
tile_columns(clean, 920, 1132, 168, 535, 714, 784)
save(clean, 'doom-scenario-title.webp')
save(ornament(title[:, 920:1132], clean[:, 920:1132]), 'doom-scenario-title-lights.webp')
save(glow(T), 'doom-scenario-title-glow.webp')

# The pieces of frames.png: buttons, fields, the card
F = load('frames.png')
def piece(x0, y0, x1, y1, base, name):
    save(fill_hole(F[y0:y1, x0:x1].copy(), base), name)

piece(54, 80, 308, 167, (60, 14, 9), 'doom-scenario-button-red.webp')
piece(54, 323, 406, 395, (24, 21, 20), 'doom-scenario-button.webp')
piece(279, 231, 936, 303, (18, 16, 15), 'doom-scenario-textbox.webp')
piece(949, 230, 1022, 304, (24, 21, 20), 'doom-scenario-square.webp')
piece(1143, 231, 1381, 304, (18, 16, 15), 'doom-scenario-select.webp')

# The card, without the photograph's frame and the line drawn inside it
C = F[412:916, 43:1631].copy()
inner = np.zeros(C.shape[:2], bool)
inner[44:460, 44:1546] = True
C[..., 3] = np.where(inner, 0, C[..., 3])
C = fill_hole(C, (20, 18, 17))
C[:, 1575:, 3] = np.where(C[:, 1575:, 3] > 0, C[:, 1575:, 3], 0)
save(C, 'doom-scenario-card.webp')

# The bridge, darker still
room = np.asarray(Image.open('room.png').convert('RGB').resize((1672, 941), Image.LANCZOS)).astype(np.float32) / 255
save(0.85 * room ** 1.2 * 255, 'doom-scenario-room.webp', q=86)
