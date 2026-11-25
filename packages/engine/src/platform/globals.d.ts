// The few web platform globals the engine uses. Browsers and Node both have them; declaring them here
// keeps the engine compiled without the DOM or Node type libraries, so neither can creep in.

interface TextDecoderOptions {
  fatal?: boolean;
  ignoreBOM?: boolean;
}

declare class TextDecoder {
  constructor(label?: string, options?: TextDecoderOptions);
  decode(input?: Uint8Array): string;
}

declare class TextEncoder {
  encode(input?: string): Uint8Array;
}
