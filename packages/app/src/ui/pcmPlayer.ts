// Not in Valkyrie: plays raw audio as it arrives from an online voice (ui/geminiSpeech.ts, ui/speechifySpeech.ts):
// 16-bit little-endian PCM, mono, queued piece after piece so the first words sound before the whole text has come.
// Also keeps how long the last reading took, for Options to show.
import { useSyncExternalStore } from 'react';

let context: AudioContext | null = null;
let current: PcmPlayer | null = null;

export class PcmPlayer {
  readonly stop = new AbortController();
  private readonly ctx: AudioContext;
  private readonly sources: AudioBufferSourceNode[] = [];
  private at = 0;
  private leftover = new Uint8Array(0);
  /** When the first sound was queued (performance.now()), or 0. */
  first = 0;

  /** A new player stops the one before. */
  private readonly rate: number;

  constructor(rate: number) {
    this.rate = rate;
    stopPcm();
    current = this;
    context ??= new AudioContext();
    this.ctx = context;
    void this.ctx.resume();
  }

  get stopped(): boolean {
    return this.stop.signal.aborted;
  }

  push(bytes: Uint8Array): void {
    if (this.stopped) return;
    const joined = new Uint8Array(this.leftover.length + bytes.length);
    joined.set(this.leftover);
    joined.set(bytes, this.leftover.length);
    const even = joined.length - (joined.length % 2);
    this.leftover = joined.slice(even);
    const samples = even / 2;
    if (samples === 0) return;
    const buffer = this.ctx.createBuffer(1, samples, this.rate);
    const channel = buffer.getChannelData(0);
    const view = new DataView(joined.buffer, 0, even);
    for (let i = 0; i < samples; i++) channel[i] = view.getInt16(i * 2, true) / 32768;
    if (this.first === 0) this.first = performance.now();
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(this.ctx.destination);
    this.at = Math.max(this.at, this.ctx.currentTime + 0.05);
    source.start(this.at);
    this.at += buffer.duration;
    this.sources.push(source);
  }

  /** Whether anything has sounded or is queued. */
  get any(): boolean {
    return this.sources.length > 0;
  }

  /** Resolves when the last piece has sounded; never, once stopped. */
  ended(): Promise<void> {
    return new Promise<void>((resolve) => {
      const last = this.sources[this.sources.length - 1];
      if (last === undefined) return resolve();
      last.onended = () => {
        if (current === this) current = null;
        resolve();
      };
    });
  }

  halt(): void {
    this.stop.abort();
    for (const source of this.sources) {
      source.onended = null;
      try {
        source.stop();
      } catch {
        // Not started yet
      }
    }
    if (current === this) current = null;
  }
}

/** Stops whatever an online voice is reading. */
export function stopPcm(): void {
  current?.halt();
}

/** How long the last online reading took, in seconds, or why it failed. */
export type VoiceTiming = { engine: string; model: string; first: number; total: number } | { engine: string; model: string; error: string };
let timing: VoiceTiming | null = null;
const listeners = new Set<() => void>();

export function setVoiceTiming(value: VoiceTiming): void {
  timing = value;
  for (const listener of listeners) listener();
}

export function useVoiceTiming(): VoiceTiming | null {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => timing,
  );
}

/** Why a service said no, from its answer. */
export async function failure(response: Response): Promise<string> {
  try {
    const text = await response.text();
    try {
      const body = JSON.parse(text) as { error?: { message?: string } | string; message?: string; detail?: string };
      const error = typeof body.error === 'string' ? body.error : body.error?.message;
      return error ?? body.message ?? body.detail ?? `HTTP ${response.status}`;
    } catch {
      return text.trim().slice(0, 200) || `HTTP ${response.status}`;
    }
  } catch {
    return `HTTP ${response.status}`;
  }
}

/** A key kept in this browser only (not in config.ini, which goes into backups). */
export function storedKey(name: string, memory: Map<string, string>): string {
  try {
    return localStorage.getItem(name) ?? memory.get(name) ?? '';
  } catch {
    return memory.get(name) ?? '';
  }
}

export function storeKey(name: string, value: string, memory: Map<string, string>): void {
  memory.set(name, value.trim());
  try {
    if (value.trim() === '') localStorage.removeItem(name);
    else localStorage.setItem(name, value.trim());
  } catch {
    // Storage blocked: the key lasts while the page is open
  }
}
