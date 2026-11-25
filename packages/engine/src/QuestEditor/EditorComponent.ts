// Ported from Valkyrie (Apache-2.0), modified: unity/Assets/Scripts/QuestEditor/EditorComponent.cs
// Only what the panel does to the quest and the map: renaming, the comment, the source file, the pictures a component
// can show, and the mark it leaves on the map. The panel itself is the app's.
import { ImageData } from '../Content/ContentTypes.ts';
import { LocalizationRead } from '../Content/LocalizationRead.ts';
import { QuestData } from '../Content/QuestData.ts';
import { Game } from '../Game.ts';
import type { Vector2 } from '../platform/Vector2.ts';
import { substring } from '../platform/CSharp.ts';
import { netAdd, netRemove } from '../platform/NetDictionary.ts';
import { Directory, Path, SearchOption } from '../platform/SystemIO.ts';
import { changeReference, QuestEditorData } from './QuestEditorData.ts';
import { contentItem, fileItem, type SelectionItem } from './SelectionTraits.ts';

/**
 * The png and then the jpg pictures under the scenario's folder, as paths from it. Not in Valkyrie: with forward
 * slashes, which every system reads, where Valkyrie on Windows writes backslashes for a tile's or a token's picture.
 */
export function questPictures(): string[] {
  const folder = Path.getDirectoryName(Game.get().currentQuest!.qd.questPath.replace(/\\/g, '/'))!;
  const found: string[] = [];
  for (const pattern of ['*.png', '*.jpg']) {
    for (const file of Directory.getFiles(folder, pattern, SearchOption.AllDirectories)) found.push(file.replace(/\\/g, '/').substring(folder.length + 1));
  }
  return found;
}

/** Where a panel puts the camera, and the mark it leaves there (TileAnchor, MonsterLoc, EventLoc), or none. */
export interface EditorHighlight {
  location: Vector2;
  mark: string | null;
}

