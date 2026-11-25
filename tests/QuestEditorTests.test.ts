// Tests of the scenario editor's rules (QuestEditor, QuestEditorData, EditorComponent, ReorderComponents, EditorTools,
// QuestEditSelection and ToolsButton), written from Valkyrie's C#, which has no NUnit tests for its editor, and of
// what Universalis adds (QuestEditorHistory, QuestEditorVersions and the checked save).
// Not ported from Valkyrie. They use the battery's setting (all MoM base packs) and a small quest written here.
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  Application,
  ComponentText,
  Directory,
  EditorComponent,
  EditorComponentActivation,
  EditorComponentCustomMonster,
  EditorComponentDoor,
  EditorComponentEvent,
  EditorComponentItem,
  EditorComponentMPlace,
  EditorComponentPuzzle,
  EditorComponentQuest,
  EditorComponentSpawn,
  EditorComponentTile,
  EditorComponentToken,
  EditorComponentUI,
  EditorComponentVarTestsUtil,
  EditorTools,
  EventManager,
  File,
  Game,
  GameMenu,
  HeadlessUI,
  type GameObject,
  type Problem,
  LocalizationRead,
  ProblemFixes,
  QUEST_SELECTION,
  QuestData,
  QuestEditSelection,
  QuestEditor,
  QuestEditorData,
  QuestEditorHistory,
  QuestEditorTexts,
  QuestEditorVersions,
  Random,
  ReorderComponents,
  SearchOption,
  SelectionTraits,
  StringKey,
  TileSideData,
  ToolsButton,
  ValkyrieDebug,
  problemSignature,
  readZipDirectory,
  readZipEntry,
  sha256,
  bitConverterToString,
} from '@universalis/engine';
import { createEnvironment, type Environment } from '../tools/battery/environment.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const EDITOR = '/AppData/Valkyrie/MoM/Editor';
const QUEST = EDITOR + '/EditTest';
const VERSIONS = '/AppData/Valkyrie/MoM/EditorVersions/EditTest';
const NL = '\r\n';

const QUEST_INI = ['[Quest]', 'format=19', 'type=MoM', 'defaultlanguage=English', 'minhero=1', 'maxhero=4', 'image=img/cover.jpg', '', '[QuestText]', 'Localization.English.txt', 'Localization.Spanish.txt', '', '[QuestData]', 'events.ini', 'tiles.ini', ''].join(NL);

const ENGLISH = [
  '.,English',
  '// a comment',
  'quest.name,Edit test',
  'quest.description,"First line\\nsecond ""quoted"""',
  'EventStart.text,Hello',
  'EventStart.button1,Go',
  'EventA.text,A',
  'EventA.button1,Back',
  'TokenLook.text,Look',
  '',
].join(NL);

const SPANISH = ['.,Spanish', 'quest.name,Prueba', 'EventStart.text,Hola', ''].join(NL);

const EVENTS = [
  '[EventStart]',
  'trigger=EventStart',
  'buttons=1',
  'event1=EventA',
  'add=TileHall TokenLook',
  '',
  '[EventA]',
  'buttons=1',
  'event1=EventStart',
  'remove=TokenLook',
  '',
  '[TokenLook]',
  'type=TokenSearch',
  'xposition=2',
  'yposition=1',
  'buttons=1',
  'event1=EventA',
  '',
].join(NL);

const TILES = ['[TileHall]', 'side=TileSideAlley1', 'xposition=0', 'yposition=0', ''].join(NL);

let env: Environment;
let ui: HeadlessUI;
let log: string[];
let stopLog: () => void;

function writeQuest(folder = QUEST, english = ENGLISH): void {
  if (Directory.exists(folder)) Directory.delete(folder, true);
  File.writeAllText(folder + '/quest.ini', QUEST_INI);
  File.writeAllText(folder + '/Localization.English.txt', english);
  File.writeAllText(folder + '/Localization.Spanish.txt', SPANISH);
  File.writeAllText(folder + '/events.ini', EVENTS);
  File.writeAllText(folder + '/tiles.ini', TILES);
  File.writeAllBytes(folder + '/img/cover.jpg', new Uint8Array([0xff, 0xd8, 0xff, 0xd9]));
}

/** Writes the quest and opens it in the editor, as QuestEditSelection.Selection does. */
function edit(folder = QUEST, english = ENGLISH): QuestData {
  writeQuest(folder, english);
  Game.get().qed = null;
  QuestEditor.begin(folder);
  return Game.get().currentQuest!.qd;
}

/** A trait as the selection window names it (translated, as Valkyrie's window shows it). */
function alleyTrait(window: SelectionTraits, trait: string): string {
  const named = new StringKey('val', trait).translate();
  expect(window.groups.find((g) => g.name === 'Traits')!.traits.has(named)).toBe(true);
  return named;
}

function names(): string[] {
  return [...Game.get().currentQuest!.qd.components.keys()];
}

function texts(language: string): Map<string, string> {
  return LocalizationRead.selectDictionary('qst')!.allEntries().get(language)!;
}

