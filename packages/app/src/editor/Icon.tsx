// The editor's icons: plain line drawings in the text's colour, on a 24-unit grid, drawn here so that nothing is fetched.
// Each button that shows one says what it does in its name and tooltip. Not in Valkyrie, whose editor has words only.

const PATHS = {
  save: 'M5 4h11l3 3v13H5zM8 4v5h7V4M8 20v-6h8v6',
  undo: 'M9 14 4 9l5-5M4 9h10a6 6 0 0 1 0 12h-3',
  redo: 'M15 14l5-5-5-5M20 9H10a6 6 0 0 0 0 12h3',
  play: 'M7 4.5v15l12-7.5z',
  palette: 'M12 3a9 9 0 0 0 0 18c1.1 0 1.6-.8 1.6-1.6 0-1.3-1-1.6-1-2.6 0-.9.7-1.4 1.6-1.4H16a5 5 0 0 0 5-5c0-4.1-4-7.4-9-7.4zM7.5 11h.01M10 7.5h.01M14.5 7.5h.01M17 11h.01',
  eye: 'M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  more: 'M5 12h.01M12 12h.01M19 12h.01',
  menu: 'M4 6h16M4 12h16M4 18h16',
  back: 'M19 12H5M11 18l-6-6 6-6',
  panelLeft: 'M4 4h16v16H4zM9.5 4v16',
  panelRight: 'M4 4h16v16H4zM14.5 4v16',
  panelBottom: 'M4 4h16v16H4zM4 14.5h16',
  grid: 'M4 4h16v16H4zM9.33 4v16M14.67 4v16M4 9.33h16M4 14.67h16',
  magnet: 'M6 4v8a6 6 0 0 0 12 0V4h-4v8a2 2 0 0 1-4 0V4zM6 8h4M14 8h4',
  zoomIn: 'M10.5 17a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13zM20 20l-4.8-4.8M10.5 8v5M8 10.5h5',
  zoomOut: 'M10.5 17a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13zM20 20l-4.8-4.8M8 10.5h5',
  focus: 'M12 19a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM12 2v4M12 18v4M2 12h4M18 12h4',
  rotate: 'M20 12a8 8 0 1 1-2.34-5.66M20 4v5h-5',
  rotateBack: 'M4 12a8 8 0 1 0 2.34-5.66M4 4v5h5',
  trash: 'M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6',
  code: 'M9 7l-5 5 5 5M15 7l5 5-5 5',
  plus: 'M12 5v14M5 12h14',
  chevron: 'M9 6l6 6-6 6',
  search: 'M10.5 17a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13zM20 20l-4.8-4.8',
  alert: 'M12 3 2 20h20zM12 10v4M12 17h.01',
  keyboard: 'M3 6h18v12H3zM7 10h.01M11 10h.01M15 10h.01M7 14h10',
  maximize: 'M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5',
  minimize: 'M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5',
  close: 'M6 6l12 12M18 6 6 18',
  check: 'M5 12.5l4.5 4.5L19 7',
  reload: 'M20 5v5h-5M4 19v-5h5M18.5 9A7 7 0 0 0 5.6 8M5.5 15a7 7 0 0 0 12.9 1',
  history: 'M3 12a9 9 0 1 0 3-6.7M3 4v5h5M12 7v5l3 2',
  file: 'M6 3h8l4 4v14H6zM14 3v4h4',
  folder: 'M3 6h6l2 2h10v11H3z',
  package: 'M12 3 3 7.5v9L12 21l9-4.5v-9zM3 7.5l9 4.5 9-4.5M12 12v9',
  download: 'M12 4v11M7 10l5 5 5-5M5 20h14',
  home: 'M4 11 12 4l8 7v9h-5v-6H9v6H4z',
  locate: 'M12 21s7-6.2 7-11.5a7 7 0 0 0-14 0C5 14.8 12 21 12 21zM12 12a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z',
  link: 'M10 14a4 4 0 0 0 6 .5l3-3a4 4 0 0 0-5.7-5.7L12 7M14 10a4 4 0 0 0-6-.5l-3 3a4 4 0 0 0 5.7 5.7L12 17',
  // The components' types (ComponentList.tsx)
  quest: 'M6 3h12v18H6zM9 8h6M9 12h6M9 16h3',
  tile: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z',
  door: 'M6 21V4h12v17M3 21h18M14.5 12.5h.01',
  token: 'M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  ui: 'M3 5h18v14H3zM7 10h10M7 14h6',
  event: 'M13 3 5 13.5h6L10 21l9-11h-6z',
  spawn: 'M12 3a7 7 0 0 0-7 7v4l-2 3h4l1 3h8l1-3h4l-2-3v-4a7 7 0 0 0-7-7zM9 11h.01M15 11h.01',
  mplace: 'M12 21s7-6.2 7-11.5a7 7 0 0 0-14 0C5 14.8 12 21 12 21zM12 12a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z',
  qitem: 'M4 8l8-4 8 4v8l-8 4-8-4zM4 8l8 4 8-4M12 12v8',
  puzzle: 'M5 8h3.5a2 2 0 1 1 4 0H16v3.5a2 2 0 1 1 0 4V19h-3.5a2 2 0 1 0-4 0H5v-3.5a2 2 0 1 0 0-4z',
  monster: 'M4 10c0-4 3.6-7 8-7s8 3 8 7v9l-2.7-2-2.6 2-2.7-2-2.7 2-2.6-2L4 19zM9 10h.01M15 10h.01',
  activation: 'M5 5h14M5 10h14M5 15h9M17 15l2 2 3-4',
} as const;

export type IconName = keyof typeof PATHS;

export function Icon({ name, className }: { name: IconName; className?: string }) {
  return (
    <svg className={'editor-icon' + (className === undefined ? '' : ' ' + className)} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d={PATHS[name]} />
    </svg>
  );
}

/** The icon of a component's type, as the list groups them (ComponentList.tsx). */
export function typeIcon(type: string): IconName {
  const icons: Record<string, IconName> = {
    Tile: 'tile',
    Door: 'door',
    Token: 'token',
    UI: 'ui',
    Event: 'event',
    Spawn: 'spawn',
    MPlace: 'mplace',
    QItem: 'qitem',
    StartingItem: 'qitem',
    Puzzle: 'puzzle',
    CustomMonster: 'monster',
    Activation: 'activation',
  };
  return icons[type] ?? 'file';
}
