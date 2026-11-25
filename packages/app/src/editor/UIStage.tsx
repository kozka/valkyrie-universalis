// The screen as a game shows it, where the map is: the UI elements an event puts on it together (or every one, or the
// one chosen), laid out as Valkyrie lays them out (board/questUI.ts), each to be chosen, dragged to its place and
// sized with its corner (a text's right edge changes its aspect), or moved with the arrows. What changes is the
// element's place, size and aspect, through the session, so Undo takes it back. Not in Valkyrie, whose editor shows a
// UI element only by playing the scenario.
import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { createPortal } from 'react-dom';
import { ColorUtil, Game, ImageData, QUEST_SELECTION, QuestData, TextAlignment, floatToString } from '@universalis/engine';
import { pictureUrl } from '../board/pictures.ts';
import { questUIBorder, questUIFontSize, questUIRect, type ScreenSize } from '../board/questUI.ts';
import { RichText } from '../ui/RichText.tsx';
import { run } from '../ui/run.ts';
import { val } from '../ui/text.ts';
import { Tool } from './chrome.tsx';
import { choicePicture } from './Chooser.tsx';
import { useEditor } from './editorState.ts';
import { change, select } from './session.ts';
import { edi } from './text.ts';

/** A place or size as the panel writes it: two decimals, as an author types them. */
function neat(value: number): number {
  return Math.fround(Math.round(value * 100) / 100);
}

/** The events that put UI elements on the screen, each with those it puts. */
function screens(): { event: string; uis: string[] }[] {
  const components = Game.get().currentQuest!.qd.components;
  const found: { event: string; uis: string[] }[] = [];
  for (const [name, c] of components) {
    if (!(c instanceof QuestData.Event)) continue;
    const uis = c.addComponents.filter((n) => components.get(n) instanceof QuestData.UI);
    if (uis.length > 0) found.push({ event: name, uis });
  }
  return found;
}

/** The picture of an image element and its aspect, as the panel's small screen reads them (UIPanel.tsx). */
function usePicture(ui: QuestData.UI): { url: string | null; aspect: number; setAspect: (a: number) => void } {
  const [url, setUrl] = useState<string | null>(null);
  const [pictureAspect, setAspect] = useState(1);
  const file = ui.imageName.length > 0 ? choicePicture(ui.imageName) : null;
  useEffect(() => {
    let live = true;
    setUrl(null);
    if (file !== null) void pictureUrl(file).then((u) => live && setUrl(u));
    return () => {
      live = false;
    };
  }, [file]);
  const cd = Game.get().cd;
  const cut = ui.imageName.length > 0 && cd.containsKey(ImageData, ui.imageName) ? cd.get(ImageData, ui.imageName) : null;
  const aspect = ui.imageName.length === 0 ? ui.aspect : cut !== null && cut.width > 0 && cut.height > 0 ? cut.width / cut.height : pictureAspect;
  return { url, aspect: aspect > 0 ? aspect : 1, setAspect };
}

interface Changing {
  name: string;
  /** What the drag changes: the place, the size (the corner) or a text's aspect (its right edge). */
  what: 'move' | 'size' | 'aspect';
  x: number;
  y: number;
  start: { x: number; y: number; size: number; aspect: number };
  now: { x: number; y: number; size: number; aspect: number };
  moved: boolean;
}

function Element({
  ui,
  screen,
  chosen,
  changing,
  frames,
  onDown,
}: {
  ui: QuestData.UI;
  screen: ScreenSize;
  chosen: boolean;
  changing: Changing | null;
  frames: HTMLDivElement | null;
  onDown: (e: ReactPointerEvent, ui: QuestData.UI, what: Changing['what'], aspect: number) => void;
}) {
  const { url, aspect, setAspect } = usePicture(ui);
  const now = changing?.name === ui.sectionName ? changing.now : null;
  const layout = now === null ? ui : { ...ui, size: now.size, location: { x: now.x, y: now.y }, verticalUnits: ui.verticalUnits, hAlign: ui.hAlign, vAlign: ui.vAlign };
  const text = ui.imageName.length === 0;
  const rect = questUIRect(layout, text ? (now?.aspect ?? ui.aspect) || 1 : aspect, screen);
  const at = { left: rect.left, top: rect.top, width: rect.width, height: rect.height };
  return (
    <>
      <div
        className="editor-stage-element"
        data-stage-ui={ui.sectionName}
        data-chosen={chosen || undefined}
        style={{
          ...at,
          fontSize: text ? questUIFontSize(ui.textSize, screen) : undefined,
          color: text ? ColorUtil.fromName(ui.textColor) : undefined,
          background: text && ui.textBackgroundColor !== 'transparent' ? ColorUtil.fromName(ui.textBackgroundColor) : undefined,
          borderWidth: text && ui.border ? questUIBorder(screen) : undefined,
          justifyContent: ui.textAlignment === TextAlignment.TOP ? 'flex-start' : ui.textAlignment === TextAlignment.BOTTOM ? 'flex-end' : 'center',
        }}
        data-border={text && ui.border ? true : undefined}
        onPointerDown={(e) => onDown(e, ui, 'move', aspect)}
      >
        {text ? (
          <RichText text={ui.uiText.translate()} />
        ) : url !== null ? (
          <img src={url} alt="" draggable={false} onLoad={(e) => e.currentTarget.naturalHeight > 0 && setAspect(e.currentTarget.naturalWidth / e.currentTarget.naturalHeight)} />
        ) : (
          <span className="quiet">{ui.imageName}</span>
        )}
      </div>
      {/* The chosen one's frame goes above every element, which stay in the game's order */}
      {chosen &&
        frames !== null &&
        createPortal(
          <div className="editor-stage-frame" style={at}>
            <span className="editor-stage-name" onPointerDown={(e) => onDown(e, ui, 'move', aspect)}>
              {ui.sectionName}
            </span>
            <span className="editor-stage-handle editor-stage-corner" title={val('SIZE')} onPointerDown={(e) => onDown(e, ui, 'size', aspect)} />
            {text && <span className="editor-stage-handle editor-stage-edge" title={val('ASPECT')} onPointerDown={(e) => onDown(e, ui, 'aspect', aspect)} />}
          </div>,
          frames,
        )}
    </>
  );
}

