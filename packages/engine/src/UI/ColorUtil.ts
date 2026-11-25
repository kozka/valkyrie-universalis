// Ported from Valkyrie (Apache-2.0), modified: unity/Assets/Scripts/UI/ColorUtil.cs
// In the engine because game code uses it (door colours, UI text) and logs to the quest log.
import { Game } from '../Game.ts';
import { Color } from '../platform/Color.ts';
import { substring } from '../platform/CSharp.ts';
import { LogEntry } from '../Quest/LogEntry.ts';

/** Convert.ToInt32(s, 16): a hexadecimal number; anything else throws, as in .NET. */
export function hexToInt(s: string): number {
  if (!/^[0-9a-fA-F]+$/.test(s)) throw new Error(`FormatException: Could not find any recognizable digits: ${s}`);
  return parseInt(s, 16);
}

// Util class to convert colour names to RGB strings
// Returns input if not found
// Valkyrie: ColorUtil.cs ColorUtil
export class ColorUtil {
  // Valkyrie: ColorUtil.cs ColorUtil.FromName
  static fromName(name: string): string {
    const found = ColorUtil.lookUp().get(name.toLowerCase());
    if (found !== undefined) {
      return found;
    }
    // No match found
    return name;
  }

  // Valkyrie: ColorUtil.cs ColorUtil.ColorFromName
  static colorFromName(name: string): Color {
    const colorRGB = ColorUtil.fromName(name);
    // Check format is valid
    if ((colorRGB.length !== 7 && colorRGB.length !== 9) || colorRGB[0] !== '#') {
      Game.get().currentQuest!.log.add(new LogEntry('Warning: Color must be in #RRGGBB format or a known name: ' + name, true));
    }

    // State with white (used for alpha)
    const colour = Color.white;
    // Not in Valkyrie (16 October 2026): a colour that Convert.ToInt32 or Substring cannot read threw; white is used
    try {
      // Hexadecimal to float convert (0x00-0xFF -> 0.0-1.0)
      colour.r = Math.fround(hexToInt(substring(colorRGB, 1, 2)) / 255);
      colour.g = Math.fround(hexToInt(substring(colorRGB, 3, 2)) / 255);
      colour.b = Math.fround(hexToInt(substring(colorRGB, 5, 2)) / 255);
      if (colorRGB.length === 9) colour.a = Math.fround(hexToInt(substring(colorRGB, 7, 2)) / 255);
    } catch {
      Game.get().currentQuest!.log.add(new LogEntry('Warning: Unreadable color, using white: ' + name, true));
      return Color.white;
    }

    return colour;
  }

  // Staticly defined dictionary of names to RGB strings
  // Data should match web standards
  // Valkyrie: ColorUtil.cs ColorUtil.LookUp
  static lookUp(): Map<string, string> {
    return new Map([
      ['black', '#000000'],
      ['white', '#FFFFFF'],
      ['red', '#FF0000'],
      ['lime', '#00FF00'],
      ['blue', '#0000FF'],
      ['yellow', '#FFFF00'],
      ['aqua', '#00FFFF'],
      ['cyan', '#00FFFF'],
      ['magenta', '#FF00FF'],
      ['fuchsia', '#FF00FF'],
      ['silver', '#C0C0C0'],
      ['gray', '#808080'],
      ['maroon', '#800000'],
      ['olive', '#808000'],
      ['green', '#008000'],
      ['purple', '#800080'],
      ['teal', '#008080'],
      ['navy', '#000080'],
      ['transparent', '#00000000'],
    ]);
  }
}
