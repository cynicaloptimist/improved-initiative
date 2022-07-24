import { EncounterState } from "../../common/EncounterState";
import { CombatantState } from "../../common/CombatantState";
import { cloneDeep, last, remove } from "lodash";
import { Action } from "./Actions";
import { InitializeCombatantFromStatBlock } from "./InitializeCombatantFromStatBlock";
import { GetCombatantsSorted } from "./GetCombatantsSorted";
import { StatBlock } from "../../common/StatBlock";

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
    if (newState.Combatants.length === 0) {
      return newState;
    }

    for (const combatantId in action.payload.initiativesByCombatantId) {
      const combatant = newState.Combatants.find(c => c.Id === combatantId);
      const rolledInitiative =
        action.payload.initiativesByCombatantId[combatantId];
      combatant.Initiative = rolledInitiative;
    }
    newState.Combatants = GetCombatantsSorted(newState);
    const firstCombatant = newState.Combatants[0];
    newState.ActiveCombatantId = firstCombatant.Id;
  }

  if (action.type === "EndEncounter") {
    newState.ActiveCombatantId = null;
  }

  if (action.type === "NextTurn") {
    if (newState.Combatants.length === 0) {
      return newState;
    }
    const currentCombatantIndex = newState.Combatants.findIndex(
      c => c.Id == newState.ActiveCombatantId
    );
    const noCombatantSelected = currentCombatantIndex == -1;
    const finalCombatantSelected =
      currentCombatantIndex + 1 == newState.Combatants.length;
    if (noCombatantSelected || finalCombatantSelected) {
      newState.ActiveCombatantId = newState.Combatants[0].Id;
    } else {
      newState.ActiveCombatantId =
        newState.Combatants[currentCombatantIndex + 1].Id;
    }
  }

  if (action.type === "PreviousTurn") {
    if (newState.Combatants.length === 0) {
      return newState;
    }
    const currentCombatantIndex = newState.Combatants.findIndex(
      c => c.Id == newState.ActiveCombatantId
    );
    const noCombatantSelected = currentCombatantIndex == -1;
    const firstCombatantSelected = currentCombatantIndex == 0;

    if (noCombatantSelected) {
      newState.ActiveCombatantId = newState.Combatants[0].Id;
    } else if (firstCombatantSelected) {
      newState.ActiveCombatantId = last(newState.Combatants).Id;
    } else {
      newState.ActiveCombatantId =
        newState.Combatants[currentCombatantIndex + 1].Id;
    }
  }

  if (action.type == "ClearEncounter") {
    newState.Combatants = [];
    newState.ActiveCombatantId = null;
  }

  if (action.type == "CleanEncounter") {
    newState.Combatants = newState.Combatants.filter(c =>
      StatBlock.IsPlayerCharacter(c.StatBlock)
    );
    newState.ActiveCombatantId = null;
  }

  if (action.type == "RestoreAllPlayerCharacterHP") {
    for (const combatant of newState.Combatants) {
      if (StatBlock.IsPlayerCharacter(combatant.StatBlock)) {
        combatant.CurrentHP = combatant.StatBlock.HP.Value;
      }
    }
  }

  return newState;
}
