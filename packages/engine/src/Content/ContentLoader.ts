// Ported from Valkyrie (Apache-2.0), modified: unity/Assets/Scripts/ContentLoader.cs
// The generic C# class ContentLoader<T> is TypedContentLoader<T> here, since TypeScript cannot share the name.
import { Game } from '../Game.ts';
import { isNullOrWhiteSpace } from '../platform/CSharp.ts';
import { Application } from '../platform/Application.ts';
import { Path } from '../platform/SystemIO.ts';
import { IniRead } from '../ValkyrieTools/IniRead.ts';
import { ValkyrieDebug } from '../ValkyrieTools/ValkyrieDebug.ts';
import { ContentData } from './ContentData.ts';
import type { ContentPack } from './ContentPack.ts';
import {
  ActivationData,
  AttackData,
  AudioData,
  ClassData,
  EvadeData,
  HeroData,
  HorrorData,
  ImageData,
  ItemData,
  MonsterData,
  PackTypeData,
  PuzzleData,
  SkillData,
  TileSideData,
  TokenData,
} from './ContentTypes.ts';
import { DictionaryI18n } from './DictionaryI18n.ts';
import type { ContentType, IContent } from './IContent.ts';
import { LocalizationRead } from './LocalizationRead.ts';
import { PerilData } from './PerilData.ts';

// Valkyrie: ContentLoader.cs IContentLoader
export interface IContentLoader {
  supports(name: string): boolean;
  loadContent(cd: ContentData, name: string, content: Map<string, string>, path: string, sets: string[]): boolean;
}

// Valkyrie: ContentLoader.cs ContentLoader<T>
export abstract class TypedContentLoader<T extends IContent> implements IContentLoader {
  supports(name: string): boolean {
    return name.startsWith(this.typePrefix);
  }

  loadContent(cd: ContentData, name: string, content: Map<string, string>, path: string, sets: string[]): boolean {
    const t = this.create(name, content, path, sets);

    if (isNullOrWhiteSpace(t?.sectionName)) {
      ValkyrieDebug.log(`Ignored invalid entry ${name}`);
      return false;
    }

    const isNew = cd.addContent(this.contentType, name, t!);
    if (isNew && this.additionalTranslation) {
      t!.sets.forEach((id) => LocalizationRead.registerKeyInGroup(t!.translationKey, id));
    }

    return true;
  }

  protected get additionalTranslation(): boolean {
    return false;
  }

  protected abstract get typePrefix(): string;

  /** typeof(T), the key of this content in ContentData. */
  protected abstract get contentType(): ContentType<T>;

  protected abstract create(name: string, content: Map<string, string>, path: string, sets: string[]): T | null;
}

// Valkyrie: ContentLoader.cs PackTypeDataLoader
export class PackTypeDataLoader extends TypedContentLoader<PackTypeData> {
  protected get typePrefix() { return PackTypeData.type; }
  protected get contentType() { return PackTypeData; }
  protected create(name: string, content: Map<string, string>, path: string, sets: string[]) {
    return new PackTypeData(name, content, path, sets);
  }
}

// Valkyrie: ContentLoader.cs TileSideDataLoader
export class TileSideDataLoader extends TypedContentLoader<TileSideData> {
  protected get typePrefix() { return TileSideData.type; }
  protected get contentType() { return TileSideData; }
  protected create(name: string, content: Map<string, string>, path: string, sets: string[]) {
    return new TileSideData(name, content, path, sets);
  }
  protected override get additionalTranslation() { return true; }
}

// Valkyrie: ContentLoader.cs HeroDataLoader
export class HeroDataLoader extends TypedContentLoader<HeroData> {
  protected get typePrefix() { return HeroData.type; }
  protected get contentType() { return HeroData; }
  protected create(name: string, content: Map<string, string>, path: string, sets: string[]) {
    return new HeroData(name, content, path, sets);
  }
  protected override get additionalTranslation() { return true; }
}

// Valkyrie: ContentLoader.cs ClassDataLoader
export class ClassDataLoader extends TypedContentLoader<ClassData> {
  protected get typePrefix() { return ClassData.type; }
  protected get contentType() { return ClassData; }
  protected create(name: string, content: Map<string, string>, path: string, sets: string[]) {
    return new ClassData(name, content, path, sets);
  }
  protected override get additionalTranslation() { return true; }
}

// Valkyrie: ContentLoader.cs SkillDataLoader
export class SkillDataLoader extends TypedContentLoader<SkillData> {
  protected get typePrefix() { return SkillData.type; }
  protected get contentType() { return SkillData; }
  protected create(name: string, content: Map<string, string>, path: string, sets: string[]) {
    return new SkillData(name, content, path, sets);
  }
  protected override get additionalTranslation() { return true; }
}

