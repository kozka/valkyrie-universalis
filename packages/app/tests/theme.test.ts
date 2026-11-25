// The look lives in one place, theme.css, so that each game can set its own: the stylesheets of the components use its
// roles and no colours of their own. Not ported from Valkyrie.
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const src = path.join(import.meta.dirname, '..', 'src');
const themeFile = path.join(src, 'theme', 'theme.css');

function stylesheets(folder: string): string[] {
  return readdirSync(folder, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(folder, entry.name);
    if (entry.isDirectory()) return stylesheets(file);
    return entry.name.endsWith('.css') && file !== themeFile ? [file] : [];
  });
}

/** Each line of every component stylesheet that matches, as file:line: text. */
function linesMatching(pattern: RegExp): string[] {
  return stylesheets(src).flatMap((file) =>
    readFileSync(file, 'utf8')
      .split('\n')
      .flatMap((line, i) => (pattern.test(line) ? [`${path.relative(src, file)}:${i + 1}: ${line.trim()}`] : [])),
  );
}

describe('the theme', () => {
  it('gives the components every colour they use', () => {
    expect(linesMatching(/#[0-9a-f]{3,8}\b|\b(rgba?|hsla?|hwb|lab|lch|oklab|oklch)\(/i)).toEqual([]);
  });

  it('defines every role the stylesheets use', () => {
    const defined = new Set([...readFileSync(themeFile, 'utf8').matchAll(/^\s*(--[a-z-]+):/gm)].map((m) => m[1]));
    const used = [...new Set(stylesheets(src).flatMap((file) => [...readFileSync(file, 'utf8').matchAll(/var\((--[a-z-]+)\)/g)].map((m) => m[1]!)))];
    // A var() with a fallback is a property the component sets on its own elements (QuestUILayer's --border)
    expect(used.filter((role) => !defined.has(role))).toEqual([]);
  });
});
