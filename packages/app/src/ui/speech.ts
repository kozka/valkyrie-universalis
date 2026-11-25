// Not in Valkyrie: reading a text aloud with the browser's own voices (Web Speech API), for the event windows (Valkyrie
// issue #390, docs/peticiones.md). The text is cleaned first: no formatting tags, and the games' symbols said by name.
// Options can pick an online voice instead, Gemini's (ui/geminiSpeech.ts), Speechify's (ui/speechifySpeech.ts) or
// Deepgram's (ui/deepgramSpeech.ts); if it fails, the browser's voice reads the text.
import { useSyncExternalStore } from 'react';
import { Game } from '@universalis/engine';
import { languageCode } from './languages.ts';
import { deepgramReady, deepgramSpeak } from './deepgramSpeech.ts';
import { geminiReady, geminiSpeak } from './geminiSpeech.ts';
import { stopPcm } from './pcmPlayer.ts';
import { browserVoice, voiceEngine } from './preferences.ts';
import { speechifyReady, speechifySpeak } from './speechifySpeech.ts';
import { spokenParts, spokenText } from './spokenText.ts';

/** Which text is being read, by the id its window gave, or null. */
let reading: string | null = null;
/** Counts each start and stop, so that the end of a text cancelled does not end the one read after it. */
let session = 0;
const listeners = new Set<() => void>();

function setReading(id: string | null): void {
  reading = id;
  for (const listener of listeners) listener();
}

/** Whether this browser has voices of its own. */
export function canSpeak(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
}

/** Whether texts can be read aloud now: the browser has voices and Options has not turned them off. */
export function readingAloud(): boolean {
  const engine = voiceEngine();
  if (engine === 'gemini') return geminiReady() || canSpeak();
  if (engine === 'speechify') return speechifyReady() || canSpeak();
  if (engine === 'deepgram') return deepgramReady() || canSpeak();
  return canSpeak() && engine === 'browser';
}

/** The browser's voices for a language, the natural-sounding ones (online, neural) first. */
export function browserVoices(code: string): SpeechSynthesisVoice[] {
  if (!canSpeak()) return [];
  const voices = speechSynthesis.getVoices().filter((v) => v.lang.toLowerCase().split(/[-_]/)[0] === code);
  const score = (v: SpeechSynthesisVoice) => (/natural|neural|online|premium|enhanced/i.test(v.name) ? 2 : 0) + (/google/i.test(v.name) ? 1 : 0) + (v.default ? 0.5 : 0);
  return voices.sort((a, b) => score(b) - score(a));
}

/** The voice to read with: the one chosen in Options, else the best. Always the same one, so the reader does not change. */
function voiceFor(code: string): SpeechSynthesisVoice | null {
  const voices = browserVoices(code);
  return voices.find((v) => v.name === browserVoice()) ?? voices[0] ?? null;
}

/** The browser lists its voices a moment after the page loads: wait for them once, or the first text gets another voice. */
function voicesLoaded(): Promise<void> {
  if (speechSynthesis.getVoices().length > 0) return Promise.resolve();
  return new Promise((resolve) => {
    const timer = setTimeout(resolve, 1500);
    speechSynthesis.addEventListener(
      'voiceschanged',
      () => {
        clearTimeout(timer);
        resolve();
      },
      { once: true },
    );
  });
}

/** Reads a text aloud in the game's language, stopping whatever was being read. */
export function speak(id: string, text: string): void {
  stopSpeaking();
  const said = spokenText(text);
  if (said.length === 0) return;
  const code = languageCode(Game.get().currentLang);
  const mine = session;
  const done = () => {
    if (session === mine && reading === id) setReading(null);
  };
  const engine = voiceEngine();
  const online = engine === 'gemini' && geminiReady() ? geminiSpeak(said) : engine === 'speechify' && speechifyReady() ? speechifySpeak(said, code) : engine === 'deepgram' && deepgramReady() ? deepgramSpeak(said, code) : null;
  if (online !== null) {
    setReading(id);
    online.then(done, () => {
      if (session === mine && reading === id) browserSpeak(id, said, code, mine, done);
    });
    return;
  }
  if (!canSpeak()) return;
  setReading(id);
  browserSpeak(id, said, code, mine, done);
}

/** The voice to fall back on when the chosen one says nothing: one that lives on this computer, not on a server. */
function localVoiceFor(code: string, not: SpeechSynthesisVoice | null): SpeechSynthesisVoice | null {
  const local = browserVoices(code).filter((v) => v.localService && v !== not);
  return local.find((v) => v.name === browserVoice()) ?? local[0] ?? null;
}

/** The utterances being read: Chrome forgets one nobody holds, and then never says when it ends. */
let held: SpeechSynthesisUtterance[] = [];
/** When the last reading was cancelled: Chrome drops a speak() that comes right after cancel(). */
let cancelledAt = 0;
/** A text the browser would not read before the player touched the page, read on the next touch. */
let waiting: { id: string; run: () => void } | null = null;
/** What happened to the last reading, for the bug reports (ui/Feedback.tsx). */
let lastNote = '';

