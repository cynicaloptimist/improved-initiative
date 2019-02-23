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

export function UpdateLegacySavedEncounter(
  savedEncounter: any
): EncounterState<CombatantState> {
  savedEncounter.Combatants =
    savedEncounter.Combatants || savedEncounter.Creatures;
  savedEncounter.ActiveCombatantId =
    savedEncounter.ActiveCombatantId || savedEncounter.ActiveCreatureId;
  savedEncounter.Path = savedEncounter.Path || "";
  savedEncounter.Id =
    savedEncounter.Id ||
    AccountClient.MakeId(savedEncounter.Name || probablyUniqueString());

  savedEncounter.Combatants.forEach(updateLegacySavedCreature);

  const legacyCombatantIndex = savedEncounter.ActiveCreatureIndex;
  if (legacyCombatantIndex !== undefined && legacyCombatantIndex != -1) {
    savedEncounter.ActiveCombatantId =
      savedEncounter.Combatants[legacyCombatantIndex].Id;
  }
  return savedEncounter;
}
