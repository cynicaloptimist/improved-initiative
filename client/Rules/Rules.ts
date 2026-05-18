import * as _ from "lodash";
import { InitiativeSpecialRoll } from "../../common/StatBlock";

export type AbilityCheckResult = {
  rolls: number[];
  finalValue: number;
};

export interface IRules {
  GetModifierFromScore: (attribute: number) => number;
  GetProficiencyBonus: (challenge: string) => number;
  AbilityCheck: (
    mod?: number,
    specialRoll?: InitiativeSpecialRoll
  ) => AbilityCheckResult;
  EnemyHPTransparency: string;
}

export class DefaultRules implements IRules {
  public GetModifierFromScore = (abilityScore: number) => {
    return Math.floor((abilityScore - 10) / 2);
  };

  public GetProficiencyBonus = (challengeString: string) => {
    const challenge = parseFloat(challengeString);
    if (challenge >= 29) return 9;
    if (challenge >= 25) return 8;
    if (challenge >= 21) return 7;
    if (challenge >= 17) return 6;
    if (challenge >= 13) return 5;
    if (challenge >= 9) return 4;
    if (challenge >= 5) return 3;
    return 2;
  };

  public AbilityCheck = (mod = 0, specialRoll?: InitiativeSpecialRoll) => {
    if (specialRoll == "advantage") {
      const rolls = [rollD20(), rollD20()];
      return {
        rolls,
        finalValue: _.max(rolls) + mod
      };
    }

    if (specialRoll == "disadvantage") {
      const rolls = [rollD20(), rollD20()];
      return {
        rolls,
        finalValue: _.min(rolls) + mod
      };
    }

    if (specialRoll == "take-ten") {
      return {
        rolls: [],
        finalValue: 10 + mod
      };
    }

    const roll = rollD20();
    return {
      rolls: [roll],
      finalValue: roll + mod
    };
  };

  public EnemyHPTransparency = "whenBloodied";
}

function rollD20(): number {
  return Math.ceil(Math.random() * 20);
}
