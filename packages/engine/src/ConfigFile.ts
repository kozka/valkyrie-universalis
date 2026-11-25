// Ported from Valkyrie (Apache-2.0), modified: unity/Assets/Scripts/ConfigFile.cs
// config.ini lives in the virtual file system; the app keeps that folder in the browser's storage.
import { LocalizationRead } from './Content/LocalizationRead.ts';
import { Game } from './Game.ts';
import { Directory, File } from './platform/SystemIO.ts';
import { IniData, IniRead } from './ValkyrieTools/IniRead.ts';
import { ValkyrieDebug } from './ValkyrieTools/ValkyrieDebug.ts';

// Class to control user configuration of Valkyrie
// This is a generic system and has no knowledge of the actual configuration structure
// Valkyrie: ConfigFile.cs ConfigFile
export class ConfigFile {
  // This is the configuration data structure, it is public for read/write
  // Save must be called if modifications are to be kept
  data: IniData;

  // Initialise data from the file on disk
  constructor() {
    this.data = new IniData();
    const optionsFile = Game.defaultAppData() + '/config.ini';
    if (File.exists(optionsFile)) {
      this.data = IniRead.readFromIni(optionsFile) as IniData;
    }
  }

  // Valkyrie: ConfigFile.cs ConfigFile.GetPacks
  getPacks(gameType: string): string[] {
    return [...(this.data.get(gameType + 'Packs')?.keys() ?? [])];
  }

  // Valkyrie: ConfigFile.cs ConfigFile.GetPackLanguages
  getPackLanguages(gameType: string): Map<string, string> {
    return this.data.get(gameType + 'Packs') ?? new Map();
  }

  // Valkyrie: ConfigFile.cs ConfigFile.RemovePack
  removePack(gameType: string, pack: string): void {
    this.data.remove(gameType + 'Packs', pack);
    LocalizationRead.setGroupTranslationLanguage(pack, '');
    this.save();
  }

  // Valkyrie: ConfigFile.cs ConfigFile.AddPack
  addPack(gameType: string, pack: string, language = ''): void {
    this.data.add(gameType + 'Packs', pack, language);
    LocalizationRead.setGroupTranslationLanguage(pack, language);
    this.save();
  }

  // Save the configuration in memory to disk
  // Valkyrie: ConfigFile.cs ConfigFile.Save
  save(): void {
    const optionsFile = Game.defaultAppData() + '/config.ini';
    const content = this.data.toString();
    try {
      if (!Directory.exists(Game.defaultAppData())) {
        Directory.createDirectory(Game.defaultAppData());
      }
      File.writeAllText(optionsFile, content);
    } catch {
      ValkyrieDebug.log('Warning: Unable to write to config file: ' + optionsFile + '\r\n');
    }
  }
}
