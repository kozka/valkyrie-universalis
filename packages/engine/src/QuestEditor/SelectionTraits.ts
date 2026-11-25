// Ported from Valkyrie (Apache-2.0), modified: unity/Assets/Scripts/UI/UIWindowSelectionListTraits.cs
// The items of a selection window with traits, their trait groups, and which items it shows (TraitGroup.ActiveItem and
// the search box); the window itself is the app's (editor/Chooser.tsx). Not in Valkyrie: the search box also looks in
// the names, and picking two sources shows what is in either, where Valkyrie's window asks an item to be in every
// source picked and shows nothing.
import { CommonStringKeys } from '../Content/CommonStringKeys.ts';
import type { GenericData } from '../Content/ContentTypes.ts';
import type { QuestData } from '../Content/QuestData.ts';
import { StringKey } from '../Content/StringKey.ts';
import { Game } from '../Game.ts';

/** An item of a selection window. */
export interface SelectionItem {
  /** What picking it writes. */
  key: string;
  /** What the window shows. */
  display: string;
  /** Its traits by group, both as the window shows them (translated): Source (its packs), Traits. */
  traits: Map<string, string[]>;
  /** Shown as taken, as Valkyrie colours a tile side that is already on the board. */
  used?: boolean;
  /** Listed first whatever the order, as a new component is (alwaysOnTop). */
  onTop?: boolean;
}

export interface SelectionTrait {
  selected: boolean;
  excluded: boolean;
}

export interface SelectionTraitGroup {
  name: string;
  traits: Map<string, SelectionTrait>;
}

/** A pack as the windows name it: Base for content of none. */
function packName(set: string): string {
  return set.length === 0 ? CommonStringKeys.BASE.translate() : new StringKey('val', set).translate();
}

/** A content item: its translated name, its section name, and its packs and traits. */
// Valkyrie: UIWindowSelectionListTraits.cs UIWindowSelectionListTraits.CreateItem
export function contentItem(data: GenericData, used = false): SelectionItem {
  return {
    key: data.sectionName,
    display: data.name.translate(),
    traits: new Map([
      [CommonStringKeys.SOURCE.translate(), data.sets.map(packName)],
      [CommonStringKeys.TRAITS.translate(), data.traits.map((t) => new StringKey('val', t).translate())],
    ]),
    used,
  };
}

/** A component of the scenario: its name, its type and the file it is in as its source. */
// Valkyrie: UIWindowSelectionListTraits.cs UIWindowSelectionListTraits.AddItem(QuestData.QuestComponent)
export function componentItem(qc: QuestData.QuestComponent): SelectionItem {
  return {
    key: qc.sectionName,
    display: qc.sectionName,
    traits: new Map([
      [CommonStringKeys.TYPE.translate(), [new StringKey('val', qc.typeDynamic.toUpperCase()).translate()]],
      [CommonStringKeys.SOURCE.translate(), [qc.source]],
    ]),
  };
}

/** A new component of a type ({NEW:Type}), listed first. */
// Valkyrie: UIWindowSelectionListTraits.cs UIWindowSelectionListTraits.AddNewComponentItem
export function newComponentItem(type: string): SelectionItem {
  const named = new StringKey('val', type.toUpperCase());
  return {
    key: '{NEW:' + type + '}',
    display: new StringKey('val', 'NEW_X', named).translate(),
    traits: new Map([
      [CommonStringKeys.TYPE.translate(), [named.translate()]],
      [CommonStringKeys.SOURCE.translate(), [CommonStringKeys.NEW.translate()]],
    ]),
    onTop: true,
  };
}

/** A file of the scenario's folder, as the picture windows list them (EditorComponent.SetCustomImage). */
export function fileItem(path: string): SelectionItem {
  return { key: path, display: path, traits: new Map([[CommonStringKeys.SOURCE.translate(), [CommonStringKeys.FILE.translate()]]]) };
}

/** Lower case without accents, so that a search finds "Callejón" with "callejon". */
function folded(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
}

export class SelectionTraits {
  readonly items: readonly SelectionItem[];
  readonly groups: SelectionTraitGroup[] = [];
  private readonly source = CommonStringKeys.SOURCE.translate();

  // Valkyrie: UIWindowSelectionListTraits.cs UIWindowSelectionListTraits.Draw (the trait groups, in the order met)
  constructor(items: readonly SelectionItem[]) {
    this.items = items;
    for (const item of items) {
      for (const [category, values] of item.traits) {
        let group = this.groups.find((g) => g.name === category);
        if (group === undefined) {
          group = { name: category, traits: new Map() };
          this.groups.push(group);
        }
        for (const value of values) if (!group.traits.has(value)) group.traits.set(value, { selected: false, excluded: false });
      }
    }
  }