function note(what: string): void {
  lastNote = what;
}

/** The voice and what happened to its last reading, for the bug reports. */
export function speechState(): string {
  const engine = voiceEngine();
  if (engine !== 'browser') return `${engine}${lastNote ? `, ${lastNote}` : ''}`;
  if (!canSpeak()) return 'sin voces del navegador';
  const voice = voiceFor(languageCode(Game.get().currentLang));
  const name = voice === null ? 'ninguna' : `${voice.name} (${voice.localService ? 'local' : 'en línea'})`;
  return `navegador, ${name}${lastNote ? `, ${lastNote}` : ''}`;
}

/** Reads on the player's next touch or key; stopSpeaking of that id forgets it. */
function onNextGesture(id: string, run: () => void): void {
  waiting = { id, run };
  const go = () => {
    removeEventListener('pointerup', go, true);
    removeEventListener('keyup', go, true);
    const mine = waiting;
    // After the touch has done its own work: if it closed the window, its text is no longer waiting
    setTimeout(() => {
      if (waiting !== mine || mine === null) return;
      waiting = null;
      mine.run();
    }, 0);
  };
  addEventListener('pointerup', go, true);
  addEventListener('keyup', go, true);
}

/**
 * Reads with the browser's voice. Not in Valkyrie: Chrome can stay silent without saying so (a voice on Google's servers
 * that does not answer, a queue stuck after cancel()), so a reading that has not started after a few seconds is tried
 * again with a voice on this computer; and one refused because the player has not touched the page yet waits for a touch.
 */
function browserSpeak(id: string, said: string, code: string, mine: number, done: () => void, fallback = false): void {
  if (!canSpeak()) {
    done();
    return;
  }
  void voicesLoaded().then(() => {
    setTimeout(() => {
      if (session !== mine || reading !== id) return;
      const chosen = voiceFor(code);
      const voice = fallback ? localVoiceFor(code, chosen) : chosen;
      // Chrome can be left paused (the tab hidden, the computer asleep), and then reads nothing
      if (speechSynthesis.paused) speechSynthesis.resume();
      let started = false;
      let over = false;
      const giveUp = (why: string) => {
        if (over) return;
        over = true;
        clearTimeout(watchdog);
        speechSynthesis.cancel();
        cancelledAt = performance.now();
        if (session !== mine || reading !== id) return;
        const other = fallback ? null : localVoiceFor(code, voice);
        if (other !== null) {
          note(`${why} con ${voice?.name ?? 'la voz por defecto'}, se lee con ${other.name}`);
          console.warn(`Read aloud: ${why} with ${voice?.name ?? 'the default voice'}; trying ${other.name}`);
          browserSpeak(id, said, code, mine, done, true);
        } else {
          note(`${why} con ${voice?.name ?? 'la voz por defecto'}`);
          console.warn(`Read aloud: ${why} with ${voice?.name ?? 'the default voice'}`);
          stopSpeaking(id);
        }
      };
      const watchdog = setTimeout(() => {
        if (!started) giveUp('no empieza');
      }, 4000);
      const parts = spokenParts(said);
      held = parts.map((part, i) => {
        const utterance = new SpeechSynthesisUtterance(part);
        utterance.lang = code;
        if (voice !== null) utterance.voice = voice;
        utterance.onstart = () => {
          started = true;
          clearTimeout(watchdog);
        };
        if (i === parts.length - 1)
          utterance.onend = () => {
            if (over) return;
            over = true;
            clearTimeout(watchdog);
            if (session === mine) note(started ? 'leída' : 'termina sin empezar');
            done();
          };
        utterance.onerror = (event) => {
          if (over || session !== mine) return;
          if (event.error === 'not-allowed') {
            // Chrome reads nothing until the player has touched the page: read it on the first touch
            over = true;
            clearTimeout(watchdog);
            note('espera a que se toque la página');
            setReading(null);
            onNextGesture(id, () => {
              const again = session;
              setReading(id);
              browserSpeak(id, said, code, again, () => {
                if (session === again && reading === id) setReading(null);
              }, fallback);
            });
            return;
          }
          if (event.error === 'interrupted' || event.error === 'canceled') return;
          giveUp(`error «${event.error}»`);
        };
        return utterance;
      });
      for (const utterance of held) speechSynthesis.speak(utterance);
    }, Math.max(0, cancelledAt + 150 - performance.now()));
  });
}

/** Stops reading; only the text with this id, when one is given. */
export function stopSpeaking(id?: string): void {
  if (waiting !== null && (id === undefined || waiting.id === id)) waiting = null;
  if (id !== undefined && reading !== id) return;
  session++;
  stopPcm();
  if (canSpeak()) {
    if (speechSynthesis.speaking || speechSynthesis.pending) cancelledAt = performance.now();
    speechSynthesis.cancel();
  }
  held = [];
  setReading(null);
}

/** Which text is being read, for a component to show it. */
export function useReading(): string | null {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => reading,
  );
}
