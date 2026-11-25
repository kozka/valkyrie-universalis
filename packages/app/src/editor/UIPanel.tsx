// The fields of a UI element beside the map, as Valkyrie's panel for it has them (EditorComponentUI): its picture or
// its text, how it fades, its click, its units, where it is aligned, its place and size, and a text's look; the screen
// it falls on is the map's place's (UIStage.tsx), where it is dragged and sized. What each
// field does is the engine's (QuestEditor/EditorComponentUI.ts); the parts of the event a UI element keeps are
// EventPanel's. Not ported from Valkyrie's panel, which is drawn with Unity.
import { useState } from 'react';
import { EditorComponentUI, StringKey, floatToString, type QuestData, type SelectionItem } from '@universalis/engine';
import { val } from '../ui/text.ts';
import { Chooser } from './Chooser.tsx';
import { Field, Toggle, TypedText } from './fields.tsx';
import { useEditor } from './editorState.ts';
import { Icon } from './Icon.tsx';
import { edit } from './PiecePanel.tsx';
import { edi } from './text.ts';

/** Where an alignment puts the element: each way -1, 0 or 1, drawn as Valkyrie's buttons are. */
const ALIGNS: [number, number, string][] = [
  [-1, -1, '┏'],
  [0, -1, '━'],
  [1, -1, '┓'],
  [-1, 0, '┃'],
  [0, 0, '╋'],
  [1, 0, '┃'],
  [-1, 1, '┗'],
  [0, 1, '━'],
  [1, 1, '┛'],
];

function alignLabel(x: number, y: number): string {
  if (x === 0 && y === 0) return val('CENTER');
  const vertical = y < 0 ? val('TOP') : y > 0 ? val('BOTTOM') : '';
  const horizontal = x < 0 ? val('LEFT') : x > 0 ? val('RIGHT') : '';
  return [vertical, horizontal].filter((part) => part !== '').join(' · ');
}

/** A colour by its name in the window, or as it is when it is not one of them. */
function ColourField({ label, value, onPick }: { label: string; value: string; onPick: (colour: string) => void }) {
  const colours = EditorComponentUI.colourChoices();
  return (
    <Field label={label}>
      <select aria-label={label} value={value} onChange={(e) => onPick(e.target.value)}>
        {!colours.includes(value) && <option value={value}>{new StringKey('val', value).translate()}</option>}
        {colours.map((colour) => (
          <option key={colour} value={colour}>
            {new StringKey('val', colour).translate()}
          </option>
        ))}
      </select>
    </Field>
  );
}

