// Not in Valkyrie: the sounds of the menus' buttons, kozka's (10 November 2026): a soft click when one is pressed
// and a longer sound when the choice of heroes or of their classes is done (a button marked data-sound="start", if
// pressing it did go on). Only in the menus and while the heroes are chosen: in a game the scenarios play their own
// sounds, and the editor is silent. At the effects' volume; the click can be turned off in the advanced options.
import clickUrl from '../assets/sound/click.wav';
import { switchOn } from '../ui/preferences.ts';
import { useUI } from '../ui/store.ts';
import { volumeSetting } from './menuAmbience.ts';
import { soundUrl } from './menuSound.ts';
import { audioContext } from './webAudio.ts';

const PRESSABLE = 'button, a[href], summary, select, input[type="checkbox"], input[type="radio"], [role="button"], [role="menuitem"], [role="tab"]';

/** How the click sounds: its loudness, and the band, in Hz, it is kept to, without its lows or its edge. */
const PRESS = { volume: 0.1, from: 500, to: 3200 };

const buffers = new Map<string, Promise<AudioBuffer | null>>();

function buffer(url: string): Promise<AudioBuffer | null> {
  let sound = buffers.get(url);
  if (sound === undefined) {
    sound = fetch(url)
      .then((response) => response.arrayBuffer())
      .then((bytes) => audioContext().decodeAudioData(bytes))
      .catch(() => null);
    buffers.set(url, sound);
  }
  return sound;
}

/** Plays a sound once: this loud (times the effects' volume), kept to a band of frequencies if given. */
function play(url: string, volume: number, band?: { from: number; to: number }): void {
  const level = volume * volumeSetting('effects');
  if (level <= 0) return;
  void buffer(url).then((sound) => {
    const ctx = audioContext();
    if (sound === null || ctx.state !== 'running') return;
    const source = ctx.createBufferSource();
    source.buffer = sound;
    const gain = ctx.createGain();
    gain.gain.value = level;
    gain.connect(ctx.destination);
    if (band === undefined) source.connect(gain);
    else {
      const high = ctx.createBiquadFilter();
      high.type = 'highpass';
      high.frequency.value = band.from;
      const low = ctx.createBiquadFilter();
      low.type = 'lowpass';
      low.frequency.value = band.to;
      source.connect(high);
      high.connect(low);
      low.connect(gain);
    }
    source.onended = () => gain.disconnect();
    source.start();
  });
}

function click(): void {
  if (switchOn('clickSound')) play(clickUrl, PRESS.volume, PRESS);
}

/** Where the player is: a menu, the choice of heroes, that of their classes, or a game (or the editor). */
function place(): 'menu' | 'heroes' | 'classes' | 'game' {
  const { screen, heroSelectionScreen, classSelection } = useUI.getState();
  if (screen.name === 'editor') return 'game';
  if (screen.name !== 'quest') return 'menu';
  return heroSelectionScreen ? 'heroes' : classSelection !== null ? 'classes' : 'game';
}

/** What of the page a press is on that can be pressed, if anything. */
function pressable(target: EventTarget | null): HTMLElement | null {
  if (!(target instanceof Element) || place() === 'game') return null;
  const found = target.closest<HTMLElement>(PRESSABLE);
  if (found === null || found.matches(':disabled, [aria-disabled="true"]')) return null;
  return found;
}

let installed = false;

/** Starts listening to the page's presses, once. */
export function installUiSounds(): void {
  if (installed) return;
  installed = true;
  document.addEventListener(
    'click',
    (event) => {
      const element = pressable(event.target);
      if (element === null) return;
      if (element.dataset.sound !== 'start') {
        click();
        return;
      }
      // The choice is done if it was good, which the press's own handler decides: then the player is somewhere else
      const from = place();
      setTimeout(() => {
        if (place() === from) click();
        else play(soundUrl('start-adventure'), 0.9);
      }, 150);
    },
    true,
  );
}
