// Ported from Valkyrie (Apache-2.0), modified: unity/Assets/Scripts/Content/IContent.cs
import type { StringKey } from './StringKey.ts';

// Valkyrie: IContent.cs IContent
export interface IContent {
  readonly priority: number;
  readonly translationKey: StringKey;
  readonly sectionName: string;
  readonly sets: string[];
}

/** A content class (TileSideData, MonsterData...), used where C# passes typeof(T). */
export type ContentType<T extends IContent> = abstract new (...args: never[]) => T;
