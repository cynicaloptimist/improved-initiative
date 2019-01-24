import * as _ from "lodash";

export interface IRules {
  GetModifierFromScore: (attribute: number) => number;
  AbilityCheck: (
    mod?: number,
    advantageType?: "advantage" | "disadvantage"
  ) => number;
  EnemyHPTransparency: string;
}

export class DefaultRules implements IRules {
  public GetModifierFromScore = (abilityScore: number) => {
    return Math.floor((abilityScore - 10) / 2);
  };
  public AbilityCheck = (
    mod = 0,
    advantageType?: "advantage" | "disadvantage"
  ) => {
    if (advantageType == "advantage") {
      return _.max([
        Math.ceil(Math.random() * 20) + mod,
        Math.ceil(Math.random() * 20) + mod
      ]);
    }
    if (advantageType == "disadvantage") {
      return _.min([
        Math.ceil(Math.random() * 20) + mod,
        Math.ceil(Math.random() * 20) + mod
      ]);
    }
    return Math.ceil(Math.random() * 20) + mod;
  };
  public EnemyHPTransparency = "whenBloodied";
}