export function UIPanel({ ui }: { ui: QuestData.UI }) {
  // What the window lists is taken when it opens
  const [choosing, setChoosing] = useState<SelectionItem[] | null>(null);
  const text = ui.imageName.length === 0;
  const number = (label: string, value: number, key: 'x' | 'y' | 'size' | 'aspect') => (
    <Field label={label}>
      <TypedText label={label} number={{ step: 0.05 }} value={floatToString(value)} onDone={(typed) => edit(ui, () => EditorComponentUI.updateNumbers(ui, { [key]: typed }))} />
    </Field>
  );
  return (
    <div className="editor-piece">
      <button type="button" className="button editor-see" onClick={() => useEditor.setState({ stage: true, showing: false })}>
        <Icon name="eye" /> {edi('EDITOR_UI_STAGE_OPEN')}
      </button>
      <Field label={val('IMAGE')}>
        <span className="editor-inline">
          <button type="button" className="editor-picked" aria-label={val('IMAGE')} onClick={() => setChoosing(EditorComponentUI.imageChoices())}>
            <span>{text ? val('NONE') : ui.imageName}</span>
          </button>
          {!text && (
            <button type="button" className="button" onClick={() => edit(ui, () => EditorComponentUI.selectImage(ui, ''))}>
              {edi('EDITOR_TEXT_INSTEAD')}
            </button>
          )}
        </span>
      </Field>
      <Field label={val('FADE')}>
        <select aria-label={val('FADE')} value={ui.fadeSpeed} onChange={(e) => edit(ui, () => EditorComponentUI.selectFadeSpeed(ui, e.target.value))}>
          {!EditorComponentUI.fadeSpeedChoices().includes(ui.fadeSpeed) && <option value={ui.fadeSpeed}>{ui.fadeSpeed}</option>}
          {EditorComponentUI.fadeSpeedChoices().map((speed) => (
            <option key={speed} value={speed}>
              {val('FADE_' + speed.toUpperCase())}
            </option>
          ))}
        </select>
      </Field>
      <Field label={val('CLICK_BEHAVIOR')}>
        <select aria-label={val('CLICK_BEHAVIOR')} value={String(ui.enableClick)} onChange={(e) => String(ui.enableClick) !== e.target.value && edit(ui, () => EditorComponentUI.toggleClickEffect(ui))}>
          <option value="true">{val('CLICK_BLINK')}</option>
          <option value="false">{val('CLICK_STATIC')}</option>
        </select>
      </Field>
      <Field label={val('UNITS')}>
        <select aria-label={val('UNITS')} value={String(ui.verticalUnits)} onChange={(e) => String(ui.verticalUnits) !== e.target.value && edit(ui, () => EditorComponentUI.changeUnits(ui))}>
          <option value="true">{val('VERTICAL')}</option>
          <option value="false">{val('HORIZONTAL')}</option>
        </select>
      </Field>
      <Field label={val('ALIGN')}>
        <div className="editor-align" role="group" aria-label={val('ALIGN')}>
          {ALIGNS.map(([x, y, mark]) => (
            <button
              key={`${x},${y}`}
              type="button"
              className="editor-back"
              aria-pressed={ui.hAlign === x && ui.vAlign === y}
              aria-label={alignLabel(x, y)}
              title={alignLabel(x, y)}
              onClick={() => edit(ui, () => EditorComponentUI.setAlign(ui, x, y))}
            >
              {mark}
            </button>
          ))}
        </div>
      </Field>
      <div className="editor-quad">
        {number('X', ui.location.x, 'x')}
        {number('Y', ui.location.y, 'y')}
        {number(val('SIZE'), ui.size, 'size')}
        {text && number(val('ASPECT'), ui.aspect, 'aspect')}
      </div>
      {text && (
        <>
          <Field label={edi('EDITOR_UI_TEXT')}>
            <TypedText label={edi('EDITOR_UI_TEXT')} multiline textKey={ui.uitext_key} value={ui.uiText.translate(true)} onDone={(typed) => edit(ui, () => EditorComponentUI.updateUIText(ui, typed))} />
          </Field>
          <Toggle label={val('RICH_TEXT')} on={ui.richText} onToggle={() => edit(ui, () => EditorComponentUI.setRichText(ui))} />
          <div className="editor-pair">
            <Field label={val('TEXT_ALIGNMENT')}>
              <select aria-label={val('TEXT_ALIGNMENT')} value={EditorComponentUI.textAlignmentChoices()[ui.textAlignment] ?? 'CENTER'} onChange={(e) => edit(ui, () => EditorComponentUI.selectTextAlignment(ui, e.target.value))}>
                {EditorComponentUI.textAlignmentChoices().map((alignment) => (
                  <option key={alignment} value={alignment}>
                    {val(alignment)}
                  </option>
                ))}
              </select>
            </Field>
            <Field label={val('TEXT_SIZE')}>
              <TypedText label={val('TEXT_SIZE')} number={{ step: 0.1 }} value={floatToString(ui.textSize)} onDone={(typed) => edit(ui, () => EditorComponentUI.updateTextSize(ui, typed))} />
            </Field>
          </div>
          <div className="editor-pair">
            <ColourField label={val('COLOR')} value={ui.textColor} onPick={(colour) => edit(ui, () => EditorComponentUI.selectColour(ui, colour))} />
            <ColourField label={val('BACKGROUND_COLOUR')} value={ui.textBackgroundColor} onPick={(colour) => edit(ui, () => EditorComponentUI.selectBackgroundColour(ui, colour))} />
          </div>
          <Toggle label={val('BORDER')} on={ui.border} onToggle={() => edit(ui, () => EditorComponentUI.toggleBorder(ui))} />
        </>
      )}
      {choosing !== null && (
        <Chooser
          title={val('SELECT_IMAGE')}
          items={choosing}
          current={ui.imageName}
          excludeExpansions
          pictures
          onPick={(key) => {
            setChoosing(null);
            edit(ui, () => EditorComponentUI.selectImage(ui, key));
          }}
          onClose={() => setChoosing(null)}
        />
      )}
    </div>
  );
}
