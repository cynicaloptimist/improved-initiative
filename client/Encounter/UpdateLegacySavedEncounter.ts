import { probablyUniqueString } from "../../common/Toolbox";
import { SavedCombatant, SavedEncounter } from "./SavedEncounter";

function updateLegacySavedCreature(savedCreature: any) {
    if (!savedCreature.StatBlock) {
        savedCreature.StatBlock = savedCreature["Statblock"];
    }
    if (!savedCreature.Id) {
        savedCreature.Id = probablyUniqueString();
    }
}

export function UpdateLegacySavedEncounter(savedEncounter: any): SavedEncounter<SavedCombatant> {
    savedEncounter.Combatants = savedEncounter.Combatants || savedEncounter["Creatures"];
    savedEncounter.ActiveCombatantId = savedEncounter.ActiveCombatantId || savedEncounter["ActiveCreatureId"];
    savedEncounter.Path = savedEncounter.Path || "";

    savedEncounter.Combatants.forEach(updateLegacySavedCreature);

    let legacyCombatantIndex = savedEncounter["ActiveCreatureIndex"];
    if (legacyCombatantIndex !== undefined && legacyCombatantIndex != -1) {
        savedEncounter.ActiveCombatantId = savedEncounter.Combatants[legacyCombatantIndex].Id;
    }
    return savedEncounter;
}