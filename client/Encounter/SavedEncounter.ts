module ImprovedInitiative {
    export interface SavedCombatant {
        Id: string;
        StatBlock: StatBlock;
        MaxHP: number;
        CurrentHP: number;
        TemporaryHP: number;
        Initiative: number;
        InitiativeGroup?: string;
        Alias: string;
        IndexLabel: number;
        Tags: string[] | SavedTag[];
        Hidden: boolean;
        InterfaceVersion: string;
    }
    export interface SavedTag {
        Text: string;
        DurationRemaining: number;
        DurationTiming: DurationTiming;
        DurationCombatantId: string;
    }

    export interface SavedEncounter<T> extends Listable {
        ActiveCombatantId: string;
        RoundCounter?: number;
        DisplayTurnTimer?: boolean;
        AllowPlayerSuggestions?: boolean;
        Combatants: T[];
    }

    function updateLegacySavedCreature(savedCreature: any) {
        if (!savedCreature.StatBlock) {
            savedCreature.StatBlock = savedCreature["Statblock"];
        }
        if (!savedCreature.Id) {
            savedCreature.Id = probablyUniqueString();
        }
    }

    export class SavedEncounter<T> {
        static UpdateLegacySavedEncounter(savedEncounter: any) {
            savedEncounter.Combatants = savedEncounter.Combatants || savedEncounter["Creatures"];
            savedEncounter.ActiveCombatantId = savedEncounter.ActiveCombatantId || savedEncounter["ActiveCreatureId"];

            savedEncounter.Combatants.forEach(updateLegacySavedCreature);

            let legacyCombatantIndex = savedEncounter["ActiveCreatureIndex"];
            if (legacyCombatantIndex !== undefined && legacyCombatantIndex != -1) {
                savedEncounter.ActiveCombatantId = savedEncounter.Combatants[legacyCombatantIndex].Id;
            }
            return savedEncounter;
        }

        static UpdateNameForId(name: string) {
            return name.replace(/ /g, "_").replace(/[^a-zA-Z0-9_]/g, '');
        }
    }
}