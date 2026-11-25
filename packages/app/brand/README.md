# Brand

kozka's drawings for Valkyrie Universalis (9 October 2026), white on transparent: `logo.png` (the title, 2172×724) and `emblem.png` (the VU emblem, 1254×1254). They are the project's own, not FFG's or Valkyrie's.

The game selection's buttons (10 October 2026), also his: each game's frame with its emblem, `game-mom-frame.png` (746×150) and `game-d2e-frame.png` (661×150), and the picture that shows inside it, `game-mom-picture.png` (630×222) and `game-d2e-picture.png` (660×222). `game-selection-mock.png` is his sketch of the screen, with each game's name in the colour of its frame. DooM's (11 October 2026), under Descent's: `game-doom-frame.png` (661×136), with its energy cells at both ends, `game-doom-picture.png` (a 1522×337 band of the second picture he sent, 1522×733, cut from 4 % to 50 % of its height so that the marine fills the button; the first one looked too much like Descent's) and `game-doom-title.png` (257×96), DooM's title, which the button shows in place of a name. `src/screens/gameArt.ts` draws them; DooM's cells are the frame's own lit pixels, which it darkens and lights again bar by bar. What it needs to know of each (inside the border, the emblem, the light in each picture) is in its `LOOKS`, in the frames' pixels, and the frames' shape and where the names go are in `GameSelectionScreen.css`: a new drawing laid out the same way and of the same size needs no change; any other, those numbers measured again. Bigger versions (twice as wide) would look sharper on phones and large screens, DooM's title most of all: it shows at about 1.5 times its size on a computer and more on a phone.

What the app uses was made from them once, with Pillow:

| File | Made from | How |
| --- | --- | --- |
| `src/assets/logo.webp` | `logo.png` | Trimmed to the drawing, 1200 px wide, WebP at quality 85 |
| `public/icons/icon-192.png`, `icon-512.png` | `emblem.png` | Trimmed, 86 % of the side, centred on the black felt (`#0e0e0e`) with a warm glow behind |
| `public/icons/icon-maskable-512.png` | `emblem.png` | The same at 64 %, so that the whole drawing stays inside the 80 % circle a launcher may cut |
| `public/apple-touch-icon.png` | `emblem.png` | The same at 82 %, 180 px |
| `public/favicon.ico` | `emblem.png` | 98 % on the black felt without the glow, at 16, 32 and 48 px |
| `src/assets/game-mom-frame.webp`, `game-d2e-frame.webp`, `game-doom-frame.webp` | `game-*-frame.png` | WebP at quality 95, same size |
| `src/assets/game-mom-picture.webp`, `game-d2e-picture.webp` | `game-*-picture.png` | WebP at quality 88, same size |
| `src/assets/game-doom-picture.webp` | `game-doom-picture.png` | 320 px high, WebP at quality 88 |
| `src/assets/game-doom-title.webp` | `game-doom-title.png` | WebP at quality 92, same size |

The game selection's backdrop (11 October 2026), in `menu/`: `full.png` (1729×910), the picture as it should look; `base.png` (1724×912), the same without the cape, the tentacles and the black sun; and, cut from the full one at its size and place, `cape.png`, `sun.png`, `light.png`, `tentacle-1.png` to `-3.png`, and two mists, `fog-1.png` and `fog-2.png`, that the full one does not have (not used: straight bands over the picture looked out of place). `src/screens/menuArt.ts` puts them back together and moves them a little; the mist that moves is the picture's own.

| File | Made from | How |
| --- | --- | --- |
| `src/assets/menu-full.webp` | `menu/full.png` | WebP at quality 90: the still backdrop of phones |
| `src/assets/menu-base.webp` | `menu/base.png`, `menu/full.png` | `base.png` stretched to 1729×910 (it lines up so) and its colours matched to `full.png` channel by channel, outside the layers; then `full.png` everywhere but under the layers (their alpha widened by 10 px and blurred by 8), where that base shows. WebP at quality 90 |
| `src/assets/menu-<layer>.webp` | `menu/<layer>.png` | Cut to what it draws plus 2 px (the corners are in `menuArt.ts`), WebP at quality 90 with its alpha |
| `src/assets/menu-mist.webp` | `menu/full.png` | Its mist: grey, smooth and not too dark (blurred luminance 10–32, saturation under 0.25–0.45, little detail), below 40–50 % of its height, without the knight; that mask blurred by 10 px as the alpha, cut to 1706×499 from (0, 365) |


