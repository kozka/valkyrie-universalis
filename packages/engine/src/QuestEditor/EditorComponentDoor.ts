// Ported from Valkyrie (Apache-2.0), modified: unity/Assets/Scripts/QuestEditor/EditorComponentDoor.cs
// Only what the door's panel does to it, and the choices its colour window offers; the panel is the app's
// (editor/PiecePanel.tsx), which draws the door again after each change (CurrentQuest.Remove and Add). The parts of
// the event a door keeps are the event panel's.
import type { QuestData } from '../Content/QuestData.ts';
import { ColorUtil } from '../UI/ColorUtil.ts';

export const EditorComponentDoor = {
  /** Across or along: any turn but 0 goes back to 0. */
  // Valkyrie: EditorComponentDoor.cs EditorComponentDoor.Rotate
  rotate(door: QuestData.Door): void {
    door.rotation = door.rotation === 0 ? 90 : 0;
  },

  // Valkyrie: EditorComponentDoor.cs EditorComponentDoor.Colour
  colourChoices(): string[] {
    return [...ColorUtil.lookUp().keys()];
  },

  // Valkyrie: EditorComponentDoor.cs EditorComponentDoor.SelectColour
  selectColour(door: QuestData.Door, colour: string): void {
    door.colourName = colour;
  },
};
