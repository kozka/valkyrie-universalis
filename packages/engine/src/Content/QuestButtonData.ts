// Ported from Valkyrie (Apache-2.0), modified: unity/Assets/Scripts/Content/QuestButtonData.cs
import { NewLine, enumToString, enumTryParse, isNullOrWhiteSpace, split } from '../platform/CSharp.ts';
import { VarOperation, VarTests } from '../Quest/VarTests.ts';
import type { ITestable } from './ITestable.ts';
import { StringKey } from './StringKey.ts';

// Valkyrie: QuestButtonData.cs QuestButtonAction
export const QuestButtonAction = {
  NONE: 0,
  DISABLE: 1,
  HIDE: 2,
} as const;
export type QuestButtonAction = number;

// Valkyrie: QuestButtonData.cs QuestButtonData
export class QuestButtonData implements ITestable {
  static readonly DEFAULT_COLOR = 'white';

  readonly eventNames: string[];

  condition: VarTests;

  label: StringKey;

  color: string = QuestButtonData.DEFAULT_COLOR;

  rawConditionFailedAction: QuestButtonAction | null;

  // ITestable implementation
  readonly operations: VarOperation[] = [];

  constructor(
    label: StringKey,
    eventNames: string[] | null = null,
    condition: VarTests | null = null,
    rawConditionFailedAction: QuestButtonAction | null = null,
  ) {
    this.label = label;
    this.eventNames = eventNames ?? [];
    this.rawConditionFailedAction = rawConditionFailedAction;
    this.condition = condition ?? new VarTests();
  }

  get conditionFailedAction(): QuestButtonAction {
    return this.rawConditionFailedAction ?? (this.hasCondition ? QuestButtonAction.DISABLE : QuestButtonAction.NONE);
  }

  get hasCondition(): boolean {
    return (this.condition?.varTestsComponents?.length ?? 0) > 0;
  }

  get tests(): VarTests {
    return this.condition;
  }

  toString(): string {
    return QuestButtonDataSerializer.toEventString(0, this);
  }
}

// Valkyrie: QuestButtonData.cs QuestButtonDataSerializer
export class QuestButtonDataSerializer {
  // Valkyrie: QuestButtonData.cs QuestButtonDataSerializer.FromData
  static fromData(data: Map<string, string>, position: number, sectionName: string): QuestButtonData {
    const buttonLabel = QuestButtonDataSerializer.readButtonLabel(data, position, sectionName);
    let questButtonData: QuestButtonData;
    const nextEventString = data.get('event' + position);
    if (nextEventString !== undefined) {
      questButtonData = QuestButtonDataSerializer.fromSingleString(buttonLabel, nextEventString);
    } else {
      questButtonData = new QuestButtonData(buttonLabel, []);
    }

    const conditionString = data.get(`event${position}Condition`);
    if (conditionString !== undefined && !isNullOrWhiteSpace(conditionString)) {
      const tests = new VarTests();
      for (const s of split(conditionString, [' '], undefined, true)) {
        tests.add(s);
      }

      questButtonData.condition = tests;

      const conditionActionString = data.get(`event${position}ConditionAction`);
      if (conditionActionString !== undefined && !isNullOrWhiteSpace(conditionActionString)) {
        const action = enumTryParse(QuestButtonAction, conditionActionString, true);
        if (action.ok) questButtonData.rawConditionFailedAction = action.value;
      }
    }

    if (data.has('buttoncolor' + position)) {
      questButtonData.color = data.get('buttoncolor' + position)!;
    }

    return questButtonData;
  }

  // Valkyrie: QuestButtonData.cs QuestButtonDataSerializer.FromSingleString
  static fromSingleString(labelKey: StringKey, eventDataString: string): QuestButtonData {
    if (isNullOrWhiteSpace(eventDataString)) {
      return new QuestButtonData(labelKey);
    }

    // Extract event names
    const strings = eventDataString.split(',');
    if (strings.length <= 0) {
      return new QuestButtonData(labelKey);
    }

    const questNames = split(strings[0]!, [' '], undefined, true);

    // Backward compatibility with unreleased 2.4.11a

    // Skip conditional event parameters if not all parameters are present
    if (strings.length < 4) {
      return new QuestButtonData(labelKey, questNames);
    }

    const conditionString = [strings[1], strings[2], strings[3]].join(',');
    const condition = new VarOperation(conditionString);
    const varTests = new VarTests();
    varTests.add(condition);

    // Optional ButtonAction parameter (defaults to DISABLE, but can be HIDE or NONE as well)
    if (strings.length > 4) {
      const action = enumTryParse(QuestButtonAction, strings[4], true);
      if (action.ok) return new QuestButtonData(labelKey, questNames, varTests, action.value);
    }

    return new QuestButtonData(labelKey, questNames, varTests);
  }

  // Valkyrie: QuestButtonData.cs QuestButtonDataSerializer.ReadButtonLabel
  private static readButtonLabel(data: Map<string, string>, buttonNum: number, sectionName: string): StringKey {
    const buttonDataValue = data.get('button' + buttonNum);
    if (buttonDataValue !== undefined) {
      return new StringKey(buttonDataValue);
    }

    return new StringKey('qst', `${sectionName}.button${buttonNum}`);
  }

  // Valkyrie: QuestButtonData.cs QuestButtonDataSerializer.ToEventString
  static toEventString(position: number, questButtonData: QuestButtonData): string {
    let sb = `event${position}=${QuestButtonDataSerializer.serializeEventNames(questButtonData.eventNames)}` + NewLine;
    if (questButtonData.hasCondition) {
      sb += `event${position}Condition=${questButtonData.condition.toString()}` + NewLine;
      if (questButtonData.rawConditionFailedAction !== null) {
        sb += `event${position}ConditionAction=${enumToString(QuestButtonAction, questButtonData.rawConditionFailedAction).toLowerCase()}` + NewLine;
      }
    }
    if (questButtonData.color !== QuestButtonData.DEFAULT_COLOR) {
      sb += `buttoncolor${position}="${questButtonData.color}"` + NewLine;
    }

    return sb;
  }

  // Valkyrie: QuestButtonData.cs QuestButtonDataSerializer.SerializeEventNames
  private static serializeEventNames(eventNames: string[] | null): string {
    if (eventNames === null) {
      return '';
    }

    return eventNames.join(' ');
  }
}
