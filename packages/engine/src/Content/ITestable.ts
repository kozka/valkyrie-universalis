// Ported from Valkyrie (Apache-2.0), modified: unity/Assets/Scripts/Content/ITestable.cs
import type { VarOperation, VarTests } from '../Quest/VarTests.ts';

// Valkyrie: ITestable.cs ITestable
export interface ITestable {
  readonly tests: VarTests | null;
  readonly operations: VarOperation[] | null;
}
