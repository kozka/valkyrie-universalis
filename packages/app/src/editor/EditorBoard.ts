// The scenario editor's board: the game's (board/Board.ts) with a grid over the tiles, a strong line every step a tile
// snaps to and fainter ones every step the other pieces snap to, in the theme's accent, repeated over the table like
// its felt. Here and not in Board.ts, so that the published app has none of it. Not in Valkyrie, whose editor draws no
// grid.
import { Texture } from 'pixi.js';
import { Game } from '@universalis/engine';
import { Board } from '../board/Board.ts';
import { pixelsPerUnit, positionShowing } from '../board/camera.ts';
import { createQuad, destroyQuad, placeQuad, type Quad } from '../board/perspective.ts';
import { TABLE_SIZE } from '../board/table.ts';

/** The steps of the grid, in board units: a tile's (GameType.TileRound) and a piece's (GameType.SelectionRound). */
export interface GridSteps {
  major: number;
  minor: number;
}

/** One square of the major step, split by fainter lines into squares of the minor one; each line straddles its edge. */
function gridTexture(colour: string, steps: GridSteps): Texture {
  const size = 256;
  const divisions = Math.max(1, Math.round(steps.major / steps.minor));
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext('2d')!;
  context.fillStyle = colour;
  const line = (at: number, alpha: number) => {
    context.globalAlpha = alpha;
    context.fillRect(at - 1, 0, 2, size);
    context.fillRect(0, at - 1, size, 2);
  };
  line(0, 0.25);
  line(size, 0.25);
  for (let i = 1; i < divisions; i++) line((size * i) / divisions, 0.1);
  const texture = Texture.from(canvas, true);
  texture.source.autoGenerateMipmaps = true;
  texture.source.style.addressMode = 'repeat';
  texture.source.style.maxAnisotropy = 8;
  return texture;
}

export class EditorBoard extends Board {
  private readonly steps: GridSteps;
  private readonly colour: string;
  private grid: Quad | null = null;
  private gridShown = true;
  /** The map's panels change its size without the window's: the canvas follows its box. */
  private readonly sized: ResizeObserver;

  constructor(host: HTMLElement, canvasHost: HTMLElement, steps: GridSteps) {
    super(host, canvasHost);
    this.steps = steps;
    this.colour = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();
    this.sized = new ResizeObserver(() => this.app?.queueResize());
    this.sized.observe(canvasHost);
  }

  showGrid(shown: boolean): void {
    this.gridShown = shown;
    if (this.grid !== null) this.grid.visible = shown;
  }

  /** Closer (positive) or further, a notch of the wheel at a time. */
  zoom(notches: number): void {
    this.zoomNotches(notches);
  }

  /** Shows these board points, as close as they fit with a margin (a tile's step), in the middle of the map. */
  showAll(points: { x: number; y: number }[]): void {
    if (points.length === 0) return;
    const xs = points.map((p) => p.x);
    const ys = points.map((p) => p.y);
    const margin = this.steps.major;
    const width = Math.max(...xs) - Math.min(...xs) + 2 * margin;
    const height = Math.max(...ys) - Math.min(...ys) + 2 * margin;
    const view = this.view();
    // The highest camera that still shows it all; pixelsPerUnit grows as the camera comes down
    let z = -1;
    while (z > -25 && (pixelsPerUnit(z, view) * width > view.width || pixelsPerUnit(z, view) * height > view.height)) z -= 0.25;
    const cc = Game.get().cc;
    cc.targetSet = false;
    cc.position = positionShowing({ x: (Math.max(...xs) + Math.min(...xs)) / 2, y: (Math.max(...ys) + Math.min(...ys)) / 2 }, z);
  }

  override async start(): Promise<void> {
    await super.start();
    // Destroyed before it started: no app
    if (this.app === null) return;
    const grid = createQuad(gridTexture(this.colour, this.steps));
    // An even number of squares, so that a line falls on 0
    const squares = 2 * Math.ceil(TABLE_SIZE / (2 * this.steps.major));
    placeQuad(grid, 0, 0, 0, squares * this.steps.major, squares * this.steps.major);
    grid.geometry.uvs.set([0, 0, squares, 0, squares, squares, 0, squares]);
    grid.geometry.getBuffer('aUV').update();
    this.app.stage.addChildAt(grid, this.app.stage.getChildIndex(this.tileLayer) + 1);
    grid.visible = this.gridShown;
    this.grid = grid;
  }

  override destroy(): void {
    this.sized.disconnect();
    if (this.grid !== null) {
      const texture = this.grid.texture;
      destroyQuad(this.grid);
      texture.destroy(true);
      this.grid = null;
    }
    super.destroy();
  }
}
