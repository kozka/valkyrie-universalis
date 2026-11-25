// Ported from Valkyrie (Apache-2.0), modified: unity/Assets/Scripts/ValkyrieConstants.cs

// Valkyrie: ValkyrieConstants.cs ValkyrieConstants
export class ValkyrieConstants {
  private static lazy: ValkyrieConstants | null = null;

  static get instance(): ValkyrieConstants {
    return (ValkyrieConstants.lazy ??= new ValkyrieConstants());
  }

  private constructor() {}

  static readonly typeMom = 'MoM';
  static readonly typeDescent = 'D2E';
  static readonly DefaultLanguage = 'English';
  static readonly customCategoryLabel = 'Custom';
  static readonly customCategoryName = 'Custom';
  static readonly ScenarioDownloadContainerExtension = '.valkyrie';
  static readonly ContentPackDownloadContainerExtensionAllFileReference = '*' + ValkyrieConstants.ScenarioDownloadContainerExtension;
  static readonly ContentPackDownloadContainerExtension = '.valkyrieContentPack';
  static readonly ScenarioManifestPath = '/manifest.ini';
  static readonly ContentPackManifestPath = '/manifest.ini';
  static readonly QuestIniFilePath = '/quest.ini';
  static readonly RemoteContentPackIniType = 'RemoteContentPack';
  static readonly ContentPackIniFile = 'content_pack.ini';
  static readonly BaseGameIdContentPackDescent = 'D2EBase';
  static readonly BaseGameIdContentPackMansionsOfMadness = 'MoMBase';
  static readonly PackType = 'PackType';
}
