// Unity's Application: the folders where Valkyrie's C# reads and writes, and Application.Quit().
// Not ported from Valkyrie.
import { ValkyrieFatalError } from './ValkyrieFatalError.ts';

const fatalListeners = new Set<(error: ValkyrieFatalError) => void>();

export const Application = {
  /** Application.streamingAssetsPath: Valkyrie's base data (content packs and text). */
  streamingAssetsPath: '/StreamingAssets',
  /** Environment.SpecialFolder.ApplicationData: Game.DefaultAppData() appends "Valkyrie". */
  applicationDataPath: '/AppData',
  /** Path.GetTempPath(), with its trailing separator. */
  temporaryCachePath: '/Temp/',

  /** Application.isEditor: false in the app; Valkyrie's tests run inside the Unity editor, where it is true. */
  isEditor: false,

  /** Fatal errors recorded since the host last cleared them. */
  fatalErrors: [] as ValkyrieFatalError[],

  /**
   * Application.Quit() on Valkyrie's fatal paths. Unity does not stop the running code: the player closes at the
   * end of the frame (and the editor, where Valkyrie's tests run, ignores it). So this records the error and returns;
   * the host checks Application.fatalErrors after each step and stops the scenario with a clear message.
   */
  quit(reason: string, component: string, message: string): void {
    const error = new ValkyrieFatalError(reason, component, message);
    Application.fatalErrors.push(error);
    for (const listener of fatalListeners) listener(error);
  },

  /** Listens to fatal errors as they happen; returns a function that removes the listener. */
  onQuit(listener: (error: ValkyrieFatalError) => void): () => void {
    fatalListeners.add(listener);
    return () => fatalListeners.delete(listener);
  },
};
