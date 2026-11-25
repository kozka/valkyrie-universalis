// Not in Valkyrie: reading aloud with Deepgram's voices (ui/speech.ts), a third online test kozka asked for (31
// October 2026): Flux, the new ones (/v2/speak, flux-eduardo-es), or Aura-2 (/v1/speak, aura-2-nestor-es). Deepgram's REST API refuses browsers (CORS), so the text goes by its WebSocket, which a browser
// may open with the key as a subprotocol; it streams back raw PCM (16-bit, 24 kHz, mono), played as it comes. The key
// stays in this browser (not in config.ini, which goes into backups); the voice goes in config.ini.
import { Game } from '@universalis/engine';
import { PcmPlayer, setVoiceTiming, storeKey, storedKey } from './pcmPlayer.ts';
import { update } from './store.ts';

const KEY = 'universalis.deepgramKey';
const SECTION = 'Universalis';
/** Deepgram's two kinds of voices, the default first, and where each is spoken. */
export const DEEPGRAM_FAMILIES = ['flux', 'aura-2'] as const;
export type DeepgramFamily = (typeof DEEPGRAM_FAMILIES)[number];
const SOCKETS: Record<DeepgramFamily, string> = { flux: 'wss://api.deepgram.com/v2/speak', 'aura-2': 'wss://api.deepgram.com/v1/speak' };
const SAMPLE_RATE = 24000;
/** Deepgram takes up to 2,000 characters in each Speak message. */
const MAX_PART = 1900;

type Voice = [string, 'F' | 'M' | '', string];
const US = (names: string, gender: 'F' | 'M'): Voice[] => names.split(' ').map((n) => [n, gender, 'American']);
const plain = (names: string, gender: 'F' | 'M'): Voice[] => names.split(' ').map((n) => [n, gender, '']);

/** Aura-2's voices by language: name, gender and accent; Spain's first for Spanish. */
const AURA_VOICES: Record<string, Voice[]> = {
  es: [
    ['nestor', 'M', 'Peninsular'], ['alvaro', 'M', 'Peninsular'], ['carina', 'F', 'Peninsular'], ['diana', 'F', 'Peninsular'],
    ['silvia', 'F', 'Peninsular'], ['agustina', 'F', 'Peninsular'], ['antonia', 'F', 'Argentine'], ['celeste', 'F', 'Colombian'],
    ['gloria', 'F', 'Colombian'], ['estrella', 'F', 'Mexican'], ['olivia', 'F', 'Mexican'], ['selena', 'F', 'Latin American'],
    ['aquila', 'M', 'Latin American'], ['javier', 'M', 'Mexican'], ['luciano', 'M', 'Mexican'], ['sirio', 'M', 'Mexican'],
    ['valerio', 'M', 'Mexican'],
  ],
  en: [
    ...US('orpheus zeus apollo arcas aries atlas hermes jupiter mars neptune odysseus orion pluto saturn', 'M'),
    ['draco', 'M', 'British'], ['hyperion', 'M', 'Australian'],
    ...US('thalia andromeda asteria athena aurora callista cora cordelia delia electra harmonia helena hera iris janus juno luna minerva ophelia phoebe selene vesta', 'F'),
    ['pandora', 'F', 'British'], ['theia', 'F', 'Australian'], ['amalthea', 'F', 'Filipino'],
  ],
  fr: [['hector', 'M', ''], ['agathe', 'F', '']],
  de: [...plain('julius fabian', 'M'), ...plain('aurelia elara kara lara viktoria', 'F')],
  it: [...plain('cesare dionisio elio flavio', 'M'), ...plain('cinzia demetra livia maia melia', 'F')],
  nl: [...plain('lars roman sander', 'M'), ...plain('beatrix cornelia daphne hestia leda rhea', 'F')],
  ja: [...plain('ebisu fujin', 'M'), ...plain('ama izanami uzume', 'F')],
};

const names = (list: string, accent = ''): Voice[] => list.split(' ').map((n) => [n, '', accent]);

