// What the end-to-end tests read of the board, in development builds (BoardView.tsx and the editor's map set it on
// window).
// Not ported from Valkyrie.

export interface BoardProbe {
  /** The names of the tiles on the board, in drawing order. */
  tiles: () => string[];
  /** The names of the pieces drawn with their own picture rather than a schematic. */
  pictured: () => string[];
  /** The names of every piece drawn, with its picture or as a schematic. */
  drawn: () => string[];
  /** The clickable pieces, by object name, at their centre in page pixels. */
  clickable: () => { name: string; x: number; y: number }[];
  /** What is on the token canvas (tokens, doors, highlights), by object name, with its tag and its place on the board. */
  tokenObjects: () => { name: string; tag: string; x: number; y: number }[];
  camera: () => { x: number; y: number; z: number };
  /** Where a board point is on the page, in page pixels. */
  pointOnPage: (x: number, y: number) => { x: number; y: number };
  /** Leans the board's camera this many degrees (Valkyrie: 10), to compare how the board looks. */
  tilt: (degrees: number) => void;
}
