// Ported from Valkyrie (Apache-2.0), modified: unity/Assets/Scripts/Content/RemoteContentPack.cs
import { Game } from '../Game.ts';
import { NewLine, dictAdd } from '../platform/CSharp.ts';
import { ValkyrieConstants } from '../ValkyrieConstants.ts';

/** DateTime(0), what latest_update keeps when the list has none. */
const DATETIME_MIN = new Date(-62135596800000);

// Valkyrie: RemoteContentPack.cs RemoteContentPack
export class RemoteContentPack {
  languages_name: Map<string, string> = new Map();
  languages_description: Map<string, string> = new Map();
  // null when the list gives no image, as the C# field
  image: string | null = null;
  identifier: string;
  type = '';
  version = '';
  package_url = '';
  latest_update: Date = DATETIME_MIN;
  defaultLanguage: string = ValkyrieConstants.DefaultLanguage;

  // is package available locally
  downloaded = false;
  update_available = false;

  valid = false;

  // Valkyrie: RemoteContentPack.cs RemoteContentPack.RemoteContentPack
  constructor(identifier: string, iniData: Map<string, string>) {
    this.identifier = identifier;
    this.valid = this.populate(iniData);
  }

  /** Create from ini data; returns true if the quest is valid */
  // Valkyrie: RemoteContentPack.cs RemoteContentPack.Populate
  populate(iniData: Map<string, string>): boolean {
    const keyName = 'name.';
    this.languages_name = new Map();
    if (iniData.has(keyName + this.defaultLanguage)) {
      for (const [key, value] of iniData) {
        if (key.startsWith(keyName)) {
          dictAdd(this.languages_name, key.substring(keyName.length), value);
        }
      }
    }

    const keyDescription = 'description.';
    this.languages_description = new Map();
    if (iniData.has(keyDescription + this.defaultLanguage)) {
      for (const [key, value] of iniData) {
        if (key.startsWith(keyDescription)) {
          dictAdd(this.languages_description, key.substring(keyDescription.length), value);
        }
      }
    }

    this.type = '';
    if (iniData.has('type')) {
      this.type = iniData.get('type')!;
    }

    if (iniData.has('image')) {
      const value = iniData.get('image')!;
      this.image = value.replace(/\\/g, '/');
    }

    // parse data for scenario explorer
    this.version = '';
    if (iniData.has('version')) {
      this.version = iniData.get('version')!;
    }

    this.package_url = '';
    if (iniData.has('url')) {
      this.package_url = iniData.get('url')!;
    }

    this.latest_update = DATETIME_MIN;
    if (iniData.has('latest_update')) {
      const parsed = Date.parse(iniData.get('latest_update')!);
      this.latest_update = Number.isNaN(parsed) ? DATETIME_MIN : new Date(parsed);
    }

    return true;
  }

  // Save to string (editor). It writes type twice, the pack's and the game's: reading it back keeps the first.
  // Valkyrie: RemoteContentPack.cs RemoteContentPack.ToString
  toString(): string {
    const nl = NewLine;
    let r = `[${ValkyrieConstants.RemoteContentPackIniType}]` + nl;
    r += 'identifier=' + this.identifier + nl;
    r += 'type=' + this.type + nl;
    r += 'type=' + Game.get().gameType.typeName() + nl;
    r += 'defaultlanguage=' + this.defaultLanguage + nl;

    // Not in Valkyrie (16 October 2026): a pack listed without image is written without it instead of throwing
    if (this.image !== null && this.image.length > 0) {
      r += 'image=' + this.image + nl;
    }

    if (this.version !== '') {
      r += 'version=' + this.version + nl;
    }

    for (const [key, value] of this.languages_name) {
      r += 'name.' + key + '=' + value + nl;
    }

    return r;
  }

  // Valkyrie: RemoteContentPack.cs RemoteContentPack.GetTitle
  getTitle(userLanguage: string): string {
    if (this.languages_name.has(userLanguage)) {
      return this.languages_name.get(userLanguage)!;
    }
    if (this.languages_name.has(this.defaultLanguage)) {
      return this.languages_name.get(this.defaultLanguage)!;
    }
    if (this.languages_name.size > 0) {
      return this.languages_name.values().next().value!;
    }
    return '';
  }

  // Valkyrie: RemoteContentPack.cs RemoteContentPack.GetDescription
  getDescription(userLanguage: string): string {
    if (this.languages_description.has(userLanguage)) {
      return this.languages_description.get(userLanguage)!;
    }
    if (this.languages_description.has(this.defaultLanguage)) {
      return this.languages_description.get(this.defaultLanguage)!;
    }
    if (this.languages_description.size > 0) {
      return this.languages_description.values().next().value!;
    }
    return '';
  }
}
