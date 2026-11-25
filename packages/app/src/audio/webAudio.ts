// The browser's side of the sound player (player.ts), with the Web Audio API, whose volumes work on every system (iOS
// ignores a media element's own volume). Music streams from a media element; effects are decoded whole, as they are
// short. Sounds come from the virtual file system, the official import's from its store (officialImport.ts), and the
// options' test sound from Valkyrie's repository. Where the browser cannot read Ogg Vorbis (Safari before 26), .ogg files
// are decoded with WebAssembly (oggDecoder.ts) and played from memory.
// Not ported from Valkyrie.
import { Game, Path, ValkyrieDebug, fileSystem } from '@universalis/engine';
import { resourceUrl } from '../host/baseData.ts';
import { importedFile } from '../host/officialImport.ts';
import { AudioPlayer, type AudioOutput, type Clip, type MusicSource } from './player.ts';

/** A sound file with its bytes, or already decoded when the browser cannot read it. */
interface WebClip extends Clip {
  readonly bytes: Uint8Array;
  readonly type: string;
  readonly buffer?: AudioBuffer;
}

const TYPES: Record<string, string> = {
  '.ogg': 'audio/ogg',
  '.wav': 'audio/wav',
  '.mp3': 'audio/mpeg',
};

let context: AudioContext | null = null;
const gestureWaiters: (() => void)[] = [];
let oggReadable: boolean | null = null;

/** Whether the browser reads Ogg Vorbis itself; Safari before 26 does not. */
export function readsOgg(): boolean {
  oggReadable ??= new Audio().canPlayType('audio/ogg; codecs="vorbis"') !== '';
  return oggReadable;
}

/** How the sound stands, for the bug reports. */
export function audioState(): string {
  return `Ogg ${readsOgg() ? 'sí' : 'no (decodificador)'}, audio ${context?.state ?? 'sin empezar'}`;
}

/**
 * The audio context, made on the first sound. Browsers start it only after the player touches the page, and iOS only
 * on a touch that ends (touchend, click), not on pointerdown; it also leaves it interrupted after a call or Siri.
 */
export function audioContext(): AudioContext {
  if (context === null) {
    // iOS: play through the silent switch, as a game should (Safari 17)
    const session = (navigator as Navigator & { audioSession?: { type: string } }).audioSession;
    if (session !== undefined) session.type = 'playback';
    const ctx = new AudioContext();
    context = ctx;
    const gesture = () => {
      if (ctx.state !== 'running' && ctx.state !== 'closed' && document.visibilityState === 'visible') {
        ctx.resume().catch(() => undefined);
      }
      for (const waiter of gestureWaiters.splice(0)) waiter();
    };
    for (const type of ['pointerdown', 'pointerup', 'touchend', 'click', 'keydown']) {
      globalThis.addEventListener(type, gesture, true);
    }
  }
  return context;
}

/** Ogg Vorbis decoded with WebAssembly, for browsers that cannot read it. */
async function decodedOgg(bytes: Uint8Array): Promise<AudioBuffer> {
  const { decodeOggVorbis } = await import('./oggDecoder.ts');
  const sound = await decodeOggVorbis(bytes);
  const buffer = audioContext().createBuffer(sound.channelData.length, sound.samplesDecoded, sound.sampleRate);
  sound.channelData.forEach((samples, channel) => buffer.copyToChannel(samples.subarray(0, sound.samplesDecoded) as Float32Array<ArrayBuffer>, channel));
  return buffer;
}

/** A clip from a file's bytes, decoded first when the browser cannot read it, or the error. */
async function webClip(file: string, bytes: Uint8Array, type: string, imported = false): Promise<WebClip | string> {
  if (type !== 'audio/ogg' || readsOgg()) {
    return new Audio().canPlayType(type) === '' ? 'Unsupported audio format' : { file, bytes, type, imported };
  }
  try {
    return { file, bytes, type, imported, buffer: await decodedOgg(bytes) };
  } catch (error) {
    return 'Unable to decode Ogg: ' + String(error);
  }
}

// Valkyrie: Audio.cs audioSource
class WebMusic implements MusicSource<WebClip> {
  isPlaying = false;
  private level = 1;
  private gain: GainNode | null = null;
  private element: HTMLAudioElement | null = null;
  private source: MediaElementAudioSourceNode | null = null;
  private bufferSource: AudioBufferSourceNode | null = null;
  private url: string | null = null;

  get volume(): number {
    return this.level;
  }

  set volume(value: number) {
    this.level = Math.min(1, Math.max(0, value));
    if (this.gain !== null) this.gain.gain.value = this.level;
  }

