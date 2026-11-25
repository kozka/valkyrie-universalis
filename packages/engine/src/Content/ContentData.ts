// Ported from Valkyrie (Apache-2.0), modified: unity/Assets/Scripts/Content/ContentData.cs
// C# generics keyed by typeof(T) take the content class as their first argument (cd.get(TileSideData, name)).
// FileToTexture reads image sizes from the file headers (platform/Texture2D.ts); the app decodes and draws the pixels.
import { Game } from '../Game.ts';
import { Application } from '../platform/Application.ts';
import { dictAdd, dictGet, isNullOrWhiteSpace, split, substring } from '../platform/CSharp.ts';
import { Mathf } from '../platform/Mathf.ts';
import { Directory, File, Path, SearchOption } from '../platform/SystemIO.ts';
import { Texture2D } from '../platform/Texture2D.ts';
import { Vector2 } from '../platform/Vector2.ts';
import { ValkyrieConstants } from '../ValkyrieConstants.ts';
import { IniRead, type IniData } from '../ValkyrieTools/IniRead.ts';
import { ValkyrieDebug } from '../ValkyrieTools/ValkyrieDebug.ts';
import { ContentPack } from './ContentPack.ts';
import { ExtractManager } from './ExtractManager.ts';
import type { ContentType, IContent } from './IContent.ts';
import { ManifestManager } from './ManifestManager.ts';
import { StringKey } from './StringKey.ts';

/** This class reads and stores all of the content for a base game and expansions. */
// Valkyrie: ContentData.cs ContentData
export class ContentData {
  loadedPacks: Set<string>;
  allPacks: ContentPack[];
  packSymbolDict: Map<string, StringKey>;

  // textureCache is used to store previously loaded textures so they are faster next time
  // For the editor all defined images are loaded, requires ~1GB RAM
  // For quests only used tiles/tokens will be loaded
  static textureCache: Map<string, Texture2D | null> | null = null;

  private content = new Map<ContentType<IContent>, Map<string, IContent>>();

  /** Search the provided path for all content packs and read meta data. */
  // Valkyrie: ContentData.cs ContentData.ContentData
  constructor(path: string) {
    // This is pack type for sorting packs
    this.loadedPacks = new Set();

    // This is pack symbol list
    this.packSymbolDict = new Map();

    //This has the game game and all expansions, general info
    this.allPacks = [];

    // Search each directory in the path (one should be base game, others expansion.  Names don't matter
    this.getBuildInContentPacks(path);
    this.getCustomContentPacks();
  }

  // Valkyrie: ContentData.cs ContentData.ContentOfType
  protected contentOfType<T extends IContent>(type: ContentType<T>): Map<string, T> {
    let content = this.content.get(type);
    if (!content) {
      content = new Map();
      this.content.set(type, content);
    }
    return content as Map<string, T>;
  }

  // Valkyrie: ContentData.cs ContentData.AddOrReplace
  addOrReplace<T extends IContent>(type: ContentType<T>, name: string, content: T): void {
    this.contentOfType(type).set(name, content);
  }

  /** TryGet: the value, or undefined when missing. */
  // Valkyrie: ContentData.cs ContentData.TryGet
  tryGet<T extends IContent>(type: ContentType<T>, name: string): T | undefined {
    return this.contentOfType(type).get(name);
  }

  // Valkyrie: ContentData.cs ContentData.Get
  get<T extends IContent>(type: ContentType<T>, name: string): T {
    return dictGet(this.contentOfType(type), name);
  }

  // Valkyrie: ContentData.cs ContentData.Keys
  keys<T extends IContent>(type: ContentType<T>): string[] {
    return [...this.contentOfType(type).keys()];
  }

  // Valkyrie: ContentData.cs ContentData.Values
  values<T extends IContent>(type: ContentType<T>): T[] {
    return [...this.contentOfType(type).values()];
  }

  // Valkyrie: ContentData.cs ContentData.ContainsKey
  containsKey<T extends IContent>(type: ContentType<T>, key: string): boolean {
    return this.contentOfType(type).has(key);
  }

  // Valkyrie: ContentData.cs ContentData.GetAll
  getAll<T extends IContent>(type: ContentType<T>): [string, T][] {
    return [...this.contentOfType(type).entries()];
  }

