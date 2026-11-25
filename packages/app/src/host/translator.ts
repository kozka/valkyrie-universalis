// Not in Valkyrie: the automatic translation of a scenario's texts into the player's language, when the scenario does
// not come in it (docs/peticiones.md). The player brings their own OpenRouter key and picks a model; the texts of a
// window go together in one request, and come back with their formatting, colours and symbols where they were.
import { Game, LocalizationRead } from '@universalis/engine';
import { languageName } from '../ui/languages.ts';
import { switchOn, translateModel } from '../ui/preferences.ts';

const ENDPOINT = 'https://openrouter.ai/api/v1/chat/completions';
const MODELS = 'https://openrouter.ai/api/v1/models';
const KEY = 'universalis.openrouterKey';

/** The player's OpenRouter key, kept in this browser only (not in config.ini, which goes into backups). */
export function translateKey(): string {
  try {
    return localStorage.getItem(KEY) ?? '';
  } catch {
    return '';
  }
}

export function setTranslateKey(key: string): void {
  try {
    if (key.trim() === '') localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, key.trim());
  } catch {
    // Storage blocked: the key lasts while the page is open
    memoryKey = key.trim();
  }
}

let memoryKey = '';

function key(): string {
  return translateKey() || memoryKey;
}

/** Whether the texts of the scenario being played are translated: switched on, with a key, and the scenario not in
 * the player's language. */
/**
 * The automatic translation is switched off for everyone for now (kozka, 16 October 2026: too slow to play with).
 * Options shows it greyed with a note, and nothing is sent to OpenRouter whatever the player had chosen. Set it to
 * false to bring it back as it was.
 */
export const TRANSLATION_PAUSED = true;

export function translating(): boolean {
  if (TRANSLATION_PAUSED) return false;
  if (!switchOn('autoTranslate') || key() === '') return false;
  const game = Game.game;
  const quest = game?.currentQuest;
  if (game == null || quest == null) return false;
  const languages = new Set(LocalizationRead.dicts.get('qst')?.getLanguagesList() ?? []);
  for (const lang of quest.qd.quest.languages_name?.keys() ?? []) languages.add(lang);
  return !languages.has(game.currentLang);
}

/** The instructions the model gets: what to translate, and everything it must leave as it is. */
export function translationPrompt(from: string, to: string): string {
  return [
    `You translate the texts of a fan-made scenario for a board game (Mansions of Madness or Descent: Journeys in the Dark) from ${from} into ${to}.`,
    'You receive a JSON array of strings. Answer with ONLY a JSON array of the same length, each string translated, in the same order. No comments, no code fences.',
    'Keep exactly as they are, in the same places:',
    '- formatting tags such as <b>, </b>, <i>, </i>, <color=#ff0000>, <color=red>, </color>, <size=30>, </size> (translate the text between them, never the tags);',
    '- every character in the Unicode private use area (U+E000–U+F8FF) and the characters ≥ ∏ ∂ π ∞ ∑ μ ≤ ± : they are the game\'s symbols;',
    '- line breaks (\\n), and anything in braces such as {0} or {var:x};',
    '- proper names of people, places, monsters, items and organisations: do not translate them (Arkham, Innsmouth, Dunwich Horror, Lord Hawthorne…), unless the official game already has a usual name for them in the target language.',
    'Translate idioms and set phrases by their meaning, with a natural equivalent in the target language, never word by word. Keep the tone: eerie, old-fashioned narration for Mansions of Madness, heroic fantasy for Descent.',
    'Use the second person plural when the text speaks to the players, as the official game does.',
  ].join('\n');
}

/** Translations already made, by model, language and text: a window drawn again does not ask twice, and another model
 * asks again. */
const done = new Map<string, string>();

function doneKey(model: string, lang: string, text: string): string {
  return model + '\u0000' + lang + '\u0000' + text;
}

/** The JSON array in an answer, even inside code fences or after some words. */
export function parseTranslation(answer: string, count: number): string[] | null {
  const start = answer.indexOf('[');
  const end = answer.lastIndexOf(']');
  if (start < 0 || end <= start) return null;
  try {
    const parsed: unknown = JSON.parse(answer.substring(start, end + 1));
    if (!Array.isArray(parsed) || parsed.length !== count || !parsed.every((t) => typeof t === 'string')) return null;
    return parsed as string[];
  } catch {
    return null;
  }
}

/** How long a model has to answer: a free one can be slow, or never answer at all. */
export const TRANSLATE_TIMEOUT_SECONDS = 60;

/** The model did not answer in time. */
export class TranslateTimeout extends Error {}

/** The texts in the player's language; throws with the reason when the service fails, does not answer in time, or the
 * caller gives up (`cancel`). */
export async function translate(texts: readonly string[], cancel?: AbortSignal): Promise<string[]> {
  const game = Game.get();
  const to = game.currentLang;
  const from = game.currentQuest?.qd.quest.defaultLanguage ?? 'English';
  const model = translateModel();
  const missing = texts.filter((t) => t.trim() !== '' && !done.has(doneKey(model, to, t)));
  if (missing.length > 0) {
    const stop = new AbortController();
    const timer = setTimeout(() => stop.abort(new TranslateTimeout(`${TRANSLATE_TIMEOUT_SECONDS} s`)), TRANSLATE_TIMEOUT_SECONDS * 1000);
    const giveUp = () => stop.abort(cancel?.reason);
    if (cancel?.aborted) giveUp();
    cancel?.addEventListener('abort', giveUp);
    try {
      await ask(model, missing, to, from, stop.signal);
    } catch (e) {
      throw stop.signal.aborted && stop.signal.reason instanceof Error ? stop.signal.reason : e;
    } finally {
      clearTimeout(timer);
      cancel?.removeEventListener('abort', giveUp);
    }
  }
  return texts.map((t) => done.get(doneKey(model, to, t)) ?? t);
}

/** One request with the texts not translated yet, which go into `done`. */
async function ask(model: string, missing: string[], to: string, from: string, signal: AbortSignal): Promise<void> {
  const response = await fetch(ENDPOINT, {
    signal,
    method: 'POST',
    headers: { Authorization: `Bearer ${key()}`, 'Content-Type': 'application/json', 'X-Title': 'Valkyrie Universalis' },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      messages: [
        { role: 'system', content: translationPrompt(languageName(from, 'English'), languageName(to, 'English')) },
        { role: 'user', content: JSON.stringify(missing) },
      ],
    }),
  });
  const body = (await response.json().catch(() => null)) as { choices?: { message?: { content?: string } }[]; error?: { message?: string } } | null;
  if (!response.ok) throw new Error(body?.error?.message ?? `HTTP ${response.status}`);
  const translated = parseTranslation(body?.choices?.[0]?.message?.content ?? '', missing.length);
  if (translated === null) throw new Error('The model did not answer with the texts');
  missing.forEach((t, i) => done.set(doneKey(model, to, t), translated[i]!));
}

/** OpenRouter's free models (nothing to pay per token), DeepSeek's first: the ones to offer in Options. */
export async function freeModels(): Promise<string[]> {
  const response = await fetch(MODELS);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const { data } = (await response.json()) as { data: { id: string; pricing?: { prompt?: string; completion?: string } }[] };
  const free = data.filter((m) => Number(m.pricing?.prompt ?? 1) === 0 && Number(m.pricing?.completion ?? 1) === 0).map((m) => m.id);
  return free.sort((a, b) => Number(b.includes('deepseek')) - Number(a.includes('deepseek')) || a.localeCompare(b));
}
