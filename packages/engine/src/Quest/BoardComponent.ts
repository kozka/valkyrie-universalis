// Ported from Valkyrie (Apache-2.0), modified: unity/Assets/Scripts/Quest/Quest.cs (class Quest.BoardComponent)
// In its own module, not in Quest.ts, so that ShopInterface can extend it without a module cycle (see porting rules);
// Quest exposes it as Quest.BoardComponent. The image is the state Unity's Image would hold (colour, picture, size); the app draws it.
import type { QuestData } from '../Content/QuestData.ts';
import type { Game } from '../Game.ts';
import { Color } from '../platform/Color.ts';
import { substring } from '../platform/CSharp.ts';
import type { GameObject, Image } from '../platform/GameObject.ts';
import { ColorUtil, hexToInt } from '../UI/ColorUtil.ts';
import { LogEntry } from './LogEntry.ts';

// Super class for all quest components
// Valkyrie: Quest.cs Quest.BoardComponent
export abstract class BoardComponent {
  // image for display
  image: Image | null = null;

  // Game object
  game: Game;

  unityObject: GameObject | null = null;

  // Target alpha
  targetAlpha = 1;
  fadeSpeed = 1;

  constructor(gameObject: Game) {
    this.game = gameObject;
  }

  abstract remove(): void;

  abstract getEvent(): QuestData.Event | null;

  // Set visible can control the transparency level of the component
  // Valkyrie: Quest.cs BoardComponent.SetVisible
  setVisible(alpha: number): void {
    this.targetAlpha = alpha;
  }

  // Set visible can control the transparency level of the component
  // Valkyrie: Quest.cs BoardComponent.UpdateAlpha
  updateAlpha(time: number): void {
    let alpha = this.getColor().a;
    const distUpdate = Math.fround(time * this.fadeSpeed);
    const distRemain = Math.fround(this.targetAlpha - alpha);
    if (distRemain > distUpdate) {
      alpha = Math.fround(alpha + distUpdate);
    } else if (-distRemain > distUpdate) {
      alpha = Math.fround(alpha - distUpdate);
    } else {
      alpha = this.targetAlpha;
    }

    this.setColor(new Color(this.getColor().r, this.getColor().g, this.getColor().b, alpha));
  }

  // Valkyrie: Quest.cs BoardComponent.SetColor(Color)
  setColor(c: Color): void {
    if (this.image === null) return;
    this.image.color = c;
  }

  // Valkyrie: Quest.cs BoardComponent.GetColor
  getColor(): Color {
    if (this.image !== null) return this.image.color;
    return Color.clear;
  }

  // Function to set color from string
  // Valkyrie: Quest.cs BoardComponent.SetColor(string)
  setColorName(colorName: string): void {
    // Translate from name to #RRGGBB, will return input if already #RRGGBB
    const colorRGB = ColorUtil.fromName(colorName);
    // Check format is valid
    if (colorRGB.length !== 7 || colorRGB[0] !== '#') {
      this.game.currentQuest!.log.add(new LogEntry('Warning: Color must be in #RRGGBB format or a known name: ' + colorName, true));
    }

    // State with white (used for alpha)
    // Hexadecimal to float convert (0x00-0xFF -> 0.0-1.0)
    let colour: Color;
    // Not in Valkyrie (16 October 2026): a colour that Convert.ToInt32 or Substring cannot read threw; white is used
    try {
      colour = new Color(
        hexToInt(substring(colorRGB, 1, 2)) / 255,
        hexToInt(substring(colorRGB, 3, 2)) / 255,
        hexToInt(substring(colorRGB, 5, 2)) / 255,
        1,
      );
    } catch {
      this.game.currentQuest!.log.add(new LogEntry('Warning: Unreadable color, using white: ' + colorName, true));
      colour = Color.white;
    }
    this.setColor(colour);
  }
}