  /** The window opens on the source of what is chosen now: its first pack, base when it has none. */
  // Valkyrie: EditorComponentTile.cs EditorComponentTile.ChangeTileSide (Auto selection of source)
  static sourceOf(data: GenericData): string {
    const set = data.sets[0] ?? '';
    return new StringKey('val', set.length === 0 ? 'base' : set).translate();
  }

  /**
   * The loaded packs that the quest does not ask for start left out. Not in Valkyrie: nor is the game's own base pack
   * (MoMBase, D2EBase), which Valkyrie's check, made for a pack called base, leaves out, so that a window that does not
   * open on the current choice's pack (a spawn's monsters) showed nothing of the base game.
   */
  // Valkyrie: UIWindowSelectionListTraits.cs UIWindowSelectionListTraits.ExcludeExpansions
  excludeExpansions(): void {
    const game = Game.get();
    for (const pack of game.cd.getLoadedPackIDs()) {
      const required = pack === '' || pack.toLowerCase() === 'base' || pack === game.gameType.baseContentPackId() || game.currentQuest!.qd.quest.packs.includes(pack);
      if (!required) this.toggleExcluded(this.source, new StringKey('val', pack).translate());
    }
  }

  private trait(group: string, trait: string): SelectionTrait | undefined {
    return this.groups.find((g) => g.name === group)?.traits.get(trait);
  }

  isSelected(group: string, trait: string): boolean {
    return this.trait(group, trait)?.selected === true;
  }

  isExcluded(group: string, trait: string): boolean {
    return this.trait(group, trait)?.excluded === true;
  }

  // Valkyrie: UIWindowSelectionListTraits.cs UIWindowSelectionListTraits.ToggleTraitSelectState
  toggleSelected(group: string, trait: string): void {
    const t = this.trait(group, trait);
    if (t === undefined) return;
    t.selected = !t.selected;
    t.excluded = false;
  }

  // Valkyrie: UIWindowSelectionListTraits.cs UIWindowSelectionListTraits.ExcludeTrait
  toggleExcluded(group: string, trait: string): void {
    const t = this.trait(group, trait);
    if (t === undefined) return;
    t.excluded = !t.excluded;
    t.selected = false;
  }

  /**
   * Whether an item passes a group: in Source, one of its packs picked, or none picked and one of its packs not left
   * out; in the others, every trait picked and none left out. An item with no trait of the group passes it only when
   * nothing of it is picked, and never in Source.
   */
  // Valkyrie: UIWindowSelectionListTraits.cs TraitGroup.ActiveItem
  private activeIn(group: SelectionTraitGroup, item: SelectionItem): boolean {
    const own = item.traits.get(group.name) ?? [];
    const picked = [...group.traits].filter(([, t]) => t.selected).map(([name]) => name);
    if (group.name === this.source) {
      if (picked.length > 0) return own.some((name) => group.traits.get(name)!.selected);
      return own.some((name) => !group.traits.get(name)!.excluded);
    }
    if (!picked.every((name) => own.includes(name))) return false;
    return !own.some((name) => group.traits.get(name)!.excluded);
  }

  active(item: SelectionItem): boolean {
    return this.groups.every((g) => this.activeIn(g, item));
  }

  /**
   * How many items picking a trait would show: none greys it, as in Valkyrie's window. A source counts what the other
   * groups let through, since picking it adds its items to those of the sources picked.
   */
  count(group: string, trait: string): number {
    const groups = group === this.source ? this.groups.filter((g) => g.name !== group) : this.groups;
    return this.items.filter((item) => item.traits.get(group)?.includes(trait) === true && groups.every((g) => this.activeIn(g, item))).length;
  }

  /** The items shown for a search, in the content's order or by name. */
  // Valkyrie: UIWindowSelectionListTraits.cs UIWindowSelectionListTraits.DrawItemList and DrawItem
  visible(search = '', byName = false): SelectionItem[] {
    const wanted = folded(search.trim());
    const shown = this.items.filter((item) => this.active(item) && (wanted === '' || folded(item.key).includes(wanted) || folded(item.display).includes(wanted)));
    const sorted = byName ? [...shown].sort((a, b) => a.display.localeCompare(b.display)) : shown;
    return [...sorted.filter((item) => item.onTop === true), ...sorted.filter((item) => item.onTop !== true)];
  }
}
