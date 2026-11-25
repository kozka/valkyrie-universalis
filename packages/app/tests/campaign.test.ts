// The adventures of a campaign in the editor (src/editor/campaign.ts): the campaign a quest's folder belongs to, the
// editor's list with each adventure under its campaign, and the quests a change of quest can go to. Not ported from
// Valkyrie, whose editor lists a campaign's adventures as scenarios of their own (QuestLoader.GetUserUnpackedQuests).
import { beforeEach, describe, expect, it } from 'vitest';
import { File, VirtualFileSystem, setFileSystem, type QuestData } from '@universalis/engine';
import { byCampaign, campaignOf, pathFrom, questChanges, samePath } from '../src/editor/campaign.ts';

const EDITOR = '/AppData/Valkyrie/D2E/Editor';
const QUESTS = ['Camp', 'Camp/First', 'Camp/Second', 'Camp/Second/Deeper', 'Alone', 'Folder/Inside'];

/** A quest of the editor's list, as far as the list reads it: its folder, and no texts of its own. */
function listed(folder: string): { key: string; quest: QuestData.Quest } {
  return { key: folder, quest: { path: `${EDITOR}/${folder}`, localizationDict: null } as unknown as QuestData.Quest };
}

describe('campaign', () => {
  beforeEach(() => {
    setFileSystem(new VirtualFileSystem());
    for (const quest of QUESTS) File.writeAllText(`${EDITOR}/${quest}/quest.ini`, '[Quest]\r\n');
  });

  it('SamePath_IgnoresSlashesAndLetterCase', () => {
    expect(samePath(`${EDITOR}/Camp`, `${EDITOR.toLowerCase()}\\camp\\`)).toBe(true);
    expect(samePath(`${EDITOR}/Camp`, `${EDITOR}/Camp/First`)).toBe(false);
    expect(pathFrom(`${EDITOR}/Camp`, `${EDITOR}/Camp/Second/Deeper`)).toBe('Second/Deeper');
    expect(pathFrom(`${EDITOR}/Camp`, `${EDITOR}/Camp`)).toBe('');
  });

  it('CampaignOf_TheOutermostFolderAboveWithAQuest', () => {
    expect(campaignOf(`${EDITOR}/Camp/Second/Deeper`)).toBe(`${EDITOR}/Camp`);
    expect(campaignOf(`${EDITOR}/Camp`)).toBe(`${EDITOR}/Camp`);
    // A folder without a quest.ini is no campaign
    expect(campaignOf(`${EDITOR}/Folder/Inside`)).toBe(`${EDITOR}/Folder/Inside`);
  });

  it('ByCampaign_PutsEachAdventureUnderItsCampaign', () => {
    const rows = byCampaign(QUESTS.map(listed));
    expect(rows.map((r) => [r.entry.key, r.adventures.map((a) => [a.folder, a.name])])).toEqual([
      ['Camp', [['First', 'First'], ['Second', 'Second'], ['Second/Deeper', 'Second/Deeper']]],
      ['Alone', []],
      ['Folder/Inside', []],
    ]);
    // One whose campaign the list does not have (of another game, or not valid) is listed as Valkyrie lists it
    expect(byCampaign(['Camp/First', 'Alone'].map(listed)).map((r) => r.entry.key)).toEqual(['Alone', 'Camp/First']);
  });

  it('QuestChanges_TheCampaignsOtherQuestsFromItsFolder', () => {
    expect(questChanges(`${EDITOR}/Camp`, `${EDITOR}/Camp/First`)).toEqual(['quest.ini', 'Second/quest.ini', 'Second/Deeper/quest.ini']);
    expect(questChanges(`${EDITOR}/Alone`, `${EDITOR}/Alone`)).toEqual([]);
  });
});