describe('QuestEditorTests', () => {
  beforeAll(() => {
    env = createEnvironment('MoM', join(root, 'packages', 'engine', 'data'), []);
  }, 120_000);

  beforeEach(() => {
    ui = new HeadlessUI();
    env.game.ui = ui;
    Application.fatalErrors.length = 0;
    Random.initState(1);
    log = [];
    stopLog = ValkyrieDebug.onLog((message) => {
      if (message) log.push(message);
    });
  });

  afterEach(() => {
    stopLog();
    vi.restoreAllMocks();
    QuestEditorVersions.keep = 20;
    QuestEditorVersions.now = () => Date.now();
  });

  it('Begin_OpensTheQuestInEditModeAtTheQuestComponent', () => {
    const qd = edit();
    const game = Game.get();
    expect(game.editMode).toBe(true);
    expect(names()).toEqual(['EventStart', 'EventA', 'TokenLook', 'TileHall']);
    expect(qd.quest.format).toBe(19);
    expect(game.qed!.selection).toBe(QUEST_SELECTION);
    expect(Application.fatalErrors).toEqual([]);
  });

  it('Save_WritesTheQuestFileAsValkyrie', () => {
    edit();
    const version = Game.get().version;
    QuestEditor.save();
    expect(File.readAllText(QUEST + '/quest.ini')).toBe(
      [
        '; Saved by version: ' + version,
        '[Quest]',
        'format=21',
        'hidden=False',
        'type=MoM',
        'defaultlanguage=English',
        'defaultmusicon=True',
        'minhero=1',
        'maxhero=4',
        'image=img/cover.jpg',
        '',
        '',
        '[QuestText]',
        'Localization.English.txt',
        'Localization.Spanish.txt',
        '',
        '[QuestData]',
        'events.ini',
        'tiles.ini',
        '',
      ].join(NL),
    );
    const events = File.readAllText(QUEST + '/events.ini');
    expect(events.startsWith('; Saved by version: ' + version + NL + NL + '[EventStart]' + NL)).toBe(true);
    expect(events).toContain(NL + NL + '[EventA]' + NL);
    expect(events).toContain(NL + NL + '[TokenLook]' + NL);
    expect(events.replace(/\r\n/g, '')).not.toContain('\n');
    expect(File.readAllText(QUEST + '/tiles.ini')).toBe(['; Saved by version: ' + version, '', '[TileHall]', 'xposition=0', 'yposition=0', 'side=TileSideAlley1', ''].join(NL));
    expect(QuestEditor.lastSaveProblems).toEqual([]);
    // Read back as Reload reads it, it saves the same
    expect(QuestEditor.lastSaveUnstable).toEqual([]);
  });

  it('Save_KeepsTheFilesItReplacesAsAVersion', () => {
    // Not in Valkyrie, whose editor writes over them
    QuestEditorVersions.forget(QUEST);
    edit();
    QuestEditorVersions.now = () => 1000;
    QuestEditor.save();
    const [first, ...others] = QuestEditorVersions.list(QUEST);
    expect(others).toEqual([]);
    expect(first).toEqual({ path: VERSIONS + '/1000.zip', time: 1000 });
    // Its .ini and Localization.*.txt files, never its pictures
    expect(QuestEditorVersions.filesOf(first!.path)).toEqual(['Localization.English.txt', 'Localization.Spanish.txt', 'events.ini', 'quest.ini', 'tiles.ini']);

    // Saved again with nothing changed: no new version
    QuestEditorVersions.now = () => 2000;
    QuestEditor.save();
    expect(QuestEditorVersions.list(QUEST).map((v) => v.time)).toEqual([1000]);

    // Changed and saved: the version holds the files as the first save left them
    const saved = File.readAllText(QUEST + '/events.ini');
    QuestEditorData.selectComponent('EventA');
    QuestEditorData.deleteCurrentComponent();
    QuestEditor.save();
    expect(QuestEditorVersions.list(QUEST).map((v) => v.time)).toEqual([2000, 1000]);
    expect(File.readAllText(QUEST + '/events.ini')).not.toContain('[EventA]');

    // Restored: the files of the first version are back, and those it replaced are kept as a version too
    QuestEditorVersions.now = () => 3000;
    QuestEditorVersions.restore(QUEST, VERSIONS + '/1000.zip');
    expect(File.readAllText(QUEST + '/quest.ini')).toBe(QUEST_INI);
    expect(File.readAllText(QUEST + '/events.ini')).toBe(EVENTS);
    expect(QuestEditorVersions.list(QUEST).map((v) => v.time)).toEqual([3000, 2000, 1000]);
    QuestEditorVersions.restore(QUEST, VERSIONS + '/2000.zip');
    expect(File.readAllText(QUEST + '/events.ini')).toBe(saved);
    QuestEditor.reload(QUEST);
    expect(names()).toEqual(['EventStart', 'EventA', 'TokenLook', 'TileHall']);
  });

  it('Save_KeepsOnlyTheNewestVersions', () => {
    QuestEditorVersions.forget(QUEST);
    edit();
    QuestEditorVersions.keep = 3;
    for (let time = 1; time <= 5; time++) {
      QuestEditorVersions.now = () => time;
      LocalizationRead.updateScenarioText('EventA.text', 'Text ' + time);
      QuestEditor.save();
    }
    expect(QuestEditorVersions.list(QUEST).map((v) => v.time)).toEqual([5, 4, 3]);
  });

  it('Save_PutsTheFilesBackWhenTheyWouldNotReadBackTheSame', () => {
    // Not in Valkyrie: what was written is read back as Reload reads it, and it must save the same
    edit();
    QuestEditor.save();
    const before = Directory.getFiles(QUEST, '*', SearchOption.AllDirectories).map((f) => [f, File.readAllText(f)]);
    QuestEditorData.selectComponent('EventA');
    QuestEditorData.deleteCurrentComponent();
    EditorComponent.setSource(Game.get().currentQuest!.qd.components.get('TokenLook')!, 'more.ini');
    vi.spyOn(QuestEditor, 'readBack').mockReturnValueOnce(['events.ini']);
    QuestEditor.save();
    expect(QuestEditor.lastSaveUnstable).toEqual(['events.ini']);
    // The files as they were, and the file the save made is gone
    expect(Directory.getFiles(QUEST, '*', SearchOption.AllDirectories).map((f) => [f, File.readAllText(f)])).toEqual(before);
    expect(File.exists(QUEST + '/more.ini')).toBe(false);
    // What the editor holds is still there, to save once it can be
    expect(names()).not.toContain('EventA');
    QuestEditor.save();
    expect(QuestEditor.lastSaveUnstable).toEqual([]);
    expect(File.readAllText(QUEST + '/more.ini')).toContain('[TokenLook]');
  });

  it('Draft_KeepsWhatIsNotSavedAndTakesItUpAgain', () => {
    // Not in Valkyrie: what the editor holds is kept while it changes, apart from the versions
    QuestEditorVersions.forget(QUEST);
    edit();
    QuestEditorData.selectComponent('EventA');
    QuestEditorData.deleteCurrentComponent();
    LocalizationRead.updateScenarioText('EventStart.text', 'Changed');
    QuestEditorVersions.now = () => 5000;
    QuestEditorVersions.keepDraft(QUEST, QuestEditor.filesToSave());
    expect(QuestEditorVersions.list(QUEST)).toEqual([]);
    expect(QuestEditorVersions.draft(QUEST)).toEqual({ path: VERSIONS + '/draft-5000.zip', time: 5000 });
    // The editor closed without saving: opened again, the files are as they were, and the draft takes the changes up
    QuestEditor.reload(QUEST);
    expect(names()).toContain('EventA');
    expect(QuestEditorHistory.loadFiles(QuestEditorVersions.draftFiles(VERSIONS + '/draft-5000.zip'))).toBe(true);
    expect(names()).toEqual(['EventStart', 'TokenLook', 'TileHall']);
    expect(texts('English').get('EventStart.text')).toBe('Changed');
    expect(File.readAllText(QUEST + '/events.ini')).toBe(EVENTS);
    // A newer one takes its place, and dropped, none is left
    QuestEditorVersions.now = () => 6000;
    QuestEditorVersions.keepDraft(QUEST, QuestEditor.filesToSave());
    expect(QuestEditorVersions.draft(QUEST)!.time).toBe(6000);
    QuestEditorVersions.dropDraft(QUEST);
    expect(QuestEditorVersions.draft(QUEST)).toBeNull();
  });

  it('TextMode_ShowsAComponentAsSaveWritesIt', () => {
    // Not in Valkyrie, whose editor has no text mode
    const qd = edit();
    const event = qd.components.get('EventA')!;
    expect(ComponentText.section(event)).toBe(event.toString().replace(/\r\n$/, ''));
    expect(ComponentText.section(event).split(NL)[0]).toBe('[EventA]');
    expect(ComponentText.texts(event, 'English')).toBe('EventA.text,A\nEventA.button1,Back');
    expect(ComponentText.texts(event, 'Spanish')).toBe('');
  });

  it('TextMode_LoadsTheChangedLinesAsReloadWould', () => {
    const qd = edit();
    const event = qd.components.get('EventA')!;
    const section = ComponentText.section(event).replace('remove=TokenLook', 'remove=TokenLook TileHall') + NL + 'display=false';
    const lines = 'EventA.text,|||Line one\\nLine "two"|||\nEventA.button1,Done';
    expect(ComponentText.check(event, section, lines)).toBeNull();
    expect(ComponentText.apply(event, section, 'English', lines)).toBe(true);
    const now = Game.get().currentQuest!.qd.components.get('EventA') as QuestData.Event;
    expect(now).not.toBe(event);
    expect(now.removeComponents).toEqual(['TokenLook', 'TileHall']);
    expect(now.display).toBe(false);
    expect(texts('English').get('EventA.text')).toBe('Line one\nLine "two"');
    expect(texts('English').get('EventA.button1')).toBe('Done');
    // The rest as it was: the other texts and language, and the order of the components
    expect(texts('English').get('EventStart.text')).toBe('Hello');
    expect(texts('Spanish').get('EventStart.text')).toBe('Hola');
    expect(names()).toEqual(['EventStart', 'EventA', 'TokenLook', 'TileHall']);
    // Saved and opened again, the same
    QuestEditor.save();
    expect(QuestEditor.lastSaveUnstable).toEqual([]);
    QuestEditor.reload(QUEST);
    expect((Game.get().currentQuest!.qd.components.get('EventA') as QuestData.Event).display).toBe(false);
    expect(texts('English').get('EventA.button1')).toBe('Done');
  });

  it('TextMode_RefusesLinesThatAreNotTheComponents', () => {
    const qd = edit();
    const event = qd.components.get('EventA')!;
    expect(ComponentText.check(event, 'buttons=1', '')).toEqual({ key: 'EDITOR_TEXT_HEADER', line: 1 });
    expect(ComponentText.check(event, '[EventB]' + NL + 'buttons=1', '')).toEqual({ key: 'EDITOR_TEXT_HEADER', line: 1 });
    expect(ComponentText.check(event, '; note' + NL + '[EventA]' + NL + 'buttons=1' + NL + '[EventB]', '')).toEqual({ key: 'EDITOR_TEXT_SECTION', line: 4 });
    expect(ComponentText.check(event, '', '')).toEqual({ key: 'EDITOR_TEXT_HEADER', line: 0 });
    expect(ComponentText.check(event, '[EventA]', 'EventB.text,No')).toEqual({ key: 'EDITOR_TEXT_KEY', line: 1 });
    expect(ComponentText.check(event, '[EventA]', '\nEventA.text')).toEqual({ key: 'EDITOR_TEXT_KEY', line: 2 });
    expect(ComponentText.check(event, '  [EventA]  ', 'EventA.text,Yes')).toBeNull();
  });

  it('TextMode_LeavesTheQuestAsItWasWhenValkyrieWouldStop', () => {
    const qd = edit();
    const tile = qd.components.get('TileHall')!;
    // A tile on a side no pack has: Valkyrie stops when it draws it
    expect(ComponentText.apply(tile, ComponentText.section(tile).replace('side=TileSideAlley1', 'side=TileSideNowhere'), 'English', '')).toBe(false);
    expect(Application.fatalErrors).toEqual([]);
    expect((Game.get().currentQuest!.qd.components.get('TileHall') as QuestData.Tile).tileSideName).toBe('TileSideAlley1');
    expect(names()).toEqual(['EventStart', 'EventA', 'TokenLook', 'TileHall']);
  });

  it('TextMode_TheQuestItselfButNotItsFormatOrGame', () => {
    const qd = edit();
    const quest = qd.quest;
    const section = ComponentText.section(quest);
    expect(section.split(NL).slice(0, 4)).toEqual(['[Quest]', 'format=21', 'hidden=False', 'type=MoM']);
    expect(ComponentText.texts(quest, 'English')).toBe('quest.name,Edit test\nquest.description,"First line\\nsecond ""quoted"""');
    // Save writes the format and the game itself
    expect(ComponentText.check(quest, section.replace('type=MoM', 'type=D2E'), '')).toEqual({ key: 'EDITOR_TEXT_FIXED', line: 4 });
    expect(ComponentText.check(quest, section.replace('format=21', 'format=8'), '')).toEqual({ key: 'EDITOR_TEXT_FIXED', line: 2 });
    expect(ComponentText.check(quest, section, 'EventA.text,No')).toEqual({ key: 'EDITOR_TEXT_KEY', line: 1 });
    // One investigator fewer, and other texts
    const more = section.replace('maxhero=4', 'maxhero=3');
    expect(ComponentText.check(quest, more, 'quest.name,Another name')).toBeNull();
    expect(ComponentText.apply(quest, more, 'English', 'quest.name,Another name\nquest.description,Short')).toBe(true);
    const now = Game.get().currentQuest!.qd.quest;
    expect(now.maxHero).toBe(3);
    expect(now.path).toBe(quest.path);
    expect(texts('English').get('quest.name')).toBe('Another name');
    expect(texts('Spanish').get('quest.name')).toBe('Prueba');
    expect(names()).toEqual(['EventStart', 'EventA', 'TokenLook', 'TileHall']);
    QuestEditor.save();
    expect(File.readAllText(QUEST + '/quest.ini')).toContain('maxhero=3');
  });

  it('EventText_ShowsTheDialogAndGivesItAButton', () => {
    edit();
    const qed = Game.get().qed!;
    const event = Game.get().currentQuest!.qd.components.get(qed.newEvent())! as QuestData.Event;
    expect(event.display).toBe(false);
    expect(EditorComponentEvent.dialogText(event)).toBe('');
    // A text shows the dialog, with a button to go on (Valkyrie's Continue)
    EditorComponentEvent.updateText(event, 'Hola');
    expect(event.display).toBe(true);
    expect(event.buttons).toHaveLength(1);
    expect(texts('English').get('Event0.text')).toBe('Hola');
    expect(texts('English').get('Event0.button1')).toBe('Continue');
    expect(EditorComponentEvent.dialogText(event)).toBe('Hola');
    // No text: no dialog, and its text goes
    EditorComponentEvent.updateText(event, '');
    expect(event.display).toBe(false);
    expect(texts('English').has('Event0.text')).toBe(false);
    expect(event.buttons).toHaveLength(1);
  });

  it('EventButtons_LabelColourNextEventsAndTheLastOneGoes', () => {
    const qd = edit();
    const event = qd.components.get('EventA') as QuestData.Event;
    EditorComponentEvent.addButton(event);
    expect(event.buttons).toHaveLength(2);
    expect(texts('English').get('EventA.button2')).toBe('Button2');
    EditorComponentEvent.updateButtonLabel(event, 2, 'Run');
    EditorComponentEvent.updateButtonLabel(event, 2, '');
    expect(texts('English').get('EventA.button2')).toBe('Run');
    EditorComponentEvent.selectButtonColour(event, 2, 'red');
    expect(EditorComponentEvent.colourChoices()).toContain('red');
    // Next events: one there, a new one after it, then the first goes
    EditorComponentEvent.selectAddEvent(event, 0, 2, false, 'EventStart');
    expect(EditorComponentEvent.selectAddEvent(event, 1, 2, false, '{NEW:Event}')).toBe('Event0');
    expect(names()).toContain('Event0');
    expect(event.buttons[1]!.eventNames).toEqual(['EventStart', 'Event0']);
    EditorComponentEvent.selectAddEvent(event, 0, 2, true, 'EventA');
    expect(event.buttons[1]!.eventNames).toEqual(['EventA', 'Event0']);
    EditorComponentEvent.removeEvent(event, 0, 2);
    expect(event.buttons[1]!.eventNames).toEqual(['Event0']);
    expect(EditorComponentEvent.nextEventChoices().map((c) => c.value)).toEqual(['{NEW:Event}', '{NEW:Spawn}', '{NEW:Puzzle}', 'EventStart', 'EventA', 'TokenLook', 'Event0']);
    // Saved as Valkyrie writes it, and read back the same
    QuestEditor.save();
    expect(QuestEditor.lastSaveUnstable).toEqual([]);
    QuestEditor.reload(QUEST);
    const saved = Game.get().currentQuest!.qd.components.get('EventA') as QuestData.Event;
    expect(saved.buttons.map((b) => [b.color, b.eventNames])).toEqual([
      ['white', ['EventStart']],
      ['red', ['Event0']],
    ]);
    // The last button goes, with its label in every language
    EditorComponentEvent.removeButton(saved);
    expect(saved.buttons).toHaveLength(1);
    expect(texts('English').has('EventA.button2')).toBe(false);
  });

  it('EventVisibility_AddsMakesReplacesAndRemoves', () => {
    const qd = edit();
    const event = qd.components.get('EventA') as QuestData.Event;
    expect(EditorComponentEvent.visibilityChoices(false).slice(0, 2).map((c) => c.value)).toEqual(['#boardcomponents', '#monsters']);
    expect(EditorComponentEvent.visibilityChoices(true).map((c) => c.value)).toEqual(['{NEW:Tile}', '{NEW:Token}', '{NEW:UI}', '{NEW:QItem}', 'TokenLook', 'TileHall']);
    EditorComponentEvent.selectAddVisibility(event, true, -1, 'TileHall');
    EditorComponentEvent.selectAddVisibility(event, true, -1, '{NEW:Token}');
    expect(event.addComponents).toEqual(['TileHall', 'Token0']);
    // A new token goes where the camera is, on the tiles' grid, and is drawn
    expect(Game.get().currentQuest!.boardItems.has('Token0')).toBe(true);
    EditorComponentEvent.selectAddVisibility(event, true, 0, 'TokenLook');
    expect(event.addComponents).toEqual(['TokenLook', 'Token0']);
    EditorComponentEvent.removeVisibility(event, 1, true);
    expect(event.addComponents).toEqual(['TokenLook']);
    expect(event.removeComponents).toEqual(['TokenLook']);
    EditorComponentEvent.removeVisibility(event, 0, false);
    expect(event.removeComponents).toEqual([]);
  });

  it('EventTrigger_QuotaAndPlace_AsValkyriesEditorSetsThem', () => {
    const qd = edit();
    const event = qd.components.get('EventA') as QuestData.Event;
    const triggers = EditorComponentEvent.triggerChoices();
    expect(triggers.slice(0, 4)).toEqual([
      { value: '', group: 'GENERAL' },
      { value: 'EventStart', group: 'GENERAL', greyed: true },
      { value: 'NoMorale', group: 'GENERAL', greyed: false },
      { value: 'Eliminated', group: 'GENERAL', greyed: false },
    ]);
    expect(triggers.map((t) => t.value)).toContain('Mythos');
    expect(triggers.filter((t) => t.group === 'MONSTER').length).toBeGreaterThan(5);
    EditorComponentEvent.selectEventTrigger(event, 'EndRound');
    expect(event.trigger).toBe('EndRound');
    // A quota is a number, or a variable
    EditorComponentEvent.setQuota(event, '3');
    expect(event.quota).toBe(3);
    EditorComponentEvent.setQuota(event, 'x');
    expect(event.quota).toBe(0);
    EditorComponentEvent.newQuotaVar(event, '%count!');
    expect([event.quotaVar, event.quota]).toEqual(['%count', 0]);
    EditorComponentEvent.newQuotaVar(event, '9lives');
    expect(event.quotaVar).toBe('var9lives');
    EditorComponentEvent.setQuotaInt(event);
    expect(event.quotaVar).toBe('');
    EditorComponentEvent.toggleRandom(event);
    expect(event.randomEvents).toBe(true);
    // Its place on the board, in Valkyrie's order
    const seen: string[] = [];
    for (let i = 0; i < 5; i++) {
      seen.push(EditorComponentEvent.locationType(event));
      EditorComponentEvent.positionTypeCycle(event);
    }
    expect(seen).toEqual(['UNUSED', 'CAMERA', 'HIGHLIGHT', 'MIN_CAM', 'MAX_CAM']);
    expect(EditorComponentEvent.locationType(event)).toBe('UNUSED');
    // Music, inserted where it is put, and its sound
    EditorComponentEvent.selectMusic(event, 0, 'b.ogg');
    EditorComponentEvent.selectMusic(event, 0, 'a.ogg');
    EditorComponentEvent.removeMusic(event, 1);
    expect(event.music).toEqual(['a.ogg']);
    EditorComponentEvent.selectEventAudio(event, 'click.ogg');
    expect(event.audio).toBe('click.ogg');
  });

  it('VarTests_TestsAreJoinedWithAndAndAssignmentsListed', () => {
    const qd = edit();
    const event = qd.components.get('EventA') as QuestData.Event;
    EditorComponentVarTestsUtil.selectAddOp('%a', event);
    EditorComponentVarTestsUtil.selectAddOp('#heroes', event);
    expect(event.tests!.toString()).toBe('VarOperation:%a,>,0 VarTestsLogicalOperator:AND VarOperation:#heroes,>,0 ');
    EditorComponentVarTestsUtil.newVar('@b?', event, false);
    EditorComponentVarTestsUtil.newVar('7', event, false);
    EditorComponentVarTestsUtil.newVar('!!', event, false);
    expect(event.operations!.map((op) => op.toString())).toEqual(['@b,=,0', 'var7,=,0']);
    const op = event.operations![0]!;
    EditorComponentVarTestsUtil.selectSetOp(op, '+');
    EditorComponentVarTestsUtil.setNumValue(op, '#rand0');
    expect(op.toString()).toBe('@b,+,#rand1');
    EditorComponentVarTestsUtil.setNumValue(op, '2.50');
    expect(op.value).toBe('2.5');
    EditorComponentVarTestsUtil.removeAssignOp(event, event.operations![1]!);
    expect(event.operations!.map((o) => o.toString())).toEqual(['@b,+,2.5']);
    // The arrows: the first test can go down past the AND, the last up
    expect(EditorComponentVarTestsUtil.moves(event.tests!, 0)).toEqual({ up: false, down: true });
    expect(EditorComponentVarTestsUtil.moves(event.tests!, 2)).toEqual({ up: true, down: false });
    // A test goes with the AND that joined it
    EditorComponentVarTestsUtil.removeOp(event.tests!, 2);
    expect(event.tests!.toString()).toBe('VarOperation:%a,>,0 ');
    // The variables the windows offer: the scenario's (an event's operations first, then its tests), then the perils' $ ones
    const vars = EditorComponentVarTestsUtil.questVars();
    expect(vars.slice(0, 2)).toEqual(['@b', '%a']);
    expect(EditorComponentVarTestsUtil.assignVarChoices()[0]).toBe('{NEW}');
    expect(EditorComponentVarTestsUtil.valueChoices()).toContain('#round');
    expect(EditorComponentVarTestsUtil.testVarChoices()).toContain('#heroes');
  });

  it('QuestPanel_NameTextsAndFlags_AsValkyriesQuestPanelSetsThem', () => {
    const qd = edit();
    const quest = qd.quest;
    // An empty name is not taken; an empty description goes
    EditorComponentQuest.updateQuestName('');
    expect(texts('English').get('quest.name')).toBe('Edit test');
    EditorComponentQuest.updateQuestName('The clock');
    expect(texts('English').get('quest.name')).toBe('The clock');
    EditorComponentQuest.updateQuestText('description', '');
    expect(texts('English').has('quest.description')).toBe(false);
    EditorComponentQuest.updateQuestText('authors_short', 'kozka');
    expect(texts('English').get('quest.authors_short')).toBe('kozka');
    EditorComponentQuest.toggleHidden();
    EditorComponentQuest.toggleDefaultMusicOn();
    expect([quest.hidden, quest.defaultMusicOn]).toEqual([true, false]);
    // Its cover: none, or a picture of its folder, with forward slashes
    expect(EditorComponentQuest.imageChoices()).toEqual(['', 'img/cover.jpg']);
    EditorComponentQuest.selectImage('img\\cover.jpg');
    expect(quest.image).toBe('img/cover.jpg');
    // Packs: added at the end, any one taken out
    expect(EditorComponentQuest.packChoices()).toEqual(expect.arrayContaining(['MoMBase', 'SoA', 'BtT']));
    EditorComponentQuest.selectQuestAddPack('SoA');
    EditorComponentQuest.selectQuestAddPack('BtT');
    EditorComponentQuest.selectQuestAddPack('HJ');
    EditorComponentQuest.questRemovePack(1);
    expect(quest.packs).toEqual(['SoA', 'HJ']);
    // At least one hero and at most the game's; what is not a number counts as 0, as in Valkyrie
    EditorComponentQuest.updateMinHero('0');
    expect(quest.minHero).toBe(1);
    EditorComponentQuest.updateMinHero('3');
    EditorComponentQuest.updateMaxHero('12');
    expect([quest.minHero, quest.maxHero]).toEqual([3, 10]);
    EditorComponentQuest.updateMaxHero('x');
    expect(quest.maxHero).toBe(0);
    EditorComponentQuest.updateMaxHero('4');
    EditorComponentQuest.updateMinLength('60');
    EditorComponentQuest.updateMaxLength('90');
    EditorComponentQuest.updateDifficulty('2');
    expect(quest.difficulty).toBe(1);
    EditorComponentQuest.updateDifficulty('-1');
    expect(quest.difficulty).toBe(0);
    EditorComponentQuest.updateDifficulty('0.35');
    expect(quest.toString().split(NL)).toEqual(
      expect.arrayContaining(['hidden=True', 'defaultmusicon=False', 'packs=SoA HJ', 'minhero=3', 'maxhero=4', 'difficulty=0.35', 'lengthmin=60', 'lengthmax=90', 'image=img/cover.jpg']),
    );
  });

  it('TilePanel_SideCustomImageAndTurn_AsValkyriesTilePanelSetsThem', () => {
    const qd = edit();
    const tile = qd.components.get('TileHall') as QuestData.Tile;
    // The sides on the board and their backs are marked as taken; each with its pack and traits
    const sides = EditorComponentTile.tileSideChoices();
    expect(sides.filter((s) => s.used).map((s) => s.key).sort()).toEqual(['TileSideAlley1', 'TileSideBedroom1']);
    const alley = sides.find((s) => s.key === 'TileSideAlley1')!;
    expect(alley.traits.get('Source')).toEqual(['MoMBase']);
    expect(alley.traits.get('Traits')).toHaveLength(3);
    tile.top = 2;
    EditorComponentTile.selectTileSide(tile, 'TileSideAlley2');
    expect([tile.tileSideName, tile.customImage, tile.top, tile.left]).toEqual(['TileSideAlley2', '', 0, 0]);
    // Turned a quarter at a time, as Valkyrie rounds a turn it did not set
    const turns: number[] = [];
    for (let i = 0; i < 4; i++) {
      EditorComponentTile.tileRotate(tile);
      turns.push(tile.rotation);
    }
    expect(turns).toEqual([90, 180, 270, 0]);
    tile.rotation = 45;
    EditorComponentTile.tileRotate(tile);
    expect(tile.rotation).toBe(180);
    // A picture of its own instead of a side, where its top and left are typed
    const pictures = EditorComponent.customImageChoices();
    expect(pictures[0]!.key).toBe('img/cover.jpg');
    expect(pictures[0]!.traits.get('Source')).toEqual(['File']);
    expect(pictures.some((p) => p.key === 'Image1stEdition')).toBe(true);
    EditorComponentTile.selectCustomImage(tile, 'img/cover.jpg');
    expect([tile.customImage, tile.tileSideName]).toEqual(['img/cover.jpg', '']);
    EditorComponentTile.setTop(tile, '-1.5');
    EditorComponentTile.setLeft(tile, 'x');
    expect([tile.top, tile.left]).toEqual([-1.5, 0]);
    // Reset: the game's first side again
    EditorComponentTile.clearCustomImage(tile);
    expect([tile.customImage, tile.tileSideName, tile.top, tile.left]).toEqual(['', Game.get().cd.keys(TileSideData)[0], 0, 0]);
  });

  it('TokenPanel_TurnTypeSizeClickAndPicture_AsValkyriesTokenPanelSetsThem', () => {
    const qd = edit();
    const token = qd.components.get('TokenLook') as QuestData.Token;
    // A quarter at a time, and 0 after 270 (or after anything over 300)
    const turns: number[] = [];
    for (let i = 0; i < 4; i++) {
      EditorComponentToken.rotate(token);
      turns.push(token.rotation);
    }
    expect(turns).toEqual([90, 180, 270, 0]);
    token.rotation = 280;
    EditorComponentToken.rotate(token);
    expect(token.rotation).toBe(0);
    // Its type: the game's tokens, then its monsters
    const types = EditorComponentToken.typeChoices().map((c) => c.key);
    expect(types[0]).toBe('TokenSearch');
    expect(types.indexOf('TokenInteract')).toBeLessThan(types.findIndex((k) => k.startsWith('Monster')));
    EditorComponentToken.selectType(token, 'TokenInteract');
    expect(EditorComponentToken.sizeChoices()).toEqual(['small', 'medium', 'huge', 'massive', 'Original']);
    EditorComponentToken.selectSize(token, 'huge');
    EditorComponentToken.toggleClickEffect(token);
    expect(token.toString().split(NL)).toEqual(expect.arrayContaining(['type=TokenInteract', 'tokensize=huge', 'clickeffect=false']));
    // A picture of its own makes it a search token at the picture's size; reset keeps it a search token
    EditorComponentToken.selectCustomImage(token, 'img/cover.jpg');
    expect([token.customImage, token.tokenName, token.tokenSize]).toEqual(['img/cover.jpg', 'TokenSearch', 'Original']);
    EditorComponentToken.clearCustomImage(token);
    expect([token.customImage, token.tokenName, token.tokenSize]).toEqual(['', 'TokenSearch', 'Original']);
  });

  it('DoorPanel_TurnAndColour_AsValkyriesDoorPanelSetsThem', () => {
    const qd = edit();
    const door = qd.components.get(Game.get().qed!.newDoor()) as QuestData.Door;
    // A door is across or along: any other turn goes back to 0
    EditorComponentDoor.rotate(door);
    expect(door.rotation).toBe(90);
    EditorComponentDoor.rotate(door);
    expect(door.rotation).toBe(0);
    door.rotation = 180;
    EditorComponentDoor.rotate(door);
    expect(door.rotation).toBe(0);
    expect(EditorComponentDoor.colourChoices()).toEqual(expect.arrayContaining(['white', 'red', 'blue']));
    EditorComponentDoor.selectColour(door, 'red');
    expect(door.toString().split(NL)).toContain('color=red');
  });

  it('SelectionWindow_OpensOnTheSourceOfWhatIsChosen_WithThePacksTheQuestLacksLeftOut', () => {
    const qd = edit();
    const window = new SelectionTraits(EditorComponentTile.tileSideChoices());
    expect(window.groups.map((g) => g.name)).toEqual(['Source', 'Traits']);
    // UIWindowSelectionListTraits.ExcludeExpansions, then SelectTrait with the current side's pack, as ChangeTileSide.
    // Not in Valkyrie: the game's own base pack is not left out
    window.excludeExpansions();
    expect(window.isExcluded('Source', 'MoMBase')).toBe(false);
    window.toggleSelected('Source', SelectionTraits.sourceOf(Game.get().cd.get(TileSideData, 'TileSideAlley1')));
    const keys = (search = '') => window.visible(search).map((i) => i.key);
    const all = keys();
    expect(all).toContain('TileSideAlley1');
    expect(all.every((k) => Game.get().cd.get(TileSideData, k).sets[0] === 'MoMBase')).toBe(true);
    // Not in Valkyrie, whose window asks a side to be in every pack picked: two packs show the sides of both
    const soa = SelectionTraits.sourceOf(Game.get().cd.values(TileSideData).find((t) => t.sets[0] === 'SoA')!);
    expect(window.isExcluded('Source', soa)).toBe(true);
    // A pack left out can still be picked: it counts the sides it would add
    expect(window.count('Source', soa)).toBe(Game.get().cd.values(TileSideData).filter((t) => t.sets.includes('SoA')).length);
    window.toggleSelected('Source', soa);
    expect(window.isExcluded('Source', soa)).toBe(false);
    const both = keys();
    expect(both.length).toBeGreaterThan(all.length);
    expect(both).toContain('TileSideAlley1');
    // Traits narrow: a side has every trait picked, and none left out
    const street = alleyTrait(window, 'street');
    window.toggleSelected('Traits', street);
    expect(keys().every((k) => Game.get().cd.get(TileSideData, k).traits.includes('street'))).toBe(true);
    window.toggleExcluded('Traits', street);
    expect(keys().some((k) => Game.get().cd.get(TileSideData, k).traits.includes('street'))).toBe(false);
    // The search box looks in the name and in the id, whatever the letter case
    window.toggleExcluded('Traits', street);
    expect(keys('ALLEY')).toEqual(expect.arrayContaining(['TileSideAlley1', 'TileSideAlley2']));
    // A pack the quest asks for is not left out
    qd.quest.packs = ['SoA'];
    const again = new SelectionTraits(EditorComponentTile.tileSideChoices());
    again.excludeExpansions();
    expect(again.isExcluded('Source', soa)).toBe(false);
    expect(again.isExcluded('Source', SelectionTraits.sourceOf(Game.get().cd.values(TileSideData).find((t) => t.sets[0] === 'BtT')!))).toBe(true);
  });

  it('UIPanel_PictureTextPlaceAndLook_AsValkyriesUIPanelSetsThem', () => {
    const qd = edit();
    const ui = qd.components.get(Game.get().qed!.newUI()) as QuestData.UI;
    // QuestEditorData.NewUI: a text, in the screen's height units
    expect([ui.imageName, ui.verticalUnits, ui.richText]).toEqual(['', true, true]);
    EditorComponentUI.updateUIText(ui, 'Hello');
    EditorComponentUI.updateUIText(ui, '');
    expect(texts('English').get('UI0.uitext')).toBe('Hello');
    // A picture takes the text's place: no text, no border, aspect 1; none brings back an empty text
    ui.border = true;
    ui.aspect = 2;
    expect(EditorComponentUI.imageChoices()[0]!.key).toBe('img/cover.jpg');
    EditorComponentUI.selectImage(ui, 'img/cover.jpg');
    expect([ui.imageName, ui.border, ui.aspect, texts('English').has('UI0.uitext')]).toEqual(['img/cover.jpg', false, 1, false]);
    EditorComponentUI.selectImage(ui, '');
    expect(texts('English').get('UI0.uitext')).toBe('');
    // Place, size and aspect typed: an empty box keeps its number, what is not one is 0
    EditorComponentUI.updateNumbers(ui, { x: '0.25', y: '', size: 'x', aspect: '3' });
    expect([ui.location.x, ui.location.y, ui.size, ui.aspect]).toEqual([0.25, 0, 0, 3]);
    EditorComponentUI.updateNumbers(ui, { size: '0.5' });
    EditorComponentUI.setAlign(ui, -1, 1);
    EditorComponentUI.changeUnits(ui);
    EditorComponentUI.setRichText(ui);
    EditorComponentUI.toggleBorder(ui);
    EditorComponentUI.toggleClickEffect(ui);
    EditorComponentUI.updateTextSize(ui, '2');
    expect(EditorComponentUI.textAlignmentChoices()).toEqual(['TOP', 'CENTER', 'BOTTOM']);
    EditorComponentUI.selectTextAlignment(ui, 'TOP');
    EditorComponentUI.selectColour(ui, 'red');
    EditorComponentUI.selectBackgroundColour(ui, 'black');
    expect(EditorComponentUI.fadeSpeedChoices()).toEqual(['instant', 'fast', 'slow']);
    EditorComponentUI.selectFadeSpeed(ui, 'slow');
    expect(ui.toString().split(NL)).toEqual(
      expect.arrayContaining([
        'xposition=0.25',
        'size=0.5',
        'textsize=2',
        'textcolor=red',
        'textbackgroundcolor=black',
        'textAlignment=TOP',
        'border=True',
        'textaspect=3',
        'halign=left',
        'valign=bottom',
        'fadespeed=slow',
        'clickeffect=False',
      ]),
    );
    expect(ui.toString()).not.toContain('richText=');
    expect(ui.toString()).not.toContain('vunits=');
  });

  it('SpawnPanel_MonstersTraitsHealthAndPlaces_AsValkyriesSpawnPanelSetsThem', () => {
    const qd = edit();
    const spawn = qd.components.get(Game.get().qed!.newSpawn()) as QuestData.Spawn;
    const first = spawn.mTypes[0]!;
    // Its monsters: the scenario's own and spawns first, then the content's; added where asked, or in place of one
    const choices = EditorComponentSpawn.monsterTypeChoices();
    expect(choices[0]!.key).toBe('Spawn0');
    expect(choices[0]!.traits.get('Source')).toEqual(['spawns.ini']);
    const other = choices.find((c) => c.key.startsWith('Monster') && c.key !== first)!.key;
    EditorComponentSpawn.selectMonsterType(spawn, other, 0);
    expect(spawn.mTypes).toEqual([other, first]);
    EditorComponentSpawn.selectMonsterType(spawn, first, 1, true);
    EditorComponentSpawn.monsterTypeRemove(spawn, 0);
    expect(spawn.mTypes).toEqual([first]);
    // The last monster stays, unless a trait takes its place
    EditorComponentSpawn.monsterTypeRemove(spawn, 0);
    expect(spawn.mTypes).toEqual([first]);
    const trait = EditorComponentSpawn.traitChoices()[0]!;
    EditorComponentSpawn.selectMonsterTrait(spawn, false, trait);
    EditorComponentSpawn.selectMonsterTrait(spawn, true, trait);
    EditorComponentSpawn.monsterTypeRemove(spawn, 0);
    expect([spawn.mTypes, spawn.mTraitsRequired, spawn.mTraitsPool]).toEqual([[], [trait], [trait]]);
    EditorComponentSpawn.monsterTraitsRemove(spawn, 0, true);
    EditorComponentSpawn.monsterTraitsRemove(spawn, 0);
    expect(spawn.mTraitsRequired).toEqual([trait]);
    // Health of a unique monster, typed; a unique one gets its name as title and '-' as text
    EditorComponentSpawn.updateHealth(spawn, '5');
    EditorComponentSpawn.updateHealthHero(spawn, 'x');
    EditorComponentSpawn.activatedToggle(spawn);
    EditorComponentSpawn.uniqueToggle(spawn);
    expect([texts('English').get('Spawn0.uniquetitle'), texts('English').get('Spawn0.uniquetext')]).toEqual(['Spawn0', '-']);
    EditorComponentSpawn.updateUniqueTitle(spawn, '');
    EditorComponentSpawn.updateUniqueTitle(spawn, 'The beast');
    expect(texts('English').get('Spawn0.uniquetitle')).toBe('The beast');
    expect(spawn.toString().split(NL)).toEqual(expect.arrayContaining(['unique=true', 'uniquehealth=5', 'uniquehealthhero=0', 'activated=true']));
    EditorComponentSpawn.uniqueToggle(spawn);
    expect(texts('English').has('Spawn0.uniquetitle')).toBe(false);
    // Places for a number of heroes: a new one is made as Valkyrie names it
    expect(EditorComponentSpawn.placeChoices()[0]!.key).toBe('{NEW:MPlace}');
    expect(EditorComponentSpawn.monsterPlaceAddSelection(spawn, 2, -1, '{NEW:MPlace}')).toBe('MPlace0');
    EditorComponentSpawn.monsterPlaceAddSelection(spawn, 2, -1, 'MPlace0');
    EditorComponentSpawn.monsterPlaceRemove(spawn, 2, 0);
    expect(spawn.placement[2]).toEqual(['MPlace0']);
    expect(names()).toContain('MPlace0');
    expect(EditorComponentSpawn.placeChoices().map((c) => c.key)).toEqual(['{NEW:MPlace}', 'MPlace0']);
  });

  it('ItemPanel_ItemsTraitsStartingAndInspect_AsValkyriesItemPanelSetsThem', () => {
    const qd = edit();
    const item = qd.components.get(Game.get().qed!.newItem()) as QuestData.QItem;
    // QuestEditorData.NewItem: a weapon, at random
    expect([item.itemName, item.traits]).toEqual([[], ['weapon']]);
    const choices = EditorComponentItem.itemChoices();
    expect(choices[0]).toMatchObject({ key: 'QItem0', display: 'QItem0' });
    const given = choices.find((c) => c.key.startsWith('Item'))!.key;
    EditorComponentItem.selectAddItem(item, -1, given);
    EditorComponentItem.removeTrait(item, 0);
    // A quest item of one item marks that item as given in the window
    expect(EditorComponentItem.itemChoices().find((c) => c.key === given)!.used).toBe(true);
    EditorComponentItem.selectAddTrait(item, true, EditorComponentItem.traitChoices()[0]!);
    EditorComponentItem.removeTraitPool(item, 0);
    EditorComponentItem.selectAddItem(item, 0, 'QItem0');
    EditorComponentItem.selectAddItem(item, -1, given);
    EditorComponentItem.removeItem(item, 0);
    expect(item.itemName).toEqual([given]);
    // A starting item gets conditions; inspecting shows an event, a new one made as Valkyrie names it
    EditorComponentItem.toggleStarting(item);
    expect(item.tests).not.toBeNull();
    expect(EditorComponentItem.inspectChoices()[0]!.key).toBe('{NEW:Event}');
    expect(EditorComponentItem.selectInspectEvent(item, '{NEW:Event}')).toBe('Event0');
    expect(item.toString().split(NL)).toEqual(expect.arrayContaining(['itemname=' + given, 'starting=True', 'inspect=Event0']));
  });

  it('PuzzlePanel_KindSkillLevelsSolutionAndPicture_AsValkyriesPuzzlePanelSetsThem', () => {
    const qd = edit();
    const puzzle = qd.components.get(Game.get().qed!.newPuzzle()) as QuestData.Puzzle;
    expect(EditorComponentPuzzle.classChoices()).toEqual(['slide', 'code', 'image', 'tower']);
    puzzle.imageType = 'img/cover.jpg';
    EditorComponentPuzzle.selectClass(puzzle, 'code');
    expect(puzzle.imageType).toBe('');
    EditorComponentPuzzle.selectSkill(puzzle, '{lore}');
    EditorComponentPuzzle.updateLevel(puzzle, '5');
    EditorComponentPuzzle.updateAltLevel(puzzle, '4');
    // The example Valkyrie writes in grey, and a solution checked as it checks it
    expect(EditorComponentPuzzle.solutionExample(puzzle)).toBe('1 2 3 4 1');
    expect(EditorComponentPuzzle.updatePuzzleSolution(puzzle, '1 2 3 4')).toBe(false);
    expect(EditorComponentPuzzle.updatePuzzleSolution(puzzle, '1 2 3 4 5')).toBe(false);
    expect(puzzle.puzzleSolution).toBe('');
    expect(EditorComponentPuzzle.updatePuzzleSolution(puzzle, '4 3 2 1 1')).toBe(true);
    expect(EditorComponentPuzzle.codeImageChoices()).toEqual(['', 'symbol', 'element']);
    EditorComponentPuzzle.selectImage(puzzle, 'symbol');
    expect(puzzle.toString().split(NL)).toEqual(
      expect.arrayContaining(['class=code', 'image=symbol', 'skill={lore}', 'puzzlelevel=5', 'puzzlealtlevel=4', 'puzzlesolution=4 3 2 1 1']),
    );
    // An image puzzle's picture: the scenario's, then the content's puzzles
    EditorComponentPuzzle.selectClass(puzzle, 'image');
    expect(EditorComponentPuzzle.imageChoices()[0]!.key).toBe('img/cover.jpg');
  });

  it('MPlacePanel_TurnMasterAndSize_AsValkyriesMPlacePanelSetsThem', () => {
    const qd = edit();
    const place = qd.components.get(Game.get().qed!.newMPlace()) as QuestData.MPlace;
    EditorComponentMPlace.rotate(place);
    EditorComponentMPlace.masterToggle(place);
    expect(EditorComponentMPlace.sizeChoices()).toEqual(['', 'small', 'medium', 'huge', 'massive', 'Original']);
    EditorComponentMPlace.selectSize(place, 'huge');
    expect(place.toString().split(NL)).toEqual(expect.arrayContaining(['master=true', 'rotate=true', 'tokensize=huge']));
  });

  it('MonsterPanel_BaseNameHealthAndAttacks_AsValkyriesCustomMonsterPanelSetsThem', () => {
    const qd = edit();
    const monster = qd.components.get(Game.get().qed!.newCustomMonster()) as QuestData.CustomMonster;
    // QuestData.CustomMonster(name): its name and a '-' info, no base
    expect([texts('English').get('CustomMonster0.monstername'), texts('English').get('CustomMonster0.info')]).toEqual(['CustomMonster0', '-']);
    // Not in Valkyrie: health typed on a monster with no base is its own, so it is saved
    EditorComponentCustomMonster.updateHealth(monster, '4');
    EditorComponentCustomMonster.updateAwareness(monster, '1');
    expect(monster.toString().split(NL)).toEqual(expect.arrayContaining(['health=4', 'healthperhero=0', 'awareness=1']));
    const base = EditorComponentCustomMonster.baseChoices()[0]!.key;
    EditorComponentCustomMonster.selectSetBase(monster, base);
    expect(monster.baseMonster).toBe(base);
    // With a base, a field is the base's until set, and Reset takes it back
    EditorComponentCustomMonster.clearName(monster);
    expect(monster.monsterName.keyExists()).toBe(false);
    EditorComponentCustomMonster.setName(monster);
    EditorComponentCustomMonster.updateName(monster, '');
    expect(texts('English').get('CustomMonster0.monstername')).toBe('Name');
    EditorComponentCustomMonster.updateName(monster, 'The thing');
    EditorComponentCustomMonster.setHealth(monster);
    EditorComponentCustomMonster.updateHealth(monster, '6');
    EditorComponentCustomMonster.updateHealthHero(monster, '1.5');
    EditorComponentCustomMonster.setHorror(monster);
    EditorComponentCustomMonster.updateHorror(monster, '2');
    expect(monster.toString().split(NL)).toEqual(expect.arrayContaining(['base=' + base, 'health=6', 'healthperhero=1.5', 'horror=2']));
    EditorComponentCustomMonster.clearHealth(monster);
    expect(monster.toString()).not.toContain('health=');
    // No base: it gets what it needs of its own
    EditorComponentCustomMonster.selectSetBase(monster, '{NONE}');
    expect([monster.baseMonster, monster.healthDefined, monster.horrorDefined, monster.awarenessDefined]).toEqual(['', true, true, true]);
    // Mansions' activation is one event, a new one made as Valkyrie names it; none takes it away
    expect(EditorComponentCustomMonster.mansionsActivationChoices()[0]!.key).toBe('{NEW:Event}');
    expect(EditorComponentCustomMonster.selectSetActivation(monster, '{NEW:Event}')).toBe('Event0');
    expect(monster.activations).toEqual(['Event0']);
    EditorComponentCustomMonster.selectSetActivation(monster, '');
    expect(monster.activations).toEqual([]);
    // Descent's are activations, written without their prefix
    expect(EditorComponentCustomMonster.selectAddActivation(monster, -1, '{NEW:Activation}')).toBe('Activation0');
    EditorComponentCustomMonster.selectAddActivation(monster, -1, 'Activation0');
    EditorComponentCustomMonster.removeActivation(monster, 0);
    expect(monster.activations).toEqual(['0']);
    // Traits, evade and horror events, pictures
    EditorComponentCustomMonster.selectAddTraits(monster, EditorComponentCustomMonster.traitChoices()[0]!);
    EditorComponentCustomMonster.removeTrait(monster, 0);
    expect(EditorComponentCustomMonster.selectSetEvade(monster, '{NEW:Event}')).toBe('Event1');
    EditorComponentCustomMonster.selectSetHorror(monster, 'Event0');
    EditorComponentCustomMonster.selectImage(monster, 'img/cover.jpg');
    EditorComponentCustomMonster.selectImagePlace(monster, 'img/cover.jpg');
    EditorComponentCustomMonster.clearImagePlace(monster);
    // Investigator attacks: each a text under the next number of its kind; an empty text takes it away
    const type = EditorComponentCustomMonster.attackTypeChoices()[0]!;
    EditorComponentCustomMonster.newInvestigatorAttack(monster, type);
    const second = EditorComponentCustomMonster.newInvestigatorAttack(monster, type);
    expect(second.key).toBe('CustomMonster0.Attack_' + type + '_2');
    EditorComponentCustomMonster.updateAttack(monster, type, 1, 'Bites');
    expect(texts('English').get(second.key)).toBe('Bites');
    EditorComponentCustomMonster.updateAttack(monster, type, 0, '');
    expect(monster.investigatorAttacks.get(type)!.map((a) => a.key)).toEqual([second.key]);
    expect(monster.toString().split(NL)).toEqual(
      expect.arrayContaining(['image=img/cover.jpg', 'activation=0', 'evadeevent=Event1', 'horrorevent=Event0', 'attacks=' + type + ':1']),
    );
    EditorComponentCustomMonster.updateAttack(monster, type, 0, '');
    expect(monster.investigatorAttacks.has(type)).toBe(false);
  });

  it('ActivationPanel_TextsAndWhoGoesFirst_AsValkyriesActivationPanelSetsThem', () => {
    const qd = edit();
    const activation = qd.components.get(Game.get().qed!.newActivation()) as QuestData.Activation;
    expect(texts('English').get('Activation0.ability')).toBe('-');
    // The ability stays when emptied; the other texts go
    EditorComponentActivation.updateText(activation, 'ability', '');
    EditorComponentActivation.updateText(activation, 'master', 'Attack');
    EditorComponentActivation.updateText(activation, 'movebutton', 'Cannot');
    EditorComponentActivation.updateText(activation, 'movebutton', '');
    expect([texts('English').get('Activation0.ability'), texts('English').get('Activation0.master'), texts('English').has('Activation0.movebutton')]).toEqual([
      '-',
      'Attack',
      false,
    ]);
    EditorComponentActivation.toggleMasterFirst(activation);
    EditorComponentActivation.givenTests(activation);
    expect(activation.tests).not.toBeNull();
    expect(activation.toString().split(NL)).toContain('masterfirst=True');
  });

  it('ProblemFixes_OnlyWhereTheMendIsCertain', () => {
    const qd = edit();
    const tile = qd.components.get('TileHall') as QuestData.Tile;
    // A tile's picture written with \, which only Windows finds: written with /
    tile.customImage = 'img\\hall.png';
    const backslash: Problem = { level: 'breaks', code: 'custom-image-backslash-tile', where: 'TileHall', key: 'customImage', params: { value: 'img\\hall.png' } };
    const slashes = ProblemFixes.fixOf(backslash)!;
    expect([slashes.kind, slashes.params]).toEqual(['slashes', []]);
    slashes.apply();
    expect(tile.customImage).toBe('img/hall.png');
    expect(ProblemFixes.fixOf(backslash)).toBeNull();
    // A pack whose content the scenario uses without asking for it: asked for
    const undeclared: Problem = { level: 'wrong', code: 'pack-undeclared-content', where: 'TileHall', params: { name: 'TileSideX', pack: 'SoA' } };
    const pack = ProblemFixes.fixOf(undeclared)!;
    expect([pack.kind, pack.params]).toEqual(['add-pack', ['SoA']]);
    pack.apply();
    expect(qd.quest.packs).toContain('SoA');
    expect(ProblemFixes.fixOf(undeclared)).toBeNull();
    // Not one the scenario tests for on purpose (#pack), nor one Valkyrie does not know
    expect(ProblemFixes.fixOf({ level: 'hint', code: 'pack-undeclared-tested', where: '', params: { pack: 'CotW', components: 'TileX' } })).toBeNull();
    expect(ProblemFixes.fixOf({ level: 'wrong', code: 'pack-undeclared-content', where: 'TileHall', params: { name: 'X', pack: 'NoSuchPack' } })).toBeNull();
    // A main quest that is hidden: shown in the list
    qd.quest.hidden = true;
    ProblemFixes.fixOf({ level: 'wrong', code: 'hidden', where: '[Quest]', key: 'hidden' })!.apply();
    expect(qd.quest.hidden).toBe(false);
    // What only the author can decide has none
    expect(ProblemFixes.fixOf({ level: 'wrong', code: 'event-missing', where: 'EventA', params: { target: 'EventX' }, key: 'event1' })).toBeNull();
  });

  it('IgnoredProblems_AreKeptBesideTheVersionsAndGoWithThem', () => {
    QuestEditorVersions.forget(QUEST);
    edit();
    const problem: Problem = { level: 'wrong', code: 'never-run', where: 'EventA', params: { count: 1 } };
    expect(QuestEditorVersions.ignored(QUEST)).toEqual([]);
    QuestEditorVersions.setIgnored(QUEST, [problemSignature(problem)]);
    expect(QuestEditorVersions.ignored(QUEST)).toEqual(['never-run|EventA||{"count":1}']);
    // Neither a version nor a draft, and saving leaves it
    QuestEditor.save();
    expect(QuestEditorVersions.list(QUEST).length).toBe(1);
    expect(QuestEditorVersions.ignored(QUEST)).toEqual(['never-run|EventA||{"count":1}']);
    // The same problem with other numbers is another one
    expect(problemSignature({ ...problem, params: { count: 2 } })).not.toBe(problemSignature(problem));
    QuestEditorVersions.forget(QUEST);
    expect(QuestEditorVersions.ignored(QUEST)).toEqual([]);
  });

  it('Texts_TheTableByLanguage_WithWhatEachLacks', () => {
    // Not in Valkyrie, whose editor shows only the current language
    const english = ENGLISH.replace('TokenLook.text,Look', ['TokenLook.text,Look', 'TokenLook.button1,{qst:EventA.button1}', 'EventGone.text,Gone'].join(NL));
    const qd = edit(QUEST, english);
    const texts = () => LocalizationRead.selectDictionary('qst')!.allEntries();
    expect(QuestEditorTexts.languages(texts(), 'English')).toEqual(['English', 'Spanish']);
    // The default language first, even with no texts, which breaks Valkyrie
    expect(QuestEditorTexts.languages(texts(), 'French')).toEqual(['French', 'English', 'Spanish']);
    const rows = QuestEditorTexts.rows(texts(), qd.components, 'English');
    // The quest's own first, then each component's in the quest's order, and last those of no component
    expect(rows.map((r) => `${r.owner} ${r.key}`)).toEqual([
      'Quest quest.name',
      'Quest quest.description',
      'EventStart EventStart.text',
      'EventStart EventStart.button1',
      'EventA EventA.text',
      'EventA EventA.button1',
      'TokenLook TokenLook.text',
      'TokenLook TokenLook.button1',
      'null EventGone.text',
    ]);
    const row = (key: string) => rows.find((r) => r.key === key)!;
    expect(row('EventStart.text').values).toEqual(new Map([['English', 'Hello'], ['Spanish', 'Hola']]));
    expect(row('quest.description').values.get('English')).toBe('First line\nsecond "quoted"');
    // What a language lacks that another has, as DictionaryI18n.GetValue skips a blank text; a text that only
    // names another one ({qst:…}) is read in each language through it
    expect(QuestEditorTexts.lacks(row('EventStart.text'), 'Spanish')).toBe(false);
    expect(QuestEditorTexts.lacks(row('EventA.text'), 'Spanish')).toBe(true);
    expect(QuestEditorTexts.lacks(row('EventA.text'), 'French')).toBe(true);
    expect(QuestEditorTexts.lacks(row('EventA.text'), 'English')).toBe(false);
    expect(QuestEditorTexts.lacks(row('TokenLook.button1'), 'Spanish')).toBe(false);
  });

  it('Texts_WrittenAndTakenAwayInOneLanguage', () => {
    // Not in Valkyrie, whose panels write the current language and take an emptied text away from all of them
    edit();
    const texts = () => LocalizationRead.selectDictionary('qst')!.allEntries();
    QuestEditorTexts.setText('EventA.text', 'Spanish', 'Una');
    expect(texts().get('Spanish')!.get('EventA.text')).toBe('Una');
    expect(texts().get('English')!.get('EventA.text')).toBe('A');
    QuestEditorTexts.setText('EventStart.text', 'Spanish', '');
    expect(texts().get('Spanish')!.has('EventStart.text')).toBe(false);
    expect(texts().get('English')!.get('EventStart.text')).toBe('Hello');
    // A new language is a file of its own, listed in [QuestText], as when Valkyrie's editor writes in the player's language
    QuestEditorTexts.setText('quest.name', 'French', 'Essai');
    let files = QuestEditor.filesToSave();
    expect([...files.localization.keys()]).toEqual(['Localization.English.txt', 'Localization.Spanish.txt', 'Localization.French.txt']);
    expect(files.localization.get('Localization.French.txt')).toBe(['.,French', 'quest.name,Essai'].join(NL));
    expect(files.data.get('quest.ini')).toContain(NL + 'Localization.French.txt' + NL);
    // A language left with no text is not written; the default language always is
    QuestEditorTexts.setText('quest.name', 'French', '');
    files = QuestEditor.filesToSave();
    expect([...files.localization.keys()]).toEqual(['Localization.English.txt', 'Localization.Spanish.txt']);
    expect(files.data.get('quest.ini')).not.toContain('French');
    for (const key of texts().get('English')!.keys()) QuestEditorTexts.setText(key, 'English', '');
    expect(QuestEditor.filesToSave().localization.get('Localization.English.txt')).toBe('.,English');
    // Undo brings a text back like any change
    const history = new QuestEditorHistory();
    history.record('Text');
    QuestEditorTexts.setText('EventA.text', 'English', 'Changed');
    expect(history.undo()).toBe(true);
    expect(texts().get('English')!.has('EventA.text')).toBe(false);
    expect(texts().get('Spanish')!.get('EventA.text')).toBe('Una');
  });

  it('Texts_AnotherLanguageChosenWhileEditing_KeepsTheEdits', () => {
    // Not in Valkyrie, where the language changes only in the options, outside the editor: there,
    // DictionaryI18n.AddRequiredLanguage throws away what an editable dictionary holds for a language it lacks
    edit();
    LocalizationRead.updateScenarioText('EventA.text', 'Edited');
    LocalizationRead.changeCurrentLangTo('French');
    try {
      expect(new StringKey('qst', 'EventA.text').translate()).toBe('Edited');
      expect(QuestEditor.filesToSave().localization.get('Localization.English.txt')).toContain(NL + 'EventA.text,Edited' + NL);
      // Written now, a text goes to French, as Valkyrie's panels write the player's language
      LocalizationRead.updateScenarioText('EventA.text', 'Modifié');
      expect(new StringKey('qst', 'EventA.text').translate()).toBe('Modifié');
    } finally {
      LocalizationRead.changeCurrentLangTo('English');
    }
    expect(new StringKey('qst', 'EventA.text').translate()).toBe('Edited');
    expect(QuestEditor.filesToSave().localization.get('Localization.French.txt')).toBe(['.,French', 'EventA.text,Modifié'].join(NL));
  });

  it('Texts_TheDefaultLanguage_IsWhatAPlayerWithAnotherReads', () => {
    // Not in Valkyrie, whose new quest takes the player's language and whose editor never changes it
    const qd = edit();
    const dict = LocalizationRead.selectDictionary('qst')!;
    QuestEditorTexts.setDefaultLanguage('Spanish');
    expect(qd.quest.defaultLanguage).toBe('Spanish');
    expect(QuestEditor.filesToSave().data.get('quest.ini')).toContain(NL + 'defaultlanguage=Spanish' + NL);
    dict.currentLanguage = 'French';
    try {
      expect(new StringKey('qst', 'EventStart.text').translate()).toBe('Hola');
      // What the new default language lacks comes from another language that has it
      expect(new StringKey('qst', 'EventA.text').translate()).toBe('A');
    } finally {
      dict.currentLanguage = 'English';
    }
    QuestEditor.save();
    QuestEditor.reload(QUEST);
    expect(Game.get().currentQuest!.qd.quest.defaultLanguage).toBe('Spanish');
    expect(Application.fatalErrors).toEqual([]);
  });

  it('EventPreview_ShowsTheDialogAsAGameShowsIt', () => {
    const qd = edit();
    const event = qd.components.get('EventStart') as QuestData.Event;
    const symbols = EventManager.getCharacterMap(false, true)!;
    const tile = Game.get().cd.get(TileSideData, 'TileSideAlley1').name.translate();
    // The components it names, the game's characters for the symbols and its line breaks (EventManager.Event.GetText);
    // a variable's value and a random hero, which only a game knows, keep their code
    EditorComponentEvent.updateText(event, 'In {c:TileHall}, {c:EventA}:\\n{will} {lore} {var:clues} {rnd:hero}');
    EditorComponentEvent.updateButtonLabel(event, 1, 'Go {action}');
    EditorComponentEvent.addButton(event);
    EditorComponentEvent.selectButtonColour(event, 2, 'red');
    const preview = EditorComponentEvent.preview(event);
    expect(preview.text).toBe(`In ${tile}, EventA:\n${symbols.get('{will}')} ${symbols.get('{lore}')} {var:clues} {rnd:hero}`);
    expect(preview.buttons).toEqual([
      { label: 'Go ' + symbols.get('{action}'), colour: '#FFFFFF' },
      { label: event.buttons[1]!.label.translate(), colour: '#FF0000' },
    ]);
    // Any text of the scenario, as a dialog shows it
    expect(EditorComponentEvent.shown('{lore} in {c:TileHall}\\n{var:clues}')).toBe(`${symbols.get('{lore}')} in ${tile}\n{var:clues}`);
    // A colour a game cannot read is drawn white (DialogWindow.EventButton)
    EditorComponentEvent.selectButtonColour(event, 2, 'nonsense');
    expect(EditorComponentEvent.preview(event).buttons[1]!.colour).toBe('#FFFFFF');
    // A tile whose side is missing, which a game could not name either, stays as typed
    (qd.components.get('TileHall') as QuestData.Tile).tileSideName = 'TileSideMissing';
    expect(EditorComponentEvent.preview(event).text.startsWith('In {c:TileHall}, ')).toBe(true);
    expect(Application.fatalErrors).toEqual([]);
  });

  it('Highlight_MarksWhereTheSelectedComponentIs_AsValkyriesPanelsDo', () => {
    const qd = edit();
    const qed = Game.get().qed!;
    const quest = Game.get().currentQuest!;
    const destroyed: string[] = [];
    const added: GameObject[] = [];
    vi.spyOn(ui, 'destroyTag').mockImplementation((tag) => void destroyed.push(tag));
    vi.spyOn(ui, 'tokenCanvasAdd').mockImplementation((o) => void added.push(o));
    const drawn = (name: string) => {
      destroyed.length = 0;
      added.length = 0;
      EditorComponent.drawOnMap(name);
      return added.map((o) => [o.name, o.tag, o.transform.position.x, o.transform.position.y]);
    };
    const place = (name: string) => {
      const found = EditorComponent.highlightOf(qd.components.get(name)!);
      return found === null ? null : [found.location.x, found.location.y, found.mark];
    };
    // Each panel cleans the map first (EditorComponent.Clean), then a tile marks its anchor and is made solid
    expect(drawn('TileHall')).toEqual([['HighlightTileAnchor', Game.EDITOR, 0, 0]]);
    expect(destroyed).toEqual([Game.DIALOG, Game.EDITOR]);
    expect([quest.boardItems.get('TileHall')!.targetAlpha, quest.boardItems.get('TokenLook')!.targetAlpha]).toEqual([1, Game.get().editorTransparency]);
    // A token only moves the camera (EditorComponentToken.Highlight)
    expect(drawn('TokenLook')).toEqual([]);
    expect(place('TokenLook')).toEqual([2, 1, null]);
    expect([quest.boardItems.get('TileHall')!.targetAlpha, quest.boardItems.get('TokenLook')!.targetAlpha]).toEqual([Game.get().editorTransparency, 1]);
    // An event marks its place when it has one, or when it moves the camera
    expect(drawn('EventA')).toEqual([]);
    expect(place('EventA')).toBeNull();
    const event = qd.components.get('EventA') as QuestData.Event;
    event.location.x = 3;
    event.location.y = 4;
    event.minCam = true;
    expect(drawn('EventA')).toEqual([['HighlightEventLoc', Game.EDITOR, 3, 4]]);
    // A door and a spawn are events; a monster place marks its square
    const door = qd.components.get(qed.newDoor())!;
    expect(place(door.sectionName)).toEqual([door.location.x, door.location.y, 'EventLoc']);
    const spawn = qd.components.get(qed.newSpawn()) as QuestData.Spawn;
    expect(place(spawn.sectionName)).toEqual([spawn.location.x, spawn.location.y, 'EventLoc']);
    EditorComponentEvent.spawnPositionTypeCycle(spawn);
    expect(place(spawn.sectionName)).toBeNull();
    const mplace = qd.components.get(qed.newMPlace())!;
    expect(drawn(mplace.sectionName)).toEqual([['HighlightMonsterLoc', Game.EDITOR, mplace.location.x, mplace.location.y]]);
    // A UI element and a puzzle do neither, even with a place (EditorComponentUI and EditorComponentPuzzle.Highlight)
    const puzzle = qd.components.get(qed.newPuzzle()) as QuestData.Puzzle;
    puzzle.locationSpecified = true;
    expect([place(qed.newUI()), place(puzzle.sectionName)]).toEqual([null, null]);
    // The quest itself: the map is only cleaned and dimmed
    expect(drawn(QUEST_SELECTION)).toEqual([]);
    expect(destroyed).toEqual([Game.DIALOG, Game.EDITOR]);
    expect(quest.boardItems.get('TileHall')!.targetAlpha).toBe(Game.get().editorTransparency);
  });

  it('ReadBack_SaysWhichFilesASecondLoadWouldSaveOtherwise', () => {
    edit();
    const files = QuestEditor.filesToSave();
    QuestEditor.save();
    expect(QuestEditor.readBack(QUEST, files)).toEqual([]);
    const other = QuestEditor.filesToSave();
    other.data.set('tiles.ini', other.data.get('tiles.ini')! + 'changed');
    expect(QuestEditor.readBack(QUEST, other)).toEqual(['tiles.ini']);
    // The quest open and its texts stay as they were
    expect(texts('English').get('EventStart.text')).toBe('Hello');
    expect(Game.get().currentQuest!.qd.questPath).toBe(QUEST + '/quest.ini');
    // A quest.ini that does not load
    File.writeAllText(QUEST + '/quest.ini', '[Quest]' + NL + 'format=21' + NL + 'type=MoM' + NL + NL + '[QuestData]' + NL + 'missing.ini' + NL);
    expect(QuestEditor.readBack(QUEST, files)).toEqual(['quest.ini']);
    expect(Application.fatalErrors).toEqual([]);
  });

  it('Save_KeepsUneditedTextsAsTheyWere', () => {
    edit();
    QuestEditor.save();
    expect(File.readAllText(QUEST + '/Localization.English.txt')).toBe(ENGLISH);
    expect(File.readAllText(QUEST + '/Localization.Spanish.txt')).toBe(SPANISH);
  });

  it('Save_TwiceWritesTheSameFiles', () => {
    edit();
    QuestEditor.save();
    const first = Directory.getFiles(QUEST, '*', SearchOption.AllDirectories).map((f) => [f, File.readAllText(f)]);
    QuestEditor.reload(QUEST);
    QuestEditor.save();
    const second = Directory.getFiles(QUEST, '*', SearchOption.AllDirectories).map((f) => [f, File.readAllText(f)]);
    expect(second).toEqual(first);
  });

  it('Save_AfterEditingATextRewritesEveryLanguage', () => {
    edit();
    LocalizationRead.updateScenarioText('EventA.text', 'Line one\nLine "two"');
    QuestEditor.save();
    // DictionaryI18n.SerializeMultiple: comments and the last empty line go, quotes and new lines are written again
    expect(File.readAllText(QUEST + '/Localization.English.txt')).toBe(
      [
        '.,English',
        'quest.name,Edit test',
        'quest.description,|||First line\\nsecond "quoted"|||',
        'EventStart.text,Hello',
        'EventStart.button1,Go',
        'EventA.text,|||Line one\\nLine "two"|||',
        'EventA.button1,Back',
        'TokenLook.text,Look',
      ].join(NL),
    );
    expect(File.readAllText(QUEST + '/Localization.Spanish.txt')).toBe(['.,Spanish', 'quest.name,Prueba', 'EventStart.text,Hola'].join(NL));
    QuestEditor.reload(QUEST);
    expect(texts('English').get('EventA.text')).toBe('Line one\nLine "two"');
    expect(texts('English').get('quest.description')).toBe('First line\nsecond "quoted"');
  });

  it('Save_WritesEveryTextSoThatItReadsBackTheSame', () => {
    // Not in Valkyrie, whose lines for these two read back as "quoted" and as a text that swallows the next lines
    edit();
    LocalizationRead.updateScenarioText('EventA.text', '"quoted"');
    LocalizationRead.updateScenarioText('EventStart.text', 'one\ntwo,|||three');
    const before = texts('English');
    QuestEditor.save();
    expect(QuestEditor.lastSaveProblems).toEqual([]);
    const written = File.readAllText(QUEST + '/Localization.English.txt').split(NL);
    expect(written).toContain('EventA.text,"""quoted"""');
    expect(written).toContain('EventStart.text,|||one\\ntwo,|||three|||');
    expect(written).toContain('EventStart.button1,Go');
    QuestEditor.reload(QUEST);
    expect(texts('English')).toEqual(before);
  });

  it('NewEvent_TakesTheLowestFreeNumber', () => {
    edit();
    const qed = Game.get().qed!;
    expect(qed.newEvent()).toBe('Event0');
    expect(qed.newEvent()).toBe('Event1');
    expect(qed.selection).toBe('Event1');
    expect(names()).toEqual(['EventStart', 'EventA', 'TokenLook', 'TileHall', 'Event0', 'Event1']);
    const event = Game.get().currentQuest!.qd.components.get('Event1') as QuestData.Event;
    expect(event.source).toBe('events.ini');
    expect(event.display).toBe(false);
  });

  it('NewComponent_GoesWhereADeletedOneWas', () => {
    edit();
    QuestEditorData.selectComponent('EventA');
    QuestEditorData.deleteCurrentComponent();
    expect(Game.get().qed!.newEvent()).toBe('Event0');
    // A .NET Dictionary puts the new key in the freed slot, so Save writes it there
    expect(names()).toEqual(['EventStart', 'Event0', 'TokenLook', 'TileHall']);
    QuestEditor.save();
    const events = File.readAllText(QUEST + '/events.ini');
    expect(events.indexOf('[Event0]')).toBeGreaterThan(events.indexOf('[EventStart]'));
    expect(events.indexOf('[Event0]')).toBeLessThan(events.indexOf('[TokenLook]'));
  });

  it('NewTile_GoesWhereTheCameraIsOnTheTileGrid', () => {
    edit();
    const game = Game.get();
    game.cc.position.x = 5.4;
    game.cc.position.y = -1.6;
    const name = game.qed!.newTile();
    const tile = game.currentQuest!.qd.components.get(name) as QuestData.Tile;
    expect(name).toBe('Tile0');
    // MoM rounds tiles to 3.5 units
    expect(tile.location.x).toBe(7);
    expect(tile.location.y === 0).toBe(true);
    expect(tile.tileSideName.length).toBeGreaterThan(0);
    expect(tile.source).toBe('tiles.ini');
  });

  it('NewUI_UsesVerticalUnitsAndRichText', () => {
    edit();
    const name = Game.get().qed!.newUI();
    const component = Game.get().currentQuest!.qd.components.get(name) as QuestData.UI;
    expect(component.verticalUnits).toBe(true);
    expect(component.richText).toBe(true);
  });

  it('Delete_RemovesTheComponentItsReferencesAndItsTexts', () => {
    const qd = edit();
    QuestEditorData.selectComponent('TokenLook');
    QuestEditorData.deleteCurrentComponent();
    expect(names()).toEqual(['EventStart', 'EventA', 'TileHall']);
    expect((qd.components.get('EventStart') as QuestData.Event).addComponents).toEqual(['TileHall']);
    expect((qd.components.get('EventA') as QuestData.Event).removeComponents).toEqual([]);
    expect(texts('English').has('TokenLook.text')).toBe(false);
    // Back to the selection before, the quest
    expect(Game.get().qed!.selection).toBe(QUEST_SELECTION);
  });

  it('Rename_KeepsThePlaceAndChangesEveryReferenceAndText', () => {
    const qd = edit();
    const eventA = qd.components.get('EventA')!;
    QuestEditorData.selectComponent('EventA');
    expect(EditorComponent.renameValue(eventA)).toBe('A');
    expect(EditorComponent.renameFinished(eventA, 'Bá ck!')).toBe('EventBck');
    expect(names()).toEqual(['EventStart', 'EventBck', 'TokenLook', 'TileHall']);
    expect((qd.components.get('EventStart') as QuestData.Event).buttons[0]!.eventNames).toEqual(['EventBck']);
    expect((qd.components.get('TokenLook') as QuestData.Event).buttons[0]!.eventNames).toEqual(['EventBck']);
    expect((eventA as QuestData.Event).buttons[0]!.label.key).toBe('EventBck.button1');
    expect(texts('English').get('EventBck.text')).toBe('A');
    expect(texts('English').has('EventA.text')).toBe(false);
    expect(Game.get().qed!.selection).toBe('EventBck');
  });

  it('Rename_ToATakenNameAddsANumber', () => {
    const qd = edit();
    EditorComponent.renameFinished(qd.components.get('EventA')!, 'Start');
    expect(names()).toEqual(['EventStart', 'EventStart0', 'TokenLook', 'TileHall']);
  });

  it('Rename_SkipsANameWhoseTextsWereLeftInTheFile', () => {
    // Not in Valkyrie: RenamePrefix would throw half way on the texts of EventOld, left there by hand
    const qd = edit(QUEST, ENGLISH + 'EventOld.text,Left over' + NL);
    expect(EditorComponent.renameFinished(qd.components.get('EventA')!, 'Old')).toBe('EventOld0');
    expect(texts('English').get('EventOld.text')).toBe('Left over');
    expect(texts('English').get('EventOld0.text')).toBe('A');
  });

  it('Rename_WithNothingLeftOrTheSameNameChangesNothing', () => {
    const qd = edit();
    const eventA = qd.components.get('EventA')!;
    expect(EditorComponent.renameFinished(eventA, '¡¿?!')).toBe('EventA');
    expect(EditorComponent.renameFinished(eventA, 'A')).toBe('EventA');
    expect(names()).toEqual(['EventStart', 'EventA', 'TokenLook', 'TileHall']);
  });

  it('Rename_TextsThatShowTheComponentFollowIt', () => {
    // Not in Valkyrie, which leaves {c:EventA} to be shown as it is
    const english = ENGLISH.replace('EventStart.text,Hello', 'EventStart.text,Hello {c:EventA}, {qst:EventA.text} {c:EventAB}');
    const qd = edit(QUEST, english);
    EditorComponent.renameFinished(qd.components.get('EventA')!, 'Bck');
    expect(texts('English').get('EventStart.text')).toBe('Hello {c:EventBck}, {qst:EventBck.text} {c:EventAB}');
  });

  it('RenameAndDelete_KeepATriggerThatOnlyStartsWithTheName', () => {
    // Not in Valkyrie: Event.ChangeReference also changed EventKillB's trigger to DefeatedSpawnZ, then to Defeated
    writeQuest();
    const spawns = ['[SpawnA1]', 'monster=MonsterCultist', '', '[SpawnA12]', 'monster=MonsterCultist', ''];
    const kills = ['[EventKillA]', 'trigger=DefeatedSpawnA1', '', '[EventKillB]', 'trigger=DefeatedSpawnA12', ''];
    File.writeAllText(QUEST + '/events.ini', EVENTS + [...spawns, ...kills].join(NL));
    Game.get().qed = null;
    QuestEditor.begin(QUEST);
    const qd = Game.get().currentQuest!.qd;
    const trigger = (name: string) => (qd.components.get(name) as QuestData.Event).trigger;
    EditorComponent.renameFinished(qd.components.get('SpawnA1')!, 'Z');
    expect([trigger('EventKillA'), trigger('EventKillB')]).toEqual(['DefeatedSpawnZ', 'DefeatedSpawnA12']);
    QuestEditorData.selectComponent('SpawnZ');
    QuestEditorData.deleteCurrentComponent();
    expect([trigger('EventKillA'), trigger('EventKillB')]).toEqual(['Defeated', 'DefeatedSpawnA12']);
  });

  it('Delete_TakesTheEventFromEveryPlaceOfAButton', () => {
    // Not in Valkyrie, whose List.Remove took EventA only once from a random choice with weights
    writeQuest();
    File.writeAllText(QUEST + '/events.ini', EVENTS + ['[EventPick]', 'buttons=1', 'event1=EventA EventStart EventA', 'randomevents=true', ''].join(NL));
    Game.get().qed = null;
    QuestEditor.begin(QUEST);
    const qd = Game.get().currentQuest!.qd;
    QuestEditorData.selectComponent('EventA');
    QuestEditorData.deleteCurrentComponent();
    expect((qd.components.get('EventPick') as QuestData.Event).buttons[0]!.eventNames).toEqual(['EventStart']);
  });

  it('Rename_TheAttacksOfACustomMonsterFollowIt', () => {
    // Not in Valkyrie, whose custom monster kept its attacks' texts under the old name until the quest was read again
    writeQuest();
    File.writeAllText(QUEST + '/events.ini', EVENTS + ['[CustomMonsterBrute]', 'base=MonsterCultist', 'attacks=bladed:2', ''].join(NL));
    Game.get().qed = null;
    QuestEditor.begin(QUEST);
    const qd = Game.get().currentQuest!.qd;
    EditorComponent.renameFinished(qd.components.get('CustomMonsterBrute')!, 'Ogre');
    const attacks = (qd.components.get('CustomMonsterOgre') as QuestData.CustomMonster).investigatorAttacks.get('bladed')!;
    expect(attacks.map((a) => a.fullKey)).toEqual(['{qst:CustomMonsterOgre.Attack_bladed_1}', '{qst:CustomMonsterOgre.Attack_bladed_2}']);
  });

  it('Comment_NewLinesAreWrittenAsBackslashN', () => {
    const qd = edit();
    const eventA = qd.components.get('EventA')!;
    EditorComponent.setComment(eventA, 'one\ntwo\rthree');
    expect(eventA.comment).toBe('one\\ntwo\\nthree');
    expect(EditorComponent.commentText(eventA)).toBe('one\ntwo\nthree');
    expect(eventA.toString()).toContain('comment=one\\ntwo\\nthree' + NL);
  });

  it('NewSource_AddsTheIniExtension', () => {
    expect(EditorComponent.newSource('rooms')).toBe('rooms.ini');
    expect(EditorComponent.newSource('rooms.ini')).toBe('rooms.ini');
  });

  it('Reorder_MovesAComponentUpAmongThoseOfItsFile', () => {
    edit();
    expect(ReorderComponents.sources()).toEqual(['events.ini', 'tiles.ini']);
    expect(ReorderComponents.componentsOf('events.ini')).toEqual(['EventStart', 'EventA', 'TokenLook']);
    ReorderComponents.incComponent('TokenLook');
    expect(names()).toEqual(['EventStart', 'TokenLook', 'EventA', 'TileHall']);
    ReorderComponents.incComponent('TokenLook');
    expect(names()).toEqual(['TokenLook', 'EventStart', 'EventA', 'TileHall']);
  });

  it('CreatePackage_WritesThePackageItsManifestAndTheCover', () => {
    edit();
    const destination = EditorTools.createPackage('/Desktop');
    expect(destination).toBe('/Desktop/EditTest');
    const zip = File.readAllBytes('/Desktop/EditTest/EditTest.valkyrie');
    const entries = readZipDirectory(zip);
    expect(entries.map((e) => e.name).sort()).toEqual(['Localization.English.txt', 'Localization.Spanish.txt', 'events.ini', 'img/cover.jpg', 'quest.ini', 'tiles.ini']);
    expect(new TextDecoder().decode(readZipEntry(zip, entries.find((e) => e.name === 'quest.ini')!))).toBe(File.readAllText(QUEST + '/quest.ini'));
    const version = bitConverterToString(sha256(zip));
    const quest = Game.get().currentQuest!.qd.quest;
    expect(quest.version).toBe(version);
    expect(quest.image).toBe('img/cover.jpg');
    expect(File.readAllBytes('/Desktop/EditTest/cover.jpg')).toEqual(new Uint8Array([0xff, 0xd8, 0xff, 0xd9]));
    expect(File.readAllText('/Desktop/EditTest/EditTest.ini')).toBe(
      [
        '[Quest]',
        'format=21',
        'hidden=False',
        'type=MoM',
        'defaultlanguage=English',
        'defaultmusicon=True',
        'minhero=1',
        'maxhero=4',
        'image=cover.jpg',
        'version=' + version,
        'name.English=Edit test',
        'name.Spanish=Prueba',
        'description.English=First line\\nsecond "quoted"',
        '',
      ].join(NL),
    );
    // A second package does not overwrite the first
    expect(EditorTools.createPackage('/Desktop')).toBe('/Desktop/EditTest2');
  });

  it('CreatePackage_WithAMissingCoverWritesNoManifest', () => {
    // As Valkyrie: File.Copy throws and the manifest is never written; the editor checks the cover before
    edit();
    File.delete(QUEST + '/img/cover.jpg');
    expect(EditorTools.createPackage('/Desktop2')).toBeNull();
    expect(File.exists('/Desktop2/EditTest/EditTest.valkyrie')).toBe(true);
    expect(File.exists('/Desktop2/EditTest/EditTest.ini')).toBe(false);
    expect(log.some((m) => m.startsWith('Warning: Unable to write to valkyrie package.'))).toBe(true);
  });

  it('NewQuest_WritesValkyriesStarterFiles', () => {
    Game.get().currentQuest = null;
    const selection = new QuestEditSelection();
    expect(QuestEditSelection.newQuestError('Nueva')).toBeNull();
    expect(selection.tryCreateQuest(' Nueva ', '  ')).toBe(EDITOR + '/Nueva');
    expect(File.readAllText(EDITOR + '/Nueva/quest.ini')).toBe(['[Quest]', 'type=MoM', 'format=21', 'defaultlanguage=English', '', '[QuestText]', 'Localization.English.txt', ''].join(NL));
    expect(File.readAllText(EDITOR + '/Nueva/Localization.English.txt')).toBe(['.,English', 'quest.name,Nueva', 'quest.description,Nueva...'].join(NL));
    expect([...selection.questList.keys()]).toContain(EDITOR + '/Nueva');
    expect(QuestEditSelection.newQuestError('Nueva')!.key).toBe('NEW_QUEST_FOLDER_EXISTS');
    expect(QuestEditSelection.newQuestError('')!.key).toBe('NEW_QUEST_INVALID_NAME');
    expect(QuestEditSelection.newQuestError('a:b')!.key).toBe('NEW_QUEST_INVALID_NAME');
    expect(selection.tryCreateQuest('a/b', 'x')).toBeNull();
  });

  it('Copy_CopiesTheFolderAndMarksTheName', () => {
    writeQuest(EDITOR + '/ToCopy');
    File.writeAllText(EDITOR + '/ToCopy/quest.ini', QUEST_INI.replace('[Quest]' + NL, '[Quest]' + NL + 'name=Old' + NL));
    const selection = new QuestEditSelection();
    const copy = selection.copy(EDITOR + '/ToCopy');
    expect(copy).toMatch(new RegExp('^' + EDITOR + '/EditorScenario\\d+$'));
    expect(File.readAllText(copy + '/quest.ini').split(NL)[1]).toBe('name=Old (Copy)');
    expect(File.readAllText(copy + '/events.ini')).toBe(EVENTS);
    expect(File.readAllBytes(copy + '/img/cover.jpg')).toEqual(new Uint8Array([0xff, 0xd8, 0xff, 0xd9]));
    // Its versions go with it (not in Valkyrie, which keeps none)
    Game.get().qed = null;
    QuestEditor.begin(copy);
    LocalizationRead.updateScenarioText('EventA.text', 'Changed');
    QuestEditor.save();
    expect(QuestEditorVersions.list(copy)).toHaveLength(1);
    selection.delete(copy);
    expect(Directory.exists(copy)).toBe(false);
    expect(QuestEditorVersions.list(copy)).toEqual([]);
  });

  it('History_UndoAndRedoAComponentAndAText', () => {
    edit();
    const history = new QuestEditorHistory();
    expect(history.canUndo).toBe(false);
    history.record('New event');
    Game.get().qed!.newEvent();
    history.record('Text');
    LocalizationRead.updateScenarioText('EventA.text', 'Changed');
    expect(history.undoLabel).toBe('Text');

    expect(history.undo()).toBe(true);
    expect(texts('English').get('EventA.text')).toBe('A');
    expect(names()).toContain('Event0');
    expect(history.undo()).toBe(true);
    expect(names()).toEqual(['EventStart', 'EventA', 'TokenLook', 'TileHall']);
    expect(history.canUndo).toBe(false);
    expect(history.redoLabel).toBe('New event');

    // A step comes back as the files would give it: each file's components together
    expect(history.redo()).toBe(true);
    expect(names()).toEqual(['EventStart', 'EventA', 'TokenLook', 'Event0', 'TileHall']);
    expect(history.redo()).toBe(true);
    expect(texts('English').get('EventA.text')).toBe('Changed');
    expect(history.canRedo).toBe(false);
    // Nothing reached the quest's own files
    expect(File.readAllText(QUEST + '/events.ini')).toBe(EVENTS);
    expect(File.readAllText(QUEST + '/Localization.English.txt')).toBe(ENGLISH);
  });

  it('History_ListsEveryStepAndGoesBackSeveralAtOnce', () => {
    edit();
    const history = new QuestEditorHistory();
    expect(history.undoLabels).toEqual([]);
    history.record('One');
    Game.get().qed!.newEvent();
    history.record('Two');
    Game.get().qed!.newEvent();
    history.record('Three');
    LocalizationRead.updateScenarioText('EventA.text', 'Changed');
    // The latest first, as the history panel lists them
    expect(history.undoLabels).toEqual(['Three', 'Two', 'One']);
    expect(history.undo()).toBe(true);
    expect(history.undo()).toBe(true);
    expect(history.undoLabels).toEqual(['One']);
    expect(history.redoLabels).toEqual(['Two', 'Three']);
    expect(names()).toContain('Event0');
    expect(names()).not.toContain('Event1');
  });

  it('History_UndoADeleteBringsBackItsReferencesTextsAndPlace', () => {
    const qd = edit();
    const questPath = qd.quest.path;
    const history = new QuestEditorHistory();
    history.record('Delete');
    QuestEditorData.selectComponent('TokenLook');
    QuestEditorData.deleteCurrentComponent();
    expect(history.undo()).toBe(true);
    const restored = Game.get().currentQuest!.qd;
    expect(restored).toBe(qd);
    expect(names()).toEqual(['EventStart', 'EventA', 'TokenLook', 'TileHall']);
    expect((qd.components.get('EventStart') as QuestData.Event).addComponents).toEqual(['TileHall', 'TokenLook']);
    expect(texts('English').get('TokenLook.text')).toBe('Look');
    expect(texts('Spanish').get('EventStart.text')).toBe('Hola');
    // The selection when the step was kept, the quest's folder unchanged
    expect(Game.get().qed!.selection).toBe(QUEST_SELECTION);
    expect(qd.questPath).toBe(QUEST + '/quest.ini');
    expect(qd.quest.path).toBe(questPath);
    QuestEditor.save();
    expect(File.readAllText(QUEST + '/Localization.English.txt')).toBe(ENGLISH);
  });

  it('History_ANewChangeForgetsRedoAndOnlyTheLimitIsKept', () => {
    edit();
    const history = new QuestEditorHistory(2);
    for (const label of ['one', 'two', 'three']) {
      history.record(label);
      Game.get().qed!.newEvent();
    }
    expect(history.undo()).toBe(true);
    expect(history.undo()).toBe(true);
    expect(history.undo()).toBe(false);
    expect(names()).toEqual(['EventStart', 'EventA', 'TokenLook', 'Event0', 'TileHall']);
    history.record('four');
    expect(history.canRedo).toBe(false);
  });

  // Last: a test changes the loaded packs, as Valkyrie's does
  it('StartTest_PlaysTheSavedQuestWithRandomHeroes', () => {
    edit();
    const game = Game.get();
    expect(ToolsButton.test()).toBe(1);
    ToolsButton.startTest(3);
    expect(game.testMode).toBe(true);
    expect(game.editMode).toBe(false);
    const quest = game.currentQuest!;
    expect(quest.heroes.filter((h) => h.heroData !== null)).toHaveLength(3);
    expect(quest.vars.getValue('#heroes')).toBe(3);
    expect(quest.vars.getValue('$%morale')).toBe(3);
    expect(quest.heroesSelected).toBe(true);
    // MoM shows the starting items next
    expect(ui.lastInvestigatorItems).not.toBeNull();
    expect(game.config.data.get('Valkyrie')!.get('QuestEditorHeroCount')).toBe('3');
    expect(File.readAllText(QUEST + '/quest.ini')).toContain('format=21');
    expect(ToolsButton.test()).toBe(3);
    // In a test, the game's menu goes back to the editor (GameMenu.Editor), whose screen QuestEditor.Begin draws
    expect(ui.editorScreens).toBe(1);
    GameMenu.editor();
    expect(ui.editorScreens).toBe(2);
    expect(game.editMode).toBe(true);
    expect(game.testMode).toBe(false);
    expect(game.currentQuest!.originalPath).toBe(QUEST);
    expect(names()).toEqual(['EventStart', 'EventA', 'TokenLook', 'TileHall']);
  });

  it('StartTest_LoadsThePacksTheScenarioAsksFor', () => {
    // Not in Valkyrie, whose test loads only the packs the player chose: a tile of another one stopped it
    edit();
    const game = Game.get();
    EditorComponentQuest.selectQuestAddPack('PotS');
    game.config.data.remove('MoMPacks');
    ToolsButton.startTest(1);
    expect(game.cd.loadedPacks.has('PotS')).toBe(true);
    expect(game.cd.loadedPacks.has('SoT')).toBe(false);
    expect(Application.fatalErrors).toEqual([]);
  });
});
