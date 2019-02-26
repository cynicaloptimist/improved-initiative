import * as _ from "lodash";

export interface IRules {
  GetModifierFromScore: (attribute: number) => number;
  AbilityCheck: (
    mod?: number,
    specialRoll?: "advantage" | "disadvantage" | "take-ten"
  ) => number;
  EnemyHPTransparency: string;
}

export class DefaultRules implements IRules {
  public GetModifierFromScore = (abilityScore: number) => {
    return Math.floor((abilityScore - 10) / 2);
  };
  public AbilityCheck = (
    mod = 0,
    specialRoll?: "advantage" | "disadvantage" | "take-ten"
  ) => {
    if (specialRoll == "advantage") {
      return _.max([
        Math.ceil(Math.random() * 20) + mod,
        Math.ceil(Math.random() * 20) + mod
      ]);
    }

    if (specialRoll == "disadvantage") {
      return _.min([
        Math.ceil(Math.random() * 20) + mod,
        Math.ceil(Math.random() * 20) + mod
      ]);
    }

    if (specialRoll == "take-ten") {
      return 10 + mod;
    }

    return Math.ceil(Math.random() * 20) + mod;
  };
  public EnemyHPTransparency = "whenBloodied";
}
