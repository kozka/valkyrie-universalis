// Ported from Valkyrie (Apache-2.0), modified: libraries/ValkyrieTools/IniRead.cs
import { File } from '../platform/SystemIO.ts';
import { dictAdd, split, trim } from '../platform/CSharp.ts';
import { ValkyrieDebug } from './ValkyrieDebug.ts';

/** `s.Trim()[0]`, which throws in C# when the line holds only white space. */
function firstTrimmedChar(line: string): string {
  const trimmed = trim(line);
  if (trimmed.length === 0) throw new RangeError('IndexOutOfRangeException: Index was outside the bounds of the array.');
  return trimmed[0]!;
}

// Helper class to read an ini file into a nested dictionary
// Valkyrie: IniRead.cs IniRead
export class IniRead {
  /** Function takes path to ini file and returns data object. Returns null on error. */
  // Valkyrie: IniRead.cs IniRead.ReadFromIni(string)
  static readFromIni(path: string): IniData | null {
    let lines: string[];
    // Read the whole file
    try {
      lines = File.readAllLines(path);
    } catch (ex) {
      ValkyrieDebug.log(ex instanceof Error ? ex.message : String(ex));
      return null;
    }
    // Parse text data
    return IniRead.readFromStringArray(lines, path);
  }

  /** Function takes path to ini file and section name. Returns section as dictionary, empty if not found, null on error. */
  // Valkyrie: IniRead.cs IniRead.ReadFromIni(string, string)
  static readFromIniSection(path: string, section: string): Map<string, string> | null {
    let lines: string[];
    try {
      lines = File.readAllLines(path);
    } catch {
      return null;
    }
    return IniRead.readFromStringArraySection(lines, path, section);
  }

  /** Function takes ini file contents as a string and returns data object. */
  // Valkyrie: IniRead.cs IniRead.ReadFromString
  static readFromString(content: string): IniData {
    // split text into array of lines
    const lines = split(content, ['\r', '\n'], undefined, true);
    return IniRead.readFromStringArray(lines, '<INTERNAL>');
  }

  /** Parse ini data into data structure. */
  // Valkyrie: IniRead.cs IniRead.ReadFromStringArray(string[], string)
  static readFromStringArray(lines: readonly string[], path: string): IniData {
    // Create a dictionary for the first section
    let entryData = new Map<string, string>();
    // Name for the current section
    let entryName = '';
    // Create object to hold output
    const output = new IniData();

    // Parse all lines
    for (const l of lines) {
      // ignore comments
      if (l.length > 0 && firstTrimmedChar(l) === '#') continue;

      // Start of new section
      if (l.length > 0 && firstTrimmedChar(l) === '[') {
        // If not first section, add the last section of data
        if (entryName !== '') {
          if (!output.add(entryName, entryData)) {
            ValkyrieDebug.log('Warning: duplicate section "' + entryName + '" in ' + path + ' will be ignored.');
          }
        }
        // create new data for new section
        entryData = new Map<string, string>();
        // Get name of new section
        entryName = trim(trim(l), '[', ']');
        // Blank section names not allowed, but not fatal
        if (entryName === '') {
          ValkyrieDebug.log('Warning: empty section in ' + path + ' will be ignored.');
        }
      }
      // If the line is not a comment (starts with ;)
      else if (l.length > 0 && firstTrimmedChar(l) !== ';') {
        const equalsLocation = l.indexOf('=');
        // Add data as entry with no value
        if (equalsLocation === -1) {
          if (entryData.has(trim(l))) {
            ValkyrieDebug.log('Warning: duplicate "' + trim(l) + '" data in section "' + entryName + '" in ' + path + ' will be ignored.');
          } else {
            entryData.set(trim(l), '');
          }
        }
        // If there is an = add data as key and value
        else {
          const key = trim(l.substring(0, equalsLocation));
          if (entryData.has(key)) {
            ValkyrieDebug.log('Warning: duplicate "' + key + '" data in section "' + entryName + '" in ' + path + ' will be ignored.');
          } else {
            const value = trim(trim(l.substring(equalsLocation + 1)), '"');
            entryData.set(key, value);
          }
        }
        // This won't go anywhere if we don't have a section
        if (entryName === '') {
          ValkyrieDebug.log('Warning: data ' + l + ' without section in ' + path + ' will be ignored.');
        }
      }
    }

    // Add the last section
    if (entryName !== '') {
      if (!output.add(entryName, entryData)) {
        ValkyrieDebug.log('Warning: duplicate section "' + entryName + '" in ' + path + ' will be ignored.');
      }
    }

    return output;
  }

