// Not in Valkyrie: plays a game's menu sound (menuSound.ts) with the Web Audio API: the bed of wind, the sounds now and
// then, and the game's music over them (menuSchedule.ts says when). It has a volume of its own in the options, the
// menus' (ui/preferences.ts), and tells the backdrop when a lightning falls so that it is seen before it is
// heard. Valkyrie's own player (player.ts) keeps playing the scenarios' music; this one only sounds in the menus.
import { Game, floatTryParse } from '@universalis/engine';
import { piecesHere, pieceUrl, type MusicCredit, type Piece } from './appMusic.ts';
import { MENU_SOUNDS, soundUrl, type Bed, type MenuGame, type MenuSound, type Plane, type Sometimes } from './menuSound.ts';
import { MusicSchedule, Occasion, between, pickOther } from './menuSchedule.ts';
import { ownVolume } from '../ui/preferences.ts';
import { audioContext } from './webAudio.ts';

/** A lightning: how near, where across the sky (0 to 1) and how bright (0 to 1). */
export interface Lightning {
  plane: Plane;
  at: number;
  power: number;
}

const lightningListeners = new Set<(lightning: Lightning) => void>();

/** Tells of each lightning of the menu's storm, as it falls; returns how to stop listening. */
export function onLightning(listener: (lightning: Lightning) => void): () => void {
  lightningListeners.add(listener);
  return () => lightningListeners.delete(listener);
}

/** A lightning falls: whoever draws the storm is told. */
export function lightningFalls(lightning: Lightning): void {
  for (const listener of lightningListeners) listener(lightning);
}

/** A volume of the user's config (music, effects): 1 when it was never set. */
export function volumeSetting(setting: string): number {
  const saved = Game.get().config.data.get('UserConfig', setting);
  return saved.length === 0 ? 1 : Math.min(1, Math.max(0, floatTryParse(saved).value));
}

/** The bed's decoded sounds, kept: they play all the time. The others are decoded when they sound. */
const kept = new Map<string, Promise<AudioBuffer | null>>();

function decoded(ctx: AudioContext, url: string): Promise<AudioBuffer | null> {
  return fetch(url)
    .then((response) => (response.ok ? response.arrayBuffer() : Promise.reject(new Error(`HTTP ${response.status}`))))
    .then((bytes) => ctx.decodeAudioData(bytes))
    .catch(() => null);
}

/** A curve from 0 to 1 that keeps the loudness even when two sounds cross. */
const RISE = Float32Array.from({ length: 33 }, (_, i) => Math.sin((i / 32) * (Math.PI / 2)));
const FALL = Float32Array.from(RISE).reverse();

/** A room's echo, made of noise that dies away. */
function echoOf(ctx: AudioContext, seconds: number): AudioBuffer {
  const length = Math.floor(ctx.sampleRate * seconds);
  const buffer = ctx.createBuffer(2, length, ctx.sampleRate);
  for (let channel = 0; channel < 2; channel++) {
    const samples = buffer.getChannelData(channel);
    for (let i = 0; i < length; i++) samples[i] = (Math.random() * 2 - 1) * (1 - i / length) ** 3;
  }
  return buffer;
}

const TICK_MS = 200;
const STOP_SECONDS = 1.5;

class Playing {
  readonly game: MenuGame;
  private readonly sound: MenuSound;
  private readonly pieces: Piece[];
  private readonly ctx: AudioContext;
  private readonly out: GainNode;
  private readonly ambience: GainNode;
  private readonly music: GainNode;
  private readonly echo: GainNode | null = null;
  private readonly timer: ReturnType<typeof setInterval>;
  private readonly sources = new Set<AudioBufferSourceNode>();
  private stopped = false;
  // The bed
  private bedFilter: BiquadFilterNode | null = null;
  private bedGain: GainNode | null = null;
  private bedBuffers: AudioBuffer[] = [];
  private bedLast = -1;
  private bedNextAt = 0;
  private gust: Occasion | null = null;
  // The sounds now and then
  private occasions: { what: Sometimes; when: Occasion; last: number }[] = [];
  // The music
  private schedule: MusicSchedule | null = null;
  private element: HTMLAudioElement | null = null;
  private pausedByUs = false;
  private ahead: { piece: Piece; url: Promise<string | null> } | null = null;

  constructor(game: MenuGame) {
    this.game = game;
    this.sound = MENU_SOUNDS[game];
    this.pieces = piecesHere(this.sound.music);
    const ctx = audioContext();
    this.ctx = ctx;
    this.out = ctx.createGain();
    this.out.gain.value = ownVolume('menuSound');
    this.out.connect(ctx.destination);
    this.ambience = ctx.createGain();
    this.ambience.connect(this.out);
    this.music = ctx.createGain();
    this.music.connect(this.out);
    if (this.sound.echo !== undefined) {
      const convolver = ctx.createConvolver();
      convolver.buffer = echoOf(ctx, this.sound.echo.seconds);
      this.echo = ctx.createGain();
      this.echo.gain.value = this.sound.echo.level;
      this.echo.connect(convolver);
      convolver.connect(this.ambience);
    }
    const bed = this.sound.bed;
    if (bed !== undefined) {
      void Promise.all(
        bed.files.map((file) => {
          let buffer = kept.get(file);
          if (buffer === undefined) kept.set(file, (buffer = decoded(ctx, soundUrl(file))));
          return buffer;
        }),
      ).then((buffers) => (this.bedBuffers = buffers.filter((buffer) => buffer !== null)));
    }
    this.timer = setInterval(() => this.tick(), TICK_MS);
    this.tick();
  }

