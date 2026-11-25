// Not in Valkyrie: Ogg Vorbis for browsers that cannot read it (Safari before 26, on iPad and iPhone), decoded with
// WebAssembly. webAudio.ts loads this module only on those browsers, so the others never download it.
import { OggVorbisDecoderWebWorker } from '@wasm-audio-decoders/ogg-vorbis';

/** A decoded sound: one array of samples per channel. */
export interface DecodedSound {
  readonly channelData: Float32Array[];
  readonly samplesDecoded: number;
  readonly sampleRate: number;
}

let decoder: OggVorbisDecoderWebWorker | null = null;
/** One file at a time, since the decoder resets itself after each. */
let queue: Promise<unknown> = Promise.resolve();

/** The sound in an Ogg Vorbis file, decoded off the main thread. */
export function decodeOggVorbis(bytes: Uint8Array): Promise<DecodedSound> {
  const decoded = queue.then(async () => {
    decoder ??= new OggVorbisDecoderWebWorker();
    await decoder.ready;
    const sound = await decoder.decodeFile(bytes.slice());
    if (sound.samplesDecoded === 0) {
      throw new Error(sound.errors.map((error) => error.message).join('; ') || 'No Vorbis audio');
    }
    return sound;
  });
  queue = decoded.catch(() => undefined);
  return decoded;
}
