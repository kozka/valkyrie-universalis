// Checks the battery runs on each loaded quest. Each one repeats a lookup Valkyrie makes while the quest is played,
// so a warning here is a problem a player meets: a missing picture or sound, a tile that cannot be drawn, an event
// that adds a component that does not exist. Not ported from Valkyrie; each check names the Valkyrie code it follows.
import {
  AudioData,
  ContentData,
  File,
  ImageData,
  IniRead,
  MonsterData,
  PuzzleData,
  Quest,
  QuestData,
  TileSideData,
  TokenData,
  type Game,
} from '../../packages/engine/src/index.ts';

export type WarningKind =
  | 'missing-media'
  | 'tile-side-missing'
  | 'tile-image-missing'
  | 'token-type-missing'
  | 'add-missing-component'
  | 'missing-localization'
  | 'duplicate-section'
  | 'duplicate-key'
  | 'empty-section'
  | 'data-without-section'
  | 'letter-case'
  | 'backslash'
  | 'mixed-line-endings';

export interface Warning {
  kind: WarningKind;
  detail: string;
}

/** Warnings from what IniRead and DictionaryI18n log while the quest loads. */
export function warningsFromLog(log: readonly string[]): Warning[] {
  const warnings: Warning[] = [];
  for (const message of log) {
    if (message.startsWith('Warning: duplicate section')) warnings.push({ kind: 'duplicate-section', detail: message });
    else if (message.startsWith('Warning: duplicate "')) warnings.push({ kind: 'duplicate-key', detail: message });
    else if (message.startsWith('Warning: empty section')) warnings.push({ kind: 'empty-section', detail: message });
    else if (/^Warning: data .* without section in /s.test(message)) warnings.push({ kind: 'data-without-section', detail: message });
    else if (message.startsWith('Error loading localization file')) warnings.push({ kind: 'missing-localization', detail: message });
  }
  return warnings;
}

/** A pack image by name, else a file in the quest folder: Quest.cs Tile, Token and UI. */
function imageExists(game: Game, name: string, questDir: string): boolean {
  const data = game.cd.tryGet(ImageData, name);
  return ContentData.resolveTextureFile(data ? data.image : Quest.findLocalisedMultimediaFile(name, questDir)) !== null;
}

/** A pack sound by name, else a file in the quest folder: EventManager.TriggerEvent. */
function audioExists(game: Game, name: string, questDir: string): boolean {
  const data = game.cd.tryGet(AudioData, name);
  return File.exists(data ? data.file : Quest.findLocalisedMultimediaFile(name, questDir));
}

export function checkComponents(game: Game, qd: QuestData, questDir: string): Warning[] {
  const warnings: Warning[] = [];
  const warn = (kind: WarningKind, detail: string) => warnings.push({ kind, detail });

  for (const [name, c] of qd.components) {
    // Quest.cs Tile: a missing TileSide or picture is fatal when the tile is placed
    if (c instanceof QuestData.Tile) {
      if (c.customImage.length > 0) {
        if (c.customImage.includes('\\')) warn('backslash', `${name}: customImage=${c.customImage}`);
        if (!imageExists(game, c.customImage, questDir)) warn('tile-image-missing', `${name}: ${c.customImage}`);
      } else {
        const side = game.cd.tryGet(TileSideData, c.tileSideName) ?? game.cd.tryGet(TileSideData, 'TileSide' + c.tileSideName);
        if (side === undefined) warn('tile-side-missing', `${name}: ${c.tileSideName}`);
        else if (ContentData.resolveTextureFile(side.image) === null) warn('tile-image-missing', `${name}: ${side.image}`);
      }
    }

    // Quest.cs Token: a token without picture is not drawn
    if (c instanceof QuestData.Token) {
      if (c.customImage.length > 0) {
        if (c.customImage.includes('\\')) warn('backslash', `${name}: customImage=${c.customImage}`);
        if (!imageExists(game, c.customImage, questDir)) warn('missing-media', `${name}: ${c.customImage}`);
      } else if (game.cd.containsKey(TokenData, c.tokenName)) {
        const image = game.cd.get(TokenData, c.tokenName).image;
        if (ContentData.resolveTextureFile(image) === null) warn('missing-media', `${name}: ${image}`);
      } else if (game.cd.containsKey(MonsterData, c.tokenName)) {
        const image = game.cd.get(MonsterData, c.tokenName).image;
        if (ContentData.resolveTextureFile(image) === null) warn('missing-media', `${name}: ${image}`);
      } else {
        warn('token-type-missing', `${name}: ${c.tokenName}`);
      }
    }

    // Quest.cs UI
    if (c instanceof QuestData.UI && c.imageName.length > 0 && !imageExists(game, c.imageName, questDir)) {
      warn('missing-media', `${name}: ${c.imageName}`);
    }

    if (c instanceof QuestData.Event) {
      // EventManager.TriggerEvent: sounds
      if (c.audio.length > 0 && !audioExists(game, c.audio, questDir)) warn('missing-media', `${name}: ${c.audio}`);
      for (const music of c.music) {
        if (!audioExists(game, music, questDir)) warn('missing-media', `${name}: ${music}`);
      }
      // Quest.Add: adding a component that does not exist is fatal
      for (const added of c.addComponents) {
        if (!qd.components.has(added)) warn('add-missing-component', `${name}: ${added}`);
      }
    }

    // PuzzleImageWindow: a pack puzzle picture by name, else a file in the quest folder
    if (c instanceof QuestData.Puzzle && c.puzzleClass === 'image') {
      const data = game.cd.tryGet(PuzzleData, c.imageType);
      if (ContentData.resolveTextureFile(data ? data.image : questDir + '/' + c.imageType) === null) {
        warn('missing-media', `${name}: ${c.imageType}`);
      }
    }

    // QuestMonster: pictures straight from the quest folder; imageplace keeps its backslashes
    if (c instanceof QuestData.CustomMonster) {
      if (c.imagePlace.includes('\\')) warn('backslash', `${name}: imageplace=${c.imagePlace}`);
      for (const image of [c.getImagePath(), c.getImagePlacePath()]) {
        if (image.length > 0 && ContentData.resolveTextureFile(questDir + '/' + image) === null) {
          warn('missing-media', `${name}: ${image}`);
        }
      }
    }
  }
  return warnings;
}

/** Localization files that mix line endings: DictionaryI18n splits on '\r' alone as soon as a file has one. */
export function checkLineEndings(questDir: string): Warning[] {
  const warnings: Warning[] = [];
  const questText = IniRead.readFromIniSection(questDir + '/quest.ini', 'QuestText');
  for (const file of questText?.keys() ?? []) {
    const path = questDir + '/' + file;
    if (!File.exists(path)) continue;
    const bytes = File.readAllBytes(path);
    let crlf = 0;
    let cr = 0;
    let lf = 0;
    for (let i = bytes.indexOf(0x0d); i !== -1; i = bytes.indexOf(0x0d, i + 1)) {
      if (bytes[i + 1] === 0x0a) crlf++;
      else cr++;
    }
    for (let i = bytes.indexOf(0x0a); i !== -1; i = bytes.indexOf(0x0a, i + 1)) lf++;
    lf -= crlf;
    if ((crlf > 0 ? 1 : 0) + (cr > 0 ? 1 : 0) + (lf > 0 ? 1 : 0) > 1) {
      warnings.push({ kind: 'mixed-line-endings', detail: `${file}: ${crlf} CRLF, ${lf} LF, ${cr} CR` });
    }
  }
  return warnings;
}
