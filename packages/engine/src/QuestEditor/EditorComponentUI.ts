// Ported from Valkyrie (Apache-2.0), modified: unity/Assets/Scripts/QuestEditor/EditorComponentUI.cs
// Only what the UI element's panel does to it, and the choices its selection windows offer; the panel is the app's
// (editor/UIPanel.tsx), which draws the element again after each change (CurrentQuest.Remove and Add). The parts of the
// event a UI element keeps are the event panel's.
import { ImageData } from '../Content/ContentTypes.ts';
import { LocalizationRead } from '../Content/LocalizationRead.ts';
import type { QuestData } from '../Content/QuestData.ts';
import { TextAlignment, TextAlignmentUtils } from '../Content/TextAlignment.ts';
import { Game } from '../Game.ts';
import { floatTryParse } from '../platform/CSharp.ts';
import { ColorUtil } from '../UI/ColorUtil.ts';
import { questPictures } from './EditorComponent.ts';
import { contentItem, fileItem, type SelectionItem } from './SelectionTraits.ts';

/** A number typed in one of the panel's boxes: an empty box keeps the value, anything else not a number is 0. */
function typed(text: string, current: number): number {
  if (text === '') return current;
  return Math.fround(floatTryParse(text).value);
}

export const EditorComponentUI = {
  /**
   * What the image window offers: the scenario's pictures, then the content's. Not in Valkyrie, whose window never
   * shows its {NONE} (it has no source): none ('') is offered by the panel, and makes the element a text.
   */
  // Valkyrie: EditorComponentUI.cs EditorComponentUI.SetImage
  imageChoices(): SelectionItem[] {
    return [...questPictures().map(fileItem), ...Game.get().cd.values(ImageData).map((image) => contentItem(image))];
  },

  /** A picture: its text goes, with no border and the aspect 1; none: an empty text. */
  // Valkyrie: EditorComponentUI.cs EditorComponentUI.SelectImage
  selectImage(ui: QuestData.UI, image: string): void {
    ui.imageName = image;
    if (ui.imageName.length > 0) {
      LocalizationRead.dicts.get('qst')!.remove(ui.uitext_key);
      ui.border = false;
      ui.aspect = 1;
    } else {
      LocalizationRead.updateScenarioText(ui.uitext_key, '');
    }
  },

  /** Its place and size follow the screen's height or its width. */
  // Valkyrie: EditorComponentUI.cs EditorComponentUI.ChangeUnits
  changeUnits(ui: QuestData.UI): void {
    ui.verticalUnits = !ui.verticalUnits;
  },

  /** Which corner, side or middle of the screen it is placed from: -1, 0 or 1 each way. */
  // Valkyrie: EditorComponentUI.cs EditorComponentUI.SetAlign
  setAlign(ui: QuestData.UI, x: number, y: number): void {
    ui.hAlign = x;
    ui.vAlign = y;
  },

  /** Its place, size and (a text's) aspect, typed. */
  // Valkyrie: EditorComponentUI.cs EditorComponentUI.UpdateNumbers
  updateNumbers(ui: QuestData.UI, numbers: { x?: string; y?: string; size?: string; aspect?: string }): void {
    if (numbers.x !== undefined) ui.location.x = typed(numbers.x, ui.location.x);
    if (numbers.y !== undefined) ui.location.y = typed(numbers.y, ui.location.y);
    if (numbers.size !== undefined) ui.size = typed(numbers.size, ui.size);
    if (numbers.aspect !== undefined) ui.aspect = typed(numbers.aspect, ui.aspect);
  },

  /** A text typed: an empty box keeps the old one. */
  // Valkyrie: EditorComponentUI.cs EditorComponentUI.UpdateUIText
  updateUIText(ui: QuestData.UI, text: string): void {
    if (text.length > 0) LocalizationRead.updateScenarioText(ui.uitext_key, text);
  },

  /** What is not a number is 0. */
  // Valkyrie: EditorComponentUI.cs EditorComponentUI.UpdateTextSize
  updateTextSize(ui: QuestData.UI, text: string): void {
    ui.textSize = Math.fround(floatTryParse(text).value);
  },

  // Valkyrie: EditorComponentUI.cs EditorComponentUI.SetRichText
  setRichText(ui: QuestData.UI): void {
    ui.richText = !ui.richText;
  },

  /** The alignments the window offers, as they are written. */
  // Valkyrie: EditorComponentUI.cs EditorComponentUI.SetTextAlignment
  textAlignmentChoices(): string[] {
    return Object.keys(TextAlignment);
  },

  // Valkyrie: EditorComponentUI.cs EditorComponentUI.SelectTextAlignment
  selectTextAlignment(ui: QuestData.UI, alignment: string): void {
    ui.textAlignment = TextAlignmentUtils.parseAlignment(alignment);
  },

  /** The colours the text and background windows offer. */
  // Valkyrie: EditorComponentUI.cs EditorComponentUI.SetColour and SetBackgroundColour
  colourChoices(): string[] {
    return [...ColorUtil.lookUp().keys()];
  },

  // Valkyrie: EditorComponentUI.cs EditorComponentUI.SelectColour
  selectColour(ui: QuestData.UI, colour: string): void {
    ui.textColor = colour;
  },

  // Valkyrie: EditorComponentUI.cs EditorComponentUI.SelectBackgroundColour
  selectBackgroundColour(ui: QuestData.UI, colour: string): void {
    ui.textBackgroundColor = colour;
  },

  // Valkyrie: EditorComponentUI.cs EditorComponentUI.ToggleBorder
  toggleBorder(ui: QuestData.UI): void {
    ui.border = !ui.border;
  },

  /** How fast it fades in and out, as written. */
  // Valkyrie: EditorComponentUI.cs EditorComponentUI.SetFadeSpeed
  fadeSpeedChoices(): string[] {
    return ['instant', 'fast', 'slow'];
  },

  // Valkyrie: EditorComponentUI.cs EditorComponentUI.SelectFadeSpeed
  selectFadeSpeed(ui: QuestData.UI, speed: string): void {
    ui.fadeSpeed = speed;
  },

  // Valkyrie: EditorComponentUI.cs EditorComponentUI.ToggleClickEffect
  toggleClickEffect(ui: QuestData.UI): void {
    ui.enableClick = !ui.enableClick;
  },
};