/** Flux's voices by the app's languages (docs/flux-tts/voices, 31 October 2026): its featured English ones first. */
const FLUX_VOICES: Record<string, Voice[]> = {
  es: [
    ...(['eduardo', 'duvan', 'alfredo', 'ernesto', 'gustavo', 'jaime', 'martin', 'mauricio', 'rafael', 'tomas'] as const).map((n): Voice => [n, 'M', '']),
    ...(['valentina', 'aina', 'carmen', 'cecilia', 'fernanda', 'fiorella', 'patricia', 'pilar', 'ysabel'] as const).map((n): Voice => [n, 'F', '']),
  ],
  en: [
    ...names('hannah kit alexis cliff sienna cole brooke colin gemma haley heather miles sean', 'featured'),
    ...names('bree brittany bruce conor donovan drew elise jack kai kelsey maeve marcelo marcus meena meghan naveen paige priya rufus sharon tanner wade wes'),
  ],
  fr: names('arnaud benoit brigitte camille chloe florian julien mathieu pierre thierry veronique yasmine'),
  de: [...names('benjamin christian janine magdalena moritz nadine rolf sonja sven tobias verena'), ...names('leonie yannick', 'Swiss')],
  it: names('angela chiara federico giorgio matteo paola rocco sofia stefano vincenzo vito'),
  pt: [...names('artur benedita catarina hugo pedro ricardo', 'Portugal'), ...names('bianca bruno claudia leandro marcia mariana marta mateus miguel renato roberto rodrigo', 'Brazil')],
  nl: [...names('anouk bram fleur irene luuk monique ruben sanne yvonne'), ...names('dirk lotte niels veerle', 'Flemish')],
  ja: names('ayumi hayato nozomi sayaka'),
  ru: names('andrei kirill maxim mikhail natalia nikolai olga polina vladimir'),
  pl: names('bartosz ewa justyna kacper konrad zuzanna'),
  cs: names('jakub'),
  uk: names('denys solomiya'),
  ko: names('eunji hyunwoo mikyung minjun soojin sungmin'),
  zh: [...names('bo haoran jian jie lijuan shufen wenbo wenjing zhen'), ...names('chiaying kuanyu yawen yuting', 'Taiwan'), ...names('manlok', 'Cantonese')],
};

/** The voices of a kind for a language. */
export function deepgramVoices(family: DeepgramFamily, code: string): Voice[] {
  return (family === 'flux' ? FLUX_VOICES : AURA_VOICES)[code] ?? [];
}

/** The model id of a voice in a language: flux-eduardo-es, aura-2-nestor-es. */
export function deepgramModelId(name: string, code: string, family: DeepgramFamily = deepgramFamily()): string {
  return `${family}-${name}-${code}`;
}

/** The kind a model id is of. */
function familyOf(id: string): DeepgramFamily {
  return id.startsWith('aura-') ? 'aura-2' : 'flux';
}

const memory = new Map<string, string>();

export function deepgramKey(): string {
  return storedKey(KEY, memory);
}

export function setDeepgramKey(key: string): void {
  storeKey(KEY, key, memory);
  update();
}

export function deepgramFamily(): DeepgramFamily {
  const value = Game.game?.config.data.get(SECTION, 'deepgramFamily') ?? '';
  return DEEPGRAM_FAMILIES.find((f) => f === value) ?? DEEPGRAM_FAMILIES[0];
}

export function setDeepgramFamily(value: DeepgramFamily): void {
  const game = Game.get();
  game.config.data.add(SECTION, 'deepgramFamily', value);
  game.config.save();
  update();
}

function voiceKey(code: string, family: DeepgramFamily): string {
  return family === 'aura-2' ? `deepgramVoice_${code}` : `deepgramVoice_${family}_${code}`;
}

/**
 * The voice chosen for a language in the kind chosen, by model id (one from the lists, or typed in Options), or the
 * language's first; '' if that kind has none for it and none was typed.
 */
export function deepgramVoice(code: string): string {
  const family = deepgramFamily();
  const voices = deepgramVoices(family, code);
  const chosen = Game.game?.config.data.get(SECTION, voiceKey(code, family)) ?? '';
  if (/^(aura|flux)-/.test(chosen) && familyOf(chosen) === family) return chosen;
  return voices[0] ? deepgramModelId(voices[0][0], code, family) : '';
}

export function setDeepgramVoice(code: string, value: string): void {
  const game = Game.get();
  game.config.data.add(SECTION, voiceKey(code, familyOf(value)), value);
  if (familyOf(value) !== deepgramFamily()) game.config.data.add(SECTION, 'deepgramFamily', familyOf(value));
  game.config.save();
  update();
}

/** A voice typed in Options, as a model id of the kind chosen: «eduardo» in Spanish is flux-eduardo-es; a whole id
 * (flux-… or aura-…) stays as it is. */
export function typedVoice(text: string, code: string): string {
  const name = text.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  if (name === '') return '';
  return /^(aura|flux)-/.test(name) ? name : deepgramModelId(name.replace(/\s+/g, ''), code);
}

type ModelEntry = { name?: string; canonical_name?: string; architecture?: string; languages?: string[]; metadata?: { accent?: string; tags?: string[] } };
const liveCache = new Map<string, Promise<Voice[]>>();

/**
 * Deepgram's own list of Aura-2 voices for a language, as it is today (new voices come there before the documentation),
 * if its server lets the browser read it; else an empty list.
 */
export function deepgramLiveVoices(family: DeepgramFamily, code: string): Promise<Voice[]> {
  let voices = liveCache.get(`${family}|${code}`);
  if (voices === undefined) {
    voices = loadLive(family, code).catch(() => []);
    liveCache.set(`${family}|${code}`, voices);
  }
  return voices;
}

