import { DurationTiming } from "./DurationTiming";
import { StatBlock } from "./StatBlock";

export interface TagState {
  Text: string;
  DurationRemaining: number;
  DurationTiming: DurationTiming;
  DurationCombatantId: string;
  Hidden?: boolean;
}

export interface CombatantState {
  Id: string;
  StatBlock: StatBlock;
  PersistentCharacterId?: string;
  CurrentHP: number;
  CurrentNotes?: string;
  TemporaryHP: number;
  Initiative: number;
  InitiativeGroup?: string;
  Alias: string;
  IndexLabel: number | null;
  Tags: TagState[];
  Hidden: boolean;
  RevealedAC: boolean;
  RoundCounter?: number;
  ElapsedSeconds?: number;
  InterfaceVersion: string;
}
