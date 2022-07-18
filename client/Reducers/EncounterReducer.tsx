import { EncounterState } from "../../common/EncounterState";
import { CombatantState } from "../../common/CombatantState";
import { cloneDeep, remove } from "lodash";
import { Action } from "./EncounterActions";
import { InitializeCombatantFromStatBlock } from "./InitializeCombatantFromStatBlock";
import { GetCombatantsSorted } from "./GetCombatantsSorted";

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

  if (action.type === "StartEncounter") {
    for (const combatantId in action.payload.initiativesByCombatantId) {
      const combatant = newState.Combatants.find(c => c.Id === combatantId);
      const rolledInitiative =
        action.payload.initiativesByCombatantId[combatantId];
      combatant.Initiative = rolledInitiative;
    }
    newState.Combatants = GetCombatantsSorted(newState);
    if (newState.Combatants[0]) {
      newState.ActiveCombatantId = newState.Combatants[0].Id;
    }
  }

  return newState;
}
