// Ported from Valkyrie (Apache-2.0), modified: unity/Assets/Scripts/Content/ContentPack.cs

// Holding class for contentpack data
// Valkyrie: ContentPack.cs ContentPack
export class ContentPack {
  name: string | null = null;
  image: string | null = null;
  icon: string | null = null;
  description: string | null = null;
  id: string | null = null;
  type: string | null = null;
  iniFiles: string[] | null = null;
  localizationFiles: Map<string, string[]> | null = null;
  clone: string[] | null = null;
}
