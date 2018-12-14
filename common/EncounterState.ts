import { CombatantState } from "./CombatantState";
import { Listable } from "./Listable";
import { probablyUniqueString } from "./Toolbox";

export interface EncounterState<T> extends Listable {
    ActiveCombatantId: string | null;
    RoundCounter?: number;
    Combatants: T[];
}

export function DefaultEncounterState(): EncounterState<CombatantState> {
    return {
        ActiveCombatantId: null,
        RoundCounter: 0,
        Combatants: [],
        Name: "DEFAULT_SAVED_ENCOUNTER",
        Id: probablyUniqueString(),
        Path: "",
        Version: process.env.VERSION || "0.0.0",
    };
}
