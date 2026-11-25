// Not in Valkyrie: who reads the events aloud (ui/speech.ts), in Options and in the game's own options: the browser's
// voices, with the one to use; Gemini's (ui/geminiSpeech.ts) or Speechify's (ui/speechifySpeech.ts), with the player's
// key, the model, the voice and how long it takes; or nobody, and then the cards have no speaker.
import { useEffect, useState } from 'react';
import { Game } from '@universalis/engine';
import { languageCode } from './languages.ts';
import { VOICE_ENGINES, browserVoice, setBrowserVoice, setVoiceEngine, voiceEngine } from './preferences.ts';
import {
  GEMINI_MODELS,
  GEMINI_VOICES,
  geminiKey,
  geminiModel,
  geminiReady,
  geminiStyle,
  geminiVoice,
  setGeminiKey,
  setGeminiModel,
  setGeminiStyle,
  setGeminiVoice,
} from './geminiSpeech.ts';
import {
  DEEPGRAM_FAMILIES,
  type DeepgramFamily,
  deepgramFamily,
  deepgramKey,
  deepgramLiveVoices,
  deepgramModelId,
  deepgramReady,
  deepgramVoice,
  deepgramVoices,
  setDeepgramFamily,
  setDeepgramKey,
  setDeepgramVoice,
  typedVoice,
} from './deepgramSpeech.ts';
import { useVoiceTiming } from './pcmPlayer.ts';
import {
  SPEECHIFY_MODELS,
  type SpeechifyVoice,
  setSpeechifyKey,
  setSpeechifyModel,
  setSpeechifyVoice,
  speechifyKey,
  speechifyModel,
  speechifyReady,
  speechifyVoice,
  speechifyVoices,
} from './speechifySpeech.ts';
import { browserVoices, canSpeak, speak, stopSpeaking, useReading } from './speech.ts';
import { uni } from './text.ts';

