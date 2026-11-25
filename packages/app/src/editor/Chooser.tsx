// Valkyrie's selection windows with sources and traits (UIWindowSelectionListTraits, UIWindowSelectionListImage), as a
// window over the editor: a search box, the sources and traits to pick or leave out, and the items, with their
// pictures when the import has them. Which items it shows is the engine's (QuestEditor/SelectionTraits.ts). Not
// ported from Valkyrie, whose windows are drawn with Unity.
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  CommonStringKeys,
  Game,
  ImageData,
  MonsterData,
  Path,
  PuzzleData,
  SelectionTraits,
  TileSideData,
  TokenData,
  type SelectionItem,
} from '@universalis/engine';
import { Picture } from '../ui/Picture.tsx';
import { edi } from './text.ts';

/** The picture of a choice, looked for as Valkyrie's image window looks for it: content first, then the scenario's files. */
// Valkyrie: UIWindowSelectionListImage.cs UIWindowSelectionListImage.GetTexture
export function choicePicture(key: string): string | null {
  const game = Game.get();
  const cd = game.cd;
  if (cd.containsKey(TokenData, key)) return cd.get(TokenData, key).image;
  if (cd.containsKey(MonsterData, key)) return cd.get(MonsterData, key).image;
  if (cd.containsKey(PuzzleData, key)) return cd.get(PuzzleData, key).image;
  if (cd.containsKey(ImageData, key)) return cd.get(ImageData, key).image;
  if (cd.containsKey(TileSideData, key)) return cd.get(TileSideData, key).image;
  const quest = game.currentQuest;
  if (quest === null || key.length === 0) return null;
  return Path.getDirectoryName(quest.qd.questPath) + '/' + key;
}

/** A picture drawn once it comes near the screen: a list can hold hundreds. */
function LazyPicture({ file, name }: { file: string; name: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [near, setNear] = useState(false);
  useEffect(() => {
    const element = ref.current;
    if (element === null || near) return;
    if (typeof IntersectionObserver === 'undefined') {
      setNear(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        setNear(true);
        observer.disconnect();
      },
      { rootMargin: '200px' },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [near]);
  return (
    <span ref={ref} className="editor-choice-picture">
      {near && <Picture file={file} name={name} decorative />}
    </span>
  );
}

export interface ChooserProps {
  title: string;
  items: SelectionItem[];
  /** What is chosen now, marked in the list. */
  current?: string;
  /** The source it opens on, as Valkyrie's windows open on the source of what is chosen. */
  openOn?: string | null;
  /** Whether the packs the quest does not ask for start left out (ExcludeExpansions). */
  excludeExpansions?: boolean;
  /** Whether the items show their pictures (UIWindowSelectionListImage). */
  pictures?: boolean;
  onPick: (key: string) => void;
  onClose: () => void;
}

export function Chooser({ title, items, current, openOn = null, excludeExpansions = false, pictures = false, onPick, onClose }: ChooserProps) {
  const traits = useMemo(() => {
    const t = new SelectionTraits(items);
    if (excludeExpansions) t.excludeExpansions();
    if (openOn !== null) t.toggleSelected(CommonStringKeys.SOURCE.translate(), openOn);
    return t;
  }, [items, excludeExpansions, openOn]);
  const [, setRevision] = useState(0);
  const redraw = () => setRevision((r) => r + 1);
  const [search, setSearch] = useState('');
  const [byName, setByName] = useState(false);
  const shown = traits.visible(search, byName);
  return (
    <div
      className="editor-chooser-layer"
      onKeyDown={(e) => {
        if (e.key !== 'Escape') return;
        e.stopPropagation();
        onClose();
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <section className="editor-chooser" role="dialog" aria-modal="true" aria-labelledby="editor-chooser-title">
        <header className="editor-chooser-head">
          <h2 id="editor-chooser-title">{title}</h2>
          <input
            type="search"
            autoFocus
            placeholder={edi('EDITOR_SEARCH_CHOICES')}
            aria-label={edi('EDITOR_SEARCH_CHOICES')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && shown.length > 0) onPick(shown[0]!.key);
            }}
          />
          <button type="button" className="editor-back" aria-pressed={byName} title={edi('EDITOR_SORT_BY_NAME')} aria-label={edi('EDITOR_SORT_BY_NAME')} onClick={() => setByName(!byName)}>
            A–Z
          </button>
          <button type="button" className="editor-back" aria-label={CommonStringKeys.CLOSE.translate()} title={CommonStringKeys.CLOSE.translate()} onClick={onClose}>
            ✕
          </button>
        </header>
        <div className="editor-chooser-body">
          <div className="editor-chooser-traits">
            {traits.groups.map((group) => {
              const noneSelected = [...group.traits.values()].every((t) => !t.selected);
              return (
                <section key={group.name} aria-label={group.name}>
                  <h3>{group.name}</h3>
                  <ul>
                    {[...group.traits].map(([name, trait]) => {
                      const count = traits.count(group.name, name);
                      return (
                        <li key={name} className="editor-inline">
                          <button
                            type="button"
                            className="editor-trait"
                            aria-pressed={trait.selected}
                            data-excluded={trait.excluded || undefined}
                            data-dim={!noneSelected && !trait.selected ? true : undefined}
                            disabled={!trait.selected && !trait.excluded && count === 0}
                            onClick={() => {
                              traits.toggleSelected(group.name, name);
                              redraw();
                            }}
                          >
                            <span className="editor-trait-name">{name}</span>
                            <span className="editor-trait-count">{count}</span>
                          </button>
                          <button
                            type="button"
                            className="editor-back editor-trait-out"
                            aria-pressed={trait.excluded}
                            aria-label={edi('EDITOR_LEAVE_OUT', name)}
                            title={edi('EDITOR_LEAVE_OUT', name)}
                            onClick={() => {
                              traits.toggleExcluded(group.name, name);
                              redraw();
                            }}
                          >
                            ✕
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              );
            })}
          </div>
          <ul className="editor-chooser-items" aria-label={title}>
            {shown.length === 0 && <li className="quiet">{edi('EDITOR_NO_CHOICES')}</li>}
            {shown.map((item) => {
              const file = pictures ? choicePicture(item.key) : null;
              return (
                <li key={item.key}>
                  <button type="button" className="editor-choice" aria-current={item.key === current ? true : undefined} data-used={item.used === true ? true : undefined} onClick={() => onPick(item.key)}>
                    {file !== null && <LazyPicture file={file} name={item.display} />}
                    <span className="editor-choice-name">{item.display}</span>
                    {item.display !== item.key && <span className="editor-choice-key">{item.key}</span>}
                    {item.used === true && <span className="editor-choice-used">{edi('EDITOR_TAKEN')}</span>}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </section>
    </div>
  );
}
