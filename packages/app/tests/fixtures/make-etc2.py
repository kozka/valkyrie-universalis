# Random ETC2 blocks of every mode and their pixels as texture2ddecoder 1.0.6 decodes them: the reference for
# tests/pvr.test.ts. Remake etc2.json with: py -3 -m pip install texture2ddecoder==1.0.6, then
# py -3 tests/fixtures/make-etc2.py tests/fixtures/etc2.json (python3 on Linux).
import base64, json, random, sys
import texture2ddecoder as t

random.seed(20261008)

def mode(block):
    if not (block[3] >> 1) & 1:
        return 'individual'
    def over(byte):
        base, delta = byte >> 3, byte & 7
        if delta >= 4: delta -= 8
        return not 0 <= base + delta <= 31
    if over(block[0]): return 'T'
    if over(block[1]): return 'H'
    if over(block[2]): return 'planar'
    return 'differential'

wanted = {'individual': 16, 'differential': 16, 'T': 16, 'H': 16, 'planar': 16}
found = {k: [] for k in wanted}
while any(len(found[k]) < n for k, n in wanted.items()):
    block = bytes(random.getrandbits(8) for _ in range(8))
    m = mode(block)
    if len(found[m]) < wanted[m]: found[m].append(block)
rgb_blocks = [b for k in wanted for b in found[k]]

alpha_blocks = []
for i in range(80):
    eac = bytearray(random.getrandbits(8) for _ in range(8))
    if i % 8 == 0: eac[1] &= 0x0F  # multiplier 0
    alpha_blocks.append(bytes(eac) + rgb_blocks[i])

def entry(blocks, decode):
    across = 8
    width, height = across * 4, len(blocks) // across * 4
    data = b''.join(blocks)
    bgra = decode(data, width, height)
    rgba = bytearray(len(bgra))
    rgba[0::4], rgba[1::4], rgba[2::4], rgba[3::4] = bgra[2::4], bgra[1::4], bgra[0::4], bgra[3::4]
    return {'width': width, 'height': height, 'blocks': base64.b64encode(data).decode(), 'pixels': base64.b64encode(bytes(rgba)).decode()}

fixture = {
    'source': 'Random blocks of every mode, decoded by texture2ddecoder 1.0.6 (decode_etc2, decode_etc2a8); pixels as RGBA in the order of the data',
    'modes': {k: len(v) for k, v in found.items()},
    'rgb': entry(rgb_blocks, t.decode_etc2),
    'rgba': entry(alpha_blocks, t.decode_etc2a8),
}
json.dump(fixture, open(sys.argv[1], 'w'), indent=1)
print(fixture['modes'], fixture['rgb']['width'], fixture['rgb']['height'], fixture['rgba']['height'])