export function UIStage() {
  useEditor((s) => s.revision);
  const game = Game.get();
  const components = game.currentQuest!.qd.components;
  const selection = game.qed?.selection ?? QUEST_SELECTION;
  const all = screens();
  const chosenUI = components.get(selection) instanceof QuestData.UI ? selection : null;
  // The event whose screen is shown: the one that puts the chosen element there, unless another was picked
  const [picked, setPicked] = useState<string | null>(null);
  const holding = chosenUI === null ? null : (all.find((s) => s.uis.includes(chosenUI))?.event ?? null);
  const shown = picked ?? holding ?? '';
  const names =
    shown === '*'
      ? [...components].filter(([, c]) => c instanceof QuestData.UI).map(([n]) => n)
      : (all.find((s) => s.event === shown)?.uis ?? (chosenUI !== null ? [chosenUI] : []));
  if (chosenUI !== null && !names.includes(chosenUI)) names.push(chosenUI);
  // Drawn as the game adds them: in the event's add order, the later on top (all of them, in the quest's order)
  const order = [...components.keys()];
  const uis = names.map((n) => components.get(n)).filter((c): c is QuestData.UI => c instanceof QuestData.UI);
  if (shown === '*') uis.sort((a, b) => order.indexOf(a.sectionName) - order.indexOf(b.sectionName));

  const box = useRef<HTMLDivElement>(null);
  const [frames, setFrames] = useState<HTMLDivElement | null>(null);
  const [area, setArea] = useState({ w: 640, h: 360 });
  useEffect(() => {
    const element = box.current;
    if (element === null || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(() => setArea({ w: element.clientWidth, h: element.clientHeight }));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  // The largest 16:9 screen that fits
  const width = Math.max(160, Math.min(area.w - 24, ((area.h - 24) * 16) / 9));
  const screen: ScreenSize = { width, height: (width * 9) / 16 };
  const [guides, setGuides] = useState(true);
  const [changing, setChanging] = useState<Changing | null>(null);

  const onDown = (e: ReactPointerEvent, ui: QuestData.UI, what: Changing['what'], aspect: number) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    e.preventDefault();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    if (ui.sectionName !== selection) run(() => select(ui.sectionName, true));
    const start = { x: ui.location.x, y: ui.location.y, size: ui.size, aspect: ui.imageName.length === 0 ? ui.aspect : aspect };
    setChanging({ name: ui.sectionName, what, x: e.clientX, y: e.clientY, start, now: start, moved: false });
    box.current?.focus();
  };
  const onMove = (e: ReactPointerEvent) => {
    if (changing === null) return;
    const ui = components.get(changing.name);
    if (!(ui instanceof QuestData.UI)) return;
    const dx = e.clientX - changing.x;
    const dy = e.clientY - changing.y;
    const unit = ui.verticalUnits ? screen.height : screen.width;
    const s = changing.start;
    let now = s;
    if (changing.what === 'move') {
      now = { ...s, x: neat(s.x + (ui.hAlign > 0 ? -dx : dx) / unit), y: neat(s.y + (ui.vAlign > 0 ? -dy : dy) / unit) };
    } else if (changing.what === 'size') {
      // The corner: the width grows with a horizontal unit, the height with a vertical one
      const grow = ui.verticalUnits ? dy / screen.height : dx / screen.width;
      now = { ...s, size: neat(Math.max(0.01, s.size + grow)) };
    } else {
      const h = ui.verticalUnits ? s.size * screen.height : (s.size * screen.width) / s.aspect;
      const w = ui.verticalUnits ? s.size * screen.height * s.aspect : s.size * screen.width;
      now = ui.verticalUnits ? { ...s, aspect: neat(Math.max(0.05, (w + dx) / h)) } : { ...s, aspect: neat(Math.max(0.05, w / Math.max(4, h - dy))) };
    }
    setChanging({ ...changing, now, moved: changing.moved || Math.hypot(dx, dy) > 2 });
  };
  const commit = (name: string, now: Changing['now'], label: string) => {
    const ui = components.get(name);
    if (!(ui instanceof QuestData.UI)) return;
    if (ui.location.x === now.x && ui.location.y === now.y && ui.size === now.size && (ui.imageName.length > 0 || ui.aspect === now.aspect)) return;
    run(() =>
      change(edi(label, name), () => {
        ui.location.x = now.x;
        ui.location.y = now.y;
        ui.size = now.size;
        if (ui.imageName.length === 0) ui.aspect = now.aspect;
      }),
    );
  };
  const onUp = () => {
    if (changing === null) return;
    const c = changing;
    setChanging(null);
    if (c.moved) commit(c.name, c.now, c.what === 'move' ? 'EDITOR_MOVE_STEP' : 'EDITOR_EDIT_STEP');
  };
  const onKey = (e: React.KeyboardEvent) => {
    const ui = chosenUI === null ? undefined : components.get(chosenUI);
    if (!(ui instanceof QuestData.UI)) return;
    const step = e.shiftKey ? 0.05 : 0.01;
    const moves: Record<string, [number, number]> = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
    const move = moves[e.key];
    if (move === undefined) return;
    e.preventDefault();
    e.stopPropagation();
    const [mx, my] = move;
    commit(ui.sectionName, { x: neat(ui.location.x + (ui.hAlign > 0 ? -mx : mx)), y: neat(ui.location.y + (ui.vAlign > 0 ? -my : my)), size: ui.size, aspect: ui.aspect }, 'EDITOR_MOVE_STEP');
  };

  const chosen = chosenUI === null ? null : (components.get(chosenUI) as QuestData.UI);
  const live = changing !== null && changing.name === chosenUI ? changing.now : chosen === null ? null : { x: chosen.location.x, y: chosen.location.y, size: chosen.size, aspect: chosen.aspect };
  return (
    <section className="editor-stage" aria-label={edi('EDITOR_STAGE')}>
      <div className="editor-stage-bar">
        <Tool icon="back" text={edi('EDITOR_STAGE_MAP')} label={edi('EDITOR_STAGE_MAP')} onClick={() => useEditor.setState({ stage: false })} />
        <label className="editor-stage-pick">
          <span>{edi('EDITOR_STAGE_SCREEN')}</span>
          <select value={shown} onChange={(e) => setPicked(e.target.value)}>
            {shown === '' && <option value="">{chosenUI ?? edi('EDITOR_STAGE_NONE')}</option>}
            {all.map((s) => (
              <option key={s.event} value={s.event}>
                {edi('EDITOR_STAGE_OF', s.event, s.uis.length)}
              </option>
            ))}
            <option value="*">{edi('EDITOR_STAGE_ALL')}</option>
          </select>
        </label>
        <Tool icon="grid" label={edi('EDITOR_STAGE_GUIDES')} pressed={guides} onClick={() => setGuides(!guides)} />
        {live !== null && chosen !== null && (
          <span className="editor-stage-numbers" aria-live="polite">
            {chosen.sectionName} · x {floatToString(live.x)} · y {floatToString(live.y)} · {val('SIZE')} {floatToString(live.size)}
            {chosen.imageName.length === 0 ? ` · ${val('ASPECT')} ${floatToString(live.aspect)}` : ''}
          </span>
        )}
      </div>
      <div className="editor-stage-area" ref={box} tabIndex={0} onKeyDown={onKey} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}>
        <div className="editor-stage-screen" style={{ width: screen.width, height: screen.height }} onPointerDown={() => run(() => select(QUEST_SELECTION, true))}>
          {guides && (
            <>
              <span className="editor-stage-guide editor-stage-guide-v" />
              <span className="editor-stage-guide editor-stage-guide-h" />
            </>
          )}
          {uis.map((ui) => (
            <Element key={ui.sectionName} ui={ui} screen={screen} chosen={ui.sectionName === chosenUI} changing={changing} frames={frames} onDown={onDown} />
          ))}
          <div className="editor-stage-frames" ref={setFrames} />
          {uis.length === 0 && <p className="editor-stage-empty quiet">{edi('EDITOR_STAGE_EMPTY')}</p>}
        </div>
      </div>
    </section>
  );
}
