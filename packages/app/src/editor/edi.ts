// A key of the scenario editor's own texts, the dictionary 'edi', which text.ts loads (only development builds have
// it); apart from text.ts so that the app's unit tests, which load the dictionary themselves, can use what says a
// text. Not ported from Valkyrie.
import { StringKey } from '@universalis/engine';

/** A key of the editor's texts, with {0}, {1}… replaced literally. */
export function edi(key: string, ...params: (string | number)[]): string {
  let text = new StringKey('edi', key).translate();
  params.forEach((param, i) => {
    text = text.split(`{${i}}`).join(String(param));
  });
  return text;
}
