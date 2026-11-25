// Ported from Valkyrie (Apache-2.0), modified: unity/Assets/Scripts/GameType.cs (D2EGameType)
// Fonts are left to the module's interface theme.
import { ContentData, StringKey, ValkyrieConstants, type GameType } from '@universalis/engine';

// Things for D2E
// Valkyrie: GameType.cs D2EGameType
export class D2EGameType implements GameType {
  dataDirectory(): string {
    return ContentData.contentPath() + 'D2E/';
  }

  baseContentPackId(): string {
    return ValkyrieConstants.BaseGameIdContentPackDescent;
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
    return 4;
  }

  defaultHeroes(): number {
    return 4;
  }

  displayHeroes(): boolean {
    return true;
  }

  // Tiles imported from RtL have 105 pixels per square (each 1 inch)
  tilePixelPerSquare(): number {
    return 105;
  }

  typeName(): string {
    return 'D2E';
  }

  tileOnGrid(): boolean {
    return true;
  }

  displayMorale(): boolean {
    return true;
  }

  selectionRound(): number {
    return 1;
  }

  tileRound(): number {
    return 1;
  }

  monstersGrouped(): boolean {
    return true;
  }
}