  // Valkyrie: ContentData.cs ContentData.Count
  count<T extends IContent>(type: ContentType<T>): number {
    return this.contentOfType(type).size;
  }

  /** Get the path where game content is defined, with a trailing '/'. */
  // Valkyrie: ContentData.cs ContentData.ContentPath
  static contentPath(): string {
    return Application.streamingAssetsPath + '/content/';
  }

  // Return a list of id for all enbaled content packs
  // Valkyrie: ContentData.cs ContentData.GetLoadedPackIDs
  getLoadedPackIDs(): string[] {
    return [...this.loadedPacks];
  }

  /** Get the path where ffg app content is imported, without a trailing '/'. */
  // Valkyrie: ContentData.cs ContentData.ImportPath
  static importPath(): string {
    return ContentData.gameTypePath + Path.DirectorySeparatorChar + 'import';
  }

  /** Get download directory without trailing '/' */
  // Valkyrie: ContentData.cs ContentData.DownloadPath
  static downloadPath(): string {
    return Game.appData() + Path.DirectorySeparatorChar + 'Download';
  }

  // Valkyrie: ContentData.cs ContentData.CustomContentPackPath
  static customContentPackPath(): string {
    return ContentData.downloadPath() + Path.DirectorySeparatorChar + 'ContentPacks';
  }

  // Valkyrie: ContentData.cs ContentData.TempPath
  static get tempPath(): string {
    return Application.temporaryCachePath;
  }

  // Valkyrie: ContentData.cs ContentData.TempValkyriePath
  static get tempValkyriePath(): string {
    return Path.combine(ContentData.tempPath, 'Valkyrie');
  }

  // Valkyrie: ContentData.cs ContentData.GameTypePath
  static get gameTypePath(): string {
    return Path.combine(Game.appData(), Game.get().gameType.typeName());
  }

  // Valkyrie: ContentData.cs ContentData.ValkyrieLoadPath
  static get valkyrieLoadPath(): string {
    return Path.combine(ContentData.tempValkyriePath, 'Load');
  }

  // Valkyrie: ContentData.cs ContentData.ValkyriePreloadPath
  static get valkyriePreloadPath(): string {
    return Path.combine(ContentData.tempValkyriePath, 'Preload');
  }

  // Valkyrie: ContentData.cs ContentData.ValkyrieLoadQuestPath
  static get valkyrieLoadQuestPath(): string {
    return Path.combine(ContentData.valkyrieLoadPath, 'quest');
  }

  // Valkyrie: ContentData.cs ContentData.GetBuildInContentPacks
  private getBuildInContentPacks(path: string): void {
    const officialContentFiles = Directory.getFiles(path, ValkyrieConstants.ContentPackIniFile, SearchOption.AllDirectories);
    this.getPacksFromFiles(officialContentFiles, false, false);
  }

  // Valkyrie: ContentData.cs ContentData.GetCustomContentPacks
  private getCustomContentPacks(): void {
    const customContentPackPath = ContentData.customContentPackPath();
    const files = ContentData.getDownloadedFilesFromManifest(customContentPackPath);
    this.getPacksFromFiles(files, true, true);
  }

  // Valkyrie: ContentData.cs ContentData.GetDownloadedFilesFromManifest
  private static getDownloadedFilesFromManifest(customContentPackPath: string): string[] {
    //Parse manifest
    const manager = new ManifestManager(customContentPackPath);
    const manifestData = manager.getLocalContentPackManifestIniData();

    //Get all keys from manifest and combine them with pack file extension
    return [...manifestData.data.keys()].map((key) =>
      Path.combine(customContentPackPath, key + ValkyrieConstants.ContentPackDownloadContainerExtension),
    );
  }

  // Valkyrie: ContentData.cs ContentData.GetPacks(string[], bool, bool)
  private getPacksFromFiles(contentFiles: string[], checkGameType: boolean, packIsContainer: boolean): void {
    for (const p of contentFiles) {
      // Not in Valkyrie (16 October 2026): one broken pack is logged and skipped instead of stopping the whole list
      try {
        this.addPackByGameType(checkGameType, packIsContainer, p, true);
      } catch (e) {
        ValkyrieDebug.log('Warning: Skipping content pack that could not be read: ' + p + '\nException: ' + String(e));
      }
    }
  }

