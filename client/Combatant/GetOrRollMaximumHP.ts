import { StatBlock } from "../../common/StatBlock";
import { Formula } from "../Rules/Formulas/Formula";
import { CurrentSettings } from "../Settings/Settings";

export function GetOrRollMaximumHP(statBlock: StatBlock) {
  const rollMonsterHp = CurrentSettings().Rules.RollMonsterHp;
  if (rollMonsterHp && statBlock.Player !== "player") {
    try {
      const HPformula = new Formula(statBlock.HP.Notes);
      const rolledHP = HPformula.Evaluate(statBlock).Total;
      if (rolledHP > 0) {
        return rolledHP;
      }
      return 1;
    } catch (e) {
      console.error(e);
      return statBlock.HP.Value;
    }
  }
  return statBlock.HP.Value;
}