Mansions' main menu backdrop (11 October 2026), in `mansion/`: his prototype of the scene in layers, all 1536×480 and aligned (`LEEME.txt` says what each is). `src/themes/universalis/mansionArt.ts` uses the picture whole (`00_original.webp`), the moon, the lights of the door, of its reflection and of the windows, and the three mists; not the house, the gates and the trees, whose cut-outs take in the sky behind them (the trees' is mostly rectangles), so moving them would show.

| File | Made from | How |
| --- | --- | --- |
| `src/assets/mansion-base.webp` | `mansion/00_original.webp` | WebP at quality 90: also the still backdrop of phones |
| `src/assets/mansion-moon.webp`, `-door`, `-reflection`, `-glow` | `06_luna.png`, `07_luz_puerta.png`, `08_reflejo_suelo.png`, `09_luz_ventanas.png` | Cut to what they draw plus 2 px (the corners are in `mansionArt.ts`), WebP at quality 90 |
| `src/assets/mansion-fog-1.webp` to `-3` | `11_niebla_1.png` to `13_niebla_3.png` | Made to repeat across without a seam (each blended with itself moved half its width, by sin² of the position) and cut to their rows, WebP at quality 88 |
| `src/assets/mansion-windows-off.webp`, `-on` | `00_original.webp` | From (1000, 140) to (1380, 312), the lit windows that `mansionArt.ts` lists: where each glows (red minus blue over 50, red over 90), widened by 1 px and blurred by 0.8, as the alpha; `-on` with the picture's own colours, `-off` with them darkened to about a sixth |
| `src/assets/mansion-sky.webp` | `00_original.webp` | From (0, 0) to (1000, 240), white, with the sky as its alpha, for the storm's light (`mansionArt.ts`): the picture's brightness blurred by 8 (6 to 26) times its brightness blurred by 0.8 (6 to 14), which leaves the trees out; fading out from y 150 to 235 and from x 880 to 990, before the house. WebP at quality 88 |


Descent's and DooM's main menu backdrops (12 October 2026), also his prototypes in layers: `lava/` (1536×480, `LEEME.txt`), the halls of lava with the burning gate, for Descent; and `fortress/` (1536×658, `LEEME.json`), the slayer before the fortress of hell, for DooM. `src/themes/universalis/lavaArt.ts` and `fortressArt.ts` use them, with what they share in `scene.ts`.

| File | Made from | How |
| --- | --- | --- |
| `src/assets/lava-full.webp` | `lava/00_fondo_original.webp` | WebP at quality 88: the still backdrop |
| `src/assets/lava-base.webp` | `lava/00_fondo_original.webp`, `00_fondo_sin_elementos_aprox.webp` | The original, with his reconstruction only under the banners and the cages (their alpha widened by 4 px and blurred by 3), which move. WebP at quality 90 |
| `src/assets/lava-<layer>.webp` | `lava/01`–`11` | Cut to what they draw plus 2 px (the corners are in `lavaArt.ts`), WebP at quality 90 |
| `src/assets/fortress-base.webp` | `fortress/00_original.webp` | WebP at quality 88: the picture whole, still and moving |
| `src/assets/fortress-glow-portal.webp`, `-glow-volcano`, `-fires`, `-sign`, `-embers` | `fortress/03`–`06`, `10` | Cut as the lava's |
| `src/assets/fortress-fog-far.webp`, `-mid`, `-near` | `fortress/07`–`09` | Made to repeat across, as the mansion's mists |

The slayer and the rocks (`fortress/01`, `02`) and the picture without him are not used: moving him would need that picture retouched, as his note says.

If the drawings change, make the files again with the same sizes.

