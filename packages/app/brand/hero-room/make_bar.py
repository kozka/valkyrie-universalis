"""Builds the hero room's bottom bar for more investigators (8 or 10 circles) out of pieces of kozka's own picture:
narrower Back and Finished, a wider central frame, smaller circles. Writes strips (rows Y0..Y1 of the 1536x1024 picture)
for the ui layer and the frames layer, a preview, and the boxes as JSON."""
import json
import sys
from PIL import Image, ImageChops, ImageDraw, ImageFilter

SRC = sys.argv[1]
OUT = sys.argv[2]
Y0, Y1 = 798, 962
ui = Image.open(f'{SRC}/hero-room-ui.webp').convert('RGBA')
fr = Image.open(f'{SRC}/hero-room-frames.webp').convert('RGBA')


def cols(img, x0, x1):
    return img.crop((x0, Y0, x1, Y1))


def stretch(img, x, width, y0=Y0, y1=Y1):
    return img.crop((x, y0, x + 1, y1)).resize((max(1, width), y1 - y0), Image.NEAREST)


def build(n, scale, button_plain):
    layers = {}
    boxes = {}
    for name, img in (('ui', ui), ('frames', fr)):
        out = Image.new('RGBA', (1536, Y1 - Y0), (0, 0, 0, 0))

        def put(piece, x, y=Y0):
            out.alpha_composite(piece, (int(round(x)), y - Y0))

        # Back: left cap, plain, the bottom line's diamond, plain, right cap
        x = 45
        put(cols(img, 45, 168), x); x += 123
        put(stretch(img, 200, button_plain), x); x += button_plain
        put(cols(img, 245, 272), x); x += 27
        put(stretch(img, 200, button_plain), x); x += button_plain
        back_right = x
        put(cols(img, 352, 404), x); x += 52
        back_end = x
        # Finished, from the right: right cap, plain, diamond, plain, left cap
        x = 1475 - 107
        put(cols(img, 1368, 1475), x)
        finished_right_cap = x
        x -= button_plain; put(stretch(img, 1330, button_plain), x)
        x -= 27; put(cols(img, 1268, 1295), x)
        x -= button_plain; put(stretch(img, 1330, button_plain), x)
        x -= 50; put(cols(img, 1132, 1182), x)
        finished_start = x

        # The central frame between them: its caps, its plain top and bottom bands, the middle ornaments
        p0 = back_end - 6
        p1 = finished_start + 8
        put(cols(img, 398, 458), p0)
        put(cols(img, 1078, 1140), p1 - 62)
        inner0, inner1 = p0 + 60, p1 - 62
        put(stretch(img, 575, inner1 - inner0, Y0, 826), inner0)
        put(stretch(img, 575, inner1 - inner0, 928, Y1), inner0, 928)
        if name == 'ui':
            # The dark inside, from Back's own inside
            tex = ui.crop((175, 826, 335, 900))
            band = tex.resize((inner1 - inner0, 928 - 826), Image.BICUBIC)
            put(band, inner0, 826)
        centre = (p0 + p1) / 2
        put(img.crop((715, Y0, 820, 822)), centre - 52.5)
        put(img.crop((715, 932, 820, Y1)), centre - 52.5, 932)

        # The circles and the diamonds between them
        ring = img.crop((582, 824, 690, 932))  # circle 2, centre (636, 878)
        rw = int(round(ring.width * scale)); rh = int(round(ring.height * scale))
        ring_s = ring.resize((rw, rh), Image.LANCZOS)
        if name == 'ui':
            # Only the circle itself (and its little diamonds), not the frame's inside around it
            m = Image.new('L', ring.size, 0)
            ImageDraw.Draw(m).ellipse((2, 2, ring.width - 2, ring.height - 2), fill=255)
            m = m.filter(ImageFilter.GaussianBlur(1.5)).resize((rw, rh), Image.LANCZOS)
            ring_s.putalpha(ImageChops.multiply(ring_s.getchannel('A'), m))
        dia = img.crop((689, 852, 713, 904))
        dw = int(round(dia.width * scale)); dh = int(round(dia.height * scale))
        dia_s = dia.resize((dw, dh), Image.LANCZOS)
        if name == 'ui':
            m = Image.new('L', dia.size, 0)
            w, h = dia.size
            ImageDraw.Draw(m).polygon([(w / 2, 0), (w, h / 2), (w / 2, h), (0, h / 2)], fill=255)
            m = m.filter(ImageFilter.GaussianBlur(1)).resize((dw, dh), Image.LANCZOS)
            dia_s.putalpha(ImageChops.multiply(dia_s.getchannel('A'), m))
        ring_d = 104 * scale  # the ring's width in the crop, from edge to edge
        span = inner1 - inner0 - 2 * dw
        step = (span - ring_d) / (n - 1)
        first = inner0 + dw + ring_d / 2
        centres = [first + i * step for i in range(n)]
        cy = 878
        for i, cx in enumerate(centres):
            put(ring_s, cx - (636 - 582) * scale, int(round(cy - (878 - 824) * scale)))
        joints = [inner0 + dw / 2] + [(a + b) / 2 for a, b in zip(centres, centres[1:])] + [inner1 - dw / 2]
        for jx in joints:
            put(dia_s, jx - dw / 2, int(round(878 - dh / 2)))
        layers[name] = out
        hole = 86 * scale
        boxes = {
            'circles': [[round(cx - hole / 2, 1), round(cy - hole / 2, 1), round(hole, 1), round(hole, 1)] for cx in centres],
            'back': [45, 806, back_end - 45, 134],
            'backText': [125, 822, back_right - 125, 99],
            'finished': [finished_start, 806, 1475 - finished_start, 134],
            'finishedText': [finished_start + 12, 822, finished_right_cap + 20 - (finished_start + 12), 99],
        }
    return layers, boxes


all_boxes = {}
for n, scale, plain in ((8, 0.8, 20), (10, 0.68, 14)):
    layers, boxes = build(n, scale, plain)
    for name, img in layers.items():
        img.save(f'{OUT}/hero-room-{name}-bar{n}.webp', 'WEBP', quality=90, method=6)
    all_boxes[n] = boxes
    # Preview: the room's colour behind, the bar over it
    bg = Image.new('RGBA', (1536, Y1 - Y0), (45, 18, 18, 255))
    prev = Image.alpha_composite(Image.alpha_composite(bg, layers['ui']), layers['frames'])
    prev.save(f'{OUT}/preview-bar{n}.png')
    check = prev.copy(); d = ImageDraw.Draw(check)
    for x, y, w, h in boxes['circles']: d.ellipse((x, y - Y0, x + w, y - Y0 + h), outline=(255, 0, 0, 255))
    for k in ('backText', 'finishedText'):
        x, y, w, h = boxes[k]; d.rectangle((x, y - Y0, x + w, y - Y0 + h), outline=(0, 255, 0, 255))
    check.save(f'{OUT}/check-bar{n}.png')
orig = Image.alpha_composite(Image.alpha_composite(Image.new('RGBA', (1536, Y1 - Y0), (45, 18, 18, 255)), ui.crop((0, Y0, 1536, Y1))), fr.crop((0, Y0, 1536, Y1)))
orig.save(f'{OUT}/preview-bar5.png')
json.dump(all_boxes, open(f'{OUT}/boxes.json', 'w'), indent=1)
print(json.dumps(all_boxes))