  /** skipUnnamed (not in Valkyrie): while listing, a pack without a name is skipped instead of quitting. */
  // Valkyrie: ContentData.cs ContentData.AddPackByGameType
  addPackByGameType(checkGameType: boolean, packIsContainer: boolean, path: string, skipUnnamed = false): void {
    let gameTypeName = '';
    if (checkGameType) {
      gameTypeName = Game.get().gameType.typeName();
    }

    let contentPackPath = path;
    if (!packIsContainer) {
      contentPackPath = Path.getDirectoryName(path) as string;
    }

    this.populatePackListByPath(contentPackPath, gameTypeName, checkGameType, packIsContainer, skipUnnamed);
  }

  // Read a content pack for list of files and meta data
  // Valkyrie: ContentData.cs ContentData.PopulatePackListByPath
  private populatePackListByPath(path: string, gameTypeName: string, checkGameType: boolean, packIsContainer: boolean, skipUnnamed: boolean): void {
    if (packIsContainer) {
      const extractedPath = ExtractManager.extractSinglePackageFull(path);
      path = extractedPath;
    }

    // All packs must have a content_pack.ini, otherwise ignore
    let pack: ContentPack | null = null;

    let combinedContentPackLocalPath = path + Path.DirectorySeparatorChar + ValkyrieConstants.ContentPackIniFile;

    if (!File.exists(combinedContentPackLocalPath) && packIsContainer) {
      // The content pack might be nested inside a subdirectory of the ZIP
      const subdirs = Directory.getDirectories(path);
      for (const subdir of subdirs) {
        if (File.exists(subdir + Path.DirectorySeparatorChar + ValkyrieConstants.ContentPackIniFile)) {
          path = subdir;
          combinedContentPackLocalPath = path + Path.DirectorySeparatorChar + ValkyrieConstants.ContentPackIniFile;
          break;
        }
      }
    }

    if (File.exists(combinedContentPackLocalPath)) {
      pack = ContentData.getPackData(path, gameTypeName, checkGameType, skipUnnamed);
      if (pack !== null) {
        this.addPackToAllPacksAndPackSymbol(pack, this.allPacks, this.packSymbolDict);
        // We finish without actually loading the content, this is done later (content optional)
      }
    } else {
      ValkyrieDebug.log(
        'Could not find content pack file in temporary path (please check if container export failed): ' + combinedContentPackLocalPath,
      );
    }
  }

  // Valkyrie: ContentData.cs ContentData.AddPackToAllPacksAndPackSymbol
  private addPackToAllPacksAndPackSymbol(pack: ContentPack, allPacksList: ContentPack[], packSymbolDict: Map<string, StringKey>): void {
    // Remove existing pack if present (update scenario)
    const existingPack = allPacksList.findIndex((p) => p.id === pack.id);
    if (existingPack !== -1) {
      allPacksList.splice(existingPack, 1);
    }

    packSymbolDict.delete(pack.id!);

    // Add content pack
    allPacksList.push(pack);

    // Add symbol
    packSymbolDict.set(pack.id!, new StringKey('val', pack.id + '_SYMBOL'));
  }

  // Valkyrie: ContentData.cs ContentData.GetPackData
  private static getPackData(path: string, gameTypeName: string, checkGameType: boolean, skipUnnamed: boolean): ContentPack | null {
    // Get all data from the file
    const d = IniRead.readFromIni(path + Path.DirectorySeparatorChar + ValkyrieConstants.ContentPackIniFile);

    // Some packs have a type
    const type = (d as IniData).get('ContentPack', 'type');
    if (!checkGameType || (!isNullOrWhiteSpace(gameTypeName) && type.startsWith(gameTypeName))) {
      const pack = ContentData.getContentPack(path, d, type, skipUnnamed);
      if (pack === null) {
        ValkyrieDebug.log('Could not find content pack file: ' + path + `Please check if type="${gameTypeName}" was set correctly in content_pack.ini file.`);
      }
      return pack;
    }

    return null;
  }