// Valkyrie: ContentLoader.cs ItemDataLoader
export class ItemDataLoader extends TypedContentLoader<ItemData> {
  protected get typePrefix() { return ItemData.type; }
  protected get contentType() { return ItemData; }
  protected create(name: string, content: Map<string, string>, path: string, sets: string[]) {
    return new ItemData(name, content, path, sets);
  }
  protected override get additionalTranslation() { return true; }
}

// Valkyrie: ContentLoader.cs MonsterDataLoader
export class MonsterDataLoader extends TypedContentLoader<MonsterData> {
  protected get typePrefix() { return MonsterData.type; }
  protected get contentType() { return MonsterData; }
  protected create(name: string, content: Map<string, string>, path: string, sets: string[]) {
    return new MonsterData(name, content, path, sets);
  }
  protected override get additionalTranslation() { return true; }
}

// Valkyrie: ContentLoader.cs ActivationDataLoader
export class ActivationDataLoader extends TypedContentLoader<ActivationData> {
  protected get typePrefix() { return ActivationData.type; }
  protected get contentType() { return ActivationData; }
  protected create(name: string, content: Map<string, string>, path: string, sets: string[]) {
    return new ActivationData(name, content, path, sets);
  }
}

// Valkyrie: ContentLoader.cs AttackDataLoader
export class AttackDataLoader extends TypedContentLoader<AttackData> {
  protected get typePrefix() { return AttackData.type; }
  protected get contentType() { return AttackData; }
  protected create(name: string, content: Map<string, string>, path: string, sets: string[]) {
    return new AttackData(name, content, path, sets);
  }
}

// Valkyrie: ContentLoader.cs EvadeDataLoader
export class EvadeDataLoader extends TypedContentLoader<EvadeData> {
  protected get typePrefix() { return EvadeData.type; }
  protected get contentType() { return EvadeData; }
  protected create(name: string, content: Map<string, string>, path: string, sets: string[]) {
    return new EvadeData(name, content, path, sets);
  }
}

// Valkyrie: ContentLoader.cs HorrorDataLoader
export class HorrorDataLoader extends TypedContentLoader<HorrorData> {
  protected get typePrefix() { return HorrorData.type; }
  protected get contentType() { return HorrorData; }
  protected create(name: string, content: Map<string, string>, path: string, sets: string[]) {
    return new HorrorData(name, content, path, sets);
  }
}

// Valkyrie: ContentLoader.cs TokenDataLoader
export class TokenDataLoader extends TypedContentLoader<TokenData> {
  protected get typePrefix() { return TokenData.type; }
  protected get contentType() { return TokenData; }
  protected create(name: string, content: Map<string, string>, path: string, sets: string[]) {
    const d = new TokenData(name, content, path, sets);

    if (d.image === '') {
      ValkyrieDebug.log('Token ' + d.name.toString() + 'did not have an image. Skipping');
      return null;
    }

    return d;
  }
}

// Valkyrie: ContentLoader.cs PerilDataLoader
export class PerilDataLoader extends TypedContentLoader<PerilData> {
  protected get typePrefix() { return PerilData.type; }
  protected get contentType() { return PerilData; }
  protected create(name: string, content: Map<string, string>) {
    return new PerilData(name, content);
  }
}

// Valkyrie: ContentLoader.cs PuzzleDataLoader
export class PuzzleDataLoader extends TypedContentLoader<PuzzleData> {
  protected get typePrefix() { return PuzzleData.type; }
  protected get contentType() { return PuzzleData; }
  protected create(name: string, content: Map<string, string>, path: string, sets: string[]) {
    return new PuzzleData(name, content, path, sets);
  }
}

// Valkyrie: ContentLoader.cs ImageDataLoader
export class ImageDataLoader extends TypedContentLoader<ImageData> {
  protected get typePrefix() { return ImageData.type; }
  protected get contentType() { return ImageData; }
  protected create(name: string, content: Map<string, string>, path: string, sets: string[]) {
    return new ImageData(name, content, path, sets);
  }
}

// Valkyrie: ContentLoader.cs AudioDataLoader
export class AudioDataLoader extends TypedContentLoader<AudioData> {
  protected get typePrefix() { return AudioData.type; }
  protected get contentType() { return AudioData; }
  protected create(name: string, content: Map<string, string>, path: string, sets: string[]) {
    return new AudioData(name, content, path, sets);
  }
}

