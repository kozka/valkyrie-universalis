// Fields the editor's panels share: a text typed where Valkyrie's panels open a box, kept when the field loses the
// focus (or with Enter on one line), as Valkyrie's boxes keep it when their edit ends; a long text is typed with its
// formatting drawn and, for a game's texts, the row of the game's symbols that Valkyrie's paneled boxes have over them. A text of the scenario is spell-checked in the language
// the editor writes in, and says so when that language lacks it and another one's is shown. Not ported from Valkyrie.
import { useEffect, useState, type ReactNode } from 'react';
import { Game } from '@universalis/engine';
import { languageCode, languageInSentence } from '../ui/languages.ts';
import { RichField } from './RichField.tsx';
import { shownFrom } from './session.ts';
import { edi } from './text.ts';

interface TypedTextProps {
  label: string;
  value: string;
  onDone: (text: string) => void;
  /** A long text, its formatting drawn (RichField.tsx): Valkyrie's UIElementEditablePaneled. */
  multiline?: boolean;
  /** One line with its formatting drawn, as a button's label. */
  rich?: boolean;
  /** The row of the game's symbols, for the texts a game shows (not the scenario's description, synopsis or authors). */
  symbols?: boolean;
  /** Valkyrie's SetMaxCharacters. */
  maxLength?: number;
  /** A number box, with its limits. */
  number?: { min?: number; max?: number; step?: number };
  /** What an empty box shows, in grey. */
  placeholder?: string;
  /** The key of the scenario's text it writes, in the language the editor writes in. */
  textKey?: string;
}

/** Says that the language the editor writes in lacks a text, and in which language the box shows it. */
function ShownFrom({ textKey }: { textKey: string }) {
  const from = shownFrom(textKey);
  if (from === null) return null;
  const writing = Game.get().currentLang;
  return <p className="editor-text-from">{edi('EDITOR_TEXT_FROM', languageInSentence(writing, writing), languageInSentence(from, writing))}</p>;
}

export function TypedText({ label, value, onDone, multiline = false, rich = false, symbols = true, maxLength, number, placeholder, textKey }: TypedTextProps) {
  if (multiline || rich) {
    return (
      <div className="editor-paneled">
        <RichField label={label} value={value} onDone={onDone} multiline={multiline} symbols={symbols} textKey={textKey} placeholder={placeholder} maxLength={maxLength} />
        {textKey !== undefined && <ShownFrom textKey={textKey} />}
      </div>
    );
  }
  return <PlainText label={label} value={value} onDone={onDone} maxLength={maxLength} number={number} placeholder={placeholder} textKey={textKey} />;
}

function PlainText({ label, value, onDone, maxLength, number, placeholder, textKey }: TypedTextProps) {
  // The browser's spelling check, in the scenario's texts only, in their language
  const lang = textKey === undefined ? undefined : languageCode(Game.get().currentLang);
  const spellCheck = textKey !== undefined;
  const [text, setText] = useState(value);
  useEffect(() => setText(value), [value]);
  const done = () => {
    if (text !== value) onDone(text);
  };
  return (
    <>
      <input
        aria-label={label}
        type={number === undefined ? 'text' : 'number'}
        min={number?.min}
        max={number?.max}
        step={number?.step}
        maxLength={maxLength}
        placeholder={placeholder}
        lang={lang}
        spellCheck={spellCheck}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={done}
        onKeyDown={(e) => e.key === 'Enter' && done()}
      />
      {textKey !== undefined && <ShownFrom textKey={textKey} />}
    </>
  );
}

/** A field of a panel: its name above what sets it. */
export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="editor-field">
      <span>{label}</span>
      {children}
    </div>
  );
}

/** A yes or no, as Valkyrie's True and False buttons. */
export function Toggle({ label, on, onToggle }: { label: string; on: boolean; onToggle: () => void }) {
  return (
    <label className="editor-inline editor-check">
      <input type="checkbox" checked={on} onChange={onToggle} />
      {label}
    </label>
  );
}
