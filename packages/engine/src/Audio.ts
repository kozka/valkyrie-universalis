// Ported from Valkyrie (Apache-2.0), modified: unity/Assets/Scripts/Audio.cs
// Partial: which file to play. Loading and playing it (the PlayMusic and PlayEffect coroutines, volumes, fading) is
// the app's, through game.ui.
import { AudioData } from './Content/ContentTypes.ts';
import { Game } from './Game.ts';
import { listGet } from './platform/CSharp.ts';
import { Random } from './platform/Random.ts';

// Valkyrie: Audio.cs Audio
export class Audio {
  // Valkyrie: Audio.cs Audio.StopMusic
  stopMusic(): void {
    Game.get().ui.audioPlayMusic([], false);
  }

  // Valkyrie: Audio.cs Audio.PlayDefaultQuestMusic
  playDefaultQuestMusic(fileNames: string[]): void {
    Game.get().ui.audioPlayMusic(fileNames, true);
  }

  // Valkyrie: Audio.cs Audio.PlayMusic(List<string>)
  playMusic(fileNames: string[]): void {
    Game.get().ui.audioPlayMusic(fileNames, false);
  }

  // Valkyrie: Audio.cs Audio.PlayTrait
  playTrait(trait: string): void {
    const files: string[] = [];
    for (const ad of Game.get().cd.values(AudioData)) {
      if (ad.containsTrait(trait)) {
        files.push(ad.file);
      }
    }
    if (files.length > 0) Game.get().ui.audioPlayEffect(listGet(files, Random.range(0, files.length)));
  }

  // Valkyrie: Audio.cs Audio.Play
  play(file: string): void {
    if (file.length > 0) Game.get().ui.audioPlayEffect(file);
  }

  // Valkyrie: Audio.cs Audio.StopAudioEffect
  stopAudioEffect(): void {
    Game.get().ui.audioStopAudioEffect();
  }
}
