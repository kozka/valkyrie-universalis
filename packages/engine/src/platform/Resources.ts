// Unity's Resources folder: the pictures built into Valkyrie (unity/Assets/Resources). Game rules only need to know
// which exist; the app fetches them from Valkyrie's repository when it draws them, like the base data's pictures. The
// text assets that rules read are copied with the base data (tools/sync-valkyrie-data.mjs). Not ported from Valkyrie.
import { Application } from './Application.ts';
import { File } from './SystemIO.ts';

/**
 * The sprites of Valkyrie's Resources/Sprites that game rules load, by the name Resources.Load is given in lower case
 * (it ignores letter case and the extension), with their file there.
 */
const SPRITES = new Map([
  ...[1, 2, 3, 4, 5, 6].map((i) => [`element${i}`, `element${i}.png`] as const),
  ...[1, 2, 3, 4, 5, 6].map((i) => [`monster_duplicate_${i}`, `monster_duplicate_${i}.png`] as const),
  // The board's (Quest.Door, TokenBoard.AddPlacedMonsterImg, AddAreaMonster and AddHighlight)
  ['door', 'Door.png'],
  ['target', 'target.png'],
  ['borders/frame_monster_1x1', 'borders/Frame_Monster_1x1.dds'],
  ['borders/frame_monster_1x2', 'borders/Frame_Monster_1x2.dds'],
  ['borders/frame_monster_2x3', 'borders/Frame_Monster_2x3.dds'],
  ['borders/empty_monster_1x2', 'borders/Empty_Monster_1x2.png'],
]);

export const Resources = {
  /** Resources.Load(path) as Texture2D: the picture's path below unity/Assets in Valkyrie's repository, or null. */
  load(path: string): string | null {
    const file = SPRITES.get(path.toLowerCase().replace(/^sprites\//, ''));
    return file === undefined ? null : `Resources/Sprites/${file}`;
  },

  /** Resources.Load(name) as TextAsset: its text, mounted with the base data under StreamingAssets/Resources, or null. */
  loadText(name: string): string | null {
    const path = `${Application.streamingAssetsPath}/Resources/${name}.txt`;
    return File.exists(path) ? File.readAllText(path) : null;
  },
};