  play(clip: WebClip): void {
    this.stop();
    const ctx = audioContext();
    if (this.gain === null) {
      this.gain = ctx.createGain();
      this.gain.connect(ctx.destination);
    }
    this.gain.gain.value = this.level;
    if (clip.buffer !== undefined) {
      const source = ctx.createBufferSource();
      source.buffer = clip.buffer;
      source.connect(this.gain);
      source.onended = () => {
        if (source === this.bufferSource) this.stop();
      };
      source.start();
      this.bufferSource = source;
      this.isPlaying = true;
      return;
    }
    const url = URL.createObjectURL(new Blob([clip.bytes.slice()], { type: clip.type }));
    const element = new Audio(url);
    const ended = () => {
      if (element === this.element) this.stop();
    };
    element.addEventListener('ended', ended);
    element.addEventListener('error', ended);
    this.source = ctx.createMediaElementSource(element);
    this.source.connect(this.gain);
    this.element = element;
    this.url = url;
    this.isPlaying = true;
    element.play().catch((error: unknown) => {
      // Not allowed until the player touches the page: it plays then
      if (error instanceof DOMException && error.name === 'NotAllowedError') {
        gestureWaiters.push(() => {
          if (element === this.element) element.play().catch(ended);
        });
      } else ended();
    });
  }

  stop(): void {
    this.element?.pause();
    this.source?.disconnect();
    if (this.bufferSource !== null) {
      const source = this.bufferSource;
      this.bufferSource = null;
      source.onended = null;
      source.stop();
      source.disconnect();
    }
    if (this.url !== null) URL.revokeObjectURL(this.url);
    this.element = null;
    this.source = null;
    this.url = null;
    this.isPlaying = false;
  }
}

/** The effects that are playing, which StopAudioEffect stops. */
const effects = new Set<AudioBufferSourceNode>();
/** Valkyrie's own sounds, fetched once. */
const resources = new Map<string, Promise<WebClip | string>>();

const output: AudioOutput<WebClip> = {
  music: new WebMusic(),

  async getAudioClip(file: string): Promise<WebClip | string> {
    // The official import's sounds are in its store
    const imported = await importedFile(file);
    const bytes = imported ?? fileSystem().readFile(file);
    if (bytes === null || bytes.length === 0) return 'File not found';
    const type = TYPES[Path.getExtension(file).toLowerCase()];
    if (type === undefined) return 'Unsupported audio format';
    return webClip(file, bytes, type, imported !== null);
  },

  loadResource(name: string): Promise<WebClip | string> {
    let sound = resources.get(name);
    if (sound === undefined) {
      sound = fetch(resourceUrl(`Resources/${name}.ogg`))
        .then(async (response) => (response.ok ? webClip(name, new Uint8Array(await response.arrayBuffer()), 'audio/ogg') : `HTTP ${response.status}`))
        .catch((error: unknown) => String(error));
      resources.set(name, sound);
    }
    return sound;
  },

  playOneShot(clip: WebClip, volume: number): void {
    const ctx = audioContext();
    const decoded = clip.buffer !== undefined ? Promise.resolve(clip.buffer) : ctx.decodeAudioData(clip.bytes.slice().buffer);
    decoded.then(
      (buffer) => {
        const gain = ctx.createGain();
        gain.gain.value = volume;
        gain.connect(ctx.destination);
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(gain);
        source.onended = () => {
          effects.delete(source);
          gain.disconnect();
        };
        effects.add(source);
        source.start();
      },
      (error: unknown) => ValkyrieDebug.log('Warning: Unable to load audio: ' + clip.file + ' Error: ' + String(error)),
    );
  },

  stopEffects(): void {
    for (const source of effects) source.stop();
    effects.clear();
  },
};

let player: AudioPlayer<WebClip> | null = null;

/** Valkyrie's game.audioControl, made when the first sound is needed, with the user's settings. */
// Valkyrie: Game.cs Game.Awake (audioControl = go.AddComponent<Audio>())
export function audioPlayer(): AudioPlayer<WebClip> {
  if (player === null) {
    const config = Game.get().config.data;
    // Not in Valkyrie: a scenario's own music has a volume of its own, among the app's settings (ui/preferences.ts)
    const created = new AudioPlayer(output, config.get('UserConfig', 'music'), config.get('UserConfig', 'effects'), config.get('Universalis', 'customMusic'));
    player = created;
    // Unity's fixed time step: 0.02 s
    setInterval(() => created.fixedUpdate(), 20);
  }
  return player;
}

/** StopAudioEffect, which needs no player when nothing has played yet. */
export function stopAudioEffects(): void {
  player?.stopAudioEffect();
}

/** Not in Valkyrie: silence while the app is hidden (another app, the screen off), and sound again when it comes back. */
export function pauseWhileHidden(hidden: boolean): void {
  if (context === null) return;
  void (hidden ? context.suspend() : context.resume()).catch(() => undefined);
}
