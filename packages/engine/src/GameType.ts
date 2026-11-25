// Ported from Valkyrie (Apache-2.0), modified: unity/Assets/Scripts/GameType.cs
// The abstract class becomes an interface that each game module implements (MoMGameType, D2EGameType).
// Fonts (GetFont, GetHeaderFont, GetSymbolFont) are not here: they belong to each module's interface theme.
import { ContentData } from './Content/ContentData.ts';
import { StringKey } from './Content/StringKey.ts';

// GameType manages setting that are specific to the game type
// Valkyrie: GameType.cs GameType
export interface GameType {
  dataDirectory(): string;
  baseContentPackId(): string;
  heroName(): StringKey;
  heroesName(): StringKey;
  questName(): StringKey;
  maxHeroes(): number;
  defaultHeroes(): number;
  displayHeroes(): boolean;
  /** Not in Valkyrie: `picture`, a tile's, lets MoM count the pixels of an import made on Android (MoMGameType). */
  tilePixelPerSquare(picture?: string): number;
  typeName(): string;
  tileOnGrid(): boolean;
  displayMorale(): boolean;
  selectionRound(): number;
  tileRound(): number;
  monstersGrouped(): boolean;
}

// NoGameType exists for management reasons
// Valkyrie: GameType.cs NoGameType
export class NoGameType implements GameType {
  dataDirectory(): string {
    return ContentData.contentPath();
  }

  baseContentPackId(): string {
    return '';
  }

  heroName(): StringKey {
    return new StringKey('val', 'D2E_HERO_NAME');
  }

  heroesName(): StringKey {
    return new StringKey('val', 'D2E_HEROES_NAME');
  }

  questName(): StringKey {
    return new StringKey('val', 'D2E_QUEST_NAME');
  }

  maxHeroes(): number {
    return 0;
  }

  defaultHeroes(): number {
    return 0;
  }

  displayHeroes(): boolean {
    return true;
  }

  tilePixelPerSquare(): number {
    return 1;
  }

  typeName(): string {
    return '';
  }

  tileOnGrid(): boolean {
    return true;
  }

  displayMorale(): boolean {
    return false;
  }

  // Number of squares for snap of objects in editor
  selectionRound(): number {
    return 1;
  }

  // Number of squares for snap of tiles in editor
  tileRound(): number {
    return 1;
  }

  monstersGrouped(): boolean {
    return true;
  }
}