  // Valkyrie: ContentData.cs ContentData.GetContentPack
  private static getContentPack(path: string, d: IniData | null, type: string, skipUnnamed: boolean): ContentPack | null {
    const pack = new ContentPack();
    pack.type = type;
    // Todo: better error handling
    if (d === null) {
      ValkyrieDebug.log('Failed to get any data out of ' + path + Path.DirectorySeparatorChar + 'content_pack.ini!');
      Application.quit('content-pack-unreadable', path, 'Failed to get any data out of ' + path + '/content_pack.ini');
    }

    pack.name = d!.get('ContentPack', 'name');
    if (pack.name === '') {
      ValkyrieDebug.log('Failed to get name data out of ' + path + Path.DirectorySeparatorChar + 'content_pack.ini!');
      // Not in Valkyrie (16 October 2026): while listing the packs, one without a name is skipped instead of quitting
      if (skipUnnamed) return null;
      Application.quit('content-pack-without-name', path, 'Failed to get name data out of ' + path + '/content_pack.ini');
    }

    // id can be empty/missing
    pack.id = d!.get('ContentPack', 'id');

    // If this is invalid we will just handle it later, not fatal
    if (d!.get('ContentPack', 'image').indexOf('{import}') === 0) {
      pack.image = ContentData.importPath() + d!.get('ContentPack', 'image').substring(8);
    } else {
      pack.image = path + Path.DirectorySeparatorChar + d!.get('ContentPack', 'image');
    }

    // Black description isn't fatal
    pack.description = d!.get('ContentPack', 'description');

    // Icon can be empty/missing
    const iconString = d!.get('ContentPack', 'icon');
    if (!isNullOrWhiteSpace(iconString)) {
      pack.icon = path + Path.DirectorySeparatorChar + iconString;
    }

    // Get cloned packs
    const cloneString = d!.get('ContentPack', 'clone');
    pack.clone = [];
    for (const s of split(cloneString, [' '], undefined, true)) {
      pack.clone.push(s);
    }

    // Get all the other ini files in the pack
    const files: string[] = [];
    // content_pack file is included
    files.push(path + Path.DirectorySeparatorChar + ValkyrieConstants.ContentPackIniFile);

    // No extra files is valid
    const contentPackData = d!.get('ContentPackData');
    if (contentPackData !== null) {
      for (const file of contentPackData.keys()) {
        files.push(path + Path.DirectorySeparatorChar + file);
      }
    }
    // Save list of files
    pack.iniFiles = files;

    // Get all the other ini files in the pack
    const dictFiles = new Map<string, string[]>();
    // No extra files is valid
    const languageData = d!.get('LanguageData');
    if (languageData !== null) {
      for (const s of languageData.keys()) {
        const firstSpace = s.indexOf(' ');
        const id = substring(s, 0, firstSpace);
        const file = s.substring(firstSpace + 1);
        let list = dictFiles.get(id);
        if (!list) {
          list = [];
          dictFiles.set(id, list);
        }
        list.push(path + Path.DirectorySeparatorChar + file);
      }
    }
    // Save list of files
    pack.localizationFiles = dictFiles;
    return pack;
  }

  // Return a list of names for all found content packs
  // Valkyrie: ContentData.cs ContentData.GetPacks()
  getPacks(): string[] {
    return this.allPacks.map((cp) => cp.name!);
  }

  // Valkyrie: ContentData.cs ContentData.GetContentName
  getContentName(id: string): string {
    for (const cp of this.allPacks) {
      if (cp.id === id) {
        const sk = new StringKey(cp.name);
        const translatedName = sk.translate();

        // If it wasn't translated and is a plain ID, try prepending "pck" to find a translation.
        if (translatedName === cp.name && !cp.name.includes('{')) {
          const pckKey = new StringKey('pck', cp.name);
          if (pckKey.keyExists()) return pckKey.translate();
        }

        return translatedName;
      }
    }
    return id;
  }

  // Valkyrie: ContentData.cs ContentData.GetContentAcronym
  getContentAcronym(id: string): string {
    for (const cp of this.allPacks) {
      if (cp.id === id) {
        return new StringKey('val', cp.id).translate();
      }
    }
    return '';
  }

  // Valkyrie: ContentData.cs ContentData.GetContentSymbol
  getContentSymbol(id: string): string {
    for (const cp of this.allPacks) {
      if (cp.id === id) {
        return new StringKey('val', cp.id + '_SYMBOL').translate();
      }
    }
    return '';
  }

  // Valkyrie: ContentData.cs ContentData.GetPackById
  getPackById(id: string): ContentPack | null {
    for (const cp of this.allPacks) {
      if (cp.id === id) {
        return cp;
      }
    }
    return null;
  }

