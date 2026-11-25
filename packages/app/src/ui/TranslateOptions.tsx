// Not in Valkyrie: the automatic translation in Options (host/translator.ts): switched on after a warning that says how
// to get an OpenRouter key, then the key, the model (a free DeepSeek one unless chosen) and a test.
import { useEffect, useRef, useState } from 'react';
import { CommonStringKeys } from '@universalis/engine';
import { TRANSLATE_TIMEOUT_SECONDS, TRANSLATION_PAUSED, TranslateTimeout, freeModels, setTranslateKey, translate, translateKey } from '../host/translator.ts';
import { DEFAULT_TRANSLATE_MODEL, setSwitch, setTranslateModel, switchOn, translateModel } from './preferences.ts';
import { uni, val } from './text.ts';

const SAMPLE = 'The old door creaks open. <i>Something</i> waits for you in the dark: test your .';

export function TranslateOptions() {
  const on = switchOn('autoTranslate') && !TRANSLATION_PAUSED;
  const [warning, setWarning] = useState(false);
  return (
    <section className="option translate-options">
      <div className="option-line">
        <label htmlFor="translate">{uni('TRANSLATE')}</label>
        <input
          id="translate"
          type="checkbox"
          role="switch"
          className="switch"
          checked={on}
          disabled={TRANSLATION_PAUSED}
          onChange={(e) => (e.target.checked && !on ? setWarning(true) : setSwitch('autoTranslate', e.target.checked))}
        />
      </div>
      {TRANSLATION_PAUSED && <p className="option-note">{uni('TRANSLATE_DISABLED')}</p>}
      {on && <TranslateSettings />}
      {warning && (
        <div className="window-layer">
          <section className="window panel translate-warning" role="alertdialog" aria-labelledby="translate-warning-title">
            <h2 id="translate-warning-title">{uni('TRANSLATE')}</h2>
            <p>{uni('TRANSLATE_WARNING')}</p>
            <ol className="translate-steps">
              {[1, 2, 3, 4].map((n) => (
                <li key={n}>{uni(`TRANSLATE_STEP_${n}`)}</li>
              ))}
            </ol>
            <div className="choices">
              <button
                type="button"
                className="button primary"
                onClick={() => {
                  setWarning(false);
                  setSwitch('autoTranslate', true);
                }}
              >
                {uni('TRANSLATE_ENABLE')}
              </button>
              <a className="button" href="https://openrouter.ai/keys" target="_blank" rel="noreferrer">
                openrouter.ai/keys
              </a>
              <button type="button" className="button" onClick={() => setWarning(false)}>
                {CommonStringKeys.CANCEL.translate()}
              </button>
            </div>
          </section>
        </div>
      )}
    </section>
  );
}

/** Why a translation failed, in the player's words. */
export function failureText(e: unknown): string {
  if (e instanceof TranslateTimeout) return uni('TRANSLATE_TIMEOUT', TRANSLATE_TIMEOUT_SECONDS);
  return e instanceof Error ? e.message : String(e);
}

type Test = { step: 'idle' } | { step: 'working'; model: string } | { step: 'done'; text: string; model: string; seconds: number } | { step: 'failed'; message: string; model: string };

function TranslateSettings() {
  const [keyText, setKeyText] = useState(translateKey);
  const [models, setModels] = useState<string[] | null>(null);
  const [test, setTest] = useState<Test>({ step: 'idle' });
  const [, redraw] = useState(0);
  const running = useRef<AbortController | null>(null);
  const model = translateModel();
  useEffect(() => {
    let live = true;
    freeModels().then(
      (list) => {
        if (!live) return;
        setModels(list);
        // The default free model can leave OpenRouter: then the first free one, DeepSeek's first
        if (translateModel() === DEFAULT_TRANSLATE_MODEL && list.length > 0 && !list.includes(DEFAULT_TRANSLATE_MODEL)) {
          setTranslateModel(list[0]!);
          redraw((n) => n + 1);
        }
      },
      () => live && setModels([]),
    );
    return () => {
      live = false;
      running.current?.abort();
    };
  }, []);
  const choices = models === null ? [model] : [...new Set([...models, model])];
  const chooseModel = (value: string) => {
    running.current?.abort();
    setTranslateModel(value);
    setTest({ step: 'idle' });
  };
  // A new test leaves the one still waiting, which may never answer
  const tryIt = () => {
    running.current?.abort();
    const stop = new AbortController();
    running.current = stop;
    const tried = translateModel();
    const started = performance.now();
    setTest({ step: 'working', model: tried });
    translate([SAMPLE], stop.signal).then(
      ([text]) => !stop.signal.aborted && setTest({ step: 'done', text: text ?? '', model: tried, seconds: Math.max(1, Math.round((performance.now() - started) / 1000)) }),
      (e: unknown) => !stop.signal.aborted && setTest({ step: 'failed', message: failureText(e), model: tried }),
    );
  };
  return (
    <div className="translate-settings">
      <label className="translate-field">
        <span>{uni('TRANSLATE_KEY')}</span>
        <input
          type="password"
          autoComplete="off"
          spellCheck={false}
          placeholder="sk-or-…"
          value={keyText}
          onChange={(e) => {
            setKeyText(e.currentTarget.value);
            setTranslateKey(e.currentTarget.value);
          }}
        />
      </label>
      <label className="translate-field">
        <span>{uni('TRANSLATE_MODEL')}</span>
        <select value={model} onChange={(e) => chooseModel(e.currentTarget.value)}>
          {choices.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </label>
      {models === null && <p className="voice-note">{uni('TRANSLATE_MODELS_LOADING')}</p>}
      <label className="translate-field">
        <span>{uni('TRANSLATE_MODEL_OTHER')}</span>
        <input type="text" spellCheck={false} defaultValue={choices.includes(model) ? '' : model} onBlur={(e) => e.currentTarget.value.trim() !== '' && e.currentTarget.value.trim() !== model && chooseModel(e.currentTarget.value.trim())} />
      </label>
      <div className="choices">
        <button type="button" className="button" disabled={keyText.trim() === ''} onClick={tryIt}>
          {uni('TRANSLATE_TRY')}
        </button>
      </div>
      {test.step === 'working' && <TranslatingLines />}
      {test.step === 'done' && (
        <>
          <p className="translate-result card">{test.text}</p>
          <p className="voice-note">{uni('TRANSLATE_TOOK', test.model, test.seconds)}</p>
        </>
      )}
      {test.step === 'failed' && (
        <p className="voice-note problem" role="alert">
          {uni('TRANSLATE_FAILED', test.message)} ({test.model})
        </p>
      )}
    </div>
  );
}

/** Lines that shimmer while the translation comes. */
export function TranslatingLines() {
  return (
    <div className="translating" role="status" aria-label={uni('TRANSLATE_WORKING')}>
      <span />
      <span />
      <span />
      <p>{uni('TRANSLATE_WORKING')}</p>
    </div>
  );
}
