// Ported from Valkyrie (Apache-2.0), modified: unity/Assets/Scripts/GameType.cs (MoMGameType)
// Fonts are left to the module's interface theme. Images are drawn at the desktop scale, as their authors see them, but
// the tiles of an import made on Android, which has half their pixels, are drawn at their size (tilePixelPerSquare).
import { ContentData, StringKey, ValkyrieConstants, type GameType } from '@universalis/engine';

// Valkyrie: GameType.cs MoMGameType
export class MoMGameType implements GameType {
  dataDirectory(): string {
    return ContentData.contentPath() + 'MoM/';
  }

  baseContentPackId(): string {
    return ValkyrieConstants.BaseGameIdContentPackMansionsOfMadness;
  }

  heroName(): StringKey {
    return new StringKey('val', 'MOM_HERO_NAME');
  }

  heroesName(): StringKey {
    return new StringKey('val', 'MOM_HEROES_NAME');
  }

  questName(): StringKey {
    return new StringKey('val', 'MOM_QUEST_NAME');
  }

  maxHeroes(): number {
    return 10;
  }

  defaultHeroes(): number {
    return 5;
  }

  displayHeroes(): boolean {
    return false;
  }

  // the base side of the tile is 1024 pixels, we are having 3.5 'squares' (3.5 inches) in this
  // These squares are the same size as D2E squares
  tilePixelPerSquare(picture?: string): number {
    // Valkyrie halves it on Android, whose import has its tiles at half the pixels (PVR pictures): the web halves it for
    // a tile picture of such an import only, so that the scenarios' own pictures keep the desktop scale
    const file = picture === undefined ? null : ContentData.resolveTextureFile(picture);
    if (file !== null && file.toLowerCase().endsWith('.pvr')) return Math.fround(512 / 3.5);
    return Math.fround(1024 / 3.5);
  }

  typeName(): string {
    return 'MoM';
  }

  tileOnGrid(): boolean {
    return false;
  }

  displayMorale(): boolean {
    return false;
  }

  // Number of squares for snap of objects in editor
  selectionRound(): number {
    return 1.75;
  }

  // Number of squares for snap of tiles in editor
  tileRound(): number {
    return 3.5;
  }

  monstersGrouped(): boolean {
    return false;
  }
}
