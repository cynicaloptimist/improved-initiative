import { CombatantState } from "../../common/CombatantState";
import { EncounterState } from "../../common/EncounterState";
import { SavedEncounter } from "../../common/SavedEncounter";
import { probablyUniqueString } from "../../common/Toolbox";
import { AccountClient } from "../Account/AccountClient";

function updateLegacySavedCombatant(savedCombatant: any) {
  if (!savedCombatant.StatBlock) {
    savedCombatant.StatBlock = savedCombatant["Statblock"];
  }
  if (!savedCombatant.Id) {
    savedCombatant.Id = probablyUniqueString();
  }
  if (!savedCombatant.RevealedAC) {
    savedCombatant.RevealedAC = false;
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
): SavedEncounter {
  const someName = probablyUniqueString();

  const updatedEncounter: SavedEncounter = {
    Version: savedEncounter.Version || "legacy",
    Id:
      savedEncounter.Id ||
      AccountClient.MakeId(savedEncounter.Name || someName),
    Combatants: savedEncounter.Combatants || savedEncounter.Creatures || [],
    Name: savedEncounter.Name || someName,
    Path: savedEncounter.Path || "",
    BackgroundImageUrl: savedEncounter.BackgroundImageUrl || undefined
  };

  updatedEncounter.Combatants.forEach(updateLegacySavedCombatant);

  return updatedEncounter;
}

export function UpdateLegacyEncounterState(
  encounterState: any
): EncounterState<CombatantState> {
  const updatedEncounter: EncounterState<CombatantState> = {
    Combatants: encounterState.Combatants || encounterState.Creatures || [],
    RoundCounter: encounterState.RoundCounter || 0,
    ElapsedSeconds: encounterState.ElapsedSeconds || 0,
    ActiveCombatantId: null,
    BackgroundImageUrl: encounterState.BackgroundImageUrl
  };

  updatedEncounter.Combatants.forEach(updateLegacySavedCombatant);
  updatedEncounter.ActiveCombatantId = getActiveCombatantId(encounterState);

  return updatedEncounter;
}