  credits(): MusicCredit[] {
    return [...new Map(this.pieces.map((piece) => [piece.credit.author, piece.credit])).values()];
  }

  /** Fades everything out and lets go of it. */
  stop(): void {
    if (this.stopped) return;
    this.stopped = true;
    clearInterval(this.timer);
    const now = this.ctx.currentTime;
    this.out.gain.setValueAtTime(this.out.gain.value, now);
    this.out.gain.linearRampToValueAtTime(0, now + STOP_SECONDS);
    // A context that is not running never gets there: let go at once
    setTimeout(
      () => {
        for (const source of this.sources) source.stop();
        this.sources.clear();
        this.element?.pause();
        this.element = null;
        void this.ahead?.url.then((url) => url !== null && URL.revokeObjectURL(url));
        this.out.disconnect();
      },
      this.ctx.state === 'running' ? STOP_SECONDS * 1000 + 100 : 0,
    );
  }

  private tick(): void {
    const ctx = this.ctx;
    if (ctx.state !== 'running') {
      // Hidden, or not touched yet: the music waits where it is
      if (this.element !== null && !this.element.paused) {
        this.element.pause();
        this.pausedByUs = true;
      }
      return;
    }
    if (this.pausedByUs) {
      this.pausedByUs = false;
      this.element?.play().catch(() => undefined);
    }
    const now = ctx.currentTime;
    this.out.gain.setTargetAtTime(ownVolume('menuSound'), now, 0.1);

    if (this.schedule === null) {
      // The ambience begins now; the music counts from here
      this.schedule = new MusicSchedule(this.pieces.length, this.sound.timing, now);
      this.occasions = this.sound.sometimes.map((what) => ({ what, when: new Occasion(what.every, now, what.first), last: -1 }));
      this.gust = new Occasion([4, 9], now);
      if (this.pieces.length > 0) void this.fetched(this.pieces[0]!);
    }

    const bed = this.sound.bed;
    if (bed !== undefined && this.bedBuffers.length > 0) this.windBlows(bed, now);
    for (const occasion of this.occasions) {
      // Where a screen draws its own storm, its lightnings bring the thunder (thunders)
      if (occasion.when.due(now) && !(ownStorms > 0 && occasion.what.lightning !== undefined)) this.sounds(occasion, now);
    }
    const piece = this.schedule.due(now);
    if (piece !== null) this.plays(this.pieces[piece]!);
  }

