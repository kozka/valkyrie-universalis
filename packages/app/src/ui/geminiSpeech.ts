// Not in Valkyrie: reading aloud with Google's Gemini voices (ui/speech.ts), a test kozka asked for (31 October
// 2026) to compare with the browser's. The player brings their own Gemini API key (aistudio.google.com/apikey); the
// text goes to Google, which streams back raw PCM (16-bit, 24 kHz, mono), played as it comes so the first words sound
// before the whole text is done. The key stays in this browser (not in config.ini, which goes into backups).
import { Game } from '@universalis/engine';
import { PcmPlayer, failure, setVoiceTiming, storeKey, storedKey } from './pcmPlayer.ts';
import { update } from './store.ts';

const KEY = 'universalis.geminiKey';
const SECTION = 'Universalis';
const ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/';
const SAMPLE_RATE = 24000;

/** The TTS models, the default first: 3.x streams its audio; 2.5 sends it all at the end. */
export const GEMINI_MODELS = ['gemini-3.1-flash-tts-preview', 'gemini-2.5-flash-preview-tts', 'gemini-2.5-pro-preview-tts'] as const;

/** Gemini's prebuilt voices, the default first. */
export const GEMINI_VOICES = [
  'Charon', 'Algenib', 'Enceladus', 'Gacrux', 'Kore', 'Puck', 'Zephyr', 'Fenrir', 'Leda', 'Orus', 'Aoede', 'Callirrhoe',
  'Autonoe', 'Iapetus', 'Umbriel', 'Algieba', 'Despina', 'Erinome', 'Rasalgethi', 'Laomedeia', 'Achernar', 'Alnilam',
  'Schedar', 'Pulcherrima', 'Achird', 'Zubenelgenubi', 'Vindemiatrix', 'Sadachbia', 'Sadaltager', 'Sulafat',
] as const;

const memory = new Map<string, string>();

/** The player's Gemini key, kept in this browser only. */
export function geminiKey(): string {
  return storedKey(KEY, memory);
}

export function setGeminiKey(key: string): void {
  storeKey(KEY, key, memory);
  update();
}

function setting(key: string): string {
  return Game.game?.config.data.get(SECTION, key) ?? '';
}

function save(key: string, value: string): void {
  const game = Game.get();
  game.config.data.add(SECTION, key, value);
  game.config.save();
  update();
}

export function geminiModel(): string {
  return setting('geminiModel') || GEMINI_MODELS[0];
}
export function setGeminiModel(value: string): void {
  save('geminiModel', value);
}
export function geminiVoice(): string {
  return setting('geminiVoice') || GEMINI_VOICES[0];
}
export function setGeminiVoice(value: string): void {
  save('geminiVoice', value);
}
/** How to read, said to the model before the text («Read like a horror narrator, in a low voice»), or ''. */
export function geminiStyle(): string {
  return setting('geminiStyle');
}
export function setGeminiStyle(value: string): void {
  save('geminiStyle', value.trim());
}

/** Whether Gemini can read here: a key, and a browser that plays audio. */
export function geminiReady(): boolean {
  return geminiKey() !== '' && typeof window !== 'undefined' && 'AudioContext' in window;
}

function fromBase64(text: string): Uint8Array {
  const binary = atob(text);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

/**
 * Reads a text aloud, stopping whatever was being read. Resolves when the audio has finished, rejects if Google fails,
 * and never settles once stopped.
 */
export async function geminiSpeak(text: string): Promise<void> {
  const player = new PcmPlayer(SAMPLE_RATE);
  const model = geminiModel();
  const style = geminiStyle();
  const started = performance.now();
  try {
    const response = await fetch(`${ENDPOINT}${model}:streamGenerateContent?alt=sse`, {
      method: 'POST',
      signal: player.stop.signal,
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': geminiKey() },
      body: JSON.stringify({
        contents: [{ parts: [{ text: style === '' ? text : `${style}: ${text}` }] }],
        generationConfig: { responseModalities: ['AUDIO'], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: geminiVoice() } } } },
      }),
    });
    if (!response.ok || response.body === null) throw new Error(await failure(response));
    const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
    let pending = '';
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      pending += value;
      const lines = pending.split(/\r?\n/);
      pending = lines.pop() ?? '';
      for (const line of lines) {
        if (!line.startsWith('data:')) continue;
        const chunk = JSON.parse(line.slice(5)) as { candidates?: { content?: { parts?: { inlineData?: { data?: string } }[] } }[]; error?: { message?: string } };
        if (chunk.error) throw new Error(chunk.error.message ?? 'Gemini');
        for (const part of chunk.candidates?.[0]?.content?.parts ?? []) if (part.inlineData?.data) player.push(fromBase64(part.inlineData.data));
      }
    }
    if (!player.any) throw new Error('no audio');
    setVoiceTiming({ engine: 'gemini', model, first: (player.first - started) / 1000, total: (performance.now() - started) / 1000 });
  } catch (e) {
    if (player.stopped) return new Promise<void>(() => {});
    player.halt();
    const message = e instanceof Error ? e.message : String(e);
    setVoiceTiming({ engine: 'gemini', model, error: message });
    throw new Error(message);
  }
  return player.ended();
}
