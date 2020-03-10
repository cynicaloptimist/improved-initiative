import * as _ from "lodash";
import { InitiativeSpecialRoll } from "../../common/StatBlock";

export interface IRules {
  GetModifierFromScore: (attribute: number) => number;
  AbilityCheck: (mod?: number, specialRoll?: InitiativeSpecialRoll) => number;
  EnemyHPTransparency: string;
}

export class DefaultRules implements IRules {
  public GetModifierFromScore = (abilityScore: number) => {
    return Math.floor((abilityScore - 10) / 2);
  };
  public AbilityCheck = (mod = 0, specialRoll?: InitiativeSpecialRoll) => {
    if (specialRoll == "advantage") {
      return _.max([
        Math.ceil(Math.random() * 20) + mod,
        Math.ceil(Math.random() * 20) + mod
      ]) as number;
    }

    if (specialRoll == "disadvantage") {
      return _.min([
        Math.ceil(Math.random() * 20) + mod,
        Math.ceil(Math.random() * 20) + mod
      ]) as number;
    }

    if (specialRoll == "take-ten") {
      return 10 + mod;
    }

    return Math.ceil(Math.random() * 20) + mod;
  };
  public EnemyHPTransparency = "whenBloodied";
}
