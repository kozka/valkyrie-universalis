// Games in landscape, as Valkyrie plays them, menus as the phone is held (kozka's choice, 11 October 2026): during a
// game the screen turns itself where the browser lets it (Android, installed or in full screen, ui/fullscreen.ts), and
// elsewhere (an iPhone) a phone held upright is asked to turn, or to go on upright. Not ported from Valkyrie.

/** The browser's screen orientation, whose lock TypeScript's DOM types no longer declare. */
interface Orientation {
  lock?(orientation: 'landscape'): Promise<void>;
  unlock?(): void;
}

const KEY = 'universalis.upright';
let upright = false;

function orientation(): Orientation | undefined {
  return (screen as { orientation?: Orientation }).orientation;
}

/** Turns the screen to landscape for a game, where the browser allows it; elsewhere nothing happens. */
export function lockLandscape(): void {
  try {
    void orientation()
      ?.lock?.('landscape')
      .catch(() => undefined);
  } catch {
    // Not allowed here: the player is asked to turn the phone
  }
}

/** Lets the screen turn as the phone is held again, out of a game. */
export function unlockOrientation(): void {
  try {
    orientation()?.unlock?.();
  } catch {
    // Nothing was locked
  }
}

/** Whether the player chose to play upright, until the app closes; the tests' phone says so in its storage. */
export function uprightChosen(): boolean {
  if (upright) return true;
  try {
    return localStorage.getItem(KEY) === 'yes';
  } catch {
    return false;
  }
}

/** Plays upright until the app closes. */
export function chooseUpright(): void {
  upright = true;
}
