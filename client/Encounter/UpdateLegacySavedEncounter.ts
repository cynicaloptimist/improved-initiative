import { CombatantState } from "../../common/CombatantState";
import { EncounterState } from "../../common/EncounterState";
import { probablyUniqueString } from "../../common/Toolbox";
import { AccountClient } from "../Account/AccountClient";

function updateLegacySavedCreature(savedCreature: any) {
  if (!savedCreature.StatBlock) {
    savedCreature.StatBlock = savedCreature["Statblock"];
  }
  if (!savedCreature.Id) {
    savedCreature.Id = probablyUniqueString();
  }
  if (savedCreature.MaxHP) {
    savedCreature.StatBlock.HP.Value = savedCreature.MaxHP;
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

  updatedEncounter.Combatants.forEach(updateLegacySavedCreature);
  updatedEncounter.ActiveCombatantId = getActiveCombatantId(savedEncounter);

  return updatedEncounter;
}
