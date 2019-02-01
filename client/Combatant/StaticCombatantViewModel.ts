import { Tag } from "./Tag";

export interface StaticCombatantViewModel {
  Name: string;
  HPDisplay: string;
  HPColor: string;
  Initiative: number;
  Id: string;
  Tags: Tag[];
  IsPlayerCharacter: boolean;
  ImageURL: string;
}