Mansions' investigator selection in the Universalis theme (17 October 2026), in `hero-room/`: `room.png` (1536×1024), the study with no frames; `ui.png`, his gold frames with the dark figures in the ovals, the parchment plates and the bottom bar, on transparent; `frames.png`, the same frames alone, hollow; and `mock.png`, his picture of the whole screen, with the texts in place. `src/themes/universalis/HeroRoom.tsx` lays them out (every place measured in the frames' pixels: the ovals, plates, circles, arrows and buttons, in its constants) and `heroRoomArt.ts` brings the room to life with PixiJS: the candles' flames (each one's place in its `CANDLES`) and a storm behind the window's glass.

| File | Made from | How |
| --- | --- | --- |
| `src/assets/hero-room.webp` | `hero-room/room.png` | Much darker, as kozka asked (17 October 2026, like Photopea's brightness −150 and contrast +50): each channel as 0.55 × v^1.7 (v from 0 to 1), WebP at quality 88 |
| `src/assets/hero-room-lit.webp` | `hero-room/room.png` | As it is, WebP at quality 86: what the candles and the lightning show (`heroRoomArt.ts`) |
| `src/assets/hero-room-oval.webp` | `hero-room/frames.png` | The first oval's hole (transparent inside (297, 197)–(497, 407)), widened by 5 px to go under the gold ring and blurred by 1: white with that as its alpha, 190×203, lossless; every oval's hole has its shape |
| `src/assets/hero-room-ui.webp`, `hero-room-frames.webp` | `hero-room/ui.png`, `frames.png` | WebP at quality 92 with their alpha |
| `src/assets/hero-room-glass.webp` | `hero-room/room.png` | The window's glass: grey and bright (luminance over 70, saturation under 0.25) inside (1315, 15)–(1510, 475), opened, its holes filled, without the candles and their wicks in front of it (wax: red minus blue of 45 or more; wicks: luminance under 70), blurred by 0.7; white with that as its alpha, cut to (1323, 13), lossless |

Mansions' scenario list in the Universalis theme (17 October 2026), in `scenario-list/`: `mock.png` (1122×1402), his picture of the screen; and his pieces, whole, on transparent: `card.png`, the scenario's frame; `photo.png`, the old photograph the cover goes in; `textbox.png`, the thin frame of the search, the sort and the list's buttons; `button.png`, the frame of the buttons; and `title.png`, the title's banner with its crest and medallion. `src/themes/universalis/scenarios.css` puts them together as windows of old were made, cut in nine (`border-image`): the corners as they are and the sides stretched, so each piece takes any size and any language. Each was trimmed to its pixels with alpha over 8 first.

| Asset | From | How |
| --- | --- | --- |
| `src/assets/scenario-card.webp` | `scenario-list/card.png` | Trimmed (1811×555), halved: 906×278, corners of 55, WebP at quality 90 |
| `src/assets/scenario-button.webp` | `scenario-list/button.png` | Trimmed (2013×519), at a quarter: 503×130, corners of 45 |
| `src/assets/scenario-button-red.webp` | `scenario-button.webp` | Its inside (luminance under 60, more than 22 px from the sides and 14 from the top and bottom) turned dark red, brighter where the grain is (30 + 85 t, 5 + 14 t, 4 + 9 t, with t the luminance over 60): Volver, Desconectarse and «Expansiones que faltan» |
| `src/assets/scenario-textbox.webp` | `scenario-list/textbox.png` | Trimmed (2041×273), at 0.3: 612×82, corners of 30 at the top and 32 at the bottom |
| `src/assets/scenario-photo.webp` | `scenario-list/photo.png` | Trimmed (1086×1190), at 0.35: 380×416. Its hole (transparent) leans 3.9° to the left, its centre at 49.8 % and 47.2 %, 81.5 % by 75.3 % of the picture |
| `src/assets/scenario-title.webp` | `scenario-list/title.png` | Trimmed (2169×580) and halved (1084×290), without its crest and medallion so that it can stretch: above the inner frame (rows 0–198, columns 590–1580) each row is the average of the same row at columns 360–590 and 1580–1810, and the inside below it (rows 198–248) the inside 52 rows lower; likewise the medallion's columns 960–1210 (rows 446 down from the average at 730–960 and 1210–1440, rows 380–446 from 62 rows higher). Caps of 150, the frame 99 above and 67 below |
| `src/assets/scenario-title-crest.webp`, `scenario-title-medal.webp` | `scenario-list/title.png` | Columns 590–1580 by rows 0–248, and 960–1210 by rows 380 to the bottom, with only what differs from the clean banner (luminance by 28 or more, brighter only inside it), widened by 2 and blurred by 1.2; halved: 495×124 at the banner's top and 125×100 at 190 from it |

A scenario's details for Mansions in the Universalis theme (17 October 2026), in `scenario-details/`: `mock.png` (1402×1122), his picture of the screen; `library.png` (1448×1086), the library behind it, its candles unlit; `photo.png`, the old photograph with metal corners; and `start.png`, the parchment button, with «Iniciar» and its arrow drawn on it. `src/themes/universalis/scenarios.css` lays the screen out and `libraryArt.ts` lights the library's candles (each one's place in its `CANDLES`: the pale tip the picture paints over each candle is where its flame burns), with the flames the study's candles share (`candles.ts`).

| Asset | From | How |
| --- | --- | --- |
| `src/assets/details-library.webp` | `scenario-details/library.png` | Darker: each channel as 0.62 × v^1.35, WebP at quality 86 |
| `src/assets/details-library-lit.webp` | `scenario-details/library.png` | As it is, WebP at quality 84: what the candles light, and the still picture when there is no motion |
| `src/assets/details-photo.webp` | `scenario-details/photo.png` | Trimmed (1070×1340), at 0.4: 428×536. Its hole: corners (66, 128), (961, 60), (1006, 1210) and (102, 1262) of the trimmed picture; the cover goes under it at 88 % by 88 %, centred at 49.9 % and 49.6 %, turned 3.1° to the left |
| `src/assets/details-start.webp` | `scenario-details/start.png` | Without its words: the arrow (dark pixels in 1640–1775 by 250–455, widened by 5) painted over (OpenCV's Telea, radius 10), then columns 0–720 and 1700 to the end joined, blended over 40 px; trimmed (1051×562) and halved: 526×281, caps of 155 and 150, the frame 75 above and below |

The difficulty's tentacle (17 October 2026), in `difficulty/tentacle.png` (55×108, gold on black): the five marks of a scenario's difficulty in the Universalis theme for Mansions, in place of Valkyrie's diamonds, in the list and the details (`src/themes/universalis/scenarios.css`).

| Asset | From | How |
| --- | --- | --- |
| `src/assets/difficulty-tentacle.webp` | `difficulty/tentacle.png` | Its brightness as alpha (luminance from 18 up, over its 90th percentile, to the power 0.7), so that the gold is the shape and its dark lines stay as detail; trimmed (42×90) and centred in a 60×90 tile, the gap between two marks; white, lossless. The stylesheet paints it as a mask: dim for the whole five, red as far as the difficulty goes |

The game's buttons over the board in the Universalis theme for Mansions (17 October 2026), in `play/`: `menu.png` (1774×887), the Menu button's gold frame with «Menú» drawn in it; and `bag.png`, `map.png` and `book.png` (1254×1254), the pictures of the phase bar's Items, Set and Log. `src/themes/universalis/play.css` lays them out.

| Asset | From | How |
| --- | --- | --- |
| `src/assets/hud-menu.webp` | `play/menu.png` | Without its word (x 684–1068): columns up to 670 and from 1080 joined, blended over 40 px; trimmed (465×368) and halved: 232×184, corners of 48. The word is written in the player's language |
| `src/assets/hud-items.webp`, `hud-set.webp`, `hud-log.webp` | `play/bag.png`, `map.png`, `book.png` | Trimmed to their alpha over 8 and scaled to 192 on their longer side, WebP at quality 90 |
| `src/assets/hud-notes.webp` | `play/notes.png` (7 November 2026, the notes' notebook; drawn on black) | The black around it made transparent (filled from the edges, brightness up to 22, edge softened by 1.2 px), then as the others |


Descent's hero selection in the Universalis theme (31 October 2026), in `d2e-hero-room/`: `frames.png` (1672×941, on transparent), his frames: the title's banner and its page dots, eight rings with their name plates, the arrows, and the bar with Back, the plate of five circles (two lit) under a skull, and Confirm; `mock-dark.png` and `mock-lit.png`, his picture of the whole screen in the dwarven hall, its fire and candles out and lit; and `room.png`, a hall without frames that is not the mock's (another view, no hearth: not used). `src/themes/universalis/DescentHeroRoom.tsx` lays the pieces out on a stage of the mock's own size, lined up with the hall, and `descentRoomArt.ts` brings the hall to life with PixiJS: the hearth (its painted fire wavering through a displacement, tongues of flame, sparks, its light), the candles and lanterns (each one's place in its `CANDLES`, with Mansions' flames, `candles.ts`), the banner's runes pulsing, a cold mist in the far halls and embers rising through it all. All of it is made by `make_pieces.py <assets folder>`, run here after `clean_bg.py mock-dark.png clean-dark.png` and `clean_bg.py mock-lit.png clean-lit.png`.

| Asset | From | How |
| --- | --- | --- |
| `src/assets/d2e-heroes-room.webp`, `-room-lit.webp` | `mock-dark.png`, `mock-lit.png` | The mock without its frames: their boxes (`clean_bg.py` `RECTS`) painted over with OpenCV's Telea at half size, blurred by 3 and given a grain, blended in over 4 px; the lit one is the dark one where the frames were (blurred by 12), so that no glow of theirs is taken for the room's light. WebP at 88 and 86 |
| `src/assets/d2e-heroes-room-still.webp` | the two above | The dark room lit through the drawing's pools of light (`POOLS`, the same in `descentRoomArt.ts`) and its runes: the still picture, for no motion and while the drawing comes |
| `src/assets/d2e-heroes-runes.webp` | `mock-lit.png` | The banner's runes (226, 0)–(346, 384): their orange light as alpha, (r − b − 70) / 90 times (r − 120) / 80 |
| `src/assets/d2e-heroes-title.webp`, `-previous`, `-next` | `frames.png` | (346, 15)–(1321, 163), (219, 341)–(319, 553) and (1352, 341)–(1452, 553), as they are |
| `src/assets/d2e-heroes-rings.webp` | `frames.png` | (324, 180)–(1352, 724), without the page dots and the skull's head and horns; the screen cuts it in tiles at columns 256, 510 and 763 and row 272 of it |
| `src/assets/d2e-heroes-back.webp`, `-confirm.webp` | `frames.png` | From row 736 down: (14, 760)–(420, 912) and (1258, 760)–(1659, 912); the plate's caps go over their inner ends |
| `src/assets/d2e-heroes-plate.webp` | `frames.png` | From row 736 down and the skull, (392, 686)–(1298, 941), its inside (468, 771)–(1218, 899) emptied: the grain of Back's inside (132, 790)–(372, 882), at 1.4, in mirrored tiles blended over 40 px, coloured as the plate's stone (30, 23, 19), darker in the middle and redder at the rails, blended in over 4 px |
| `src/assets/d2e-heroes-circle-lit.webp`, `-circle-dark`, `-ring-lit`, `-ring-dark`, `-diamond` | `frames.png` | The first lit circle round (546, 833), faded from 62 to 69 px, and the first dark one round (832, 834), from 58 to 63; the rings the same, hollow inside 50 and 51 px, to go over a portrait; the diamond round (617, 833), faded at its edges |

DooM's hero selection in the Universalis theme (31 October 2026), in `doom-hero-room/`: `frames.png` (1671×941, on transparent), his steel frames with their orange lights: the title's banner (hollow), eight octagonal frames with their name plates, the arrows, and the bar with Back, the plate of five circles (two lit) and Confirm; `room.png` (1671×941), the ship's bridge over the burning city, already without frames; and `mock.png`, his picture of the whole screen (another render: not lined up with the room). The screen is Descent's (`src/themes/universalis/DescentHeroRoom.tsx`) with DooM's look (`DoomHeroRoom.tsx`: the pieces at 0.8, as in the mock), and `doomRoomArt.ts` brings the bridge to life with PixiJS: its four monitors (each one's corners in `MONITORS`, drawn on a canvas and laid on the room in perspective), its pilot lights (`LAMPS`: the lamps, keys and small displays painted on its panels, found in the picture and lit with their own pixels, so they stay exactly where they are painted; calm: breathing, waves and loads one after another, keys typed, lights out a while), the beacon, and through the window (`doom-heroes-window.webp`) the sigil, the beams, the fires, smoke, embers and red lightning. All of it is made by `make_pieces.py <assets folder>`, run here.

| Asset | From | How |
| --- | --- | --- |
| `src/assets/doom-heroes-room.webp` | `room.png` | Stretched to 1672×941, WebP at 88: also the still picture |
| `src/assets/doom-heroes-window.webp` | `room.png` | The great window: red and bright (r over 55 and over 1.25 b) right of 1235 and above 640, closed by 25 and opened by 9, its largest part, blurred by 3: white with that as its alpha, cut to (1235, 0) |
| `src/assets/doom-heroes-title.webp` | `frames.png` | (316, 10)–(1350, 178), its hole (458, 50)–(1180, 142) filled with dark metal for the words: the grain of Back's inside (140, 815)–(410, 885) at 1.3, in mirrored tiles, coloured (27, 21, 18) |
| `src/assets/doom-heroes-rings.webp` | `frames.png` | (259, 194)–(1411, 765): the eight frames, each its own part (`DoomHeroRoom.tsx` `FRAMES`) |
| `src/assets/doom-heroes-hole.webp` | `frames.png` | The first frame's hole (310, 237)–(487, 407), with 6 px round it, widened by 5 and blurred by 1: white with that as its alpha, lossless; every portrait has its shape |
| `src/assets/doom-heroes-previous.webp`, `-next` | `frames.png` | (136, 364)–(256, 604) and (1417, 364)–(1535, 604) |
| `src/assets/doom-heroes-back.webp`, `-confirm`, `-plate` | `frames.png` | (8, 767)–(466, 936), (1205, 767)–(1663, 936) and (455, 767)–(1216, 936), the plate's inside (468, 798)–(1196, 901) emptied as the title's hole, darker in the middle and redder at the rails |
| `src/assets/doom-heroes-*-glow.webp` | the pieces above | Their lights alone: (r − 170) / 60 times (r − b − 90) / 60 as alpha, blurred by 1.2; the screen flickers them |
| `src/assets/doom-heroes-circle-lit.webp`, `-circle-dark`, `-ring-lit`, `-ring-dark`, `-diamond` | `frames.png` | The first lit circle round (548, 850), faded from 58 to 66 px, and the last dark one round (1118, 850), from 53 to 58; hollow inside 46 and 45 px; the diamond round (617, 850) |

Descent's scenario screens in the Universalis theme (1 November 2026), in `d2e-scenarios/`: `frames.png` (1586×992, on transparent), his gold frames with blood-red gems: the red button, the title's banner with its skull and its gem, the search's field, the filter's square, the sort's fields with their arrow, the dark buttons and the adventure's card; `mock.png`, his picture of the list; and `cave.png` (1672×941), the dwarves' cave behind it. `src/themes/universalis/scenarios.css` gives Descent's list and details Mansions' layout with these pieces (its last part, under `data-look='D2E'`, which `App.tsx` sets: DooM keeps the classic screens), and `descentScreens.css` the class selection and the skills window. All of it is made by `make_pieces.py <assets folder>`, run here.

| Asset | From | How |
| --- | --- | --- |
| `src/assets/d2e-scenario-cave.webp` | `cave.png` | Darker: each channel as 0.8 × v^1.25; the stylesheet darkens it 45 % more |
| `src/assets/d2e-scenario-title.webp`, `-title-crest`, `-title-medal` | `frames.png` | (302, 14)–(1286, 252), its columns 630–960 painted over with columns 520–600 repeated (blended over 12 px) and the filter's square that reaches into its box taken out; the skull (630, 14)–(960, 135) and the gem (728, 160)–(862, 252) apart: what differs from the clean banner, its largest part, widened by 5 and blurred by 1.2 |
| `src/assets/d2e-scenario-card.webp`, `-card-top`, `-card-bottom` | `frames.png` | (14, 417)–(1572, 933), only the card's own pixels; the ornaments at the middle of its top (680–910) and its bottom (700–890) painted over and apart, as the title's; the red button inside it painted over with its inside 560–972 |
| `src/assets/d2e-scenario-button-red.webp`, `-button`, `-textbox`, `-square`, `-select` | `frames.png` | (17, 92)–(271, 186), (20, 336)–(412, 424), (188, 252)–(896, 324), (908, 244)–(1007, 337) and (1024, 250)–(1314, 331), as they are; the buttons' ends are half their height, so they keep their shape at any width |

DooM's scenario screens in the Universalis theme (1 November 2026), in `doom-scenarios/`: `frames.png` (1672×941, on transparent), his steel frames with orange lights: the red button, the title, the search, the filter's square, the sort's fields, the buttons and the mission's card (with a photograph's frame and a line inside, not used); `title.png` (2172×724), the big banner with its glowing crosses; `card.png` and `button-white.png`, other versions of the card and a button (not used); `mock.png`, his picture of the list; and `room.png`, the ship's bridge behind it. `src/themes/universalis/scenarios.css` (its last part, `data-look='DooM'`) and `descentScreens.css` (DooM's part) use them. All of it is made by `make_pieces.py <assets folder>`, run here.

| Asset | From | How |
| --- | --- | --- |
| `src/assets/doom-scenario-room.webp` | `room.png` | Stretched to 1672×941, each channel as 0.85 × v^1.2; the stylesheet darkens it 45 % more |
| `src/assets/doom-scenario-title.webp`, `-title-lights`, `-title-glow` | `title.png` | Its drawing (46, 92)–(2126, 627), its hole filled with dark metal (noise at three scales over 24, 21, 20, darker in the middle); the lights at the middle of its top and bottom (columns 920–1132) painted over with plain columns and apart; its glow alone, (r − 170) / 60 times (r − b − 90) / 60, which flickers |
| `src/assets/doom-scenario-button-red.webp`, `-button`, `-textbox`, `-square`, `-select` | `frames.png` | (54, 80)–(308, 167), (54, 323)–(406, 395), (279, 231)–(936, 303), (949, 230)–(1022, 304) and (1143, 231)–(1381, 304), their holes filled with metal (dark red for the red one) |
| `src/assets/doom-scenario-card.webp` | `frames.png` | (43, 412)–(1631, 916), without what is drawn inside it, its hole filled with metal |

DooM's buttons over the board in the Universalis theme (1 November 2026), in `doom-hud/icons.png` (2170×725, on transparent): a UAC pack, a map with its rollers and a book with the sigil, for Descent's Items, Skills and Log under DooM's button. `src/themes/universalis/doomPlay.css` uses them, and the steel frames of `doom-scenarios/` for every window of the game, the marines, the monsters, morale and Menu.

| Asset | From | How |
| --- | --- | --- |
| `src/assets/doom-hud-items.webp`, `-skills`, `-log` | `doom-hud/icons.png` | Each drawing trimmed to its alpha over 8 (closed by 4) and scaled to 192 on its longer side, WebP at quality 90 |

Descent's buttons over the board in the Universalis theme (1 November 2026), in `d2e-hud/icons.png` (2172×724, on transparent): an adventurer's pack, a map with its rollers and a book with a dragon, for Items, Skills and Log. `src/themes/universalis/descentPlay.css` uses them, and the gold frames of `d2e-scenarios/` for every window of the game, the heroes, the monsters, morale and Menu.

| Asset | From | How |
| --- | --- | --- |
| `src/assets/d2e-hud-items.webp`, `-skills`, `-log` | `d2e-hud/icons.png` | Each drawing trimmed to its alpha over 8 (closed by 4) and scaled to 192 on its longer side, WebP at quality 90 |

Descent's new look, "Dwarven Runestone" (2 November 2026): carved granite and antique silver, cold blue runes and crystals, red only for danger. In `d2e-scenarios/`: `style.png` and `style-2.png`, the style sheets that set it; `frames.png` (1672×941), the new frames of the scenario screens (the old ones, gold and blood, replaced: `make_pieces.py` cuts the same assets from the new sheet, its card's top and bottom edges made plain from corner to corner (no hammer or gem along them, kozka's choice); `frames-anvil.png`, another version, not used); `mock.png`, the list as it should look. In `d2e-hero-room/`: `frames.png` (1672×941, at the hall's own size and place, laid out at 0.8 of it round its middle, as DooM's are), the new rings, title, arrows and bar; `room-lit.png` and `room-dark.png`, the dwarven hall lit and dark; and `layers/`, the left brazier's flame, the runes' glow on each column and the two banners, at the hall's size. Its `make_pieces.py` now cuts the new frames and prepares the hall: the banners painted out of both rooms (OpenCV's Telea at half size under each banner's alpha widened by 7) so that they sway as meshes, the flames and the runes out of the lit room so that they burn and pulse alone; the right brazier's flame, which has no layer, is its blue light over the dark room. `src/themes/universalis/descentRoomArt.ts` draws it; the old hall (`mock-dark.png`, `mock-lit.png`, `room.png`, `clean_bg.py`) is no longer used, nor `d2e-heroes-runes.webp`. The cave behind the list stays.

Descent's main menu backdrop, "Dwarven Runestone" (2 November 2026), in `d2e-menu/`: `full.png` (1672×940), the dwarven hall under the mountain with its bridge, falls, blue braziers and rune gate; `clean-fog.png`, the same without banners and fires; `clean.png`, without mist either (not used); `banners/`, the four banners at the picture's size. `make_layers.py <assets folder>` makes `d2e-menu-full.webp` (the still picture), `-base` (the hall with the banners painted out with `clean-fog.png`, matched in colour to the full hall round each banner, and the fires and runes dimmed so that they can flicker), `-fires` and `-runes` (where the full hall is bluer and brighter than `clean-fog.png`, round each brazier and on the gate), `-banner-left`, `-red`, `-small`, `-right`, and `-falls` (where the water is, as alpha). `src/themes/universalis/runeHallArt.ts` moves them; the halls of lava (`lava/`, `lavaArt.ts`) are no longer Descent's backdrop.

Descent's button on the game selection, "Dwarven Runestone" (2 November 2026), in `d2e-menu/`: `button-frame.png` (2172×724, on transparent), the stone frame with the rune shield, and `button-picture.png` (1672×941), the hall's rune gate. `src/assets/game-d2e-frame.webp` is the frame trimmed to its pixels (2135×530) and scaled to 1000×248, WebP at 95; `game-d2e-picture.webp` is the picture's (300, 180)–(1672, 640) at 900×302, WebP at 88 (the old `game-d2e-frame.png` and `-picture.png` are no longer used). `screens/gameArt.ts` lights it cold (`cold`): its runes flare blue under the pointer, a gleam runs along the silver and blue sparks rise.

Descent's game menu (3 November 2026), in `d2e-play-menu/`: `button.png` and `button-lit.png` (1138×110, on transparent), kozka's slim bar with a crystal at each end, plain and lit blue, and `mock.png`, the menu as he wants it. The framed buttons were too heavy in a window of six; the window keeps its frame. Whether other windows of the game take the bar is still open.

| Asset | Source | How |
| --- | --- | --- |
| `src/assets/d2e-menu-bar.webp`, `-lit` | `d2e-play-menu/button.png`, `button-lit.png` | Both cropped to the same box (41, 0, 1099, 110), so that the lit one lies over the plain one; WebP at quality 90. `descentPlay.css` draws them as a border image with 110-pixel ends |