// Valkyrie: ContentLoader.cs ContentLoader
export class ContentLoader {
  private static readonly CONTENT_TYPE_LOADERS: readonly IContentLoader[] = [
    new PackTypeDataLoader(),
    new TileSideDataLoader(),
    new HeroDataLoader(),
    new ClassDataLoader(),
    new SkillDataLoader(),
    new ItemDataLoader(),
    new ActivationDataLoader(),
    new MonsterDataLoader(),
    new AttackDataLoader(),
    new EvadeDataLoader(),
    new HorrorDataLoader(),
    new TokenDataLoader(),
    new PerilDataLoader(),
    new PuzzleDataLoader(),
    new ImageDataLoader(),
    new AudioDataLoader(),
  ];

  private readonly cd: ContentData;

  constructor(cd: ContentData) {
    this.cd = cd;
  }

  // Valkyrie: ContentLoader.cs ContentLoader.AddNewContentPack
  static addNewContentPack(game: Game, path: string): void {
    game.cd.addPackByGameType(true, true, path);
  }

  // Valkyrie: ContentLoader.cs ContentLoader.RemoveContentPack
  static removeContentPack(game: Game, key: string): void {
    const index = game.cd.allPacks.findIndex((p) => p.id === key);
    if (index !== -1) game.cd.allPacks.splice(index, 1);
    game.cd.packSymbolDict.delete(key);
  }

  // Valkyrie: ContentLoader.cs ContentLoader.GetContentData
  static getContentData(game: Game): void {
    game.cd = new ContentData(game.gameType.dataDirectory());
    // Check if we found anything
    if (game.cd.getPacks().length === 0) {
      const message = 'Error: Failed to find any content packs, please check that you have them present in: ' + game.gameType.dataDirectory();
      ValkyrieDebug.log(message);
      Application.quit('no-content-packs', game.gameType.dataDirectory(), message);
    }
  }

  // This loads content from a pack by name
  // Duplicate content will be replaced by the higher priority value
  // Valkyrie: ContentLoader.cs ContentLoader.LoadContent(string)
  loadContent(name: string): void {
    for (const cp of this.cd.allPacks) {
      if (cp.name === name) {
        this.loadContentPack(cp);
      }
    }
  }

  // This loads content from a pack by ID
  // Duplicate content will be replaced by the higher priority value
  // Valkyrie: ContentLoader.cs ContentLoader.LoadContentID
  loadContentID(id: string): void {
    for (const cp of this.cd.allPacks) {
      if (cp.id === id) {
        this.loadContentPack(cp);
      }
    }
  }

  // This loads content from a pack by object
  // Duplicate content will be replaced by the higher priority value
  // Valkyrie: ContentLoader.cs ContentLoader.LoadContent(ContentPack)
  private loadContentPack(cp: ContentPack): void {
    // Don't reload content
    if (this.cd.loadedPacks.has(cp.id!)) return;

    for (const [dictName, files] of cp.localizationFiles!) {
      const packageDict = new DictionaryI18n();
      for (const file of files) {
        // Not in Valkyrie (16 October 2026): a text file that throws is logged and skipped, the rest of the pack loads
        try {
          packageDict.addDataFromFile(file);
        } catch (e) {
          ValkyrieDebug.log('Warning: Skipping localization file of pack ' + cp.id + ': ' + file + '\nException: ' + String(e));
        }
      }

      LocalizationRead.addDictionary(dictName, packageDict);
    }

    for (const ini of cp.iniFiles!) {
      const d = IniRead.readFromIni(ini);
      // Bad ini file not a fatal error, just ignore (will be in log); Valkyrie stops loading this pack here
      if (d === null) return;

      // Add each section
      // Not in Valkyrie (16 October 2026): an ini file whose content throws is logged and skipped, the rest of the pack loads
      try {
        for (const [sectionName, section] of d.data) {
          this.loadSection(sectionName, section, Path.getDirectoryName(ini) as string, cp.id!);
        }
      } catch (e) {
        ValkyrieDebug.log('Warning: Skipping the rest of ini file of pack ' + cp.id + ': ' + ini + '\nException: ' + String(e));
      }
    }

    this.cd.loadedPacks.add(cp.id!);

    for (const s of cp.clone!) {
      this.loadContentID(s);
    }
  }

  // Add a section of an ini file to game content
  // name is from the ini file and must start with the type
  // path is relative and is used for images or other paths in the content
  // Valkyrie: ContentLoader.cs ContentLoader.LoadContent(string, Dictionary, string, string)
  private loadSection(name: string, content: Map<string, string>, path: string, packID: string): void {
    for (const loader of ContentLoader.CONTENT_TYPE_LOADERS.filter((l) => l.supports(name))) {
      const handled = loader.loadContent(this.cd, name, content, path, [packID]);
      if (handled) break;
    }
  }
}

