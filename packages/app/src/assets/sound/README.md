# The app's own sounds

Not from Valkyrie nor from Fantasy Flight Games. Chosen by kozka (10 November 2026); `audio/menuSound.ts` and `audio/uiSounds.ts` say how they play.

| Files | From | How |
| --- | --- | --- |
| `click.wav` | kozka's `click.wav` | As it is: a button pressed, and lower and softer, the mouse over one |
| `start-adventure.mp3` | kozka's `iniciar.wav` | MP3 at 128 kbps: the adventure starts |
| `wind-1.mp3` to `wind-6.mp3` | His game Saba's `data/sounds/shared/environmental/`: `default_wind`, `leaf_wind`, `wind_1` to `wind_4` | Brought to about the same loudness (−30 dB mean), MP3 at 64–96 kbps |
| `thunder-far-1.mp3` to `-6`, `thunder-near-1.mp3` to `-7` | Saba's `environmental/weather/thunder_far_1` to `_6`, `thunder_1` to `_7` | The quieter far ones raised 2 to 5 dB, MP3 at 96 kbps |
| `cave-debris-1.mp3` to `-4`, `cave-rockfall.mp3` | Saba's `behemoth/dirt_debris_1` to `_4`, `stomp_dirt_debris` | MP3 at 64 kbps |
| `cave-stone-1.mp3` to `-3` | Saba's `builder/turret_debris_land`, `shared/ui/main_menu/stone_move` (−6 dB), `stone_slide` (+6 dB) | MP3 at 64 kbps |
| `cave-water.mp3` | Saba's `environmental/water/water_light_trickle` | MP3 at 96 kbps |

Saba's sounds were exported from the game Savage 2 (S2 Games), as its `SONIDO.md` says, and are used with permission.

The music is in `../music/`, each piece with its author in `audio/appMusic.ts`:

| File | Piece | From |
| --- | --- | --- |
| `descent-a-new-earth.mp3` | «A New Earth», Sam McGrath | Saba's `data/music/a_new_earth.ogg` (Savage 2's soundtrack), MP3 at 128 kbps |
| `descent-kingsfall.mp3` | «Kingsfall», Alexander Nakarada | https://www.youtube.com/watch?v=LEtERiC0FVA |
| `descent-dungeons-and-dragons.mp3` | «Dungeons and Dragons», Alexander Nakarada | https://www.youtube.com/watch?v=_sEKXl5WlVU |
| `mansions-ghost-town.mp3` | «Ghost Town», Run Rabbit Productions | https://www.youtube.com/watch?v=aJEa1Yv6ZV0 |
| `mansions-the-carnival-tape.mp3` | «The Carnival Tape», Run Rabbit Productions | https://www.youtube.com/watch?v=0fQ1MIuyTi4 |
| `doom-menu.mp3` | «Black Tooth», Aim To Head | Sent by kozka (12 October 2026) |
| `doom-torn-flesh.mp3` | «Torn Flesh», White Bat Audio | https://www.youtube.com/watch?v=58PCM-x7jlg |

The five pieces from YouTube were downloaded by kozka (10 November 2026), as MP3 at 128 kbps; their authors give them free to use with credit.
