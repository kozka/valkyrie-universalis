// Ported from Valkyrie (Apache-2.0), modified: unity/Assets/Scripts/QuestEditor/ReorderComponents.cs
// The list of a file's components and its arrows are drawn by the app; this keeps the files offered and the move.
import { PerilData } from '../Content/PerilData.ts';
import type { QuestData } from '../Content/QuestData.ts';
import { Game } from '../Game.ts';
import { dictAdd, dictGet } from '../platform/CSharp.ts';

// Valkyrie: ReorderComponents.cs ReorderComponents
export const ReorderComponents = {
  /** The files to choose from: each component's source, in the order they first appear. */
  // Valkyrie: ReorderComponents.cs ReorderComponents.ReorderComponents
  sources(): string[] {
    const sources = new Set<string>();
    for (const c of Game.get().currentQuest!.qd.components.values()) {
      if (!(c instanceof PerilData)) sources.add(c.source);
    }
    return [...sources];
  },

  /** The names of a file's components, in their order. */
  // Valkyrie: ReorderComponents.cs ReorderComponents.Draw (the names listed)
  componentsOf(source: string): string[] {
    const names: string[] = [];
    for (const c of Game.get().currentQuest!.qd.components.values()) {
      if (c.source === source) names.push(c.sectionName);
    }
    return names;
  },

  /** Moves the component one place up among the components of its file. */
  // Valkyrie: ReorderComponents.cs ReorderComponents.IncComponent
  incComponent(name: string): void {
    const game = Game.get();
    const components = game.currentQuest!.qd.components;
    const preDict = new Map<string, QuestData.QuestComponent>();
    let postList: QuestData.QuestComponent[] = [];
    for (const c of components.values()) {
      if (c.sectionName === name) {
        dictAdd(preDict, c.sectionName, c);
      } else {
        if (c.source === dictGet(components, name).source) {
          for (const post of postList) {
            dictAdd(preDict, post.sectionName, post);
          }
          postList = [];
        }
        postList.push(c);
      }
    }

    for (const post of postList) {
      dictAdd(preDict, post.sectionName, post);
    }

    game.currentQuest!.qd.components = preDict;
  },
};