export function VoiceOptions() {
  const engine = voiceEngine();
  const code = languageCode(Game.get().currentLang);
  const reading = useReading() === 'voice-test';
  useEffect(() => () => stopSpeaking('voice-test'), []);
  return (
    <section className="option voice-options">
      <div className="option-line">
        <label htmlFor="voice">{uni('VOICE')}</label>
        <span className="select">
          <select id="voice" value={engine} onChange={(e) => setVoiceEngine(e.target.value as (typeof VOICE_ENGINES)[number])}>
            {VOICE_ENGINES.map((value) => (
              <option key={value} value={value}>
                {uni(value === 'browser' ? 'VOICE_BROWSER' : value === 'gemini' ? 'VOICE_GEMINI' : value === 'speechify' ? 'VOICE_SPEECHIFY' : value === 'deepgram' ? 'VOICE_DEEPGRAM' : 'VOICE_OFF')}
              </option>
            ))}
          </select>
        </span>
      </div>
      {engine !== 'off' && (
        <>
          {engine === 'browser' ? <BrowserVoice code={code} /> : engine === 'gemini' ? <GeminiSettings /> : engine === 'speechify' ? <SpeechifySettings code={code} /> : <DeepgramSettings code={code} />}
          {(engine === 'gemini' ? geminiReady() : engine === 'speechify' ? speechifyReady() : engine === 'deepgram' ? deepgramReady() : canSpeak()) && (
            <div className="choices">
              <button type="button" className="button" onClick={() => (reading ? stopSpeaking('voice-test') : speak('voice-test', uni('VOICE_SAMPLE')))}>
                {uni(reading ? 'STOP_READING' : 'VOICE_TRY')}
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}

/** The browser's voices for the game's language, the best first; they come a moment after the page loads. */
function BrowserVoice({ code }: { code: string }) {
  const [voices, setVoices] = useState(() => browserVoices(code));
  useEffect(() => {
    if (!canSpeak()) return;
    const refresh = () => setVoices(browserVoices(code));
    refresh();
    speechSynthesis.addEventListener('voiceschanged', refresh);
    return () => speechSynthesis.removeEventListener('voiceschanged', refresh);
  }, [code]);
  if (!canSpeak()) return <p className="voice-note">{uni('VOICE_NONE')}</p>;
  return (
    <label className="voice-select">
      <span>{uni('VOICE_WHICH')}</span>
      <select value={browserVoice()} onChange={(e) => setBrowserVoice(e.currentTarget.value)}>
        <option value="">{uni('VOICE_BEST')}</option>
        {voices.map((v) => (
          <option key={v.name} value={v.name}>
            {v.name}
          </option>
        ))}
      </select>
    </label>
  );
}

/** Gemini's settings: the key, the model, the voice and how to read; and how long the last reading took. */
function GeminiSettings() {
  const [keyText, setKeyText] = useState(geminiKey);
  const model = geminiModel();
  const models = [...new Set([...GEMINI_MODELS, model])];
  const voice = geminiVoice();
  const voices = [...new Set([...GEMINI_VOICES, voice])];
  return (
    <div className="translate-settings">
      <label className="translate-field">
        <span>{uni('VOICE_GEMINI_KEY')}</span>
        <input
          type="password"
          autoComplete="off"
          spellCheck={false}
          value={keyText}
          onChange={(e) => {
            setKeyText(e.currentTarget.value);
            setGeminiKey(e.currentTarget.value);
          }}
        />
      </label>
      <label className="translate-field">
        <span>{uni('VOICE_GEMINI_MODEL')}</span>
        <select value={model} onChange={(e) => setGeminiModel(e.currentTarget.value)}>
          {models.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </label>
      <label className="translate-field">
        <span>{uni('VOICE_WHICH')}</span>
        <select value={voice} onChange={(e) => setGeminiVoice(e.currentTarget.value)}>
          {voices.map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
      </label>
      <label className="translate-field">
        <span>{uni('VOICE_GEMINI_STYLE')}</span>
        <input type="text" spellCheck={false} placeholder={uni('VOICE_GEMINI_STYLE_HINT')} defaultValue={geminiStyle()} onBlur={(e) => e.currentTarget.value.trim() !== geminiStyle() && setGeminiStyle(e.currentTarget.value)} />
      </label>
      <p className="option-note">{uni(keyText.trim() === '' ? 'VOICE_GEMINI_NO_KEY' : 'VOICE_GEMINI_NOTE')}</p>
      <Timing engine="gemini" />
    </div>
  );
}

/** How long the last online reading took, or why it failed, for this engine. */
function Timing({ engine }: { engine: string }) {
  const timing = useVoiceTiming();
  if (timing === null || timing.engine !== engine) return null;
  const failed = engine === 'gemini' ? 'VOICE_GEMINI_FAILED' : engine === 'speechify' ? 'VOICE_SPEECHIFY_FAILED' : 'VOICE_DEEPGRAM_FAILED';
  return 'error' in timing ? (
    <p className="voice-note problem" role="alert">
      {uni(failed, timing.error)} ({timing.model})
    </p>
  ) : (
    <p className="voice-note" role="status">
      {uni('VOICE_GEMINI_TIME', timing.first.toFixed(1), timing.total.toFixed(1))} ({timing.model})
    </p>
  );
}

/** Speechify's settings: the key, the model and the voice for the game's language, loaded with the key. */
function SpeechifySettings({ code }: { code: string }) {
  const [keyText, setKeyText] = useState(speechifyKey);
  const [voices, setVoices] = useState<SpeechifyVoice[] | 'loading' | { error: string }>('loading');
  const model = speechifyModel();
  const models = [...new Set([...SPEECHIFY_MODELS, model])];
  const voice = speechifyVoice();
  const hasKey = keyText.trim() !== '';
  useEffect(() => {
    if (!hasKey) return;
    let live = true;
    setVoices('loading');
    const timer = setTimeout(() => {
      speechifyVoices(code).then(
        (list) => live && setVoices(list),
        (e: unknown) => live && setVoices({ error: e instanceof Error ? e.message : String(e) }),
      );
    }, 400);
    return () => {
      live = false;
      clearTimeout(timer);
    };
  }, [code, model, keyText, hasKey]);
  return (
    <div className="translate-settings">
      <label className="translate-field">
        <span>{uni('VOICE_SPEECHIFY_KEY')}</span>
        <input
          type="password"
          autoComplete="off"
          spellCheck={false}
          value={keyText}
          onChange={(e) => {
            setKeyText(e.currentTarget.value);
            setSpeechifyKey(e.currentTarget.value);
          }}
        />
      </label>
      <label className="translate-field">
        <span>{uni('VOICE_GEMINI_MODEL')}</span>
        <select value={model} onChange={(e) => setSpeechifyModel(e.currentTarget.value)}>
          {models.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </label>
      {hasKey && Array.isArray(voices) && voices.length > 0 && (
        <label className="translate-field">
          <span>{uni('VOICE_WHICH')}</span>
          <select value={voices.some((v) => v.id === voice) ? voice : ''} onChange={(e) => setSpeechifyVoice(e.currentTarget.value)}>
            <option value="">{uni('VOICE_BEST')}</option>
            {voices.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
                {v.locale !== '' || v.gender !== '' ? ` (${[v.locale, v.gender].filter((x) => x !== '').join(', ')})` : ''}
              </option>
            ))}
          </select>
        </label>
      )}
      {hasKey && voices === 'loading' && <p className="voice-note">{uni('VOICE_SPEECHIFY_LOADING')}</p>}
      {hasKey && Array.isArray(voices) && voices.length === 0 && <p className="voice-note problem">{uni('VOICE_SPEECHIFY_NO_VOICES')}</p>}
      {hasKey && !Array.isArray(voices) && voices !== 'loading' && (
        <p className="voice-note problem" role="alert">
          {uni('VOICE_SPEECHIFY_FAILED', voices.error)}
        </p>
      )}
      <p className="option-note">{uni(hasKey ? 'VOICE_SPEECHIFY_NOTE' : 'VOICE_SPEECHIFY_NO_KEY')}</p>
      <Timing engine="speechify" />
    </div>
  );
}

/** Deepgram's settings: the key, the kind of voice (Flux or Aura-2) and the voice for the game's language: the known
 * ones, Deepgram's own list of today when the browser can read it, and any other typed by name. */
function DeepgramSettings({ code }: { code: string }) {
  const [keyText, setKeyText] = useState(deepgramKey);
  const [live, setLive] = useState<[string, 'F' | 'M' | '', string][]>([]);
  const family = deepgramFamily();
  useEffect(() => {
    let on = true;
    setLive([]);
    void deepgramLiveVoices(family, code).then((list) => on && setLive(list));
    return () => {
      on = false;
    };
  }, [code, keyText, family]);
  // Deepgram's list says the accents; the known ones fill what it does not say
  const byName = new Map<string, [string, 'F' | 'M' | '', string]>();
  for (const v of deepgramVoices(family, code)) byName.set(v[0], v);
  for (const v of live) {
    const known = byName.get(v[0]);
    byName.set(v[0], [v[0], v[1] || known?.[1] || '', v[2] || known?.[2] || '']);
  }
  const current = deepgramVoice(code);
  const options = [...byName.values()].map(([name, gender, accent]) => ({
    id: deepgramModelId(name, code, family),
    label: `${name[0]!.toUpperCase() + name.slice(1)}${gender !== '' || accent !== '' ? ` (${[gender === 'F' ? '♀' : gender === 'M' ? '♂' : '', accent === 'featured' ? '★' : accent].filter((x) => x !== '').join(', ')})` : ''}`,
  }));
  if (current !== '' && !options.some((o) => o.id === current)) options.push({ id: current, label: current });
  return (
    <div className="translate-settings">
      <label className="translate-field">
        <span>{uni('VOICE_DEEPGRAM_KEY')}</span>
        <input
          type="password"
          autoComplete="off"
          spellCheck={false}
          value={keyText}
          onChange={(e) => {
            setKeyText(e.currentTarget.value);
            setDeepgramKey(e.currentTarget.value);
          }}
        />
      </label>
      <label className="translate-field">
        <span>{uni('VOICE_DEEPGRAM_FAMILY')}</span>
        <select value={family} onChange={(e) => setDeepgramFamily(e.currentTarget.value as DeepgramFamily)}>
          {DEEPGRAM_FAMILIES.map((f) => (
            <option key={f} value={f}>
              {f === 'flux' ? 'Flux' : 'Aura-2'}
            </option>
          ))}
        </select>
      </label>
      {options.length > 0 ? (
        <label className="translate-field">
          <span>{uni('VOICE_WHICH')}</span>
          <select value={current} onChange={(e) => setDeepgramVoice(code, e.currentTarget.value)}>
            {options.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      ) : (
        <p className="voice-note problem">{uni('VOICE_DEEPGRAM_NO_VOICES')}</p>
      )}
      <label className="translate-field">
        <span>{uni('VOICE_DEEPGRAM_OTHER')}</span>
        <input
          type="text"
          spellCheck={false}
          placeholder="eduardo"
          onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
          onBlur={(e) => {
            const id = typedVoice(e.currentTarget.value, code);
            if (id !== '') setDeepgramVoice(code, id);
            e.currentTarget.value = '';
          }}
        />
      </label>
      <p className="option-note">{uni(keyText.trim() !== '' ? 'VOICE_DEEPGRAM_NOTE' : 'VOICE_DEEPGRAM_NO_KEY')}</p>
      <Timing engine="deepgram" />
    </div>
  );
}
