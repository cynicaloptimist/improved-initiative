import { EncounterState } from "../../common/EncounterState";
import { CombatantState } from "../../common/CombatantState";
import { cloneDeep, remove } from "lodash";
import { Action } from "./EncounterActions";
import { InitializeCombatantFromStatBlock } from "./InitializeCombatantFromStatBlock";

export function EncounterReducer(
  state: EncounterState<CombatantState>,
  action: Action
) {
  const newState = cloneDeep(state);
  if (action.type === "AddCombatantFromState") {
    newState.Combatants.push(action.payload.combatantState);
  }
  if (action.type === "AddCombatantFromStatBlock") {
    const combatant = InitializeCombatantFromStatBlock(
      action.payload.statBlock,
      action.payload.combatantId,
      action.payload.rolledHP
    );
    newState.Combatants.push(combatant);
  }
  if (action.type === "RemoveCombatant") {
    newState.Combatants = remove(
      newState.Combatants,
      c => c.Id === action.payload.combatantId
    );
  }

  return newState;
}
