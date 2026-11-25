// What the graph keeps besides the scenario: where the author moved each node (by its id, per scenario, in this
// browser), which row it shows, and whether it follows what is selected elsewhere. The scenario's files never hold any
// of it. Not in Valkyrie.
import { create } from 'zustand';

export type Offsets = Record<string, { dx: number; dy: number }>;

interface GraphState {
  /** The scenario whose moves are loaded. */
  folder: string;
  offsets: Offsets;
  /** The row shown, by its index, or null for every row. */
  row: number | null;
  /** The view goes to what is selected in the list, the map or the panel. */
  follow: boolean;
  legend: boolean;
  /** A link chosen in the graph, to take away with Delete. */
  edge: string | null;
}

const KEY = 'universalis.editor.graph:';

function read(folder: string): Offsets {
  try {
    const kept = JSON.parse(localStorage.getItem(KEY + folder) ?? '{}') as unknown;
    return kept !== null && typeof kept === 'object' ? (kept as Offsets) : {};
  } catch {
    return {};
  }
}

function write(folder: string, offsets: Offsets): void {
  try {
    if (Object.keys(offsets).length === 0) localStorage.removeItem(KEY + folder);
    else localStorage.setItem(KEY + folder, JSON.stringify(offsets));
  } catch {
    // Storage blocked or full: the moves last as long as the page
  }
}

export const useGraph = create<GraphState>(() => ({ folder: '', offsets: {}, row: null, follow: true, legend: false, edge: null }));

/** The scenario open: its moves, and every row. */
export function openGraph(folder: string): void {
  if (useGraph.getState().folder === folder) return;
  useGraph.setState({ folder, offsets: read(folder), row: null, edge: null });
}

export function moveNode(id: string, dx: number, dy: number): void {
  useGraph.setState((s) => ({ offsets: { ...s.offsets, [id]: { dx, dy } } }));
}

/** The moves are kept once a drag ends, not at every step of it. */
export function keepMoves(): void {
  const { folder, offsets } = useGraph.getState();
  write(folder, offsets);
}

/** Back to the graph's own order. */
export function resetMoves(): void {
  const { folder } = useGraph.getState();
  useGraph.setState({ offsets: {} });
  write(folder, {});
}