async function loadLive(family: DeepgramFamily, code: string): Promise<Voice[]> {
  let response = await fetch('https://api.deepgram.com/v1/models').catch(() => null);
  if ((response === null || !response.ok) && deepgramKey() !== '') response = await fetch('https://api.deepgram.com/v1/models', { headers: { Authorization: `Token ${deepgramKey()}` } });
  if (response === null || !response.ok) return [];
  const body = (await response.json()) as { tts?: ModelEntry[] };
  const out: Voice[] = [];
  for (const m of body.tts ?? []) {
    const id = m.canonical_name ?? '';
    if (!id.startsWith(`${family}-`) || !id.endsWith(`-${code}`)) continue;
    const name = id.slice(family.length + 1, -(code.length + 1));
    const tags = (m.metadata?.tags ?? []).map((t) => t.toLowerCase());
    const gender = tags.includes('feminine') || tags.includes('female') ? 'F' : tags.includes('masculine') || tags.includes('male') ? 'M' : '';
    out.push([name, gender, m.metadata?.accent ?? '']);
  }
  return out;
}


export function deepgramReady(): boolean {
  return deepgramKey() !== '' && typeof window !== 'undefined' && 'AudioContext' in window && 'WebSocket' in window;
}

/** The text in pieces Deepgram takes, cut after a sentence where it can. */
function pieces(text: string): string[] {
  const out: string[] = [];
  let rest = text;
  while (rest.length > MAX_PART) {
    const slice = rest.slice(0, MAX_PART);
    const cut = Math.max(slice.lastIndexOf('. '), slice.lastIndexOf('! '), slice.lastIndexOf('? '), slice.lastIndexOf('\n'));
    const space = slice.lastIndexOf(' ');
    const at = cut > MAX_PART / 2 ? cut + 1 : space > 0 ? space : MAX_PART;
    out.push(rest.slice(0, at).trim());
    rest = rest.slice(at);
  }
  if (rest.trim() !== '') out.push(rest.trim());
  return out;
}

/**
 * Reads a text aloud in a language (the two letters), stopping whatever was being read. Resolves when the audio has
 * finished, rejects if Deepgram fails or has no voice for the language, and never settles once stopped.
 */
export async function deepgramSpeak(text: string, code: string): Promise<void> {
  const player = new PcmPlayer(SAMPLE_RATE);
  const model = deepgramVoice(code);
  const started = performance.now();
  try {
    if (model === '') throw new Error(`no ${deepgramFamily()} voice for «${code}»`);
    const family = familyOf(model);
    await new Promise<void>((resolve, reject) => {
      const query = new URLSearchParams({ model, encoding: 'linear16', sample_rate: String(SAMPLE_RATE) });
      const socket = new WebSocket(`${SOCKETS[family]}?${query}`, ['token', deepgramKey()]);
      socket.binaryType = 'arraybuffer';
      let finished = false;
      const end = (error?: Error) => {
        if (finished) return;
        finished = true;
        player.stop.signal.removeEventListener('abort', abort);
        if (socket.readyState === WebSocket.OPEN) socket.send(JSON.stringify({ type: 'Close' }));
        if (socket.readyState <= WebSocket.OPEN) socket.close();
        if (error) reject(error);
        else resolve();
      };
      const abort = () => end(new Error('stopped'));
      player.stop.signal.addEventListener('abort', abort);
      socket.onopen = () => {
        // Flux joins the pieces as they come, without a space between them
        for (const piece of pieces(text)) socket.send(JSON.stringify({ type: 'Speak', text: family === 'flux' ? `${piece} ` : piece }));
        socket.send(JSON.stringify({ type: 'Flush' }));
      };
      socket.onmessage = (event: MessageEvent) => {
        if (event.data instanceof ArrayBuffer) {
          player.push(new Uint8Array(event.data));
          return;
        }
        try {
          const message = JSON.parse(String(event.data)) as { type?: string; description?: string; err_msg?: string; message?: string; code?: string };
          // Aura ends its audio with Flushed; Flux, a turn with SpeechMetadata
          if (message.type === (family === 'flux' ? 'SpeechMetadata' : 'Flushed')) end();
          else if (message.type === 'Error') end(new Error([message.code, message.description ?? message.message ?? message.err_msg].filter(Boolean).join(': ') || 'Deepgram'));
        } catch {
          // Not JSON: ignored
        }
      };
      socket.onerror = () => end(new Error('WebSocket error (key or connection)'));
      socket.onclose = (event: CloseEvent) => end(player.any ? undefined : new Error(`closed ${event.code}${event.reason ? `: ${event.reason}` : ''}`));
    });
    if (!player.any) throw new Error('no audio');
    setVoiceTiming({ engine: 'deepgram', model, first: (player.first - started) / 1000, total: (performance.now() - started) / 1000 });
  } catch (e) {
    if (player.stopped) return new Promise<void>(() => {});
    player.halt();
    const message = e instanceof Error ? e.message : String(e);
    setVoiceTiming({ engine: 'deepgram', model: model || '—', error: message });
    throw new Error(message);
  }
  return player.ended();
}
