// Ported from Valkyrie (Apache-2.0), modified: unity/Assets/Scripts/Content/ContentTypes.cs (PerilData)
// In its own file because it extends QuestData.Event, which ContentTypes.ts cannot import without a cycle.
import { intTryParse } from '../platform/CSharp.ts';
import type { IContent } from './IContent.ts';
import { QuestData } from './QuestData.ts';
import { StringKey } from './StringKey.ts';

// Perils are content data that inherits from QuestData for reasons.
// IContent.SectionName returns "Peril" in C#; here sectionName is the inherited section name, which is just as
// non-empty for the one check that reads it (ContentLoader<T>.LoadContent).
// Valkyrie: ContentTypes.cs PerilData
export class PerilData extends QuestData.Event implements IContent {
  static override type = 'Peril';
  priority = 0;
  readonly sets: string[] = [];

  perilText: StringKey = null as unknown as StringKey;

  get translationKey(): StringKey {
    return this.text;
  }

  override get text(): StringKey {
    return this.perilText;
  }

  constructor(name: string, data: Map<string, string>) {
    super(name, data, '', QuestData.Quest.currentFormat);
    this.typeDynamic = PerilData.type;
    if (data.has('priority')) {
      this.priority = intTryParse(data.get('priority')).value;
    }

    if (data.has('text')) {
      this.perilText = new StringKey(data.get('text')!);
    }
  }
}
