import { DurationTiming } from "./DurationTiming";
import { StatBlock } from "./StatBlock";

export interface TagState {
  Text: string;
  DurationRemaining: number;
  DurationTiming: DurationTiming;
  DurationCombatantId: string;
}

export interface CombatantState {
  Id: string;
  StatBlock: StatBlock;
  PersistentCharacterId?: string;
  CurrentHP: number;
  TemporaryHP: number;
  Initiative: number;
  InitiativeGroup?: string;
  Alias: string;
  IndexLabel: number;
  Tags: string[] | TagState[];
  Hidden: boolean;
  RevealedAC: boolean;
  InterfaceVersion: string;
}
