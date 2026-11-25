// Ported from Valkyrie (Apache-2.0), modified: unity/Assets/Scripts/Quest/Quest.cs (the layout in Quest.UI.UI) and
// unity/Assets/Scripts/UI/UIElementBorder.cs (its thickness). Where a quest UI element sits on the screen, in CSS pixels
// from the top left; the app draws it over the board (QuestUILayer.tsx).
import { Mathf, type QuestData } from '@universalis/engine';

export type QuestUILayout = Pick<QuestData.UI, 'size' | 'verticalUnits' | 'hAlign' | 'vAlign' | 'location'>;

export interface ScreenSize {
  width: number;
  height: number;
}

export interface ScreenRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

/** UIScaler.rowsOfUnits: the screen is 30 units high. */
const rowsOfUnits = 30;

// Valkyrie: Quest.cs UI.UI (SetInsetAndSizeFromParentEdge from the alignment, size and location)
export function questUIRect(qUI: QuestUILayout, aspect: number, screen: ScreenSize): ScreenRect {
  let unitScale = screen.width;
  let hSize = qUI.size * unitScale;
  let vSize = hSize / aspect;
  if (qUI.verticalUnits) {
    unitScale = screen.height;
    vSize = qUI.size * unitScale;
    hSize = vSize * aspect;
  }

  const hOffset = qUI.location.x * unitScale;
  const vOffset = qUI.location.y * unitScale;

  let left: number;
  if (qUI.hAlign < 0) left = hOffset;
  else if (qUI.hAlign > 0) left = screen.width - hOffset - hSize;
  else left = hOffset + (screen.width - hSize) / 2;

  let top: number;
  if (qUI.vAlign < 0) top = vOffset;
  else if (qUI.vAlign > 0) top = screen.height - vOffset - vSize;
  else top = vOffset + (screen.height - vSize) / 2;

  return { left, top, width: hSize, height: vSize };
}

// Valkyrie: Quest.cs UI.UI (fontSize = Mathf.RoundToInt(UIScaler.GetPixelsPerUnit() * qUI.textSize))
export function questUIFontSize(textSize: number, screen: ScreenSize): number {
  return Mathf.roundToInt((screen.height / rowsOfUnits) * textSize);
}

// Valkyrie: UIElementBorder.cs UIElementBorder.CreateBorder (thickness 0.05 units)
export function questUIBorder(screen: ScreenSize): number {
  return 0.05 * (screen.height / rowsOfUnits);
}
