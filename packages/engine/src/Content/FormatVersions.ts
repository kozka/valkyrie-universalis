// Ported from Valkyrie (Apache-2.0), modified: unity/Assets/Scripts/Content/FormatVersions.cs

// Valkyrie: FormatVersions.cs QuestFormat.Versions
const Versions = {
  RICH_TEXT: 16,
  SPLIT_BASE_MOM_AND_CONVERSION_KIT: 17,
  RELEASE_2_5_4: 18,
  RELEASE_3_0_0: 19,
  RELEASE_3_1_5: 20,
  RELEASE_3_2_0: 21,
} as const;

// Valkyrie: FormatVersions.cs QuestFormat
export class QuestFormat {
  static readonly Versions = Versions;

  static readonly CURRENT_VERSION: number = Versions.RELEASE_3_2_0;

  static readonly SCENARIOS_THAT_REQUIRE_CONVERSION_KIT: ReadonlySet<string> = new Set(
    [
      'Artefatos_Roubados',
      'BelieveorDie1',
      'BlackWoodsSecrets',
      'DemoniosEntreLosWilson',
      'EditorCenario8',
      'EditorScenario3',
      'Escape',
      'HolyMansion',
      'Horror_Haunts_Merinda',
      'InTheDark',
      'La_Follia_di_Arkham',
      'Main_Street_Market_Mayham',
      'OMalqueNuncaDorme',
      'Saviors',
      'StrainOnReality',
      'Stressandstrain',
      'TheLairofRlimShaikorth',
      'TheRitualScenario',
      'TheRobberyOfTheKadakianIdol',
      'wiltshire',
    ].map((t) => t.toLowerCase()),
  );
}
