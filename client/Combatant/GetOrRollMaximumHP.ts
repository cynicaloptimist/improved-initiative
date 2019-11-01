import { StatBlock } from "../../common/StatBlock";
import { Dice } from "../Rules/Dice";
import { CurrentSettings } from "../Settings/Settings";

export enum VariantMaximumHP {
  DEFAULT,
  MINION,
  BOSS
}

export function GetOrRollMaximumHP(
  statBlock: StatBlock,
  variant: VariantMaximumHP
) {
  const rollMonsterHp = CurrentSettings().Rules.RollMonsterHp;
  if (statBlock.Player !== "player") {
    if (variant == VariantMaximumHP.MINION) {
      return 1;
    } else if (variant == VariantMaximumHP.BOSS || rollMonsterHp) {
      try {
        const hpResult = Dice.RollDiceExpression(statBlock.HP.Notes);
        if (variant == VariantMaximumHP.BOSS) {
          return hpResult.Maximum;
        }
        const rolledHP = hpResult.Total;
        if (rolledHP > 0) {
          return rolledHP;
        }
        return 1;
      } catch (e) {
        console.error(e);
        return statBlock.HP.Value;
      }
    }
  }
  return statBlock.HP.Value;
}
