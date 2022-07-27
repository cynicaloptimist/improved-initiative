import { CombatantState } from "../../common/CombatantState";
import { Action } from "./Actions";
import { CombatantAction } from "./CombatantActions";
import { CurrentSettings } from "../Settings/Settings";

export function CombatantsReducer(state: CombatantState[], action: Action) {
  const combatantAction = action as CombatantAction;
  if (!combatantAction.combatantId) {
    return state;
  }

  const combatant = state.find(c => c.Id === combatantAction.combatantId);
  if (action.type === "SetStatBlock") {
    combatant.StatBlock = action.newStatBlock;
  }

  if (action.type === "ApplyDamage") {
    combatant.TemporaryHP -= action.damageAmount;
    if (combatant.TemporaryHP < 0) {
      combatant.CurrentHP += combatant.TemporaryHP;
      combatant.TemporaryHP = 0;
    }

    const allowNegativeHP = CurrentSettings().Rules.AllowNegativeHP;
    if (combatant.CurrentHP <= 0 && !allowNegativeHP) {
      combatant.CurrentHP = 0;
    }
  }

  return state;
}
