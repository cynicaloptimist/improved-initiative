import { StatBlock } from "../../common/StatBlock";
import { Dice } from "../Rules/Dice";
import { CurrentSettings } from "../Settings/Settings";

export type VariantMaximumHP = "MINION" | "BOSS" | null;

export function GetOrRollMaximumHP(
  statBlock: StatBlock,
  variant: VariantMaximumHP
) {
  const rollMonsterHp = CurrentSettings().Rules.RollMonsterHp;
  if (statBlock.Player !== "player") {
    if (variant == "MINION") {
      return 1;
    } else if (variant == "BOSS" || rollMonsterHp) {
      try {
        const hpResult = Dice.RollDiceExpression(statBlock.HP.Notes);
        if (variant == "BOSS") {
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
