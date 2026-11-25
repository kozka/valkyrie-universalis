# The mock's room without its frames: its pieces painted over (OpenCV inpainting at half size, then a grain like the
# picture's), for the dark and the lit picture alike.
import cv2, numpy as np, sys
from PIL import Image

RECTS = [
    (372, 26, 1286, 178),   # title banner
    (762, 170, 892, 216),   # page dots
    (384, 196, 1274, 698),  # the rings
    (286, 344, 380, 538),   # left arrow
    (1274, 344, 1370, 538), # right arrow
    (720, 690, 932, 768),   # skull
    (164, 750, 1494, 918),  # bar
]

def mask(shape):
    m = np.zeros(shape[:2], np.uint8)
    for x0, y0, x1, y1 in RECTS:
        m[y0:y1, x0:x1] = 255
    return m

def clean(path, out):
    im = cv2.imread(path)
    m = mask(im.shape)
    small = cv2.resize(im, None, fx=0.5, fy=0.5, interpolation=cv2.INTER_AREA)
    ms = cv2.resize(m, None, fx=0.5, fy=0.5, interpolation=cv2.INTER_NEAREST)
    filled = cv2.inpaint(small, ms, 9, cv2.INPAINT_TELEA)
    up = cv2.resize(filled, (im.shape[1], im.shape[0]), interpolation=cv2.INTER_CUBIC).astype(np.float32)
    up = cv2.GaussianBlur(up, (0, 0), 3)
    rng = np.random.default_rng(3)
    grain = cv2.GaussianBlur(rng.normal(0, 1, im.shape[:2]).astype(np.float32), (0, 0), 0.8) * 6
    up += grain[..., None] * (0.4 + up / 255.0)
    soft = cv2.GaussianBlur(m.astype(np.float32) / 255, (0, 0), 4)[..., None]
    res = im.astype(np.float32) * (1 - soft) + up * soft
    cv2.imwrite(out, np.clip(res, 0, 255).astype(np.uint8))

if __name__ == '__main__':
    clean(sys.argv[1], sys.argv[2])
