// How the workbench is laid out on this device: which panels are open and how big, the map's grid and snapping, and
// which parts of the panels are folded. Kept in the browser's local storage, as a convenience of this device only (a
// private window or blocked storage starts from the defaults). Not in Valkyrie, whose editor has one fixed layout.
import { create } from 'zustand';

export interface Layout {
  /** The selected component's panel, on the left as in Valkyrie; the list of components, on the right; the panel below. */
  left: boolean;
  right: boolean;
  bottom: boolean;
  /** Their sizes, in CSS pixels. */
  leftWidth: number;
  rightWidth: number;
  bottomHeight: number;
  /** The panel below drawn as tall as it goes, for the texts and the book. */
  tall: boolean;
  /** The map's grid, and whether a dragged piece snaps to it (Shift does the other). */
  grid: boolean;
  snap: boolean;
  /** The panel's parts shown one after another, without their headings and never folded. */
  flat: boolean;
  /** The parts of the panels folded or unfolded by hand, by their key; the rest keep their default. */
  folded: Record<string, boolean>;
  /** The component list's groups folded by hand, by type. */
  groups: Record<string, boolean>;
  /** What the right panel shows: the components, the history of changes or what was selected. */
  rightTab: RightTab;
  /** The editor's own colours (theme.css, data-editor-theme); the app's stay as the player chose them. */
  theme: EditorTheme;
}

export type RightTab = 'components' | 'history' | 'selections';

export const EDITOR_THEMES = ['dusk', 'graphite', 'paper', 'contrast'] as const;
export type EditorTheme = (typeof EDITOR_THEMES)[number];

const KEY = 'universalis.editor.layout';

export const LIMITS = { leftWidth: [260, 720], rightWidth: [260, 520], bottomHeight: [96, 900] } as const;

const DEFAULTS: Layout = {
  left: true,
  right: true,
  bottom: true,
  leftWidth: 400,
  rightWidth: 270,
  bottomHeight: 190,
  tall: false,
  grid: true,
  snap: true,
  flat: false,
  folded: {},
  groups: {},
  rightTab: 'components',
  theme: 'dusk',
};

function clamp(value: unknown, [min, max]: readonly [number, number], fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : fallback;
}

function read(): Layout {
  try {
    const kept = JSON.parse(localStorage.getItem(KEY) ?? '{}') as Partial<Layout>;
    const flag = (name: 'left' | 'right' | 'bottom' | 'tall' | 'grid' | 'snap' | 'flat') => (typeof kept[name] === 'boolean' ? kept[name] : DEFAULTS[name]);
    const record = (value: unknown) => (value !== null && typeof value === 'object' ? (value as Record<string, boolean>) : {});
    return {
      left: flag('left'),
      right: flag('right'),
      bottom: flag('bottom'),
      tall: flag('tall'),
      grid: flag('grid'),
      snap: flag('snap'),
      flat: flag('flat'),
      leftWidth: clamp(kept.leftWidth, LIMITS.leftWidth, DEFAULTS.leftWidth),
      rightWidth: clamp(kept.rightWidth, LIMITS.rightWidth, DEFAULTS.rightWidth),
      bottomHeight: clamp(kept.bottomHeight, LIMITS.bottomHeight, DEFAULTS.bottomHeight),
      folded: record(kept.folded),
      groups: record(kept.groups),
      rightTab: kept.rightTab === 'history' || kept.rightTab === 'selections' ? kept.rightTab : 'components',
      theme: EDITOR_THEMES.find((t) => t === kept.theme) ?? DEFAULTS.theme,
    };
  } catch {
    return { ...DEFAULTS };
  }
}

export const useLayout = create<Layout>(read);

useLayout.subscribe((layout) => {
  try {
    localStorage.setItem(KEY, JSON.stringify(layout));
  } catch {
    // Storage blocked or full: the layout lasts as long as the page
  }
});

export function setLayout(change: Partial<Layout>): void {
  useLayout.setState(change);
}

export function toggle(name: 'left' | 'right' | 'bottom' | 'tall' | 'grid' | 'snap'): void {
  useLayout.setState((s) => ({ [name]: !s[name] }));
}

/** Whether a part of a panel is unfolded: as it was left, or its default. */
export function isOpen(key: string, byDefault: boolean): boolean {
  const folded = useLayout.getState().folded[key];
  return folded === undefined ? byDefault : !folded;
}

export function setOpen(key: string, open: boolean): void {
  useLayout.setState((s) => ({ folded: { ...s.folded, [key]: !open } }));
}

export function setGroupOpen(type: string, open: boolean): void {
  useLayout.setState((s) => ({ groups: { ...s.groups, [type]: !open } }));
}