// Super class for all editor selectable components
// Valkyrie: EditorComponent.cs EditorComponent
export const EditorComponent = {
  /** The map as every panel leaves it before it draws: the dialogs' and the editor's marks gone, every piece dimmed. */
  // Valkyrie: EditorComponent.cs EditorComponent.Clean
  clean(): void {
    const game = Game.get();
    // Clean up everything marked as 'dialog'
    game.ui.destroyTag(Game.DIALOG);
    // Clean up everything marked as 'editor'
    game.ui.destroyTag(Game.EDITOR);
    // Dim all components, this component will be made solid later
    game.currentQuest!.changeAlphaAll();
  },

  /**
   * Where the panel of a component puts the camera when it is drawn, and its mark: a tile its anchor, a monster place
   * its square, an event (a door, a spawn) its place when it has one or moves the camera; a token only moves the
   * camera, and a UI element, a puzzle and the rest do neither.
   */
  // Valkyrie: EditorComponentTile.cs and EditorComponentMPlace.cs AddSubComponents, EditorComponentEvent.cs Highlight and its overrides
  highlightOf(component: QuestData.QuestComponent): EditorHighlight | null {
    if (component instanceof QuestData.Tile) return { location: component.location, mark: 'TileAnchor' };
    if (component instanceof QuestData.MPlace) return { location: component.location, mark: 'MonsterLoc' };
    if (component instanceof QuestData.Token) return { location: component.location, mark: null };
    if (component instanceof QuestData.UI || component instanceof QuestData.Puzzle) return null;
    if (component instanceof QuestData.Event && (component.locationSpecified || component.maxCam || component.minCam)) {
      return { location: component.location, mark: 'EventLoc' };
    }
    return null;
  },

  /**
   * What drawing a component's panel does to the map, the camera apart (highlightOf): the map cleaned, the component's
   * piece made solid (only tiles, doors, tokens and UI elements are pieces) and its place marked.
   */
  // Valkyrie: EditorComponent.cs EditorComponent.Update (Clean, then each type's AddSubComponents)
  drawOnMap(name: string): void {
    EditorComponent.clean();
    const game = Game.get();
    const component = game.currentQuest!.qd.components.get(name);
    if (component === undefined) return;
    game.currentQuest!.changeAlpha(name, 1);
    const place = EditorComponent.highlightOf(component);
    if (place !== null && place.mark !== null) game.tokenBoard.addHighlightAt(place.location, place.mark, Game.EDITOR);
  },

  /** What the rename dialog shows: the name without its type. */
  // Valkyrie: EditorComponent.cs EditorComponent.Rename
  renameValue(component: QuestData.QuestComponent): string {
    return component.sectionName.substring(component.typeDynamic.length);
  },

  /**
   * Item renamed: returns the component's name afterwards. Not in Valkyrie: a name whose texts are still in the
   * localization (left there by hand) is skipped like a taken one, because RenamePrefix would throw on them half way;
   * a trigger that only starts with the old name is kept (changeReference); and the texts that name the component follow it.
   */
  // Valkyrie: EditorComponent.cs EditorComponent.RenameFinished
  renameFinished(component: QuestData.QuestComponent, value: string): string {
    // Remove all not allowed characters from name
    const newName = value.replace(/[^A-Za-z0-9_]/g, '');
    // Must have a name
    if (newName === '') return component.sectionName;
    // Add type
    const baseName = component.typeDynamic + newName;
    // Find first available unique name
    let name = baseName;
    // If nothing has changed, skip renaming
    if (component.sectionName === baseName) return component.sectionName;
    const game = Game.get();
    const components = game.currentQuest!.qd.components;
    const qst = LocalizationRead.dicts.get('qst')!;
    let i = 0;
    while (components.has(name) || qst.hasKeyWithPrefix(name + '.')) {
      name = baseName + i++;
    }

    // Update all references to this component
    for (const c of components.values()) {
      changeReference(c, component.sectionName, name);
    }

    qst.renamePrefix(component.sectionName + '.', name + '.');
    // Not in Valkyrie: the texts that show the component ({c:…}) or one of its texts ({qst:….}) follow it
    qst.replaceInValues('{c:' + component.sectionName + '}', '{c:' + name + '}');
    qst.replaceInValues('{qst:' + component.sectionName + '.', '{qst:' + name + '.');

    // Remove component by old name
    netRemove(components, component.sectionName);
    game.currentQuest!.remove(component.sectionName);
    component.sectionName = name;
    // Add component with new name
    netAdd(components, component.sectionName, component);
    game.currentQuest!.add(component.sectionName);
    // Reselect with new name
    QuestEditorData.selectComponent(component.sectionName);
    return name;
  },

  // Valkyrie: EditorComponent.cs EditorComponent.SetComment
  setComment(component: QuestData.QuestComponent, text: string): void {
    component.comment = text.replace(/\n/g, '\\n').replace(/\r/g, '\\n');
  },

  /** The comment as its box shows it. */
  // Valkyrie: EditorComponent.cs EditorComponent.AddComment
  commentText(component: QuestData.QuestComponent): string {
    return component.comment.replace(/\\n/g, '\n');
  },

  /** A new source file's name: '.ini' is added when it does not end so (a name under four letters throws, as in Valkyrie). */
  // Valkyrie: EditorComponent.cs EditorComponent.NewSource
  newSource(value: string): string {
    let s = value;
    if (substring(s, s.length - 4, 4) !== '.ini') {
      s += '.ini';
    }
    return s;
  },

  // Valkyrie: EditorComponent.cs EditorComponent.SetSource
  setSource(component: QuestData.QuestComponent, source: string): void {
    component.source = source;
  },

  /**
   * What the picture window of a tile or a token offers: the scenario's pictures, then the content's. Valkyrie also
   * lists {NONE} on top, which its window never shows (it has no source) and which would leave a tile with neither
   * side nor picture; its Reset button is the way back.
   */
  // Valkyrie: EditorComponent.cs EditorComponent.SetCustomImage
  customImageChoices(): SelectionItem[] {
    return [...questPictures().map(fileItem), ...Game.get().cd.values(ImageData).map((image) => contentItem(image))];
  },
};
