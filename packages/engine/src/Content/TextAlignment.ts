// Ported from Valkyrie (Apache-2.0), modified: unity/Assets/Scripts/Content/TextAlignment.cs
import { enumTryParse } from '../platform/CSharp.ts';
import { ValkyrieDebug } from '../ValkyrieTools/ValkyrieDebug.ts';

// Valkyrie: TextAlignment.cs TextAlignment
export const TextAlignment = {
  TOP: 0,
  CENTER: 1,
  BOTTOM: 2,
} as const;
export type TextAlignment = number;

// Valkyrie: TextAlignment.cs TextAlignmentUtils
export class TextAlignmentUtils {
  // Valkyrie: TextAlignment.cs TextAlignmentUtils.ParseAlignment (Enum.Parse with ignoreCase)
  static parseAlignment(textAlignString: string): TextAlignment {
    const parsed = enumTryParse(TextAlignment, textAlignString, true);
    if (!parsed.ok) {
      ValkyrieDebug.log('Failed to parse text alignment - ' + textAlignString + ': Requested value was not found.');
      return TextAlignment.CENTER;
    }
    return parsed.value;
  }
}