  /** Adds content unless a higher priority item exists; items of the same priority belong to several packs. */
  // Valkyrie: ContentData.cs ContentData.AddContent
  addContent<T extends IContent>(type: ContentType<T>, name: string, d: T): boolean {
    // If we don't already have one or it's lower priority then add this
    const existingPackData = this.tryGet(type, name);
    if (existingPackData === undefined || existingPackData.priority < d.priority) {
      this.addOrReplace(type, name, d);
      return true;
    }
    // items of the same priority belong to multiple packs
    else if (existingPackData.priority === d.priority) {
      existingPackData.sets.push(...d.sets);
      return false;
    }

    return false;
  }

  /** Resolves the asset name to a matching file and returns the full file path including the file extension, or null. */
  // Valkyrie: ContentData.cs ContentData.ResolveTextureFile
  static resolveTextureFile(name: string): string | null {
    if (name === null || name === undefined) throw new Error('ArgumentNullException: name');
    if (File.exists(name)) {
      return name;
    }

    // Check all possible extensions
    for (const extension of ['.dds', '.pvr', '.png', '.jpg', '.jpeg', '.tex']) {
      const file = name + extension;
      if (File.exists(file)) {
        return file;
      }
    }
    return null;
  }

  /**
   * Get a texture from a file (dds, pvr or another format Unity reads), the whole image or the part at pos with size,
   * in pixels. Null when the file cannot be resolved or read.
   */
  // Valkyrie: ContentData.cs ContentData.FileToTexture
  static fileToTexture(file: string, pos: Vector2 = Vector2.zero, size: Vector2 = Vector2.zero): Texture2D | null {
    if (file === null || file === undefined) throw new Error('ArgumentNullException: file');
    const resolvedFile = ContentData.resolveTextureFile(file);
    // return if file could not be resolved
    if (resolvedFile === null) {
      ValkyrieDebug.log("Could not resolve file: '" + file + "'");
      return null;
    }
    file = resolvedFile;

    let texture: Texture2D | null = null;

    if (ContentData.textureCache === null) {
      ContentData.textureCache = new Map();
    }

    if (ContentData.textureCache.has(file)) {
      texture = ContentData.textureCache.get(file)!;
    } else {
      const ext = Path.getExtension(file).toLowerCase();
      if (ext === '.dds') {
        texture = ddsToTexture(file);
      } else if (ext === '.pvr') {
        texture = pvrToTexture(file);
      } else {
        // If the image isn't one of the formats above, just use unity file load
        texture = imageToTexture(file);
      }
      // Not in Valkyrie: the app needs to know which file to draw
      if (texture !== null) texture.name = file;
      if (!file.includes(ContentData.tempPath)) {
        dictAdd(ContentData.textureCache, file, texture);
      }
    }
    // Get whole image
    if (size.x === 0) return texture;

    // Get part of the image
    // Array of pixels from image (a missing texture throws, as the NullReferenceException in C#)
    const pix = texture!.getPixels(Mathf.roundToInt(pos.x), Mathf.roundToInt(pos.y), Mathf.roundToInt(size.x), Mathf.roundToInt(size.y));
    // Empty texture
    const subTexture = new Texture2D(Mathf.roundToInt(size.x), Mathf.roundToInt(size.y));
    // Set pixels
    subTexture.setPixels(pix);
    subTexture.apply();
    return subTexture;
  }
}

