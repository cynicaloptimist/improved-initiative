import { TagState } from "./CombatantState";

export interface StaticCombatantViewModel {
  Name: string;
  HPDisplay: string;
  HPColor: string;
  Initiative: number;
  Id: string;
  Tags: TagState[];
  IsPlayerCharacter: boolean;
  ImageURL: string;
}