  /** Parse one section of ini data. Unlike the full parser, '#' lines are not comments and a duplicate key with no '=' throws. */
  // Valkyrie: IniRead.cs IniRead.ReadFromStringArray(string[], string, string)
  static readFromStringArraySection(lines: readonly string[], _path: string, section: string): Map<string, string> {
    // Create a dictionary for the section
    const entryData = new Map<string, string>();

    let found = false;
    let end = false;
    let i = 0;
    const find = '[' + section + ']';
    while (!end && i < lines.length) {
      const line = lines[i]!;
      if (found) {
        if (line.indexOf('[') === 0) {
          end = true;
        } else {
          // If the line is not a comment (starts with ;)
          if (line.length > 0 && firstTrimmedChar(line) !== ';') {
            const equalsLocation = line.indexOf('=');
            // Add data as entry with no value
            if (equalsLocation === -1) {
              dictAdd(entryData, trim(line), '');
            }
            // If there is an = add data as key and value
            else {
              const key = trim(line.substring(0, equalsLocation));
              if (!entryData.has(key)) {
                const value = trim(trim(line.substring(equalsLocation + 1)), '"');
                entryData.set(key, value);
              }
            }
          }
        }
      }
      if (line.indexOf(find) === 0) {
        found = true;
      }
      i++;
    }
    return entryData;
  }
}

// Class to store data read from ini
// Valkyrie: IniRead.cs IniData
export class IniData {
  // Dict of Dict to hold all data
  data = new Map<string, Map<string, string>>();

  /** Add new data, returns false on collision. */
  add(name: string, dict: Map<string, string>): boolean;
  /** Add new data, appends to data or replaces if exists. */
  add(section: string, name: string, value: string): void;
  // Valkyrie: IniRead.cs IniData.Add
  add(nameOrSection: string, dictOrName: Map<string, string> | string, value?: string): boolean | void {
    if (dictOrName instanceof Map) {
      if (this.data.has(nameOrSection)) return false;
      this.data.set(nameOrSection, dictOrName);
      return true;
    }
    let section = this.data.get(nameOrSection);
    if (!section) {
      section = new Map<string, string>();
      this.data.set(nameOrSection, section);
    }
    // Remove followed by Add reuses the same slot in a .NET Dictionary, so the key keeps its place
    section.set(dictOrName, value ?? '');
  }

  /** Remove an item by section and name, or a whole section by name. */
  // Valkyrie: IniRead.cs IniData.Remove
  remove(section: string, name?: string): void {
    if (!this.data.has(section)) return;
    if (name === undefined) {
      this.data.delete(section);
      return;
    }
    this.data.get(section)!.delete(name);
  }

  /** Get section data, returns null if not found. */
  get(section: string): Map<string, string> | null;
  /** Get string by section and item, "" if not found. */
  get(section: string, item: string): string;
  // Valkyrie: IniRead.cs IniData.Get
  get(section: string, item?: string): Map<string, string> | string | null {
    const sectionData = this.data.get(section);
    if (item === undefined) return sectionData ?? null;
    if (!sectionData) return '';
    return sectionData.get(item) ?? '';
  }

  // output the ini data back to a string
  // Valkyrie: IniRead.cs IniData.ToString (Environment.NewLine is CR LF, as on Windows)
  toString(): string {
    const nl = '\r\n';
    let r = '';
    for (const [key, values] of this.data) {
      r += '[' + key + ']' + nl;
      for (const [itemKey, itemValue] of values) {
        r += itemKey;
        if (itemValue.length > 0) {
          r += '=' + itemValue;
        }
        r += nl;
      }
      r += nl;
    }
    return r;
  }
}
