import { TagState } from "./CombatantState";

export type PlayerViewHealthState =
  | "healthy"
  | "hurt"
  | "bloodied"
  | "defeated";

export interface PlayerViewCombatantState {
  Name: string;
  HPDisplay: string;
  HPColor: string;
  HealthState?: PlayerViewHealthState;
  Initiative: number;
  Id: string;
  Tags: TagState[];
  IsPlayerCharacter: boolean;
  ImageURL: string;
  AC?: number;
  Color?: string;
  ReactionsSpent?: number;
}
