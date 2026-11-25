// Valkyrie's QuestUICanvas: the quest's UI elements (Quest.UI), laid out on the screen as Valkyrie lays them out
// (questUI.ts), over the board and under the windows. Rewritten from Valkyrie's Unity drawing. Their colours follow the
// quest's fading every frame; a click on one is the board's (Board.ts), so that a press that drags pans the board, and
// the keyboard presses the clickable ones here.
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { TextAlignment, type Color, type Quest, type Texture2D } from '@universalis/engine';
import { ReadAloud } from '../ui/ReadAloud.tsx';
import { RichText } from '../ui/RichText.tsx';
import { spokenText } from '../ui/spokenText.ts';
import { run } from '../ui/run.ts';
import { switchOn } from '../ui/preferences.ts';
import { useUI } from '../ui/store.ts';
import { controlOf, onBoardFrame, questUIElement } from './Board.ts';
import { pictureLabel } from './pieces.ts';
import { pictureUrl } from './pictures.ts';
import { questUIBorder, questUIFontSize, questUIRect, type ScreenRect, type ScreenSize } from './questUI.ts';
import { board } from './registry.ts';

function css(c: Color): string {
  return `rgb(${Math.round(c.r * 255)} ${Math.round(c.g * 255)} ${Math.round(c.b * 255)} / ${c.a})`;
}

function useScreenSize(): ScreenSize {
  const [size, setSize] = useState<ScreenSize>({ width: window.innerWidth, height: window.innerHeight });
  useEffect(() => {
    const resize = () => setSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);
  return size;
}

/** The picture of an image element, stretched to it as Unity's Image is, or the part an atlas entry cuts out of it. */
function UIPicture({ texture, rect }: { texture: Texture2D; rect: ScreenRect }) {
  const cut = texture.cutFrom;
  const whole = cut?.texture ?? texture;
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    let live = true;
    void pictureUrl(whole.name).then((u) => live && setUrl(u));
    return () => {
      live = false;
    };
  }, [whole.name]);
  if (url === null) return <span className="quest-ui-placeholder">{pictureLabel(whole.name)}</span>;
  let style: CSSProperties = { backgroundImage: `url(${url})`, backgroundSize: '100% 100%' };
  if (cut !== null) {
    // GetPixels counts rows from the bottom
    const sx = rect.width / cut.width;
    const sy = rect.height / cut.height;
    style = {
      backgroundImage: `url(${url})`,
      backgroundSize: `${whole.width * sx}px ${whole.height * sy}px`,
      backgroundPosition: `${-cut.x * sx}px ${-(whole.height - cut.y - cut.height) * sy}px`,
    };
  }
  return <span className="quest-ui-picture" style={style} />;
}

/**
 * Not in Valkyrie: the scenario's texts on the screen get a small speaker at their top right, like the event windows
 * (ui/ReadAloud.tsx), when they say something worth reading: a short label (a button's «Search») gets none.
 */
const READ_ALOUD_MIN_LENGTH = 30;

function UISpeaker({ name, text, rect, alpha }: { name: string; text: string; rect: ScreenRect; alpha: number }) {
  if (spokenText(text).length < READ_ALOUD_MIN_LENGTH) return null;
  // A slot at the element's top right corner; it hides with its text when the quest fades it out (QuestUILayer's frames).
  // Kept on the screen (11 November 2026): an author's text box can start above it or end past its edge
  const left = Math.min(rect.left + rect.width, window.innerWidth - 4);
  const top = Math.max(rect.top, 4);
  return (
    <span className="quest-ui-speaker" data-quest-ui-speaker={name} style={{ left, top, visibility: alpha > SPEAKER_ALPHA ? 'visible' : 'hidden' }}>
      <ReadAloud text={text} stopBoard />
    </span>
  );
}

/** Below this alpha, the text is gone and so is its speaker. */
const SPEAKER_ALPHA = 0.05;

const ALIGN: Record<number, CSSProperties['justifyContent']> = {
  [TextAlignment.TOP]: 'flex-start',
  [TextAlignment.CENTER]: 'center',
  [TextAlignment.BOTTOM]: 'flex-end',
};

/**
 * Not in Valkyrie (7 November 2026): after a while without a press, with no window open, the scenario's own small
 * buttons glow softly a few times, for a player who does not see that an ornament is the way on (Cuento de borrachos
 * ends with one). Any press starts the wait again; Options can turn it off.
 */
const HINT_AFTER_MS = 12_000;
/** Only elements smaller than this part of the screen glow: not a picture that fills it. */
const HINT_MAX_AREA = 0.2;

