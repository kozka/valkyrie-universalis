// Not in Valkyrie: reading aloud with Speechify's voices (ui/speech.ts), a second online test kozka asked for (31
// October 2026), as Gemini's free use is very short. The player brings their own key (platform.speechify.ai); the text
// goes to Speechify, which streams back raw PCM (16-bit, 24 kHz, mono), played as it comes. The key stays in this
// browser (not in config.ini, which goes into backups); the model and the voice go in config.ini.
import { Game } from '@universalis/engine';
import { PcmPlayer, failure, setVoiceTiming, storeKey, storedKey } from './pcmPlayer.ts';
import { update } from './store.ts';

const KEY = 'universalis.speechifyKey';
const SECTION = 'Universalis';
const API = 'https://api.speechify.ai/v1';
const SAMPLE_RATE = 24000;

/** The models that read Spanish and the other languages, the default first (simba-3.2 is English only). */
export const SPEECHIFY_MODELS = ['simba-3.5', 'simba-3.0', 'simba-3.2'] as const;

export type SpeechifyVoice = { id: string; name: string; locale: string; gender: string; rank: number };

const memory = new Map<string, string>();

export function speechifyKey(): string {
  return storedKey(KEY, memory);
}

export function setSpeechifyKey(key: string): void {
  storeKey(KEY, key, memory);
  voiceCache.clear();
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

export function speechifyModel(): string {
  return setting('speechifyModel') || SPEECHIFY_MODELS[0];
}
export function setSpeechifyModel(value: string): void {
  voiceCache.clear();
  save('speechifyModel', value);
}
/** The voice chosen by id, or '' for Speechify's first pick for the language. */
export function speechifyVoice(): string {
  return setting('speechifyVoice');
}
export function setSpeechifyVoice(value: string): void {
  save('speechifyVoice', value);
}

export function speechifyReady(): boolean {
  return speechifyKey() !== '' && typeof window !== 'undefined' && 'AudioContext' in window;
}

const voiceCache = new Map<string, Promise<SpeechifyVoice[]>>();

/** Speechify's voices for a language (the two letters) and the chosen model, its own picks first. */
export function speechifyVoices(code: string): Promise<SpeechifyVoice[]> {
  const model = speechifyModel();
  const id = `${code}|${model}`;
  let voices = voiceCache.get(id);
  if (voices === undefined) {
    voices = loadVoices(code, model);
    voiceCache.set(id, voices);
    voices.catch(() => voiceCache.delete(id));
  }
  return voices;
}

type RawVoice = { id?: string; display_name?: string; locale?: string; gender?: string; staff_pick_rank?: number | null };

async function loadVoices(code: string, model: string): Promise<SpeechifyVoice[]> {
  const found: SpeechifyVoice[] = [];
  let cursor = '';
  for (let page = 0; page < 10; page++) {
    const query = new URLSearchParams({ locale: code, model, limit: '200' });
    if (cursor !== '') query.set('cursor', cursor);
    const response = await fetch(`${API}/voices?${query}`, { headers: { Authorization: `Bearer ${speechifyKey()}` } });
    if (!response.ok) throw new Error(await failure(response));
    const body = (await response.json()) as RawVoice[] | { voices?: RawVoice[]; data?: RawVoice[]; items?: RawVoice[]; has_more?: boolean; cursor?: string; next_cursor?: string };
    const list = Array.isArray(body) ? body : (body.voices ?? body.data ?? body.items ?? []);
    for (const v of list) {
      if (!v.id) continue;
      found.push({ id: v.id, name: v.display_name ?? v.id, locale: v.locale ?? '', gender: v.gender ?? '', rank: v.staff_pick_rank ?? Number.MAX_SAFE_INTEGER });
    }
    const next = Array.isArray(body) ? '' : (body.has_more ? (body.next_cursor ?? body.cursor ?? '') : '');
    if (next === '') break;
    cursor = next;
  }
  // The language's own voices first (the filter is by prefix, but an older answer may ignore it)
  const mine = found.filter((v) => v.locale === '' || v.locale.toLowerCase().startsWith(code));
  return (mine.length > 0 ? mine : found).sort((a, b) => a.rank - b.rank || a.name.localeCompare(b.name));
}

/**
 * Reads a text aloud in a language (the two letters), stopping whatever was being read. Resolves when the audio has
 * finished, rejects if Speechify fails, and never settles once stopped.
 */
export async function speechifySpeak(text: string, code: string): Promise<void> {
  const player = new PcmPlayer(SAMPLE_RATE);
  const model = speechifyModel();
  const started = performance.now();
  try {
    let voiceId = speechifyVoice();
    let locale = '';
    const voices = await speechifyVoices(code).catch((e: unknown) => {
      if (voiceId === '') throw e;
      return [];
    });
    const voice = voices.find((v) => v.id === voiceId) ?? (voiceId === '' ? voices[0] : undefined);
    if (voice !== undefined) {
      voiceId = voice.id;
      locale = voice.locale;
    }
    if (voiceId === '') throw new Error('no voice for this language');
    if (player.stopped) return new Promise<void>(() => {});
    const response = await fetch(`${API}/audio/stream`, {
      method: 'POST',
      signal: player.stop.signal,
      headers: { 'Content-Type': 'application/json', Accept: 'audio/pcm', Authorization: `Bearer ${speechifyKey()}` },
      body: JSON.stringify({ input: text, voice_id: voiceId, model, ...(locale.toLowerCase().startsWith(code) ? { language: locale } : {}) }),
    });
    if (!response.ok || response.body === null) throw new Error(await failure(response));
    const reader = response.body.getReader();
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      player.push(value);
    }
    if (!player.any) throw new Error('no audio');
    setVoiceTiming({ engine: 'speechify', model, first: (player.first - started) / 1000, total: (performance.now() - started) / 1000 });
  } catch (e) {
    if (player.stopped) return new Promise<void>(() => {});
    player.halt();
    const message = e instanceof Error ? e.message : String(e);
    setVoiceTiming({ engine: 'speechify', model, error: message });
    throw new Error(message);
  }
  return player.ended();
}
