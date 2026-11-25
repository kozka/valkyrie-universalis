// Ported from Valkyrie (Apache-2.0), modified: unity/Assets/Scripts/QuestEditor/EditorComponentMPlace.cs
// Only what the monster place's panel does to it; the panel is the app's (editor/PiecePanel.tsx).
import type { QuestData } from '../Content/QuestData.ts';

export const EditorComponentMPlace = {
  /** Whether the monster lies across the squares. */
  // Valkyrie: EditorComponentMPlace.cs EditorComponentMPlace.Rotate
  rotate(place: QuestData.MPlace): void {
    place.rotate = !place.rotate;
  },

  /** Whether it is the master's place. */
  // Valkyrie: EditorComponentMPlace.cs EditorComponentMPlace.MasterToggle
  masterToggle(place: QuestData.MPlace): void {
    place.master = !place.master;
  },

  /** The sizes the size window offers, as written: the default ('') first. */
  // Valkyrie: EditorComponentMPlace.cs EditorComponentMPlace.ClickSize
  sizeChoices(): string[] {
    return ['', 'small', 'medium', 'huge', 'massive', 'Original'];
  },

  // Valkyrie: EditorComponentMPlace.cs EditorComponentMPlace.SelectSize
  selectSize(place: QuestData.MPlace, size: string): void {
    place.tokenSize = size;
  },
};
