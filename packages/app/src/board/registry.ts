// The objects Valkyrie would have on its board: the tiles on Game.boardCanvas, the tokens, doors, monster places and
// highlights on Game.tokenCanvas, and the quest UI elements on the QuestUICanvas panel. The engine adds and destroys
// them through game.ui (ReactUI); the board view draws them. Not ported from Valkyrie. Each list keeps Unity's sibling
// order: what comes later is drawn on top.
import type { GameObject, Quest } from '@universalis/engine';

export type BoardLayer = 'board' | 'token';

export class BoardRegistry {
  /** Tiles (Game.boardCanvas), under everything else. */
  readonly tiles: GameObject[] = [];
  /** Tokens, doors, monster places, items and highlights (Game.tokenCanvas). */
  readonly tokens: GameObject[] = [];
  /** Quest UI elements (QuestUICanvas): over the board, under the windows. */
  readonly questUI: Quest.UI[] = [];
  /** Grows on every change, so the board view knows when to look again. */
  revision = 0;

  // Valkyrie: gameObject.transform.SetParent(game.boardCanvas.transform) or SetParent(game.tokenCanvas.transform)
  add(layer: BoardLayer, gameObject: GameObject): void {
    (layer === 'board' ? this.tiles : this.tokens).push(gameObject);
    this.revision++;
  }

  // Valkyrie: Quest.cs Quest.UI.UI (unityObject.transform.SetParent(panel.transform))
  addUI(component: Quest.UI): void {
    this.questUI.push(component);
    this.revision++;
  }

  // Valkyrie: Object.Destroy(gameObject)
  remove(gameObject: GameObject): void {
    const before = this.tiles.length + this.tokens.length + this.questUI.length;
    removeWhere(this.tiles, (o) => o === gameObject);
    removeWhere(this.tokens, (o) => o === gameObject);
    removeWhere(this.questUI, (c) => c.unityObject === gameObject);
    if (this.tiles.length + this.tokens.length + this.questUI.length !== before) this.revision++;
  }

  // Valkyrie: foreach (GameObject go in GameObject.FindGameObjectsWithTag(tag)) Object.Destroy(go)
  destroyTag(tag: string): void {
    const before = this.tiles.length + this.tokens.length + this.questUI.length;
    removeWhere(this.tiles, (o) => o.tag === tag);
    removeWhere(this.tokens, (o) => o.tag === tag);
    removeWhere(this.questUI, (c) => c.unityObject === null || c.unityObject.tag === tag);
    if (this.tiles.length + this.tokens.length + this.questUI.length !== before) this.revision++;
  }

  // Valkyrie: GameObject.FindGameObjectWithTag(tag) != null, for the objects on the board
  hasTag(tag: string): boolean {
    return this.tiles.some((o) => o.tag === tag) || this.tokens.some((o) => o.tag === tag) || this.questUI.some((c) => c.unityObject?.tag === tag);
  }
}

function removeWhere<T>(list: T[], test: (item: T) => boolean): void {
  for (let i = list.length - 1; i >= 0; i--) {
    if (test(list[i]!)) list.splice(i, 1);
  }
}

/** The board of the app: ReactUI fills it, the board view draws it. */
export const board = new BoardRegistry();
