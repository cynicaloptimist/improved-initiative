import { CombatantState } from "../../common/CombatantState";
import { EncounterState } from "../../common/EncounterState";
import { probablyUniqueString } from "../../common/Toolbox";
import { AccountClient } from "../Account/AccountClient";

function updateLegacySavedCombatant(savedCombatant: any) {
  if (!savedCombatant.StatBlock) {
    savedCombatant.StatBlock = savedCombatant["Statblock"];
  }
  if (!savedCombatant.Id) {
    savedCombatant.Id = probablyUniqueString();
  }
  if (savedCombatant.MaxHP) {
    savedCombatant.StatBlock.HP.Value = savedCombatant.MaxHP;
  }
}

function getActiveCombatantId(savedEncounter: any): string {
  if (savedEncounter.ActiveCombatantId) {
    return savedEncounter.ActiveCombatantId;
  }

  const legacyCombatantIndex = savedEncounter.ActiveCreatureIndex;
  if (legacyCombatantIndex !== undefined && legacyCombatantIndex != -1) {
    return savedEncounter.Creatures[legacyCombatantIndex].Id;
  }

  return null;
}

export function UpdateLegacySavedEncounter(
  savedEncounter: any
): EncounterState<CombatantState> {
  const someName = probablyUniqueString();

  const updatedEncounter: EncounterState<CombatantState> = {
    Version: savedEncounter.Version || "legacy",
    Id:
      savedEncounter.Id ||
      AccountClient.MakeId(savedEncounter.Name || someName),
    Combatants: savedEncounter.Combatants || savedEncounter.Creatures || [],
    ActiveCombatantId: null,
    Name: savedEncounter.Name || someName,
    Path: savedEncounter.Path || "",
    RoundCounter: savedEncounter.RoundCounter
  };

  updatedEncounter.Combatants.forEach(updateLegacySavedCombatant);
  updatedEncounter.ActiveCombatantId = getActiveCombatantId(savedEncounter);

  return updatedEncounter;
}
