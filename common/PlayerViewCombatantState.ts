import { TagState } from "./CombatantState";

export interface PlayerViewCombatantState {
  Name: string;
  HPDisplay: string;
  HPColor: string;
  Initiative: number;
  Id: string;
  Tags: TagState[];
  IsPlayerCharacter: boolean;
  ImageURL: string;
  AC?: number;
}