// Valkyrie: ContentData.cs ContentData.DdsToTexture (reads the header; the app decodes the pixels)
function ddsToTexture(file: string): Texture2D | null {
  // Unity doesn't support dds directly, have to do hackery
  // Read the data
  let ddsBytes: Uint8Array;
  try {
    ddsBytes = File.readAllBytes(file);
  } catch (ex) {
    if (!File.exists(file)) ValkyrieDebug.log("Warning: DDS Image missing: '" + file + "'");
    else ValkyrieDebug.log("Warning: DDS Image loading of file '" + file + "' failed with " + (ex as Error).name + ' message: ' + (ex as Error).message);
    return null;
  }
  // Check for valid header (a short file throws, as reading past the end of the array does in C#)
  const ddsSizeCheck = byteAt(ddsBytes, 4);
  if (ddsSizeCheck !== 124) {
    ValkyrieDebug.log("Warning: Image invalid: '" + file + "'");
    return null;
  }

  // Extract dimensions
  const height = byteAt(ddsBytes, 13) * 256 + byteAt(ddsBytes, 12);
  const width = byteAt(ddsBytes, 17) * 256 + byteAt(ddsBytes, 16);

  // Copy image data (skip header)
  const DDS_HEADER_SIZE = 128;
  if (ddsBytes.length < DDS_HEADER_SIZE) throw new Error('OverflowException: Arithmetic operation resulted in an overflow.');
  const dxtBytes = ddsBytes.subarray(DDS_HEADER_SIZE);

  let texture: Texture2D | null = null;

  if (byteAt(ddsBytes, 87) === 0x35 /* '5' */) {
    texture = new Texture2D(width, height); // DXT5
  } else if (byteAt(ddsBytes, 87) === 0x31 /* '1' */) {
    texture = new Texture2D(width, height); // DXT1
  } else if (byteAt(ddsBytes, 88) === 32) {
    texture = new Texture2D(width, height); // BGRA32 or RGBA32
  } else if (byteAt(ddsBytes, 88) === 24) {
    texture = new Texture2D(width, height); // RGB24
  } else {
    ValkyrieDebug.log("Warning: Image invalid: '" + file + "'");
  }
  // An unknown format leaves texture null and throws here, as in C#
  texture!.loadRawTextureData(dxtBytes);
  texture!.apply();
  return texture;
}

// Valkyrie: ContentData.cs ContentData.PvrToTexture (reads the header; the app decodes the pixels)
function pvrToTexture(file: string): Texture2D | null {
  let pixelformat = -1;
  try {
    // A file that does not exist is fetched as a URI in C#; here it fails as that request would
    if (!File.exists(file)) throw new Error('Cannot connect to destination host');
    const data = File.readAllBytes(file);
    const view = new DataView(data.buffer, data.byteOffset, data.byteLength);

    // *** HEADER ****
    pixelformat = Number(view.getBigInt64(8, true));
    const height = view.getInt32(24, true);
    const width = view.getInt32(28, true);

    // *** IMAGE DATA ****
    const PVR_HEADER_SIZE = 52;
    if (data.length < PVR_HEADER_SIZE) throw new Error('Arithmetic operation resulted in an overflow.');
    const image = data.subarray(PVR_HEADER_SIZE);
    let texture: Texture2D | null = null;
    switch (pixelformat) {
      case 22: // ETC2_RGB4
      case 23: // ETC2_RGB8
        texture = new Texture2D(width, height);
        texture.loadRawTextureData(image);
        texture.apply();
        break;
      default:
        ValkyrieDebug.log("Warning: PVR unknown pixelformat: '" + pixelformat + "' in file: '" + file + "'");
        break;
    }
    return texture;
  } catch (ex) {
    if (!File.exists(file)) ValkyrieDebug.log("Warning: PVR Image missing: '" + file + "'");
    else {
      ValkyrieDebug.log(
        "Warning: PVR Image loading of file '" + file + "' failed with " + (ex as Error).name + ' message: ' + (ex as Error).message + " pixelformat: '" + pixelformat + "'",
      );
    }
    return null;
  }
}

// Valkyrie: ContentData.cs ContentData.ImageToTexture (Unity's LoadImage reads PNG and JPEG)
function imageToTexture(file: string): Texture2D | null {
  try {
    if (File.exists(file)) {
      const data = File.readAllBytes(file);
      const tex = new Texture2D(2, 2);
      if (tex.loadImage(data)) {
        return tex;
      } else {
        ValkyrieDebug.log('Warning: ImageToTexture failed to LoadImage for: ' + file);
        return null;
      }
    } else {
      // C# requests the file as a URI, which fails for a file that does not exist
      throw new Error('Cannot connect to destination host');
    }
  } catch (ex) {
    if (!File.exists(file)) ValkyrieDebug.log("Warning: Image missing: '" + file + "'");
    else ValkyrieDebug.log("Warning: Image loading of file '" + file + "' failed with " + (ex as Error).name + ' message: ' + (ex as Error).message);
    return null;
  }
}

// byte[] indexer: reading past the end throws, as in C#
function byteAt(bytes: Uint8Array, index: number): number {
  if (index < 0 || index >= bytes.length) throw new RangeError('IndexOutOfRangeException: Index was outside the bounds of the array.');
  return bytes[index]!;
}
