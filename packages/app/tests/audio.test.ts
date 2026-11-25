// Characterization tests of the sound player, written from Valkyrie's Audio.cs (Start, FixedUpdate, the PlayMusic and
// PlayEffect coroutines, UpdateMusic and StopAudioEffect), which has no NUnit tests. Not ported from Valkyrie.
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { ValkyrieDebug } from '@universalis/engine';
import { AudioPlayer, type AudioOutput, type Clip, type MusicSource } from '../src/audio/player.ts';

class FakeMusic implements MusicSource<Clip> {
  isPlaying = false;
  volume = 1;
  played: string[] = [];

  play(clip: Clip): void {
    this.isPlaying = true;
    this.played.push(clip.file);
  }

  stop(): void {
    this.isPlaying = false;
  }
}

class FakeOutput implements AudioOutput<Clip> {
  readonly music = new FakeMusic();
  readonly files = new Set(['a.ogg', 'b.ogg', 'x.ogg']);
  readonly shots: [string, number][] = [];
  stops = 0;

  async getAudioClip(file: string): Promise<Clip | string> {
    return this.files.has(file) ? { file } : 'Not found';
  }

  async loadResource(name: string): Promise<Clip | string> {
    return { file: name };
  }

  playOneShot(clip: Clip, volume: number): void {
    this.shots.push([clip.file, volume]);
  }

  stopEffects(): void {
    this.stops++;
  }
}

let output: FakeOutput;
let logs: string[];
let stopLog: () => void;

describe('AudioPlayer', () => {
  beforeEach(() => {
    output = new FakeOutput();
    logs = [];
    stopLog = ValkyrieDebug.onLog((m) => logs.push(m ?? ''));
  });

  afterEach(() => {
    stopLog();
  });

  it('Start_ReadsTheVolumesFromTheUserConfig', () => {
    let player = new AudioPlayer(output, '', '');
    expect([player.musicVolume, player.effectVolume, output.music.volume]).toEqual([1, 1, 1]);
    player = new AudioPlayer(output, '0.25', '0.5');
    expect([player.musicVolume, player.effectVolume, output.music.volume]).toEqual([0.25, 0.5, 0.25]);
    // float.TryParse leaves 0 when the setting is not a number
    player = new AudioPlayer(output, 'loud', '');
    expect(player.musicVolume).toBe(0);
  });

  // Not in Valkyrie: the import's music and a scenario's own have each a volume
  it("plays the import's music and a scenario's own each at its volume", async () => {
    output.getAudioClip = async (file) => ({ file, imported: file.startsWith('import/') });
    const player = new AudioPlayer(output, '0.25', '', '0.75');
    await player.playMusic(['import/a.ogg', 'own.ogg'], false);
    player.fixedUpdate();
    expect([output.music.played, output.music.volume]).toEqual([['import/a.ogg'], 0.25]);
    // The options change them while it plays
    player.setMusicVolumes(0.5, 0.875);
    expect(output.music.volume).toBe(0.5);
    output.music.stop();
    player.fixedUpdate();
    expect([output.music.played, output.music.volume]).toEqual([['import/a.ogg', 'own.ogg'], 0.875]);
    // Never set, a scenario's own plays whole
    expect(new AudioPlayer(output, '0.25', '').customMusicVolume).toBe(1);
  });

  it('PlayMusic_LoopsAndFallsBackToTheDefaultQuestMusic', async () => {
    const player = new AudioPlayer(output, '', '');
    await player.playMusic(['a.ogg', 'missing.ogg', 'b.ogg'], true);
    expect(player.music.map((c) => c.file)).toEqual(['a.ogg', 'b.ogg']);
    expect(player.defaultQuestMusic).toBe(player.music);

    player.fixedUpdate();
    player.fixedUpdate();
    expect(output.music.played).toEqual(['a.ogg']);
    // Each track that ends starts the next one, and the list starts again
    output.music.stop();
    player.fixedUpdate();
    output.music.stop();
    player.fixedUpdate();
    expect(output.music.played).toEqual(['a.ogg', 'b.ogg', 'a.ogg']);

    // New music fades the playing one out, a hundredth of the volume each fixed step, and plays in the step it stops
    await player.playMusic(['x.ogg'], false);
    expect(player.fadeOut).toBe(true);
    let steps = 0;
    while (player.fadeOut && steps < 200) {
      player.fixedUpdate();
      steps++;
      if (player.fadeOut) expect(output.music.volume).toBeLessThan(1);
    }
    expect(steps).toBeGreaterThanOrEqual(100);
    expect(steps).toBeLessThanOrEqual(101);
    expect(output.music.volume).toBe(1);
    expect(output.music.played.at(-1)).toBe('x.ogg');

    // Once it ends, the quest's default music comes back
    output.music.stop();
    player.fixedUpdate();
    expect(output.music.played.at(-1)).toBe('a.ogg');
  });

  it('StopMusic_FadesOutAndPlaysNothingElse', async () => {
    const player = new AudioPlayer(output, '', '');
    await player.playMusic(['a.ogg'], false);
    player.fixedUpdate();
    await player.playMusic([], false);
    for (let i = 0; i < 150; i++) player.fixedUpdate();
    expect(output.music.isPlaying).toBe(false);
    expect(output.music.played).toEqual(['a.ogg']);
  });

  it('PlayMusic_WaitsWhileOtherMusicIsBeingFetched', async () => {
    const player = new AudioPlayer(output, '', '');
    const first = player.playMusic(['a.ogg'], true);
    const second = player.playMusic(['b.ogg'], false);
    await Promise.all([first, second]);
    expect(player.music.map((c) => c.file)).toEqual(['b.ogg']);
    expect(player.defaultQuestMusic!.map((c) => c.file)).toEqual(['a.ogg']);
  });

  it('PlayEffect_PlaysOnceAtTheEffectVolumeOrWarns', async () => {
    const player = new AudioPlayer(output, '', '0.5');
    await player.playEffect('a.ogg');
    await player.playEffect('missing.ogg');
    expect(output.shots).toEqual([['a.ogg', 0.5]]);
    expect(logs).toEqual(['Warning: Unable to load audio: missing.ogg Error: Not found']);

    player.stopAudioEffect();
    expect(output.stops).toBe(1);

    await player.playTest();
    expect(output.shots.at(-1)).toEqual(['test', 0.5]);
  });
});