  /** The wind: one file crossing into another, each at its own speed, in gusts that open and close its filter. */
  private windBlows(bed: Bed, now: number): void {
    const ctx = this.ctx;
    if (this.bedFilter === null || this.bedGain === null) {
      this.bedFilter = ctx.createBiquadFilter();
      this.bedFilter.type = 'lowpass';
      this.bedFilter.frequency.value = between(bed.lowpass);
      this.bedGain = ctx.createGain();
      this.bedGain.gain.value = bed.level * 0.7;
      this.bedFilter.connect(this.bedGain);
      this.bedGain.connect(this.ambience);
      this.bedNextAt = now;
    }
    if (this.gust!.due(now)) {
      this.bedGain.gain.setTargetAtTime(bed.level * between([0.45, 1]), now, 2.5);
      this.bedFilter.frequency.setTargetAtTime(between(bed.lowpass), now, 3);
    }
    if (now < this.bedNextAt - TICK_MS / 1000) return;
    this.bedLast = pickOther(this.bedBuffers.length, this.bedLast);
    const buffer = this.bedBuffers[this.bedLast]!;
    const rate = between(bed.rate);
    const lasts = buffer.duration / rate;
    const cross = Math.min(2, lasts / 3);
    const at = Math.max(now, this.bedNextAt);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, at);
    gain.gain.setValueCurveAtTime(RISE, at, cross);
    gain.gain.setValueCurveAtTime(FALL, at + lasts - cross, cross - 0.01);
    gain.connect(this.bedFilter);
    this.starts(buffer, rate, gain, at);
    this.bedNextAt = at + lasts - cross;
  }

  /** A sound now and then: another of its files, at another speed and loudness, from another side. */
  private sounds(occasion: { what: Sometimes; last: number }, now: number, seen = false): void {
    const { what } = occasion;
    const ctx = this.ctx;
    occasion.last = pickOther(what.files.length, occasion.last);
    const volume = between(what.volume);
    const at = now + (what.delay === undefined ? 0 : between(what.delay));
    if (what.lightning !== undefined && !seen) {
      lightningFalls({ plane: what.lightning, at: Math.random(), power: (volume - what.volume[0]) / (what.volume[1] - what.volume[0] || 1) });
    }
    void decoded(ctx, soundUrl(what.files[occasion.last]!)).then((buffer) => {
      if (buffer === null || this.stopped) return;
      const start = Math.max(at, ctx.currentTime);
      const rate = between(what.rate);
      const gain = ctx.createGain();
      if (what.fade === undefined) gain.gain.value = volume;
      else {
        const lasts = buffer.duration / rate;
        const fade = Math.min(what.fade, lasts / 2.1);
        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(volume, start + fade);
        gain.gain.setValueAtTime(volume, start + lasts - fade);
        gain.gain.linearRampToValueAtTime(0, start + lasts);
      }
      let last: AudioNode = gain;
      if (typeof StereoPannerNode !== 'undefined') {
        const panner = ctx.createStereoPanner();
        panner.pan.value = between(what.pan);
        gain.connect(panner);
        last = panner;
      }
      last.connect(this.ambience);
      if (this.echo !== null) last.connect(this.echo);
      let first: AudioNode = gain;
      if (what.lowpass !== undefined) {
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = between(what.lowpass);
        filter.connect(gain);
        first = filter;
      }
      this.starts(buffer, rate, first, start, last);
    });
  }

  /** The thunder of a lightning a screen has drawn itself. */
  thunders(plane: Plane): void {
    const occasion = this.occasions.find(({ what }) => what.lightning === plane);
    if (occasion !== undefined && this.ctx.state === 'running') this.sounds(occasion, this.ctx.currentTime, true);
  }

  private starts(buffer: AudioBuffer, rate: number, into: AudioNode, at: number, last: AudioNode = into): void {
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.playbackRate.value = rate;
    source.connect(into);
    source.onended = () => {
      this.sources.delete(source);
      source.disconnect();
      last.disconnect();
    };
    this.sources.add(source);
    source.start(at);
  }

  /** A piece's file, whole, as an address of the page's own: asked for ahead, and kept by the service worker. */
  private fetched(piece: Piece): Promise<string | null> {
    if (this.ahead?.piece !== piece) {
      const url = fetch(pieceUrl(piece)!)
        .then((response) => (response.ok ? response.blob() : Promise.reject(new Error(`HTTP ${response.status}`))))
        .then((blob) => URL.createObjectURL(blob))
        .catch(() => null);
      this.ahead = { piece, url };
    }
    return this.ahead.url;
  }

  /** A piece of the music, fading in; when it ends, the ambience is alone for a while. */
  private plays(piece: Piece): void {
    const ctx = this.ctx;
    void this.fetched(piece).then((url) => {
      if (this.stopped) return;
      if (url === null) {
        this.schedule?.ended(ctx.currentTime);
        return;
      }
      const now = ctx.currentTime;
      const element = new Audio(url);
      const source = ctx.createMediaElementSource(element);
      const gain = ctx.createGain();
      const level = piece.level ?? 1;
      const fadeIn = this.sound.timing.fadeIn;
      if (fadeIn > 0) {
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(level, now + fadeIn);
      } else gain.gain.value = level;
      source.connect(gain);
      gain.connect(this.music);
      const ended = () => {
        if (element !== this.element) return;
        this.element = null;
        source.disconnect();
        gain.disconnect();
        URL.revokeObjectURL(url);
        this.ahead = null;
        this.schedule?.ended(ctx.currentTime);
        // The next one, on its way while the ambience is alone
        if (!this.stopped) void this.fetched(this.pieces[(this.pieces.indexOf(piece) + 1) % this.pieces.length]!);
      };
      element.addEventListener('ended', ended);
      element.addEventListener('error', ended);
      this.element = element;
      this.pausedByUs = false;
      element.play().catch(ended);
    });
  }
}

let playing: Playing | null = null;
/** How many screens are drawing a storm of their own. */
let ownStorms = 0;

/** A screen draws its own storm (the investigators' room): the menu's stops falling until it says otherwise. */
export function ownStorm(on: boolean): void {
  ownStorms = Math.max(0, ownStorms + (on ? 1 : -1));
}

/** A screen's own lightning fell: its thunder follows, if the menu's sound has a storm. */
export function thunders(plane: Plane): void {
  playing?.thunders(plane);
}

/** A game's main menu opens: its sound begins, or goes on if it was already playing. */
export function playMenuSound(game: MenuGame): void {
  if (playing?.game === game) return;
  playing?.stop();
  playing = new Playing(game);
}

/** Out of a game's menus and of its choice of heroes (the game selection, a game, the editor): its sound fades out. */
export function stopMenuSound(): void {
  playing?.stop();
  playing = null;
}

/** The game whose menu sound plays now, if any. */
export function menuSoundOf(): MenuGame | null {
  return playing?.game ?? null;
}

/** Who made the music the menus play now. */
export function menuMusicCredits(): MusicCredit[] {
  return playing?.credits() ?? [];
}
