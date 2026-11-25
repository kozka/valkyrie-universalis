// Ported from Valkyrie (Apache-2.0), modified: unity/Assets/Scripts/QuestEditor/EditorComponentToken.cs
// Only what the token's panel does to it, and the choices its selection windows offer; the panel is the app's
// (editor/PiecePanel.tsx), which draws the token again after each change (CurrentQuest.Remove and Add). The parts of
// the event a token keeps are the event panel's.
import { MonsterData, TokenData } from '../Content/ContentTypes.ts';
import type { QuestData } from '../Content/QuestData.ts';
import { Game } from '../Game.ts';
import { contentItem, type SelectionItem } from './SelectionTraits.ts';

export const EditorComponentToken = {
  /** A quarter turn, and 0 after 270. */
  // Valkyrie: EditorComponentToken.cs EditorComponentToken.Rotate
  rotate(token: QuestData.Token): void {
    token.rotation += 90;
    if (token.rotation > 300) token.rotation = 0;
  },

  /**
   * What the type window offers: the content's tokens, then its monsters. Valkyrie also lists {NONE} on top, which its
   * window never shows (it has no source) and which would be written as the token's type.
   */
  // Valkyrie: EditorComponentToken.cs EditorComponentToken.Type
  typeChoices(): SelectionItem[] {
    const cd = Game.get().cd;
    return [...cd.values(TokenData).map((t) => contentItem(t)), ...cd.values(MonsterData).map((m) => contentItem(m))];
  },

  // Valkyrie: EditorComponentToken.cs EditorComponentToken.SelectType
  selectType(token: QuestData.Token, type: string): void {
    token.tokenName = type.split(' ')[0]!;
  },

  /** The sizes the size window offers, as they are written; Original is the picture's own. */
  // Valkyrie: EditorComponentToken.cs EditorComponentToken.ClickSize
  sizeChoices(): string[] {
    return ['small', 'medium', 'huge', 'massive', 'Original'];
  },

  // Valkyrie: EditorComponentToken.cs EditorComponentToken.SelectSize
  selectSize(token: QuestData.Token, size: string): void {
    token.tokenSize = size;
  },

  /** Whether it blinks when pressed. */
  // Valkyrie: EditorComponentToken.cs EditorComponentToken.ToggleClickEffect
  toggleClickEffect(token: QuestData.Token): void {
    token.enableClick = !token.enableClick;
  },

  /** A picture of its own (from EditorComponent.customImageChoices): a search token at the picture's size. */
  // Valkyrie: EditorComponentToken.cs EditorComponentToken.SelectCustomImage
  selectCustomImage(token: QuestData.Token, image: string): void {
    if (image === '{NONE}') {
      token.customImage = '';
    } else {
      token.customImage = image;
      token.tokenName = 'TokenSearch';
      token.tokenSize = 'Original';
    }
  },

  /** Reset: no picture of its own, a search token. */
  // Valkyrie: EditorComponentToken.cs EditorComponentToken.ClearCustomImage
  clearCustomImage(token: QuestData.Token): void {
    token.customImage = '';
    token.tokenName = 'TokenSearch';
  },
};
