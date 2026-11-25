// Ported from Valkyrie (Apache-2.0), modified: libraries/ValkyrieTools/ValkyrieDebug.cs
// Unity's Debug.Log becomes the listeners added with onLog; nothing is printed by default.

type LogListener = (message: string | undefined) => void;

// Valkyrie: ValkyrieDebug.cs ValkyrieDebug
export class ValkyrieDebug {
  /** Property to disable logger */
  static enabled = true;

  private static readonly listeners = new Set<LogListener>();

  /** Event fired when a message is logged; returns a function that removes the listener. */
  static onLog(listener: LogListener): () => void {
    ValkyrieDebug.listeners.add(listener);
    return () => ValkyrieDebug.listeners.delete(listener);
  }

  // Valkyrie: ValkyrieDebug.cs ValkyrieDebug.Log
  static log(message: unknown): void {
    if (ValkyrieDebug.enabled) {
      const text = message === null || message === undefined ? undefined : String(message);
      for (const listener of ValkyrieDebug.listeners) listener(text);
    }
  }
}
