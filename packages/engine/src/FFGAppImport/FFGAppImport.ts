// Ported from Valkyrie (Apache-2.0), modified: libraries/FFGAppImport/FFGAppImport.cs
// Partial: where an import lives and whether it is needed. The platform and the app's own paths (apkPath,
// packageVersion, Inspect, ImportAvailable, Import) belong to reading the official app, which is not ported.
import { FetchContent } from './AssetImport/FetchContent.ts';

// Valkyrie: FFGAppImport.cs FFGImport
export class FFGImport {
  static readonly version = 2;
  readonly type: 'D2E' | 'MoM';
  readonly path: string;
  private readonly fc: FetchContent;

  /** contentPath is the user folder with a trailing separator, as Game.AppData() + '/'. */
  constructor(t: 'D2E' | 'MoM', contentPath: string) {
    this.type = t;
    this.path = contentPath + t + '/import';
    this.fc = new FetchContent(this);
  }

  // Valkyrie: FFGAppImport.cs FFGImport.NeedImport
  needImport(): boolean {
    return this.fc.needImport();
  }
}
