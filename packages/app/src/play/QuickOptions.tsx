// Not in Valkyrie: the options a player may want to change in the middle of a game, opened from the game's menu
// (GameMenuWindow): the sizes, the sound, the advanced switches that play changes, and the voice. The rest stays in
// Options, on the main menu.
import { useSyncExternalStore } from 'react';
import { CommonStringKeys } from '@universalis/engine';
import { ItemSizeChoice, MonsterPlaceChoice, OnOff, PieceSizeChoice, TextSizeChoice, Volumes } from '../screens/OptionsScreen.tsx';
import { toggleFullscreen, useFullscreen } from '../ui/fullscreen.ts';
import { setSwitch, switchOn } from '../ui/preferences.ts';
import { useUI } from '../ui/store.ts';
import { uni, val } from '../ui/text.ts';
import { VoiceOptions } from '../ui/VoiceOptions.tsx';

let open = false;
const listeners = new Set<() => void>();

export function openQuickOptions(on = true): void {
  open = on;
  for (const listener of listeners) listener();
}

export function QuickOptions() {
  useUI((s) => s.revision);
  const full = useFullscreen();
  const shown = useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => open,
  );
  if (!shown) return null;
  return (
    <div className="window-layer quick-options-layer">
      <section className="window panel quick-options" role="dialog" aria-modal="true" aria-labelledby="quick-options-title">
        <h2 id="quick-options-title">{val('OPTIONS')}</h2>
        <div className="quick-options-body">
          {document.fullscreenEnabled && <OnOff id="quick-fullscreen" title={uni('FULLSCREEN')} on={full} choose={() => toggleFullscreen()} />}
          <TextSizeChoice />
          <OnOff id="quick-tv-mode" title={uni('TV_MODE')} on={switchOn('tvMode')} choose={(on) => setSwitch('tvMode', on)} />
          <ItemSizeChoice />
          <MonsterPlaceChoice />
          <PieceSizeChoice />
          <Volumes />
          <OnOff id="quick-confirm-phase" title={uni('CONFIRM_PHASE')} on={switchOn('confirmPhase')} choose={(on) => setSwitch('confirmPhase', on)} />
          <OnOff id="quick-keep-zoom" title={uni('KEEP_ZOOM')} on={switchOn('keepZoom')} choose={(on) => setSwitch('keepZoom', on)} />
          <OnOff id="quick-horror-reminder" title={uni('HORROR_REMINDER')} on={switchOn('horrorReminder')} choose={(on) => setSwitch('horrorReminder', on)} />
          <OnOff id="quick-auto-read" title={uni('AUTO_READ')} on={switchOn('autoRead')} choose={(on) => setSwitch('autoRead', on)} />
          <OnOff id="quick-button-hints" title={uni('BUTTON_HINTS')} on={switchOn('buttonHints')} choose={(on) => setSwitch('buttonHints', on)} />
          <OnOff id="quick-game-timer" title={uni('GAME_TIMER')} on={switchOn('gameTimer')} choose={(on) => setSwitch('gameTimer', on)} />
          <VoiceOptions />
        </div>
        <button type="button" className="button primary" onClick={() => openQuickOptions(false)}>
          {CommonStringKeys.CLOSE.translate()}
        </button>
      </section>
    </div>
  );
}
