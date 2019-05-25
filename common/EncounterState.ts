import { CombatantState } from "./CombatantState";
import { Listable } from "./Listable";
import { probablyUniqueString } from "./Toolbox";

export interface EncounterState<T> {
  ActiveCombatantId: string | null;
  RoundCounter?: number;
  Combatants: T[];
}

export interface SavedEncounter extends Listable {
  Combatants: CombatantState[];
}

export namespace SavedEncounter {
  export function GetSearchHint(encounterState: SavedEncounter) {
    return encounterState.Combatants.map(c => c.Alias).join(" ");
  }

  export function Default(): SavedEncounter {
    return {
      Combatants: [],
      Id: probablyUniqueString(),
      Name: "",
      Path: "",
      Version: process.env.VERSION || "0.0.0"
    };
  }
}

export namespace EncounterState {
  export function Default<T>(): EncounterState<T> {
    return {
      ActiveCombatantId: null,
      RoundCounter: 0,
      Combatants: []
    };
  }
}