/** `shown`: the elements on screen; when they change, the wait starts again. */
function useButtonHint(shown: string): boolean {
  const on = switchOn('buttonHints');
  const calm = useUI((s) => s.windows.length === 0);
  const [hint, setHint] = useState(false);
  useEffect(() => {
    setHint(false);
    if (!on || !calm) return;
    let timer = setTimeout(() => setHint(true), HINT_AFTER_MS);
    const again = () => {
      setHint(false);
      clearTimeout(timer);
      timer = setTimeout(() => setHint(true), HINT_AFTER_MS);
    };
    const kinds = ['pointerdown', 'keydown', 'wheel'] as const;
    for (const kind of kinds) window.addEventListener(kind, again, { passive: true });
    return () => {
      clearTimeout(timer);
      for (const kind of kinds) window.removeEventListener(kind, again);
    };
  }, [on, calm, shown]);
  return hint;
}

// Valkyrie: Quest.cs UI.UI (its Image, or its Text or TextMeshProUGUI over the background uiTextBG, and its border)
function QuestUIElement({ component, screen }: { component: Quest.UI; screen: ScreenSize }) {
  const qUI = component.qUI;
  const rect = questUIRect(qUI, component.aspect, screen);
  const control = controlOf(component.unityObject);
  const text = component.uiText;
  const colour = component.getColor();
  // The first colours; the board's frames keep them up to date while the quest fades the element
  const style = {
    left: rect.left,
    top: rect.top,
    width: rect.width,
    height: rect.height,
    '--colour': css(colour),
    '--alpha': colour.a,
    '--border': `${qUI.border ? questUIBorder(screen) : 0}px`,
    ...(text !== null ? { color: css(colour), backgroundColor: component.textBackground !== null ? css(component.textBackground) : 'transparent' } : {}),
  } as CSSProperties;
  const content =
    text !== null ? (
      <span
        className={`quest-ui-text ${qUI.richText ? 'rich' : ''}`}
        style={{ fontSize: questUIFontSize(qUI.textSize, screen), justifyContent: ALIGN[qUI.textAlignment] ?? 'center' }}
      >
        <span>
          <RichText text={text} />
        </span>
      </span>
    ) : component.image?.sprite ? (
      <UIPicture texture={component.image.sprite} rect={rect} />
    ) : null;
  const label = text === null ? pictureLabel(qUI.imageName) : undefined;
  const speaker = text !== null ? <UISpeaker name={qUI.sectionName} text={text} rect={rect} alpha={colour.a} /> : null;
  if (control === undefined) {
    return (
      <>
        <div className="quest-ui" data-quest-ui={qUI.sectionName} style={style} role={text === null ? 'img' : undefined} aria-label={label}>
          {content}
        </div>
        {speaker}
      </>
    );
  }
  return (
    <>
      <button
        type="button"
        className="quest-ui clickable"
        data-quest-ui={qUI.sectionName}
        data-hint={rect.width * rect.height < HINT_MAX_AREA * screen.width * screen.height ? '' : undefined}
        style={style}
        aria-label={label}
        // The pointer's clicks are the board's; this one is the keyboard's (Enter or Space)
        onClick={(e) => {
          if (e.detail === 0) run(() => control.startEvent());
        }}
      >
        {content}
      </button>
      {speaker}
    </>
  );
}

export function QuestUILayer() {
  useUI((s) => s.revision);
  const hint = useButtonHint(board.questUI.map((c) => c.qUI.sectionName).join(' '));
  const screen = useScreenSize();
  const layer = useRef<HTMLDivElement>(null);

  // The quest fades its elements every frame (Quest.Update): their colours follow
  useEffect(
    () =>
      onBoardFrame(() => {
        const elements = layer.current?.querySelectorAll<HTMLElement>('[data-quest-ui]') ?? [];
        for (const element of elements) {
          const component = questUIElement(element.dataset.questUi);
          if (component === undefined) continue;
          const colour = css(component.getColor());
          if (element.dataset.colour === colour) continue;
          element.dataset.colour = colour;
          // The border takes the element's colour (UIElementBorder.SetColor); a picture fades, its text and background change
          element.style.setProperty('--colour', colour);
          element.style.setProperty('--alpha', String(component.getColor().a));
          if (component.uiText !== null) {
            const speaker = layer.current?.querySelector<HTMLElement>(`[data-quest-ui-speaker="${CSS.escape(element.dataset.questUi ?? '')}"]`);
            if (speaker) speaker.style.visibility = component.getColor().a > SPEAKER_ALPHA ? 'visible' : 'hidden';
            element.style.color = colour;
            element.style.backgroundColor = component.textBackground !== null ? css(component.textBackground) : 'transparent';
          }
        }
      }),
    [],
  );

  return (
    <div className={`quest-ui-layer ${hint ? 'hinting' : ''}`.trim()} ref={layer}>
      {board.questUI.map((component) => (
        <QuestUIElement key={component.qUI.sectionName} component={component} screen={screen} />
      ))}
    </div>
  );
}
