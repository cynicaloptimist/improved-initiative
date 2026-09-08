import { StatBlock } from "../../common/StatBlock";
import { getExpressionMax, rollExpression } from "../Rules/DiceExpression";
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
  if (statBlock.Player === "player") {
    return statBlock.HP.Value;
  }

  if (variant === VariantMaximumHP.MINION) {
    return 1;
  }

  try {
    if (variant === VariantMaximumHP.BOSS) {
      return getExpressionMax(statBlock.HP.Notes);
    }

    if (CurrentSettings().Rules.RollMonsterHp) {
      return Math.max(rollExpression(statBlock.HP.Notes).Total, 1);
    }
  } catch (e) {
    console.error(e);
    return statBlock.HP.Value;
  }

  return statBlock.HP.Value;
}
