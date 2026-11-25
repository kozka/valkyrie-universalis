// Ported from Valkyrie (Apache-2.0), modified: unity/Assets/Scripts/Audio.cs
// What Valkyrie's Audio MonoBehaviour does with the files the engine names (engine/Audio.ts): music in a loop that
// falls back to the quest's default music and fades out when it changes, and effects played once. The sound itself
// goes through an AudioOutput (webAudio.ts in the browser), so this part runs in tests.
import { ValkyrieDebug, floatTryParse } from '@universalis/engine';

/** A sound that could be loaded (Unity's AudioClip). */
export interface Clip {
  readonly file: string;
  /** Not in Valkyrie: whether it is one of the official import's sounds, not a scenario's or a pack's own. */
  readonly imported?: boolean;
}

/** Valkyrie's audioSource, which plays the music. */
export interface MusicSource<C extends Clip> {
  readonly isPlaying: boolean;
  /** Unity keeps it between 0 and 1. */
  volume: number;
  play(clip: C): void;
  stop(): void;
}

export interface AudioOutput<C extends Clip> {
  readonly music: MusicSource<C>;
  /** UnityWebRequestMultimedia.GetAudioClip: the clip, or the error when it cannot be loaded. */
  getAudioClip(file: string): Promise<C | string>;
  /** Resources.Load: a sound built into Valkyrie (the options' test sound), or the error. */
  loadResource(name: string): Promise<C | string>;
  /** audioSourceEffect.PlayOneShot */
  playOneShot(clip: C, volume: number): void;
  /** audioSourceEffect.Stop */
  stopEffects(): void;
}

// Valkyrie: Audio.cs Audio
export class AudioPlayer<C extends Clip> {
  /** audioSource and audioSourceEffect, where the sound goes. */
  readonly output: AudioOutput<C>;
  music: C[] = [];
  fadeOut = false;
  musicIndex = 0;
  effectVolume = 0;
  musicVolume = 0;
  /** Not in Valkyrie: musicVolume is for the official import's music; this one, for a scenario's or a pack's own. */
  customMusicVolume = 1;
  /** Not in Valkyrie: the music that plays, which says which of the two volumes it has. */
  private playing: C | null = null;
  defaultQuestMusic: C[] | null = null;
  /** fetchingMusic: PlayMusic waits for the music being fetched. */
  private fetching: Promise<void> = Promise.resolve();

  /** Start(), with the music and effects settings of the user's config. */
  // Valkyrie: Audio.cs Audio.Start
  constructor(output: AudioOutput<C>, music: string, effects: string, customMusic = '') {
    this.output = output;
    this.customMusicVolume = customMusic.length === 0 ? 1 : floatTryParse(customMusic).value;
    this.musicVolume = floatTryParse(music).value;
    if (music.length === 0) this.musicVolume = 1;
    output.music.volume = this.musicVolume;

    this.music = [];
    this.defaultQuestMusic = null;

    this.effectVolume = floatTryParse(effects).value;
    if (effects.length === 0) this.effectVolume = 1;
  }

  /** Runs every fixed step, 50 times a second. */
  // Valkyrie: Audio.cs Audio.FixedUpdate
  fixedUpdate(): void {
    const audioSource = this.output.music;
    if (this.fadeOut) {
      audioSource.volume = Math.max(0, Math.fround(audioSource.volume - 0.01));
      if (audioSource.volume <= 0) {
        audioSource.volume = 0;
        this.fadeOut = false;
        audioSource.stop();
      }
    }
    if (!audioSource.isPlaying) {
      audioSource.volume = this.musicVolume;
      this.updateMusic();
    }
  }

  /** StopMusic, PlayDefaultQuestMusic and PlayMusic start this coroutine. */
  // Valkyrie: Audio.cs Audio.PlayMusic(List<string>, bool)
  playMusic(fileNames: string[], isDefaultQuestMusic: boolean): Promise<void> {
    const fetch = this.fetching.then(() => this.fetchMusic(fileNames, isDefaultQuestMusic));
    this.fetching = fetch.catch(() => {});
    return fetch;
  }

  private async fetchMusic(fileNames: string[], isDefaultQuestMusic: boolean): Promise<void> {
    const newMusic: C[] = [];
    for (const s of fileNames) {
      const clip = await this.output.getAudioClip(s);
      if (typeof clip !== 'string') newMusic.push(clip);
    }
    this.music = newMusic;
    if (isDefaultQuestMusic) {
      this.defaultQuestMusic = this.music;
    }

    this.musicIndex = 0;
    if (this.output.music.isPlaying) this.fadeOut = true;
  }

  // Valkyrie: Audio.cs Audio.PlayEffect
  async playEffect(fileName: string): Promise<void> {
    const clip = await this.output.getAudioClip(fileName);
    if (typeof clip === 'string') {
      ValkyrieDebug.log('Warning: Unable to load audio: ' + fileName + ' Error: ' + clip);
    } else {
      this.output.playOneShot(clip, this.effectVolume);
    }
  }

  // Valkyrie: Audio.cs Audio.PlayTest
  async playTest(): Promise<void> {
    const test = await this.output.loadResource('test');
    if (typeof test !== 'string') this.output.playOneShot(test, this.effectVolume);
  }

  // Valkyrie: Audio.cs Audio.UpdateMusic
  updateMusic(): void {
    if (this.music.length === 0) return;

    // if previous music has ended, play or restart default quest music
    if (this.musicIndex >= this.music.length) {
      this.musicIndex = 0;
      if (this.defaultQuestMusic !== null && this.defaultQuestMusic.length > 0) {
        this.music = this.defaultQuestMusic;
      }
    }

    // Not in Valkyrie: at the volume of its kind, the import's or the scenario's own
    this.playing = this.music[this.musicIndex]!;
    this.output.music.volume = this.volumeOf(this.playing);
    this.output.music.play(this.playing);
    // Set next music

    this.musicIndex++;
  }

  /** Not in Valkyrie: the music volume of a piece, by where it comes from. */
  private volumeOf(clip: C): number {
    return clip.imported === true ? this.musicVolume : this.customMusicVolume;
  }

  /** Not in Valkyrie: the options change the two music volumes, heard at once in the music that plays. */
  setMusicVolumes(imported: number, custom: number): void {
    this.musicVolume = imported;
    this.customMusicVolume = custom;
    if (this.playing !== null && this.output.music.isPlaying && !this.fadeOut) this.output.music.volume = this.volumeOf(this.playing);
  }

  // Valkyrie: Audio.cs Audio.StopAudioEffect
  stopAudioEffect(): void {
    this.output.stopEffects();
  }
}
