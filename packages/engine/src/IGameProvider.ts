// Ported from Valkyrie (Apache-2.0), modified: unity/Assets/Scripts/IGameProvider.cs
import { Game } from './Game.ts';
import { NoGameType, type GameType } from './GameType.ts';
import { ValkyrieConstants } from './ValkyrieConstants.ts';

/** Interface for providing game context to classes that need it, so tests can inject their own. */
// Valkyrie: IGameProvider.cs IGameProvider
export interface IGameProvider {
  /** Gets the current language code (e.g., "English", "Spanish"). */
  readonly currentLang: string;
  /** Gets the current game type (D2E, MoM, or NoGameType). */
  readonly gameType: GameType;
}

/** Default implementation that uses the Game singleton. */
// Valkyrie: IGameProvider.cs DefaultGameProvider
export class DefaultGameProvider implements IGameProvider {
  get currentLang(): string {
    return Game.get()?.currentLang ?? ValkyrieConstants.DefaultLanguage;
  }

  get gameType(): GameType {
    return Game.get()?.gameType ?? new NoGameType();
  }
}
